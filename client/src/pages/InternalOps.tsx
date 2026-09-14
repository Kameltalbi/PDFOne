import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { opsRequest } from '../lib/ops';
import { useBilling } from '../lib/billing';
import { useRobotsMeta } from '../lib/usePageSeo';
import InternalOpsDashboard from './InternalOpsDashboard';
import InternalOpsUsers from './InternalOpsUsers';
import InternalOpsSubscriptions from './InternalOpsSubscriptions';
import InternalOpsBlog from './InternalOpsBlog';
import InternalOpsSeo from './InternalOpsSeo';
import InternalOpsSystem from './InternalOpsSystem';
import {
  formatBytes,
  initials,
  OPS_SECTIONS,
  parseOpsSection,
  type OpsSection,
  type OpsSession
} from './opsShared';
import './InternalOps.css';

const NAV_ICONS: Record<OpsSection, string> = {
  dashboard: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5z',
  users: 'M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 19v-1a3.5 3.5 0 0 0-2.5-3.3M16.5 7.2a2.5 2.5 0 0 1 0 4.6',
  subscriptions: 'M4 7h16M4 12h16M4 17h10',
  blog: 'M5 4h10l4 4v12H5V4zm10 0v4h4M8 12h8M8 16h6',
  seo: 'M4 19V5h4l3 7 3-7h4v14h-3v-8l-4 8-4-8v8H4z',
  system: 'M10.3 3.3h3.4l.6 2.4a7 7 0 0 1 1.6.9l2.3-.8 1.7 2.9-1.8 1.5a7 7 0 0 1 0 1.8l1.8 1.5-1.7 2.9-2.3-.8a7 7 0 0 1-1.6.9l-.6 2.4h-3.4l-.6-2.4a7 7 0 0 1-1.6-.9l-2.3.8L4 15.2l1.8-1.5a7 7 0 0 1 0-1.8L4 10.4 5.7 7.5l2.3.8a7 7 0 0 1 1.6-.9l.7-2.4zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
};

