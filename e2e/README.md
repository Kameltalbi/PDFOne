# E2E One2PDF — parcours « vrai utilisateur »

Simule un visiteur (entrée page outil → fichier → traitement → téléchargement), le quota gratuit, un gros fichier Pro, et les parcours critiques (conversion, OCR, merge/split, protect/unlock, fill & sign).  
Stripe / résiliation : checklist manuelle dans [CHECKLIST-STRIPE.md](./CHECKLIST-STRIPE.md).

## Prérequis

1. Fixtures : `node capacity/generate-fixtures.mjs` (si `capacity/fixtures/` est vide)
2. App locale : `npm run dev` (client `:5173`, API `:3002`)
3. Navigateurs Playwright : `npx playwright install chromium webkit`
4. Cookie Pro local (hors dépôt) :

```bash
npm run test:e2e:mint-pro
```

Cela écrit `e2e/.env.local` (mode `0600`, gitignored) avec `E2E_ACCESS_COOKIE` et un entitlement de test. **La valeur du cookie n’est jamais affichée.**

## Lancer

```bash
# Chrome desktop
npm run test:e2e:chromium

# Safari / WebKit desktop
npm run test:e2e:webkit

# Mobile Safari (iPhone 13 viewport)
npm run test:e2e:mobile

# Matrice complète
npm run test:e2e

# Uniquement Pro > 20 Mo (nécessite mint-pro)
npm run test:e2e:chromium -- e2e/specs/pro-large-file.spec.ts
```

Si Vite n’est pas sur `5173` :

```bash
E2E_BASE_URL=http://127.0.0.1:5180 npm run test:e2e:chromium
```

Variables (fichier `e2e/.env.local` ou env shell — ne jamais committer / coller dans les logs) :

| Variable | Défaut | Rôle |
|---|---|---|
| `E2E_BASE_URL` | `http://127.0.0.1:5173` | Origine du client |
| `E2E_ACCESS_COOKIE` | — | Cookie `pdfone_access` (via `mint-pro`) |

## Couverture

| Spec | Automatisé |
|---|---|
| `visitor-tools` | Compress + protect ; rejet >20 Mo en gratuit ; validation PDF |
| `free-quota` | 3 succès puis refus au 4e |
| `pro-large-file` | PDF 25 Mo accepté (Pro) + PDF valide |
| `critical-tools` | PDF↔Word, PDF↔Excel, PDF↔JPG, OCR, Merge, Split, Protect/Unlock, Fill & Sign — téléchargement **et** contrôle du fichier produit |
| Checklist Stripe | Compte, checkout, webhook, portail, résiliation |

## Hors scope ici

- Charge / capacité → `capacity/run-stage.mjs`
- Paiement Stripe headless (3DS / hosted page) → checklist manuelle
