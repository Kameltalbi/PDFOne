import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import './Footer.css';

function Footer() {
  const { m } = useI18n();

  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <img src="/one2pdf-logo.png?v=2" alt={m.brand} />
          </Link>
          <p>{m.home.footerTagline}</p>
        </div>
        <nav className="site-footer-cols" aria-label={m.nav.allTools}>
          <div>
            <h2>{m.common.footerTools}</h2>
            <Link to="/merge">{m.tools.merge}</Link>
            <Link to="/compress">{m.tools.compress}</Link>
            <Link to="/pdf-to-word">{m.tools.pdfToWord}</Link>
            <Link to="/word-to-pdf">{m.tools.wordToPdf}</Link>
            <Link to="/jpg-to-pdf">{m.tools.jpgToPdf}</Link>
            <Link to="/split">{m.tools.split}</Link>
            <Link to="/tools">{m.nav.allTools}</Link>
          </div>
          <div>
            <h2>{m.common.footerCompany}</h2>
            <Link to="/about">{m.common.about}</Link>
            <Link to="/pricing">{m.common.pricing}</Link>
            <Link to="/blog">{m.common.blog}</Link>
            <Link to="/contact">{m.common.contact}</Link>
          </div>
          <div>
            <h2>{m.common.footerLegal}</h2>
            <Link to="/privacy">{m.common.privacy}</Link>
            <Link to="/contact">{m.common.contact}</Link>
          </div>
        </nav>
      </div>
      <div className="site-footer-bottom">
        <span>{m.home.copyright}</span>
        <span>{m.home.filesDeleted}</span>
      </div>
    </footer>
  );
}

export default Footer;
