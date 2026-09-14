import fs from 'node:fs/promises';
import { loadPdf, mapPdfError } from '../../utils/pdf.js';
import { extractPdfLayout, type LayoutBlock } from '../../utils/pdfText.js';
import { documentTitle, digitalTextScore, shouldUseOcr } from './documentAnalyzer.js';
import { extractOcrBlocks } from './ocrService.js';
import { fitBlock } from './layoutEngine.js';
import { keepOriginal, translateBlocks } from './translationService.js';
import { renderTranslatedPdf } from './pdfRenderer.js';
import { buildReport } from './compare.js';
import type { FittedBlock, TranslateMode } from './types.js';

const MAX_PAGES = 100;
const MAX_BLOCKS = 1200;
const LANGS = new Set(['fr', 'en', 'es', 'pt', 'de', 'tr', 'ar', 'it']);

const LANG_NAMES: Record<string, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
  tr: 'Turkish',
  ar: 'Arabic',
  it: 'Italian'
};

function assignIds(blocks: LayoutBlock[]): Array<LayoutBlock & { id: string }> {
  return blocks.map((block, index) => ({
    ...block,
    id: `page${block.pageIndex + 1}_block${index + 1}`
  }));
}

function maxGrow(block: LayoutBlock, pageBlocks: LayoutBlock[], pageHeight: number) {
  const top = block.y + block.h;
  const above = pageBlocks
    .filter((other) => other !== block && other.y >= top - 1)
    .sort((a, b) => a.y - b.y)[0];
  const ceiling = above ? above.y : pageHeight;
  return Math.min(Math.max(0, ceiling - top - 4), block.h * 0.4, 28);
}

export async function translatePdfDocument(
  filePath: string,
  target: string,
  source = 'auto',
  mode: TranslateMode = 'layout'
) {
  try {
    const to = LANGS.has(target) ? target : 'en';
    const from = LANGS.has(source) ? source : 'auto';
    const outputMode: TranslateMode = mode === 'text' ? 'text' : 'layout';
    const bytes = await fs.readFile(filePath);
    const pdf = await loadPdf(bytes);
    if (pdf.getPageCount() > MAX_PAGES) {
      throw new Error(`La traduction conserve la mise en page jusqu’à ${MAX_PAGES} pages.`);
    }

    let layout = await extractPdfLayout(bytes);
    let engine: 'digital' | 'ocr' = 'digital';
    if (shouldUseOcr(layout.blocks, layout.pageCount)) {
      try {
        const ocrBlocks = await extractOcrBlocks(filePath, from === 'auto' ? to : from);
        if (
          ocrBlocks.length
          && (ocrBlocks.length > layout.blocks.length || digitalTextScore(layout.blocks, layout.pageCount) < 12)
        ) {
          layout = {
            pageCount: pdf.getPageCount(),
            blocks: ocrBlocks,
            pages: layout.pages.length ? layout.pages : pdf.getPages().map((page) => page.getSize())
          };
          engine = 'ocr';
        }
      } catch {
        /* keep digital text when OCR is unavailable */
      }
    }

    const usable = layout.blocks
      .filter((block) => block.w >= 8 && block.h >= 6 && block.text.trim())
      .slice(0, MAX_BLOCKS);
    if (!usable.length) {
      throw new Error('Aucun texte extractible. Sur un scan illisible, lancez d’abord l’OCR.');
    }

    const identified = assignIds(usable);
    const title = documentTitle(identified);
    const toTranslate = identified.map((block, index) => ({
      block,
      skip: keepOriginal(block.text),
      prev: identified[index - 1]?.text,
      next: identified[index + 1]?.text
    }));
    const translations = await translateBlocks(
      toTranslate
        .filter((item) => !item.skip)
        .map((item) => ({
          id: item.block.id,
          text: item.block.text,
          prev: item.prev,
          next: item.next
        })),
      to,
      from,
      title
    );

    const fitted: FittedBlock[] = toTranslate.map((item) => {
      const translation = item.skip ? item.block.text : (translations.get(item.block.id) || item.block.text);
      const pageBlocks = identified.filter((block) => block.pageIndex === item.block.pageIndex);
      const page = layout.pages[item.block.pageIndex] || pdf.getPage(item.block.pageIndex).getSize();
      const fit = item.skip
        ? { fittedSize: item.block.fontSize, extraHeight: 0 as number }
        : fitBlock(item.block, translation, to, maxGrow(item.block, pageBlocks, page.height));
      return {
        ...item.block,
        translation,
        skip: item.skip,
        fittedSize: fit.fittedSize,
        extraHeight: fit.extraHeight,
        warning: 'warning' in fit ? fit.warning : undefined
      };
    });

    const rendered = await renderTranslatedPdf(bytes, fitted, layout.pages, to, outputMode);
    const report = buildReport(layout.pages, pdf.getPageCount(), fitted, {
      engine,
      mode: outputMode,
      language: LANG_NAMES[to] || to
    });

    return {
      ...rendered,
      mode: engine,
      output: outputMode,
      language: report.language,
      warnings: [...new Set([...report.warnings, ...rendered.warnings])].slice(0, 40),
      pageCountMatch: report.pageCountMatch
    };
  } catch (error) {
    throw new Error(mapPdfError(error, error instanceof Error ? error.message : 'Impossible de traduire ce PDF.'));
  }
}
