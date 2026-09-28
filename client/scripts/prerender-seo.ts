import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SEO_LOCALES, type UrlLocale } from '../src/i18n/localePath';
import { pageUrl, SITE_ORIGIN } from '../src/lib/jsonLd';
import { buildSitemap } from '../src/lib/sitemap';
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

function upsertHreflang(html: string, alternates: SeoPrerenderPage['alternates']) {
  let next = html.replace(/\n\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>/g, '');
  if (!alternates.length) return next;
  const tags = alternates
    .map((alt) => `    <link rel="alternate" hreflang="${escapeHtmlAttr(alt.hreflang)}" href="${escapeHtmlAttr(alt.href)}" />`)
    .join('\n');
  return next.replace('</head>', `${tags}\n  </head>`);
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
  const ogLocale = page.locale === 'fr' ? 'fr_FR' : page.locale === 'es' ? 'es_ES' : page.locale === 'de' ? 'de_DE' : 'en_US';
  html = upsertMeta(html, 'property', 'og:locale', ogLocale);
  html = upsertHreflang(html, page.alternates);
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${page.locale}">`);
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
const required = ['/rotate', '/merge', '/compress', '/blog', '/fr/rotate', '/fr/compress', '/fr/blog', '/es/compress', '/es/rotate', '/es/merge', '/es/blog', '/de/compress', '/de/rotate', '/de/merge', '/de/blog'];
const titles = new Map<string, string>();

for (const alias of ALIAS_PATHS) {
  if (pages.some((page) => page.path === alias)) {
    throw new Error(`SEO prerender must not emit alias route ${alias}`);
  }
}

function shellDocument(locale: UrlLocale, robots: string) {
  return upsertMeta(shell, 'name', 'robots', robots).replace(/<html lang="[^"]*">/, `<html lang="${locale}">`);
}

for (const route of SPA_SHELL_ROUTES) {
  const robots = SPA_ROBOTS[route];
  if (!robots) throw new Error(`SEO prerender missing robots directive for SPA shell ${route}`);
  for (const locale of SEO_LOCALES) {
    const target = locale === 'en'
      ? join(route.slice(1), 'index.html')
      : join(locale, route.slice(1), 'index.html');
    writeHtml(target, shellDocument(locale, robots));
  }
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
const englishRequired = ['/rotate', '/merge', '/compress', '/blog'];
const unique = new Set(englishRequired.map((path) => titles.get(path)));
if (unique.size !== englishRequired.length) {
  throw new Error('SEO prerender: /rotate, /merge, /compress and /blog must have distinct titles');
}
if (pages.some((page) => page.path.startsWith('/en/'))) {
  throw new Error('SEO prerender must not emit /en/ URLs');
}

const sitemap = buildSitemap(pages);
writeFileSync(join(outDir, 'sitemap.xml'), sitemap);
writeFileSync(fileURLToPath(new URL('../public/sitemap.xml', import.meta.url)), sitemap);

const robots = readFileSync(join(outDir, 'robots.txt'), 'utf8');
if (/^disallow:\s*\/fr\/?\s*$/im.test(robots)) {
  throw new Error('robots.txt must not block /fr/');
}
if (/^disallow:\s*\/es\/?\s*$/im.test(robots)) {
  throw new Error('robots.txt must not block /es/');
}
if (/^disallow:\s*\/de\/?\s*$/im.test(robots)) {
  throw new Error('robots.txt must not block /de/');
}
for (const blocked of ['/pt/', '/it/', '/ar/', '/tr/']) {
  if (pages.some((page) => page.path.startsWith(blocked))) {
    throw new Error(`SEO prerender must not emit ${blocked}`);
  }
}

await verifyPrerender(outDir, pages);

console.log(`SEO prerender: wrote ${pages.length} indexable HTML pages, ${SPA_SHELL_ROUTES.length * SEO_LOCALES.length} SPA shells, 404.html`);

function assertPageHtml(page: SeoPrerenderPage, html: string) {
  if (!html.includes(`<html lang="${page.locale}"`)) {
    throw new Error(`${page.path} html lang must be ${page.locale}`);
  }
  if (!html.includes(`<title>${escapeHtmlAttr(page.title)}</title>`)) {
    throw new Error(`${page.path} title mismatch`);
  }
  if (!html.includes(`<link rel="canonical" href="${pageUrl(page.path)}" />`)) {
    throw new Error(`${page.path} must self-canonicalize`);
  }
  if (!html.includes(`<h1>${escapeHtmlAttr(page.h1)}</h1>`)) {
    throw new Error(`${page.path} H1 mismatch`);
  }
  if (!html.includes(`<meta name="description" content="${escapeHtmlAttr(page.description)}" />`)) {
    throw new Error(`${page.path} description mismatch`);
  }
  const firstQuestion = page.copy?.faq?.[0]?.question;
  if (firstQuestion && !html.includes(escapeHtmlAttr(firstQuestion))) {
    throw new Error(`${page.path} missing FAQ`);
  }
  for (const alt of page.alternates) {
    const tag = `<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`;
    if (!html.includes(tag)) throw new Error(`${page.path} missing hreflang ${alt.hreflang}`);
  }
  const article = html.match(/<article id="seo-prerender">[\s\S]*<\/article>/)?.[0] ?? '';
  if (page.locale === 'fr' && page.related?.length) {
    if (!article.includes('href="/fr/')) throw new Error(`${page.path} is missing French internal links`);
    if (/href="\/(?!fr\/)/.test(article)) throw new Error(`${page.path} links outside /fr/`);
  }
  if (page.locale === 'es' && page.related?.length) {
    if (!article.includes('href="/es/')) throw new Error(`${page.path} is missing Spanish internal links`);
    if (/href="\/(?!es\/)/.test(article)) throw new Error(`${page.path} links outside /es/`);
  }
  if (page.locale === 'de' && page.related?.length) {
    if (!article.includes('href="/de/')) throw new Error(`${page.path} is missing German internal links`);
    if (/href="\/(?!de\/)/.test(article)) throw new Error(`${page.path} links outside /de/`);
  }
  if (page.locale === 'en' && (article.includes('href="/fr/') || article.includes('href="/es/') || article.includes('href="/de/'))) {
    throw new Error(`${page.path} English article must not link to another locale`);
  }
}

async function verifyPrerender(root: string, built: SeoPrerenderPage[]) {
  const checks = ['/compress', '/fr/compress', '/es/compress', '/de/compress', '/rotate', '/fr/rotate', '/es/rotate', '/de/rotate', '/de/merge', '/de/pdf-to-word', '/de/jpg-to-pdf'];
  if (existsSync(join(root, 'en', 'compress', 'index.html'))) {
    throw new Error('unexpected /en/compress output');
  }
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (rel.endsWith('/')) rel += 'index.html';
    else if (!rel.split('/').pop()?.includes('.')) rel += '/index.html';
    if (rel === '/index.html' || rel === 'index.html') rel = 'index.html';
    try {
      const body = await readFile(join(root, rel));
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('missing');
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as AddressInfo;
  try {
    for (const path of checks) {
      const page = built.find((item) => item.path === path);
      if (!page) throw new Error(`Missing prerender page ${path}`);
      const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
      if (response.status !== 200) throw new Error(`${path} returned HTTP ${response.status}`);
      assertPageHtml(page, await response.text());
    }
    const blocked = await fetch(`http://127.0.0.1:${address.port}/en/compress`);
    if (blocked.status !== 404) throw new Error('/en/compress must not be generated');
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}
