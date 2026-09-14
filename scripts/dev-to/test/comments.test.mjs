import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { DEV_API_MEDIA_TYPE, findDevArticle, loadDevComments, sanitizeCommentBody } from '../../../assets/js/dev-to-comments.mjs';

const canonicalUrl = 'https://renanfranca.github.io/example.html';
const article = {
  canonical_url: canonicalUrl,
  comments_count: 2,
  id: 42,
  url: 'https://dev.to/renanfranca/example-1234',
};

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' }, status: 200, ...init });
}

function comment(overrides = {}) {
  return {
    body_html: '<p>Safe <strong>comment</strong></p>',
    children: [],
    created_at: '2026-09-13T20:30:00Z',
    id_code: 'abc1',
    user: {
      name: 'Renan Franca',
      profile_image_90: 'https://media2.dev.to/example.png',
      username: 'renanfranca',
    },
    ...overrides,
  };
}

function browserFixture() {
  const dom = new JSDOM(
    `<html lang="en"><body><section hidden data-dev-comments data-dev-to-canonical-url="${canonicalUrl}" data-dev-to-username="renanfranca"></section></body></html>`,
  );
  return {
    documentRef: dom.window.document,
    root: dom.window.document.querySelector('[data-dev-comments]'),
    sanitizer: createDOMPurify(dom.window),
  };
}

function queuedFetch(values, calls = []) {
  return async (url, init) => {
    calls.push({ init, url: String(url) });
    const value = values.shift();
    if (value instanceof Error) throw value;
    return value;
  };
}

test('keeps the locally served DOMPurify module synchronized with the installed package', async () => {
  const [installed, vendored] = await Promise.all([
    readFile('node_modules/dompurify/dist/purify.es.mjs'),
    readFile('assets/js/vendor/dompurify.es.mjs'),
  ]);
  assert.deepEqual(vendored, installed);
});

test('emits the DEV loader only inside the post opt-out guard and before blog comments', async () => {
  const [layout, devCommentsInclude, blogCommentsInclude] = await Promise.all([
    readFile('_layouts/post.html', 'utf8'),
    readFile('_includes/dev-to-comments.html', 'utf8'),
    readFile('_includes/comments.html', 'utf8'),
  ]);
  const guardStart = layout.indexOf('{% unless page.dev_to == false %}');
  const devInclude = layout.indexOf('{% include dev-to-comments.html %}');
  const guardEnd = layout.indexOf('{% endunless %}', guardStart);
  const blogInclude = layout.indexOf('{% include comments.html %}');

  assert.ok(guardStart >= 0 && guardStart < devInclude);
  assert.ok(devInclude < guardEnd && guardEnd < blogInclude);
  assert.match(devCommentsInclude, /data-dev-to-canonical-url="{{ page\.url \| absolute_url \| escape }}"/);
  assert.match(devCommentsInclude, /data-dev-to-username="{{ site\.dev_to_username \| escape }}"/);
  assert.match(devCommentsInclude, /type="module"/);
  assert.match(blogCommentsInclude, />Comments on this blog</);
});

test('paginates published articles and selects one exact canonical match with the v1 media type', async () => {
  const calls = [];
  const fetchImpl = queuedFetch(
    [
      jsonResponse([
        { canonical_url: 'https://example.com/elsewhere', comments_count: 0, id: 1, url: 'https://dev.to/example/elsewhere' },
        { ...article, canonical_url: `${canonicalUrl}/` },
      ]),
      jsonResponse([article]),
    ],
    calls,
  );

  assert.deepEqual(
    await findDevArticle({ baseUrl: 'https://dev.test/api', canonicalUrl, fetchImpl, pageSize: 2, username: 'renanfranca' }),
    article,
  );
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /username=renanfranca/);
  assert.match(calls[1].url, /page=2/);
  assert.deepEqual(calls[0].init.headers, { Accept: DEV_API_MEDIA_TYPE });
  assert.equal(calls[0].init.cache, 'no-cache');
  assert.equal(calls[0].init.credentials, 'omit');
  assert.equal('api-key' in calls[0].init.headers, false);
});

test('returns no match and rejects duplicate exact canonical matches', async () => {
  const noMatch = await findDevArticle({
    canonicalUrl,
    fetchImpl: queuedFetch([jsonResponse([{ ...article, canonical_url: `${canonicalUrl}/` }])]),
    username: 'renanfranca',
  });
  assert.equal(noMatch, undefined);

  await assert.rejects(
    () =>
      findDevArticle({
        canonicalUrl,
        fetchImpl: queuedFetch([jsonResponse([article, { ...article, id: 43 }])]),
        username: 'renanfranca',
      }),
    /multiple articles matched/,
  );
});

test('does not request comments or reveal the section when the matching article reports zero comments', async () => {
  const fixture = browserFixture();
  const calls = [];
  const result = await loadDevComments(fixture.root, {
    ...fixture,
    fetchImpl: queuedFetch([jsonResponse([{ ...article, comments_count: 0 }])], calls),
    logger: { warn: () => assert.fail('zero comments must not log a warning') },
  });

  assert.equal(result.status, 'no-comments');
  assert.equal(calls.length, 1);
  assert.equal(fixture.root.hidden, true);
  assert.equal(fixture.root.childElementCount, 0);
});

