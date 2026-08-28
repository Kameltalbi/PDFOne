import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { useBilling } from '../lib/billing';
import './Header.css';

function Header() {
  const { m } = useI18n();
  const { status, logout, portal } = useBilling();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    if (!menuOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('nav-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const fromPDF = [
    { name: m.tools.pdfToWord, path: '/pdf-to-word', icon: 'W' },
    { name: m.tools.pdfToExcel, path: '/pdf-to-excel', icon: 'X' },
    { name: m.tools.pdfToPpt, path: '/pdf-to-ppt', icon: 'P' },
    { name: m.tools.pdfToJpg, path: '/to-jpg', icon: '🖼️' },
    { name: m.tools.pdfToPng, path: '/to-png', icon: 'PNG' },
    { name: m.tools.pdfToText, path: '/pdf-to-text', icon: 'TXT' }
  ];

  const toPDF = [
    { name: m.tools.wordToPdf, path: '/word-to-pdf', icon: 'W' },
    { name: m.tools.excelToPdf, path: '/excel-to-pdf', icon: 'X' },
    { name: m.tools.pptToPdf, path: '/ppt-to-pdf', icon: 'P' },
    { name: m.tools.jpgToPdf, path: '/jpg-to-pdf', icon: '🖼️' },
    { name: m.tools.pngToPdf, path: '/png-to-pdf', icon: '🖼️' },
    { name: m.tools.htmlToPdf, path: '/html-to-pdf', icon: '</>' }
  ];

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

        <nav id="site-nav" className={`nav${menuOpen ? ' open' : ''}`}>
          <div className="nav-dropdown" ref={dropdownRef}>
            <button type="button" className="nav-link dropdown-toggle" onClick={() => setIsDropdownOpen((open) => !open)}>
              {m.nav.convert}
              <span className="dropdown-arrow">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-section">
                  <h4 className="dropdown-section-title">{m.nav.fromPdf}</h4>
                  {fromPDF.map((item) => (
                    <Link key={item.path} to={item.path} className="dropdown-item" onClick={closeMenu}>
                      <span className="dropdown-item-icon">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="dropdown-section">
                  <h4 className="dropdown-section-title">{m.nav.toPdf}</h4>
                  {toPDF.map((item) => (
                    <Link key={item.path} to={item.path} className="dropdown-item" onClick={closeMenu}>
                      <span className="dropdown-item-icon">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                  <Link to="/tools" className="dropdown-item see-all" onClick={closeMenu}>
                    <span className="dropdown-item-icon">📋</span>
                    {m.common.seeAll}
                  </Link>
                </div>
              </div>
            )}
          </div>
          <NavLink to="/tools" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>{m.nav.allTools}</NavLink>
          <NavLink to="/merge" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>{m.nav.merge}</NavLink>
          <NavLink to="/compress" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>{m.nav.compress}</NavLink>
          <NavLink to="/edit-pdf" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>{m.nav.edit}</NavLink>
          <div className="nav-mobile-actions">
            {status.paid ? (
              <>
                {status.canManage && (
                  <button type="button" className="header-button login" onClick={() => { closeMenu(); void portal(); }}>{m.pricing.manage}</button>
                )}
                <button type="button" className="header-button logout" onClick={() => { closeMenu(); void logout(); }}>{m.pricing.logout}</button>
              </>
            ) : (
              <Link to="/pricing" className="header-button signup" onClick={closeMenu}>{m.common.signup}</Link>
            )}
          </div>
        </nav>

        <div className="header-actions">
          {status.paid ? (
            <>
              <span className="header-plan">{m.pricing.accountPro}</span>
              {status.canManage && (
                <button type="button" className="header-button login" onClick={() => void portal()}>{m.pricing.manage}</button>
              )}
              <button type="button" className="header-button logout" onClick={() => void logout()}>{m.pricing.logout}</button>
            </>
          ) : (
            <Link to="/pricing" className="header-button signup">{m.common.signup}</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
