import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBilling, type BillingState, type PaidPlan } from '../lib/billing';
import { trackPurchase } from '../lib/analytics';
import { useI18n } from '../i18n';
import type { Messages } from '../i18n/types';
import { usePageSeo } from '../lib/usePageSeo';
import './Pricing.css';

function planCopy(plan: PaidPlan, pricing: Messages['pricing']) {
  if (plan === 'week') return { name: pricing.weekName, period: pricing.successPeriodWeek };
  if (plan === 'month') return { name: pricing.monthName, period: pricing.successPeriodMonth };
  if (plan === 'year') return { name: pricing.yearName, period: pricing.successPeriodYear };
  return null;
}

function PricingSuccess() {
  const { m, t, locale } = useI18n();
  const { confirm, portal } = useBilling();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [error, setError] = useState<string | null>(sessionId ? null : m.pricing.successUnverified);
  const [access, setAccess] = useState<Extract<BillingState, { paid: true }> | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const verified = Boolean(access);
  usePageSeo(
    verified ? m.pricing.successSeoTitle : error ? m.pricing.successFailTitle : m.pricing.successVerifying,
    verified ? m.pricing.successSeoDescription : error ? m.pricing.successUnverified : m.pricing.successVerifying
  );

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    void confirm(sessionId)
      .then((next) => {
        if (cancelled) return;
        if (next.paid) {
          setAccess(next);
          if (next.purchase) trackPurchase(next.purchase);
        } else setError(m.pricing.successUnverified);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : m.pricing.successUnverified);
      });

    return () => {
      cancelled = true;
    };
  }, [confirm, m.pricing.successUnverified, sessionId]);

  const openPortal = async () => {
    setPortalError(null);
    setPortalBusy(true);
    try {
      await portal();
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : m.pricing.payFail);
      setPortalBusy(false);
    }
  };

  const summary = access ? planCopy(access.plan, m.pricing) : null;
  const renews = access?.expiresAt
    ? t(m.pricing.successRenews, {
        date: new Date(access.expiresAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
      })
    : null;

  return (
    <main className="pricing-page pricing-success-page">
      <section className="pricing-success" aria-live="polite">
        {verified ? (
          <>
            <span className="pricing-success-check" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#ecfdf5" />
                <circle cx="24" cy="24" r="18" stroke="#10b981" strokeWidth="2" />
                <path d="M16 24.5 21.2 30 32 18" stroke="#059669" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="pricing-success-status">{m.pricing.successStatus}</p>
            <h1>{m.pricing.successTitle}</h1>
            <p className="pricing-success-lead">{m.pricing.successText}</p>

            {summary && (
              <div className="pricing-success-plan">
                <strong>{summary.name}</strong>
                <span>{summary.period}</span>
                {renews && <span>{renews}</span>}
              </div>
            )}

            <h2 className="pricing-success-perks-title">{m.pricing.successBenefitsTitle}</h2>
            <ul className="pricing-success-perks">
              {m.pricing.successBenefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="pricing-success-actions">
              <Link className="pricing-cta solid" to="/tools">{m.pricing.successCta}</Link>
              <Link className="pricing-cta ghost" to="/account">{m.pricing.myAccount}</Link>
              {access?.canManage && (
                <button className="pricing-cta ghost" type="button" disabled={portalBusy} onClick={() => void openPortal()}>
                  {m.pricing.successManage}
                </button>
              )}
              {portalError && <p className="pricing-success-portal-error">{portalError}</p>}
            </div>
          </>
        ) : error ? (
          <>
            <h1>{m.pricing.successFailTitle}</h1>
            <p className="pricing-success-lead">{error}</p>
            <div className="pricing-success-actions">
              <Link className="pricing-cta ghost" to="/pricing">{m.common.pricing}</Link>
            </div>
          </>
        ) : (
          <>
            <span className="pricing-success-wait" aria-hidden="true" />
            <h1>{m.pricing.successVerifying}</h1>
            <p className="pricing-success-lead">{m.pricing.paying}</p>
          </>
        )}
      </section>
    </main>
  );
}

export default PricingSuccess;
