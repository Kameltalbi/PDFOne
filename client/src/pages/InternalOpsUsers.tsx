import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { opsRequest } from '../lib/ops';
import { formatDate, initials, planLabel, planTone } from './opsShared';

type UserRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  plan: string;
  bucket: string;
  active: boolean;
  expiresAt: string | null;
};

export default function InternalOpsUsers({
  initialQuery = '',
  onOpenUser
}: {
  initialQuery?: string;
  onOpenUser: (email: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async (q: string) => {
    setBusy(true);
    setError(null);
    try {
      const data = await opsRequest<{ users: UserRow[] }>(`/api/admin/users?q=${encodeURIComponent(q)}`);
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load(initialQuery);
  }, [initialQuery]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    void load(query.trim());
  };

  const counts = useMemo(() => ({
    all: users.length,
    pro: users.filter((user) => user.bucket === 'pro').length,
    week: users.filter((user) => user.bucket === 'week').length
  }), [users]);

  return (
    <div className="ops-pagebody">
      <div className="ops-pagehead">
        <div>
          <h1>Utilisateurs</h1>
          <p>{counts.all} compte{counts.all > 1 ? 's' : ''} · {counts.pro} Pro · {counts.week} pass 7 jours</p>
        </div>
      </div>
      <section className="ops-panel">
        <form className="ops-searchbar" onSubmit={search}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un e-mail ou un nom"
          />
          <button type="submit" disabled={busy}>{busy ? 'Recherche…' : 'Chercher'}</button>
        </form>
        {error && <p className="ops-error">{error}</p>}
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Plan</th>
                <th>Inscription</th>
                <th>Expiration</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5}><p>Aucun utilisateur.</p></td></tr>
              ) : users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <button type="button" className="ops-userbtn" onClick={() => onOpenUser(user.email)}>
                      <span className="ops-avatar">{initials(user.name || user.email)}</span>
                      <span>
                        <strong>{user.email}</strong>
                        <p>{user.name}</p>
                      </span>
                    </button>
                  </td>
                  <td><span className={`ops-pill ops-pill-${planTone(user.plan, user.bucket)}`}>{planLabel(user.plan, user.bucket)}</span></td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.expiresAt)}</td>
                  <td><span className={user.active ? 'ops-ok' : 'ops-off'}>{user.active ? 'Actif' : 'Gratuit'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
