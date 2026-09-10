import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const clientRoot = fileURLToPath(new URL('.', import.meta.url))

function searchConsolePlugin(token: string): Plugin {
  return {
    name: 'google-search-console',
    transformIndexHtml(html) {
      if (!token || html.includes('google-site-verification')) return html
      const meta = `    <meta name="google-site-verification" content="${token}" />\n`
      return html.replace('    <title>', `${meta}    <title>`)
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, clientRoot, 'VITE_')
  const verification = (env.VITE_GOOGLE_SITE_VERIFICATION ?? '').replace(/[^a-zA-Z0-9_-]/g, '')

  return {
    plugins: [
      searchConsolePlugin(verification),
      react(),
      VitePWA({
        // Prompt + deferred reload: never force-refresh mid PDF job (see registerPwa.ts).
        registerType: 'prompt',
        injectRegister: false,
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        includeAssets: [
          'favicon-32x32.png',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'One2PDF',
          short_name: 'One2PDF',
          description: 'Outils PDF en ligne — fusionner, compresser, convertir, protéger et éditer.',
          theme_color: '#dc2626',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'any',
          lang: 'fr',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        injectManifest: {
          // No index.html in precache: navigations use NetworkFirst in sw.ts.
          globPatterns: ['**/*.{js,mjs,css,ico,png,svg,woff2,webp}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    worker: {
      format: 'es',
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3002',
          changeOrigin: true,
          xfwd: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const forwarded = req.headers['x-forwarded-for'];
              if (typeof forwarded === 'string' && forwarded.trim()) {
                proxyReq.setHeader('x-forwarded-for', forwarded.split(',')[0].trim());
              }
            });
          },
        },
        '/temp': {
          target: 'http://127.0.0.1:3002',
          changeOrigin: true,
          xfwd: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const forwarded = req.headers['x-forwarded-for'];
              if (typeof forwarded === 'string' && forwarded.trim()) {
                proxyReq.setHeader('x-forwarded-for', forwarded.split(',')[0].trim());
              }
            });
          },
        },
      },
    },
  }
})
