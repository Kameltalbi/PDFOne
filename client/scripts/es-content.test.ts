import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SPANISH_BLOG_DRAFTS } from '../src/content/blogEsDrafts.ts';
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
const es = leaves(dictionaries.es);
const pages = indexableSeoPages();

function coverage(pattern: RegExp) {
  const keys = [...en.keys()].filter((key) => pattern.test(key) && !isToken(key, en.get(key) ?? ''));
  const done = keys.filter((key) => es.get(key) !== en.get(key));
  return { done: done.length, total: keys.length };
}

function isToken(key: string, value: string) {
  return key.endsWith('.tone') || key.endsWith('.icon') || value.length <= 2;
}

describe('Spanish content without SEO activation', () => {
  it('keeps English and French compress and rotate metadata', () => {
    const compress = pages.find((page) => page.path === '/compress');
    const frenchCompress = pages.find((page) => page.path === '/fr/compress');
    const rotate = pages.find((page) => page.path === '/rotate');
    const frenchRotate = pages.find((page) => page.path === '/fr/rotate');
    assert.equal(compress?.title, 'Compress PDF Online — Smaller Files | One2PDF');
    assert.equal(compress?.h1, 'Compress PDF');
    assert.equal(frenchCompress?.title, 'Compresser un PDF en ligne gratuitement | One2PDF');
    assert.equal(frenchCompress?.h1, 'Compresser un PDF en ligne');
    assert.equal(rotate?.title, 'Rotate PDF Pages Online Free | One2PDF');
    assert.equal(rotate?.h1, 'Rotate PDF');
    assert.equal(frenchRotate?.title, 'Tourner un PDF en ligne gratuitement | One2PDF');
    assert.equal(frenchRotate?.h1, 'Tourner un PDF en ligne');
  });

  it('activates Spanish URLs without other languages or a Spanish privacy policy', () => {
    assert.deepEqual([...URL_LOCALE_PREFIXES], ['fr', 'es', 'de']);
    assert.equal(hreflangForPath('/compress').some((link) => link.hreflang === 'es'), true);
    assert.equal(hreflangForPath('/privacy').some((link) => link.hreflang === 'es'), false);
    assert.equal(pages.some((page) => page.path === '/es/compress'), true);
    assert.equal(pages.some((page) => page.path === '/es/privacy'), false);
    assert.equal(pages.some((page) => /^\/(pt|it|ar|tr)\//.test(page.path)), false);
    const xml = buildSitemap(pages);
    assert.match(xml, /\/es\/compress/);
    assert.doesNotMatch(xml, /\/es\/privacy/);
  });

  it('translates Spanish SEO, FAQ, how-to and tool titles', () => {
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
    assert.notEqual(dictionaries.es.compress.seoTitle, dictionaries.en.compress.seoTitle);
    assert.notEqual(dictionaries.es.compress.faq[0]?.question, dictionaries.en.compress.faq[0]?.question);
    assert.equal(dictionaries.es.compress.title, 'Comprimir PDF');
    assert.equal(dictionaries.es.merge.title, 'Unir PDF');
    assert.equal(dictionaries.es.rotatePdf.title, 'Girar PDF');
  });

  it('does not treat inherited English SEO as translated', () => {
    assert.equal(dictionaries.es.compress.seoTitle.includes('Compress PDF Online'), false);
    assert.equal(es.get('compress.seoP1') === en.get('compress.seoP1'), false);
  });

  it('keeps interpolation variables', () => {
    for (const [key, value] of en) {
      if (!value.includes('{') || !es.has(key)) continue;
      const expected = [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      const actual = [...(es.get(key) ?? '').matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
      assert.equal(actual, expected, key);
    }
  });

  it('publishes the Spanish blog drafts on Spanish URLs only', () => {
    assert.equal(SPANISH_BLOG_DRAFTS.length, 2);
    assert.notEqual(getBlogPosts('es')[0]?.title, getBlogPosts('en')[0]?.title);
    assert.equal(getBlogPosts('en')[0]?.title, 'Online PDFs: how to avoid sending your files to an unknown server');
    assert.equal(getBlogPosts('fr')[0]?.title, 'PDF en ligne : comment éviter d’envoyer vos fichiers à un serveur inconnu');
    assert.equal(pages.some((page) => page.path === '/es/blog/comprimir-pdf-correo'), true);
    assert.equal(pages.some((page) => page.path === '/es/blog/privacidad-pdf-en-linea'), true);
    assert.equal(pages.some((page) => page.path === '/blog/comprimir-pdf-correo'), false);
    const privacy = SPANISH_BLOG_DRAFTS.find((post) => post.slug === 'privacidad-pdf-en-linea');
    assert.equal(JSON.stringify(privacy).includes('/es/privacy'), false);
    assert.equal(JSON.stringify(privacy).includes('"/privacy"'), true);
    const cluster = hreflangForPath('/blog/reduire-taille-pdf-email');
    assert.equal(cluster.find((link) => link.hreflang === 'es')?.href, 'https://one2pdf.com/es/blog/comprimir-pdf-correo');
  });

  it('flags the Spanish privacy policy instead of rewriting it', () => {
    assert.equal(privacyLocalization.es.status, 'flagged');
    assert.equal(getPrivacyPolicy('es').title, getPrivacyPolicy('en').title);
    assert.notEqual(getPrivacyPolicy('fr').title, getPrivacyPolicy('en').title);
    assert.notEqual(dictionaries.es.legal.privacyTitle, dictionaries.en.legal.privacyTitle);
  });
});
