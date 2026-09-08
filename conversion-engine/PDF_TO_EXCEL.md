# PDF → Excel V2

## Audit du V1

Le contrat public est `POST /api/office/pdf-to-excel`, avec un fichier PDF
Multer et une réponse `publicToolResult` identique aux autres outils Office.
Le traitement passe par la queue bornée `officeQueue`; le résultat XLSX est
écrit dans le stockage temporaire One2PDF, retenu jusqu'au téléchargement puis
supprimé, ou purgé par TTL.

Le V1 n'utilise pas LibreOffice. Il appelle `extractPdfRows()` dans
`server/src/utils/pdfText.ts`, qui :

1. lit les fragments de texte avec PDF.js;
2. les regroupe en lignes avec une tolérance Y;
3. concatène les fragments voisins selon un seuil X;
4. crée une nouvelle cellule lorsqu'un espace horizontal dépasse ce seuil.

`server/src/utils/xlsx.ts` construit ensuite un ZIP OOXML minimal. Toutes les
cellules sont `inlineStr`; il n'existe ni styles, ni types numériques, ni
dates, ni pourcentages, ni bordures, ni largeurs, ni tables Excel.

Ce modèle confond proximité visuelle et structure logique. Il ne connaît pas
les bordures PDF, les colonnes répétées, les en-têtes, les zones vendeur/client
ou les sections de totaux. Deux fragments proches sont concaténés et deux
fragments éloignés deviennent arbitrairement deux cellules. C'est la cause
directe des classeurs lisibles mais inutilisables.

## Architecture V2

```text
conversion_engine/pdf_to_excel/
  analyzer.py          préflight, pages, type digital/scan/mixte
  text_extractor.py    mots, positions, tailles et polices
  layout.py            zones facture et contenu hors tableaux
  table_detector.py    stratégies bordée, sémantique et alignement
  table_extractor.py   tables logiques et continuations multi-pages
  excel_builder.py     XLSX openpyxl, styles et types
  quality_checker.py   diagnostics et score interne
  converter.py         orchestration atomique et logs
  cli.py               contrat JSON avec le serveur Node
```

Le wrapper Node est `server/src/services/pdfToExcel.ts`. Le endpoint, la queue,
les quotas et les URL de téléchargement ne changent pas.

## Stratégies d'extraction

1. **Bordures graphiques** : utilisée seulement lorsqu'une page contient assez
   de lignes/rectangles. `pdfplumber.find_tables()` reconstruit la grille.
2. **En-têtes sémantiques et alignement** : reconnaît des familles de colonnes
   comme Description, Prix unitaire, Quantité, Remise, Total, TVA, Date,
   Débit/Crédit/Solde. Les positions X des en-têtes définissent les colonnes et
   les lignes suivantes sont affectées par leur centre géométrique.
3. **Alignement par espaces** : fallback prudent pour les tableaux sans
   bordures ni vocabulaire connu. Il exige au moins trois colonnes, plusieurs
   lignes cohérentes et une colonne numérique stable.
4. **Aucune table fiable** : le contenu est conservé dans des zones et dans une
   feuille `Extracted content`; le moteur ne fabrique pas une table arbitraire.

Les stratégies ne sont pas exécutées aveuglément. Une grille fiable arrête le
pipeline. Une grille absente/faible déclenche l'analyse sémantique, puis le
fallback par alignement.

Les en-têtes répétés sur des pages consécutives sont comparés et les lignes
sont ajoutées à la même table logique. Des tables indépendantes produisent des
feuilles distinctes.

## Sémantique et reconstruction

Le contenu hors table est classé en :

- informations document et métadonnées;
- vendeur;
- client;
- totaux/taxes;
- contenu complémentaire;
- pied de page et informations légales.

La feuille `Document` place vendeur et client dans des zones distinctes. Les
tables deviennent de vraies tables Excel avec filtres, en-têtes gras,
bordures, largeurs calculées, texte multiligne et volets figés.

`ValueParser` convertit avec prudence :

- entiers et décimaux en nombres;
- pourcentages en valeurs Excel avec format `%`;
- monnaies en nombres avec format monétaire;
- dates `JJ/MM/AAAA` seulement lorsque jour/mois ne sont pas ambigus.

Une valeur ambiguë reste du texte.

## Diagnostics

Chaque conversion calcule et journalise :

- type de document;
- pages et stratégies choisies;
- tables détectées;
- couverture textuelle;
- confiance des tables;
- cohérence lignes/colonnes;
- préservation des valeurs numériques;
- score global pondéré;
- durée et avertissements.

Les logs JSON ne contiennent ni texte extrait ni chemin utilisateur.

## Feature flag et rollback

Le comportement par défaut reste le V1 :

```dotenv
PDF_TO_EXCEL_ENGINE=v1
```

Activer V2 :

```dotenv
PDF_TO_EXCEL_ENGINE=v2
PDF2EXCEL_PYTHON_PATH=/absolute/path/to/conversion-engine/.venv/bin/python
PDF2EXCEL_RUN_TIMEOUT_MS=300000
PDF2EXCEL_MAX_PAGES=200
PDF2EXCEL_MAX_WORDS=500000
```

Rollback immédiat : remettre `PDF_TO_EXCEL_ENGINE=v1` puis redémarrer le
processus Node. Aucun changement client ou migration de données n'est requis.

## Tests

```bash
npm run setup:conversion-engine
npm run test:pdf-to-excel
npm run test:conversion-engine
npm run build:server
```

Les régressions génèrent neuf PDF :

1. facture de profil SoftFacture;
2. devis;
3. tableau bordé;
4. tableau sans bordure;
5. table multi-page avec en-têtes répétés;
6. plusieurs tables;
7. page paysage;
8. texte et image;
9. PDF malformé.

Pour un corpus réel privé :

```bash
npm run quality:pdf-to-excel -- --corpus /chemin/pdf-reels
```

Le rapport est écrit dans
`conversion-engine/pdf-to-excel-quality-report.json` et reste ignoré par Git.

## Déploiement contrôlé

1. Installer Python 3.9+ et exécuter `npm run setup:conversion-engine`.
2. Définir un chemin Python absolu.
3. Laisser le flag à `v1` et vérifier `/health/ready`.
4. Exécuter le corpus réel et examiner les classeurs et diagnostics.
5. Activer `v2` sur une seule instance/canary.
6. Mesurer RSS, durée par page, taux d'échec et qualité.
7. Étendre progressivement; revenir à `v1` en cas de régression.

Le moteur utilise un sous-processus borné par la queue Office et un timeout.
Les sorties sont atomiques et les dossiers `pdfone-excel-*` sont nettoyés,
y compris par la purge des temporaires abandonnés.

## Limites restantes

- aucun OCR dans cette phase; un scan pur est orienté vers l'outil OCR;
- tableaux très imbriqués, cellules fusionnées sans bordures, texte tourné et
  écritures RTL complexes demandent encore des heuristiques;
- les PDF vectorisant les caractères n'ont pas de couche texte exploitable;
- la fixture SoftFacture est une reproduction de régression générée, pas un
  document client réel. Un fichier problématique anonymisé doit être ajouté au
  corpus privé avant activation en production;
- le score contrôle la conservation et la structure, pas une vérité métier.
