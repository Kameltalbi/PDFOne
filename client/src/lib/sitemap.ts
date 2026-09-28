import { pageUrl } from './jsonLd';
import type { HreflangLink } from './hreflang';

export type SitemapEntry = {
  path: string;
  robots?: string;
  alternates?: HreflangLink[];
};

const LASTMOD: Record<string, string> = {
  '/': '2026-09-01',
  '/tools': '2026-08-28',
  '/pricing': '2026-08-28',
  '/privacy': '2026-09-01',
  '/about': '2026-09-02',
  '/contact': '2026-09-01',
  '/blog': '2026-09-02',
  '/blog/confidentialite-pdf-en-ligne': '2026-09-02',
  '/blog/reduire-taille-pdf-email': '2026-08-28',
  '/compress': '2026-08-28',
  '/merge': '2026-08-28',
  '/split': '2026-08-28',
  '/protect': '2026-08-28',
  '/edit-pdf': '2026-08-28',
  '/pdf-to-word': '2026-08-28',
  '/word-to-pdf': '2026-08-28',
  '/pdf-to-excel': '2026-08-28',
  '/excel-to-pdf': '2026-08-28',
  '/pdf-to-ppt': '2026-08-28',
  '/ppt-to-pdf': '2026-08-28',
  '/to-jpg': '2026-08-28',
  '/jpg-to-pdf': '2026-08-28',
  '/to-png': '2026-08-28',
  '/unlock': '2026-08-28',
  '/ocr': '2026-08-28',
  '/sign': '2026-08-28',
  '/watermark': '2026-08-28',
  '/page-numbers': '2026-08-28',
  '/rotate': '2026-08-28',
  '/crop': '2026-08-28',
  '/delete-pages': '2026-08-28',
  '/reorder': '2026-08-28',
  '/pdf-to-text': '2026-08-28',
  '/html-to-pdf': '2026-08-28',
  '/summarize': '2026-08-28',
  '/extract-pages': '2026-09-02',
  '/extract-images': '2026-09-02',
  '/flatten': '2026-09-02',
  '/header-footer': '2026-09-02',
  '/fill-form': '2026-09-02',
  '/fill-sign-pdf': '2026-09-04',
  '/heic-to-pdf': '2026-09-02'
};

const NEW_LOCALE_LASTMOD = '2026-09-28';

function xml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sitemapLastmod(path: string) {
  return LASTMOD[path] ?? NEW_LOCALE_LASTMOD;
}

export function sitemapEntries(pages: SitemapEntry[]) {
  return pages.filter((page) => !page.robots?.includes('noindex') && !page.path.startsWith('/en/'));
}

export function buildSitemap(pages: SitemapEntry[]) {
  const urls = sitemapEntries(pages).map((page) => {
    const loc = pageUrl(page.path);
    const alternates = (page.alternates ?? [])
      .map((alt) => `    <xhtml:link rel="alternate" hreflang="${xml(alt.hreflang)}" href="${xml(alt.href)}" />`)
      .join('\n');
    return [
      '  <url>',
      `    <loc>${xml(loc)}</loc>`,
      `    <lastmod>${sitemapLastmod(page.path)}</lastmod>`,
      alternates,
      '  </url>'
    ].filter(Boolean).join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    ''
  ].join('\n');
}
