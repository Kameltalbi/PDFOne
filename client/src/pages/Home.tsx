import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdBanner } from '../components/AdBanner';
import { useI18n } from '../i18n';
import { useJsonLd, websiteJsonLd } from '../lib/jsonLd';
import { usePageSeo } from '../lib/usePageSeo';
import { useUpgrade } from '../lib/upgrade';
import { maxFileBytes, maxFileLabel } from '../lib/limits';
import { useBilling } from '../lib/billing';
import { trackFileUpload } from '../lib/analytics';
import type { IncomingPdfState } from '../lib/incomingPdf';
import './Home.css';

const shortcutGlyphs = {
  merge: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 5.5h5.5M4 10h5.5M4 14.5h5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12.2 6.2 16 10l-3.8 3.8M16 10H11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  compress: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 3.8h8v3.2H6zM6 13h8v3.2H6z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8.2v3.6M8 10.2l2 1.8 2-1.8M8 9.8l2-1.8 2 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.2 15.8 5 12.2 13.4 3.8a1.6 1.6 0 0 1 2.3 0l.5.5a1.6 1.6 0 0 1 0 2.3L8 14.8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12.4 5.1l2.5 2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  sign: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 15.2c1.6-1.8 2.6-2.3 4.1-1.2 1.8 1.3 2.4-1.6 4.2-.4 1.4.9 2.3 1.4 4.7.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13.2 4.2 16 7l-7.4 7.4-3 .6.6-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  word: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3.2" y="3.2" width="13.6" height="13.6" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.4 7.2 8.1 12.8 10 8.6l1.9 4.2 1.7-5.6" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3.2" y="3.2" width="5.4" height="5.4" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11.4" y="3.2" width="5.4" height="5.4" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.2" y="11.4" width="5.4" height="5.4" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11.4" y="11.4" width="5.4" height="5.4" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
} as const;

