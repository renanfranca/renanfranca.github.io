import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEV_API = 'https://dev.to/api';
const USERNAME = 'renanfranca';
const PAGE_SIZE = 1000;

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'renanfranca-blog-dev-to-tags/1.0' } });
  if (!response.ok) {
    throw new Error(`DEV returned ${response.status} while loading ${url}`);
  }
  return response.json();
}

async function loadEveryPage(pathname) {
  const values = [];
  for (let page = 1; ; page += 1) {
    const separator = pathname.includes('?') ? '&' : '?';
    const batch = await fetchJson(`${DEV_API}${pathname}${separator}per_page=${PAGE_SIZE}&page=${page}`);
    if (!Array.isArray(batch)) throw new Error(`DEV returned a non-array response for ${pathname}`);
    values.push(...batch);
    if (batch.length < PAGE_SIZE) return values;
  }
}

export async function updateTagCatalog(rootDirectory) {
  const [catalogTags, userArticles] = await Promise.all([
    loadEveryPage('/tags'),
    loadEveryPage(`/articles?username=${USERNAME}&state=all`),
  ]);
  const names = new Set(catalogTags.map(tag => tag.name));
  for (const article of userArticles) {
    for (const tag of article.tag_list ?? []) names.add(tag);
  }

  const sortedNames = [...names].filter(Boolean).sort((left, right) => left.localeCompare(right, 'en'));
  const destination = path.join(rootDirectory, '_data', 'dev_to_tags.json');
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(sortedNames, null, 2)}\n`, 'utf8');
  return {
    catalogCount: catalogTags.length,
    userTagCount: new Set(userArticles.flatMap(article => article.tag_list ?? [])).size,
    total: sortedNames.length,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const result = await updateTagCatalog(rootDirectory);
  console.log(
    `Updated _data/dev_to_tags.json with ${result.total} tags (${result.catalogCount} from the catalog, ${result.userTagCount} used by ${USERNAME}).`,
  );
}
