# One2PDF — Phase 2 : préparation de l’optimisation SEO

Date : 4 novembre 2026  
Statut : audit et préparation uniquement — aucune modification applicative, aucun commit ni déploiement.

## Résumé

La base technique SEO est saine : sitemap, pages pré-rendues, canonical, hreflang et liens internes existent. La priorité est désormais d’améliorer l’unicité des contenus, de corriger les promesses imprécises et d’enrichir les pages de conversion.

Les données Search Console de référence couvrent surtout une période antérieure au déploiement de la nouvelle architecture SEO, le 25 octobre 2026. Elles ne permettent donc pas encore d’en mesurer l’effet.

## 1. Classement éditorial des outils prioritaires

Ce classement repose sur l’utilité produit, le maillage interne, la maturité du contenu et les écarts détectés. Il ne repose sur aucune donnée externe de volume de recherche ou de difficulté SEO.

| Priorité | Outil | Justification |
|---:|---|---|
| 1 | Compresser PDF | Intention large ; page riche mais promesses et contenus à préciser. |
| 2 | PDF vers Word | Conversion centrale ; limites de mise en page à mieux expliquer. |
| 3 | Word vers PDF | Complément naturel, avec formats effectivement pris en charge à valoriser. |
| 4 | Fusionner PDF | Fonction courante ; page solide, à différencier davantage. |
| 5 | Diviser PDF | Cas d’usage variés mais contenu proche de Fusionner PDF. |
| 6 | JPG vers PDF | Page riche ; vocabulaire de traitement à fiabiliser. |
| 7 | PDF vers JPG | Contenu structuré mais absence de vraie FAQ. |
| 8 | OCR PDF | Fonction premium différenciante ; limites de qualité de scan à expliciter. |
| 9 | PDF vers Excel | Page structurée de façon trop légère ; extraction à cadrer. |
| 10 | Modifier PDF | Périmètre fonctionnel à préciser afin d’éviter les attentes d’édition complète. |

## 2. Points de correction prioritaires

1. Des contenus SEO annoncent « 5 documents par jour » ou « 100 MB ». Ces chiffres doivent être rapprochés des limites réellement appliquées côté serveur avant publication. Formulation de repli recommandée : « Les limites applicables sont indiquées lors de l’envoi et sur la page Tarifs. »
2. Certaines pages indiquent que le traitement s’effectue « dans le navigateur », alors que les outils concernés utilisent des traitements serveur. Employer « en ligne » ou « sur One2PDF ».
3. Éviter les promesses non vérifiées sur la sécurité, la suppression de fichiers, la rapidité, la confidentialité ou l’absence de compte. Préférer une formulation factuelle et un lien vers les informations légales pertinentes.
4. Réduire les paragraphes génériques répétés entre outils. Chaque page doit décrire son usage, ses formats et ses limites réelles.

## 3. Métadonnées et structure proposées

