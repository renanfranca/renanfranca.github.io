import DOMPurifyModule from './vendor/dompurify.es.mjs';

export const DEV_API_BASE_URL = 'https://dev.to/api';
export const DEV_API_MEDIA_TYPE = 'application/vnd.forem.api-v1+json';

const ARTICLE_PAGE_SIZE = 100;
const COMMENT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
];
const ALLOWED_ATTRIBUTES = ['alt', 'colspan', 'href', 'rowspan', 'src', 'title'];

class DevCommentsError extends Error {
  constructor(message, { cause } = {}) {
    super(message, { cause });
    this.name = 'DevCommentsError';
  }
}

function nonEmptyString(value) {
  return typeof value === 'string' && Boolean(value.trim());
}

export function safeHttpUrl(value, baseUrl) {
  if (!nonEmptyString(value)) return undefined;

  try {
    const url = baseUrl ? new URL(value, baseUrl) : new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    return url;
  } catch {
    return undefined;
  }
}

function safeDevArticleUrl(value) {
  const url = safeHttpUrl(value);
  return url?.origin === 'https://dev.to' ? url : undefined;
}

function externalLink(documentRef, label, url, className) {
  const link = documentRef.createElement('a');
  link.textContent = label;
  link.href = url.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (className) link.className = className;
  return link;
}

async function requestJson(fetchImpl, url, label) {
  let response;
  try {
    response = await fetchImpl(url, {
      cache: 'no-cache',
      credentials: 'omit',
      headers: { Accept: DEV_API_MEDIA_TYPE },
      method: 'GET',
    });
  } catch (error) {
    throw new DevCommentsError(`${label} request failed`, { cause: error });
  }

  if (!response?.ok) {
    const status = Number.isInteger(response?.status) ? ` (${response.status})` : '';
    throw new DevCommentsError(`${label} request returned a non-success response${status}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new DevCommentsError(`${label} response was not valid JSON`, { cause: error });
  }
}

function validateMatchedArticle(article) {
  if (!article || typeof article !== 'object') throw new DevCommentsError('matched article was malformed');
  if (!Number.isSafeInteger(article.id) || article.id <= 0) throw new DevCommentsError('matched article had an invalid ID');
  if (!Number.isSafeInteger(article.comments_count) || article.comments_count < 0) {
    throw new DevCommentsError('matched article had an invalid comment count');
  }

  const articleUrl = safeDevArticleUrl(article.url);
  if (!articleUrl) throw new DevCommentsError('matched article had an unsafe DEV URL');
  return { ...article, url: articleUrl.href };
}

export async function findDevArticle({ baseUrl = DEV_API_BASE_URL, canonicalUrl, fetchImpl, pageSize = ARTICLE_PAGE_SIZE, username }) {
  if (!nonEmptyString(username)) throw new DevCommentsError('DEV username was missing');
  if (!safeHttpUrl(canonicalUrl)) throw new DevCommentsError('canonical URL was invalid');
  if (!Number.isSafeInteger(pageSize) || pageSize <= 0) throw new DevCommentsError('article page size was invalid');

  const matches = [];
  for (let page = 1; ; page += 1) {
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/articles`);
    url.searchParams.set('username', username.trim());
    url.searchParams.set('per_page', String(pageSize));
    url.searchParams.set('page', String(page));
    const articles = await requestJson(fetchImpl, url, 'article discovery');
    if (!Array.isArray(articles)) throw new DevCommentsError('article discovery response was not an array');

    for (const article of articles) {
      if (!article || typeof article !== 'object' || typeof article.canonical_url !== 'string') {
        throw new DevCommentsError('article discovery response contained a malformed article');
      }
      if (article.canonical_url === canonicalUrl) matches.push(article);
    }

    if (articles.length < pageSize) break;
  }

  if (matches.length > 1) throw new DevCommentsError('multiple articles matched the canonical URL');
  return matches.length === 1 ? validateMatchedArticle(matches[0]) : undefined;
}

export async function fetchDevComments({ articleId, baseUrl = DEV_API_BASE_URL, fetchImpl }) {
  if (!Number.isSafeInteger(articleId) || articleId <= 0) throw new DevCommentsError('article ID was invalid');

  const url = new URL(`${baseUrl.replace(/\/$/, '')}/comments`);
  url.searchParams.set('a_id', String(articleId));
  const comments = await requestJson(fetchImpl, url, 'comment retrieval');
  if (!Array.isArray(comments)) throw new DevCommentsError('comment response was not an array');
  return comments;
}

