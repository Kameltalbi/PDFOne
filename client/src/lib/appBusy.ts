/** Tracks in-flight PDF jobs so a PWA update can wait before reloading. */

type BusyListener = (busy: boolean) => void;

let depth = 0;
const listeners = new Set<BusyListener>();

export function isAppBusy(): boolean {
  return depth > 0;
}

export function subscribeAppBusy(listener: BusyListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function markAppBusy(): void {
  depth += 1;
  if (depth === 1) {
    document.documentElement.dataset.appBusy = '1';
    listeners.forEach((listener) => listener(true));
  }
}

export function releaseAppBusy(): void {
  if (depth === 0) return;
  depth -= 1;
  if (depth === 0) {
    delete document.documentElement.dataset.appBusy;
    listeners.forEach((listener) => listener(false));
  }
}

export async function withAppBusy<T>(work: () => Promise<T>): Promise<T> {
  markAppBusy();
  try {
    return await work();
  } finally {
    releaseAppBusy();
  }
}
