import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useI18n } from '../i18n';
import { faqPageJsonLd, pageUrl, useJsonLd } from '../lib/jsonLd';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { RelatedTools } from '../components/RelatedTools';
import '../components/Studio.css';
import './Tools.css';

/** Translate PDF is temporarily marked Soon — marketing SEO page kept for discovery. */
export default function Translate() {
  const { m } = useI18n();
  const copy = m.translatePdf;
  usePageSeo(copy.seoTitle, copy.seoDescription);
  const seo = landingSeoFrom(copy);
  const faqJsonLd = useMemo(
    () => (seo.faq?.length ? faqPageJsonLd(seo.faq, pageUrl('/translate')) : null),
    [seo.faq]
  );
  useJsonLd('one2pdf-faq-translate', faqJsonLd);

  return (
    <main className="pdf-tools-page">
      <div className="studio-landing">
        <p className="pdf-tools-eyebrow">{m.tools.badgeSoon}</p>
        <h1>
          {copy.title}
          <span className="studio-star" aria-hidden="true">☆</span>
        </h1>
        <p className="studio-subtitle">{copy.subtitle}</p>
        <p className="studio-or" role="status">
          <strong>{m.tools.badgeSoon}</strong>
          {' — '}
          <Link to="/tools">{m.home.seeAllTools}</Link>
        </p>

        <section className="studio-features">
          {copy.features.map((feature) => (
            <article key={feature.title}>
              <span className={`studio-feature-icon ${feature.tone}`}>{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>

        {seo.howSteps && seo.howSteps.length > 0 && (
          <section className="studio-how" aria-labelledby="studio-how-title">
            <h2 id="studio-how-title">{seo.howTitle}</h2>
            <ol>
              {seo.howSteps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="studio-seo">
          <h2>{seo.h2}</h2>
          {seo.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </section>

        {seo.faq && seo.faq.length > 0 && (
          <section className="studio-faq" aria-labelledby="studio-faq-title">
            <h2 id="studio-faq-title">{seo.faqTitle}</h2>
            {seo.faq.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </section>
        )}

        <RelatedTools />
      </div>
    </main>
  );
}
