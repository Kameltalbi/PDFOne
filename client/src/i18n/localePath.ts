import type { Locale } from './types';

/**
 * Locales that get their own URL prefix.
 * English stays unprefixed so existing rankings are preserved.
 * Add es, de, it or pt here only when that language has real localized pages.
 */
export const URL_LOCALE_PREFIXES = ['fr'] as const;

export type UrlLocale = 'en' | (typeof URL_LOCALE_PREFIXES)[number];

const PREFIXES = new Set<string>(URL_LOCALE_PREFIXES);

export function isUrlLocalePrefix(value: string): value is (typeof URL_LOCALE_PREFIXES)[number] {
  return PREFIXES.has(value);
}

/** Locale forced by the URL. Unprefixed paths are the English canonical. */
export function routeLocale(pathname: string): UrlLocale | null {
  const segment = pathname.split(/[?#]/)[0]?.split('/')[1] ?? '';
  return isUrlLocalePrefix(segment) ? segment : null;
}

export function urlLocaleFromPath(pathname: string): UrlLocale {
  return routeLocale(pathname) ?? 'en';
}

export function stripLocalePrefix(pathname: string): string {
  const cut = pathname.search(/[?#]/);
  const pathOnly = cut === -1 ? pathname : pathname.slice(0, cut);
  const segments = pathOnly.split('/');
  if (segments.length > 1 && isUrlLocalePrefix(segments[1] ?? '')) {
    const rest = `/${segments.slice(2).join('/')}`.replace(/\/+$/, '');
    return rest === '' ? '/' : rest;
  }
  if (pathOnly === '' || pathOnly === '/') return '/';
  return pathOnly.replace(/\/+$/, '') || '/';
}

/** English keeps `/compress`. French becomes `/fr/compress`. Other locales stay unprefixed until they are launched. */
export function localizedPath(to: string, locale: Locale): string {
  if (!to || to.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(to)) return to;
  const cut = to.search(/[?#]/);
  const suffix = cut === -1 ? '' : to.slice(cut);
  const path = cut === -1 ? to : to.slice(0, cut);
  if (!path.startsWith('/')) return to;
  const bare = stripLocalePrefix(path);
  if (!isUrlLocalePrefix(locale)) return `${bare}${suffix}`;
  if (bare === '/') return `/${locale}${suffix}`;
  return `/${locale}${bare}${suffix}`;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  return localizedPath(stripLocalePrefix(pathname), locale);
}
