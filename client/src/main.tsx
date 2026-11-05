import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { installMapPolyfill } from './lib/mapPolyfill'
import { registerPwa } from './lib/registerPwa'
import { capturePwaInstallPrompt } from './lib/pwaInstallPrompt'
import { I18nProvider } from './i18n'
import './index.css'
import App from './App.tsx'
import './rtl.css'

installMapPolyfill()
capturePwaInstallPrompt()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)

// Registering a service worker is non-critical to the first paint. Deferring
// it until after React owns the root avoids competing with the initial render.
registerPwa()
