import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { detectLocale, isRtl } from './detect';
import { dictionaries } from './dictionaries';
import { routeLocale } from './localePath';
import { setRuntimeLocale } from './runtime';
import { interpolate, type Locale, type Messages } from './types';

const LOCALE_CHOICE_KEY = 'one2pdf.locale';

type I18nContextValue = {
  locale: Locale;
  m: Messages;
  t: (template: string, vars?: Record<string, string | number>) => string;
  preferLocale: (locale: 'en' | 'fr' | 'es') => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readEnglishChoice() {
  try {
    return localStorage.getItem(LOCALE_CHOICE_KEY) === 'en';
  } catch {
    return false;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [englishChoice, setEnglishChoice] = useState(readEnglishChoice);
  const browserLocale = useMemo(() => detectLocale(), []);
  const forced = routeLocale(pathname);
  // /fr/ forces French and /es/ forces Spanish. Unprefixed URLs stay on browser detection unless the visitor explicitly chose English.
  const locale: Locale = forced ?? (englishChoice ? 'en' : browserLocale);
  const m = dictionaries[locale];
  setRuntimeLocale(locale);

  const preferLocale = useCallback((next: 'en' | 'fr' | 'es') => {
    try {
      if (next === 'en') localStorage.setItem(LOCALE_CHOICE_KEY, 'en');
      else localStorage.removeItem(LOCALE_CHOICE_KEY);
    } catch {
      /* storage unavailable */
    }
    setEnglishChoice(next === 'en');
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
