import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ARABIC_BLOG_DRAFTS } from '../src/content/blogArDrafts.ts';
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
const ar = leaves(dictionaries.ar);
const pages = indexableSeoPages();

function isToken(key: string, value: string) {
  return key.endsWith('.tone') || key.endsWith('.icon') || value.length <= 2;
}

function coverage(pattern: RegExp) {
  const keys = [...en.keys()].filter((key) => pattern.test(key) && !isToken(key, en.get(key) ?? ''));
  const done = keys.filter((key) => ar.get(key) !== en.get(key));
  return { done: done.length, total: keys.length, missing: keys.filter((key) => ar.get(key) === en.get(key)) };
}

describe('Arabic content with SEO activation', () => {
  it('activates Arabic URLs without an Arabic privacy policy', () => {
    assert.deepEqual([...URL_LOCALE_PREFIXES], ['fr', 'es', 'de', 'pt', 'it', 'tr', 'ar']);
    assert.equal(hreflangForPath('/compress').some((link) => link.hreflang === 'ar'), true);
    assert.equal(hreflangForPath('/privacy').some((link) => link.hreflang === 'ar'), false);
    assert.equal(pages.some((page) => page.path === '/ar' || page.path.startsWith('/ar/')), true);
    assert.equal(pages.some((page) => page.path === '/ar/compress'), true);
    assert.equal(pages.some((page) => page.path === '/ar/privacy'), false);
    const xml = buildSitemap(pages);
    assert.match(xml, /\/ar\/compress/);
    assert.doesNotMatch(xml, /\/ar\/privacy/);
    assert.doesNotMatch(xml, /\/ar\/translate/);
    assert.match(xml, /hreflang="ar"/);
  });

  it('translates Arabic SEO, FAQ and how-to copy', () => {
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
    assert.equal(dictionaries.en.compress.seoTitle, 'Compress PDF Online — Smaller Files | One2PDF');
    assert.equal(dictionaries.fr.compress.seoTitle, 'Compresser un PDF en ligne gratuitement | One2PDF');
    assert.equal(dictionaries.es.compress.seoTitle, 'Comprimir PDF en línea gratis | One2PDF');
    assert.equal(dictionaries.de.compress.seoTitle, 'PDF komprimieren | One2PDF');
    assert.equal(dictionaries.pt.compress.seoTitle, 'Comprimir PDF online | One2PDF');
    assert.equal(dictionaries.it.compress.seoTitle, 'Comprimere PDF online | One2PDF');
    assert.equal(dictionaries.tr.compress.seoTitle, 'PDF Sıkıştır | One2PDF');
    assert.notEqual(dictionaries.ar.compress.seoTitle, dictionaries.en.compress.seoTitle);
  });

  it('keeps interpolation variables', () => {
    for (const [key, value] of en) {
      if (!value.includes('{') || !ar.has(key)) continue;
      const expected = [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      const actual = [...(ar.get(key) ?? '').matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      assert.equal(actual, expected, key);
    }
  });

  it('publishes the Arabic blog on Arabic URLs only', () => {
    assert.equal(ARABIC_BLOG_DRAFTS.length, 2);
    assert.notEqual(getBlogPosts('ar')[0]?.title, getBlogPosts('en')[0]?.title);
    assert.equal(getBlogPosts('en')[0]?.title, 'Online PDFs: how to avoid sending your files to an unknown server');
    assert.equal(pages.some((page) => page.path === '/ar/blog/daght-pdf-barid'), true);
    assert.equal(pages.some((page) => page.path === '/ar/blog/khususiyat-pdf'), true);
    assert.equal(pages.some((page) => page.path === '/blog/daght-pdf-barid'), false);
    assert.equal(JSON.stringify(ARABIC_BLOG_DRAFTS).includes('/ar/privacy'), false);
    assert.equal(JSON.stringify(ARABIC_BLOG_DRAFTS).includes('"/privacy"'), true);
    assert.equal(JSON.stringify(getBlogPosts('en')).includes('/ar/'), false);
    const cluster = hreflangForPath('/blog/reduire-taille-pdf-email');
    assert.equal(cluster.find((link) => link.hreflang === 'ar')?.href, 'https://one2pdf.com/ar/blog/daght-pdf-barid');
  });

  it('flags the Arabic privacy policy instead of rewriting it', () => {
    assert.equal(privacyLocalization.ar.status, 'flagged');
    assert.equal(getPrivacyPolicy('ar').title, getPrivacyPolicy('en').title);
    assert.notEqual(dictionaries.ar.legal.privacyTitle, dictionaries.en.legal.privacyTitle);
  });
});
