import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Legal.css';

function About() {
  const { m } = useI18n();
  usePageSeo(m.about.seoTitle, m.about.seoDescription);

  return (
    <main className="legal-page">
      <article className="legal-panel about-panel">
        <p className="legal-eyebrow">{m.common.about}</p>
        <h1>{m.about.title}</h1>
        <p className="legal-lead">{m.about.lead}</p>
        <p>{m.about.p1}</p>
        <p>{m.about.p2}</p>
        <p>{m.about.company}</p>
        <p>
          <Link className="legal-mail" to="/tools">{m.about.cta} →</Link>
        </p>
      </article>
    </main>
  );
}

export default About;
