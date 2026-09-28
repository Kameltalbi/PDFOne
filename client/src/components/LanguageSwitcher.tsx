import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { switchLocalePath } from '../i18n/localePath';

const CHOICES = [
  { locale: 'en' as const, label: 'English' },
  { locale: 'fr' as const, label: 'Français' }
];

export function LanguageSwitcher() {
  const { pathname } = useLocation();
  const { locale, preferLocale } = useI18n();

  return (
    <nav className="lang-switch" aria-label={locale === 'fr' ? 'Langue' : 'Language'}>
      {CHOICES.map((choice, index) => (
        <span key={choice.locale}>
          {index > 0 && <span className="lang-switch-sep" aria-hidden="true">|</span>}
          <Link
            to={switchLocalePath(pathname, choice.locale)}
            hrefLang={choice.locale}
            lang={choice.locale}
            aria-current={locale === choice.locale ? 'true' : undefined}
            onClick={() => preferLocale(choice.locale)}
          >
            {choice.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
