import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import type { PageSeoCopy } from '../i18n/types';
import { pageUrl, SITE_ORIGIN } from './jsonLd';

const OG_IMAGE = `${SITE_ORIGIN}/one2pdf-logo.png`;

const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
  pt: 'pt_PT',
  de: 'de_DE',
  tr: 'tr_TR',
  ar: 'ar_AR',
  it: 'it_IT'
};

function setNamedMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let meta = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
  return meta;
}

export function landingSeoFrom(copy: PageSeoCopy) {
  return {
    h2: copy.seoH2,
    paragraphs: [copy.seoP1, copy.seoP2, copy.seoP3],
    howTitle: copy.howTitle,
    howSteps: copy.howSteps,
    faqTitle: copy.faqTitle,
    faq: copy.faq
  };
}

export function usePageSeo(title: string | null | undefined, description: string | null | undefined) {
  const { pathname } = useLocation();
  const url = pageUrl(pathname);
  const lang = document.documentElement.lang || 'en';
  const ogLocale = OG_LOCALES[lang] || 'en_US';

  useEffect(() => {
    if (!title || !description) return;
    const root = document.documentElement;
    const previousTitle = document.title;
    const previousFlag = root.dataset.pageSeo;
    root.dataset.pageSeo = '1';
    document.title = title;

    const prevDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    setNamedMeta('name', 'description', description);
    setNamedMeta('property', 'og:title', title);
    setNamedMeta('property', 'og:description', description);
    setNamedMeta('property', 'og:type', 'website');
    setNamedMeta('property', 'og:url', url);
    setNamedMeta('property', 'og:image', OG_IMAGE);
    setNamedMeta('property', 'og:locale', ogLocale);
    setNamedMeta('property', 'og:site_name', 'One2PDF');
    setNamedMeta('name', 'twitter:card', 'summary');
    setNamedMeta('name', 'twitter:title', title);
    setNamedMeta('name', 'twitter:description', description);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const previousCanonical = canonical?.getAttribute('href') ?? '';
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    return () => {
      if (previousFlag) root.dataset.pageSeo = previousFlag;
      else delete root.dataset.pageSeo;
      document.title = previousTitle;
      document.querySelector('meta[name="description"]')?.setAttribute('content', prevDescription);
      if (previousCanonical) canonical?.setAttribute('href', previousCanonical);
    };
  }, [title, description, url, ogLocale]);
}
