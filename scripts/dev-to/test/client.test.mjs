import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DevToApiError, DevToClient } from '../client.mjs';

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' }, ...init });
}

test('paginates authenticated article listings and sends the API key', async () => {
  const calls = [];
  const batches = [[{ id: 1 }, { id: 2 }], [{ id: 3 }]];
  const client = new DevToClient({
    apiKey: 'secret',
    pageSize: 2,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return jsonResponse(batches.shift());
    },
  });

  assert.deepEqual(await client.listAllMyArticles(), [{ id: 1 }, { id: 2 }, { id: 3 }]);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].init.headers['api-key'], 'secret');
  assert.match(calls[1].url, /page=2/);
});

test('retries rate-limited requests using Retry-After', async () => {
  const delays = [];
  let attempts = 0;
  const client = new DevToClient({
    apiKey: 'secret',
    sleep: async milliseconds => delays.push(milliseconds),
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) return new Response('slow down', { status: 429, headers: { 'Retry-After': '3' } });
      return jsonResponse({ id: 42 }, { status: 201 });
    },
  });

  assert.deepEqual(await client.createArticle({ title: 'Example' }), { id: 42 });
  assert.deepEqual(delays, [3000]);
});

test('does not retry an ambiguous server failure while creating an article', async () => {
  let attempts = 0;
  const client = new DevToClient({
    apiKey: 'secret',
    fetchImpl: async () => {
      attempts += 1;
      return new Response('unknown create outcome', { status: 500 });
    },
  });

  await assert.rejects(() => client.createArticle({ title: 'Example' }), /returned 500/);
  assert.equal(attempts, 1);
});

test('reports a bounded API error after a non-retryable response', async () => {
  const client = new DevToClient({ apiKey: 'secret', fetchImpl: async () => new Response('invalid', { status: 422 }) });
  await assert.rejects(
    () => client.createArticle({}),
    error => error instanceof DevToApiError && error.status === 422 && error.body === 'invalid',
  );
});

test('creates and updates articles with the documented request envelopes', async () => {
  const calls = [];
  const client = new DevToClient({
    apiKey: 'secret',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return jsonResponse({ ok: true }, { status: init.method === 'POST' ? 201 : 200 });
    },
  });
  await client.createArticle({ title: 'New' });
  await client.updateArticle(123, { title: 'Updated' });

  assert.equal(calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].init.body), { article: { title: 'New' } });
  assert.match(calls[1].url, /\/articles\/123$/);
  assert.equal(calls[1].init.method, 'PUT');
});
