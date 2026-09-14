import { PDFDocument } from 'pdf-lib';
import { boxesOverlap } from './layoutEngine.js';
import type { FittedBlock, LayoutPage, TranslateReport } from './types.js';

export function buildReport(
  originalPages: LayoutPage[],
  outputPageCount: number,
  blocks: FittedBlock[],
  extras: Pick<TranslateReport, 'engine' | 'mode' | 'language'>
): TranslateReport {
  let overflows = 0;
  let overlaps = 0;
  const warnings: string[] = [];
  const drawn = blocks.filter((block) => !block.skip);

  for (const block of drawn) {
    const page = originalPages[block.pageIndex];
    if (!page) continue;
    if (block.x + block.w > page.width + 1 || block.y + (block.h + block.extraHeight) > page.height + 1) {
      overflows += 1;
    }
    if (block.warning) warnings.push(block.warning);
  }

  for (let i = 0; i < drawn.length; i++) {
    for (let j = i + 1; j < drawn.length; j++) {
      if (drawn[i].pageIndex !== drawn[j].pageIndex) continue;
      const a = { x: drawn[i].x, y: drawn[i].y, w: drawn[i].w, h: drawn[i].h + drawn[i].extraHeight };
      const b = { x: drawn[j].x, y: drawn[j].y, w: drawn[j].w, h: drawn[j].h + drawn[j].extraHeight };
      if (boxesOverlap(a, b)) overlaps += 1;
    }
  }

  return {
    ...extras,
    blockCount: blocks.length,
    translatedCount: drawn.length,
    warnings,
    pageCountMatch: originalPages.length === outputPageCount,
    overflows,
    overlaps
  };
}

export async function comparePdfGeometry(originalBytes: Uint8Array, translatedBytes: Uint8Array) {
  const original = await PDFDocument.load(originalBytes);
  const translated = await PDFDocument.load(translatedBytes);
  const originalCount = original.getPageCount();
  const translatedCount = translated.getPageCount();
  const sizes = Array.from({ length: Math.max(originalCount, translatedCount) }, (_, index) => {
    const a = index < originalCount ? original.getPage(index).getSize() : null;
    const b = index < translatedCount ? translated.getPage(index).getSize() : null;
    return {
      page: index + 1,
      original: a,
      translated: b,
      match: Boolean(a && b && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5)
    };
  });
  return {
    originalPages: originalCount,
    translatedPages: translatedCount,
    pageCountMatch: originalCount === translatedCount,
    sizes
  };
}
