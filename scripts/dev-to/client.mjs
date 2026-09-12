const DEFAULT_API_URL = 'https://dev.to/api';

export class DevToApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'DevToApiError';
    this.status = status;
    this.body = body;
  }
}

const defaultSleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function retryDelay(response, attempt) {
  const retryAfter = Number(response.headers.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter >= 0) return retryAfter * 1000;
  return Math.min(1000 * 2 ** attempt, 30_000);
}

export class DevToClient {
  constructor({ apiKey, baseUrl = DEFAULT_API_URL, fetchImpl = fetch, pageSize = 1000, sleep = defaultSleep } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
    this.pageSize = pageSize;
    this.sleep = sleep;
  }

  async request(pathname, { authenticated = true, body, method = 'GET', maxAttempts = 5 } = {}) {
    if (authenticated && !this.apiKey) throw new Error('DEV_TO_API_KEY is required for this operation');

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      let response;
      try {
        response = await this.fetchImpl(`${this.baseUrl}${pathname}`, {
          method,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'renanfranca-blog-dev-to-sync/1.0',
            ...(authenticated ? { 'api-key': this.apiKey } : {}),
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
      } catch (error) {
        if (method === 'POST' || attempt === maxAttempts - 1) throw error;
        await this.sleep(Math.min(1000 * 2 ** attempt, 30_000));
        continue;
      }

      const retryableStatus = response.status === 429 || (method !== 'POST' && response.status >= 500);
      if (retryableStatus && attempt < maxAttempts - 1) {
        await this.sleep(retryDelay(response, attempt));
        continue;
      }

      const text = await response.text();
      if (!response.ok) {
        throw new DevToApiError(`DEV API ${method} ${pathname} returned ${response.status}`, {
          status: response.status,
          body: text.slice(0, 1000),
        });
      }
      return text ? JSON.parse(text) : undefined;
    }

    throw new Error(`DEV API ${method} ${pathname} exhausted its retries`);
  }

  async listPaginated(pathname, { authenticated }) {
    const values = [];
    for (let page = 1; ; page += 1) {
      const separator = pathname.includes('?') ? '&' : '?';
      const batch = await this.request(`${pathname}${separator}per_page=${this.pageSize}&page=${page}`, { authenticated });
      if (!Array.isArray(batch)) throw new Error(`DEV API returned a non-array response for ${pathname}`);
      values.push(...batch);
      if (batch.length < this.pageSize) return values;
    }
  }

  listAllMyArticles() {
    return this.listPaginated('/articles/me/all', { authenticated: true });
  }

  listPublicUserArticles(username) {
    return this.listPaginated(`/articles?username=${encodeURIComponent(username)}&state=all`, { authenticated: false });
  }

  authenticatedUser() {
    return this.request('/users/me');
  }

  createArticle(article) {
    return this.request('/articles', { method: 'POST', body: { article } });
  }

  updateArticle(id, article) {
    return this.request(`/articles/${id}`, { method: 'PUT', body: { article } });
  }
}
