import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBilling } from '../lib/billing';
import { useI18n } from '../i18n';
import './Pricing.css';

function PricingSuccess() {
  const { m } = useI18n();
  const { confirm } = useBilling();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sessionId = params.get('session_id');
    if (!sessionId) {
      setError(m.pricing.payFail);
      return;
    }
    void confirm(sessionId)
      .then(() => setReady(true))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : m.pricing.payFail);
      });
  }, [confirm, m.pricing.payFail, params]);

  return (
    <main className="pricing-page">
      <section className="pricing-panel">
        <p className="pricing-eyebrow">{m.common.pricing}</p>
        <h1>{ready ? m.pricing.successTitle : error ? m.pricing.payFail : m.pricing.paying}</h1>
        <p className="pricing-lead">{error || (ready ? m.pricing.successText : m.pricing.paying)}</p>
        {ready && <Link className="pricing-cta solid" to="/tools">{m.pricing.successCta}</Link>}
        {error && <Link className="pricing-cta ghost" to="/pricing">{m.common.pricing}</Link>}
      </section>
    </main>
  );
}

export default PricingSuccess;