export function sanitizeCommentBody({ baseUrl, documentRef, html, sanitizer }) {
  const fragment = sanitizer.sanitize(html, {
    ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
    ALLOWED_TAGS,
    ALLOW_DATA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,
  });

  for (const link of fragment.querySelectorAll('a')) {
    const url = safeHttpUrl(link.getAttribute('href'), baseUrl);
    if (url) link.setAttribute('href', url.href);
    else link.removeAttribute('href');
  }

  for (const image of fragment.querySelectorAll('img')) {
    const url = safeHttpUrl(image.getAttribute('src'), baseUrl);
    if (!url) {
      image.remove();
      continue;
    }
    image.setAttribute('src', url.href);
    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
    if (!image.hasAttribute('alt')) image.setAttribute('alt', '');
  }

  return documentRef.importNode(fragment, true);
}

function validateComment(comment) {
  if (!comment || typeof comment !== 'object') throw new Error('node was not an object');
  if (!nonEmptyString(comment.id_code) || !COMMENT_ID_PATTERN.test(comment.id_code)) throw new Error('id_code was invalid');
  if (!nonEmptyString(comment.created_at) || Number.isNaN(new Date(comment.created_at).getTime())) {
    throw new Error('created_at was invalid');
  }
  if (typeof comment.body_html !== 'string') throw new Error('body_html was missing');
  if (!Array.isArray(comment.children)) throw new Error('children was not an array');
  if (!comment.user || typeof comment.user !== 'object') throw new Error('user was missing');
  if (!nonEmptyString(comment.user.name)) throw new Error('user name was missing');
  if (!nonEmptyString(comment.user.username) || !USERNAME_PATTERN.test(comment.user.username)) {
    throw new Error('username was invalid');
  }

  return {
    bodyHtml: comment.body_html,
    children: comment.children,
    createdAt: comment.created_at,
    idCode: comment.id_code,
    name: comment.user.name.trim(),
    profileImage: comment.user.profile_image_90 ?? comment.user.profile_image,
    username: comment.user.username,
  };
}

function commentPermalink(articleUrl, idCode) {
  const url = new URL(articleUrl);
  url.hash = `comment-${idCode}`;
  return url;
}

function renderComment({ article, comment, depth, documentRef, formatter, logger, path, sanitizer }) {
  let value;
  try {
    value = validateComment(comment);
  } catch (error) {
    logger.warn(`[DEV comments] Skipped malformed comment at ${path}: ${error.message}`);
    return undefined;
  }

  const item = documentRef.createElement('li');
  item.className = 'dev-comment';

  const commentArticle = documentRef.createElement('article');
  commentArticle.className = 'dev-comment-card';

  const header = documentRef.createElement('header');
  header.className = 'dev-comment-header';

  const profileUrl = safeHttpUrl(value.profileImage);
  if (profileUrl?.protocol === 'https:') {
    const profileLink = externalLink(
      documentRef,
      '',
      new URL(`/${encodeURIComponent(value.username)}`, 'https://dev.to'),
      'dev-comment-avatar-link',
    );
    const profileImage = documentRef.createElement('img');
    profileImage.className = 'dev-comment-avatar';
    profileImage.src = profileUrl.href;
    profileImage.alt = `${value.name}'s DEV profile picture`;
    profileImage.loading = 'lazy';
    profileImage.decoding = 'async';
    profileImage.addEventListener('error', () => profileLink.remove(), { once: true });
    profileLink.append(profileImage);
    header.append(profileLink);
  }

  const metadata = documentRef.createElement('div');
  metadata.className = 'dev-comment-metadata';
  metadata.append(
    externalLink(documentRef, value.name, new URL(`/${encodeURIComponent(value.username)}`, 'https://dev.to'), 'dev-comment-author'),
  );

  const timeLink = externalLink(documentRef, '', commentPermalink(article.url, value.idCode), 'dev-comment-time-link');
  const time = documentRef.createElement('time');
  time.dateTime = value.createdAt;
  time.textContent = formatter.format(new Date(value.createdAt));
  timeLink.append(time);
  metadata.append(timeLink);
  header.append(metadata);

  const body = documentRef.createElement('div');
  body.className = 'dev-comment-body';
  let safeBody;
  try {
    safeBody = sanitizeCommentBody({
      baseUrl: article.url,
      documentRef,
      html: value.bodyHtml,
      sanitizer,
    });
  } catch {
    logger.warn(`[DEV comments] Skipped malformed comment at ${path}: body could not be rendered safely`);
    return undefined;
  }
  body.append(safeBody);

  commentArticle.append(header, body);
  item.append(commentArticle);

  const childItems = [];
  for (const [index, child] of value.children.entries()) {
    const rendered = renderComment({
      article,
      comment: child,
      depth: depth + 1,
      documentRef,
      formatter,
      logger,
      path: `${path}.${index + 1}`,
      sanitizer,
    });
    if (rendered) childItems.push(rendered);
  }

  if (childItems.length) {
    const children = documentRef.createElement('ol');
    children.className = 'dev-comment-children';
    if (depth >= 2) children.classList.add('dev-comment-children-deep');
    children.setAttribute('aria-label', 'Replies');
    children.append(...childItems);
    item.append(children);
  }

  return item;
}

