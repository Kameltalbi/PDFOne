import { getBlogPosts, type BlogBlock, type BlogPost, type InlinePart } from '../content/blog';
import { getPrivacyPolicy } from '../content/privacyPolicy';
import { en } from '../i18n/locales/en';
import { interpolate, type Messages, type PageSeoCopy } from '../i18n/types';
import { faqPageJsonLd, pageUrl, websiteJsonLd } from './jsonLd';

export type SeoPrerenderPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  lead?: string;
  copy?: PageSeoCopy;
  jsonLdId?: string;
  jsonLd?: object;
  articleHtml?: string;
};

const m: Messages = en;

function usd(cents: number) {
  return `$${(Math.max(0, cents) / 100).toFixed(2)}`;
}

function faqLd(id: string, copy: PageSeoCopy, path: string): Pick<SeoPrerenderPage, 'jsonLdId' | 'jsonLd'> {
  if (!copy.faq?.length) return {};
  return { jsonLdId: id, jsonLd: faqPageJsonLd(copy.faq, pageUrl(path)) };
}

function toolNamed(
  path: string,
  h1: string,
  lead: string | undefined,
  copy: PageSeoCopy,
  jsonLdId?: string,
  jsonLdPath = path
): SeoPrerenderPage {
  return {
    path,
    title: copy.seoTitle,
    description: copy.seoDescription,
    h1,
    lead,
    copy,
    ...(jsonLdId ? faqLd(jsonLdId, copy, jsonLdPath) : {})
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(parts: InlinePart[]): string {
  return parts.map((part) => {
    if (typeof part === 'string') return escapeHtml(part);
    return `<a href="${escapeHtml(part.to)}">${escapeHtml(part.text)}</a>`;
  }).join('');
}

function renderBlogBlock(block: BlogBlock): string {
  if (block.type === 'h2') return `<h2>${escapeHtml(block.text)}</h2>`;
  if (block.type === 'h3') return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === 'p') {
    if ('parts' in block) return `<p>${renderInline(block.parts)}</p>`;
    return `<p>${escapeHtml(block.text)}</p>`;
  }
  if (block.type === 'ul') {
    return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }
  return `<ol>${block.items.map((item) => (
    `<li>${typeof item === 'string' ? escapeHtml(item) : renderInline(item)}</li>`
  )).join('')}</ol>`;
}

function blogPage(post: BlogPost): SeoPrerenderPage {
  const path = `/blog/${post.slug}`;
  return {
    path,
    title: post.seoTitle,
    description: post.seoDescription,
    h1: post.title,
    jsonLdId: `blog-${post.slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.seoDescription,
      datePublished: post.publishedIso,
      inLanguage: 'en',
      keywords: post.keywords,
      url: pageUrl(path),
      author: { '@type': 'Organization', name: 'One2PDF', legalName: '9545-8907 QUEBEC INC.' },
      publisher: { '@type': 'Organization', name: 'One2PDF', legalName: '9545-8907 QUEBEC INC.' }
    },
    articleHtml: `${post.body.map(renderBlogBlock).join('\n')}<p><a href="${escapeHtml(post.ctaTo)}">${escapeHtml(post.cta)}</a></p>`
  };
}

const homeH1 = `${m.home.title.replace('{free}', m.home.titleFree)} ${m.home.titleAccent}`.replace(/\s+/g, ' ').trim();

const privacy = getPrivacyPolicy('en');
const pricingDescription = interpolate(m.pricing.seoDescription, {
  weekPrice: usd(199),
  monthPrice: usd(399),
  yearPrice: usd(3490)
});

export function indexableSeoPages(): SeoPrerenderPage[] {
  const pages: SeoPrerenderPage[] = [
    {
      path: '/',
      title: m.home.seoTitle,
      description: m.home.seoDescription,
      h1: homeH1,
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
      articleHtml: getBlogPosts('en').map((post) => (
        `<article><h2><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.excerpt)}</p></article>`
      )).join('')
    },
    ...getBlogPosts('en').map(blogPage),
    toolNamed('/compress', m.compress.title, m.compress.subtitle, m.compress, 'one2pdf-faq-compress'),
    toolNamed('/merge', m.merge.title, m.merge.subtitle, m.merge, 'one2pdf-faq-merge'),
    toolNamed('/split', m.split.title, m.split.subtitle, m.split, 'one2pdf-faq-split'),
    toolNamed('/protect', m.protect.title, m.protect.subtitle, m.protect),
    toolNamed('/edit-pdf', m.edit.title, m.edit.subtitle, m.edit),
    toolNamed('/pdf-to-word', m.convert.pdfToWordTitle, m.convert.pdfToWordDesc, m.convert.pdfToWordSeo, 'one2pdf-faq-/pdf-to-word'),
    toolNamed('/word-to-pdf', m.convert.wordToPdfTitle, m.convert.wordToPdfDesc, m.convert.wordToPdfSeo, 'one2pdf-faq-/word-to-pdf'),
    toolNamed('/pdf-to-excel', m.convert.pdfToExcelTitle, m.convert.pdfToExcelDesc, m.convert.pdfToExcelSeo),
    toolNamed('/excel-to-pdf', m.convert.excelToPdfTitle, m.convert.excelToPdfDesc, m.convert.excelToPdfSeo),
    toolNamed('/pdf-to-ppt', m.convert.pdfToPptTitle, m.convert.pdfToPptDesc, m.convert.pdfToPptSeo),
    toolNamed('/ppt-to-pdf', m.convert.pptToPdfTitle, m.convert.pptToPdfDesc, m.convert.pptToPdfSeo),
    toolNamed('/to-jpg', m.toJpg.title, m.toJpg.subtitle, m.toJpg),
    toolNamed('/jpg-to-pdf', m.jpgToPdf.title, m.jpgToPdf.subtitle, m.jpgToPdf, 'one2pdf-faq-jpg-to-pdf'),
    toolNamed('/to-png', m.toPng.title, m.toPng.subtitle, m.toPng, 'one2pdf-faq-/to-png'),
    toolNamed('/unlock', m.unlockPdf.title, m.unlockPdf.subtitle, m.unlockPdf),
    toolNamed('/ocr', m.ocrPdf.title, m.ocrPdf.subtitle, m.ocrPdf),
    toolNamed('/sign', m.signPdf.title, m.signPdf.subtitle, m.signPdf),
    toolNamed('/watermark', m.watermark.title, m.watermark.subtitle, m.watermark),
    toolNamed('/page-numbers', m.numberPages.title, m.numberPages.subtitle, m.numberPages),
    toolNamed('/rotate', m.rotatePdf.title, m.rotatePdf.subtitle, m.rotatePdf),
    toolNamed('/crop', m.cropPdf.title, m.cropPdf.subtitle, m.cropPdf),
    toolNamed('/delete-pages', m.deletePages.title, m.deletePages.subtitle, m.deletePages),
    toolNamed('/reorder', m.reorderPages.title, m.reorderPages.subtitle, m.reorderPages),
    toolNamed('/pdf-to-text', m.toText.title, m.toText.subtitle, m.toText, 'one2pdf-faq-/pdf-to-text'),
    toolNamed('/html-to-pdf', m.htmlPdf.title, m.htmlPdf.subtitle, m.htmlPdf),
    toolNamed('/summarize', m.summarizePdf.title, m.summarizePdf.subtitle, m.summarizePdf),
    toolNamed('/translate', m.translatePdf.title, m.translatePdf.subtitle, m.translatePdf, 'one2pdf-faq-translate'),
    toolNamed('/extract-pages', m.extractPages.title, m.extractPages.subtitle, m.extractPages),
    toolNamed('/extract-images', m.extractImages.title, m.extractImages.subtitle, m.extractImages),
    toolNamed('/flatten', m.flattenPdf.title, m.flattenPdf.subtitle, m.flattenPdf),
    toolNamed('/header-footer', m.headerFooter.title, m.headerFooter.subtitle, m.headerFooter),
    toolNamed('/fill-form', m.fillForm.title, m.fillForm.subtitle, m.fillForm),
    toolNamed('/fill-sign-pdf', m.fillSign.title, m.fillSign.subtitle, m.fillSign),
    toolNamed('/heic-to-pdf', m.heicToPdf.title, m.heicToPdf.subtitle, m.heicToPdf)
  ];

  return pages;
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
  if (copy?.faq?.length) {
    if (copy.faqTitle) parts.push(`<h2>${escapeHtml(copy.faqTitle)}</h2>`);
    for (const item of copy.faq) {
      parts.push(`<h3>${escapeHtml(item.question)}</h3>`);
      parts.push(`<p>${escapeHtml(item.answer)}</p>`);
    }
  }
  if (page.articleHtml) parts.push(page.articleHtml);
  return `<article id="seo-prerender">${parts.join('\n')}</article>`;
}

export function escapeHtmlAttr(value: string) {
  return escapeHtml(value);
}
