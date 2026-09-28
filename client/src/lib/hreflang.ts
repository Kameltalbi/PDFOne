import { getBlogPost } from '../content/blog';
import { localizedPath, stripLocalePrefix, urlLocaleFromPath, type UrlLocale } from '../i18n/localePath';
import { pageUrl } from './jsonLd';

export type HreflangLink = { hreflang: string; href: string };

const PUBLIC_LOCALES: UrlLocale[] = ['en', 'fr'];

function blogLocales(slug: string): UrlLocale[] {
  return PUBLIC_LOCALES.filter((locale) => getBlogPost(locale, slug));
}

/** Reciprocal alternates for the current route. Blog posts only list locales that actually have a translation. */
export function hreflangForPath(pathname: string): HreflangLink[] {
  const bare = stripLocalePrefix(pathname);
  const article = bare.match(/^\/blog\/([^/]+)$/);
  let locales: UrlLocale[];
  if (article) {
    locales = blogLocales(decodeURIComponent(article[1] ?? ''));
    if (locales.length === 0) {
      const current = urlLocaleFromPath(pathname);
      return [{ hreflang: current, href: pageUrl(localizedPath(bare, current)) }];
    }
  } else {
    locales = PUBLIC_LOCALES;
  }

  const links: HreflangLink[] = locales.map((locale) => ({
    hreflang: locale,
    href: pageUrl(localizedPath(bare, locale))
  }));
  if (locales.includes('en')) {
    links.push({ hreflang: 'x-default', href: pageUrl(localizedPath(bare, 'en')) });
  }
  return links;
}
