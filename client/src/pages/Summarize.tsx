import { useState } from 'react';
import { PdfAction } from '../components/PdfAction';
import { useI18n } from '../i18n';

export default function Summarize() {
  const { m } = useI18n();
  const [length, setLength] = useState<'short' | 'medium'>('medium');
  return (
    <PdfAction
      copy={m.summarizePdf}
      endpoint="/api/summarize"
      extraForm={(form) => form.append('length', length)}
      downloadName="resume.txt"
      downloadLabel={m.summarizePdf.download}
      extra={(
        <div className="studio-field">
          <label htmlFor="summary-length">{m.summarizePdf.length}</label>
          <select id="summary-length" value={length} onChange={(event) => setLength(event.target.value as 'short' | 'medium')}>
            <option value="short">{m.summarizePdf.short}</option>
            <option value="medium">{m.summarizePdf.medium}</option>
          </select>
        </div>
      )}
    />
  );
}
