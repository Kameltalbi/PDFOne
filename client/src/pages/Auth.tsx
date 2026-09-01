import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { rememberedEmail, useBilling } from '../lib/billing';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Auth.css';

function AuthAside({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  const { m } = useI18n();
  return (
    <aside className="auth-aside">
      <div className="auth-art" aria-hidden="true">
        <svg viewBox="0 0 420 280" fill="none">
          <rect x="48" y="36" width="250" height="196" rx="18" fill="#fff" stroke="#e8e8ef" />
          <rect x="72" y="60" width="120" height="12" rx="6" fill="#ececf3" />
          <rect x="72" y="84" width="188" height="8" rx="4" fill="#f3f3f8" />
          <rect x="72" y="102" width="164" height="8" rx="4" fill="#f3f3f8" />
          <rect x="72" y="132" width="84" height="64" rx="10" fill="#fff1ef" stroke="#fdcdc4" />
          <rect x="168" y="132" width="84" height="64" rx="10" fill="#f4f7ff" stroke="#d7def5" />
          <rect x="264" y="132" width="54" height="64" rx="10" fill="#ecfdf5" stroke="#bbf7d0" />
          <circle cx="314" cy="78" r="38" fill="#ed5e44" />
          <path d="M300 78h28M314 64v28" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      <Link to="/tools" className="auth-aside-link">{m.account.seeTools} ↓</Link>
    </aside>
  );
}

function AuthShell({
  title,
  children,
  asideTitle,
  asideText
}: {
  title: string;
  children: React.ReactNode;
  asideTitle: string;
  asideText: string;
}) {
  const { m } = useI18n();
  return (
    <main className="auth-page">
      <section className="auth-form-col">
        <Link to="/" className="auth-logo">
          <img src="/one2pdf-logo.png?v=2" alt={m.brand} />
        </Link>
        <h1>{title}</h1>
        {children}
      </section>
      <AuthAside title={asideTitle} text={asideText} />
    </main>
  );
}

export function LoginPage() {
  const { m } = useI18n();
  const { status, loading, loginWithPassword } = useBilling();
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  usePageSeo(m.account.loginSeoTitle, m.account.loginSeoDescription);

  if (!loading && status.user) return <Navigate to="/account" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await loginWithPassword(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.account.loginFail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={m.account.authLoginTitle} asideTitle={m.account.loginAsideTitle} asideText={m.account.loginAsideText}>
      <form className="auth-form" onSubmit={(event) => void submit(event)}>
        <label className="auth-field">
          <span className="auth-icon" aria-hidden="true">✉</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            placeholder={m.account.emailEnter}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
        </label>
        <label className="auth-field">
          <span className="auth-icon" aria-hidden="true">🔒</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            placeholder={m.account.passwordPlaceholder}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
          />
        </label>
        <button type="button" className="auth-forgot" onClick={() => setForgotOpen((open) => !open)}>
          {m.account.forgotPassword}
        </button>
        {forgotOpen && <p className="auth-hint">{m.account.forgotHint}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? m.account.working : m.account.loginCta}
        </button>
      </form>
      <p className="auth-switch">
        {m.account.noAccount} <Link to="/signup">{m.account.createAccount}</Link>
      </p>
    </AuthShell>
  );
}

export function SignupPage() {
  const { m } = useI18n();
  const { status, loading, signup } = useBilling();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  usePageSeo(m.account.signupSeoTitle, m.account.signupSeoDescription);

  if (!loading && status.user) return <Navigate to="/account" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.account.signupFail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={m.account.authSignupTitle} asideTitle={m.account.signupAsideTitle} asideText={m.account.signupAsideText}>
      <form className="auth-form" onSubmit={(event) => void submit(event)}>
        <label className="auth-field">
          <span className="auth-icon" aria-hidden="true">☺</span>
          <input
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            placeholder={m.account.namePlaceholder}
            onChange={(event) => setName(event.target.value)}
            disabled={busy}
          />
        </label>
        <label className="auth-field">
          <span className="auth-icon" aria-hidden="true">✉</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            placeholder={m.account.emailPlaceholder}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
        </label>
        <label className="auth-field">
          <span className="auth-icon" aria-hidden="true">🔒</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            placeholder={m.account.passwordPlaceholder}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
          />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? m.account.working : m.account.signupCta}
        </button>
      </form>
      <p className="auth-switch">
        {m.account.hasAccount} <Link to="/login">{m.account.signInLink}</Link>
      </p>
      <p className="auth-legal">
        {m.account.termsPrefix} <Link to="/privacy">{m.common.privacy}</Link>.
      </p>
    </AuthShell>
  );
}
