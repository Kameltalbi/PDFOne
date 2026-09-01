import { useEffect, useId, useState } from 'react';
import { formatFileSize } from '../lib/api';
import { useBilling, type CheckoutPlan } from '../lib/billing';
import { RestoreAccess } from './RestoreAccess';
import { useUpgrade } from '../lib/upgrade';
import { useI18n } from '../i18n';
import './UpgradeModal.css';
import '../pages/Account.css';

export function UpgradeModal() {
  const { m, t } = useI18n();
  const { offer, closeUpgrade } = useUpgrade();
  const { checkout } = useBilling();
  const titleId = useId();
  const [paying, setPaying] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !paying) closeUpgrade();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [closeUpgrade, offer, paying]);

  useEffect(() => {
    setPaying(null);
    setError(null);
  }, [offer]);

  if (!offer) return null;

  const pay = async (plan: CheckoutPlan) => {
    setError(null);
    setPaying(plan);
    try {
      await checkout(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.pricing.payFail);
      setPaying(null);
    }
  };

  const plans: Array<{
    id: CheckoutPlan;
    name: string;
    price: string;
    period: string;
    note: string;
    cta: string;
    featured?: boolean;
  }> = [
    {
      id: 'week',
      name: m.pricing.weekName,
      price: m.pricing.weekPrice,
      period: m.pricing.weekPeriod,
      note: m.pricing.weekMicro,
      cta: m.pricing.weekCta
    },
    {
      id: 'month',
      name: m.pricing.monthName,
      price: m.pricing.monthPrice,
      period: m.pricing.monthPeriod,
      note: m.pricing.monthMicro,
      cta: m.pricing.monthCta
    },
    {
      id: 'year',
      name: m.pricing.yearName,
      price: m.pricing.yearPrice,
      period: m.pricing.yearPeriod,
      note: m.pricing.yearEquiv,
      cta: m.pricing.yearCta,
      featured: true
    }
  ];

  return (
    <div className="upgrade-overlay" onClick={() => { if (!paying) closeUpgrade(); }}>
      <div
        className="upgrade-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="upgrade-close" onClick={closeUpgrade} aria-label={m.common.closeMenu} disabled={Boolean(paying)}>
          ×
        </button>
        <p className="upgrade-kicker">{offer.reason === 'batch' ? m.upgrade.batchKicker : m.upgrade.kicker}</p>
        <h2 id={titleId}>{offer.reason === 'batch' ? m.upgrade.batchTitle : m.upgrade.title}</h2>
        <p className="upgrade-lead">
          {offer.reason === 'batch'
            ? t(m.upgrade.batchText, { count: offer.count })
            : t(m.upgrade.text, {
              name: offer.name,
              size: formatFileSize(offer.size),
              limit: m.upgrade.limit
            })}
        </p>

        <div className="upgrade-plans">
          {plans.map((plan) => (
            <article key={plan.id} className={plan.featured ? 'featured' : undefined}>
              {plan.featured && <span className="upgrade-badge">{m.pricing.yearBadge}</span>}
              <h3>{plan.name}</h3>
              <p className="upgrade-price">
                <strong>{plan.price}</strong>
                <em>{plan.period}</em>
              </p>
              <small>{plan.note}</small>
              <button
                type="button"
                className={plan.featured ? 'solid' : plan.id === 'week' ? 'dark' : 'outline'}
                disabled={Boolean(paying)}
                onClick={() => void pay(plan.id)}
              >
                {paying === plan.id ? m.pricing.paying : plan.cta}
              </button>
            </article>
          ))}
        </div>

        {error && <p className="upgrade-error" role="alert">{error}</p>}
        <RestoreAccess compact onRestored={closeUpgrade} />
        <p className="upgrade-trust">{m.pricing.trust}</p>
        <button type="button" className="upgrade-dismiss" onClick={closeUpgrade} disabled={Boolean(paying)}>
          {offer.reason === 'batch' ? m.upgrade.batchDismiss : m.upgrade.dismiss}
        </button>
      </div>
    </div>
  );
}
