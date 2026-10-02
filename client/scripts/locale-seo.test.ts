import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getBlogPosts } from '../src/content/blog.ts';
import { ENGLISH_CMS_SLUGS } from '../src/content/blogCmsEn.ts';
import { localizedPath, stripLocalePrefix, switchLocalePath, urlLocaleFromPath } from '../src/i18n/localePath.ts';
import { hreflangForPath, switchBlogLocalePath } from '../src/lib/hreflang.ts';
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
    assert.equal(localizedPath('/compress', 'de'), '/de/compress');
    assert.equal(localizedPath('/privacy', 'de'), '/privacy');
    assert.equal(switchLocalePath('/de/compress', 'en'), '/compress');
    assert.equal(switchLocalePath('/fr/compress', 'de'), '/de/compress');
    assert.equal(switchLocalePath('/es/merge', 'de'), '/de/merge');
    assert.equal(localizedPath('/compress', 'pt'), '/pt/compress');
    assert.equal(localizedPath('/privacy', 'pt'), '/privacy');
    assert.equal(switchLocalePath('/pt/compress', 'en'), '/compress');
    assert.equal(switchLocalePath('/de/compress', 'pt'), '/pt/compress');
    assert.equal(localizedPath('/compress', 'it'), '/it/compress');
    assert.equal(localizedPath('/privacy', 'it'), '/privacy');
    assert.equal(switchLocalePath('/it/compress', 'en'), '/compress');
    assert.equal(switchLocalePath('/pt/compress', 'it'), '/it/compress');
    assert.equal(localizedPath('/compress', 'tr'), '/tr/compress');
    assert.equal(localizedPath('/privacy', 'tr'), '/privacy');
    assert.equal(switchLocalePath('/tr/compress', 'en'), '/compress');
    assert.equal(switchLocalePath('/it/compress', 'tr'), '/tr/compress');
    assert.equal(localizedPath('/compress', 'ar'), '/ar/compress');
    assert.equal(localizedPath('/privacy', 'ar'), '/privacy');
    assert.equal(switchLocalePath('/ar/compress', 'en'), '/compress');
    assert.equal(switchLocalePath('/tr/compress', 'ar'), '/ar/compress');
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
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'de')?.href, 'https://one2pdf.com/de' + stripLocalePrefix(path));
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'pt')?.href, 'https://one2pdf.com/pt' + stripLocalePrefix(path));
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'it')?.href, 'https://one2pdf.com/it' + stripLocalePrefix(path));
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'tr')?.href, 'https://one2pdf.com/tr' + stripLocalePrefix(path));
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'ar')?.href, 'https://one2pdf.com/ar' + stripLocalePrefix(path));
      assert.equal(item.alternates.find((alt) => alt.hreflang === 'x-default')?.href, 'https://one2pdf.com' + stripLocalePrefix(path));
    }
    assert.deepEqual(page('/compress').alternates, page('/fr/compress').alternates);
    assert.deepEqual(page('/compress').alternates, page('/es/compress').alternates);
    assert.deepEqual(page('/compress').alternates, page('/de/compress').alternates);
    assert.deepEqual(page('/compress').alternates, page('/pt/compress').alternates);
    assert.deepEqual(page('/compress').alternates, page('/it/compress').alternates);
    assert.deepEqual(page('/compress').alternates, page('/tr/compress').alternates);
    assert.deepEqual(page('/compress').alternates, page('/ar/compress').alternates);
    assert.deepEqual(page('/rotate').alternates, page('/fr/rotate').alternates);
    assert.deepEqual(page('/rotate').alternates, page('/es/rotate').alternates);
    assert.equal(page('/es/compress').locale, 'es');
    assert.equal(pageUrl(page('/es/compress').path), 'https://one2pdf.com/es/compress');
    assert.equal(page('/privacy').alternates.some((alt) => alt.hreflang === 'es'), false);
    assert.equal(page('/privacy').alternates.some((alt) => alt.hreflang === 'de'), false);
    assert.equal(page('/privacy').alternates.some((alt) => alt.hreflang === 'pt'), false);
    assert.equal(page('/privacy').alternates.some((alt) => alt.hreflang === 'it'), false);
    assert.equal(page('/privacy').alternates.some((alt) => alt.hreflang === 'tr'), false);
    assert.equal(page('/privacy').alternates.some((alt) => alt.hreflang === 'ar'), false);
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
    assert.doesNotMatch(english, /href="\/de\//);
    assert.doesNotMatch(english, /href="\/pt\//);
    assert.doesNotMatch(english, /href="\/it\//);
    assert.doesNotMatch(english, /href="\/tr\//);
    assert.doesNotMatch(english, /href="\/ar\//);
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
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/de\/compress<\/loc>/);
    assert.match(xml, /hreflang="de" href="https:\/\/one2pdf.com\/de\/compress"/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/de\/blog\/pdf-fuer-e-mail-verkleinern<\/loc>/);
    assert.doesNotMatch(xml, /\/de\/privacy/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/pt\/compress<\/loc>/);
    assert.match(xml, /hreflang="pt" href="https:\/\/one2pdf.com\/pt\/compress"/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/pt\/blog\/comprimir-pdf-email<\/loc>/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/pt\/blog\/privacidade-pdf-online<\/loc>/);
    assert.doesNotMatch(xml, /\/pt\/privacy/);
    assert.doesNotMatch(xml, /\/pt\/translate/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/it\/compress<\/loc>/);
    assert.match(xml, /hreflang="it" href="https:\/\/one2pdf.com\/it\/compress"/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/it\/blog\/comprimere-pdf-email<\/loc>/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/it\/blog\/privacy-pdf-online<\/loc>/);
    assert.doesNotMatch(xml, /\/it\/privacy/);
    assert.doesNotMatch(xml, /\/it\/translate/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/tr\/compress<\/loc>/);
    assert.match(xml, /hreflang="tr" href="https:\/\/one2pdf.com\/tr\/compress"/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/tr\/blog\/pdf-eposta-sikistir<\/loc>/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/tr\/blog\/gizlilik-pdf-online<\/loc>/);
    assert.doesNotMatch(xml, /\/tr\/privacy/);
    assert.doesNotMatch(xml, /\/tr\/translate/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/ar\/compress<\/loc>/);
    assert.match(xml, /hreflang="ar" href="https:\/\/one2pdf.com\/ar\/compress"/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/ar\/blog\/daght-pdf-barid<\/loc>/);
    assert.match(xml, /<loc>https:\/\/one2pdf.com\/ar\/blog\/khususiyat-pdf<\/loc>/);
    assert.doesNotMatch(xml, /\/ar\/privacy/);
    assert.doesNotMatch(xml, /\/ar\/translate/);
    assert.doesNotMatch(xml, /\/en\/compress/);
    assert.doesNotMatch(xml, /\/translate</);
    assert.doesNotMatch(xml, /png-to-pdf/);
    assert.doesNotMatch(xml, /\/login</);
  });

  it('adds the seven English CMS articles and no translated copies', () => {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    assert.equal(locs.length, 337);
    for (const slug of ENGLISH_CMS_SLUGS) {
      const url = `https://one2pdf.com/blog/${slug}`;
      assert.equal(locs.filter((loc) => loc === url).length, 1);
      for (const prefix of ['fr', 'es', 'de', 'pt', 'it', 'tr', 'ar']) {
        assert.equal(locs.some((loc) => loc === `https://one2pdf.com/${prefix}/blog/${slug}`), false);
      }
      const article = page(`/blog/${slug}`);
      assert.equal(article.alternates.some((alt) => alt.hreflang === 'fr'), false);
      assert.equal(article.alternates.find((alt) => alt.hreflang === 'en')?.href, url);
      assert.equal(article.robots ?? 'index, follow', 'index, follow');
      const html = seoArticleHtml(article);
      assert.ok(html.includes(`<h1>${article.h1.replaceAll('&', '&amp;')}</h1>`));
      assert.doesNotMatch(html, /Suggested slug/i);
      assert.doesNotMatch(html, /how-to-rotate-pdf-permanently(?!-online)/);
    }
    const blog = seoArticleHtml(page('/blog'));
    for (const slug of ENGLISH_CMS_SLUGS) {
      assert.match(blog, new RegExp(`href="/blog/${slug}"`));
    }
    assert.match(blog, /href="\/blog\/confidentialite-pdf-en-ligne"/);
    assert.match(blog, /href="\/blog\/reduire-taille-pdf-email"/);
    const rotate = seoArticleHtml(page('/rotate'));
    assert.match(rotate, /<h1>Rotate PDF<\/h1>/);
    assert.match(rotate, /<h2>Related guides<\/h2>/);
    for (const slug of [
      'how-to-rotate-a-pdf-permanently-online',
      'rotate-scanned-pdf-save-permanently',
      'pdf-opens-sideways-how-to-fix-page-orientation-permanently',
      'how-to-rotate-one-page-in-a-pdf-one2pdf'
    ]) {
      assert.match(rotate, new RegExp(`href="/blog/${slug}"`));
    }
    assert.doesNotMatch(seoArticleHtml(page('/fr/rotate')), /Related guides/);
    const rotateArticles = [
      'how-to-rotate-a-pdf-permanently-online',
      'rotate-scanned-pdf-save-permanently',
      'pdf-opens-sideways-how-to-fix-page-orientation-permanently',
      'how-to-rotate-one-page-in-a-pdf-one2pdf'
    ];
    for (const slug of rotateArticles) {
      const html = seoArticleHtml(page(`/blog/${slug}`));
      assert.equal(html.match(/href="\/rotate"/g)?.length, 2);
    }
  });

  it('keeps each blog index in its own language and switches only to a real translation', () => {
    for (const locale of ['fr', 'es', 'de', 'pt', 'it', 'tr', 'ar'] as const) {
      for (const slug of ENGLISH_CMS_SLUGS) {
        assert.equal(getBlogPosts(locale).some((post) => post.slug === slug), false);
      }
    }
    assert.match(seoArticleHtml(page('/blog')), /how-to-rotate-a-pdf-permanently-online/);
    for (const path of ['/fr/blog', '/es/blog', '/de/blog']) {
      assert.doesNotMatch(seoArticleHtml(page(path)), /how-to-rotate-a-pdf-permanently-online/);
    }
    assert.equal(switchBlogLocalePath('/blog', 'en'), '/blog');
    assert.equal(switchBlogLocalePath('/blog', 'fr'), '/fr/blog');
    assert.equal(switchBlogLocalePath('/blog', 'es'), '/es/blog');
    assert.equal(switchBlogLocalePath('/blog', 'de'), '/de/blog');
    assert.equal(switchBlogLocalePath('/blog/how-to-rotate-a-pdf-permanently-online', 'fr'), '/fr/blog');
    assert.equal(switchBlogLocalePath('/blog/how-to-rotate-a-pdf-permanently-online', 'es'), '/es/blog');
    assert.equal(switchBlogLocalePath('/blog/how-to-rotate-a-pdf-permanently-online', 'de'), '/de/blog');
    assert.equal(switchBlogLocalePath('/blog/reduire-taille-pdf-email', 'es'), '/es/blog/comprimir-pdf-correo');
    assert.equal(switchBlogLocalePath('/es/blog/comprimir-pdf-correo', 'fr'), '/fr/blog/reduire-taille-pdf-email');
    assert.equal(switchBlogLocalePath('/blog/reduire-taille-pdf-email', 'de'), '/de/blog/pdf-fuer-e-mail-verkleinern');
    assert.equal(switchBlogLocalePath('/rotate', 'fr'), null);
  });
});
