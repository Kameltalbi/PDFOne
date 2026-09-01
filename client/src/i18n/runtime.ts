import type { Locale } from './types';

let currentLocale: Locale = 'en';

export function setRuntimeLocale(locale: Locale) {
  currentLocale = locale;
}

export function getRuntimeLocale(): Locale {
  return currentLocale;
}
