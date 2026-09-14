import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { opsRequest } from '../lib/ops';
import { formatDate, planLabel, planTone, type EntitlementRow } from './opsShared';

type Lookup = {
  email: string;
  user: { name: string; createdAt: string } | null;
  entitlements: EntitlementRow[];
};

type Filter = 'all' | 'active' | 'stripe' | 'admin' | 'week' | 'pro';

export default function InternalOpsSubscriptions({
  initialEmail = '',
  busy,
  error,
  onBusy
}: {
  initialEmail?: string;
  busy: boolean;
  error: string | null;
  onBusy: (fn: () => Promise<void>) => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [days, setDays] = useState(7);
  const [note, setNote] = useState('');
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [rows, setRows] = useState<EntitlementRow[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    setEmail(initialEmail);
    if (initialEmail) {
      onBusy(async () => {
        const data = await opsRequest<Lookup>('/api/admin/lookup', {
          method: 'POST',
          body: JSON.stringify({ email: initialEmail })
        });
        setLookup(data);
        setEmail(data.email);
      });
    }
  }, [initialEmail, onBusy]);

  useEffect(() => {
    void opsRequest<{ entitlements: EntitlementRow[] }>('/api/admin/entitlements')
      .then((data) => setRows(data.entitlements))
      .catch(() => setRows([]));
  }, [lookup]);

  const reloadLookup = async (target = email) => {
    if (!target) return;
    const data = await opsRequest<Lookup>('/api/admin/lookup', {
      method: 'POST',
      body: JSON.stringify({ email: target })
    });
    setLookup(data);
  };

  const search = (event: FormEvent) => {
    event.preventDefault();
    onBusy(async () => {
      const data = await opsRequest<Lookup>('/api/admin/lookup', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setLookup(data);
      setEmail(data.email);
    });
  };

  const grant = (event: FormEvent) => {
    event.preventDefault();
    onBusy(async () => {
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
    onBusy(async () => {
      await opsRequest('/api/admin/revoke', {
        method: 'POST',
        body: JSON.stringify({ customerId: row.customerId })
      });
      await reloadLookup(row.email || email);
    });
  };

  const resetUsage = (row: EntitlementRow) => {
    onBusy(async () => {
      await opsRequest('/api/admin/reset-usage', {
        method: 'POST',
        body: JSON.stringify({ customerId: row.customerId })
      });
      await reloadLookup(row.email || email);
    });
  };

  const filtered = useMemo(() => rows.filter((row) => {
    if (filter === 'active') return row.active;
    if (filter === 'stripe') return row.source === 'stripe';
    if (filter === 'admin') return row.source === 'admin';
    if (filter === 'week') return row.plan === 'week';
    if (filter === 'pro') return row.plan !== 'week';
    return true;
  }), [rows, filter]);

  return (
    <div className="ops-pagebody">
      <div className="ops-pagehead">
        <div>
          <h1>Abonnements</h1>
          <p>Filtres, recherche e-mail, passes offerts et quotas.</p>
        </div>
      </div>

      <section className="ops-panel">
        <form className="ops-searchbar" onSubmit={search}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="client@exemple.com"
            required
          />
          <button type="submit" disabled={busy}>{busy ? 'Recherche…' : 'Chercher'}</button>
        </form>
        {error && <p className="ops-error">{error}</p>}
        {lookup && (
          <div className="ops-facts">
            <article>
              <span>Compte One2PDF</span>
              <strong>{lookup.user ? lookup.user.name : 'Aucun compte mot de passe'}</strong>
              {lookup.user && <p>Créé le {formatDate(lookup.user.createdAt, true)}</p>}
            </article>
            <article>
              <span>Accès trouvés</span>
              <strong>{lookup.entitlements.length}</strong>
              <p>Le quota gratuit (cookie / IP) ne se réinitialise pas par e-mail.</p>
            </article>
          </div>
        )}
        {lookup && lookup.entitlements.length > 0 && (
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
                    <td><span className={`ops-pill ops-pill-${planTone(row.plan)}`}>{planLabel(row.plan)}</span></td>
                    <td><span className={row.active ? 'ops-ok' : 'ops-off'}>{row.active ? 'Actif' : row.status}</span></td>
                    <td>{formatDate(row.expiresAt, true)}</td>
                    <td>
                      {row.docsUsed} docs · {row.usedToday} aujourd’hui
                      {row.aiUsed ? ` · IA ${row.aiUsed}` : ''}
                    </td>
                    <td className="ops-actions">
                      <button type="button" onClick={() => resetUsage(row)} disabled={busy}>Reset quota</button>
                      <button type="button" className="ops-danger" onClick={() => revoke(row)} disabled={busy}>Révoquer</button>
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
              <input type="number" min={1} max={730} value={days} onChange={(event) => setDays(Number(event.target.value))} />
            </label>
            <div className="ops-presets">
              {[7, 30, 365].map((value) => (
                <button key={value} type="button" className={days === value ? 'ops-tab-on' : ''} onClick={() => setDays(value)}>
                  {value} j
                </button>
              ))}
            </div>
            <label>
              Note
              <input type="text" maxLength={200} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Support #123" />
            </label>
            <button type="submit" disabled={busy || !email}>Accorder</button>
          </div>
        </form>
      </section>

      <section className="ops-panel">
        <header>
          <h2>Tous les accès</h2>
          <div className="ops-seg">
            {([
              ['all', 'Tous'],
              ['active', 'Actifs'],
              ['stripe', 'Stripe'],
              ['admin', 'Offerts'],
              ['week', 'Pass 7j'],
              ['pro', 'Pro']
            ] as const).map(([id, label]) => (
              <button key={id} type="button" className={filter === id ? 'ops-tab-on' : ''} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
        </header>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Plan</th>
                <th>Source</th>
                <th>Expiration</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5}><p>Aucun abonnement.</p></td></tr>
              ) : filtered.map((row) => (
                <tr key={row.customerId}>
                  <td>
                    <button
                      type="button"
                      className="ops-textlink"
                      onClick={() => {
                        const next = row.email || '';
                        setEmail(next);
                        if (!next) return;
                        onBusy(async () => {
                          const data = await opsRequest<Lookup>('/api/admin/lookup', {
                            method: 'POST',
                            body: JSON.stringify({ email: next })
                          });
                          setLookup(data);
                          setEmail(data.email);
                        });
                      }}
                    >
                      {row.email || row.customerId}
                    </button>
                  </td>
                  <td><span className={`ops-pill ops-pill-${planTone(row.plan)}`}>{planLabel(row.plan)}</span></td>
                  <td>{row.source === 'admin' ? 'Offert' : 'Stripe'}</td>
                  <td>{formatDate(row.expiresAt, true)}</td>
                  <td><span className={row.active ? 'ops-ok' : 'ops-off'}>{row.active ? 'Actif' : row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
