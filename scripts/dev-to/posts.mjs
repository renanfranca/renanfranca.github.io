import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const FRONT_MATTER_PATTERN = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;
const POST_FILE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/;

export function parseDocument(source, filePath = '<memory>') {
  const match = source.match(FRONT_MATTER_PATTERN);
  if (!match) {
    throw new Error(`${filePath}: missing YAML front matter`);
  }

  let data;
  try {
    data = parseYaml(match[1]) ?? {};
  } catch (error) {
    throw new Error(`${filePath}: invalid YAML front matter: ${error.message}`, { cause: error });
  }

  return { data, content: source.slice(match[0].length) };
}

export function parsePostDate(value, filePath = '<memory>') {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${filePath}: invalid date`);
  }

  return date;
}

function postFilenameParts(filePath) {
  const filename = path.basename(filePath);
  const match = filename.match(POST_FILE_PATTERN);
  if (!match) {
    throw new Error(`${filePath}: expected a YYYY-MM-DD-title.md filename`);
  }

  return { filename, slug: match[4] };
}

function categoriesPath(categories) {
  if (!categories) return '';
  const values = Array.isArray(categories) ? categories : String(categories).split(/\s+/);
  return values.filter(Boolean).join('/');
}

export function canonicalUrlForPost(post, siteConfig) {
  const baseUrl = siteConfig.url;
  if (!baseUrl) {
    throw new Error('_config.yml: url is required for DEV syndication');
  }

  const { slug } = postFilenameParts(post.filePath);
  const date = parsePostDate(post.data.date, post.filePath);
  const parts = {
    categories: categoriesPath(post.data.categories),
    day: String(date.getUTCDate()).padStart(2, '0'),
    i_day: String(date.getUTCDate()),
    i_month: String(date.getUTCMonth() + 1),
    month: String(date.getUTCMonth() + 1).padStart(2, '0'),
    output_ext: '.html',
    short_year: String(date.getUTCFullYear()).slice(-2),
    slug,
    title: slug,
    year: String(date.getUTCFullYear()),
  };

  let permalink = post.data.permalink ?? '/:year/:month/:day/:title:output_ext';
  permalink = permalink.replace(/:([a-z_]+)/g, (token, name) => {
    if (!(name in parts)) {
      throw new Error(`${post.filePath}: unsupported permalink token ${token}`);
    }
    return parts[name];
  });

  const normalizedPath = `/${permalink}`.replace(/\/{2,}/g, '/');
  return new URL(normalizedPath, `${baseUrl.replace(/\/$/, '')}/`).href;
}

export function absoluteSiteUrl(value, siteConfig) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(String(value).replace(/^\.?\//, ''), `${siteConfig.url.replace(/\/$/, '')}/`).href;
}

export function postEligibility(post, now = new Date()) {
  if (post.data.dev_to === false) return { eligible: false, reason: 'opt-out' };
  if (post.data.published === false || post.data.draft === true) return { eligible: false, reason: 'draft' };

  const date = parsePostDate(post.data.date, post.filePath);
  if (date > now) return { eligible: false, reason: 'future' };
  return { eligible: true };
}

export function validatePost(post, catalog) {
  if (post.data.dev_to === false) return [];

  const errors = [];
  for (const field of ['title', 'description', 'date', 'image']) {
    if (post.data[field] === undefined || post.data[field] === null || post.data[field] === '') {
      errors.push(`${post.filePath}: ${field} is required for DEV syndication`);
    }
  }

  try {
    parsePostDate(post.data.date, post.filePath);
  } catch (error) {
    errors.push(error.message);
  }

  const tags = post.data.dev_to_tags;
  if (!Array.isArray(tags) || tags.length !== 4) {
    errors.push(`${post.filePath}: dev_to_tags must contain exactly four tags`);
    return errors;
  }

  if (new Set(tags).size !== tags.length) {
    errors.push(`${post.filePath}: dev_to_tags must not contain duplicates`);
  }

  for (const tag of tags) {
    if (typeof tag !== 'string' || !tag.trim()) {
      errors.push(`${post.filePath}: every dev_to_tags entry must be a non-empty string`);
    } else if (!catalog.has(tag)) {
      errors.push(`${post.filePath}: DEV tag "${tag}" is not present in _data/dev_to_tags.json`);
    }
  }

  return errors;
}

export async function loadSiteConfig(rootDirectory) {
  const source = await readFile(path.join(rootDirectory, '_config.yml'), 'utf8');
  return parseYaml(source) ?? {};
}

export async function loadTagCatalog(rootDirectory) {
  const source = await readFile(path.join(rootDirectory, '_data', 'dev_to_tags.json'), 'utf8');
  const tags = JSON.parse(source);
  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) {
    throw new Error('_data/dev_to_tags.json must contain a JSON array of tag names');
  }
  return new Set(tags);
}

export async function readPost(rootDirectory, relativePath) {
  const filePath = relativePath.replaceAll('\\', '/');
  const source = await readFile(path.join(rootDirectory, filePath), 'utf8');
  const document = parseDocument(source, filePath);
  return { ...document, filePath };
}

export async function readAllPosts(rootDirectory) {
  const filenames = (await readdir(path.join(rootDirectory, '_posts'))).filter(filename => filename.endsWith('.md')).sort();
  return Promise.all(filenames.map(filename => readPost(rootDirectory, path.posix.join('_posts', filename))));
}
