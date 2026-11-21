/**
 * Pages that exist only in English until a translation is written.
 * Compress target URLs stay here until the English pages have impressions.
 */
export const ENGLISH_ONLY_PATHS = new Set([
  '/png-to-pdf',
  '/images-to-pdf',
  '/onenote-to-pdf',
  '/one2pdf-vs-online2pdf',
  '/alternatives',
  '/compress-pdf-to-100kb',
  '/compress-pdf-to-200kb',
  '/compress-pdf-to-500kb',
  '/compress-pdf-to-1mb',
  '/compress-pdf-to-2mb',
  '/compress-pdf-for-email'
]);

/** Published, but held out of the index until the competitor facts are confirmed. */
export const NOINDEX_PATHS = new Set([
  '/one2pdf-vs-online2pdf',
  '/alternatives'
]);

export function isEnglishOnlyPath(path: string) {
  return ENGLISH_ONLY_PATHS.has(path);
}

export function isNoindexPath(path: string) {
  return NOINDEX_PATHS.has(path);
}
