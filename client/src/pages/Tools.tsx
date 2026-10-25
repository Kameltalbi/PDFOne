import { useMemo, useState } from 'react';
import { Link } from '../components/LocaleLink';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import { catalogEntries } from '../lib/toolCatalog';
import './Tools.css';

function Tools() {
  const { m, locale } = useI18n();
  usePageSeo(`${m.tools.catalogTitle} | One2PDF`, m.tools.catalogSubtitle);
  const [query, setQuery] = useState('');

  const allTools = useMemo(() => catalogEntries(m), [m]);

  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const tools = useMemo(
    () => allTools.filter((tool) => `${tool.label} ${tool.description} ${tool.keywords}`.toLocaleLowerCase(locale).includes(normalizedQuery)),
    [allTools, normalizedQuery, locale]
  );

  return (
    <main className="pdf-tools-page">
      <section className="pdf-tools-intro">
        <p className="pdf-tools-eyebrow">{m.tools.catalogEyebrow}</p>
        <h1>{m.tools.catalogTitle}</h1>
        <p>{m.tools.catalogSubtitle}</p>
        <label className="pdf-tools-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={m.tools.searchPlaceholder}
            aria-label={m.tools.searchAria}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={m.tools.clearSearch}>×</button>
          )}
        </label>
      </section>
      <div className="pdf-tools-content">
        {tools.length > 0 ? (
          <section className="pdf-tool-section">
            <div className="pdf-tools-grid">
              {tools.map((tool) => (
                <Link key={tool.id} className="pdf-tool-card" to={tool.path}>
                  <span className="pdf-tool-icon" style={{ color: tool.color, borderColor: tool.color }} aria-hidden="true">{tool.icon}</span>
                  <span className="pdf-tool-name">{tool.label}</span>
                  <span className="pdf-tool-desc">{tool.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="pdf-tools-empty">
            <span>⌕</span>
            <h2>{m.tools.emptyTitle}</h2>
            <p>{m.tools.emptyText}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Tools;