function sectionHeading(documentRef) {
  const heading = documentRef.createElement('h2');
  heading.id = 'dev-comments-heading';
  heading.textContent = 'Discussion on DEV';
  return heading;
}

function reveal(root) {
  root.hidden = false;
  root.setAttribute('aria-labelledby', 'dev-comments-heading');
}

export function renderConversation({ article, comments, documentRef, locale, logger, root, sanitizer }) {
  let formatter;
  try {
    formatter = new Intl.DateTimeFormat(locale || 'en', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    formatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });
  }
  const items = [];
  for (const [index, comment] of comments.entries()) {
    const rendered = renderComment({
      article,
      comment,
      depth: 0,
      documentRef,
      formatter,
      logger,
      path: String(index + 1),
      sanitizer,
    });
    if (rendered) items.push(rendered);
  }

  if (!items.length) return 0;

  const list = documentRef.createElement('ol');
  list.className = 'dev-comment-list';
  list.append(...items);

  const action = documentRef.createElement('p');
  action.className = 'dev-comments-action';
  action.append(externalLink(documentRef, 'Join the discussion on DEV', new URL(article.url), 'dev-comments-action-link'));

  root.replaceChildren(sectionHeading(documentRef), list, action);
  reveal(root);
  return items.length;
}

export function renderCommentFailure({ article, documentRef, root }) {
  const message = documentRef.createElement('p');
  message.className = 'dev-comments-fallback';
  message.append('The DEV discussion could not be loaded. ');
  message.append(externalLink(documentRef, 'View it on DEV.', new URL(article.url), 'dev-comments-fallback-link'));
  root.replaceChildren(sectionHeading(documentRef), message);
  reveal(root);
}

export async function loadDevComments(
  root,
  { baseUrl = DEV_API_BASE_URL, documentRef = root?.ownerDocument, fetchImpl = globalThis.fetch, logger = console, sanitizer } = {},
) {
  const canonicalUrl = root?.dataset.devToCanonicalUrl;
  const username = root?.dataset.devToUsername;
  root.hidden = true;
  root.replaceChildren();

  let article;
  try {
    article = await findDevArticle({ baseUrl, canonicalUrl, fetchImpl, username });
  } catch (error) {
    logger.warn(`[DEV comments] Article discovery failed: ${error.message}`);
    return { status: 'discovery-error' };
  }

  if (!article) return { status: 'no-match' };
  if (article.comments_count === 0) return { status: 'no-comments', article };

  let comments;
  try {
    comments = await fetchDevComments({ articleId: article.id, baseUrl, fetchImpl });
  } catch (error) {
    logger.warn(`[DEV comments] Comment retrieval failed: ${error.message}`);
    renderCommentFailure({ article, documentRef, root });
    return { status: 'comment-error', article };
  }

  if (!comments.length) return { status: 'no-comments', article };
  const renderedCount = renderConversation({
    article,
    comments,
    documentRef,
    locale: documentRef.documentElement.lang,
    logger,
    root,
    sanitizer,
  });
  return renderedCount ? { status: 'rendered', article, renderedCount } : { status: 'no-valid-comments', article };
}

function runtimeSanitizer(windowRef) {
  return typeof DOMPurifyModule.sanitize === 'function' ? DOMPurifyModule : DOMPurifyModule(windowRef);
}

export function startDevComments({ documentRef = document, fetchImpl = fetch, logger = console, windowRef = window } = {}) {
  const sanitizer = runtimeSanitizer(windowRef);
  for (const root of documentRef.querySelectorAll('[data-dev-comments]')) {
    void loadDevComments(root, { documentRef, fetchImpl, logger, sanitizer });
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') startDevComments();
