import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { installMapPolyfill } from './lib/mapPolyfill'
import { I18nProvider } from './i18n'
import './index.css'
import App from './App.tsx'

installMapPolyfill()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
