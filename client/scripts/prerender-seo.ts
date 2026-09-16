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
  html = upsertMeta(html, 'name', 'robots', page.robots ?? 'index, follow');
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('SEO prerender: built index.html is missing <div id="root"></div>');
  }
  return html.replace('<div id="root"></div>', `<div id="root">${seoArticleHtml(page)}</div>`);
}

const SPA_SHELL_ROUTES = [
  '/login',
  '/signup',
  '/account',
  '/pricing/success',
  '/edit-pdf/result',
  '/internal/ops'
];
const SPA_ROBOTS: Record<string, string> = {
  '/login': 'noindex, follow',
  '/signup': 'noindex, follow',
  '/account': 'noindex, follow',
  '/pricing/success': 'noindex, nofollow',
  '/edit-pdf/result': 'noindex, nofollow',
  '/internal/ops': 'noindex, nofollow, noarchive'
};

const ALIAS_PATHS = ['/png-to-pdf', '/pdf-to-pptx', '/pptx-to-pdf'];

function applyNotFound(html: string) {
  let page = replaceTitle(html, 'Page not found | One2PDF');
  page = upsertMeta(page, 'name', 'description', 'This page does not exist.');
  page = upsertMeta(page, 'name', 'robots', 'noindex, nofollow');
  page = page.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/?>/, '');
  if (!page.includes('<div id="root"></div>')) {
    throw new Error('SEO prerender: built index.html is missing <div id="root"></div>');
  }
  return page.replace(
    '<div id="root"></div>',
    '<div id="root"><article id="seo-prerender"><h1>This page does not exist.</h1><p>The link may be outdated or mistyped. The PDF tools are still here.</p><p><a href="/">Back to home</a></p></article></div>'
  );
}

function writeHtml(relativePath: string, html: string) {
  const target = join(outDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}

const shell = readFileSync(join(outDir, 'index.html'), 'utf8');
const pages = indexableSeoPages();
const required = ['/rotate', '/merge', '/compress', '/blog'];
const titles = new Map<string, string>();

for (const alias of ALIAS_PATHS) {
  if (pages.some((page) => page.path === alias)) {
    throw new Error(`SEO prerender must not emit alias route ${alias}`);
  }
}

for (const route of SPA_SHELL_ROUTES) {
  const robots = SPA_ROBOTS[route];
  if (!robots) throw new Error(`SEO prerender missing robots directive for SPA shell ${route}`);
  writeHtml(join(route.slice(1), 'index.html'), upsertMeta(shell, 'name', 'robots', robots));
}
writeHtml('404.html', applyNotFound(shell));

for (const page of pages) {
  const html = applyPage(shell, page);
  const target = page.path === '/'
    ? 'index.html'
    : join(page.path.slice(1), 'index.html');
  writeHtml(target, html);
  titles.set(page.path, page.title);
}

for (const path of required) {
  if (!titles.has(path)) throw new Error(`SEO prerender missing required route ${path}`);
}
const unique = new Set(required.map((path) => titles.get(path)));
if (unique.size !== required.length) {
  throw new Error('SEO prerender: /rotate, /merge, /compress and /blog must have distinct titles');
}

console.log(`SEO prerender: wrote ${pages.length} indexable HTML pages, ${SPA_SHELL_ROUTES.length} SPA shells, 404.html`);
