import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalUrlForPost, devToUsername, parseDocument, postEligibility, validatePost } from '../posts.mjs';

const siteConfig = { url: 'https://renanfranca.github.io' };

test('parses YAML front matter and leaves the Markdown body intact', () => {
  const parsed = parseDocument('---\r\ntitle: Example\r\ntags: demo\r\n---\r\nBody\r\n', '_posts/example.md');
  assert.equal(parsed.data.title, 'Example');
  assert.equal(parsed.content, 'Body\r\n');
});

test('uses the UTC-normalized Jekyll date for legacy permalink URLs', () => {
  const post = {
    filePath: '_posts/2022-03-24-why-do-i-need-to-create-a-blog-posts-buffer.md',
    data: { date: '2022-03-24 23:20:00 -0300' },
  };
  assert.equal(
    canonicalUrlForPost(post, siteConfig),
    'https://renanfranca.github.io/2022/03/25/why-do-i-need-to-create-a-blog-posts-buffer.html',
  );
});

test('resolves the explicit permalink used by current posts', () => {
  const post = {
    filePath: '_posts/2026-09-09-what-changed-when-the-same-kata-needed-a-ui.md',
    data: { date: '2026-09-09 15:08:00 -0300', permalink: '/:categories/:title:output_ext' },
  };
  assert.equal(canonicalUrlForPost(post, siteConfig), 'https://renanfranca.github.io/what-changed-when-the-same-kata-needed-a-ui.html');
});

test('requires four unique catalog tags on an eligible post', () => {
  const catalog = new Set(['ai', 'agents', 'testing', 'tdd']);
  const post = {
    filePath: '_posts/2026-01-01-example.md',
    data: {
      title: 'Example',
      description: 'Example post',
      date: '2026-01-01 10:00:00 -0300',
      image: '/img/example.png',
      dev_to_tags: ['ai', 'agents', 'testing', 'unknown'],
    },
  };
  assert.deepEqual(validatePost(post, catalog), [
    '_posts/2026-01-01-example.md: DEV tag "unknown" is not present in _data/dev_to_tags.json',
  ]);

  post.data.dev_to_tags = ['ai', 'agents', 'testing', 'tdd'];
  assert.deepEqual(validatePost(post, catalog), []);
});

const eligibilityDate = new Date('2026-01-01T00:00:00Z');

function eligibilityPost(overrides = {}) {
  return {
    filePath: '_posts/2025-01-01-example.md',
    data: { date: '2025-01-01 10:00:00 -0300', ...overrides },
  };
}

test('opts out a post when DEV syndication is disabled', () => {
  assert.deepEqual(postEligibility(eligibilityPost({ dev_to: false }), eligibilityDate), { eligible: false, reason: 'opt-out' });
});

test('defers a post marked as a draft', () => {
  assert.deepEqual(postEligibility(eligibilityPost({ draft: true }), eligibilityDate), { eligible: false, reason: 'draft' });
});

test('defers a post marked as unpublished', () => {
  assert.deepEqual(postEligibility(eligibilityPost({ published: false }), eligibilityDate), { eligible: false, reason: 'draft' });
});

test('defers a future post', () => {
  assert.deepEqual(postEligibility(eligibilityPost({ date: '2030-01-01 10:00:00 -0300' }), eligibilityDate), {
    eligible: false,
    reason: 'future',
  });
});

test('requires a non-empty DEV username in site configuration', () => {
  assert.equal(devToUsername({ dev_to_username: ' renanfranca ' }), 'renanfranca');
  assert.throws(() => devToUsername({}), /dev_to_username is required/);
  assert.throws(() => devToUsername({ dev_to_username: 42 }), /dev_to_username must be a string/);
  assert.throws(() => devToUsername({ dev_to_username: '   ' }), /dev_to_username must not be blank/);
});
