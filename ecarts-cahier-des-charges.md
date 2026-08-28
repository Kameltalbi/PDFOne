# Écarts vs cahier des charges — one2pdf.com

Source : `cahier_des_charges_one2pdf.pdf` (v1.0, février 2026)  
Audit : 28 août 2026, mis à jour le 28 août 2026 après une première vague de corrections.

**Corrigé dans cette vague**
- Grille tarifaire CDC : Gratuit / Pro 5,99 $/mois / Pro 49 $/an / Business 19,99 $/mois (Stripe + UI).
- Limite **50 Mo** en gratuit, plafond technique **1 Go** en Pro.
- Pages `/privacy` et `/contact`.
- Téléchargement unique puis suppression du fichier ; purge TTL 15 min.
- Bandeaux publicitaires discrets (placeholder, masqués si payant).
- `robots.txt` + `sitemap.xml`.

Les anciens pass week/life restent valides s’ils existent déjà en base, mais ne sont plus vendus.

---

---

## Déjà en ligne

- Outils MVP présents : fusion, compression, PDF ↔ Word, PDF ↔ Excel, PDF ↔ images (JPG/PNG), et bien d’autres (split, rotate, edit, OCR, etc.).
- UI épurée, pas de faux boutons de téléchargement, layout responsive.
- Flux en 2 écrans (présentation + import, puis aperçu + exécution).
- i18n : FR, EN, ES (Année 1) plus PT, DE, TR, AR, IT.
- Freemium : quota 3 documents / jour côté API (`FREE_DAILY_DOCS`).
- Stripe Checkout + portail (Apple Pay / Google Pay possibles via Stripe).
- Uploads originaux souvent supprimés après traitement (`cleanupUploads`).

---

## À dresser — priorité haute (Année 1 / MVP)

### 1. Grille tarifaire (écart majeur)

Le CDC impose 4 paliers. L’app en a 4 **différents**.

| CDC | Prix CDC | App actuelle |
| --- | --- | --- |
| Gratuit | 0 $/mois | Gratuit, 3 docs/jour, « 50 Mo » affiché |
| Pro mensuel | **5,99 $/mois** | **absent** — remplacé par Pass 7 jours à **1,99 $** |
| Pro annuel | **49 $/an** (~4,08 $/mois, −32 %) | **10 $/an** |
| Business / équipe | **19,99 $/mois**, jusqu’à 5 users | **absent** — remplacé par Pass à vie **29,99 $** |

À faire :

- Remplacer week / year 10 $ / life par **Pro mensuel 5,99 $**, **Pro annuel 49 $**, **Business 19,99 $**.
- Recalculer Stripe (`PLAN_AMOUNTS` dans `server/src/services/billing.ts`) et les copies i18n (`pricing.*`).
- Ajouter le support e-mail prioritaire (annuel) — page + canal.
- Décider si week/life sont des offres hors CDC à retirer ou à documenter comme exception.

### 2. Publicités (gratuit + Année 1)

- Le palier gratuit promet « publicités discrètes / ciblées non intrusives ».
- L’Année 1 prévoit des **bannières** pour monétiser le trafic.
- **Aucune pub n’est intégrée** (pas AdSense / pas de slots).

À faire : emplacements non bloquants (landing, résultat), jamais sur le bouton de téléchargement ; masquer pour les comptes payants.

### 3. Limites de taille fichier

- CDC : gratuit = limite de taille ; Pro = **sans limite**.
- UI gratuite : « jusqu’à 50 Mo ».
- Code : **100 Mo pour tout le monde** (`MAX_FILE_SIZE`, hooks client). Aucune différence payant / gratuit.

À faire : 50 Mo (ou la limite CDC) en gratuit ; lever ou monter très haut en Pro ; aligner le texte et Multer.

### 4. Traitement hybride client-side (Privacy-First)

- CDC : WebAssembly / JS **dans le navigateur** pour documents sensibles, alléger les serveurs.
- Réalité : presque tout passe par le **serveur** (pdf-lib, Sharp, LibreOffice). Le client ne fait que l’aperçu (pdf.js).
- `bullmq` / Redis sont dans les deps et la doc, **jamais utilisés**.

À faire (au moins pour merge / compress / rotate / protect) : traitement local WASM ou pdf-lib navigateur ; n’envoyer au serveur que ce qui est impossible en local (Office, OCR).

### 5. Suppression instantanée des fichiers

