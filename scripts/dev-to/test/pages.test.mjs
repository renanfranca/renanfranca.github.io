import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GitHubPagesClient, waitForCanonicalUrl } from '../pages.mjs';

test('waits until the expected Pages commit is built', async () => {
  const builds = [
    { commit: 'old', status: 'built', created_at: '2026-01-01T00:00:00Z' },
    { commit: 'new', status: 'building', created_at: '2026-01-02T00:00:00Z' },
    { commit: 'new', status: 'built', created_at: '2026-01-02T00:00:00Z' },
  ];
  const client = new GitHubPagesClient({ repository: 'owner/repo', token: 'token', sleep: async () => {} });
  client.latestBuild = async () => builds.shift();
  const result = await client.waitForBuild({ commit: 'new', pollMilliseconds: 0, timeoutMilliseconds: 1000 });
  assert.equal(result.status, 'built');
});

test('retries a canonical URL until it is reachable', async () => {
  const statuses = [404, 200];
  const delays = [];
  await waitForCanonicalUrl('https://example.com/post', {
    attempts: 2,
    delayMilliseconds: 10,
    sleep: async value => delays.push(value),
    fetchImpl: async () => new Response('', { status: statuses.shift() }),
  });
  assert.deepEqual(delays, [10]);
});
