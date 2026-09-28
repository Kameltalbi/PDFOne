import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { switchLocalePath } from '../i18n/localePath';
import type { Locale } from '../i18n/types';

/**
 * Public languages in the header. Append a locale here when its pages go live.
 * Portuguese, Italian, Turkish and Arabic stay out until they have real routes.
 */
const PUBLIC_LANGUAGES: { locale: 'en' | 'fr' | 'es' | 'de'; label: string }[] = [
  { locale: 'en', label: 'English' },
  { locale: 'fr', label: 'Français' },
  { locale: 'es', label: 'Español' },
  { locale: 'de', label: 'Deutsch' }
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
        aria-label={MENU_LABEL[locale] ?? 'Language'}
        onClick={() => setOpen((value) => !value)}
      >
        <svg className="lang-switch-globe" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3.75 12h16.5M12 3.75c2.2 2.55 3.35 5.35 3.35 8.25s-1.15 5.7-3.35 8.25c-2.2-2.55-3.35-5.35-3.35-8.25s1.15-5.7 3.35-8.25z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        <span className="lang-switch-current">{current.label}</span>
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
                  to={switchLocalePath(pathname, choice.locale)}
                  hrefLang={choice.locale}
                  lang={choice.locale}
                  className={active ? 'active' : undefined}
                  onClick={() => preferLocale(choice.locale)}
                >
                  <span>{choice.label}</span>
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
