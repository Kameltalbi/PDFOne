import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TURKISH_BLOG_DRAFTS } from '../src/content/blogTrDrafts.ts';
import { getBlogPosts } from '../src/content/blog.ts';
import { getPrivacyPolicy } from '../src/content/privacyPolicy.ts';
import { privacyLocalization } from '../src/content/privacyLocalization.ts';
import { dictionaries } from '../src/i18n/dictionaries.ts';
import { URL_LOCALE_PREFIXES } from '../src/i18n/localePath.ts';
import { hreflangForPath } from '../src/lib/hreflang.ts';
import { indexableSeoPages } from '../src/lib/seoPages.ts';
import { buildSitemap } from '../src/lib/sitemap.ts';

function leaves(value: unknown, path = ''): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (node: unknown, current: string) => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${current}[${index}]`));
      return;
    }
    if (node && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) {
        walk(child, current ? `${current}.${key}` : key);
      }
      return;
    }
    if (typeof node === 'string') out.set(current, node);
  };
  walk(value, path);
  return out;
}

const en = leaves(dictionaries.en);
const tr = leaves(dictionaries.tr);
const pages = indexableSeoPages();

function isToken(key: string, value: string) {
  return key.endsWith('.tone') || key.endsWith('.icon') || value.length <= 2;
}

function coverage(pattern: RegExp) {
  const keys = [...en.keys()].filter((key) => pattern.test(key) && !isToken(key, en.get(key) ?? ''));
  const done = keys.filter((key) => tr.get(key) !== en.get(key));
  return { done: done.length, total: keys.length, missing: keys.filter((key) => tr.get(key) === en.get(key)) };
}

describe('Turkish content with SEO activation', () => {
  it('activates Turkish URLs without Arabic or a Turkish privacy policy', () => {
    assert.deepEqual([...URL_LOCALE_PREFIXES], ['fr', 'es', 'de', 'pt', 'it', 'tr', 'ar']);
    assert.equal(hreflangForPath('/compress').some((link) => link.hreflang === 'tr'), true);
    assert.equal(hreflangForPath('/privacy').some((link) => link.hreflang === 'tr'), false);
    assert.equal(pages.some((page) => page.path === '/tr' || page.path.startsWith('/tr/')), true);
    assert.equal(pages.some((page) => page.path === '/tr/compress'), true);
    assert.equal(pages.some((page) => page.path === '/tr/privacy'), false);
    const xml = buildSitemap(pages);
    assert.match(xml, /\/tr\/compress/);
    assert.doesNotMatch(xml, /\/tr\/privacy/);
    assert.doesNotMatch(xml, /\/tr\/translate/);
    assert.match(xml, /hreflang="tr"/);
  });

  it('translates Turkish SEO, FAQ, how-to and tool titles', () => {
    for (const [name, pattern] of [
      ['seo titles', /seoTitle$/],
      ['meta descriptions', /seoDescription$/],
      ['long copy', /seoH2$|seoP[123]$/],
      ['faq', /faqTitle$|faq\[/],
      ['how-to', /howTitle$|howSteps\[/]
    ] as const) {
      const result = coverage(pattern);
      assert.equal(result.done, result.total, `${name} ${result.done}/${result.total} ${result.missing.slice(0, 8).join(', ')}`);
    }
    assert.equal(dictionaries.tr.compress.title, 'PDF Sıkıştır');
    assert.equal(dictionaries.tr.merge.title, 'PDF Birleştir');
    assert.equal(dictionaries.tr.split.title, 'PDF Böl');
    assert.equal(dictionaries.tr.rotatePdf.title, 'PDF Döndür');
    assert.equal(dictionaries.tr.protect.title, 'PDF Koru');
    assert.equal(dictionaries.tr.unlockPdf.title, 'PDF Kilidini Aç');
    assert.equal(dictionaries.tr.tools.pdfToWord, 'PDF’den Word’e');
    assert.equal(dictionaries.tr.tools.wordToPdf, 'Word’den PDF’ye');
    assert.equal(dictionaries.tr.tools.jpgToPdf, 'JPG’den PDF’ye');
    assert.equal(dictionaries.tr.tools.pdfToJpg, 'PDF’den JPG’ye');
    assert.equal(dictionaries.en.compress.seoTitle, 'Compress PDF Online — Smaller Files | One2PDF');
    assert.equal(dictionaries.fr.compress.seoTitle, 'Compresser un PDF en ligne gratuitement | One2PDF');
    assert.equal(dictionaries.es.compress.seoTitle, 'Comprimir PDF en línea gratis | One2PDF');
    assert.equal(dictionaries.de.compress.seoTitle, 'PDF komprimieren | One2PDF');
    assert.equal(dictionaries.pt.compress.seoTitle, 'Comprimir PDF online | One2PDF');
    assert.equal(dictionaries.it.compress.seoTitle, 'Comprimere PDF online | One2PDF');
  });

  it('keeps interpolation variables', () => {
    for (const [key, value] of en) {
      if (!value.includes('{') || !tr.has(key)) continue;
      const expected = [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      const actual = [...(tr.get(key) ?? '').matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      assert.equal(actual, expected, key);
    }
  });

  it('publishes the Turkish blog on Turkish URLs only', () => {
    assert.equal(TURKISH_BLOG_DRAFTS.length, 2);
    assert.notEqual(getBlogPosts('tr')[0]?.title, getBlogPosts('en')[0]?.title);
    assert.equal(getBlogPosts('en')[0]?.title, 'Online PDFs: how to avoid sending your files to an unknown server');
    assert.equal(pages.some((page) => page.path === '/tr/blog/pdf-eposta-sikistir'), true);
    assert.equal(pages.some((page) => page.path === '/tr/blog/gizlilik-pdf-online'), true);
    assert.equal(pages.some((page) => page.path === '/blog/pdf-eposta-sikistir'), false);
    assert.equal(JSON.stringify(TURKISH_BLOG_DRAFTS).includes('/tr/privacy'), false);
    assert.equal(JSON.stringify(TURKISH_BLOG_DRAFTS).includes('"/privacy"'), true);
    assert.equal(JSON.stringify(getBlogPosts('en')).includes('/tr/'), false);
    const cluster = hreflangForPath('/blog/reduire-taille-pdf-email');
    assert.equal(cluster.find((link) => link.hreflang === 'tr')?.href, 'https://one2pdf.com/tr/blog/pdf-eposta-sikistir');
  });

  it('flags the Turkish privacy policy instead of rewriting it', () => {
    assert.equal(privacyLocalization.tr.status, 'flagged');
    assert.equal(getPrivacyPolicy('tr').title, getPrivacyPolicy('en').title);
    assert.notEqual(dictionaries.tr.legal.privacyTitle, dictionaries.en.legal.privacyTitle);
  });
});
