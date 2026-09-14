import { useEffect, useState } from 'react';
import { opsRequest } from '../lib/ops';
import {
  formatBytes,
  formatDate,
  formatMoney,
  initials,
  planLabel,
  planTone,
  type OpsSection
} from './opsShared';

type Overview = {
  kpis: {
    users: number;
    usersDelta: number | null;
    pro: number;
    week: number;
    revenueCents: number;
    revenueCurrency: string;
    revenueAvailable: boolean;
    newUsers: number;
    newUsersDelta: number | null;
  };
  mix: { free: number; pro: number; week: number; inactive: number; total: number };
  signups: { points: number[]; labels: string[]; from: string; to: string };
  recentUsers: Array<{ email: string; name: string; plan: string; bucket: string; createdAt: string; status: string }>;
  recentPayments: Array<{ email: string; plan: string; amountCents: number; currency: string; date: string; status: string }>;
  recentPosts: Array<{ slug: string; title: string; status: string; publishedIso: string }>;
  services: {
    api: boolean;
    stripe: boolean;
    tempDisk: { freeBytes: number | null; totalBytes: number | null };
    eventLoopLagMs: number;
    memoryMb: number;
    checkedAt: string;
  };
};

function Delta({ value }: { value: number | null }) {
  if (value == null) return <span className="ops-delta ops-delta-flat">vs période précédente</span>;
  const up = value >= 0;
  return (
    <span className={up ? 'ops-delta ops-delta-up' : 'ops-delta ops-delta-down'}>
      {up ? '↗' : '↘'} {up ? '+' : ''}{value}% vs semaine dernière
    </span>
  );
}

function LineChart({ points, labels }: { points: number[]; labels: string[] }) {
  const width = 640;
  const height = 220;
  const pad = 28;
  const max = Math.max(...points, 1);
  const coords = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(points.length - 1, 1);
    const y = height - pad - (point / max) * (height - pad * 2);
    return { x, y };
  });
  const polyline = coords.map((item) => `${item.x},${item.y}`).join(' ');
  const area = `${pad},${height - pad} ${polyline} ${coords[coords.length - 1]?.x || pad},${height - pad}`;
  return (
    <svg className="ops-linechart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Inscriptions">
      {[0.25, 0.5, 0.75, 1].map((tick) => (
        <line key={tick} x1={pad} x2={width - pad} y1={height - pad - tick * (height - pad * 2)} y2={height - pad - tick * (height - pad * 2)} />
      ))}
      <polygon points={area} />
      <polyline points={polyline} />
      {coords.map((item, index) => (
        <circle key={labels[index]} cx={item.x} cy={item.y} r={index === coords.length - 1 ? 4.5 : 3} />
      ))}
    </svg>
  );
}

function Donut({ mix }: { mix: Overview['mix'] }) {
  const parts = [
    { key: 'free', value: mix.free, color: '#2563eb' },
    { key: 'pro', value: mix.pro, color: '#7c3aed' },
    { key: 'week', value: mix.week, color: '#16a34a' },
    { key: 'inactive', value: mix.inactive, color: '#cbd5e1' }
  ];
  const total = Math.max(mix.total, 1);
  let offset = 0;
  const rings = parts.map((part) => {
    const pct = part.value / total;
    const dash = `${pct * 100} ${100 - pct * 100}`;
    const item = { ...part, dash, offset };
    offset += pct * 100;
    return item;
  });
  return (
    <div className="ops-donut">
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <circle cx="21" cy="21" r="15.9" />
        {rings.map((ring) => (
          <circle
            key={ring.key}
            cx="21"
            cy="21"
            r="15.9"
            stroke={ring.color}
            strokeDasharray={ring.dash}
            strokeDashoffset={-ring.offset}
          />
        ))}
      </svg>
      <div>
        <strong>{mix.total.toLocaleString('fr-CA')}</strong>
        <span>utilisateurs</span>
      </div>
    </div>
  );
}

