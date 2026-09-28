import { getBlogPosts, type BlogBlock, type BlogPost, type InlinePart } from '../content/blog';
import { getPrivacyPolicy } from '../content/privacyPolicy';
import { dictionaries } from '../i18n/dictionaries';
import { localizedPath, SEO_LOCALES, stripLocalePrefix, type UrlLocale } from '../i18n/localePath';
import { interpolate, type Messages, type PageSeoCopy } from '../i18n/types';
import { hreflangForPath, type HreflangLink } from './hreflang';
import { faqPageJsonLd, pageUrl, websiteJsonLd } from './jsonLd';
import { relatedToolLinks } from './relatedTools';

export type SeoPrerenderPage = {
  path: string;
  locale: UrlLocale;
  title: string;
  description: string;
  h1: string;
  lead?: string;
  copy?: PageSeoCopy;
  jsonLdId?: string;
  jsonLd?: object;
  robots?: string;
  articleHtml?: string;
  alternates: HreflangLink[];
  featuresTitle?: string;
  features?: { title: string; text: string }[];
  relatedTitle?: string;
  related?: { href: string; label: string }[];
};

const PUBLIC_LOCALES: UrlLocale[] = [...SEO_LOCALES];

function usd(cents: number) {
  return `$${(Math.max(0, cents) / 100).toFixed(2)}`;
}

function faqLd(id: string, copy: PageSeoCopy, path: string): Pick<SeoPrerenderPage, 'jsonLdId' | 'jsonLd'> {
  if (!copy.faq?.length) return {};
  return { jsonLdId: id, jsonLd: faqPageJsonLd(copy.faq, pageUrl(path)) };
}

type SeoDraft = Omit<SeoPrerenderPage, 'locale' | 'alternates'>;

