import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ITALIAN_BLOG_DRAFTS } from '../src/content/blogItDrafts.ts';
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
const itDict = leaves(dictionaries.it);
const pages = indexableSeoPages();

function isToken(key: string, value: string) {
  return key.endsWith('.tone') || key.endsWith('.icon') || value.length <= 2;
}

function coverage(pattern: RegExp) {
  const keys = [...en.keys()].filter((key) => pattern.test(key) && !isToken(key, en.get(key) ?? ''));
  const done = keys.filter((key) => itDict.get(key) !== en.get(key));
  return { done: done.length, total: keys.length, missing: keys.filter((key) => itDict.get(key) === en.get(key)) };
}

describe('Italian content with SEO activation', () => {
  it('activates Italian URLs without Arabic or an Italian privacy policy', () => {
    assert.deepEqual([...URL_LOCALE_PREFIXES], ['fr', 'es', 'de', 'pt', 'it', 'tr', 'ar']);
    assert.equal(hreflangForPath('/compress').some((link) => link.hreflang === 'it'), true);
    assert.equal(hreflangForPath('/privacy').some((link) => link.hreflang === 'it'), false);
    assert.equal(pages.some((page) => page.path === '/it/compress'), true);
    assert.equal(pages.some((page) => page.path === '/it/privacy'), false);
    const xml = buildSitemap(pages);
    assert.match(xml, /\/it\/compress/);
    assert.doesNotMatch(xml, /\/it\/privacy/);
    assert.doesNotMatch(xml, /\/it\/translate/);
    assert.match(xml, /hreflang="it"/);
  });

  it('translates Italian SEO, FAQ, how-to and tool titles', () => {
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
    assert.equal(dictionaries.it.compress.title, 'Comprimere PDF');
    assert.equal(dictionaries.it.merge.title, 'Unire PDF');
    assert.equal(dictionaries.it.split.title, 'Dividere PDF');
    assert.equal(dictionaries.it.rotatePdf.title, 'Ruotare PDF');
    assert.equal(dictionaries.it.protect.title, 'Proteggere PDF');
    assert.equal(dictionaries.it.unlockPdf.title, 'Sbloccare PDF');
    assert.equal(dictionaries.it.tools.pdfToWord, 'PDF in Word');
    assert.equal(dictionaries.it.tools.wordToPdf, 'Word in PDF');
    assert.equal(dictionaries.it.tools.jpgToPdf, 'JPG in PDF');
    assert.equal(dictionaries.it.tools.pdfToJpg, 'PDF in JPG');
    assert.equal(dictionaries.en.compress.seoTitle, 'Compress PDF Online — Smaller Files | One2PDF');
    assert.equal(dictionaries.fr.compress.seoTitle, 'Compresser un PDF en ligne gratuitement | One2PDF');
    assert.equal(dictionaries.es.compress.seoTitle, 'Comprimir PDF en línea gratis | One2PDF');
    assert.equal(dictionaries.de.compress.seoTitle, 'PDF komprimieren | One2PDF');
    assert.equal(dictionaries.pt.compress.seoTitle, 'Comprimir PDF online | One2PDF');
  });

  it('keeps interpolation variables', () => {
    for (const [key, value] of en) {
      if (!value.includes('{') || !itDict.has(key)) continue;
      const expected = [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      const actual = [...(itDict.get(key) ?? '').matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      assert.equal(actual, expected, key);
    }
  });

  it('publishes the Italian blog on Italian URLs only', () => {
    assert.equal(ITALIAN_BLOG_DRAFTS.length, 2);
    assert.notEqual(getBlogPosts('it')[0]?.title, getBlogPosts('en')[0]?.title);
    assert.equal(getBlogPosts('en')[0]?.title, 'Online PDFs: how to avoid sending your files to an unknown server');
    assert.equal(pages.some((page) => page.path === '/it/blog/comprimere-pdf-email'), true);
    assert.equal(pages.some((page) => page.path === '/it/blog/privacy-pdf-online'), true);
    assert.equal(pages.some((page) => page.path === '/blog/comprimere-pdf-email'), false);
    assert.equal(JSON.stringify(ITALIAN_BLOG_DRAFTS).includes('/it/privacy'), false);
    assert.equal(JSON.stringify(ITALIAN_BLOG_DRAFTS).includes('"/privacy"'), true);
    assert.equal(JSON.stringify(getBlogPosts('en')).includes('/it/'), false);
    const cluster = hreflangForPath('/blog/reduire-taille-pdf-email');
    assert.equal(cluster.find((link) => link.hreflang === 'it')?.href, 'https://one2pdf.com/it/blog/comprimere-pdf-email');
  });

  it('flags the Italian privacy policy instead of rewriting it', () => {
    assert.equal(privacyLocalization.it.status, 'flagged');
    assert.equal(getPrivacyPolicy('it').title, getPrivacyPolicy('en').title);
    assert.notEqual(dictionaries.it.legal.privacyTitle, dictionaries.en.legal.privacyTitle);
  });
});
