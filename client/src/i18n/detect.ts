import type { Locale } from './types';

export type PublicLocale = 'en' | 'fr';

/**
 * The public interface is intentionally bilingual. Legacy locales remain
 * available when their URL explicitly requests them, but browser detection
 * never selects them for an unprefixed URL.
 */
export function publicLocaleFromTags(tags: readonly string[]): PublicLocale {
  return tags.some((tag) => tag.toLowerCase().split('-')[0] === 'fr') ? 'fr' : 'en';
}

export function detectLocale(): PublicLocale {
  if (typeof window !== 'undefined') {
    const fromQuery = new URLSearchParams(window.location.search).get('lang');
    if (fromQuery === 'fr') return 'fr';
    if (fromQuery === 'en') return 'en';
  }

  if (typeof navigator === 'undefined') return 'en';

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language
  ].filter(Boolean);

  return publicLocaleFromTags(candidates);
}

export function isRtl(locale: Locale): boolean {
  return locale === 'ar';
}
