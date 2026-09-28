import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PORTUGUESE_BLOG_DRAFTS } from '../src/content/blogPtDrafts.ts';
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
const pt = leaves(dictionaries.pt);
const pages = indexableSeoPages();

function isToken(key: string, value: string) {
  return key.endsWith('.tone') || key.endsWith('.icon') || value.length <= 2;
}

function coverage(pattern: RegExp) {
  const keys = [...en.keys()].filter((key) => pattern.test(key) && !isToken(key, en.get(key) ?? ''));
  const done = keys.filter((key) => pt.get(key) !== en.get(key));
  return { done: done.length, total: keys.length, missing: keys.filter((key) => pt.get(key) === en.get(key)) };
}

describe('Portuguese content with SEO activation', () => {
  it('activates Portuguese URLs without Arabic or a Portuguese privacy policy', () => {
    assert.deepEqual([...URL_LOCALE_PREFIXES], ['fr', 'es', 'de', 'pt', 'it', 'tr', 'ar']);
    assert.equal(hreflangForPath('/compress').some((link) => link.hreflang === 'pt'), true);
    assert.equal(hreflangForPath('/privacy').some((link) => link.hreflang === 'pt'), false);
    assert.equal(pages.some((page) => page.path === '/pt/compress'), true);
    assert.equal(pages.some((page) => page.path === '/pt/privacy'), false);
    const xml = buildSitemap(pages);
    assert.match(xml, /\/pt\/compress/);
    assert.doesNotMatch(xml, /\/pt\/privacy/);
    assert.doesNotMatch(xml, /\/pt\/translate/);
    assert.match(xml, /hreflang="pt"/);
  });

  it('translates Portuguese SEO, FAQ, how-to and tool titles', () => {
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
    assert.equal(dictionaries.pt.compress.title, 'Comprimir PDF');
    assert.equal(dictionaries.pt.merge.title, 'Juntar PDF');
    assert.equal(dictionaries.pt.split.title, 'Dividir PDF');
    assert.equal(dictionaries.pt.rotatePdf.title, 'Girar PDF');
    assert.equal(dictionaries.pt.protect.title, 'Proteger PDF');
    assert.equal(dictionaries.pt.unlockPdf.title, 'Desbloquear PDF');
    assert.equal(dictionaries.pt.tools.pdfToWord, 'PDF para Word');
    assert.equal(dictionaries.pt.tools.wordToPdf, 'Word para PDF');
    assert.equal(dictionaries.pt.tools.jpgToPdf, 'JPG para PDF');
    assert.equal(dictionaries.pt.tools.pdfToJpg, 'PDF para JPG');
    assert.equal(dictionaries.en.compress.seoTitle, 'Compress PDF Online — Smaller Files | One2PDF');
    assert.equal(dictionaries.fr.compress.seoTitle, 'Compresser un PDF en ligne gratuitement | One2PDF');
    assert.equal(dictionaries.es.compress.seoTitle, 'Comprimir PDF en línea gratis | One2PDF');
    assert.equal(dictionaries.de.compress.seoTitle, 'PDF komprimieren | One2PDF');
    assert.equal(dictionaries.de.compress.title, 'PDF komprimieren');
  });

  it('keeps interpolation variables', () => {
    for (const [key, value] of en) {
      if (!value.includes('{') || !pt.has(key)) continue;
      const expected = [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      const actual = [...(pt.get(key) ?? '').matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      assert.equal(actual, expected, key);
    }
  });

  it('publishes the Portuguese blog on Portuguese URLs only', () => {
    assert.equal(PORTUGUESE_BLOG_DRAFTS.length, 2);
    assert.notEqual(getBlogPosts('pt')[0]?.title, getBlogPosts('en')[0]?.title);
    assert.equal(getBlogPosts('en')[0]?.title, 'Online PDFs: how to avoid sending your files to an unknown server');
    assert.equal(pages.some((page) => page.path === '/pt/blog/comprimir-pdf-email'), true);
    assert.equal(pages.some((page) => page.path === '/pt/blog/privacidade-pdf-online'), true);
    assert.equal(pages.some((page) => page.path === '/blog/comprimir-pdf-email'), false);
    assert.equal(JSON.stringify(PORTUGUESE_BLOG_DRAFTS).includes('/pt/privacy'), false);
    assert.equal(JSON.stringify(PORTUGUESE_BLOG_DRAFTS).includes('"/privacy"'), true);
    assert.equal(JSON.stringify(getBlogPosts('en')).includes('/pt/'), false);
    const cluster = hreflangForPath('/blog/reduire-taille-pdf-email');
    assert.equal(cluster.find((link) => link.hreflang === 'pt')?.href, 'https://one2pdf.com/pt/blog/comprimir-pdf-email');
  });

  it('flags the Portuguese privacy policy instead of rewriting it', () => {
    assert.equal(privacyLocalization.pt.status, 'flagged');
    assert.equal(getPrivacyPolicy('pt').title, getPrivacyPolicy('en').title);
    assert.notEqual(dictionaries.pt.legal.privacyTitle, dictionaries.en.legal.privacyTitle);
  });
});