export default function InternalOps() {
  const { refresh } = useBilling();
  const [session, setSession] = useState<OpsSession | null>(null);
  const [section, setSection] = useState<OpsSection>(() => parseOpsSection(window.location.hash));
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [focusEmail, setFocusEmail] = useState('');
  const [disk, setDisk] = useState<{ used: number; total: number | null; pct: number } | null>(null);

  useRobotsMeta('noindex, nofollow, noarchive');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'One2PDF Admin';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    const onHash = () => setSection(parseOpsSection(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const refreshSession = useCallback(async () => {
    const data = await opsRequest<OpsSession>('/api/admin/session');
    setSession(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) setSession((current) => current || { configured: true, authenticated: false });
    }, 8000);
    void refreshSession().catch(() => {
      if (!cancelled) setSession({ configured: true, authenticated: false });
    }).finally(() => window.clearTimeout(timer));
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [refreshSession]);

  useEffect(() => {
    if (!session?.authenticated) return;
    void opsRequest<{ health: { tempDisk: { freeBytes: number | null; totalBytes: number | null } } }>('/api/admin/system')
      .then((payload) => {
        const total = payload.health.tempDisk.totalBytes;
        const free = payload.health.tempDisk.freeBytes;
        if (total == null || free == null) return;
        setDisk({ used: total - free, total, pct: Math.round(((total - free) / total) * 100) });
      })
      .catch(() => undefined);
  }, [session?.authenticated]);

  const go = useCallback((next: OpsSection, email?: string) => {
    setSection(next);
    if (email) {
      setFocusEmail(email);
      setUserQuery(email);
    }
    const hash = `#${next}`;
    if (window.location.hash !== hash) window.location.hash = hash;
  }, []);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setBusy(false);
    }
  }, []);

  const login = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await opsRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password })
      });
      setPassword('');
      await refresh();
      await refreshSession();
    });
  };

  const loginSecret = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await opsRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ secret })
      });
      setSecret('');
      await refreshSession();
    });
  };

  const logout = () => {
    void run(async () => {
      await opsRequest('/api/admin/logout', { method: 'POST' });
      window.location.href = '/';
    });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = search.trim();
    if (!q) return;
    if (q.includes('@')) go('users', q);
    else {
      setUserQuery(q);
      go('users');
    }
  };

  if (!session) {
    return <main className="ops-gate"><p className="ops-muted">Chargement…</p></main>;
  }

  if (!session.configured) {
    return (
      <main className="ops-gate">
        <section className="ops-card ops-narrow">
          <h1>Page introuvable</h1>
          <p className="ops-muted">Cette adresse n’existe pas.</p>
        </section>
      </main>
    );
  }

  if (!session.authenticated) {
    return (
      <main className="ops-gate">
        <section className="ops-card ops-narrow">
          <div className="ops-login-brand">
            <img src="/one2pdf-logo.png?v=2" alt="One2PDF" />
            <span>Admin</span>
          </div>
          <h1>Accès interne</h1>
          <p className="ops-muted">Réservé aux superadmins. Cette page n’est pas indexée.</p>
          <form className="ops-form" onSubmit={login}>
            <label>
              E-mail
              <input type="email" autoComplete="username" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required />
            </label>
            <label>
              Mot de passe
              <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error && <p className="ops-error">{error}</p>}
            <button type="submit" disabled={busy}>{busy ? 'Vérification…' : 'Entrer'}</button>
          </form>
          {session.secretLogin && (
            <form className="ops-form" onSubmit={loginSecret}>
              <label>
                Accès de secours
                <input type="password" autoComplete="off" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Secret serveur" />
              </label>
              <button type="submit" className="ops-ghost" disabled={busy}>Entrer avec le secret</button>
            </form>
          )}
        </section>
      </main>
    );
  }

  const displayName = session.name || session.email || 'Super Admin';

  return (
    <div className="ops-app">
      <aside className="ops-side">
        <a className="ops-side-brand" href="#dashboard" onClick={(event) => { event.preventDefault(); go('dashboard'); }}>
          <img src="/one2pdf-logo.png?v=2" alt="One2PDF" />
          <span>Admin</span>
        </a>
        <nav>
          {OPS_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? 'ops-nav-on' : ''}
              onClick={() => go(item.id)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={NAV_ICONS[item.id]} /></svg>
              {item.label}
            </button>
          ))}
        </nav>
        <a className="ops-side-link" href="/" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-7 7M10 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-4" /></svg>
          Voir le site
        </a>
        {disk && (
          <div className="ops-side-disk">
            <span>Stockage temporaire</span>
            <div className="ops-disk-bar"><span style={{ width: `${Math.min(100, disk.pct)}%` }} /></div>
            <p>{formatBytes(disk.used)} / {formatBytes(disk.total)} · {disk.pct}%</p>
          </div>
        )}
      </aside>
      <div className="ops-main">
        <header className="ops-top">
          <div>
            <strong>One2PDF Admin</strong>
            <p>Gérez votre plateforme en toute simplicité</p>
          </div>
          <form className="ops-top-search" onSubmit={submitSearch}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un utilisateur, un article…"
            />
          </form>
          <div className="ops-top-user">
            <span className="ops-avatar">{initials(displayName)}</span>
            <span>
              <strong>{displayName}</strong>
              <p>Super Admin</p>
            </span>
            <button type="button" className="ops-exit" onClick={logout} disabled={busy}>Sortir</button>
          </div>
        </header>
        <div className="ops-content">
          {section === 'dashboard' && <InternalOpsDashboard onOpen={go} />}
          {section === 'users' && (
            <InternalOpsUsers initialQuery={userQuery} onOpenUser={(email) => go('subscriptions', email)} />
          )}
          {section === 'subscriptions' && (
            <InternalOpsSubscriptions
              initialEmail={focusEmail}
              busy={busy}
              error={error}
              onBusy={run}
            />
          )}
          {section === 'blog' && <InternalOpsBlog />}
          {section === 'seo' && <InternalOpsSeo />}
          {section === 'system' && <InternalOpsSystem />}
        </div>
      </div>
    </div>
  );
}
