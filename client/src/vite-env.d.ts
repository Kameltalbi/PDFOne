/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
}
