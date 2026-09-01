import { useId, useState, type FormEvent } from 'react';
import { rememberedEmail, useBilling } from '../lib/billing';
import { useI18n } from '../i18n';

export function RestoreAccess({
  compact = false,
  onRestored
}: {
  compact?: boolean;
  onRestored?: () => void;
}) {
  const { m } = useI18n();
  const { login } = useBilling();
  const emailId = useId();
  const [email, setEmail] = useState(rememberedEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const next = await login(email);
      if (!next.paid) {
        setError(m.account.noPass);
        return;
      }
      onRestored?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : m.account.noPass);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={compact ? 'restore-form compact' : 'restore-form'} onSubmit={(event) => void submit(event)}>
      {compact && <p className="restore-kicker">{m.upgrade.alreadyPaid}</p>}
      <label htmlFor={emailId}>{m.account.emailLabel}</label>
      <div className="restore-row">
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          required
          value={email}
          placeholder={m.account.emailPlaceholder}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
        />
        <button type="submit" className="pricing-cta solid" disabled={busy}>
          {busy ? m.account.working : m.account.cta}
        </button>
      </div>
      {error && <p className="restore-error" role="alert">{error}</p>}
    </form>
  );
}
