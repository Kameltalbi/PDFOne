import { useI18n } from '../i18n';
import './Legal.css';

function Privacy() {
  const { m } = useI18n();
  return (
    <main className="legal-page">
      <article className="legal-panel">
        <p className="legal-eyebrow">{m.common.privacy}</p>
        <h1>{m.legal.privacyTitle}</h1>
        <p className="legal-meta">{m.legal.privacyUpdated}</p>
        <p>{m.legal.privacyIntro}</p>
        <p>{m.legal.privacyData}</p>
        <p>{m.legal.privacyRetention}</p>
        <p>{m.legal.privacyThird}</p>
        <p>{m.legal.privacyRights}</p>
      </article>
    </main>
  );
}

export default Privacy;
