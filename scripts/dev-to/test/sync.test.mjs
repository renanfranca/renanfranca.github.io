import assert from 'node:assert/strict';
import { test } from 'node:test';
import { articlePayload, buildOperations, executeOperations, verifyDevAccount } from '../sync.mjs';

const siteConfig = { url: 'https://renanfranca.github.io' };

function post(name, overrides = {}) {
  return {
    filePath: `_posts/2026-01-01-${name}.md`,
    content: 'Body',
    data: {
      title: name,
      description: `${name} description`,
      date: '2026-01-01 10:00:00 -0300',
      image: `/img/${name}.png`,
      permalink: '/:categories/:title:output_ext',
      dev_to_tags: ['ai', 'agents', 'testing', 'tdd'],
      ...overrides,
    },
  };
}

test('plans create, update, and opt-out operations without touching DEV-only articles', () => {
  const posts = [post('new'), post('existing'), post('local-only', { dev_to: false })];
  const articles = [
    { id: 1, canonical_url: 'https://renanfranca.github.io/existing.html' },
    { id: 2, canonical_url: 'https://dev.to/renanfranca/dev-only' },
  ];
  assert.deepEqual(
    buildOperations(posts, articles, siteConfig).map(operation => [operation.action, operation.reason]),
    [
      ['create', undefined],
      ['update', undefined],
      ['skip', 'opt-out'],
    ],
  );
});

test('builds only repository-owned DEV fields and leaves series untouched', () => {
  const payload = articlePayload(post('example'), siteConfig);
  assert.deepEqual(payload.tags, ['ai', 'agents', 'testing', 'tdd']);
  assert.equal(payload.canonical_url, 'https://renanfranca.github.io/example.html');
  assert.equal(payload.main_image, 'https://renanfranca.github.io/img/example.png');
  assert.equal(payload.published, true);
  assert.equal('series' in payload, false);
});

test('refuses to write through a key belonging to another DEV account', async () => {
  await assert.rejects(
    () => verifyDevAccount({ authenticatedUser: async () => ({ username: 'someone-else' }) }, 'renanfranca'),
    /belongs to @someone-else, expected @renanfranca/,
  );
});

test('missing-only mode skips an existing canonical and future posts', () => {
  const posts = [post('existing'), post('future', { date: '2030-01-01 10:00:00 -0300' })];
  const articles = [{ id: 1, canonical_url: 'https://renanfranca.github.io/existing.html' }];
  assert.deepEqual(
    buildOperations(posts, articles, siteConfig, { mode: 'missing-only', now: new Date('2026-09-12T12:00:00Z') }).map(operation => [
      operation.action,
      operation.reason,
    ]),
    [
      ['skip', 'already-exists'],
      ['skip', 'future'],
    ],
  );
});

test('rejects duplicate DEV canonical URLs before any write', () => {
  assert.throws(
    () =>
      buildOperations(
        [post('duplicate')],
        [
          { id: 1, canonical_url: 'https://renanfranca.github.io/duplicate.html' },
          { id: 2, canonical_url: 'https://renanfranca.github.io/duplicate.html' },
        ],
        siteConfig,
      ),
    /multiple DEV articles/,
  );
});

test('dry run reports decisions without calling the client or checking canonical URLs', async () => {
  const operations = buildOperations([post('new'), post('local-only', { dev_to: false, dev_to_tags: undefined })], [], siteConfig);
  let called = false;
  const lines = [];
  const logger = { log: line => lines.push(line), error() {} };
  const summary = await executeOperations(operations, {}, { dryRun: true, ensureCanonical: async () => (called = true), logger });
  assert.deepEqual(summary, { create: 1, update: 0, skip: 1, errors: [] });
  assert.equal(called, false);
  assert.match(lines[0], /ai,agents,testing,tdd/);
  assert.match(lines[1], /\t-\thttps:\/\//);
});

test('continues after a partial API error and then fails the run', async () => {
  const operations = buildOperations([post('first'), post('second')], [], siteConfig);
  const created = [];
  const client = {
    async createArticle(payload) {
      created.push(payload.title);
      if (payload.title === 'first') throw new Error('temporary failure');
    },
  };
  const logger = { log() {}, error() {} };
  await assert.rejects(() => executeOperations(operations, client, { logger }), /1 DEV synchronization operation/);
  assert.deepEqual(created, ['first', 'second']);
});
