import { Link } from 'react-router-dom';
import { getPrivacyPolicy, privacyOfficerEmail } from '../content/privacyPolicy';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Legal.css';

function PrivacyParagraph({ text }: { text: string }) {
  if (text.includes(privacyOfficerEmail)) {
    const [before] = text.split(privacyOfficerEmail);
    return (
      <p>
        {before}
        <a className="legal-mail" href={`mailto:${privacyOfficerEmail}`}>{privacyOfficerEmail}</a>
      </p>
    );
  }

  if (text.includes('page Contact de One2PDF') || text.includes('One2PDF Contact page')) {
    const [before, after] = text.split(/page Contact de One2PDF|One2PDF Contact page/);
    return (
      <p>
        {before}
        <Link className="legal-mail" to="/contact">
          {text.includes('page Contact') ? 'page Contact de One2PDF' : 'One2PDF Contact page'}
        </Link>
        {after}
      </p>
    );
  }

  return <p>{text}</p>;
}

function Privacy() {
  const { locale, m } = useI18n();
  const policy = getPrivacyPolicy(locale);
  usePageSeo(policy.seoTitle, policy.seoDescription);

  return (
    <main className="legal-page">
      <article className="legal-panel privacy-panel">
        <p className="legal-eyebrow">{m.common.privacy}</p>
        <h1>{policy.title}</h1>
        <p className="legal-meta">{policy.updated}</p>

        {policy.lead.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}

        {policy.sections.map((section) => (
          <section key={section.title} className="legal-section">
            <h2>{section.title}</h2>
            {section.blocks.map((block, index) => (
              block.type === 'ul' ? (
                <ul key={`${section.title}-ul-${index}`}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <PrivacyParagraph key={`${section.title}-p-${index}`} text={block.text} />
              )
            ))}
          </section>
        ))}

        <aside className="legal-summary">
          <h2>{policy.summaryTitle}</h2>
          {policy.summary.map((item) => (
            <p key={item.title}>
              <strong>{item.title}</strong>
              {' '}
              {item.text}
            </p>
          ))}
        </aside>
      </article>
    </main>
  );
}

export default Privacy;
