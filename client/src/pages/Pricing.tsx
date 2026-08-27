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
            <p className="pricing-tag">{m.pricing.weekTag}</p>
            <h2>{m.pricing.weekName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.weekPrice}</strong>
              <span>{m.pricing.weekNote}</span>
            </div>
            <PlanList items={m.pricing.weekIncludes} />
            <button className="pricing-cta outline" type="button" disabled={Boolean(paying)} onClick={() => void pay('week')}>
              {paying === 'week' ? m.pricing.paying : m.pricing.weekCta}
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
            <p className="pricing-tag">{m.pricing.lifeTag}</p>
            <h2>{m.pricing.lifeName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.lifePrice}</strong>
              <span>{m.pricing.lifeNote}</span>
            </div>
            <PlanList items={m.pricing.lifeIncludes} />
            <button className="pricing-cta dark" type="button" disabled={Boolean(paying)} onClick={() => void pay('life')}>
              {paying === 'life' ? m.pricing.paying : m.pricing.lifeCta}
            </button>
          </article>
        </div>

        <p className="pricing-trust">{m.pricing.trust}</p>
      </section>
    </main>
  );
}

export default Pricing;