test('renders valid top-level comments and replies in API order with safe navigation and semantic dates', async () => {
  const fixture = browserFixture();
  const nested = comment({ id_code: 'reply1', user: { name: 'Reply Author', username: 'reply-author' } });
  const comments = [
    comment({ children: [nested], id_code: 'root1' }),
    comment({ id_code: 'root2', user: { name: 'Second Author', profile_image_90: 'http://example.com/unsafe.png', username: 'second' } }),
  ];
  const calls = [];
  const result = await loadDevComments(fixture.root, {
    ...fixture,
    fetchImpl: queuedFetch([jsonResponse([article]), jsonResponse(comments)], calls),
    logger: { warn: message => assert.fail(message) },
  });

  assert.deepEqual(result, { article, renderedCount: 2, status: 'rendered' });
  assert.equal(fixture.root.hidden, false);
  assert.equal(fixture.root.querySelector('h2').textContent, 'Discussion on DEV');
  assert.deepEqual(
    [...fixture.root.querySelectorAll('.dev-comment-author')].map(link => link.textContent),
    ['Renan Franca', 'Reply Author', 'Second Author'],
  );
  assert.equal(fixture.root.querySelectorAll(':scope > .dev-comment-list > .dev-comment').length, 2);
  assert.equal(fixture.root.querySelectorAll('.dev-comment-children').length, 1);
  assert.equal(fixture.root.querySelector('time').dateTime, '2026-09-13T20:30:00Z');
  assert.equal(fixture.root.querySelector('.dev-comment-time-link').href, `${article.url}#comment-root1`);
  assert.equal(fixture.root.querySelector('.dev-comments-action-link').href, article.url);
  assert.equal(fixture.root.querySelector('.dev-comments-action-link').rel, 'noopener noreferrer');
  assert.equal(fixture.root.querySelector('.dev-comment-avatar').loading, 'lazy');
  assert.match(fixture.root.querySelector('.dev-comment-avatar').alt, /Renan Franca/);
  assert.equal(fixture.root.querySelectorAll('.dev-comment-avatar').length, 1);
  fixture.root.querySelector('.dev-comment-avatar').dispatchEvent(new fixture.documentRef.defaultView.Event('error'));
  assert.equal(fixture.root.querySelectorAll('.dev-comment-avatar').length, 0);
  assert.equal(fixture.root.querySelectorAll('.dev-comment-avatar-link').length, 0);
  assert.equal(fixture.root.querySelectorAll('.dev-comment').length, 3);
  assert.match(calls[1].url, /\/comments\?a_id=42$/);
});

test('preserves deep semantic nesting while marking levels beyond the visual indentation cap', async () => {
  const fixture = browserFixture();
  const deepest = comment({ id_code: 'level4' });
  const level3 = comment({ children: [deepest], id_code: 'level3' });
  const level2 = comment({ children: [level3], id_code: 'level2' });
  const rootComment = comment({ children: [level2], id_code: 'level1' });
  const result = await loadDevComments(fixture.root, {
    ...fixture,
    fetchImpl: queuedFetch([jsonResponse([{ ...article, comments_count: 4 }]), jsonResponse([rootComment])]),
    logger: { warn: message => assert.fail(message) },
  });

  assert.equal(result.status, 'rendered');
  assert.equal(fixture.root.querySelectorAll('.dev-comment').length, 4);
  assert.equal(fixture.root.querySelectorAll('.dev-comment-children').length, 3);
  assert.equal(fixture.root.querySelectorAll('.dev-comment-children-deep').length, 1);
});

test('sanitizes executable markup and restricts comment links and images to HTTP URLs', () => {
  const fixture = browserFixture();
  const fragment = sanitizeCommentBody({
    baseUrl: article.url,
    documentRef: fixture.documentRef,
    html: `
      <p onclick="alert(1)" style="color:red">Keep <em>this</em></p>
      <script>window.pwned = true</script>
      <iframe src="https://example.com"></iframe>
      <svg><script>alert(2)</script></svg>
      <form><input autofocus></form>
      <a href="javascript:alert(3)" target="_blank">unsafe link</a>
      <a href="/safe">safe link</a>
      <img src="data:image/svg+xml,unsafe" onerror="alert(4)">
      <img src="https://images.example.com/safe.png">
    `,
    sanitizer: fixture.sanitizer,
  });
  const host = fixture.documentRef.createElement('div');
  host.append(fragment);

  assert.equal(host.querySelectorAll('script, iframe, svg, form, input, style').length, 0);
  assert.equal(host.querySelectorAll('[onclick], [onerror], [style], [target]').length, 0);
  assert.equal(host.querySelector('a').hasAttribute('href'), false);
  assert.equal(host.querySelectorAll('a')[1].href, 'https://dev.to/safe');
  assert.equal(host.querySelectorAll('img').length, 1);
  assert.equal(host.querySelector('img').src, 'https://images.example.com/safe.png');
  assert.equal(host.querySelector('img').getAttribute('loading'), 'lazy');
  assert.equal(host.querySelector('em').textContent, 'this');
});

