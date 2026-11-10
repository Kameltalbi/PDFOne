import { Link } from '../components/LocaleLink';
import { ALTERNATIVES_PAGE, COMPARISONS, ONE_NOTE_PAGE, type ComparisonPageCopy } from '../content/brandPages';
import { faqPageJsonLd, faqScriptId, howToJsonLd, pageUrl, useJsonLd } from '../lib/jsonLd';
import { usePageSeo } from '../lib/usePageSeo';
import { useLocation } from 'react-router-dom';
import './BrandPages.css';

function OneNoteToPdfPage() {
  const page = ONE_NOTE_PAGE;
  const { pathname } = useLocation();
  usePageSeo(page.title, page.description);
  useJsonLd(faqScriptId(pathname), faqPageJsonLd(page.faq, pageUrl(pathname)));
  useJsonLd('one2pdf-howto-onenote-to-pdf', howToJsonLd(page.h1, page.description, page.howSteps));

  return (
    <main className="brand-page">
      <article>
        <h1>{page.h1}</h1>
        <p>{page.lead}</p>
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <h2>{page.howTitle}</h2>
        <ol>{page.howSteps.map((step) => <li key={step}>{step}</li>)}</ol>
        <h2>{page.linksTitle}</h2>
        <ul>
          {page.links.map((link) => (
            <li key={link.href}><Link to={link.href}>{link.label}</Link> — {link.text}</li>
          ))}
        </ul>
        <h2>{page.faqTitle}</h2>
        {page.faq.map((item) => (
          <section key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </section>
        ))}
      </article>
    </main>
  );
}

function ComparisonView({ page }: { page: ComparisonPageCopy }) {
  const { pathname } = useLocation();
  usePageSeo(page.title, page.description);
  useJsonLd(faqScriptId(pathname), faqPageJsonLd(page.faq, pageUrl(pathname)));

  return (
    <main className="brand-page">
      <article>
        <h1>{page.h1}</h1>
        <p>{page.disclaimer}</p>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>One2PDF</th>
              <th>{page.competitor}</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.feature}</th>
                <td>{row.ours}</td>
                <td>{row.theirs}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>{page.chooseTitle}</h2>
        <h3>{page.chooseOursTitle}</h3>
        <ul>{page.chooseOurs.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>{page.chooseTheirsTitle}</h3>
        <ul>{page.chooseTheirs.map((item) => <li key={item}>{item}</li>)}</ul>
        <h2>{page.faqTitle}</h2>
        {page.faq.map((item) => (
          <section key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </section>
        ))}
      </article>
    </main>
  );
}

function ComparisonRoute({ id }: { id: string }) {
  const page = COMPARISONS.find((item) => item.live && item.id === id);
  if (!page) return null;
  return <ComparisonView page={page} />;
}

function AlternativesPage() {
  const page = ALTERNATIVES_PAGE;
  const { pathname } = useLocation();
  usePageSeo(page.title, page.description);
  useJsonLd(faqScriptId(pathname), faqPageJsonLd(page.faq, pageUrl(pathname)));

  return (
    <main className="brand-page">
      <article>
        <h1>{page.h1}</h1>
        <p>{page.lead}</p>
        {page.sections.map((section) => (
          <section key={section.id}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.href && <p><Link to={section.href}>{section.hrefLabel}</Link></p>}
          </section>
        ))}
        <h2>{page.faqTitle}</h2>
        {page.faq.map((item) => (
          <section key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </section>
        ))}
      </article>
    </main>
  );
}

export { AlternativesPage, ComparisonRoute, OneNoteToPdfPage };
