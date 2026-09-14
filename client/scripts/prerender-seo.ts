import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pageUrl, SITE_ORIGIN } from '../src/lib/jsonLd';
import { escapeHtmlAttr, indexableSeoPages, seoArticleHtml, type SeoPrerenderPage } from '../src/lib/seoPages';

const OG_IMAGE = `${SITE_ORIGIN}/one2pdf-logo.png`;
const outDir = fileURLToPath(new URL('../dist', import.meta.url));

function replaceTitle(html: string, title: string) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtmlAttr(title)}</title>`);
}

function upsertMeta(html: string, attr: 'name' | 'property', key: string, content: string) {
  const tag = `<meta ${attr}="${key}" content="${escapeHtmlAttr(content)}" />`;
  const pattern = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*\\/?>`);
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertCanonical(html: string, href: string) {
  const tag = `<link rel="canonical" href="${escapeHtmlAttr(href)}" />`;
  const pattern = /<link rel="canonical" href="[^"]*"\s*\/?>/;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertJsonLd(html: string, id: string, data: object) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const tag = `<script id="${escapeHtmlAttr(id)}" type="application/ld+json">${json}</script>`;
  const pattern = new RegExp(`<script id="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" type="application/ld\\+json">[\\s\\S]*?<\\/script>`);
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function applyPage(shell: string, page: SeoPrerenderPage) {
  const url = pageUrl(page.path);
  let html = replaceTitle(shell, page.title);
  html = upsertMeta(html, 'name', 'description', page.description);
  html = upsertCanonical(html, url);
  html = upsertMeta(html, 'property', 'og:title', page.title);
  html = upsertMeta(html, 'property', 'og:description', page.description);
  html = upsertMeta(html, 'property', 'og:type', 'website');
  html = upsertMeta(html, 'property', 'og:url', url);
  html = upsertMeta(html, 'property', 'og:image', OG_IMAGE);
  html = upsertMeta(html, 'property', 'og:locale', 'en_US');
  html = upsertMeta(html, 'property', 'og:site_name', 'One2PDF');
  html = upsertMeta(html, 'name', 'twitter:card', 'summary');
  html = upsertMeta(html, 'name', 'twitter:title', page.title);
  html = upsertMeta(html, 'name', 'twitter:description', page.description);
  if (page.jsonLd && page.jsonLdId) html = upsertJsonLd(html, page.jsonLdId, page.jsonLd);
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('SEO prerender: built index.html is missing <div id="root"></div>');
  }
  return html.replace('<div id="root"></div>', `<div id="root">${seoArticleHtml(page)}</div>`);
}

const shell = readFileSync(join(outDir, 'index.html'), 'utf8');
const pages = indexableSeoPages();
const required = ['/rotate', '/merge', '/compress', '/blog'];
const titles = new Map<string, string>();

for (const page of pages) {
  const html = applyPage(shell, page);
  const target = page.path === '/'
    ? join(outDir, 'index.html')
    : join(outDir, page.path.slice(1), 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  titles.set(page.path, page.title);
}

for (const path of required) {
  if (!titles.has(path)) throw new Error(`SEO prerender missing required route ${path}`);
}
const unique = new Set(required.map((path) => titles.get(path)));
if (unique.size !== required.length) {
  throw new Error('SEO prerender: /rotate, /merge, /compress and /blog must have distinct titles');
}

console.log(`SEO prerender: wrote ${pages.length} indexable HTML pages`);
