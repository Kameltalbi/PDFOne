import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import './PwaInstallBanner.css';

const DISMISS_KEY = 'one2pdf-pwa-dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

function isIosDevice() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function isMobileSurface() {
  return window.matchMedia('(max-width: 900px)').matches
    || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function PwaInstallBanner() {
  const { m } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const ios = isIosDevice();

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === '1') return undefined;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const timer = window.setTimeout(() => {
      if (isStandalone() || localStorage.getItem(DISMISS_KEY) === '1') return;
      if (ios || isMobileSurface()) setVisible(true);
    }, 1800);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.clearTimeout(timer);
    };
  }, [ios]);

  if (!visible || isStandalone()) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === 'accepted') dismiss();
  };

  return (
    <div className="pwa-banner" role="dialog" aria-label={m.common.pwaTitle}>
      <img src="/pwa-192x192.png" alt="" width={40} height={40} />
      <div className="pwa-banner-copy">
        <strong>{m.common.pwaTitle}</strong>
        <span>{ios ? m.common.pwaIosText : m.common.pwaText}</span>
      </div>
      {deferred && !ios && (
        <button type="button" className="pwa-banner-install" onClick={() => { void install(); }}>
          {m.common.pwaInstall}
        </button>
      )}
      <button type="button" className="pwa-banner-close" onClick={dismiss} aria-label={m.common.pwaDismiss}>
        ×
      </button>
    </div>
  );
}

export default PwaInstallBanner;