function postStatus(status: string) {
  if (status === 'published') return 'Publié';
  if (status === 'scheduled') return 'Programmé';
  return 'Brouillon';
}

export default function InternalOpsDashboard({
  onOpen
}: {
  onOpen: (section: OpsSection, email?: string) => void;
}) {
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void opsRequest<Overview>(`/api/admin/overview?days=${days}`)
      .then((payload) => { if (!cancelled) setData(payload); })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Chargement impossible.');
      });
    return () => { cancelled = true; };
  }, [days]);

  if (error) return <p className="ops-error">{error}</p>;
  if (!data) return <p className="ops-muted">Chargement du tableau de bord…</p>;

  const mixTotal = Math.max(data.mix.total, 1);
  const rangeLabel = `${formatDate(data.signups.from)} – ${formatDate(data.signups.to)}`;
  const disk = data.services.tempDisk;
  const diskPct = disk.totalBytes && disk.freeBytes != null
    ? Math.round(((disk.totalBytes - disk.freeBytes) / disk.totalBytes) * 100)
    : 0;

  return (
    <div className="ops-dash">
      <div className="ops-pagehead">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d’ensemble de One2PDF</p>
        </div>
        <div className="ops-range">
          <span>{rangeLabel}</span>
          <div className="ops-seg">
            {([7, 30, 90] as const).map((value) => (
              <button key={value} type="button" className={days === value ? 'ops-tab-on' : ''} onClick={() => setDays(value)}>
                {value} jours
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ops-kpis">
        <article>
          <div className="ops-kpi-ico ops-kpi-blue">👤</div>
          <span>Utilisateurs</span>
          <strong>{data.kpis.users.toLocaleString('fr-CA')}</strong>
          <Delta value={data.kpis.usersDelta} />
        </article>
        <article>
          <div className="ops-kpi-ico ops-kpi-purple">♛</div>
          <span>Abonnés Pro</span>
          <strong>{data.kpis.pro.toLocaleString('fr-CA')}</strong>
          <Delta value={data.kpis.newUsersDelta} />
        </article>
        <article>
          <div className="ops-kpi-ico ops-kpi-green">📅</div>
          <span>Pass 7 jours</span>
          <strong>{data.kpis.week.toLocaleString('fr-CA')}</strong>
          <Delta value={null} />
        </article>
        <article>
          <div className="ops-kpi-ico ops-kpi-orange">$</div>
          <span>Revenus ({data.kpis.revenueCurrency})</span>
          <strong>{data.kpis.revenueAvailable ? formatMoney(data.kpis.revenueCents, data.kpis.revenueCurrency) : '—'}</strong>
          <Delta value={null} />
        </article>
      </div>

      <div className="ops-grid-2">
        <section className="ops-panel">
          <header>
            <div>
              <h2>Inscriptions</h2>
              <p className="ops-muted">Comptes créés sur la période (pas le trafic anonyme).</p>
            </div>
          </header>
          <LineChart points={data.signups.points} labels={data.signups.labels} />
        </section>
        <section className="ops-panel">
          <header>
            <div>
              <h2>Répartition des plans</h2>
            </div>
          </header>
          <div className="ops-mix">
            <Donut mix={data.mix} />
            <ul>
              <li><i className="ops-dot ops-dot-blue" /> Gratuit <b>{data.mix.free}</b> <em>{Math.round((data.mix.free / mixTotal) * 100)}%</em></li>
              <li><i className="ops-dot ops-dot-purple" /> Pro <b>{data.mix.pro}</b> <em>{Math.round((data.mix.pro / mixTotal) * 100)}%</em></li>
              <li><i className="ops-dot ops-dot-green" /> Pass 7 jours <b>{data.mix.week}</b> <em>{Math.round((data.mix.week / mixTotal) * 100)}%</em></li>
              <li><i className="ops-dot ops-dot-gray" /> Inactifs <b>{data.mix.inactive}</b> <em>{Math.round((data.mix.inactive / mixTotal) * 100)}%</em></li>
            </ul>
          </div>
        </section>
      </div>

      <div className="ops-grid-2">
        <section className="ops-panel">
          <header>
            <h2>Derniers utilisateurs inscrits</h2>
            <button type="button" className="ops-textlink" onClick={() => onOpen('users')}>Voir tous</button>
          </header>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Plan</th>
                  <th>Inscription</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.length === 0 ? (
                  <tr><td colSpan={4}><p>Aucun compte pour l’instant.</p></td></tr>
                ) : data.recentUsers.map((user) => (
                  <tr key={user.email}>
                    <td>
                      <button type="button" className="ops-userbtn" onClick={() => onOpen('subscriptions', user.email)}>
                        <span className="ops-avatar">{initials(user.name || user.email)}</span>
                        <span>
                          <strong>{user.email}</strong>
                          <p>{user.name}</p>
                        </span>
                      </button>
                    </td>
                    <td><span className={`ops-pill ops-pill-${planTone(user.plan, user.bucket)}`}>{planLabel(user.plan, user.bucket)}</span></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td><span className={user.status === 'Actif' ? 'ops-ok' : 'ops-off'}>{user.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="ops-panel">
          <header>
            <h2>Derniers paiements</h2>
            <button type="button" className="ops-textlink" onClick={() => onOpen('subscriptions')}>Voir tous</button>
          </header>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Plan</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.length === 0 ? (
                  <tr><td colSpan={5}><p>Aucun paiement Stripe listé.</p></td></tr>
                ) : data.recentPayments.map((row, index) => (
                  <tr key={`${row.email}-${row.date}-${index}`}>
                    <td>{row.email}</td>
                    <td><span className={`ops-pill ops-pill-${planTone(row.plan)}`}>{planLabel(row.plan)}</span></td>
                    <td>{row.amountCents ? formatMoney(row.amountCents, row.currency) : '—'}</td>
                    <td>{formatDate(row.date)}</td>
                    <td><span className={row.status === 'Réussi' ? 'ops-ok' : 'ops-off'}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="ops-grid-2">
        <section className="ops-panel">
          <header>
            <h2>Derniers articles de blog</h2>
            <button type="button" className="ops-textlink" onClick={() => onOpen('blog')}>Voir tous</button>
          </header>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Publication</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPosts.length === 0 ? (
                  <tr><td colSpan={3}><p>Aucun article CMS.</p></td></tr>
                ) : data.recentPosts.map((post) => (
                  <tr key={post.slug}>
                    <td><strong>{post.title}</strong></td>
                    <td><span className={post.status === 'published' ? 'ops-ok' : post.status === 'scheduled' ? 'ops-pill ops-pill-week' : 'ops-off'}>{postStatus(post.status)}</span></td>
                    <td>{formatDate(post.publishedIso, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="ops-panel">
          <header>
            <h2>État des services</h2>
            <span className={data.services.api ? 'ops-ok' : 'ops-off'}>
              {data.services.stripe ? 'Tout est opérationnel' : 'API OK · Stripe à vérifier'}
            </span>
          </header>
          <ul className="ops-svc">
            <li><i className="ops-live" /> Frontend (one2pdf.com) <b>OK</b></li>
            <li><i className="ops-live" /> API <b>OK · {data.services.eventLoopLagMs} ms</b></li>
            <li><i className={data.services.stripe ? 'ops-live' : 'ops-dead'} /> Stripe <b>{data.services.stripe ? 'OK' : 'Non configuré'}</b></li>
            <li>
              <i className="ops-live" /> Stockage temporaire
              <b>{formatBytes(disk.freeBytes ? (disk.totalBytes || 0) - disk.freeBytes : 0)} / {formatBytes(disk.totalBytes)} · {diskPct}%</b>
            </li>
          </ul>
          <p className="ops-muted">Dernière vérification : {formatDate(data.services.checkedAt, true)}</p>
        </section>
      </div>
    </div>
  );
}
