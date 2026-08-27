import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import './Home.css';
import heroImage from '../assets/pdfone-hero.png';

function Home() {
  const { m } = useI18n();
  const tools = [
    { name: m.tools.edit, description: m.home.toolEditDesc, icon: 'T', path: '/edit-pdf', tone: 'red' },
    { name: m.tools.merge, description: m.home.toolMergeDesc, icon: '⇄', path: '/merge', tone: 'orange' },
    { name: m.tools.split, description: m.home.toolSplitDesc, icon: '✂', path: '/split', tone: 'blue' },
    { name: m.tools.compress, description: m.home.toolCompressDesc, icon: '⇊', path: '/compress', tone: 'blue' },
    { name: m.tools.pdfToJpg, description: m.home.toolJpgDesc, icon: 'JPG', path: '/to-jpg', tone: 'green' },
    { name: m.tools.protect, description: m.home.toolProtectDesc, icon: '✓', path: '/protect', tone: 'orange' }
  ];

  return <div className="pro-home">
    <main>
      <section className="pro-hero">
        <div className="pro-hero-glow one" /><div className="pro-hero-glow two" />
        <div className="pro-hero-inner">
          <div className="pro-hero-copy">
            <span className="pro-eyebrow"><i /> {m.home.eyebrow}</span>
            <h1>{m.home.title}<br /><span>{m.home.titleAccent}</span></h1>
            <p>{m.home.subtitle}</p>
            <div className="pro-hero-actions">
              <Link to="/edit-pdf" className="pro-btn primary">{m.home.ctaEdit} <span>→</span></Link>
              <Link to="/tools" className="pro-btn secondary">{m.home.ctaTools}</Link>
            </div>
            <div className="pro-trust-row"><span>✓ {m.home.trustInstall}</span><span>✓ {m.home.trustSize}</span><span>✓ {m.home.trustDelete}</span></div>
          </div>

          <div className="pro-product-visual" aria-label={m.home.previewAria}>
            <div className="pro-hero-photo"><img src={heroImage} alt={m.home.heroAlt} /></div>
            <div className="pro-floating-card secure"><span>✓</span><div><b>{m.home.cardSecure}</b><small>{m.home.cardSecureSmall}</small></div></div>
            <div className="pro-floating-card fast"><span>⚡</span><div><b>{m.home.cardFast}</b><small>{m.home.cardFastSmall}</small></div></div>
          </div>
        </div>
      </section>

      <section className="pro-tools-section">
        <div className="pro-section-heading"><div><span>{m.home.popularLabel}</span><h2>{m.home.popularTitle}</h2></div><Link to="/tools">{m.home.seeAllTools} <b>→</b></Link></div>
        <div className="pro-tools-grid">{tools.map((tool) => <Link key={tool.path} to={tool.path} className="pro-tool-card"><span className={`pro-tool-icon ${tool.tone}`}>{tool.icon}</span><div><h3>{tool.name}</h3><p>{tool.description}</p></div><b className="pro-tool-arrow">→</b></Link>)}</div>
      </section>

      <section className="pro-process">
        <div className="pro-process-copy"><span className="pro-section-label">{m.home.processLabel}</span><h2>{m.home.processTitle}</h2><p>{m.home.processText}</p><Link to="/edit-pdf" className="pro-text-link">{m.home.processCta} <span>→</span></Link></div>
        <div className="pro-steps">
          <article><span>01</span><div><h3>{m.home.step1Title}</h3><p>{m.home.step1Text}</p></div></article>
          <article><span>02</span><div><h3>{m.home.step2Title}</h3><p>{m.home.step2Text}</p></div></article>
          <article><span>03</span><div><h3>{m.home.step3Title}</h3><p>{m.home.step3Text}</p></div></article>
        </div>
      </section>

      <section className="pro-values">
        <article><span>⌁</span><h3>{m.home.value1Title}</h3><p>{m.home.value1Text}</p></article>
        <article><span>◈</span><h3>{m.home.value2Title}</h3><p>{m.home.value2Text}</p></article>
        <article><span>◎</span><h3>{m.home.value3Title}</h3><p>{m.home.value3Text}</p></article>
        <article><span>◇</span><h3>{m.home.value4Title}</h3><p>{m.home.value4Text}</p></article>
      </section>

      <section className="pro-final-cta"><div><span>{m.home.ctaLabel}</span><h2>{m.home.ctaTitle}</h2><p>{m.home.ctaText}</p></div><Link to="/tools" className="pro-btn light">{m.home.ctaButton} <span>→</span></Link></section>
    </main>
  </div>;
}

export default Home;
