import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { detectLocale, isRtl, type PublicLocale } from './detect';
import { dictionaries } from './dictionaries';
import { routeLocale } from './localePath';
import { setRuntimeLocale } from './runtime';
import { interpolate, type Locale, type Messages } from './types';

const LOCALE_CHOICE_KEY = 'one2pdf.locale';

type I18nContextValue = {
  locale: Locale;
  m: Messages;
  t: (template: string, vars?: Record<string, string | number>) => string;
  preferLocale: (locale: PublicLocale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readLocaleChoice(): PublicLocale | null {
  try {
    const choice = localStorage.getItem(LOCALE_CHOICE_KEY);
    return choice === 'en' || choice === 'fr' ? choice : null;
  } catch {
    return null;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [localeChoice, setLocaleChoice] = useState<PublicLocale | null>(readLocaleChoice);
  const browserLocale = useMemo(() => detectLocale(), []);
  const forced = routeLocale(pathname);
  // Prefixed legacy URLs preserve their language. Unprefixed URLs use an explicit
  // EN/FR choice first, then browser detection (French or English only).
  const locale: Locale = forced ?? localeChoice ?? browserLocale;
  const m = dictionaries[locale];
  setRuntimeLocale(locale);

  const preferLocale = useCallback((next: PublicLocale) => {
    try {
      localStorage.setItem(LOCALE_CHOICE_KEY, next);
    } catch {
      /* storage unavailable */
    }
    setLocaleChoice(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr';
    if (document.documentElement.dataset.pageSeo === '1') return;
    document.title = m.htmlTitle;
  }, [locale, m.htmlTitle]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    m,
    t: (template, vars) => interpolate(template, vars),
    preferLocale
  }), [locale, m, preferLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
