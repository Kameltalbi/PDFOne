import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RestoreAccess } from '../components/RestoreAccess';
import { useBilling, type CheckoutPlan } from '../lib/billing';
import { usePageSeo } from '../lib/usePageSeo';
import { usePricingCopy } from '../lib/pricing';
import './Pricing.css';
import './Account.css';

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
  const pricing = usePricingCopy();
  usePageSeo(pricing.seoTitle, pricing.seoDescription);
  const { checkout, status } = useBilling();
  const [params] = useSearchParams();
  const [paying, setPaying] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(
    params.get('canceled') === '1' ? pricing.canceled : null
  );

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

  return (
    <main className="pricing-page">
      <section className="pricing-panel">
        <p className="pricing-eyebrow">{pricing.eyebrow}</p>
        <h1>{pricing.title}</h1>
        <p className="pricing-lead">{pricing.subtitle}</p>
        {error && <p className="pricing-alert" role="alert">{error}</p>}
        {status.paid ? (
          <p className="pricing-alert ok">
            {pricing.activeAccess} <Link to="/account">{pricing.myAccount}</Link>
          </p>
        ) : (
          <div className="pricing-restore pricing-restore-top">
            <p className="pricing-restore-banner">{pricing.restoreBanner}</p>
            <RestoreAccess compact />
          </div>
        )}

        <div className="pricing-grid">
          <article className="pricing-card">
            <p className="pricing-tag">{pricing.discover}</p>
            <h2>{pricing.freeName}</h2>
            <div className="pricing-price">
              <strong>{pricing.freePrice}</strong>
              <em>{pricing.freePeriod}</em>
            </div>
            <p className="pricing-pitch">{pricing.freePitch}</p>
            <PlanList items={pricing.freeIncludes} />
            <p className="pricing-note">{pricing.freeNote}</p>
            <Link className="pricing-cta ghost" to="/tools">{pricing.freeCta}</Link>
            <p className="pricing-micro">{pricing.freeMicro}</p>
          </article>

          <article className="pricing-card">
            <p className="pricing-tag">{pricing.urgent}</p>
            <h2>{pricing.weekName}</h2>
            <div className="pricing-price">
              <strong>{pricing.weekPrice}</strong>
              <em>{pricing.weekPeriod}</em>
            </div>
            <p className="pricing-pitch">{pricing.weekPitch}</p>
            <PlanList items={pricing.weekIncludes} />
            {status.paid ? (
              <Link className="pricing-cta dark" to="/account">{pricing.alreadyActive}</Link>
            ) : (
              <button className="pricing-cta dark" type="button" disabled={Boolean(paying)} onClick={() => void pay('week')}>
                {paying === 'week' ? pricing.paying : pricing.weekCta}
              </button>
            )}
            <p className="pricing-micro">{pricing.weekMicro}</p>
          </article>

          <article className="pricing-card">
            <p className="pricing-tag">{pricing.flexible}</p>
            <h2>{pricing.monthName}</h2>
            <div className="pricing-price">
              <strong>{pricing.monthPrice}</strong>
              <em>{pricing.monthPeriod}</em>
            </div>
            <p className="pricing-pitch">{pricing.monthPitch}</p>
            <PlanList items={pricing.monthIncludes} />
            {status.paid && (status.plan === 'month' || status.plan === 'year') ? (
              <Link className="pricing-cta outline" to="/account">{pricing.alreadyActive}</Link>
            ) : (
              <button className="pricing-cta outline" type="button" disabled={Boolean(paying)} onClick={() => void pay('month')}>
                {paying === 'month' ? pricing.paying : pricing.monthCta}
              </button>
            )}
            <p className="pricing-micro">{pricing.monthMicro}</p>
          </article>

          <article className="pricing-card featured">
            <p className="pricing-badge">⭐ {pricing.yearBadge}</p>
            <p className="pricing-tag popular">{pricing.popular}</p>
            <h2>{pricing.yearName}</h2>
            <div className="pricing-price">
              <strong>{pricing.yearPrice}</strong>
              <em>{pricing.yearPeriod}</em>
              <span>{pricing.yearEquiv}</span>
            </div>
            <p className="pricing-pitch">{pricing.yearPitch}</p>
            <PlanList items={pricing.yearIncludes} />
            {status.paid && status.plan === 'year' ? (
              <Link className="pricing-cta solid" to="/account">{pricing.alreadyActive}</Link>
            ) : (
              <button className="pricing-cta solid" type="button" disabled={Boolean(paying)} onClick={() => void pay('year')}>
                {paying === 'year' ? pricing.paying : pricing.yearCta}
              </button>
            )}
            <p className="pricing-micro">{pricing.yearMicro}</p>
          </article>
        </div>

        <p className="pricing-trust">{pricing.trust}</p>

        <section className="pricing-faq" aria-labelledby="pricing-faq-title">
          <h2 id="pricing-faq-title">{pricing.faqTitle}</h2>
          {pricing.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      </section>
    </main>
  );
}

export default Pricing;