| Outil | Title proposé | Meta description proposée | H1 / H2 |
|---|---|---|---|
| Compresser PDF | FR : `Compresser un PDF en ligne — choisir le niveau \| One2PDF`<br>EN : `Compress PDF Online — Choose Your Compression Level \| One2PDF`<br>AR : `ضغط PDF عبر الإنترنت — اختر مستوى الضغط \| One2PDF` | FR : Réduisez la taille d’un PDF en ligne. Le niveau élevé conserve le texte sélectionnable ; les niveaux moyen et fort transforment les pages en images.<br>EN : Reduce a PDF’s file size online. High keeps selectable text; medium and strong turn pages into images.<br>AR : قلّل حجم ملف PDF عبر الإنترنت. يحافظ المستوى العالي على النص القابل للتحديد، بينما يحوّل المتوسط والقوي الصفحات إلى صور. | H1 : Compresser PDF<br>H2 : Choisir le niveau de compression adapté au document |
| Fusionner PDF | FR : `Fusionner des PDF en ligne en un seul fichier \| One2PDF`<br>EN : `Merge PDF Files Online — One File \| One2PDF`<br>AR : `دمج ملفات PDF عبر الإنترنت في ملف واحد \| One2PDF` | Assemblez des PDF dans l’ordre choisi, ajoutez éventuellement des numéros de page, puis téléchargez le document fusionné. | H1 : Fusionner PDF<br>H2 : Réunir des PDF dans l’ordre souhaité |
| Diviser PDF | FR : `Diviser un PDF en ligne — extraire ou séparer des pages \| One2PDF`<br>EN : `Split PDF Online — Extract or Separate Pages \| One2PDF`<br>AR : `تقسيم PDF عبر الإنترنت — استخراج الصفحات أو فصلها \| One2PDF` | Extrayez des pages, séparez un document ou créez plusieurs PDF à partir d’un fichier source. | H1 : Diviser PDF<br>H2 : Extraire les pages utiles d’un document |
| PDF vers Word | FR : `Convertir un PDF en Word en ligne \| One2PDF`<br>EN : `Convert PDF to Word Online \| One2PDF`<br>AR : `تحويل PDF إلى Word عبر الإنترنت \| One2PDF` | Créez un document DOCX à partir d’un PDF. Vérifiez le résultat pour les mises en page, tableaux ou scans complexes. | H1 : PDF vers Word<br>H2 : Convertir un PDF en document Word modifiable |
| Word vers PDF | FR : `Convertir Word en PDF en ligne \| One2PDF`<br>EN : `Convert Word to PDF Online \| One2PDF`<br>AR : `تحويل Word إلى PDF عبر الإنترنت \| One2PDF` | Convertissez des fichiers DOC, DOCX, ODT ou RTF en PDF et vérifiez la mise en page avant le partage. | H1 : Word vers PDF<br>H2 : Créer un PDF à partir d’un document Word |
| JPG vers PDF | FR : `Convertir JPG en PDF en ligne — assembler des images \| One2PDF`<br>EN : `JPG to PDF Online — Combine Images \| One2PDF`<br>AR : `تحويل JPG إلى PDF عبر الإنترنت — جمع الصور \| One2PDF` | Assemblez des images JPG, PNG ou WebP dans un PDF, dans l’ordre choisi. | H1 : JPG vers PDF<br>H2 : Réunir des images dans un document PDF |
| PDF vers JPG | FR : `Convertir un PDF en JPG en ligne \| One2PDF`<br>EN : `Convert PDF to JPG Online \| One2PDF`<br>AR : `تحويل PDF إلى JPG عبر الإنترنت \| One2PDF` | Exportez chaque page PDF au format JPG. Les documents de plusieurs pages sont fournis ensemble dans une archive ZIP. | H1 : PDF vers JPG<br>H2 : Exporter les pages PDF comme images JPG |
| Modifier PDF | FR : `Modifier un PDF en ligne — texte, dessins et images \| One2PDF`<br>EN : `Edit a PDF Online — Add Text, Drawings and Images \| One2PDF`<br>AR : `تحرير PDF عبر الإنترنت — أضف نصًا ورسومات وصورًا \| One2PDF` | Ajoutez du texte, des dessins, des formes ou des images à un PDF, puis téléchargez le fichier mis à jour. | H1 : Modifier PDF<br>H2 : Ajouter des éléments visuels à un PDF |
| OCR PDF | FR : `OCR PDF en ligne — rendre un scan consultable \| One2PDF`<br>EN : `OCR PDF Online — Make Scans Searchable \| One2PDF`<br>AR : `OCR لـ PDF عبر الإنترنت — اجعل المسح قابلًا للبحث \| One2PDF` | Reconnaissez le texte d’un PDF numérisé et obtenez un résultat consultable. Disponible avec le Pass 7 jours ou Pro. | H1 : OCR PDF<br>H2 : Ce que permet l’OCR sur un document numérisé |
| PDF vers Excel | FR : `Convertir un PDF en Excel en ligne \| One2PDF`<br>EN : `Convert PDF to Excel Online \| One2PDF`<br>AR : `تحويل PDF إلى Excel عبر الإنترنت \| One2PDF` | Créez un classeur XLSX depuis un PDF. Vérifiez les lignes, colonnes et tableaux extraits avant réutilisation. | H1 : PDF vers Excel<br>H2 : Extraire les données d’un PDF dans un classeur Excel |

## 4. Modules éditoriaux et FAQ

Les trois langues doivent transmettre les mêmes limites fonctionnelles, avec une rédaction native — pas une traduction mot à mot.

| Outil | Contenu explicatif à ajouter | Questions fréquentes |
|---|---|---|
| Compresser PDF | Expliquer les trois niveaux et l’impact possible sur le texte sélectionnable. | Quel niveau choisir ? / Pourquoi le gain varie-t-il ? / Puis-je conserver le texte sélectionnable ? |
| Fusionner PDF | Décrire le réordonnancement, la fusion et l’option de numérotation. | Puis-je modifier l’ordre ? / Puis-je ajouter des numéros ? / Puis-je fusionner plusieurs fichiers ? |
| Diviser PDF | Distinguer extraction, séparation de pages et création de plusieurs fichiers. | Puis-je extraire une page ? / Puis-je diviser par plage ? / Le fichier original est-il modifié ? |
| PDF vers Word | Prévenir que tableaux, colonnes, formulaires et scans demandent vérification. | Le DOCX est-il modifiable ? / Les tableaux sont-ils conservés ? / Un scan peut-il être converti ? |
| Word vers PDF | Citer DOC, DOCX, ODT et RTF. | Quels formats sont acceptés ? / Puis-je vérifier la mise en page ? / Le PDF est-il prêt à partager ? |
| JPG vers PDF | Expliquer l’ordre des images et la création d’un document unique. | Puis-je modifier l’ordre ? / Plusieurs images sont-elles acceptées ? / Quels formats d’image sont acceptés ? |
| PDF vers JPG | Expliquer qu’une image est exportée par page et que plusieurs pages sont livrées en ZIP. | Une image par page ? / Pourquoi un ZIP ? / Puis-je exporter un PDF de plusieurs pages ? |
| Modifier PDF | Expliquer l’ajout d’éléments sans promettre l’édition universelle du texte existant. | Puis-je ajouter du texte ? / Puis-je dessiner ? / Puis-je insérer une image ? |
| OCR PDF | Expliquer la dépendance à la netteté, à l’orientation et à la lisibilité du scan ; rappeler l’accès premium. | À quoi sert l’OCR ? / Pourquoi certains mots sont-ils imparfaits ? / Quel accès est requis ? |
| PDF vers Excel | Préciser que les données extraites doivent être vérifiées, notamment pour les tableaux complexes. | Le fichier est-il au format XLSX ? / Les tableaux sont-ils toujours exacts ? / Dois-je vérifier les colonnes ? |

