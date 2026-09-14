import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { writeTemp } from '../../utils/temp.js';
import { boxesOverlap, renderBlockPng } from './layoutEngine.js';
import { cssRgb, paintFor, sampleBlockPaints } from './pageColors.js';
import type { FittedBlock, LayoutPage, TranslateMode } from './types.js';

function clip(block: FittedBlock, page: { width: number; height: number }): FittedBlock {
  const x = Math.max(0, block.x);
  const y = Math.max(0, block.y);
  const w = Math.min(block.w, page.width - x);
  const h = Math.min(block.h + block.extraHeight, page.height - y);
  return { ...block, x, y, w, h: Math.max(6, h) };
}

export async function renderTranslatedPdf(
  originalBytes: Uint8Array,
  blocks: FittedBlock[],
  pages: LayoutPage[],
  lang: string,
  mode: TranslateMode
) {
  if (mode === 'text') {
    return renderTextOnlyPdf(blocks, lang);
  }

  const pdf = await PDFDocument.load(originalBytes);
  const warnings: string[] = [];
  let overflows = 0;
  let overlaps = 0;
  const paints = await sampleBlockPaints(originalBytes, blocks).catch(() => new Map());

  const byPage = new Map<number, FittedBlock[]>();
  for (const block of blocks) {
    if (block.skip) continue;
    const list = byPage.get(block.pageIndex) || [];
    list.push(block);
    byPage.set(block.pageIndex, list);
  }

  for (const [pageIndex, pageBlocks] of byPage) {
    const page = pdf.getPage(pageIndex);
    const size = pages[pageIndex] || page.getSize();
    const drawn: FittedBlock[] = [];
    const sorted = [...pageBlocks].sort((a, b) => b.y - a.y || a.x - b.x);
    for (const raw of sorted) {
      const block = clip(raw, size);
      if (block.x + block.w > size.width + 0.5 || block.y + block.h > size.height + 0.5) {
        overflows += 1;
        warnings.push(block.warning || `Overflow on page ${pageIndex + 1}`);
      }
      if (drawn.some((other) => boxesOverlap(block, other))) {
        overlaps += 1;
      }
      const pad = 0.9;
      const paint = paintFor(paints, raw);
      page.drawRectangle({
        x: Math.max(0, block.x - pad),
        y: Math.max(0, block.y - pad),
        width: block.w + pad * 2,
        height: block.h + pad * 2,
        color: rgb(paint.fill.r / 255, paint.fill.g / 255, paint.fill.b / 255)
      });
      const png = await pdf.embedPng(renderBlockPng(
        block.translation,
        block.w,
        block.h,
        block.fittedSize,
        lang,
        block.rtl,
        block.align || 'left',
        {
          fill: cssRgb(paint.fill),
          color: cssRgb(paint.text),
          bold: block.kind === 'heading' || (block.kind === 'list' && block.fontSize >= 13)
        }
      ));
      page.drawImage(png, { x: block.x, y: block.y, width: block.w, height: block.h });
      drawn.push(block);
      if (block.warning) warnings.push(block.warning);
    }
  }

  const pdfOut = await writeTemp(await pdf.save(), 'traduction', 'pdf');
  const txtOut = await writeTemp(
    Buffer.from(`${blocks.map((block) => block.translation).join('\n')}\n`, 'utf8'),
    'traduction',
    'txt'
  );
  return {
    ...pdfOut,
    textDownloadUrl: txtOut.downloadUrl,
    textFilename: txtOut.filename,
    overflows,
    overlaps,
    warnings
  };
}

async function renderTextOnlyPdf(blocks: FittedBlock[], lang: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const rtl = lang === 'ar';
  let page = pdf.addPage([595.28, 841.89]);
  let y = 800;
  const size = 11;
  const left = 48;
  const width = 500;
  const paragraphs = blocks.map((block) => block.translation.trim()).filter(Boolean);

  const wrap = (text: string) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width) current = next;
      else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  for (const paragraph of paragraphs) {
    const lines = wrap(paragraph);
    for (const line of lines) {
      if (y < 56) {
        page = pdf.addPage([595.28, 841.89]);
        y = 800;
      }
      const textWidth = font.widthOfTextAtSize(line, size);
      const x = rtl ? 595.28 - 48 - textWidth : left;
      try {
        page.drawText(line, { x, y, size, font, color: rgb(0.07, 0.09, 0.15) });
      } catch {
        /* WinAnsi cannot encode some glyphs; skip that line in text-only PDF */
      }
      y -= 16;
    }
    y -= 10;
  }

  const pdfOut = await writeTemp(await pdf.save(), 'traduction', 'pdf');
  const txtOut = await writeTemp(Buffer.from(`${paragraphs.join('\n\n')}\n`, 'utf8'), 'traduction', 'txt');
  return {
    ...pdfOut,
    textDownloadUrl: txtOut.downloadUrl,
    textFilename: txtOut.filename,
    overflows: 0,
    overlaps: 0,
    warnings: [] as string[]
  };
}
