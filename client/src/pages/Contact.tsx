import { useI18n } from '../i18n';
import { contactDocumentTitle } from '../lib/seoPages';
import { usePageSeo } from '../lib/usePageSeo';
import { urlLocaleFromPath } from '../i18n/localePath';
import { useLocation } from 'react-router-dom';
import './Legal.css';

function Contact() {
  const { m } = useI18n();
  const email = m.legal.contactEmail;
  const locale = urlLocaleFromPath(useLocation().pathname);
  usePageSeo(contactDocumentTitle(locale, m.legal.contactTitle), m.legal.contactIntro);
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
