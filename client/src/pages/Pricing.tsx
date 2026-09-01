import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RestoreAccess } from '../components/RestoreAccess';
import { useBilling, type CheckoutPlan } from '../lib/billing';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
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
  const { m } = useI18n();
  usePageSeo(m.pricing.seoTitle, m.pricing.seoDescription);
  const { checkout, status } = useBilling();
  const [params] = useSearchParams();
  const [paying, setPaying] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(
    params.get('canceled') === '1' ? m.pricing.canceled : null
  );

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

  return (
    <main className="pricing-page">
      <section className="pricing-panel">
        <p className="pricing-eyebrow">{m.pricing.eyebrow}</p>
        <h1>{m.pricing.title}</h1>
        <p className="pricing-lead">{m.pricing.subtitle}</p>
        {error && <p className="pricing-alert" role="alert">{error}</p>}
        {status.paid ? (
          <p className="pricing-alert ok">
            {m.pricing.activeAccess} <Link to="/account">{m.pricing.myAccount}</Link>
          </p>
        ) : (
          <div className="pricing-restore pricing-restore-top">
            <p className="pricing-restore-banner">{m.pricing.restoreBanner}</p>
            <RestoreAccess compact />
          </div>
        )}

        <div className="pricing-grid">
          <article className="pricing-card">
            <p className="pricing-tag">{m.pricing.discover}</p>
            <h2>{m.pricing.freeName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.freePrice}</strong>
              <em>{m.pricing.freePeriod}</em>
            </div>
            <p className="pricing-pitch">{m.pricing.freePitch}</p>
            <PlanList items={m.pricing.freeIncludes} />
            <p className="pricing-note">{m.pricing.freeNote}</p>
            <Link className="pricing-cta ghost" to="/tools">{m.pricing.freeCta}</Link>
            <p className="pricing-micro">{m.pricing.freeMicro}</p>
          </article>

          <article className="pricing-card">
            <p className="pricing-tag">{m.pricing.urgent}</p>
            <h2>{m.pricing.weekName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.weekPrice}</strong>
              <em>{m.pricing.weekPeriod}</em>
            </div>
            <p className="pricing-pitch">{m.pricing.weekPitch}</p>
            <PlanList items={m.pricing.weekIncludes} />
            {status.paid ? (
              <Link className="pricing-cta dark" to="/account">{m.pricing.alreadyActive}</Link>
            ) : (
              <button className="pricing-cta dark" type="button" disabled={Boolean(paying)} onClick={() => void pay('week')}>
                {paying === 'week' ? m.pricing.paying : m.pricing.weekCta}
              </button>
            )}
            <p className="pricing-micro">{m.pricing.weekMicro}</p>
          </article>

          <article className="pricing-card">
            <p className="pricing-tag">{m.pricing.flexible}</p>
            <h2>{m.pricing.monthName}</h2>
            <div className="pricing-price">
              <strong>{m.pricing.monthPrice}</strong>
              <em>{m.pricing.monthPeriod}</em>
            </div>
            <p className="pricing-pitch">{m.pricing.monthPitch}</p>
            <PlanList items={m.pricing.monthIncludes} />
            {status.paid && (status.plan === 'month' || status.plan === 'year') ? (
              <Link className="pricing-cta outline" to="/account">{m.pricing.alreadyActive}</Link>
            ) : (
              <button className="pricing-cta outline" type="button" disabled={Boolean(paying)} onClick={() => void pay('month')}>
                {paying === 'month' ? m.pricing.paying : m.pricing.monthCta}
              </button>
            )}
            <p className="pricing-micro">{m.pricing.monthMicro}</p>
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
            <p className="pricing-pitch">{m.pricing.yearPitch}</p>
            <PlanList items={m.pricing.yearIncludes} />
            {status.paid && status.plan === 'year' ? (
              <Link className="pricing-cta solid" to="/account">{m.pricing.alreadyActive}</Link>
            ) : (
              <button className="pricing-cta solid" type="button" disabled={Boolean(paying)} onClick={() => void pay('year')}>
                {paying === 'year' ? m.pricing.paying : m.pricing.yearCta}
              </button>
            )}
            <p className="pricing-micro">{m.pricing.yearMicro}</p>
          </article>
        </div>

        <p className="pricing-trust">{m.pricing.trust}</p>

        <section className="pricing-faq" aria-labelledby="pricing-faq-title">
          <h2 id="pricing-faq-title">{m.pricing.faqTitle}</h2>
          {m.pricing.faq.map((item) => (
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
