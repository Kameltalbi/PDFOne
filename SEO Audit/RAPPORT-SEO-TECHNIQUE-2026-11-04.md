# Audit SEO technique — one2pdf.com

Date de l’audit : 4 novembre 2026. Périmètre : audit public et lecture seule du dépôt local. Aucune modification applicative, aucun déploiement et aucun changement de configuration n’ont été effectués pendant cet audit.

## Synthèse exécutive

Le problème principal n’est plus une absence de contenu HTML indexable. Le site public sert aujourd’hui des pages statiques pré-rendues avec title, meta description, canonical, hreflang, `lang`, H1 et contenu utile avant exécution JavaScript.

Les 337 URL du sitemap ont toutes répondu en HTTP 200 lors d’un crawl limité à deux requêtes simultanées. L’alias `/png-to-pdf` redirige en HTTP 301 vers `/jpg-to-pdf`. Une URL inexistante répond en HTTP 404 avec `noindex`.

Les URL « Détectée, actuellement non indexée » ne s’expliquent donc pas par un blocage généralisé de robots, de sitemap ou de rendu JavaScript sur les pages actuelles. Les causes les plus plausibles sont :

- Le déploiement actuellement observé date du 25 octobre 2026, tandis que les statistiques Search Console communiquées couvrent 28 jours ; elles couvrent donc largement la période précédant cette version.
- Google découvre plus vite les URL qu’il ne les réévalue.
- 337 pages sur huit langues constituent une couverture éditoriale encore limitée pour un domaine à faible autorité observée.
- Les pages outils suivent des structures proches. Le contenu doit être davantage différencié par outil et par langue.
- Le bundle JavaScript initial est lourd pour un site mobile : environ 1,9 Mo non compressé.

## Architecture technique identifiée

- Client React 19, Vite et React Router.
- Rendu client complété par un pré-rendu statique SEO lors de la compilation.
- Anglais sur les URL sans préfixe ; français, espagnol, allemand, portugais, italien, turc et arabe sous préfixe.
- Sitemap produit depuis le même inventaire de pages que le pré-rendu.
- Arabe généré avec `lang="ar"` et `dir="rtl"`.
- PWA avec service worker.
- Nginx sert les pages statiques ; l’asset JavaScript principal testé est gzip et mis en cache un an.

La génération des métadonnées et du contenu HTML pré-rendu se trouve dans `client/scripts/prerender-seo.ts`, lignes 51 à 74.

## Contrôles confirmés

| Contrôle | Résultat |
|---|---|
| Accueil | HTML pré-rendu, canonical, hreflang, H1 et H2 présents |
| `/ar/crop` | HTML arabe pré-rendu, `lang="ar"`, `dir="rtl"`, canonical et hreflang présents |
| Sitemap | 337 URL uniques, XML valide, Content-Type `text/xml` |
| Crawl sitemap | 337 URL sur 337 en HTTP 200 |
| Robots | Pages publiques autorisées ; API, temporaires et zones internes bloquées |
| `/png-to-pdf` | Redirection HTTP 301 vers `/jpg-to-pdf` |
| URL inexistante | HTTP 404 avec `noindex, nofollow` |
| Hreflang | `en`, `fr`, `es`, `de`, `pt`, `it`, `tr`, `ar` et `x-default` présents |
| Tests SEO locaux | 59 tests réussis : sitemap, langues, contenus, hreflang et maillage |
| JavaScript | Bundle principal ~1,9 Mo avant compression ; gzip et cache immutable confirmés |

## Anomalies classées

| Priorité | Anomalie | Preuve technique | Impact probable | Correction proposée | Risque de régression | Validation |
|---|---|---|---|---|---|---|
| P1 | Dates `lastmod` codées en dur | `client/src/lib/sitemap.ts`, lignes 10 à 66 | Signal de fraîcheur imprécis | Générer les dates à partir de modifications éditoriales réelles | Dates vides ou erronées si la source n’est pas fiable | Comparer le sitemap au journal de publication |
| P1 | Bundle JS principal lourd | Asset public `index-BLgp2drs.js` : ~1,9 Mo avant compression | Risque sur LCP, INP et mobile | Découper les pages et bibliothèques lourdes ; charger PDF.js à la demande | Régression d’outils chargés tardivement | Lighthouse mobile et parcours outils |
| P2 | Pré-rendu remplacé par rendu React complet | `client/src/main.tsx`, ligne 14, utilise `createRoot` | Double travail de rendu et possible variation visuelle | Évaluer `hydrateRoot` ou une architecture SSG/SSR cohérente | Écart entre HTML statique et application React | Tests visuels, LCP, CLS et navigation |
| P2 | 337 pages réparties sur 8 langues | Sitemap et inventaire SEO | Google peut sélectionner moins de variantes proches | Prioriser les langues et différencier le contenu localisé | Réduire temporairement la couverture de mots-clés | Impressions et indexation par langue |
| P2 | Privacy localisée partiellement exclue | `client/src/i18n/localePath.ts`, `client/src/App.tsx` | Incohérence potentielle seulement si ces URL sont liées | Conserver hors sitemap/hreflang jusqu’à disponibilité juridique | Liens localisés cassés | Crawl de liens et inspection Search Console |
| P3 | Fallback PWA HTML après 3 secondes | `client/src/sw.ts`, lignes 25 à 31 | HTML ancien possible hors ligne ou réseau lent | Vérifier le comportement PWA séparément | Dégradation de l’expérience hors ligne | Tests PWA réseau lent/hors ligne |

## Indexation : classification des URL

### À indexer

- Les 337 URL présentes dans le sitemap.
- Accueil, catalogue, tarifs publics, blog, pages institutionnelles et outils PDF.
- Versions linguistiques possédant un contenu réellement localisé.

