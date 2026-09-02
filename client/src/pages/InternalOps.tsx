import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { opsRequest } from '../lib/ops';
import { useBilling } from '../lib/billing';
import InternalOpsBlog from './InternalOpsBlog';
import './InternalOps.css';

type OpsSession = { configured: boolean; authenticated: boolean; secretLogin?: boolean; email?: string | null };
type OpsTab = 'pass' | 'blog';

type EntitlementRow = {
  customerId: string;
  plan: string;
  status: string;
  expiresAt: string | null;
  active: boolean;
  source: 'admin' | 'stripe';
  note: string;
  docsUsed: number;
  usedToday: number;
  aiUsed: number;
  canManageStripe: boolean;
};

type Lookup = {
  email: string;
  user: { name: string; createdAt: string } | null;
  entitlements: EntitlementRow[];
};

function formatDate(value: string | null) {
  if (!value) return 'Sans échéance';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function InternalOps() {
  const { refresh } = useBilling();
  const [session, setSession] = useState<OpsSession | null>(null);
  const [tab, setTab] = useState<OpsTab>('pass');
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('');
  const [days, setDays] = useState(7);
  const [note, setNote] = useState('');
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Introuvable';
    let robots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !robots;
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    const previousRobots = robots.getAttribute('content');
    robots.setAttribute('content', 'noindex, nofollow, noarchive');
    return () => {
      document.title = previousTitle;
      if (created) robots?.remove();
      else if (previousRobots) robots?.setAttribute('content', previousRobots);
    };
  }, []);

  const refreshSession = useCallback(async () => {
    const data = await opsRequest<OpsSession>('/api/admin/session');
    setSession(data);
  }, []);

  useEffect(() => {
    void refreshSession().catch(() => {
      setSession({ configured: true, authenticated: false });
    });
  }, [refreshSession]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setBusy(false);
    }
  };

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

  const search = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      const data = await opsRequest<Lookup>('/api/admin/lookup', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setLookup(data);
      setEmail(data.email);
    });
  };

  const reloadLookup = async (target = email) => {
    if (!target) return;
    const data = await opsRequest<Lookup>('/api/admin/lookup', {
      method: 'POST',
      body: JSON.stringify({ email: target })
    });
    setLookup(data);
  };

  const grant = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await opsRequest('/api/admin/grant', {
        method: 'POST',
        body: JSON.stringify({ email, days, note })
      });
      setNote('');
      await reloadLookup();
    });
  };

  const revoke = (row: EntitlementRow) => {
    const stripeNote = row.source === 'stripe'
      ? '\n\nCeci n’annule pas l’abonnement Stripe. Annulez-le aussi dans le Dashboard Stripe si besoin.'
      : '';
    if (!window.confirm(`Révoquer l’accès ${row.plan} (${row.customerId}) ?${stripeNote}`)) return;
    void run(async () => {
      await opsRequest('/api/admin/revoke', {
        method: 'POST',
        body: JSON.stringify({ customerId: row.customerId })
      });
      await reloadLookup();
    });
  };

  const resetUsage = (row: EntitlementRow) => {
    void run(async () => {
      await opsRequest('/api/admin/reset-usage', {
        method: 'POST',
        body: JSON.stringify({ customerId: row.customerId })
      });
      await reloadLookup();
    });
  };

  if (!session) {
    return <main className="ops-page"><p className="ops-muted">Chargement…</p></main>;
  }

  if (!session.configured) {
    return (
      <main className="ops-page">
        <section className="ops-card ops-narrow">
          <h1>Page introuvable</h1>
          <p className="ops-muted">Cette adresse n’existe pas.</p>
        </section>
      </main>
    );
  }

  if (!session.authenticated) {
    return (
      <main className="ops-page">
        <section className="ops-card ops-narrow">
          <h1>Accès interne</h1>
          <p className="ops-muted">Réservé aux superadmins. Ne pas indexer, ne pas partager l’URL.</p>
          <form className="ops-form" onSubmit={login}>
            <label>
              E-mail
              <input
                type="email"
                autoComplete="username"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="ops-error">{error}</p>}
            <button type="submit" disabled={busy}>{busy ? 'Vérification…' : 'Entrer'}</button>
          </form>
          {session.secretLogin && (
            <form className="ops-form" onSubmit={loginSecret}>
              <label>
                Accès de secours
                <input
                  type="password"
                  autoComplete="off"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  placeholder="Secret serveur"
                />
              </label>
              <button type="submit" className="ops-ghost" disabled={busy}>Entrer avec le secret</button>
            </form>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="ops-page">
      <section className="ops-card">
        <header className="ops-head">
          <div>
            <p className="ops-kicker">Interne · non public</p>
            <h1>Outil interne</h1>
          </div>
          <button type="button" className="ops-ghost" onClick={logout} disabled={busy}>Sortir</button>
        </header>

        <div className="ops-tabs">
          <button type="button" className={tab === 'pass' ? 'ops-tab-on' : ''} onClick={() => setTab('pass')}>
            Abonnements
          </button>
          <button type="button" className={tab === 'blog' ? 'ops-tab-on' : ''} onClick={() => setTab('blog')}>
            Blog
          </button>
        </div>

        {tab === 'blog' ? <InternalOpsBlog /> : (
          <>
            <form className="ops-search" onSubmit={search}>
              <label>
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="client@exemple.com"
                  required
                />
              </label>
              <button type="submit" disabled={busy}>{busy ? 'Recherche…' : 'Chercher'}</button>
            </form>

            {error && <p className="ops-error">{error}</p>}

            {lookup && (
              <>
                <div className="ops-facts">
                  <article>
                    <span>Compte One2PDF</span>
                    <strong>{lookup.user ? lookup.user.name : 'Aucun compte mot de passe'}</strong>
                    {lookup.user && <p>Créé le {formatDate(lookup.user.createdAt)}</p>}
                  </article>
                  <article>
                    <span>Accès trouvés</span>
                    <strong>{lookup.entitlements.length}</strong>
                    <p>Le quota gratuit (cookie / IP) ne se réinitialise pas par e-mail.</p>
                  </article>
                </div>

                {lookup.entitlements.length === 0 ? (
                  <p className="ops-muted">Aucun pass enregistré pour cet e-mail.</p>
                ) : (
                  <div className="ops-table-wrap">
                    <table className="ops-table">
                      <thead>
                        <tr>
                          <th>Source</th>
                          <th>Plan</th>
                          <th>Statut</th>
                          <th>Expiration</th>
                          <th>Usage</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lookup.entitlements.map((row) => (
                          <tr key={row.customerId}>
                            <td>
                              <strong>{row.source === 'admin' ? 'Offert' : 'Stripe'}</strong>
                              <p>{row.note || row.customerId}</p>
                              {row.canManageStripe && <p>Abonnement Stripe encore actif côté facturation.</p>}
                            </td>
                            <td>{row.plan}</td>
                            <td>
                              <span className={row.active ? 'ops-ok' : 'ops-off'}>
                                {row.active ? 'Actif' : row.status}
                              </span>
                            </td>
                            <td>{formatDate(row.expiresAt)}</td>
                            <td>
                              {row.docsUsed} docs · {row.usedToday} aujourd’hui
                              {row.aiUsed ? ` · IA ${row.aiUsed}` : ''}
                            </td>
                            <td className="ops-actions">
                              <button type="button" onClick={() => resetUsage(row)} disabled={busy}>
                                Reset quota
                              </button>
                              <button type="button" className="ops-danger" onClick={() => revoke(row)} disabled={busy}>
                                Révoquer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <form className="ops-grant" onSubmit={grant}>
                  <h2>Offrir un accès Pro</h2>
                  <p className="ops-muted">
                    Crée un pass local distinct. L’utilisateur doit se connecter ou restaurer son accès avec cet e-mail.
                    Un abonnement Stripe payé reste à annuler dans Stripe.
                  </p>
                  <div className="ops-grant-row">
                    <label>
                      Jours
                      <input
                        type="number"
                        min={1}
                        max={730}
                        value={days}
                        onChange={(event) => setDays(Number(event.target.value))}
                      />
                    </label>
                    <div className="ops-presets">
                      {[7, 30, 365].map((value) => (
                        <button key={value} type="button" onClick={() => setDays(value)}>
                          {value} j
                        </button>
                      ))}
                    </div>
                    <label className="ops-note">
                      Note
                      <input
                        type="text"
                        maxLength={200}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Support #123"
                      />
                    </label>
                    <button type="submit" disabled={busy}>Accorder</button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
