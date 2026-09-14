import fs from 'node:fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { extractPdfLayout } from '../../utils/pdfText.js';
import { comparePdfGeometry } from './compare.js';
import { renderTranslatedPdf } from './pdfRenderer.js';
import { fitBlock } from './layoutEngine.js';
import type { FittedBlock } from './types.js';

/** Build a tiny digital PDF, overlay identity "translation", and print a geometry report. */
export async function selfCheckTranslateLayout() {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([400, 500]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText('Hello layout', { x: 40, y: 420, size: 18, font, color: rgb(0, 0, 0) });
  page.drawText('A short paragraph for fitting.', { x: 40, y: 380, size: 11, font, color: rgb(0, 0, 0) });
  const original = await pdf.save();
  const layout = await extractPdfLayout(original);
  const fitted: FittedBlock[] = layout.blocks.map((block, index) => {
    const fit = fitBlock(block, block.text, 'en', 12);
    return {
      ...block,
      id: `page${block.pageIndex + 1}_block${index + 1}`,
      translation: block.text,
      skip: false,
      fittedSize: fit.fittedSize,
      extraHeight: fit.extraHeight,
      warning: fit.warning
    };
  });
  const rendered = await renderTranslatedPdf(original, fitted, layout.pages, 'en', 'layout');
  const translatedBytes = await fs.readFile(rendered.filepath);
  const geometry = await comparePdfGeometry(original, translatedBytes);
  return {
    extractedBlocks: layout.blocks.length,
    geometry,
    overflows: rendered.overflows,
    overlaps: rendered.overlaps,
    warnings: rendered.warnings
  };
}