test('omits a malformed comment and its descendants while preserving valid siblings without logging bodies', async () => {
  const fixture = browserFixture();
  const warnings = [];
  const result = await loadDevComments(fixture.root, {
    ...fixture,
    fetchImpl: queuedFetch([
      jsonResponse([article]),
      jsonResponse([
        comment({ body_html: '<p>secret malformed body</p>', id_code: undefined, children: [comment({ id_code: 'hidden-child' })] }),
        comment({ id_code: 'valid-sibling', user: { name: 'Valid Sibling', username: 'valid' } }),
      ]),
    ]),
    logger: { warn: message => warnings.push(message) },
  });

  assert.equal(result.status, 'rendered');
  assert.equal(fixture.root.querySelectorAll('.dev-comment').length, 1);
  assert.equal(fixture.root.querySelector('.dev-comment-author').textContent, 'Valid Sibling');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /comment at 1/);
  assert.doesNotMatch(warnings[0], /secret malformed body|hidden-child/);
});

test('isolates a sanitizer failure to its comment and descendants', async () => {
  const fixture = browserFixture();
  const warnings = [];
  const sanitizer = {
    sanitize: (html, options) => {
      if (html.includes('private marker')) throw new Error('private marker');
      return fixture.sanitizer.sanitize(html, options);
    },
  };
  const result = await loadDevComments(fixture.root, {
    ...fixture,
    fetchImpl: queuedFetch([
      jsonResponse([article]),
      jsonResponse([
        comment({ body_html: '<p>private marker</p>', children: [comment({ id_code: 'hidden-child' })] }),
        comment({ id_code: 'safe-sibling', user: { name: 'Safe Sibling', username: 'safe' } }),
      ]),
    ]),
    logger: { warn: message => warnings.push(message) },
    sanitizer,
  });

  assert.equal(result.status, 'rendered');
  assert.equal(fixture.root.querySelectorAll('.dev-comment').length, 1);
  assert.equal(fixture.root.querySelector('.dev-comment-author').textContent, 'Safe Sibling');
  assert.deepEqual(warnings, ['[DEV comments] Skipped malformed comment at 1: body could not be rendered safely']);
  assert.doesNotMatch(warnings[0], /private marker|hidden-child/);
});

test('keeps discovery failures hidden and emits a bounded diagnostic', async () => {
  const fixture = browserFixture();
  const warnings = [];
  const result = await loadDevComments(fixture.root, {
    ...fixture,
    fetchImpl: queuedFetch([jsonResponse([article, { ...article, id: 43 }])]),
    logger: { warn: message => warnings.push(message) },
  });

  assert.equal(result.status, 'discovery-error');
  assert.equal(fixture.root.hidden, true);
  assert.equal(fixture.root.childElementCount, 0);
  assert.deepEqual(warnings, ['[DEV comments] Article discovery failed: multiple articles matched the canonical URL']);
});

test('rejects a matching article URL outside DEV before requesting comments', async () => {
  const fixture = browserFixture();
  const warnings = [];
  const calls = [];
  const result = await loadDevComments(fixture.root, {
    ...fixture,
    fetchImpl: queuedFetch([jsonResponse([{ ...article, url: 'https://example.com/lookalike' }])], calls),
    logger: { warn: message => warnings.push(message) },
  });

  assert.equal(result.status, 'discovery-error');
  assert.equal(fixture.root.hidden, true);
  assert.equal(calls.length, 1);
  assert.deepEqual(warnings, ['[DEV comments] Article discovery failed: matched article had an unsafe DEV URL']);
});

test('shows a compact DEV article fallback only when comment retrieval fails after a match', async () => {
  const fixture = browserFixture();
  const warnings = [];
  const result = await loadDevComments(fixture.root, {
    ...fixture,
    fetchImpl: queuedFetch([jsonResponse([article]), new Error('network details must stay private')]),
    logger: { warn: message => warnings.push(message) },
  });

  assert.equal(result.status, 'comment-error');
  assert.equal(fixture.root.hidden, false);
  assert.equal(fixture.root.querySelector('h2').textContent, 'Discussion on DEV');
  assert.equal(fixture.root.querySelector('.dev-comments-fallback').textContent, 'The DEV discussion could not be loaded. View it on DEV.');
  assert.equal(fixture.root.querySelector('.dev-comments-fallback-link').href, article.url);
  assert.deepEqual(warnings, ['[DEV comments] Comment retrieval failed: comment retrieval request failed']);
});

test('keeps an empty comment response and an all-malformed response hidden', async () => {
  for (const comments of [[], [{ body_html: '<p>bad</p>', children: [] }]]) {
    const fixture = browserFixture();
    const result = await loadDevComments(fixture.root, {
      ...fixture,
      fetchImpl: queuedFetch([jsonResponse([article]), jsonResponse(comments)]),
      logger: { warn: () => {} },
    });

    assert.equal(result.status, comments.length ? 'no-valid-comments' : 'no-comments');
    assert.equal(fixture.root.hidden, true);
    assert.equal(fixture.root.childElementCount, 0);
  }
});
