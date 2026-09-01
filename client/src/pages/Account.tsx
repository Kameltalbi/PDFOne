import { Link, Navigate } from 'react-router-dom';
import { useBilling, type PaidPlan } from '../lib/billing';
import { RestoreAccess } from '../components/RestoreAccess';
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

export function LoginPage() {
  const { m, t } = useI18n();
  const { status, loading } = useBilling();
  usePageSeo(m.account.loginSeoTitle, m.account.loginSeoDescription);

  if (!loading && status.paid) return <Navigate to="/account" replace />;

  return (
    <main className="pricing-page account-page">
      <section className="pricing-panel account-panel">
        <p className="pricing-eyebrow">{m.common.login}</p>
        <h1>{m.account.loginTitle}</h1>
        <p className="pricing-lead">{m.account.loginLead}</p>
        <RestoreAccess />
        {!status.paid && status.dailyLimit != null && (
          <p className="account-hint">
            {t(m.account.freeLimit, { used: status.usedToday ?? 0, limit: status.dailyLimit })}
          </p>
        )}
        <p className="account-hint">{m.account.loginHint}</p>
        <p className="account-alt">
          <Link to="/pricing">{m.common.pricing}</Link>
        </p>
      </section>
    </main>
  );
}

export function AccountPage() {
  const { m, t } = useI18n();
  const { status, loading, logout, portal } = useBilling();
  usePageSeo(m.account.seoTitle, m.account.seoDescription);

  if (!loading && !status.paid) return <Navigate to="/login" replace />;

  if (!status.paid) {
    return (
      <main className="pricing-page account-page">
        <section className="pricing-panel account-panel">
          <h1>{m.account.title}</h1>
          <p className="pricing-lead">{m.account.working}</p>
        </section>
      </main>
    );
  }

  const until = status.expiresAt
    ? new Date(status.expiresAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
    : m.account.unlimitedTime;

  return (
    <main className="pricing-page account-page">
      <section className="pricing-panel account-panel">
        <p className="pricing-eyebrow">{m.pricing.accountPro}</p>
        <h1>{m.account.title}</h1>
        <p className="pricing-lead">{status.email}</p>
        <p className="account-hint">{m.account.lead}</p>

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

        <div className="account-actions">
          <Link className="pricing-cta solid" to="/tools">{m.account.toolsCta}</Link>
          {status.canManage && (
            <button className="pricing-cta outline" type="button" onClick={() => void portal()}>
              {m.pricing.manage}
            </button>
          )}
          <button className="pricing-cta ghost" type="button" onClick={() => void logout()}>
            {m.pricing.logout}
          </button>
        </div>
      </section>
    </main>
  );
}
