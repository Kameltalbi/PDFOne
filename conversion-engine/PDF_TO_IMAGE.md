# PDF → JPG V2

## Audit

Endpoint public : `POST /api/to-jpg`.

Flux V1 :

1. `server/src/routes/toJpg.ts` reçoit le PDF avec Multer;
2. `server/src/services/toJpg.ts` soumet un job `toRaster`;
3. `server/src/utils/workerPool.ts` l'exécute dans le pool lourd et la
   `pdfQueue`;
4. `server/src/utils/heavyJobs.ts` lit le PDF, appelle
   `forEachRasterPage()`, retourne un JPG pour une page ou un ZIP sinon;
5. `server/src/utils/rasterize.ts` utilise PDF.js, son canvas Node interne,
   convertit d'abord en PNG puis Sharp/JPEG;
6. le résultat passe par le stockage temporaire et le TTL existants.

Le V1 n'extrait donc pas les images incorporées. Il tente déjà de rendre la
page entière. Le défaut architectural se situe dans le couple PDF.js/backend
canvas Node, qui ne reproduit pas correctement certains display lists alors
que les images incorporées restent visibles. Sans le PDF original, l'opérateur
ou la police précise qui déclenche le défaut ne peut pas être déterminé sans
spéculation.

## V2

Le V2 utilise PDFium via `pypdfium2` :

```text
PDF → PdfDocument → PdfPage.render() → bitmap RGB → Pillow JPEG
```

PDFium rend la page comme une visionneuse : texte, chemins vectoriels,
bordures, fonds, images, transparence, formulaires et annotations.

Architecture :

```text
conversion_engine/pdf_to_image/
  models.py
  renderer.py
  cli.py
server/src/services/pdfToImage.ts
```

Le blanc est imposé comme fond opaque. La sortie est toujours RGB et conserve
le ratio. Une page produit un JPG; plusieurs pages produisent un ZIP avec
`page-001.jpg`, `page-002.jpg`, etc.

PyMuPDF n'est pas utilisé car sa licence AGPL/commerciale est risquée pour un
SaaS propriétaire. PDFium/pypdfium2 fournit le même type de rasterisation avec
une licence permissive.

## Qualité et limites

Niveaux disponibles :

- Standard : 150 DPI (défaut)
- High : 200 DPI
- Very High : 300 DPI

Chaque page est bornée par `RASTER_MAX_PIXELS` et
`PDF_TO_IMAGE_MAX_DIMENSION`. Le DPI effectif est réduit proportionnellement
si nécessaire. Une seule page et un seul buffer JPEG sont conservés pendant
le rendu. Le ZIP est écrit progressivement.

Autres protections :

- limite de pages;
- queue PDF bornée;
- timeout du sous-processus;
- annulation sur déconnexion;
- détection PDF corrompu/protégé;
- sortie partielle supprimée;
- purge des dossiers `pdfone-image-*`;
- logs JSON par conversion/page sans contenu documentaire.

## Feature flag

V1 reste actif par défaut :

```dotenv
PDF_TO_IMAGE_ENGINE=v1
```

Activer V2 :

```dotenv
PDF_TO_IMAGE_ENGINE=v2
PDF_TO_IMAGE_PYTHON_PATH=/absolute/path/to/conversion-engine/.venv/bin/python
PDF_TO_IMAGE_QUALITY_LEVEL=standard
PDF_TO_IMAGE_DPI=150
PDF_TO_IMAGE_MAX_PAGES=200
PDF_TO_IMAGE_MAX_DIMENSION=10000
RASTER_MAX_PIXELS=12000000
PDF_TO_IMAGE_RUN_TIMEOUT_MS=300000
```

`PDF_TO_IMAGE_DPI` remplace le niveau lorsqu'il est défini.

Rollback : remettre `PDF_TO_IMAGE_ENGINE=v1` et redémarrer Node.

## Tests

```bash
npm run setup:conversion-engine
npm run test:pdf-to-image
npm run test:conversion-engine
npm run build:server
```

Les neuf régressions couvrent : texte seul, facture complète, image incorporée,
vecteurs, multi-page, paysage, transparence, grande page et PDF corrompu.

Le test facture vérifie par analyse de pixels neuf régions : logo, titre,
numéro, date, vendeur, client, table, montants/TVA/totaux et pied de page.
La fixture est une reproduction générée. Le PDF problématique anonymisé doit
être ajouté au corpus privé avant activation générale.
