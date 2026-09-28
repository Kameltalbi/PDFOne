import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { Messages } from '../i18n/types';
import { stripLocalePrefix } from '../i18n/localePath';
import { remainingLabel } from '../lib/account';
import { useBilling, type BillingState, type PaidPlan } from '../lib/billing';
import { AppLauncher } from './AppLauncher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Link, NavLink } from './LocaleLink';
import './Header.css';

type MenuId = 'tools' | 'convert';
type NavItem = { name: string; path: string };

function isDesktopNav() {
  return window.matchMedia('(min-width: 1121px)').matches;
}

function pathIsActive(pathname: string, path: string) {
  const bare = stripLocalePrefix(pathname);
  return bare === path || bare.startsWith(`${path}/`);
}

function planTitle(plan: PaidPlan, pricing: Messages['pricing']) {
  if (plan === 'week') return pricing.weekName;
  if (plan === 'month') return pricing.monthName;
  if (plan === 'year') return pricing.yearName;
  return pricing.accountPro;
}

function AccountStatus({ status }: { status: BillingState }) {
  const { m, t } = useI18n();
  if (!status.user && !status.paid) return null;
  const title = status.paid ? planTitle(status.plan, m.pricing) : (status.user?.name || m.pricing.freeName);
  const detail = status.paid
    ? remainingLabel(status.expiresAt, t, m)
    : typeof status.remainingToday === 'number' && typeof status.dailyLimit === 'number'
      ? t(m.common.jobsLeft, { remaining: status.remainingToday, limit: status.dailyLimit })
      : null;
  return (
    <div className="account-status">
      <strong>{title}</strong>
      {detail && <span>{detail}</span>}
    </div>
  );
}