function toolNamed(
  locale: UrlLocale,
  path: string,
  h1: string,
  lead: string | undefined,
  copy: PageSeoCopy,
  jsonLdId?: string
): SeoDraft {
  const localized = localizedPath(path, locale);
  return {
    path: localized,
    title: copy.seoTitle,
    description: copy.seoDescription,
    h1,
    lead,
    copy,
    ...(jsonLdId ? faqLd(`${jsonLdId}-${locale}`, copy, localized) : {})
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(parts: InlinePart[], locale: UrlLocale): string {
  return parts.map((part) => {
    if (typeof part === 'string') return escapeHtml(part);
    const text = escapeHtml(part.text);
    const href = part.to ? localizedPath(part.to, locale) : '';
    let html = part.to ? `<a href="${escapeHtml(href)}">${text}</a>` : text;
    if (part.bold) html = `<strong>${html}</strong>`;
    if (part.italic) html = `<em>${html}</em>`;
    if (part.underline) html = `<u>${html}</u>`;
    const styles = [
      part.color ? `color:${escapeHtml(part.color)}` : '',
      part.fontSize ? `font-size:${escapeHtml(part.fontSize)}px` : ''
    ].filter(Boolean).join(';');
    if (styles) html = `<span style="${styles}">${html}</span>`;
    return html;
  }).join('');
}

function alignAttr(block: BlogBlock): string {
  if (!block.align || block.align === 'left') return '';
  return ` style="text-align:${block.align}"`;
}

function renderBlogBlock(block: BlogBlock, locale: UrlLocale): string {
  if (block.type === 'h2') return `<h2${alignAttr(block)}>${escapeHtml(block.text)}</h2>`;
  if (block.type === 'h3') return `<h3${alignAttr(block)}>${escapeHtml(block.text)}</h3>`;
  if (block.type === 'p') {
    if ('parts' in block) return `<p${alignAttr(block)}>${renderInline(block.parts, locale)}</p>`;
    return `<p${alignAttr(block)}>${escapeHtml(block.text)}</p>`;
  }
  const items = block.items.map((item) => (
    `<li>${typeof item === 'string' ? escapeHtml(item) : renderInline(item, locale)}</li>`
  )).join('');
  return block.type === 'ul' ? `<ul${alignAttr(block)}>${items}</ul>` : `<ol${alignAttr(block)}>${items}</ol>`;
}

function blogPage(post: BlogPost, locale: UrlLocale): SeoDraft {
  const path = localizedPath(`/blog/${post.slug}`, locale);
  return {
    path,
    title: post.seoTitle,
    description: post.seoDescription,
    h1: post.title,
    jsonLdId: `blog-${locale}-${post.slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.seoDescription,
      datePublished: post.publishedIso,
      inLanguage: locale,
      keywords: post.keywords,
      url: pageUrl(path),
      author: { '@type': 'Organization', name: 'One2PDF', legalName: '9545-8907 QUEBEC INC.' },
      publisher: { '@type': 'Organization', name: 'One2PDF', legalName: '9545-8907 QUEBEC INC.' }
    },
    articleHtml: `${post.body.map((block) => renderBlogBlock(block, locale)).join('\n')}<p><a href="${escapeHtml(localizedPath(post.ctaTo, locale))}">${escapeHtml(post.cta)}</a></p>`
  };
}

function homeH1(m: Messages) {
  return `${m.home.title.replace('{free}', m.home.titleFree)} ${m.home.titleAccent}`.replace(/\s+/g, ' ').trim();
}

function toolFeatures(m: Messages, bare: string) {
  const table: Record<string, { title: string; text: string }[] | undefined> = {
    '/compress': m.compress.features,
    '/merge': m.merge.features,
    '/split': m.split.features,
    '/protect': m.protect.features,
    '/edit-pdf': m.edit.features,
    '/to-jpg': m.toJpg.features,
    '/jpg-to-pdf': m.jpgToPdf.features,
    '/to-png': m.toPng.features,
    '/unlock': m.unlockPdf.features,
    '/ocr': m.ocrPdf.features,
    '/sign': m.signPdf.features,
    '/watermark': m.watermark.features,
    '/page-numbers': m.numberPages.features,
    '/rotate': m.rotatePdf.features,
    '/crop': m.cropPdf.features,
    '/delete-pages': m.deletePages.features,
    '/reorder': m.reorderPages.features,
    '/pdf-to-text': m.toText.features,
    '/html-to-pdf': m.htmlPdf.features,
    '/summarize': m.summarizePdf.features,
    '/translate': m.translatePdf.features,
    '/extract-pages': m.extractPages.features,
    '/extract-images': m.extractImages.features,
    '/flatten': m.flattenPdf.features,
    '/header-footer': m.headerFooter.features,
    '/fill-form': m.fillForm.features,
    '/fill-sign-pdf': m.fillSign.features,
    '/heic-to-pdf': m.heicToPdf.features
  };
  return table[bare];
}

function finalize(page: Omit<SeoPrerenderPage, 'alternates'>, m: Messages): SeoPrerenderPage {
  const bare = stripLocalePrefix(page.path);
  const path = localizedPath(bare, page.locale);
  const noindex = bare === '/translate' || Boolean(page.robots?.includes('noindex'));
  const features = page.features ?? toolFeatures(m, bare);
  const related = page.related ?? relatedToolLinks(bare, page.locale, m);
  return {
    ...page,
    path,
    robots: noindex ? 'noindex, follow' : page.robots,
    alternates: noindex ? [] : hreflangForPath(page.path),
    ...(features?.length ? {
      features,
      featuresTitle: page.locale === 'fr'
        ? 'Ce que permet cet outil'
        : page.locale === 'es'
          ? 'Qué permite esta herramienta'
          : 'What this tool does'
    } : {}),
    ...(related.length ? { related, relatedTitle: m.common.relatedTools } : {})
  };
}

function pagesFor(locale: UrlLocale): SeoPrerenderPage[] {
  const m = dictionaries[locale];
  const privacy = getPrivacyPolicy(locale);
  const pricingDescription = interpolate(m.pricing.seoDescription, {
    weekPrice: usd(199),
    monthPrice: usd(399),
    yearPrice: usd(3490)
  });
  const drafts: SeoDraft[] = [
    {
      path: '/',
      title: m.home.seoTitle,
      description: m.home.seoDescription,
      h1: homeH1(m),
      lead: m.home.subtitle,
      jsonLdId: 'one2pdf-website',
      jsonLd: websiteJsonLd()
    },
    {
      path: '/tools',
      title: `${m.tools.catalogTitle} | One2PDF`,
      description: m.tools.catalogSubtitle,
      h1: m.tools.catalogTitle,
      lead: m.tools.catalogSubtitle
    },
    {
      path: '/pricing',
      title: m.pricing.seoTitle,
      description: pricingDescription,
      h1: m.pricing.title,
      lead: m.pricing.subtitle
    },
    {
      path: '/privacy',
      title: privacy.seoTitle,
      description: privacy.seoDescription,
      h1: privacy.title,
      articleHtml: privacy.lead.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
    },
    {
      path: '/about',
      title: m.about.seoTitle,
      description: m.about.seoDescription,
      h1: m.about.h1,
      articleHtml: `<p>${escapeHtml(m.about.heroP1)}</p><p>${escapeHtml(m.about.heroP2)}</p>`
    },
    {
      path: '/contact',
      title: `${m.legal.contactTitle} | One2PDF`,
      description: m.legal.contactIntro,
      h1: m.legal.contactTitle,
      lead: m.legal.contactIntro
    },
    {
      path: '/blog',
      title: m.blogPage.seoTitle,
      description: m.blogPage.seoDescription,
      h1: m.blogPage.title,
      lead: m.blogPage.subtitle,
      articleHtml: getBlogPosts(locale).map((post) => (
        `<article><h2><a href="${escapeHtml(localizedPath(`/blog/${post.slug}`, locale))}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.excerpt)}</p></article>`
      )).join('')
    },
    ...getBlogPosts(locale).map((post) => blogPage(post, locale)),
    toolNamed(locale, '/compress', m.compress.title, m.compress.subtitle, m.compress, 'one2pdf-faq-compress'),
    toolNamed(locale, '/merge', m.merge.title, m.merge.subtitle, m.merge, 'one2pdf-faq-merge'),
    toolNamed(locale, '/split', m.split.title, m.split.subtitle, m.split, 'one2pdf-faq-split'),
    toolNamed(locale, '/protect', m.protect.title, m.protect.subtitle, m.protect),
    toolNamed(locale, '/edit-pdf', m.edit.title, m.edit.subtitle, m.edit),
    toolNamed(locale, '/pdf-to-word', m.convert.pdfToWordTitle, m.convert.pdfToWordDesc, m.convert.pdfToWordSeo, 'one2pdf-faq-/pdf-to-word'),
    toolNamed(locale, '/word-to-pdf', m.convert.wordToPdfTitle, m.convert.wordToPdfDesc, m.convert.wordToPdfSeo, 'one2pdf-faq-/word-to-pdf'),
    toolNamed(locale, '/pdf-to-excel', m.convert.pdfToExcelTitle, m.convert.pdfToExcelDesc, m.convert.pdfToExcelSeo),
    toolNamed(locale, '/excel-to-pdf', m.convert.excelToPdfTitle, m.convert.excelToPdfDesc, m.convert.excelToPdfSeo),
    toolNamed(locale, '/pdf-to-ppt', m.convert.pdfToPptTitle, m.convert.pdfToPptDesc, m.convert.pdfToPptSeo),
    toolNamed(locale, '/ppt-to-pdf', m.convert.pptToPdfTitle, m.convert.pptToPdfDesc, m.convert.pptToPdfSeo),
    toolNamed(locale, '/to-jpg', m.toJpg.title, m.toJpg.subtitle, m.toJpg),
    toolNamed(locale, '/jpg-to-pdf', m.jpgToPdf.title, m.jpgToPdf.subtitle, m.jpgToPdf, 'one2pdf-faq-jpg-to-pdf'),
    toolNamed(locale, '/to-png', m.toPng.title, m.toPng.subtitle, m.toPng, 'one2pdf-faq-/to-png'),
    toolNamed(locale, '/unlock', m.unlockPdf.title, m.unlockPdf.subtitle, m.unlockPdf),
    toolNamed(locale, '/ocr', m.ocrPdf.title, m.ocrPdf.subtitle, m.ocrPdf),
    toolNamed(locale, '/sign', m.signPdf.title, m.signPdf.subtitle, m.signPdf),
    toolNamed(locale, '/watermark', m.watermark.title, m.watermark.subtitle, m.watermark),
    toolNamed(locale, '/page-numbers', m.numberPages.title, m.numberPages.subtitle, m.numberPages),
    toolNamed(locale, '/rotate', m.rotatePdf.title, m.rotatePdf.subtitle, m.rotatePdf, 'one2pdf-faq-rotate'),
    toolNamed(locale, '/crop', m.cropPdf.title, m.cropPdf.subtitle, m.cropPdf),
    toolNamed(locale, '/delete-pages', m.deletePages.title, m.deletePages.subtitle, m.deletePages),
    toolNamed(locale, '/reorder', m.reorderPages.title, m.reorderPages.subtitle, m.reorderPages),
    toolNamed(locale, '/pdf-to-text', m.toText.title, m.toText.subtitle, m.toText, 'one2pdf-faq-/pdf-to-text'),
    toolNamed(locale, '/html-to-pdf', m.htmlPdf.title, m.htmlPdf.subtitle, m.htmlPdf),
    toolNamed(locale, '/summarize', m.summarizePdf.title, m.summarizePdf.subtitle, m.summarizePdf, 'one2pdf-faq-summarize'),
    toolNamed(locale, '/translate', m.translatePdf.title, m.translatePdf.subtitle, m.translatePdf, 'one2pdf-faq-translate'),
    toolNamed(locale, '/extract-pages', m.extractPages.title, m.extractPages.subtitle, m.extractPages),
    toolNamed(locale, '/extract-images', m.extractImages.title, m.extractImages.subtitle, m.extractImages),
    toolNamed(locale, '/flatten', m.flattenPdf.title, m.flattenPdf.subtitle, m.flattenPdf),
    toolNamed(locale, '/header-footer', m.headerFooter.title, m.headerFooter.subtitle, m.headerFooter),
    toolNamed(locale, '/fill-form', m.fillForm.title, m.fillForm.subtitle, m.fillForm),
    toolNamed(locale, '/fill-sign-pdf', m.fillSign.title, m.fillSign.subtitle, m.fillSign),
    toolNamed(locale, '/heic-to-pdf', m.heicToPdf.title, m.heicToPdf.subtitle, m.heicToPdf)
  ];

  return drafts
    .filter((draft) => !(locale === 'es' && draft.path === '/privacy'))
    .map((draft) => finalize({ ...draft, locale }, m));
}

