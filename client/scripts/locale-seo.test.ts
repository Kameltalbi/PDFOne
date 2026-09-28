import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { localizedPath, stripLocalePrefix, switchLocalePath, urlLocaleFromPath } from '../src/i18n/localePath.ts';
import { hreflangForPath } from '../src/lib/hreflang.ts';
import { pageUrl } from '../src/lib/jsonLd.ts';
import { seoArticleHtml, indexableSeoPages } from '../src/lib/seoPages.ts';
import { buildSitemap } from '../src/lib/sitemap.ts';

const pages = indexableSeoPages();

function page(path: string) {
  const found = pages.find((item) => item.path === path);
  assert.ok(found, `missing ${path}`);
  return found;
}

describe('locale paths', () => {
  it('keeps English URLs unprefixed and prefixes French', () => {
    assert.equal(localizedPath('/compress', 'en'), '/compress');
    assert.equal(localizedPath('/compress', 'fr'), '/fr/compress');
    assert.equal(localizedPath('/', 'fr'), '/fr');
    assert.equal(localizedPath('/fr/compress', 'fr'), '/fr/compress');
    assert.equal(localizedPath('/compress', 'es'), '/es/compress');
    assert.equal(localizedPath('/privacy', 'es'), '/privacy');
    assert.equal(localizedPath('/jpg-to-pdf', 'es'), '/es/jpg-to-pdf');
    assert.equal(switchLocalePath('/es/compress', 'en'), '/compress');
    assert.equal(switchLocalePath('/es/compress', 'fr'), '/fr/compress');
    assert.equal(switchLocalePath('/fr/compress', 'es'), '/es/compress');
    assert.equal(urlLocaleFromPath('/es/png-to-pdf'), 'es');
    assert.equal(switchLocalePath('/fr/rotate', 'en'), '/rotate');
    assert.equal(switchLocalePath('/rotate', 'fr'), '/fr/rotate');
    assert.equal(urlLocaleFromPath('/fr/compress'), 'fr');
    assert.equal(urlLocaleFromPath('/compress'), 'en');
    assert.equal(stripLocalePrefix('/fr'), '/');
  });
});

