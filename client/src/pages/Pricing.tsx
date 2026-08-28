import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBilling, type PaidPlan } from '../lib/billing';
import { useI18n } from '../i18n';
import './Pricing.css';

function PlanList({ items }: { items: string[] }) {
  return (
    <ul className="pricing-includes">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Pricing() {
  const { m, t } = useI18n();
  const { checkout, status } = useBilling();
  const [params] = useSearchParams();
  const [paying, setPaying] = useState<PaidPlan | null>(null);
  const [error, setError] = useState<string | null>(
    params.get('canceled') === '1' ? m.pricing.canceled : null
  );

  const pay = async (plan: PaidPlan) => {
    setError(null);
    setPaying(plan);
    try {
      await checkout(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.pricing.payFail);
      setPaying(null);
    }
  };

  return (
    <main className="pricing-page">
      <section className="pricing-panel">
        <p className="pricing-eyebrow">{m.common.pricing}</p>
        <h1>{t(m.pricing.title, { brand: m.brand })}</h1>
        <p className="pricing-lead">{m.pricing.subtitle}</p>
        {error && <p className="pricing-alert" role="alert">{error}</p>}
        {status.paid && (
          <p className="pricing-alert ok">
            {m.pricing.activeAccess}
          </p>
        )}

        <div className="pricing-grid">
          <article className="pricing-card">
            <h2>{m.pricing.freeName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.freePrice}</strong>
              <span>{m.pricing.freePeriod}</span>
            </div>
            <PlanList items={m.pricing.freeIncludes} />
            <Link className="pricing-cta ghost" to="/tools">{m.pricing.freeCta}</Link>
          </article>

          <article className="pricing-card">
            <p className="pricing-tag">{m.pricing.monthTag}</p>
            <h2>{m.pricing.monthName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.monthPrice}</strong>
              <em>{m.pricing.monthPeriod}</em>
            </div>
            <PlanList items={m.pricing.monthIncludes} />
            <button className="pricing-cta outline" type="button" disabled={Boolean(paying)} onClick={() => void pay('month')}>
              {paying === 'month' ? m.pricing.paying : m.pricing.monthCta}
            </button>
          </article>

          <article className="pricing-card featured">
            <p className="pricing-badge">⭐ {m.pricing.yearBadge}</p>
            <p className="pricing-tag popular">{m.pricing.popular}</p>
            <h2>{m.pricing.yearName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.yearPrice}</strong>
              <em>{m.pricing.yearPeriod}</em>
              <span>{m.pricing.yearEquiv}</span>
            </div>
            <PlanList items={m.pricing.yearIncludes} />
            <button className="pricing-cta solid" type="button" disabled={Boolean(paying)} onClick={() => void pay('year')}>
              {paying === 'year' ? m.pricing.paying : m.pricing.yearCta}
            </button>
          </article>

          <article className="pricing-card">
            <p className="pricing-tag">{m.pricing.businessTag}</p>
            <h2>{m.pricing.businessName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.businessPrice}</strong>
              <em>{m.pricing.businessPeriod}</em>
              <span>{m.pricing.businessNote}</span>
            </div>
            <PlanList items={m.pricing.businessIncludes} />
            <button className="pricing-cta dark" type="button" disabled={Boolean(paying)} onClick={() => void pay('business')}>
              {paying === 'business' ? m.pricing.paying : m.pricing.businessCta}
            </button>
          </article>
        </div>

        <p className="pricing-trust">{m.pricing.trust}</p>
      </section>
    </main>
  );
}

export default Pricing;
