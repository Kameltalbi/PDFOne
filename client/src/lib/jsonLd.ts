import { useEffect } from 'react';
import { stripLocalePrefix } from '../i18n/localePath';
import { BRAND_SAME_AS, OG_IMAGE_PATH } from './brand';

export const SITE_ORIGIN = 'https://one2pdf.com';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}${OG_IMAGE_PATH}`;

/** One FAQ script per page. Prerender and React must use this same id. */
export function faqScriptId(pathname: string) {
  const bare = stripLocalePrefix(pathname.split(/[?#]/)[0] ?? pathname);
  const slug = bare.replace(/^\/+|\/+$/g, '');
  return `one2pdf-faq-${slug || 'home'}`;
}

export function appScriptId(pathname: string) {
  const bare = stripLocalePrefix(pathname.split(/[?#]/)[0] ?? pathname);
  const slug = bare.replace(/^\/+|\/+$/g, '');
  return `one2pdf-app-${slug || 'home'}`;
}

export function pageUrl(pathname: string) {
  if (!pathname || pathname === '/') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${pathname.replace(/\/$/, '')}`;
}

export type FaqItem = { question: string; answer: string };

export function faqPageJsonLd(items: FaqItem[], pageUrlValue: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrlValue}#faq`,
    url: pageUrlValue,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'One2PDF',
        legalName: '9545-8907 QUEBEC INC.',
        url: `${SITE_ORIGIN}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_ORIGIN}/one2pdf-logo.png`
        },
        sameAs: BRAND_SAME_AS
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        name: 'One2PDF',
        url: `${SITE_ORIGIN}/`,
        publisher: { '@id': `${SITE_ORIGIN}/#organization` }
      }
    ]
  };
}

export function webApplicationJsonLd(name: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };
}

export function howToJsonLd(name: string, description: string, steps: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((text, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text
    }))
  };
}

export function useJsonLd(id: string, data: object | null) {
  useEffect(() => {
    if (!data) return;
    const existing = document.getElementById(id);
    existing?.remove();
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [id, data]);
}
