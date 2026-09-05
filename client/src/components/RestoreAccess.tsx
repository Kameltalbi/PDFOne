import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
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
  const passwordId = useId();
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const next = await login(email, password);
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
      <label htmlFor={passwordId}>{m.account.passwordPlaceholder}</label>
      <div className="restore-row">
        <input
          id={passwordId}
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          placeholder={m.account.passwordPlaceholder}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
        <button type="submit" className="pricing-cta solid" disabled={busy}>
          {busy ? m.account.working : m.account.cta}
        </button>
      </div>
      <p className="restore-hint">
        <Link to="/login">{m.account.loginCta}</Link>
        {' · '}
        <Link to="/signup">{m.account.createAccount}</Link>
      </p>
      {error && <p className="restore-error" role="alert">{error}</p>}
    </form>
  );
}