- CDC : suppression **instantanée** sur serveur **ou** 100 % local.
- Uploads : souvent nettoyés après job.
- Résultats : écrits dans `temp/` et servis en **statique public** (`GET /temp/...`) sans auth.
- `TEMP_FILE_TTL=7200000` (2 h) est dans `.env` / README, **aucun job de purge** ne l’applique.

À faire : download one-shot + unlink immédiat ; ou TTL réel + URLs signées ; ne plus exposer `/temp` en listing public.

### 6. Pages légales et confiance B2B

- Footer : `/privacy` et `/contact` — **routes absentes** (`App.tsx`).
- Pas de politique de confidentialité, CGU, ni formulaire contact / support.

À faire : pages Privacy + Contact (RGPD, durée de conservation réelle, sous-traitants Stripe / OpenAI / LibreOffice).

### 7. SEO technique Année 1

- Meta description et titre **uniques, en français**, dans `index.html`.
- Pas de `sitemap.xml`, `robots.txt`, `hreflang`, canonical, Open Graph.
- Langue via `navigator` / `?lang=` — pas d’URLs localisées (`/en/compress`).
- Un seul `document.title` global, pas de title par outil.

À faire : sitemap, robots, titles/descriptions par page et par locale (EN, FR, ES minimum).

---

## À dresser — priorité moyenne (Année 1–2)

### 8. Batch processing (réservé abonnés)

- CDC : lots (dizaines de fichiers) **payants seulement**.
- Merge : max **10 fichiers pour tous**, pas de file d’attente, pas de privilège Pro.

À faire : quota fichiers / job plus élevé pour Pro ; UI « lot » verrouillée en gratuit.

### 9. Priorité serveur

- CDC Pro : « priorité serveur maximale ».
- Toutes les requêtes sont synchrones, même file. Pas de file BullMQ malgré la dépendance.

À faire : file d’attente (BullMQ) + priorité payante, ou abandonner la mention si on reste synchrone.

### 10. Comptes utilisateurs

- « Inscription » = lien vers `/pricing`, pas de login e-mail / mot de passe.
- Accès Pro = cookie `pdfone_access`, pas de compte portable entre appareils (sauf Stripe customer).
- CDC Business exige licences centralisées → **comptes + équipe** indispensables plus tard.

### 11. Vitesse « standard » vs Pro

- Aucune distinction de timeout, qualité, ou ressources. Le palier gratuit CDC parle de vitesse standard.

---

## À dresser — plus tard (Année 2–3)

### 12. Année 2 — conversion

- Passerelle déjà Stripe (Paddle optionnel, non fait).
- Pas d’A/B test des pages tarifs.
- Pas de campagnes backlinks / partenariats (hors code).

### 13. Année 3 — Scale & B2B

- Offre Business 5 sièges, facturation groupée, **traçabilité** (journal d’accès) : absent.
- **API payante développeurs** : absent (seulement l’API interne `/api/...`).
- Objectif ~400 Pro + 50 Business pour 3 000 $/mois : suivi business, pas produit.

---

## Détail technique utile

| Sujet | Fichiers |
| --- | --- |
| Prix Stripe | `server/src/services/billing.ts` (`PLAN_AMOUNTS`) |
| UI tarifs | `client/src/pages/Pricing.tsx`, `client/src/i18n/locales/*.ts` (`pricing`) |
| Quota gratuit | `server/src/middleware/quota.ts` |
| Taille upload | `server/src/middleware/upload.ts`, `client/src/lib/useSinglePdf.ts` |
| Fichiers temp | `server/src/utils/temp.ts`, `server/src/index.ts` (`/temp` static) |
| i18n / SEO titre | `client/index.html`, `client/src/i18n/I18nProvider.tsx` |
| Routes manquantes | `client/src/App.tsx` vs `Footer.tsx` |

---

## Décisions à trancher avant d’implémenter

1. On **aligne les prix sur le CDC** (5,99 / 49 / 19,99) ou on met à jour le CDC pour coller à week / 10 $ / life ?
2. Traitement **local navigateur** (gros chantier) ou on clarifie le CDC (« serveur + suppression immédiate ») ?
3. Pubs Année 1 : AdSense tout de suite, ou d’abord placeholder + flag payant ?
4. Business : reporter à l’Année 3 comme le CDC, ou esquisser les sièges dès maintenant ?

Tant que (1) et (2) ne sont pas tranchés, le produit restera volontairement divergent du document de référence.
