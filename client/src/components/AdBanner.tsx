import { useBilling } from '../lib/billing';
import { useI18n } from '../i18n';
import './AdBanner.css';

export function AdBanner() {
  const { m } = useI18n();
  const { status } = useBilling();
  if (status.paid) return null;

  return (
    <aside className="ad-banner" aria-label={m.common.adLabel}>
      <span>{m.common.adLabel}</span>
    </aside>
  );
}
