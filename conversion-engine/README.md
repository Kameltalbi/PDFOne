# One2PDF conversion engine

Moteur Python open source de conversion PDF vers DOCX. Il remplace totalement
LibreOffice **pour ce flux uniquement**. Les autres conversions Office restent
assurées par le service existant.

## Dépendances et licences

- `pdfplumber` / `pdfminer.six` : MIT
- `python-docx` : MIT
- Pillow : HPND
- OpenCV headless : Apache-2.0, optionnel (`.[vision]`)

PyMuPDF n'est volontairement pas utilisé : sa licence AGPL/commerciale doit
être examinée séparément avant toute intégration dans un SaaS propriétaire.

## Architecture

```text
src/conversion_engine/
  domain/       représentation intermédiaire et erreurs publiques
  extractors/   texte stylé, tableaux simples et images
  analyzers/    ordre de lecture, paragraphes, titres et listes
  builders/     reconstruction DOCX avec python-docx
  services/     orchestration et évaluation de qualité
  infra/        logs JSON structurés
  cli.py        contrat stable consommé par le serveur Node
tests/          tests unitaires et corpus PDF
scripts/        génération du rapport qualité
```

Le modèle intermédiaire `DocumentIR` contient des `PageIR`, puis des
`ParagraphBlock`, `TableBlock` et `ImageBlock`. Chaque objet conserve sa boîte
englobante en points. Le builder génère des paragraphes/runs éditables, styles
Heading, listes Word, tableaux, images et sections avec saut de page.

## Installation

```bash
cd conversion-engine
python3 -m venv .venv
.venv/bin/pip install -e '.[test,vision]'
.venv/bin/python -m conversion_engine.cli --check
```

Configurer ensuite :

```dotenv
PDF2DOCX_PYTHON_PATH=/chemin/one2pdf/conversion-engine/.venv/bin/python
PDF2DOCX_RUN_TIMEOUT_MS=300000
PDF2DOCX_MAX_PAGES=200
PDF2DOCX_MAX_IMAGE_PIXELS=24000000
```

## CLI et logs

```bash
python -m conversion_engine.cli \
  --input input.pdf \
  --output output.docx \
  --report output.quality.json
```

La sortie standard contient une unique réponse JSON versionnable. Les logs
JSON détaillés sont écrits sur stderr. Ils n'incluent ni texte extrait ni
chemin utilisateur.

## Tests et rapport qualité

Le corpus par défaut est `capacity/fixtures`. Il est généré localement et
ignoré par Git :

```bash
node capacity/generate-fixtures.mjs
conversion-engine/.venv/bin/pytest conversion-engine/tests
conversion-engine/.venv/bin/python conversion-engine/scripts/quality_report.py
```

Pour une batterie de PDF réels confidentiels, placer les fichiers hors Git et
définir `PDF_CORPUS_DIR=/chemin/corpus`. Le rapport mesure couverture et
similarité textuelles, structures détectées, avertissements et durée. Ces
métriques ne mesurent pas à elles seules la fidélité visuelle.

## Classes et interfaces

- `DocumentAnalyzer.analyze()` : préflight et construction du `DocumentIR`.
- `TextExtractor.extract()` : caractères, positions, polices, taille, graisse,
  italique et couleur.
- `TableExtractor.extract()` : grilles simples avec score de confiance.
- `ImageExtractor.extract()` : images raster décodables, dédupliquées et
  bornées en pixels.
- `SemanticAnalyzer.analyze()` : colonnes, paragraphes, titres et listes.
- `DocxBuilder.build()` : DOCX structuré et éditable.
- `QualityEvaluator.evaluate()` : validation par réouverture et métriques.
- `ConversionService.convert()` : orchestration, atomicité et nettoyage.

## Migration progressive

1. Installer le moteur et exécuter les tests sur le corpus local.
2. Configurer `PDF2DOCX_PYTHON_PATH`; `/health/ready` vérifie alors le CLI.
3. Déployer avec une concurrence Office limitée et observer durée/RSS.
4. Comparer le rapport qualité sur un corpus réel représentatif.
5. Activer PDF→DOCX en production; l'API et le client restent inchangés.
6. Calibrer les heuristiques de colonnes, tableaux et styles à partir des
   échecs du corpus, sans journaliser le contenu.
7. Ajouter ultérieurement un fallback OCR Tesseract pour les scans. Dans cette
   phase, un scan est rejeté explicitement et orienté vers l'outil OCR.

## Limites connues

Le moteur vise un DOCX sémantique et éditable, pas une reproduction au pixel.
Les tableaux sans bordure, objets vectoriels, polices exotiques, texte tourné,
RTL complexe et mises en page très graphiques peuvent demander des
heuristiques supplémentaires.
