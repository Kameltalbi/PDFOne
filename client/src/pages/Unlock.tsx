import { useState } from 'react';
import { PdfAction } from '../components/PdfAction';
import { useI18n } from '../i18n';

export default function Unlock() {
  const { m } = useI18n();
  const [password, setPassword] = useState('');
  return (
    <PdfAction
      copy={m.unlockPdf}
      endpoint="/api/unlock"
      extraForm={(form) => form.append('password', password)}
      allowLocked
      downloadName="deverrouille.pdf"
      extra={(
        <div className="studio-field">
          <label htmlFor="unlock-password">{m.unlockPdf.password}</label>
          <input id="unlock-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={m.unlockPdf.passwordPh} />
        </div>
      )}
    />
  );
}
