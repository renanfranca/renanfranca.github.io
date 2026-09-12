import { prepareDevMarkdown } from './markdown.mjs';
import { absoluteSiteUrl, canonicalUrlForPost, postEligibility } from './posts.mjs';

export async function verifyDevAccount(client, expectedUsername) {
  const user = await client.authenticatedUser();
  if (user.username !== expectedUsername) {
    throw new Error(`DEV_TO_API_KEY belongs to @${user.username}, expected @${expectedUsername}`);
  }
  return user;
}

export function articlePayload(post, siteConfig) {
  return {
    title: post.data.title,
    body_markdown: prepareDevMarkdown(post, siteConfig),
    published: true,
    tags: post.data.dev_to_tags,
    main_image: absoluteSiteUrl(post.data.image, siteConfig),
    canonical_url: canonicalUrlForPost(post, siteConfig),
    description: post.data.description,
  };
}

export function buildOperations(posts, articles, siteConfig, { mode = 'all', now = new Date() } = {}) {
  const articlesByCanonicalUrl = new Map();
  for (const article of articles) {
    if (!article.canonical_url) continue;
    const matches = articlesByCanonicalUrl.get(article.canonical_url) ?? [];
    matches.push(article);
    articlesByCanonicalUrl.set(article.canonical_url, matches);
  }

  return posts.map(post => {
    const canonicalUrl = canonicalUrlForPost(post, siteConfig);
    const eligibility = postEligibility(post, now);
    if (!eligibility.eligible) return { action: 'skip', canonicalUrl, post, reason: eligibility.reason };

    const matches = articlesByCanonicalUrl.get(canonicalUrl) ?? [];
    if (matches.length > 1) {
      throw new Error(`${post.filePath}: multiple DEV articles use canonical URL ${canonicalUrl}`);
    }
    if (matches.length === 0) return { action: 'create', canonicalUrl, post, payload: articlePayload(post, siteConfig) };
    if (mode === 'missing-only') return { action: 'skip', article: matches[0], canonicalUrl, post, reason: 'already-exists' };
    return { action: 'update', article: matches[0], canonicalUrl, post, payload: articlePayload(post, siteConfig) };
  });
}

export async function executeOperations(operations, client, { dryRun = false, ensureCanonical = async () => {}, logger = console } = {}) {
  const summary = { create: 0, update: 0, skip: 0, errors: [] };

  for (const operation of operations) {
    const tags = Array.isArray(operation.post.data.dev_to_tags) ? operation.post.data.dev_to_tags.join(',') : '-';
    if (operation.action === 'skip') {
      summary.skip += 1;
      logger.log(`skip\t${operation.reason}\t${operation.post.filePath}\t${tags}\t${operation.canonicalUrl}`);
      continue;
    }

    if (dryRun) {
      summary[operation.action] += 1;
      logger.log(`${operation.action}\tdry-run\t${operation.post.filePath}\t${tags}\t${operation.canonicalUrl}`);
      continue;
    }

    try {
      await ensureCanonical(operation.canonicalUrl);
      if (operation.action === 'create') {
        await client.createArticle(operation.payload);
      } else {
        await client.updateArticle(operation.article.id, operation.payload);
      }
      summary[operation.action] += 1;
      logger.log(`${operation.action}\tok\t${operation.post.filePath}\t${tags}\t${operation.canonicalUrl}`);
    } catch (error) {
      summary.errors.push({ filePath: operation.post.filePath, message: error.message });
      logger.error(`${operation.action}\terror\t${operation.post.filePath}\t${error.message}`);
    }
  }

  if (summary.errors.length) {
    throw new AggregateError(
      summary.errors.map(error => new Error(`${error.filePath}: ${error.message}`)),
      `${summary.errors.length} DEV synchronization operation(s) failed`,
    );
  }
  return summary;
}
