import { COMPRESS_EMAIL_SLUG, getBlogPost, PRIVACY_PDF_SLUG } from '../content/blog';
import { localizedPath, SEO_LOCALES, stripLocalePrefix, urlLocaleFromPath, type UrlLocale } from '../i18n/localePath';
import { pageUrl } from './jsonLd';

export type HreflangLink = { hreflang: string; href: string };

const PUBLIC_LOCALES: UrlLocale[] = [...SEO_LOCALES];

/** Same article, different slugs. A locale is listed only when that slug really exists. */
const BLOG_EQUIVALENTS: Array<Partial<Record<UrlLocale, string>>> = [
  { en: COMPRESS_EMAIL_SLUG, fr: COMPRESS_EMAIL_SLUG, es: 'comprimir-pdf-correo', de: 'pdf-fuer-e-mail-verkleinern' },
  { en: PRIVACY_PDF_SLUG, fr: PRIVACY_PDF_SLUG, es: 'privacidad-pdf-en-linea', de: 'datenschutz-pdf-online' }
];

function localesForBare(bare: string): UrlLocale[] {
  if (bare === '/privacy') return ['en', 'fr'];
  return PUBLIC_LOCALES;
}

function blogCluster(slug: string): Array<{ locale: UrlLocale; slug: string }> {
  const group = BLOG_EQUIVALENTS.find((item) => Object.values(item).includes(slug));
  if (!group) {
    return PUBLIC_LOCALES
      .filter((locale) => getBlogPost(locale, slug))
      .map((locale) => ({ locale, slug }));
  }
  return PUBLIC_LOCALES.flatMap((locale) => {
    const localSlug = group[locale];
    if (!localSlug || !getBlogPost(locale, localSlug)) return [];
    return [{ locale, slug: localSlug }];
  });
}

/** Reciprocal alternates for the current route. Blog posts only list locales that actually have a translation. */
export function hreflangForPath(pathname: string): HreflangLink[] {
  const bare = stripLocalePrefix(pathname);
  const article = bare.match(/^\/blog\/([^/]+)$/);
  if (article) {
    const cluster = blogCluster(decodeURIComponent(article[1] ?? ''));
    if (cluster.length === 0) {
      const current = urlLocaleFromPath(pathname);
      return [{ hreflang: current, href: pageUrl(localizedPath(bare, current)) }];
    }
    const links: HreflangLink[] = cluster.map((item) => ({
      hreflang: item.locale,
      href: pageUrl(localizedPath(`/blog/${item.slug}`, item.locale))
    }));
    if (cluster.some((item) => item.locale === 'en')) {
      const english = cluster.find((item) => item.locale === 'en');
      links.push({ hreflang: 'x-default', href: pageUrl(localizedPath(`/blog/${english?.slug ?? ''}`, 'en')) });
    }
    return links;
  }

  const locales = localesForBare(bare);
  const links: HreflangLink[] = locales.map((locale) => ({
    hreflang: locale,
    href: pageUrl(localizedPath(bare, locale))
  }));
  if (locales.includes('en')) {
    links.push({ hreflang: 'x-default', href: pageUrl(localizedPath(bare, 'en')) });
  }
  return links;
}
