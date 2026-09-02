import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './About.css';

const categories = [
  { key: 'convert', to: '/pdf-to-word', icon: 'W' },
  { key: 'compress', to: '/compress', icon: '⇊' },
  { key: 'merge', to: '/merge', icon: '⇄' },
  { key: 'split', to: '/split', icon: '✂' },
  { key: 'organize', to: '/reorder', icon: '☰' },
  { key: 'ocr', to: '/ocr', icon: 'Aa' }
] as const;

function About() {
  const { m } = useI18n();
  const a = m.about;
  usePageSeo(a.seoTitle, a.seoDescription);

  const cats = [
    { ...categories[0], title: a.catConvert, text: a.catConvertText },
    { ...categories[1], title: a.catCompress, text: a.catCompressText },
    { ...categories[2], title: a.catMerge, text: a.catMergeText },
    { ...categories[3], title: a.catSplit, text: a.catSplitText },
    { ...categories[4], title: a.catOrganize, text: a.catOrganizeText },
    { ...categories[5], title: a.catOcr, text: a.catOcrText }
  ];

  const principles = [
    { title: a.principle1Title, text: a.principle1Text },
    { title: a.principle2Title, text: a.principle2Text },
    { title: a.principle3Title, text: a.principle3Text },
    { title: a.principle4Title, text: a.principle4Text },
    { title: a.principle5Title, text: a.principle5Text }
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-inner">
          <p className="about-kicker">{m.common.about}</p>
          <h1>{a.h1}</h1>
          <p className="about-hero-lead">{a.heroP1}</p>
          <p className="about-hero-sub">{a.heroP2}</p>
          <div className="about-pills">
            <article>
              <strong>{a.pill1Title}</strong>
              <span>{a.pill1Text}</span>
            </article>
            <article>
              <strong>{a.pill2Title}</strong>
              <span>{a.pill2Text}</span>
            </article>
            <article>
              <strong>{a.pill3Title}</strong>
              <span>{a.pill3Text}</span>
            </article>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-copy">
          <p className="about-kicker">{a.platformKicker}</p>
          <h2>{a.platformTitle}</h2>
          <p>{a.platformP1}</p>
          <p>{a.platformP2}</p>
          <p>{a.platformP3}</p>
          <p className="about-emphasis">{a.platformClose}</p>
        </div>
        <div className="about-cats">
          {cats.map((cat) => (
            <Link key={cat.to} className="about-cat" to={cat.to}>
              <span className="about-cat-icon" aria-hidden="true">{cat.icon}</span>
              <b>{cat.title}</b>
              <span>{cat.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-how">
        <div className="about-how-inner">
          <div className="about-copy about-copy-center">
            <p className="about-kicker">{a.howKicker}</p>
            <h2>{a.howTitle}</h2>
          </div>
          <ol className="about-steps">
            <li>
              <span>01</span>
              <div>
                <h3>{a.how1Title}</h3>
                <p>{a.how1Text}</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>{a.how2Title}</h3>
                <p>{a.how2Text}</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>{a.how3Title}</h3>
                <p>{a.how3Text}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="about-band">
        <div className="about-band-inner">
          <p className="about-kicker">{a.freeKicker}</p>
          <h2>{a.freeTitle}</h2>
          <p>{a.freeP1}</p>
          <p>{a.freeP2}</p>
          <p>{a.freeP3}</p>
          <p>{a.freeP4}</p>
          <Link className="about-btn" to="/tools">{a.freeCta} <span>→</span></Link>
        </div>
      </section>

      <section className="about-section">
        <div className="about-copy">
          <p className="about-kicker">{a.privacyKicker}</p>
          <h2>{a.privacyTitle}</h2>
          <p>{a.privacyP1}</p>
          <p className="about-emphasis">{a.privacyP2}</p>
          <p>{a.privacyP3}</p>
          <p>{a.privacyP4}</p>
          <Link className="about-text-link" to="/privacy">{a.privacyLink} →</Link>
        </div>
      </section>

      <section className="about-section about-plans">
        <div className="about-copy">
          <p className="about-kicker">{a.plansKicker}</p>
          <h2>{a.plansTitle}</h2>
          <p>{a.plansP1}</p>
          <p>{a.plansP2}</p>
          <p>{a.plansP3}</p>
          <ul className="about-plan-list">
            {a.plansItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="about-btn ghost" to="/pricing">{a.plansCta} <span>→</span></Link>
        </div>
      </section>

      <section className="about-section">
        <div className="about-copy">
          <p className="about-kicker">{a.principlesKicker}</p>
          <h2>{a.principlesTitle}</h2>
        </div>
        <div className="about-principles">
          {principles.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-copy">
          <p className="about-kicker">{a.intlKicker}</p>
          <h2>{a.intlTitle}</h2>
          <p>{a.intlP1}</p>
          <p>{a.intlP2}</p>
        </div>
      </section>

      <section className="about-section about-legal">
        <div className="about-copy">
          <p className="about-kicker">{a.legalKicker}</p>
          <h2>{a.legalTitle}</h2>
          <p>{a.legalP1}</p>
          <p>{a.legalP2}</p>
        </div>
      </section>

      <section className="about-final">
        <h2>{a.finalTitle}</h2>
        <p>{a.finalText}</p>
        <div className="about-final-actions">
          <Link className="about-btn" to="/tools">{a.finalCta} <span>→</span></Link>
          <Link className="about-btn ghost" to="/contact">{a.finalContact}</Link>
        </div>
      </section>
    </div>
  );
}

export default About;
