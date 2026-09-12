#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { DevToClient } from './client.mjs';
import { prepareDevMarkdown } from './markdown.mjs';
import { GitHubPagesClient, waitForCanonicalUrl } from './pages.mjs';
import { canonicalUrlForPost, loadSiteConfig, loadTagCatalog, readAllPosts, validatePost } from './posts.mjs';
import { buildOperations, executeOperations, verifyDevAccount } from './sync.mjs';

const EXPECTED_USERNAME = 'renanfranca';

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function changedPostPaths(rootDirectory, from, to) {
  if (!from || !to) throw new Error('--from and --to are required in changed mode');
  const output = execFileSync('git', ['diff', '--name-only', '--diff-filter=AM', from, to, '--', '_posts'], {
    cwd: rootDirectory,
    encoding: 'utf8',
  });
  return new Set(output.split(/\r?\n/).filter(filePath => /^_posts\/.*\.md$/.test(filePath)));
}

async function loadValidatedContext(rootDirectory) {
  const [posts, catalog, siteConfig] = await Promise.all([
    readAllPosts(rootDirectory),
    loadTagCatalog(rootDirectory),
    loadSiteConfig(rootDirectory),
  ]);
  const errors = posts.flatMap(post => validatePost(post, catalog));
  const canonicals = new Map();
  for (const post of posts) {
    if (post.data.dev_to === false) continue;
    try {
      prepareDevMarkdown(post, siteConfig);
      const canonical = canonicalUrlForPost(post, siteConfig);
      if (canonicals.has(canonical)) errors.push(`${post.filePath}: canonical URL is also used by ${canonicals.get(canonical)}`);
      else canonicals.set(canonical, post.filePath);
    } catch (error) {
      errors.push(`${post.filePath}: ${error.message}`);
    }
  }
  if (errors.length)
    throw new AggregateError(
      errors.map(message => new Error(message)),
      `Validation failed with ${errors.length} error(s)`,
    );
  return { posts, catalog, siteConfig };
}

async function validate(rootDirectory) {
  const { posts, catalog } = await loadValidatedContext(rootDirectory);
  const eligible = posts.filter(post => post.data.dev_to !== false).length;
  console.log(`Validated ${eligible} DEV-enabled posts, ${posts.length - eligible} opt-out, and ${catalog.size} catalog tags.`);
}

async function sync(rootDirectory) {
  const { posts, siteConfig } = await loadValidatedContext(rootDirectory);
  const mode = option('mode', process.env.DEV_TO_MODE ?? 'changed');
  const dryRun = hasFlag('dry-run') || process.env.DEV_TO_DRY_RUN === 'true';
  if (!['all', 'changed', 'missing-only'].includes(mode)) throw new Error(`Unsupported sync mode: ${mode}`);

  let selectedPosts = posts;
  if (mode === 'changed') {
    const changed = changedPostPaths(rootDirectory, option('from', process.env.DEV_TO_FROM), option('to', process.env.DEV_TO_TO));
    selectedPosts = posts.filter(post => changed.has(post.filePath));
  }

  const client = new DevToClient({ apiKey: process.env.DEV_TO_API_KEY });
  let articles;
  if (process.env.DEV_TO_API_KEY) {
    await verifyDevAccount(client, EXPECTED_USERNAME);
    articles = await client.listAllMyArticles();
  } else {
    if (!dryRun) throw new Error('DEV_TO_API_KEY is required unless --dry-run is used');
    articles = await client.listPublicUserArticles(EXPECTED_USERNAME);
  }

  const operations = buildOperations(selectedPosts, articles, siteConfig, { mode });
  const summary = await executeOperations(operations, client, {
    dryRun,
    ensureCanonical: url => waitForCanonicalUrl(url),
  });
  console.log(`Summary: create=${summary.create} update=${summary.update} skip=${summary.skip}`);
}

async function pages() {
  const operation = process.argv[3];
  const commit = option('commit', process.env.GITHUB_SHA);
  const client = new GitHubPagesClient({ repository: process.env.GITHUB_REPOSITORY, token: process.env.GITHUB_TOKEN });
  let createdAfter = 0;
  if (operation === 'rebuild-and-wait') {
    createdAfter = Date.now() - 1000;
    await client.requestBuild();
  } else if (operation !== 'wait') {
    throw new Error(`Unsupported pages operation: ${operation}`);
  }
  await client.waitForBuild({ commit, createdAfter });
  console.log(`GitHub Pages built commit ${commit}.`);
}

const rootDirectory = process.cwd();
const command = process.argv[2];
if (command === 'validate') await validate(rootDirectory);
else if (command === 'sync') await sync(rootDirectory);
else if (command === 'pages') await pages();
else throw new Error(`Expected validate, sync, or pages command; received ${command ?? 'nothing'}`);
