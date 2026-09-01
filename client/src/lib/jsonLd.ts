import { useEffect } from 'react';

export const SITE_ORIGIN = 'https://one2pdf.com';

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
    '@type': 'WebSite',
    name: 'One2PDF',
    url: `${SITE_ORIGIN}/`,
    publisher: {
      '@type': 'Organization',
      name: 'One2PDF',
      legalName: '9545-8907 QUEBEC INC.',
      url: `${SITE_ORIGIN}/`
    }
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
