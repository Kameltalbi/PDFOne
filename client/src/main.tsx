import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { installMapPolyfill } from './lib/mapPolyfill'
import { registerPwa } from './lib/registerPwa'
import { I18nProvider } from './i18n'
import './index.css'
import App from './App.tsx'
import './rtl.css'

installMapPolyfill()
registerPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
