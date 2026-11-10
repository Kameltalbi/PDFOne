/**
 * French pages already live on the English slug (`/fr/compress`, `/fr/merge`, …).
 * A translated slug is recorded here for a later rename. Nothing in this table
 * is applied: changing `/fr/compress` to `/fr/compresser-pdf` needs a 301 from
 * every URL that is already indexed.
 *
 * `fr` is the slug that would replace the current one. `live` is the slug in use.
 */
export const SLUG_MAP: Record<string, { live: string; fr: string }> = {
  '/compress': { live: 'compress', fr: 'compresser-pdf' },
  '/merge': { live: 'merge', fr: 'fusionner-pdf' },
  '/split': { live: 'split', fr: 'diviser-pdf' },
  '/pdf-to-word': { live: 'pdf-to-word', fr: 'pdf-en-word' },
  '/word-to-pdf': { live: 'word-to-pdf', fr: 'word-en-pdf' }
};

/** Always the current public path. Translated slugs are not routed. */
export function publicSlug(path: string, _locale: string) {
  const bare = path.startsWith('/') ? path : `/${path}`;
  const entry = SLUG_MAP[bare];
  return entry ? `/${entry.live}` : bare;
}
