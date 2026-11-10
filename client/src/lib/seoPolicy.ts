/** Pages that exist only in English until a translation is written. */
export const ENGLISH_ONLY_PATHS = new Set([
  '/png-to-pdf',
  '/images-to-pdf',
  '/onenote-to-pdf',
  '/one2pdf-vs-online2pdf',
  '/alternatives'
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
