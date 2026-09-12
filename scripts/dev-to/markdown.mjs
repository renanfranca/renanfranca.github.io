import { absoluteSiteUrl } from './posts.mjs';

const FENCE_PATTERN = /^\s*(```+|~~~+)/;

function splitFencedSegments(markdown) {
  const segments = [];
  let current = [];
  let fence;

  for (const line of markdown.split(/(?<=\n)/)) {
    const match = line.match(FENCE_PATTERN);
    if (!fence && match) {
      if (current.length) segments.push({ code: false, value: current.join('') });
      current = [line];
      fence = match[1][0];
    } else if (fence && match?.[1][0] === fence) {
      current.push(line);
      segments.push({ code: true, value: current.join('') });
      current = [];
      fence = undefined;
    } else {
      current.push(line);
    }
  }

  if (current.length) segments.push({ code: Boolean(fence), value: current.join('') });
  return segments;
}

function removeRepeatedCover(markdown, coverUrl, siteConfig) {
  const lines = markdown.split('\n');
  const firstContentIndex = lines.findIndex(line => line.trim());
  if (firstContentIndex < 0) return markdown;

  const image = lines[firstContentIndex].trim().match(/^!\[[^\]]*\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)$/);
  if (!image) return markdown;

  const imageUrl = absoluteSiteUrl(image[1], siteConfig);
  if (imageUrl !== coverUrl) return markdown;

  lines.splice(firstContentIndex, 1);
  while (lines[0] === '') lines.shift();
  return lines.join('\n');
}

function absoluteUrlIfLocal(value, siteConfig) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return value;
  return absoluteSiteUrl(value, siteConfig);
}

function transformText(text, data, siteConfig) {
  const inlineCode = [];
  let transformed = text.replace(/(`+)([^`\n]*?)\1/g, match => {
    const token = `\u0000DEVTO_INLINE_${inlineCode.length}\u0000`;
    inlineCode.push(match);
    return token;
  });

  transformed = transformed.replace(
    /<blockquote class=["']twitter-tweet["'][\s\S]*?<a href=["'](https:\/\/(?:twitter\.com|x\.com)\/[^"']+\/status\/\d+)[^"']*["'][\s\S]*?<\/blockquote>\s*<script[^>]+platform\.twitter\.com\/widgets\.js[^>]*><\/script>/gi,
    '{% embed $1 %}',
  );

  transformed = transformed.replace(/\{%\s*include\s+youtubePlayer\.html\s+id=page\.([A-Za-z0-9_]+)\s*%\}/g, (match, key) => {
    const videoId = data[key];
    if (!videoId) throw new Error(`YouTube include references missing front matter field ${key}`);
    return `{% embed https://www.youtube.com/watch?v=${videoId} %}`;
  });

  transformed = transformed.replace(
    /<script\s+src=["'](https:\/\/gist\.github\.com\/[^/"']+\/([a-f0-9]+))\.js["']><\/script>/gi,
    '{% embed $1 %}',
  );
  transformed = transformed.replace(/\s*<script[^>]+buttons\.github\.io\/buttons\.js[^>]*><\/script>/gi, '');

  transformed = transformed.replace(/(!?\[[^\]]*\]\()([^\s)]+)/g, (match, prefix, url) => {
    return `${prefix}${absoluteUrlIfLocal(url, siteConfig)}`;
  });
  transformed = transformed.replace(/^(\s*\[[^\]]+\]:\s*)(\S+)/gm, (match, prefix, url) => {
    return `${prefix}${absoluteUrlIfLocal(url, siteConfig)}`;
  });
  transformed = transformed.replace(/((?:src|href)=["'])([^"']+)/gi, (match, prefix, url) => {
    return `${prefix}${absoluteUrlIfLocal(url, siteConfig)}`;
  });

  const liquidCheck = transformed.replace(/\{%\s*embed\s+https:\/\/[^\s%]+\s*%\}/g, '');
  const unsupportedLiquid = liquidCheck.match(/\{[{%][\s\S]*?[}%]\}/);
  if (unsupportedLiquid) {
    throw new Error(`unsupported Liquid expression outside a code fence: ${unsupportedLiquid[0]}`);
  }
  if (/<script\b/i.test(transformed)) {
    throw new Error('unsupported script element outside a code fence');
  }

  return transformed.replace(/\u0000DEVTO_INLINE_(\d+)\u0000/g, (match, index) => inlineCode[Number(index)]);
}

export function prepareDevMarkdown(post, siteConfig) {
  const coverUrl = absoluteSiteUrl(post.data.image, siteConfig);
  const withoutCover = removeRepeatedCover(post.content, coverUrl, siteConfig);
  return splitFencedSegments(withoutCover)
    .map(segment => (segment.code ? segment.value : transformText(segment.value, post.data, siteConfig)))
    .join('')
    .trim();
}
