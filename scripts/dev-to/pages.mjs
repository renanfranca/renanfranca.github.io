const defaultSleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export class GitHubPagesClient {
  constructor({ repository, token, fetchImpl = fetch, sleep = defaultSleep } = {}) {
    if (!repository) throw new Error('GITHUB_REPOSITORY is required');
    if (!token) throw new Error('GITHUB_TOKEN is required');
    this.repository = repository;
    this.token = token;
    this.fetchImpl = fetchImpl;
    this.sleep = sleep;
  }

  async request(pathname, { method = 'GET' } = {}) {
    const response = await this.fetchImpl(`https://api.github.com/repos/${this.repository}${pathname}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'User-Agent': 'renanfranca-blog-dev-to-sync/1.0',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`GitHub Pages API ${method} ${pathname} returned ${response.status}: ${text.slice(0, 500)}`);
    return text ? JSON.parse(text) : undefined;
  }

  requestBuild() {
    return this.request('/pages/builds', { method: 'POST' });
  }

  latestBuild() {
    return this.request('/pages/builds/latest');
  }

  async waitForBuild({ commit, createdAfter = 0, pollMilliseconds = 10_000, timeoutMilliseconds = 10 * 60_000 }) {
    const deadline = Date.now() + timeoutMilliseconds;
    while (Date.now() < deadline) {
      const build = await this.latestBuild();
      const createdAt = Date.parse(build.created_at);
      if (build.commit === commit && createdAt >= createdAfter) {
        if (build.status === 'built') return build;
        if (build.status === 'errored') throw new Error(`GitHub Pages build failed: ${build.error?.message ?? 'unknown error'}`);
      }
      await this.sleep(pollMilliseconds);
    }
    throw new Error(`Timed out waiting for GitHub Pages to build commit ${commit}`);
  }
}

export async function waitForCanonicalUrl(url, { fetchImpl = fetch, sleep = defaultSleep, attempts = 12, delayMilliseconds = 5000 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, { headers: { 'User-Agent': 'renanfranca-blog-dev-to-sync/1.0' }, redirect: 'follow' });
      if (response.ok) return;
    } catch (error) {
      if (attempt === attempts - 1) throw error;
    }
    if (attempt < attempts - 1) await sleep(delayMilliseconds);
  }
  throw new Error(`Canonical URL did not become reachable: ${url}`);
}
