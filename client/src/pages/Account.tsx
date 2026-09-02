import { Link, Navigate } from 'react-router-dom';
import { useBilling, type PaidPlan } from '../lib/billing';
import { remainingLabel } from '../lib/account';
import { useI18n } from '../i18n';
import type { Messages } from '../i18n/types';
import { usePageSeo } from '../lib/usePageSeo';
import '../pages/Pricing.css';
import './Account.css';

function planName(plan: PaidPlan, pricing: Messages['pricing']) {
  if (plan === 'week') return pricing.weekName;
  if (plan === 'month') return pricing.monthName;
  if (plan === 'year') return pricing.yearName;
  return pricing.accountPro;
}

export function AccountPage() {
  const { m, t } = useI18n();
  const { status, loading, logout, portal } = useBilling();
  usePageSeo(m.account.seoTitle, m.account.seoDescription);

  if (!loading && !status.user && !status.paid) return <Navigate to="/login" replace />;

  if (loading || (!status.user && !status.paid)) {
    return (
      <main className="pricing-page account-page">
        <section className="pricing-panel account-panel">
          <h1>{m.account.title}</h1>
          <p className="pricing-lead">{m.account.working}</p>
        </section>
      </main>
    );
  }

  const until = status.paid && status.expiresAt
    ? new Date(status.expiresAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
    : m.account.unlimitedTime;
  const freeUsed = status.paid === false ? (status.usedToday ?? 0) : 0;
  const freeLimit = status.paid === false ? (status.dailyLimit ?? 3) : 3;

  return (
    <main className="pricing-page account-page">
      <section className="pricing-panel account-panel">
        <p className="pricing-eyebrow">{status.paid ? m.pricing.accountPro : m.pricing.freeName}</p>
        <h1>{m.account.title}</h1>
        <p className="pricing-lead">{status.user?.name || status.user?.email || (status.paid ? status.email : '')}</p>
        <p className="account-hint">{m.account.lead}</p>

        {status.paid ? (
          <div className="account-stats">
            <article>
              <span>{m.account.plan}</span>
              <strong>{planName(status.plan, m.pricing)}</strong>
            </article>
            <article>
              <span>{m.account.remaining}</span>
              <strong>{remainingLabel(status.expiresAt, t, m)}</strong>
            </article>
            <article>
              <span>{m.account.validUntil}</span>
              <strong>{until}</strong>
            </article>
            <article>
              <span>{m.account.used}</span>
              <strong>{status.docsUsed}</strong>
            </article>
            <article>
              <span>{m.account.usedToday}</span>
              <strong>{status.usedToday}</strong>
            </article>
            <article>
              <span>{m.account.remainingDocs}</span>
              <strong>{m.account.unlimitedDocs}</strong>
            </article>
          </div>
        ) : (
          <div className="account-stats">
            <article>
              <span>{m.account.plan}</span>
              <strong>{m.pricing.freeName}</strong>
            </article>
            <article>
              <span>{m.account.remainingDocs}</span>
              <strong>{t(m.account.freeLimit, { used: freeUsed, limit: freeLimit })}</strong>
            </article>
          </div>
        )}

        <div className="account-actions">
          <Link className="pricing-cta solid" to="/tools">{m.account.toolsCta}</Link>
          {status.superadmin && (
            <Link className="pricing-cta outline" to="/internal/ops">Outil interne</Link>
          )}
          {status.paid && status.canManage && (
            <button className="pricing-cta outline" type="button" onClick={() => void portal()}>
              {m.pricing.manage}
            </button>
          )}
          {!status.paid && (
            <Link className="pricing-cta outline" to="/pricing">{m.common.pricing}</Link>
          )}
          <button className="pricing-cta ghost" type="button" onClick={() => void logout()}>
            {m.pricing.logout}
          </button>
        </div>
      </section>
    </main>
  );
}
