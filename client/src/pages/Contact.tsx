import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Legal.css';

function Contact() {
  const { m } = useI18n();
  const email = m.legal.contactEmail;
  usePageSeo(`${m.legal.contactTitle} | One2PDF`, m.legal.contactIntro);
  return (
    <main className="legal-page">
      <article className="legal-panel">
        <p className="legal-eyebrow">{m.common.contact}</p>
        <h1>{m.legal.contactTitle}</h1>
        <p>{m.legal.contactIntro}</p>
        <p>
          <a className="legal-mail" href={`mailto:${email}`}>{email}</a>
        </p>
        <p>{m.legal.contactPriority}</p>
      </article>
    </main>
  );
}

export default Contact;
