import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import './Footer.css';

function Footer() {
  const { m } = useI18n();

  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <Link to="/" className="site-footer-logo">
          <img src="/one2pdf-logo.png?v=2" alt={m.brand} />
        </Link>
        <p>{m.home.footerTagline}</p>
        <nav>
          <Link to="/tools">{m.nav.allTools}</Link>
          <Link to="/pricing">{m.common.pricing}</Link>
          <Link to="/edit-pdf">{m.tools.edit}</Link>
          <Link to="/privacy">{m.common.privacy}</Link>
          <Link to="/blog">{m.common.blog}</Link>
          <Link to="/contact">{m.common.contact}</Link>
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
