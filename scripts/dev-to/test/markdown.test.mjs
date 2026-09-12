import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareDevMarkdown } from '../markdown.mjs';

const siteConfig = { url: 'https://renanfranca.github.io' };

test('removes a repeated cover and expands local image and link URLs', () => {
  const post = {
    data: { image: '/img/cover.png' },
    content:
      '\n![Cover](/img/cover.png)\n\n![Result](/img/result.png)\n[Archive](archive.html)\n[Reference]: docs/reference.html\n<img src="assets/example.png">\n',
  };
  assert.equal(
    prepareDevMarkdown(post, siteConfig),
    '![Result](https://renanfranca.github.io/img/result.png)\n[Archive](https://renanfranca.github.io/archive.html)\n[Reference]: https://renanfranca.github.io/docs/reference.html\n<img src="https://renanfranca.github.io/assets/example.png">',
  );
});

test('converts repository-specific YouTube, Gist, and Twitter embeds', () => {
  const post = {
    data: { image: '/img/cover.png', youtubeId: 'abc123' },
    content: [
      '{% include youtubePlayer.html id=page.youtubeId %}',
      '<script src="https://gist.github.com/renanfranca/123abc.js"></script>',
      '<blockquote class="twitter-tweet"><a href="https://twitter.com/renanfranca/status/123?ref=x">Tweet</a></blockquote>',
      '<script async src="https://platform.twitter.com/widgets.js"></script>',
    ].join('\n'),
  };
  assert.equal(
    prepareDevMarkdown(post, siteConfig),
    [
      '{% embed https://www.youtube.com/watch?v=abc123 %}',
      '{% embed https://gist.github.com/renanfranca/123abc %}',
      '{% embed https://twitter.com/renanfranca/status/123 %}',
    ].join('\n'),
  );
});

test('does not transform or reject examples inside fenced code', () => {
  const post = {
    data: { image: '/img/cover.png' },
    content: '```html\n<script src="/example.js"></script>\n{% include unknown.html %}\n```\n',
  };
  assert.equal(prepareDevMarkdown(post, siteConfig), post.content.trim());
});

test('does not transform or reject examples inside inline code', () => {
  const post = {
    data: { image: '/img/cover.png' },
    content: 'The `<script src="/example.js"></script>` element and `{% include unknown.html %}` syntax are examples.\n',
  };
  assert.equal(prepareDevMarkdown(post, siteConfig), post.content.trim());
});

test('rejects unsupported Liquid and scripts outside fenced code', () => {
  assert.throws(
    () => prepareDevMarkdown({ data: { image: '/img/cover.png' }, content: '{% include unknown.html %}' }, siteConfig),
    /unsupported Liquid/,
  );
  assert.throws(
    () =>
      prepareDevMarkdown({ data: { image: '/img/cover.png' }, content: '<script src="https://example.com/a.js"></script>' }, siteConfig),
    /unsupported script/,
  );
});