export function indexableSeoPages(): SeoPrerenderPage[] {
  return PUBLIC_LOCALES.flatMap((locale) => pagesFor(locale));
}

export function seoArticleHtml(page: SeoPrerenderPage): string {
  const parts = [`<h1>${escapeHtml(page.h1)}</h1>`];
  if (page.lead) parts.push(`<p>${escapeHtml(page.lead)}</p>`);
  const copy = page.copy;
  if (copy?.howSteps?.length) {
    if (copy.howTitle) parts.push(`<h2>${escapeHtml(copy.howTitle)}</h2>`);
    parts.push(`<ol>${copy.howSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`);
  }
  if (copy) {
    parts.push(`<h2>${escapeHtml(copy.seoH2)}</h2>`);
    parts.push(`<p>${escapeHtml(copy.seoP1)}</p>`);
    parts.push(`<p>${escapeHtml(copy.seoP2)}</p>`);
    parts.push(`<p>${escapeHtml(copy.seoP3)}</p>`);
  }
  if (page.features?.length) {
    if (page.featuresTitle) parts.push(`<h2>${escapeHtml(page.featuresTitle)}</h2>`);
    parts.push(`<ul>${page.features.map((feature) => `<li><strong>${escapeHtml(feature.title)}</strong> — ${escapeHtml(feature.text)}</li>`).join('')}</ul>`);
  }
  if (copy?.faq?.length) {
    if (copy.faqTitle) parts.push(`<h2>${escapeHtml(copy.faqTitle)}</h2>`);
    for (const item of copy.faq) {
      parts.push(`<h3>${escapeHtml(item.question)}</h3>`);
      parts.push(`<p>${escapeHtml(item.answer)}</p>`);
    }
  }
  if (page.related?.length) {
    if (page.relatedTitle) parts.push(`<h2>${escapeHtml(page.relatedTitle)}</h2>`);
    parts.push(`<ul>${page.related.map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>`);
  }
  if (page.articleHtml) parts.push(page.articleHtml);
  return `<article id="seo-prerender">${parts.join('\n')}</article>`;
}

export function escapeHtmlAttr(value: string) {
  return escapeHtml(value);
}
