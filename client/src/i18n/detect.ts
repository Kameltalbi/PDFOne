import { LOCALES, type Locale } from './types';

export function detectLocale(): Locale {
  if (typeof window !== 'undefined') {
    const fromQuery = new URLSearchParams(window.location.search).get('lang');
    if (fromQuery && LOCALES.includes(fromQuery as Locale)) {
      return fromQuery as Locale;
    }
  }

  if (typeof navigator === 'undefined') return 'en';

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language
  ].filter(Boolean);

  for (const tag of candidates) {
    const base = tag.toLowerCase().split('-')[0] as Locale;
    if (LOCALES.includes(base)) return base;
  }

  return 'en';
}

export function isRtl(locale: Locale): boolean {
  return locale === 'ar';
}