### À exclure

- `/login`, `/signup`, `/account`
- `/pricing/success`
- `/edit-pdf/result`
- `/internal/*`
- `/translate`, actuellement en `noindex`
- `/api/*` et `/temp/*`
- Les aliases qui redirigent, dont `/png-to-pdf`
- Les URL 404
- Les pages de confidentialité localisées non publiées, comme `/ar/privacy`

Les exclusions sont prévues dans `client/scripts/prerender-seo.ts`, lignes 77 à 94, ainsi que dans `client/public/robots.txt`.

## Causes possibles des URL non indexées

Les données Search Console fournies ne prouvent pas un défaut technique global. Les explications à vérifier sont :

1. Une période d’observation qui recouvre largement le déploiement SEO récent.
2. Le délai normal de réévaluation de Google après découverte.
3. Une faible autorité ou demande de recherche, reflétée par 98 impressions et 1 clic sur 28 jours.
4. Des variantes outil/langue trop proches pour que Google les priorise toutes immédiatement.
5. Les 25 URL connues de Google mais absentes du sitemap : 362 URL connues contre 337 URL du sitemap. Elles doivent être exportées depuis Search Console et classées.
6. Des pages techniquement accessibles mais perçues comme ayant une valeur insuffisamment distincte.

L’exemple `/ar/crop` est techniquement sain dans la version actuelle : HTTP 200, HTML arabe rendu sans JavaScript, canonical auto-référente, hreflang et contenu. Son statut « Détectée, actuellement non indexée » ne prouve donc pas un blocage technique.

## Pages outils et contenu

Les pages pré-rendues des principaux outils comportent des titres, descriptions, H1, sections explicatives, FAQ lorsque définie et liens connexes : PDF vers Word, Word vers PDF, compression, fusion, séparation, OCR, PDF vers Excel et PDF vers JPG.

Le maillage est un point positif : les tests confirment que la page d’accueil et le catalogue relient tous les outils indexables de chaque langue. Il faut maintenant privilégier la profondeur et la différenciation : cas d’usage, limites, formats, étapes, exemples et guides complémentaires.

## Performance

Les données Core Web Vitals réelles — LCP, INP et CLS de terrain — ne faisaient pas partie des informations fournies. Elles ne doivent pas être inventées.

Constats techniques :

- Le bundle principal fait environ 1,9 Mo non compressé.
- Un worker PDF.js distinct fait environ 1,17 Mo dans la distribution.
- L’asset JavaScript testé est gzip et `cache-control: public, max-age=31536000, immutable`.
- Les pages HTML publiques utilisent `cache-control: no-cache`, ce qui favorise la fraîcheur des métadonnées.
- Google Tag Manager est chargé en `async` et ne bloque pas directement le parsing HTML.

## Recommandations de contenu et maillage

- Prioriser 10 à 15 outils à forte intention de recherche avant de développer toutes les langues au même rythme.
- Construire des clusters : compression, conversion Office, OCR, édition, sécurité PDF.
- Ajouter des guides réellement utiles reliés aux outils prioritaires.
- Relier chaque guide à son outil et chaque outil à des guides spécifiques.
- Éviter les contenus très similaires publiés uniquement comme traduction de volume.
- Publier les pages légales localisées seulement lorsqu’elles sont juridiquement et éditorialement prêtes.

## Plan d’action SEO sur 90 jours

### Jours 1 à 14

- Exporter les 236 URL non indexées de Search Console.
- Classer chaque URL : sitemap, alias, 404, noindex volontaire ou page à investiguer.
- Inspecter manuellement une dizaine de pages prioritaires dans Search Console, dont `/ar/crop`.
- Corriger la stratégie `lastmod`.
- Établir une référence Lighthouse mobile et Core Web Vitals.

### Jours 15 à 45

- Réduire le JavaScript initial, notamment les dépendances PDF non nécessaires au premier affichage.
- Renforcer les pages à meilleur potentiel de recherche.
- Publier les premiers guides liés aux outils prioritaires.
- Ajuster titles, descriptions et contenus selon les requêtes réellement visibles dans Search Console.

### Jours 46 à 90

- Publier progressivement des contenus localisés dans les marchés prioritaires.
- Demander l’indexation uniquement des pages stratégiques réellement enrichies.
- Comparer impressions, positions et indexation par langue et par cluster.
- Éviter d’ajouter des URL au sitemap uniquement pour augmenter son volume.

## Protocole de vérification après déploiement

1. Vérifier HTTP 200, canonical, robots et hreflang sur l’accueil, cinq outils, une page arabe et un article.
2. Vérifier qu’une URL inexistante répond HTTP 404 avec `noindex`.
3. Vérifier que les aliases redirigent en 301.
4. Revalider les URL du sitemap à faible cadence.
5. Attendre plusieurs semaines avant d’interpréter l’évolution de l’indexation Search Console.
6. Comparer les Core Web Vitals réels avant et après les optimisations.

## Validation réalisée

- Crawl public limité : 337/337 URL du sitemap en HTTP 200.
- Inspection publique de l’accueil, `/ar/crop`, sitemap, robots, un alias et une 404.
- Tests locaux : `npm run test:seo --workspace=client` — 59 tests réussis.

## Conclusion

Le socle technique d’indexation actuel est sain : contenu HTML pré-rendu, sitemap cohérent, hreflang, canonicals, robots, redirections et 404 sont présents. La priorité n’est pas de multiplier les URL, mais de laisser Google réévaluer le déploiement récent, de fiabiliser `lastmod`, de réduire le coût JavaScript mobile et de renforcer la valeur éditoriale des pages stratégiques.
