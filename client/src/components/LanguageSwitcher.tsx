import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { switchLocalePath } from '../i18n/localePath';
import { switchBlogLocalePath } from '../lib/hreflang';
import type { Locale } from '../i18n/types';

/**
 * Public languages in the header. Append a locale here when its pages go live.
 */
const PUBLIC_LANGUAGES: { locale: 'en' | 'fr' | 'es' | 'de' | 'pt' | 'it' | 'tr' | 'ar'; code: string; flag: string; label: string }[] = [
  { locale: 'en', code: 'EN', flag: '🇬🇧', label: 'English' },
  { locale: 'fr', code: 'FR', flag: '🇫🇷', label: 'Français' },
  { locale: 'es', code: 'ES', flag: '🇪🇸', label: 'Español' },
  { locale: 'de', code: 'DE', flag: '🇩🇪', label: 'Deutsch' },
  { locale: 'pt', code: 'PT', flag: '🇵🇹', label: 'Português' },
  { locale: 'it', code: 'IT', flag: '🇮🇹', label: 'Italiano' },
  { locale: 'tr', code: 'TR', flag: '🇹🇷', label: 'Türkçe' },
  { locale: 'ar', code: 'AR', flag: '🇸🇦', label: 'العربية' }
];

const MENU_LABEL: Partial<Record<Locale, string>> = {
  en: 'Language',
  fr: 'Langue',
  es: 'Idioma',
  de: 'Sprache',
  pt: 'Idioma',
  it: 'Lingua',
  tr: 'Dil',
  ar: 'اللغة'
};

export function LanguageSwitcher() {
  const { pathname } = useLocation();
  const { locale, preferLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = PUBLIC_LANGUAGES.find((choice) => choice.locale === locale) ?? PUBLIC_LANGUAGES[0];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="lang-switch" ref={rootRef}>
      <button
        type="button"
        className="lang-switch-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        aria-label={`${MENU_LABEL[locale] ?? 'Language'}, ${current.label}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="lang-switch-flag" aria-hidden="true">{current.flag}</span>
        <span className="lang-switch-current">{current.code}</span>
        <svg className="lang-switch-chevron" viewBox="0 0 12 8" width="10" height="7" aria-hidden="true">
          <path d="M1.5 1.75 6 6.25 10.5 1.75" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul id={menuId} className="lang-switch-menu" role="listbox" aria-label={MENU_LABEL[locale] ?? 'Language'}>
          {PUBLIC_LANGUAGES.map((choice) => {
            const active = locale === choice.locale;
            return (
              <li key={choice.locale} role="presentation">
                <Link
                  role="option"
                  aria-selected={active}
                  to={switchBlogLocalePath(pathname, choice.locale) ?? switchLocalePath(pathname, choice.locale)}
                  hrefLang={choice.locale}
                  lang={choice.locale}
                  aria-label={choice.label}
                  className={active ? 'active' : undefined}
                  onClick={() => preferLocale(choice.locale)}
                >
                  <span className="lang-switch-option">
                    <span className="lang-switch-flag" aria-hidden="true">{choice.flag}</span>
                    <span>{choice.code}</span>
                  </span>
                  {active && (
                    <svg className="lang-switch-check" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                      <path d="M3.2 8.3 6.3 11.4 12.8 4.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