describe('indexable EN/FR pages', () => {
  it('does not create /en/ URLs', () => {
    assert.equal(pages.some((item) => item.path.startsWith('/en/')), false);
  });

  it('self-canonicalizes compress and rotate in both languages', () => {
    for (const path of ['/compress', '/fr/compress', '/rotate', '/fr/rotate']) {
      const item = page(path);
      assert.equal(pageUrl(item.path), `https://one2pdf.com${path}`);
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'en')?.href, 'https://one2pdf.com' + stripLocalePrefix(path));
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'fr')?.href, 'https://one2pdf.com/fr' + stripLocalePrefix(path));
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'es')?.href, 'https://one2pdf.com/es' + stripLocalePrefix(path));
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'x-default')?.href, 'https://one2pdf.com' + stripLocalePrefix(path));
    }
    assert.deepEqual(page('/compress').alternates, page('/fr/compress').alternates);
    assert.deepEqual(page('/compress').alternates, page('/es/compress').alternates);
    assert.deepEqual(page('/rotate').alternates, page('/fr/rotate').alternates);
    assert.deepEqual(page('/rotate').alternates, page('/es/rotate').alternates);
    assert.equal(page('/es/compress').locale, 'es');
    assert.equal(pageUrl(page('/es/compress').path), 'https://one2pdf.com/es/compress');
    assert.equal(page('/privacy').alternates.some((alt) => alt.hreflang === 'es'), false);
  });

  it('keeps the existing English metadata and uses French search wording', () => {
    const compress = page('/compress');
    const frenchCompress = page('/fr/compress');
    assert.equal(compress.locale, 'en');
    assert.equal(compress.title, 'Compress PDF Online — Smaller Files | One2PDF');
    assert.equal(compress.h1, 'Compress PDF');
    assert.equal(frenchCompress.locale, 'fr');
    assert.equal(frenchCompress.title, 'Compresser un PDF en ligne gratuitement | One2PDF');
    assert.equal(frenchCompress.h1, 'Compresser un PDF en ligne');

    const rotate = page('/rotate');
    const frenchRotate = page('/fr/rotate');
    assert.equal(rotate.title, 'Rotate PDF Pages Online Free | One2PDF');
    assert.equal(rotate.h1, 'Rotate PDF');
    assert.equal(frenchRotate.title, 'Tourner un PDF en ligne gratuitement | One2PDF');
    assert.equal(frenchRotate.h1, 'Tourner un PDF en ligne');
  });

  it('links each language only to itself', () => {
    const english = seoArticleHtml(page('/compress'));
    const french = seoArticleHtml(page('/fr/compress'));
    const spanish = seoArticleHtml(page('/es/compress'));
    assert.match(english, /href="\/merge"/);
    assert.doesNotMatch(english, /href="\/fr\//);
    assert.doesNotMatch(english, /href="\/es\//);
    assert.match(french, /href="\/fr\/merge"/);
    assert.match(french, /href="\/fr\/split"/);
    assert.doesNotMatch(french, /href="\/merge"/);
    assert.match(seoArticleHtml(page('/fr/rotate')), /href="\/fr\/compress"/);
    assert.match(seoArticleHtml(page('/rotate')), /href="\/compress"/);
    assert.match(spanish, /href="\/es\/merge"/);
    assert.match(spanish, /href="\/es\/split"/);
    assert.match(spanish, /href="\/es\/pdf-to-word"/);
    assert.match(spanish, /href="\/es\/protect"/);
    assert.doesNotMatch(spanish, /href="\/merge"/);
    assert.equal(page('/es/compress').title, 'Comprimir PDF en línea gratis | One2PDF');
    assert.equal(page('/es/compress').h1, 'Comprimir PDF');
    assert.equal(page('/es/rotate').title, 'Girar PDF en línea gratis | One2PDF');
    assert.equal(page('/es/merge').h1, 'Unir PDF');
  });

  it('adds French blog URLs only when a French article exists', () => {
    const slug = '/blog/reduire-taille-pdf-email';
    const english = page(slug);
    const french = page(`/fr${slug}`);
    assert.equal(english.alternates.some((alt) => alt.hreflang === 'fr'), true);
    assert.equal(french.alternates.some((alt) => alt.hreflang === 'en'), true);
    assert.equal(hreflangForPath(slug).some((alt) => alt.href.endsWith(`/fr${slug}`)), true);
  });
});

describe('sitemap', () => {
  const xml = buildSitemap(pages);

  it('lists English and French canonicals and skips noindex aliases', () => {
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/compress<\/loc>/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/fr\/compress<\/loc>/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/rotate<\/loc>/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/fr\/rotate<\/loc>/);
    assert.match(xml, /hreflang="fr" href="https:\/\/one2pdf.com\/fr\/compress"/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/es\/compress<\/loc>/);
    assert.match(xml, /hreflang="es" href="https:\/\/one2pdf.com\/es\/compress"/);
    assert.match(xml, /hreflang="x-default" href="https:\/\/one2pdf.com\/compress"/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/es\/blog\/comprimir-pdf-correo<\/loc>/);
    assert.doesNotMatch(xml, /\/es\/privacy/);
    assert.doesNotMatch(xml, /\/en\/compress/);
    assert.doesNotMatch(xml, /\/de\//);
    assert.doesNotMatch(xml, /\/pt\//);
    assert.doesNotMatch(xml, /\/it\//);
    assert.doesNotMatch(xml, /\/ar\//);
    assert.doesNotMatch(xml, /\/tr\//);
    assert.doesNotMatch(xml, /\/translate</);
    assert.doesNotMatch(xml, /png-to-pdf/);
    assert.doesNotMatch(xml, /\/login</);
  });
});
