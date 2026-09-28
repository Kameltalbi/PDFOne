import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GERMAN_BLOG_DRAFTS } from '../src/content/blogDeDrafts.ts';
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
const de = leaves(dictionaries.de);
const pages = indexableSeoPages();

function isToken(key: string, value: string) {
  return key.endsWith('.tone') || key.endsWith('.icon') || value.length <= 2;
}

function coverage(pattern: RegExp) {
  const keys = [...en.keys()].filter((key) => pattern.test(key) && !isToken(key, en.get(key) ?? ''));
  const done = keys.filter((key) => de.get(key) !== en.get(key));
  return { done: done.length, total: keys.length };
}

describe('German content without SEO activation', () => {
  it('activates German URLs without other languages or a German privacy policy', () => {
    assert.deepEqual([...URL_LOCALE_PREFIXES], ['fr', 'es', 'de', 'pt', 'it', 'tr', 'ar']);
    assert.equal(hreflangForPath('/compress').some((link) => link.hreflang === 'de'), true);
    assert.equal(hreflangForPath('/privacy').some((link) => link.hreflang === 'de'), false);
    assert.equal(pages.some((page) => page.path === '/de/compress'), true);
    assert.equal(pages.some((page) => page.path === '/de/privacy'), false);
    const xml = buildSitemap(pages);
    assert.match(xml, /\/de\/compress/);
    assert.doesNotMatch(xml, /\/de\/privacy/);
    assert.doesNotMatch(xml, /\/de\/translate/);
  });

  it('translates German SEO, FAQ, how-to and tool titles', () => {
    for (const [name, pattern] of [
      ['seo titles', /seoTitle$/],
      ['meta descriptions', /seoDescription$/],
      ['long copy', /seoH2$|seoP[123]$/],
      ['faq', /faqTitle$|faq\[/],
      ['how-to', /howTitle$|howSteps\[/]
    ] as const) {
      const result = coverage(pattern);
      assert.equal(result.done, result.total, `${name} ${result.done}/${result.total}`);
    }
    assert.equal(dictionaries.de.compress.title, 'PDF komprimieren');
    assert.equal(dictionaries.de.merge.title, 'PDF zusammenfügen');
    assert.equal(dictionaries.de.split.title, 'PDF teilen');
    assert.equal(dictionaries.de.rotatePdf.title, 'PDF drehen');
    assert.equal(dictionaries.de.protect.title, 'PDF schützen');
    assert.equal(dictionaries.de.unlockPdf.title, 'PDF entsperren');
    assert.equal(dictionaries.de.tools.pdfToWord, 'PDF in Word');
    assert.equal(dictionaries.de.tools.wordToPdf, 'Word in PDF');
    assert.equal(dictionaries.de.tools.jpgToPdf, 'JPG in PDF');
    assert.equal(dictionaries.de.tools.pdfToJpg, 'PDF in JPG');
    assert.notEqual(dictionaries.de.compress.seoTitle, dictionaries.en.compress.seoTitle);
    assert.notEqual(dictionaries.es.compress.seoTitle, dictionaries.de.compress.seoTitle);
    assert.equal(dictionaries.en.compress.seoTitle, 'Compress PDF Online — Smaller Files | One2PDF');
    assert.equal(dictionaries.fr.compress.seoTitle, 'Compresser un PDF en ligne gratuitement | One2PDF');
    assert.equal(dictionaries.es.compress.seoTitle, 'Comprimir PDF en línea gratis | One2PDF');
  });

  it('keeps interpolation variables', () => {
    for (const [key, value] of en) {
      if (!value.includes('{') || !de.has(key)) continue;
      const expected = [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      const actual = [...(de.get(key) ?? '').matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      assert.equal(actual, expected, key);
    }
  });

  it('publishes the German blog drafts on German URLs only', () => {
    assert.equal(GERMAN_BLOG_DRAFTS.length, 2);
    assert.notEqual(getBlogPosts('de')[0]?.title, getBlogPosts('en')[0]?.title);
    assert.equal(getBlogPosts('en')[0]?.title, 'Online PDFs: how to avoid sending your files to an unknown server');
    assert.equal(pages.some((page) => page.path === '/de/blog/pdf-fuer-e-mail-verkleinern'), true);
    assert.equal(pages.some((page) => page.path === '/de/blog/datenschutz-pdf-online'), true);
    assert.equal(pages.some((page) => page.path === '/blog/pdf-fuer-e-mail-verkleinern'), false);
    assert.equal(JSON.stringify(GERMAN_BLOG_DRAFTS).includes('/de/privacy'), false);
    assert.equal(JSON.stringify(GERMAN_BLOG_DRAFTS).includes('"/privacy"'), true);
    const cluster = hreflangForPath('/blog/reduire-taille-pdf-email');
    assert.equal(cluster.find((link) => link.hreflang === 'de')?.href, 'https://one2pdf.com/de/blog/pdf-fuer-e-mail-verkleinern');
  });

  it('flags the German privacy policy instead of rewriting it', () => {
    assert.equal(privacyLocalization.de.status, 'flagged');
    assert.equal(getPrivacyPolicy('de').title, getPrivacyPolicy('en').title);
    assert.notEqual(dictionaries.de.legal.privacyTitle, dictionaries.en.legal.privacyTitle);
  });
});
