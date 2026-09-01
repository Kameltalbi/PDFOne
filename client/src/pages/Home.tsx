import { Link } from 'react-router-dom';
import { AdBanner } from '../components/AdBanner';
import { useI18n } from '../i18n';
import { useJsonLd, websiteJsonLd } from '../lib/jsonLd';
import { usePageSeo } from '../lib/usePageSeo';
import './Home.css';
import heroImage from '../assets/pdfone-hero.png';

function Home() {
  const { m } = useI18n();
  usePageSeo(m.home.seoTitle, m.home.seoDescription);
  useJsonLd('one2pdf-website', websiteJsonLd());

  const tools = [
    { name: m.tools.merge, description: m.home.toolMergeDesc, icon: '⇄', path: '/merge', tone: 'orange' },
    { name: m.tools.compress, description: m.home.toolCompressDesc, icon: '⇊', path: '/compress', tone: 'blue' },
    { name: m.tools.pdfToWord, description: m.home.toolPdfToWordDesc, icon: 'W', path: '/pdf-to-word', tone: 'blue' },
    { name: m.tools.wordToPdf, description: m.home.toolWordToPdfDesc, icon: 'W', path: '/word-to-pdf', tone: 'orange' },
    { name: m.tools.jpgToPdf, description: m.home.toolJpgToPdfDesc, icon: 'JPG', path: '/jpg-to-pdf', tone: 'green' },
    { name: m.tools.split, description: m.home.toolSplitDesc, icon: '✂', path: '/split', tone: 'red' }
  ];

  return <div className="pro-home">
    <main>
      <section className="pro-hero">
        <div className="pro-hero-glow one" /><div className="pro-hero-glow two" />
        <div className="pro-hero-inner">
          <div className="pro-hero-copy">
            <span className="pro-eyebrow"><i /> {m.home.eyebrow}</span>
            <h1>
              <span className="pro-hero-title-main">{m.home.title}</span>
              {m.home.titleAccent ? <span className="pro-hero-title-accent">{m.home.titleAccent}</span> : null}
            </h1>
            <p>{m.home.subtitle}</p>
            <div className="pro-hero-actions">
              <Link to="/tools" className="pro-btn primary">{m.home.ctaTools} <span>→</span></Link>
            </div>
            <div className="pro-trust-row">
              <span>✓ {m.home.trustLine}</span>
              <span>✓ {m.home.trustInstall}</span>
              <span>✓ {m.home.trustDelete}</span>
            </div>
          </div>

          <div className="pro-product-visual" aria-label={m.home.previewAria}>
            <div className="pro-hero-photo"><img src={heroImage} alt={m.home.heroAlt} /></div>
            <div className="pro-floating-card secure"><span>✓</span><div><b>{m.home.cardSecure}</b><small>{m.home.cardSecureSmall}</small></div></div>
            <div className="pro-floating-card fast"><span>⚡</span><div><b>{m.home.cardFast}</b><small>{m.home.cardFastSmall}</small></div></div>
          </div>
        </div>
      </section>

      <section className="pro-tools-section" id="popular-tools">
        <div className="pro-section-heading"><div><span>{m.home.popularLabel}</span><h2>{m.home.popularTitle}</h2></div><Link to="/tools">{m.home.seeAllTools}</Link></div>
        <div className="pro-tools-grid">{tools.map((tool) => <Link key={tool.path + tool.name} to={tool.path} className="pro-tool-card"><span className={`pro-tool-icon ${tool.tone}`}>{tool.icon}</span><div><h3>{tool.name}</h3><p>{tool.description}</p></div><b className="pro-tool-arrow">→</b></Link>)}</div>
        <AdBanner />
      </section>

      <section className="pro-values" aria-label={m.home.value1Title}>
        <article><span>⌁</span><h3>{m.home.value1Title}</h3><p>{m.home.value1Text}</p></article>
        <article><span>◈</span><h3>{m.home.value2Title}</h3><p>{m.home.value2Text}</p></article>
        <article><span>◎</span><h3>{m.home.value3Title}</h3><p>{m.home.value3Text}</p></article>
        <article><span>◇</span><h3>{m.home.value4Title}</h3><p>{m.home.value4Text}</p></article>
      </section>

      <section className="pro-privacy" aria-labelledby="home-privacy-title">
        <div className="pro-privacy-inner">
          <div className="pro-privacy-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 3 6 7.5v8.2c0 6.2 4.1 10.4 10 12.3 5.9-1.9 10-6.1 10-12.3V7.5L16 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="m11.4 16.1 3.1 3.1 6.1-6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="pro-privacy-copy">
            <p className="pro-privacy-kicker">{m.home.privacyKicker}</p>
            <h2 id="home-privacy-title">{m.home.privacyTitle}</h2>
            <p>{m.home.privacyText}</p>
            <ul>
              <li>{m.home.privacyNeverStored}</li>
              <li>{m.home.privacyAutoDelete}</li>
              <li>{m.home.privacyNoShare}</li>
            </ul>
            <Link to="/privacy" className="pro-privacy-link">{m.home.privacyLearnMore} →</Link>
          </div>
        </div>
      </section>

      <section className="pro-process">
        <div className="pro-process-copy"><span className="pro-section-label">{m.home.processLabel}</span><h2>{m.home.processTitle}</h2><p>{m.home.processText}</p><Link to="/tools" className="pro-text-link">{m.home.processCta} <span>→</span></Link></div>
        <div className="pro-steps">
          <article><span>01</span><div><h3>{m.home.step1Title}</h3><p>{m.home.step1Text}</p></div></article>
          <article><span>02</span><div><h3>{m.home.step2Title}</h3><p>{m.home.step2Text}</p></div></article>
          <article><span>03</span><div><h3>{m.home.step3Title}</h3><p>{m.home.step3Text}</p></div></article>
        </div>
      </section>

      <section className="pro-final-cta">
        <div>
          <span>{m.home.ctaLabel}</span>
          <h2>{m.home.ctaTitle}</h2>
          <p>{m.home.ctaText}</p>
          <ul className="pro-pro-benefits">
            {m.home.proBenefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <Link to="/pricing" className="pro-btn light">{m.home.ctaButton} <span>→</span></Link>
      </section>
    </main>
  </div>;
}

export default Home;
