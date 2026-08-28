import { useEffect } from 'react';

import type { PageSeoCopy } from '../i18n/types';

export function landingSeoFrom(copy: PageSeoCopy) {
  return {
    h2: copy.seoH2,
    paragraphs: [copy.seoP1, copy.seoP2, copy.seoP3]
  };
}

export function usePageSeo(title: string | null | undefined, description: string | null | undefined) {
  useEffect(() => {
    if (!title || !description) return;
    const root = document.documentElement;
    const previousTitle = document.title;
    const previousFlag = root.dataset.pageSeo;
    root.dataset.pageSeo = '1';
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content') ?? '';
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    return () => {
      if (previousFlag) root.dataset.pageSeo = previousFlag;
      else delete root.dataset.pageSeo;
      document.title = previousTitle;
      meta?.setAttribute('content', previousDescription);
    };
  }, [title, description]);
}
