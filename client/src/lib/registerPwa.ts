import { registerSW } from 'virtual:pwa-register';

/**
 * Registers the PWA service worker without forcing a page reload. Navigations
 * use NetworkFirst (see vite.config) so normal URLs pick up fresh HTML and
 * hashed assets after deploy. A new service worker activates on a later full
 * page load instead of visibly restarting the current interface.
 */
export function registerPwa(): void {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Do not call updateServiceWorker(true) here: it reloads the current
      // page and causes a visible restart, including during navigation.
      // The update is picked up on the visitor's next full page load.
    }
  });
}
