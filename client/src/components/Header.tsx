import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { remainingLabel } from '../lib/account';
import { useBilling } from '../lib/billing';
import './Header.css';

type MenuId = 'editor' | 'convert';
type NavItem = { name: string; path: string };

function isDesktopNav() {
  return window.matchMedia('(min-width: 1121px)').matches;
}

function pathIsActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function Header() {
  const { m, t } = useI18n();
  const { status, logout, portal } = useBilling();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef(0);

  useEffect(() => {
    setMenuOpen(false);
    setOpenMenu(null);
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
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
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
  };

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

  const editorTools: NavItem[] = [
    { name: m.tools.edit, path: '/edit-pdf' },
    { name: m.tools.fillSign, path: '/fill-sign-pdf' },
    { name: m.tools.merge, path: '/merge' },
    { name: m.tools.split, path: '/split' },
    { name: m.tools.compress, path: '/compress' },
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

  const editorMid = Math.ceil(editorTools.length / 2);
  const editorActive = editorTools.some((item) => pathIsActive(location.pathname, item.path));
  const convertActive = [...fromPdf, ...toPdf].some((item) => pathIsActive(location.pathname, item.path));

  const accountActions = status.user || status.paid ? (
    <>
      <Link to="/account" className="header-plan" onClick={closeMenu}>
        {status.paid ? m.pricing.accountPro : (status.user?.name || m.pricing.myAccount)}
        {status.paid && status.expiresAt && <em>{remainingLabel(status.expiresAt, t, m)}</em>}
      </Link>
      {status.paid && status.canManage && (
        <button type="button" className="header-button login" onClick={() => { closeMenu(); void portal(); }}>{m.pricing.manage}</button>
      )}
      <button type="button" className="header-button logout" onClick={() => { closeMenu(); void logout(); }}>{m.pricing.logout}</button>
    </>
  ) : (
    <>
      <Link to="/login" className="header-button login" onClick={closeMenu}>{m.common.login}</Link>
      <Link to="/pricing" className="header-button signup" onClick={closeMenu}>{m.common.getPro}</Link>
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
            onMouseEnter={() => { if (isDesktopNav()) openNow('editor'); }}
            onMouseLeave={closeSoon}
          >
            <button
              type="button"
              className={`nav-link dropdown-toggle${openMenu === 'editor' || editorActive ? ' active' : ''}`}
              aria-expanded={openMenu === 'editor'}
              aria-haspopup="true"
              aria-controls="nav-editor-menu"
              onClick={() => {
                if (isDesktopNav() && openMenu === 'editor') return;
                toggleMenu('editor');
              }}
            >
              {m.nav.editor}
              <span className="dropdown-arrow" aria-hidden="true">
                <svg viewBox="0 0 12 8" width="10" height="7" fill="none">
                  <path d="M1.5 1.75 6 6.25 10.5 1.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {openMenu === 'editor' && (
              <div id="nav-editor-menu" className="dropdown-menu dropdown-menu-tools" role="region" aria-label={m.nav.editor}>
                <ul className="dropdown-col">{renderItems(editorTools.slice(0, editorMid))}</ul>
                <ul className="dropdown-col">{renderItems(editorTools.slice(editorMid))}</ul>
                <Link to="/tools" className="dropdown-see-all" onClick={closeMenu}>
                  {m.nav.allTools} <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>

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

          <NavLink to="/pricing" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>{m.common.pricing}</NavLink>
          <div className="nav-mobile-actions">
            {accountActions}
          </div>
        </nav>

        <div className="header-actions">
          {status.user || status.paid ? (
            <>
              <Link to="/account" className="header-plan">
                {status.paid ? m.pricing.accountPro : (status.user?.name || m.pricing.myAccount)}
                {status.paid && status.expiresAt && <em>{remainingLabel(status.expiresAt, t, m)}</em>}
              </Link>
              {status.paid && status.canManage && (
                <button type="button" className="header-button login" onClick={() => void portal()}>{m.pricing.manage}</button>
              )}
              <button type="button" className="header-button logout" onClick={() => void logout()}>{m.pricing.logout}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-button login">{m.common.login}</Link>
              <Link to="/pricing" className="header-button signup">{m.common.getPro}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
