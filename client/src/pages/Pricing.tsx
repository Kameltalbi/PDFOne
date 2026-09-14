import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { STANDARD_TOOL_IDS } from '@mini-pdf-tools/shared';
import { RestoreAccess } from '../components/RestoreAccess';
import { useBilling, type CheckoutPlan } from '../lib/billing';
import { usePageSeo } from '../lib/usePageSeo';
import { usePricingCopy } from '../lib/pricing';
import { useI18n } from '../i18n';
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
  const pricing = usePricingCopy();
  usePageSeo(pricing.seoTitle, pricing.seoDescription);
  const { checkout, status } = useBilling();
  const [params] = useSearchParams();
  const [paying, setPaying] = useState<CheckoutPlan | null>(null);
  const [proInterval, setProInterval] = useState<'month' | 'year'>('year');
  const [showTools, setShowTools] = useState(false);
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

  const proPlan = proInterval === 'year' ? 'year' : 'month';
  const proPrice = proInterval === 'year' ? pricing.yearPrice : pricing.monthPrice;
  const proPeriod = proInterval === 'year' ? pricing.yearPeriod : pricing.monthPeriod;
  const proIncludes = proInterval === 'year' ? pricing.yearIncludes : pricing.monthIncludes;
  const proCta = proInterval === 'year' ? pricing.yearCta : pricing.monthCta;
  const proMicro = proInterval === 'year' ? pricing.yearMicro : pricing.monthMicro;

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

        <div className="pricing-grid pricing-grid-3">
          <article className="pricing-card">
            <p className="pricing-tag">{pricing.discover}</p>
            <h2>{pricing.freeName}</h2>
            <div className="pricing-price">
              <strong>{pricing.freePrice}</strong>
              <em>{pricing.freePeriod}</em>
            </div>
            <p className="pricing-pitch">{pricing.freePitch}</p>
            <PlanList items={pricing.freeIncludes} />
            <button
              type="button"
              className="pricing-tools-toggle"
              aria-expanded={showTools}
              onClick={() => setShowTools((open) => !open)}
            >
              {showTools ? pricing.hideIncludedTools : pricing.seeIncludedTools}
            </button>
            {showTools && (
              <ul className="pricing-tool-list" aria-label={pricing.includedToolsTitle}>
                {STANDARD_TOOL_IDS.map((id) => {
                  const label = m.tools[id as keyof typeof m.tools];
                  return <li key={id}>{typeof label === 'string' ? label : id}</li>;
                })}
              </ul>
            )}
            <p className="pricing-note">{pricing.freeNote}</p>
            <Link className="pricing-cta ghost" to="/tools">{pricing.freeCta}</Link>
            <p className="pricing-micro">{pricing.freeMicro}</p>
          </article>

          <article className="pricing-card">
            <p className="pricing-tag">{pricing.urgent}</p>
            <h2>{pricing.weekName}</h2>
            <p className="pricing-nosub">{pricing.weekNoSubscription}</p>
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

          <article className="pricing-card featured">
            <p className="pricing-badge">{pricing.yearBadge}</p>
            <p className="pricing-tag popular">{pricing.popular}</p>
            <h2>{pricing.accountPro}</h2>
            <div className="pricing-interval" role="group" aria-label={pricing.accountPro}>
              <button
                type="button"
                className={proInterval === 'month' ? 'is-active' : ''}
                aria-pressed={proInterval === 'month'}
                onClick={() => setProInterval('month')}
              >
                {pricing.proToggleMonthly}
              </button>
              <button
                type="button"
                className={proInterval === 'year' ? 'is-active' : ''}
                aria-pressed={proInterval === 'year'}
                onClick={() => setProInterval('year')}
              >
                {pricing.proToggleYearly}
              </button>
            </div>
            <div className="pricing-price">
              <strong>{proPrice}</strong>
              <em>{proPeriod}</em>
              {proInterval === 'year' && <span>{pricing.yearEquiv}</span>}
            </div>
            <p className="pricing-pitch">{proInterval === 'year' ? pricing.yearPitch : pricing.monthPitch}</p>
            <PlanList items={proIncludes} />
            {status.paid && (status.plan === 'month' || status.plan === 'year') ? (
              <Link className="pricing-cta solid" to="/account">{pricing.alreadyActive}</Link>
            ) : (
              <button className="pricing-cta solid" type="button" disabled={Boolean(paying)} onClick={() => void pay(proPlan)}>
                {paying === proPlan ? pricing.paying : proCta}
              </button>
            )}
            <p className="pricing-micro">{proMicro}</p>
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