function Home() {
  const { m, t } = useI18n();
  usePageSeo(m.home.seoTitle, m.home.seoDescription);
  useJsonLd('one2pdf-website', websiteJsonLd());
  const navigate = useNavigate();
  const { status } = useBilling();
  const { allowFile } = useUpgrade();
  const pickerId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxBytes = maxFileBytes(status.paid);
  const sizeLabel = maxFileLabel(status.paid);

  const acceptPdf = (incoming: File | undefined) => {
    if (!incoming) return;
    if (incoming.type !== 'application/pdf' && !incoming.name.toLowerCase().endsWith('.pdf')) {
      setError(m.common.pdfOnly);
      return;
    }
    if (!allowFile(incoming)) return;
    if (incoming.size > maxBytes) {
      setError(t(m.common.fileTooLarge, { name: incoming.name, size: sizeLabel }));
      return;
    }
    setError(null);
    setFile(incoming);
    trackFileUpload(incoming);
  };

  const goWithFile = (path: string) => {
    if (!file) return;
    navigate(path, { state: { incomingPdf: file } satisfies IncomingPdfState });
  };

  const shortcuts = [
    { label: m.tools.merge, path: '/merge', tone: 'blue', glyph: 'merge' },
    { label: m.tools.compress, path: '/compress', tone: 'red', glyph: 'compress' },
    { label: m.tools.edit, path: '/edit-pdf', tone: 'purple', glyph: 'edit' },
    { label: m.home.shortcutSign, path: '/fill-sign-pdf', tone: 'green', glyph: 'sign' },
    { label: m.home.shortcutPdfToWord, path: '/pdf-to-word', tone: 'navy', glyph: 'word' },
    { label: m.home.shortcutAll, path: '/tools', tone: 'slate', glyph: 'grid' }
  ] as const;

  const actions = shortcuts.filter((item) => item.path !== '/tools');

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
          <h1>
            <span className="pro-hero-title-main">{m.home.title}</span>
            <span className="pro-hero-title-accent">{m.home.titleAccent}</span>
          </h1>

          <p className="pro-hero-lede">{m.home.subtitle}</p>

          <nav className="pro-hero-shortcuts" aria-label={m.common.tools}>
            {shortcuts.map((item) => (
              <Link key={item.path} to={item.path} className={`tone-${item.tone}`}>
                <span className="pro-hero-shortcut-icon">{shortcutGlyphs[item.glyph]}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pro-trust-row">
            <span>✓ {m.home.trustSize}</span>
            <span>✓ {m.home.trustInstall}</span>
            <span>✓ {m.home.trustDelete}</span>
          </div>

          <div className="pro-hero-upload">
            {file ? (
              <div className="pro-hero-chooser" role="region" aria-label={m.home.chooseActionTitle}>
                <div className="pro-hero-chooser-file">
                  <strong title={file.name}>{file.name}</strong>
                  <button type="button" onClick={() => { setFile(null); setError(null); }}>{m.home.chooseActionChange}</button>
                </div>
                <p className="pro-hero-chooser-title">{m.home.chooseActionTitle}</p>
                <div className="pro-hero-chooser-grid">
                  {actions.map((action) => (
                    <button key={action.path} type="button" onClick={() => goWithFile(action.path)}>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <label
                htmlFor={pickerId}
                className={`pro-drop ${isDragging ? 'over' : ''}`}
                aria-label={m.home.dropAria}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    document.getElementById(pickerId)?.click();
                  }
                }}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  acceptPdf(event.dataTransfer.files[0]);
                }}
              >
                <span className="pro-drop-icon" aria-hidden="true">
                  <svg viewBox="0 0 64 74" fill="none">
                    <path d="M10 4h28l16 16v42a8 8 0 0 1-8 8H10a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8Z" fill="#fecdd3" />
                    <path d="M38 4v12a4 4 0 0 0 4 4h16" fill="#fda4af" />
                    <path d="M2 30h50v16H2z" fill="#e11d48" />
                    <text x="27" y="42" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800" fontFamily="system-ui,sans-serif">PDF</text>
                    <circle cx="48" cy="60" r="12.5" fill="#fff" />
                    <circle cx="48" cy="60" r="10.5" fill="#e11d48" />
                    <path d="M48 55.4v8.4M44.6 58.8 48 55.4l3.4 3.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="pro-drop-title">{m.home.dropTitle}</span>
                <span className="pro-drop-choose">{m.home.dropChoose}</span>
                <span className="pro-drop-cta">
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M10 14.5V5.5M6.5 8.5 10 5l3.5 3.5M4 16.2h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {m.home.dropCta}
                </span>
                <span className="pro-drop-hint">{m.home.dropHint}</span>
              </label>
            )}
            <input
              id={pickerId}
              type="file"
              accept="application/pdf,.pdf"
              className="pro-drop-input"
              tabIndex={-1}
              onChange={(event) => {
                acceptPdf(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            {error && <p className="pro-drop-error" role="alert">{error}</p>}
          </div>
        </div>
      </section>

      <section className="pro-tools-section" id="popular-tools">
        <div className="pro-section-heading"><div><span>{m.home.popularLabel}</span><h2>{m.home.popularTitle}</h2></div><Link to="/tools">{m.home.seeAllTools} <b>→</b></Link></div>
        <div className="pro-tools-grid">{tools.map((tool) => <Link key={tool.path + tool.name} to={tool.path} className="pro-tool-card"><span className={`pro-tool-icon ${tool.tone}`}>{tool.icon}</span><div><h3>{tool.name}</h3><p>{tool.description}</p></div><b className="pro-tool-arrow">→</b></Link>)}</div>
        <AdBanner />
      </section>

      <section className="pro-plans" aria-labelledby="home-plans-title">
        <div className="pro-plans-inner">
          <header className="pro-plans-intro">
            <span className="pro-section-label">{m.home.plansLabel}</span>
            <h2 id="home-plans-title">{m.home.plansTitle}</h2>
            <p>{m.home.plansSubtitle}</p>
          </header>

          <div className="pro-plans-grid">
            <article className="pro-plan-card">
              <p className="pro-plan-kicker">{m.home.plansFreeLabel}</p>
              <h3>{m.home.plansFreeTitle}</h3>
              <p className="pro-plan-desc">{m.home.plansFreeDesc}</p>
              <ul>
                {m.home.plansFreePoints.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <Link to="/tools" className="pro-btn secondary">{m.home.plansFreeCta}</Link>
            </article>

            <article className="pro-plan-card featured">
              <p className="pro-plan-kicker">{m.home.plansPassLabel}</p>
              <h3>{m.home.plansPassTitle}</h3>
              <p className="pro-plan-desc">{m.home.plansPassDesc}</p>
              <ul>
                {m.home.plansPassPoints.map((item) => <li key={item}>{item}</li>)}
                <li className="pro-plan-highlight">{m.home.plansPassHighlight}</li>
              </ul>
              <Link to="/pricing" className="pro-btn primary">{m.home.plansPassCta}</Link>
            </article>

            <article className="pro-plan-card">
              <p className="pro-plan-kicker">{m.home.plansProLabel}</p>
              <h3>{m.home.plansProTitle}</h3>
              <p className="pro-plan-desc">{m.home.plansProDesc}</p>
              <ul>
                {m.home.plansProPoints.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <Link to="/pricing" className="pro-btn secondary">{m.home.plansProCta}</Link>
            </article>
          </div>

          <div className="pro-plans-reassure">
            <p className="pro-plans-reassure-title">{m.home.plansReassureTitle}</p>
            <p>{m.home.plansReassureText}</p>
            <ul>
              {m.home.plansReassureItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <Link to="/pricing" className="pro-plans-see">{m.home.plansSeeAll} <span aria-hidden="true">→</span></Link>
          </div>
        </div>
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
        <div className="pro-process-copy"><span className="pro-section-label">{m.home.processLabel}</span><h2>{m.home.processTitle}</h2><p>{m.home.processText}</p><Link to="/edit-pdf" className="pro-text-link">{m.home.processCta} <span>→</span></Link></div>
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
        </div>
        <Link to="/tools" className="pro-btn light">{m.home.ctaButton} <span>→</span></Link>
      </section>
    </main>
  </div>;
}

export default Home;