function AccountChevron() {
  return (
    <svg className="account-chevron" viewBox="0 0 12 8" width="10" height="7" aria-hidden="true">
      <path d="M1.5 1.75 6 6.25 10.5 1.75" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg className="account-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="8" r="3.15" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.4 19.25c1.45-3.05 3.75-4.45 6.6-4.45s5.15 1.4 6.6 4.45" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Header() {
  const { m, t } = useI18n();
  const { status, logout, portal } = useBilling();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountMenuId = useId();
  const closeTimer = useRef(0);

  useEffect(() => {
    setMenuOpen(false);
    setOpenMenu(null);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    if (!menuOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setOpenMenu(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('nav-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (navRef.current && !navRef.current.contains(target)) setOpenMenu(null);
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenMenu(null);
    setAccountOpen(false);
  };

  const signedIn = Boolean(status.user || status.paid);

  const openNow = (id: MenuId) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(id);
  };

  const closeSoon = () => {
    if (!isDesktopNav()) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  const toggleMenu = (id: MenuId) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu((current) => (current === id ? null : id));
  };

  const pdfTools: NavItem[] = [
    { name: m.tools.merge, path: '/merge' },
    { name: m.tools.split, path: '/split' },
    { name: m.tools.compress, path: '/compress' },
    { name: m.tools.edit, path: '/edit-pdf' },
    { name: m.tools.fillSign, path: '/fill-sign-pdf' },
    { name: m.tools.rotate, path: '/rotate' },
    { name: m.tools.deletePages, path: '/delete-pages' },
    { name: m.tools.sign, path: '/sign' },
    { name: m.tools.watermark, path: '/watermark' },
    { name: m.tools.crop, path: '/crop' },
    { name: m.tools.reorderPages, path: '/reorder' },
    { name: m.tools.extractPages, path: '/extract-pages' },
    { name: m.tools.ocr, path: '/ocr' }
  ];

  const fromPdf: NavItem[] = [
    { name: m.tools.pdfToWord, path: '/pdf-to-word' },
    { name: m.tools.pdfToExcel, path: '/pdf-to-excel' },
    { name: m.tools.pdfToPpt, path: '/pdf-to-ppt' },
    { name: m.tools.pdfToJpg, path: '/to-jpg' },
    { name: m.tools.pdfToPng, path: '/to-png' }
  ];

  const toPdf: NavItem[] = [
    { name: m.tools.wordToPdf, path: '/word-to-pdf' },
    { name: m.tools.excelToPdf, path: '/excel-to-pdf' },
    { name: m.tools.pptToPdf, path: '/ppt-to-pdf' },
    { name: m.tools.jpgToPdf, path: '/jpg-to-pdf' },
    { name: m.tools.pngToPdf, path: '/png-to-pdf' }
  ];

  const toolsMid = Math.ceil(pdfTools.length / 2);
  const toolsActive = pdfTools.some((item) => pathIsActive(location.pathname, item.path));
  const convertActive = [...fromPdf, ...toPdf].some((item) => pathIsActive(location.pathname, item.path));
  const compressActive = pathIsActive(location.pathname, '/compress');
  const editActive = pathIsActive(location.pathname, '/edit-pdf');
  const signActive = pathIsActive(location.pathname, '/fill-sign-pdf') || pathIsActive(location.pathname, '/sign');

  const accountActions = signedIn ? (
    <>
      <AccountStatus status={status} />
      <Link to="/account" className="header-button account-link" onClick={closeMenu}>{m.pricing.myAccount}</Link>
      {status.paid && status.canManage && (
        <button type="button" className="header-button manage" onClick={() => { closeMenu(); void portal(); }}>{m.pricing.manage}</button>
      )}
      <hr className="account-menu-sep" />
      <button type="button" className="header-button logout" onClick={() => { closeMenu(); void logout(); }}>{m.pricing.logout}</button>
    </>
  ) : (
    <>
      {!status.paid && typeof status.remainingToday === 'number' && typeof status.dailyLimit === 'number' && (
        <span className="header-quota">{t(m.common.jobsLeft, { remaining: status.remainingToday, limit: status.dailyLimit })}</span>
      )}
      <Link to="/login" className="header-button login" onClick={closeMenu}>{m.common.login}</Link>
    </>
  );

  const renderItems = (items: NavItem[]) => items.map((item) => {
    const active = pathIsActive(location.pathname, item.path);
    return (
      <li key={item.path}>
        <Link
          to={item.path}
          className={`dropdown-item${active ? ' active' : ''}`}
          aria-current={active ? 'page' : undefined}
          onClick={closeMenu}
        >
          {item.name}
        </Link>
      </li>
    );
  });

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src="/one2pdf-logo.png?v=2" alt={m.brand} className="logo-image" />
        </Link>

        <button
          type="button"
          className={`nav-toggle${menuOpen ? ' open' : ''}`}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? m.common.closeMenu : m.common.menu}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span /><span />
        </button>

        {menuOpen && <button type="button" className="nav-backdrop" aria-label={m.common.closeMenu} onClick={closeMenu} />}

        <nav id="site-nav" className={`nav${menuOpen ? ' open' : ''}`} ref={navRef}>
          <div
            className="nav-dropdown"
            onMouseEnter={() => { if (isDesktopNav()) openNow('tools'); }}
            onMouseLeave={closeSoon}
          >
            <button
              type="button"
              className={`nav-link dropdown-toggle${openMenu === 'tools' || toolsActive ? ' active' : ''}`}
              aria-expanded={openMenu === 'tools'}
              aria-haspopup="true"
              aria-controls="nav-tools-menu"
              onClick={() => {
                if (isDesktopNav() && openMenu === 'tools') return;
                toggleMenu('tools');
              }}
            >
              {m.nav.pdfTools}
              <span className="dropdown-arrow" aria-hidden="true">
                <svg viewBox="0 0 12 8" width="10" height="7" fill="none">
                  <path d="M1.5 1.75 6 6.25 10.5 1.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {openMenu === 'tools' && (
              <div id="nav-tools-menu" className="dropdown-menu dropdown-menu-tools" role="region" aria-label={m.nav.pdfTools}>
                <ul className="dropdown-col">{renderItems(pdfTools.slice(0, toolsMid))}</ul>
                <ul className="dropdown-col">{renderItems(pdfTools.slice(toolsMid))}</ul>
                <Link to="/tools" className="dropdown-see-all" onClick={closeMenu}>
                  {m.nav.allTools} <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>

          <NavLink
            to="/compress"
            className={({ isActive }) => `nav-link${isActive || compressActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            {m.nav.compress}
          </NavLink>

          <div
            className="nav-dropdown"
            onMouseEnter={() => { if (isDesktopNav()) openNow('convert'); }}
            onMouseLeave={closeSoon}
          >
            <button
              type="button"
              className={`nav-link dropdown-toggle${openMenu === 'convert' || convertActive ? ' active' : ''}`}
              aria-expanded={openMenu === 'convert'}
              aria-haspopup="true"
              aria-controls="nav-convert-menu"
              onClick={() => {
                if (isDesktopNav() && openMenu === 'convert') return;
                toggleMenu('convert');
              }}
            >
              {m.nav.convert}
              <span className="dropdown-arrow" aria-hidden="true">
                <svg viewBox="0 0 12 8" width="10" height="7" fill="none">
                  <path d="M1.5 1.75 6 6.25 10.5 1.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {openMenu === 'convert' && (
              <div id="nav-convert-menu" className="dropdown-menu dropdown-menu-convert" role="region" aria-label={m.nav.convert}>
                <div className="dropdown-section">
                  <p className="dropdown-section-title">{m.nav.fromPdf}</p>
                  <ul className="dropdown-col">{renderItems(fromPdf)}</ul>
                </div>
                <div className="dropdown-section">
                  <p className="dropdown-section-title">{m.nav.toPdf}</p>
                  <ul className="dropdown-col">{renderItems(toPdf)}</ul>
                </div>
                <Link to="/tools" className="dropdown-see-all" onClick={closeMenu}>
                  {m.common.seeAll} <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>

          <NavLink
            to="/edit-pdf"
            className={({ isActive }) => `nav-link${isActive || editActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            {m.nav.edit}
          </NavLink>

          <NavLink
            to="/fill-sign-pdf"
            className={({ isActive }) => `nav-link${isActive || signActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            {m.home.shortcutSign}
          </NavLink>

          <div className="nav-mobile-actions">
            {accountActions}
          </div>
        </nav>

        <div className="header-end">
          <LanguageSwitcher />
          <div className="header-actions">
            {signedIn ? (
              <div className="account-menu" ref={accountRef}>
                <button
                  type="button"
                  className="account-trigger"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-controls={accountMenuId}
                  onClick={() => {
                    setOpenMenu(null);
                    setAccountOpen((open) => !open);
                  }}
                >
                  <AccountIcon />
                  <span>{m.pricing.myAccount}</span>
                  <AccountChevron />
                </button>
                {accountOpen && (
                  <div id={accountMenuId} className="account-panel" role="menu" aria-label={m.pricing.myAccount}>
                    <AccountStatus status={status} />
                    <Link to="/account" className="account-item" role="menuitem" onClick={closeMenu}>{m.pricing.myAccount}</Link>
                    {status.paid && status.canManage && (
                      <button type="button" className="account-item" role="menuitem" onClick={() => { closeMenu(); void portal(); }}>{m.pricing.manage}</button>
                    )}
                    <hr className="account-menu-sep" />
                    <button type="button" className="account-item" role="menuitem" onClick={() => { closeMenu(); void logout(); }}>{m.pricing.logout}</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="header-button login">
                <AccountIcon />
                <span>{m.common.login}</span>
              </Link>
            )}
          </div>
          <AppLauncher />
        </div>
      </div>
    </header>
  );
}

export default Header;
