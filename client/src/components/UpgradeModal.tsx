import { useEffect, useId, useState } from 'react';
import { formatFileSize } from '../lib/api';
import { useBilling, type CheckoutPlan } from '../lib/billing';
import { RestoreAccess } from './RestoreAccess';
import { useUpgrade } from '../lib/upgrade';
import { useI18n } from '../i18n';
import { usePricingCopy } from '../lib/pricing';
import './UpgradeModal.css';
import '../pages/Account.css';

export function UpgradeModal() {
  const { m, t } = useI18n();
  const pricing = usePricingCopy();
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
      setError(err instanceof Error ? err.message : pricing.payFail);
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
      name: pricing.weekName,
      price: pricing.weekPrice,
      period: pricing.weekPeriod,
      note: pricing.weekMicro,
      cta: pricing.weekCta
    },
    {
      id: 'month',
      name: pricing.monthName,
      price: pricing.monthPrice,
      period: pricing.monthPeriod,
      note: pricing.monthMicro,
      cta: pricing.monthCta
    },
    {
      id: 'year',
      name: pricing.yearName,
      price: pricing.yearPrice,
      period: pricing.yearPeriod,
      note: pricing.yearEquiv,
      cta: pricing.yearCta,
      featured: true
    }
  ];

  const featureLabel = offer.reason === 'premium'
    ? (offer.feature === 'ocr'
      ? m.upgrade.featureOcr
      : offer.feature === 'translate'
        ? m.upgrade.featureTranslate
        : m.upgrade.featureSummarize)
    : '';

  const kicker = offer.reason === 'batch'
    ? m.upgrade.batchKicker
    : offer.reason === 'premium'
      ? m.upgrade.premiumKicker
      : m.upgrade.kicker;
  const title = offer.reason === 'batch'
    ? m.upgrade.batchTitle
    : offer.reason === 'premium'
      ? t(m.upgrade.premiumTitle, { feature: featureLabel })
      : m.upgrade.title;
  const lead = offer.reason === 'batch'
    ? t(m.upgrade.batchText, { count: offer.count })
    : offer.reason === 'premium'
      ? t(m.upgrade.premiumText, { feature: featureLabel })
      : t(m.upgrade.text, {
        name: offer.name,
        size: formatFileSize(offer.size),
        limit: m.upgrade.limit
      });
  const dismiss = offer.reason === 'batch'
    ? m.upgrade.batchDismiss
    : offer.reason === 'premium'
      ? m.upgrade.premiumDismiss
      : m.upgrade.dismiss;

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
        <p className="upgrade-kicker">{kicker}</p>
        <h2 id={titleId}>{title}</h2>
        <p className="upgrade-lead">{lead}</p>

        <div className="upgrade-plans">
          {plans.map((plan) => (
            <article key={plan.id} className={plan.featured ? 'featured' : undefined}>
              {plan.featured && <span className="upgrade-badge">{pricing.yearBadge}</span>}
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
                {paying === plan.id ? pricing.paying : plan.cta}
              </button>
            </article>
          ))}
        </div>

        {error && <p className="upgrade-error" role="alert">{error}</p>}
        <RestoreAccess compact onRestored={closeUpgrade} />
        <p className="upgrade-trust">{pricing.trust}</p>
        <button type="button" className="upgrade-dismiss" onClick={closeUpgrade} disabled={Boolean(paying)}>
          {dismiss}
        </button>
      </div>
    </div>
  );
}
