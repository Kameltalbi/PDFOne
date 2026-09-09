import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Tools.css';

/** Translate PDF is temporarily marked Soon — UI kept for future work together. */
export default function Translate() {
  const { m } = useI18n();
  usePageSeo(`${m.translatePdf.title} | One2PDF`, m.translatePdf.subtitle);

  return (
    <main className="pdf-tools-page">
      <section className="pdf-tools-intro" style={{ paddingBottom: '4rem' }}>
        <p className="pdf-tools-eyebrow">{m.tools.badgeSoon}</p>
        <h1>{m.translatePdf.title}</h1>
        <p>{m.translatePdf.subtitle}</p>
        <p style={{ marginTop: '1.25rem', color: '#64748b' }}>
          <Link to="/tools" style={{ color: '#0050f8', fontWeight: 700 }}>{m.home.seeAllTools}</Link>
        </p>
      </section>
    </main>
  );
}