### Liens internes recommandés

- Compresser : Fusionner, Diviser, PDF vers Word, Protéger PDF.
- Fusionner : Diviser, Compresser, Numéroter les pages.
- Diviser : Fusionner, Extraire des pages, Compresser.
- PDF vers Word : Word vers PDF, PDF vers Excel, OCR PDF.
- Word vers PDF : PDF vers Word, Fusionner, Compresser.
- JPG vers PDF : PDF vers JPG, Fusionner, Compresser.
- PDF vers JPG : JPG vers PDF, PDF vers PNG.
- Modifier PDF : Signer PDF, Remplir et signer, Filigrane.
- OCR PDF : PDF vers Word, PDF vers texte, Compresser.
- PDF vers Excel : Excel vers PDF, PDF vers Word, Compresser.

## 5. Fichiers à prévoir après validation

### Contenu et SEO

- `client/src/i18n/seoCopy.ts`
- `client/src/i18n/locales/en.ts`
- `client/src/i18n/locales/fr.ts`
- Les fichiers de contenu arabe correspondants
- `client/src/lib/seoPages.ts`
- `client/src/lib/relatedTools.ts`
- Les tests SEO et de locales associés

### Performance, après mesures seulement

- `client/src/App.tsx`
- `client/src/lib/pdfPreview.ts`
- Les pages d’édition PDF et de signature
- La configuration Vite
- Le chargement du worker PDF.js

## 6. Plan technique performance

### Constat

Le bundle initial contient une part importante du code PDF.js. Aucun découpage dynamique généralisé des routes ni chargement différé des éditeurs n’a été observé.

### Ordre recommandé

1. Mesurer les chunks, LCP, INP, CLS, chargement mobile et coût JavaScript.
2. Charger PDF.js seulement lorsqu’un aperçu ou un éditeur est nécessaire.
3. Charger les éditeurs lourds avec `React.lazy` après navigation vers les outils concernés.
4. Séparer les routes et dépendances lourdes avec une stratégie Vite/Rollup mesurée.
5. Vérifier après chaque évolution le HTML pré-rendu : title, canonical, hreflang, H1, H2, FAQ JSON-LD et contenu doivent rester disponibles sans JavaScript.

### Risques et tests

Risques : prévisualisation cassée, worker PDF.js indisponible, régression upload ou éditeur, contenu pré-rendu incomplet, CLS accru.

Tests requis : parcours des outils sur ordinateur et mobile, upload valide/invalide, prévisualisation PDF, OCR, conversions Office, JPG/PDF, édition, fusion, division, toutes les langues, tests SEO, comparaison du HTML pré-rendu et audit Lighthouse ou WebPageTest avant/après.

## 7. Suivi SEO sur 90 jours

### Référence initiale Search Console

| Indicateur | Valeur |
|---|---:|
| Clics | 1 |
| Impressions | 98 |
| CTR | 1 % |
| Position moyenne | 29,9 |
| URLs connues | 362 |
| URLs indexées | 126 |
| URLs non indexées | 236 |

Les motifs connus comprennent 210 URLs « détectées, actuellement non indexées », 6 « explorées, actuellement non indexées » et 8 en duplication. Le reste doit être ventilé directement dans Search Console.

### Indicateurs hebdomadaires

- URLs indexées, détectées/non indexées, explorées/non indexées, exclues et dupliquées ;
- clics, impressions, CTR et position moyenne ;
- performances par langue : français, anglais et arabe ;
- performances par outil et groupe d’URL ;
- requêtes principales par outil ;
- erreurs d’exploration, Core Web Vitals et actions manuelles éventuelles.

### Rythme d’analyse

- Semaines 1–2 : contrôler l’indexation et les erreurs techniques, sans conclure sur la performance.
- Semaines 3–6 : comparer les groupes corrigés avec les pages non encore modifiées.
- Semaines 7–13 : consolider par langue, outil et type de conversion.

Toute observation doit être étiquetée « post-déploiement du 25 octobre 2026 ». Les premières variations ne doivent pas être attribuées automatiquement aux optimisations.

## Recommandation de lancement

Après validation, commencer par Compresser PDF, PDF vers Word et Word vers PDF. Cette première vague concentre les corrections de promesses, l’amélioration éditoriale et les parcours de conversion les plus complémentaires.
