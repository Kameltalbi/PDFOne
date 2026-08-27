import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { detectLocale, isRtl } from './detect';
import { dictionaries } from './dictionaries';
import { setRuntimeLocale } from './runtime';
import { interpolate, type Locale, type Messages } from './types';

type I18nContextValue = {
  locale: Locale;
  m: Messages;
  t: (template: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useMemo(() => detectLocale(), []);
  const m = dictionaries[locale];
  setRuntimeLocale(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr';
    document.title = m.htmlTitle;
  }, [locale, m.htmlTitle]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    m,
    t: (template, vars) => interpolate(template, vars)
  }), [locale, m]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
