# Checklist manuelle — Stripe / compte / résiliation

Automatisé dans Playwright : outils, upload, téléchargement, quota gratuit, gros fichier Pro (cookie).  
À faire **à la main** (Stripe Test Mode) sur Chrome desktop, Safari, et mobile.

## Prérequis

- [ ] Stripe en **test mode** (`STRIPE_SECRET_KEY` sk_test_…)
- [ ] `APP_URL` pointe vers l’environnement testé
- [ ] E-mail de test unique (ex. `e2e+YYYYMMDD@example.com`)
- [ ] Carte test Stripe : `4242 4242 4242 4242`, date future, CVC quelconque

## A. Gratuit → compte → checkout → Pro

| # | Étape | OK |
|---|---|---|
| 1 | Navigateur en session neuve (pas de cookie Pro) | ☐ |
| 2 | Ouvrir `/compress?lang=fr` comme depuis Google | ☐ |
| 3 | Traiter 3 petits PDF → 4e bloqué (quota) | ☐ |
| 4 | Aller `/signup` → créer compte (même e-mail que le futur paiement) | ☐ |
| 5 | `/pricing` → choisir Pro (mois ou année) → redirection Stripe | ☐ |
| 6 | Payer avec carte test → retour `/pricing/success` | ☐ |
| 7 | Header / compte affiche Pro (jours restants) | ☐ |
| 8 | Compresser `pdf-25mb.pdf` (>20 Mo) → succès + téléchargement | ☐ |

## B. Gestion / résiliation

| # | Étape | OK |
|---|---|---|
| 9 | Ouvrir portail Stripe depuis le compte / success | ☐ |
| 10 | Annuler l’abonnement (fin de période ou immédiat selon config) | ☐ |
| 11 | Retour One2PDF → statut cohérent (Pro jusqu’à expiration ou perdu) | ☐ |
| 12 | Après expiration : gros fichier à nouveau refusé ; quota gratuit réappliqué | ☐ |

## C. Matrice navigateurs

| Parcours | Chrome desktop | Safari desktop | Mobile |
|---|---|---|---|
| A (achat Pro) | ☐ | ☐ | ☐ |
| B (résiliation) | ☐ | ☐ | ☐ |

## Notes

- Ne jamais utiliser de vraie carte / vrai client.
- Si le webhook Stripe rate le retour local, vérifier `STRIPE_WEBHOOK_SECRET` (Stripe CLI `listen --forward-to`).
- Conserver captures + e-mail test dans le rapport de session.
