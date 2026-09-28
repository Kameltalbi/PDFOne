import { Link as RouterLink, NavLink as RouterNavLink, Navigate as RouterNavigate, useNavigate, type LinkProps, type NavLinkProps, type NavigateOptions, type NavigateProps, type To } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizedPath } from '../i18n/localePath';
import type { Locale } from '../i18n/types';

function localizeTo(to: To, locale: Locale) {
  return typeof to === 'string' ? localizedPath(to, locale) : to;
}

export function Link({ to, ...rest }: LinkProps) {
  const { locale } = useI18n();
  return <RouterLink to={localizeTo(to, locale)} {...rest} />;
}

export function NavLink({ to, ...rest }: NavLinkProps) {
  const { locale } = useI18n();
  return <RouterNavLink to={localizeTo(to, locale)} {...rest} />;
}

export function Navigate(props: NavigateProps) {
  const { locale } = useI18n();
  if (typeof props.to !== 'string') return <RouterNavigate {...props} />;
  return <RouterNavigate {...props} to={localizedPath(props.to, locale)} />;
}

export function useLocaleNavigate() {
  const navigate = useNavigate();
  const { locale } = useI18n();
  return (to: string, options?: NavigateOptions) => navigate(localizedPath(to, locale), options);
}
