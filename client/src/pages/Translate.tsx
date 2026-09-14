import { useState } from 'react';
import { PdfAction } from '../components/PdfAction';
import { useI18n } from '../i18n';
import { useRobotsMeta } from '../lib/usePageSeo';

const LANGS = ['fr', 'en', 'es', 'pt', 'de', 'it', 'tr', 'ar'] as const;
type TranslateLang = typeof LANGS[number];
type OutputMode = 'layout' | 'text';

export default function Translate() {
  const { m, locale } = useI18n();
  const copy = m.translatePdf;
  useRobotsMeta('noindex, follow');
  const [source, setSource] = useState<'auto' | TranslateLang>('auto');
  const [target, setTarget] = useState<TranslateLang>(locale === 'en' ? 'fr' : 'en');
  const [output, setOutput] = useState<OutputMode>('layout');

  const langLabel = (code: TranslateLang) => {
    if (code === 'fr') return copy.langFr;
    if (code === 'en') return copy.langEn;
    if (code === 'es') return copy.langEs;
    if (code === 'pt') return copy.langPt;
    if (code === 'de') return copy.langDe;
    if (code === 'it') return copy.langIt;
    if (code === 'tr') return copy.langTr;
    return copy.langAr;
  };

  return (
    <PdfAction
      copy={copy}
      endpoint="/api/translate"
      premiumFeature="translate"
      downloadName="traduction.pdf"
      downloadLabel={copy.download}
      extraDownloadLabel={copy.downloadTxt}
      extraForm={(form) => {
        form.append('source', source);
        form.append('target', target);
        form.append('mode', output);
      }}
      extra={(
        <>
          <div className="studio-field">
            <label htmlFor="translate-from">{copy.source}</label>
            <select id="translate-from" value={source} onChange={(event) => setSource(event.target.value as 'auto' | TranslateLang)}>
              <option value="auto">{copy.autoDetect}</option>
              {LANGS.map((code) => (
                <option key={code} value={code}>{langLabel(code)}</option>
              ))}
            </select>
          </div>
          <div className="studio-field">
            <label htmlFor="translate-to">{copy.target}</label>
            <select id="translate-to" value={target} onChange={(event) => setTarget(event.target.value as TranslateLang)}>
              {LANGS.map((code) => (
                <option key={code} value={code}>{langLabel(code)}</option>
              ))}
            </select>
          </div>
          <div className="studio-field">
            <p id="translate-output-label">{copy.output}</p>
            <div className="summarize-mode-grid" role="radiogroup" aria-labelledby="translate-output-label">
              {([
                ['layout', copy.preserveLayout, copy.preserveLayoutHint],
                ['text', copy.textOnly, copy.textOnlyHint]
              ] as const).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={output === value}
                  className={`summarize-mode-card${output === value ? ' is-selected' : ''}`}
                  onClick={() => setOutput(value)}
                >
                  <strong>{label}</strong>
                  <span>{hint}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    />
  );
}
