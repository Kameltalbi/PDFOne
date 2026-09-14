import { indexableSeoPages } from '../lib/seoPages';

const NOINDEX = [
  { path: '/internal/ops', robots: 'noindex, nofollow, noarchive', note: 'Back-office' },
  { path: '/login', robots: 'noindex, follow', note: 'Auth' },
  { path: '/signup', robots: 'noindex, follow', note: 'Auth' },
  { path: '/account', robots: 'noindex, follow', note: 'Compte' },
  { path: '/translate', robots: 'noindex, follow', note: 'Translate PDF — keep noindex until layout QA' }
];

export default function InternalOpsSeo() {
  const pages = indexableSeoPages();
  const withFaq = pages.filter((page) => page.jsonLdId?.includes('faq')).length;
  const noindexSet = new Set(NOINDEX.map((item) => item.path));

  return (
    <div className="ops-pagebody">
      <div className="ops-pagehead">
        <div>
          <h1>SEO</h1>
          <p>Inventaire des pages prerender, sitemap et pages noindex. Lecture seule.</p>
        </div>
      </div>
      <div className="ops-kpis ops-kpis-3">
        <article>
          <span>Pages indexables</span>
          <strong>{pages.filter((page) => !page.robots?.includes('noindex')).length}</strong>
        </article>
        <article>
          <span>FAQ JSON-LD</span>
          <strong>{withFaq}</strong>
        </article>
        <article>
          <span>Noindex</span>
          <strong>{NOINDEX.length}</strong>
        </article>
      </div>
      <section className="ops-panel">
        <header>
          <h2>Pages non indexées</h2>
        </header>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Robots</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {NOINDEX.map((row) => (
                <tr key={row.path}>
                  <td>{row.path}</td>
                  <td><span className="ops-off">{row.robots}</span></td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="ops-panel">
        <header>
          <h2>Pages prerender / sitemap</h2>
          <a className="ops-textlink" href="/sitemap.xml" target="_blank" rel="noreferrer">Ouvrir sitemap.xml</a>
        </header>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Title</th>
                <th>Index</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.path}>
                  <td>{page.path}</td>
                  <td>{page.title}</td>
                  <td>
                    <span className={page.robots?.includes('noindex') || noindexSet.has(page.path) ? 'ops-off' : 'ops-ok'}>
                      {page.robots?.includes('noindex') || noindexSet.has(page.path) ? 'noindex' : 'index'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
