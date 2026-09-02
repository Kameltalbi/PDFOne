import fs from 'node:fs/promises';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import { loadPdf, mapPdfError } from '../utils/pdf.js';
import { extractPdfLayout, type LayoutBlock } from '../utils/pdfText.js';
import { writeTemp } from '../utils/temp.js';
import { ocrLayoutBlocks } from './ocr.js';
import { translateFragments } from './nlp.js';

const MAX_PAGES = 30;
const MAX_BLOCKS = 280;
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

let fontFamily = 'sans-serif';
let fontsReady = false;

function keepOriginal(text: string) {
  const value = text.trim();
  if (value.length < 2) return true;
  if (!/[\p{L}]/u.test(value)) return true;
  if (/^https?:/i.test(value) || /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value)) return true;
  return false;
}

function registerFonts() {
  if (fontsReady) return;
  fontsReady = true;
  const extra = process.env.TRANSLATE_FONT_PATH?.trim();
  const candidates = [
    extra,
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/Library/Fonts/Arial Unicode.ttf'
  ].filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    try {
      GlobalFonts.registerFromPath(candidate, 'One2Translate');
      fontFamily = 'One2Translate';
      return;
    } catch {
      /* next */
    }
  }
}

function wrapLines(
  ctx: { measureText: (text: string) => { width: number } },
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
      continue;
    }
    let rest = word;
    while (rest.length) {
      let cut = rest.length;
      while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > maxWidth) cut -= 1;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    current = '';
  }
  if (current) lines.push(current);
  return lines;
}

function renderBlockPng(text: string, widthPt: number, heightPt: number, fontSize: number, rtl: boolean): Buffer {
  registerFonts();
  const scale = 2;
  const width = Math.max(8, Math.round(widthPt * scale));
  const height = Math.max(8, Math.round(heightPt * scale));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#111827';
  ctx.textBaseline = 'top';
  const maxWidth = width - 4;
  const maxSize = Math.max(7, fontSize * scale);
  let size = maxSize;
  let lines: string[] = [];
  let lineHeight = size * 1.2;
  while (size >= 6) {
    ctx.font = `${size}px ${fontFamily}`;
    lines = wrapLines(ctx, text, maxWidth);
    lineHeight = size * 1.22;
    if (lines.length * lineHeight <= height - 3) break;
    size -= 0.6;
  }
  ctx.font = `${size}px ${fontFamily}`;
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.textAlign = rtl ? 'right' : 'left';
  const x = rtl ? width - 2 : 2;
  const maxLines = Math.max(1, Math.floor((height - 2) / lineHeight));
  lines.slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, 2 + index * lineHeight, maxWidth);
  });
  return canvas.toBuffer('image/png');
}

function digitalTextScore(blocks: LayoutBlock[], pageCount: number) {
  const chars = blocks.reduce((sum, block) => sum + block.text.replace(/\s/g, '').length, 0);
  return chars / Math.max(1, pageCount);
}

export async function translatePdfDocument(filePath: string, target: string, source = 'auto') {
  try {
    const to = LANGS.has(target) ? target : 'en';
    const from = LANGS.has(source) ? source : 'auto';
    const bytes = await fs.readFile(filePath);
    const pdf = await loadPdf(bytes);
    if (pdf.getPageCount() > MAX_PAGES) {
      throw new Error(`La traduction conserve la mise en page jusqu’à ${MAX_PAGES} pages.`);
    }

    let layout = await extractPdfLayout(bytes);
    let mode: 'digital' | 'ocr' = 'digital';
    if (digitalTextScore(layout.blocks, layout.pageCount) < 45) {
      try {
        const ocrBlocks = await ocrLayoutBlocks(filePath, from === 'auto' ? to : from);
        if (ocrBlocks.length && (ocrBlocks.length > layout.blocks.length || digitalTextScore(layout.blocks, layout.pageCount) < 12)) {
          layout = { pageCount: pdf.getPageCount(), blocks: ocrBlocks };
          mode = 'ocr';
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

    const toTranslate = usable.map((block, index) => ({ index, block, skip: keepOriginal(block.text) }));
    const translated = await translateFragments(
      toTranslate.filter((item) => !item.skip).map((item) => item.block.text),
      to,
      from
    );
    let cursor = 0;
    const outputText: string[] = [];
    for (const item of toTranslate) {
      const next = item.skip ? item.block.text : (translated[cursor++] || item.block.text);
      item.block.text = next;
      outputText.push(next);
    }

    for (const item of toTranslate) {
      const block = item.block;
      if (item.skip) continue;
      const page = pdf.getPage(block.pageIndex);
      const pad = 0.8;
      const x = Math.max(0, block.x - pad);
      const y = Math.max(0, block.y - pad);
      const w = block.w + pad * 2;
      const h = block.h + pad * 2;
      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: rgb(1, 1, 1)
      });
      const png = await pdf.embedPng(renderBlockPng(block.text, w, h, block.fontSize, Boolean(block.rtl) || to === 'ar'));
      page.drawImage(png, { x, y, width: w, height: h });
    }

    const pdfOut = await writeTemp(await pdf.save(), 'traduction', 'pdf');
    const txtOut = await writeTemp(Buffer.from(`${outputText.join('\n')}\n`, 'utf8'), 'traduction', 'txt');
    return {
      ...pdfOut,
      textDownloadUrl: txtOut.downloadUrl,
      textFilename: txtOut.filename,
      mode,
      language: LANG_NAMES[to] || to
    };
  } catch (error) {
    throw new Error(mapPdfError(error, error instanceof Error ? error.message : 'Impossible de traduire ce PDF.'));
  }
}
