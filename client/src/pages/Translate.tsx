import { useState } from 'react';
import { PdfAction } from '../components/PdfAction';
import { LOCALES } from '../i18n/types';
import { useI18n } from '../i18n';

export default function Translate() {
  const { m, locale } = useI18n();
  const [target, setTarget] = useState(locale === 'en' ? 'fr' : 'en');
  const names: Record<(typeof LOCALES)[number], string> = {
    fr: m.translatePdf.langFr,
    en: m.translatePdf.langEn,
    es: m.translatePdf.langEs,
    pt: m.translatePdf.langPt,
    de: m.translatePdf.langDe,
    tr: m.translatePdf.langTr,
    ar: m.translatePdf.langAr,
    it: m.translatePdf.langIt
  };
  return (
    <PdfAction
      copy={m.translatePdf}
      endpoint="/api/translate"
      extraForm={(form) => {
        form.append('target', target);
        form.append('source', 'auto');
      }}
      downloadName="traduction.pdf"
      downloadLabel={m.translatePdf.download}
      extraDownloadLabel={m.translatePdf.downloadTxt}
      extra={(
        <div className="studio-field">
          <label htmlFor="translate-target">{m.translatePdf.target}</label>
          <select id="translate-target" value={target} onChange={(event) => setTarget(event.target.value)}>
            {LOCALES.map((code) => (
              <option key={code} value={code}>{names[code]}</option>
            ))}
          </select>
        </div>
      )}
    />
  );
}
