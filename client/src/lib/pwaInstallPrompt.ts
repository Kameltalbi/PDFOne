export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listening = false;
const listeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

function notify() {
  for (const listener of listeners) listener(deferredPrompt);
}

/** Start listening before service-worker registration so Chrome's install event is never missed. */
export function capturePwaInstallPrompt() {
  if (listening) return;
  listening = true;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
}

export function subscribeToPwaInstallPrompt(listener: (event: BeforeInstallPromptEvent | null) => void) {
  listeners.add(listener);
  listener(deferredPrompt);
  return () => {
    listeners.delete(listener);
  };
}

export function clearPwaInstallPrompt() {
  deferredPrompt = null;
  notify();
}
