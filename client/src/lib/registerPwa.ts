import { registerSW } from 'virtual:pwa-register';

import { isAppBusy, subscribeAppBusy } from './appBusy';

/**
 * Registers the PWA service worker without auto-reloading mid-job.
 * Navigations use NetworkFirst (see vite.config) so normal URLs pick up
 * fresh index.html + hashed assets after deploy; a deferred reload only
 * applies the new controller when no file processing is in flight.
 */
export function registerPwa(): void {
  let pendingUpdate = false;

  const applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      if (isAppBusy()) {
        pendingUpdate = true;
        return;
      }
      applyUpdate(true);
    },
  });

  subscribeAppBusy((busy) => {
    if (!busy && pendingUpdate) {
      pendingUpdate = false;
      applyUpdate(true);
    }
  });
}
