import type { Locale } from './types';

let currentLocale: Locale = 'fr';

export function setRuntimeLocale(locale: Locale) {
  currentLocale = locale;
}

export function getRuntimeLocale(): Locale {
  return currentLocale;
}
