import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { mapPdfError } from '../utils/pdf.js';
import { forEachRasterPage } from '../utils/rasterize.js';
import type { LayoutBlock } from '../utils/pdfText.js';
import { writeTemp } from '../utils/temp.js';
import { ocrQueue } from '../utils/jobQueue.js';

const execFileAsync = promisify(execFile);

const LANGS: Record<string, string> = {
  fr: 'fra',
  en: 'eng',
  es: 'spa',
  pt: 'por',
  de: 'deu',
  tr: 'tur',
  ar: 'ara',
  it: 'ita'
};

let cachedBinary: string | null = null;

async function resolveTesseract(): Promise<string> {
  const candidates = [
    process.env.TESSERACT_PATH,
    '/opt/homebrew/bin/tesseract',
    '/usr/local/bin/tesseract',
    '/usr/bin/tesseract'
  ].filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      /* next */
    }
  }
  throw new Error('Tesseract n’est pas installé sur le serveur. Installez-le pour lancer l’OCR.');
}

async function availableLangs(bin: string): Promise<Set<string>> {
  try {
    const { stdout } = await execFileAsync(bin, ['--list-langs'], { timeout: 15000 });
    return new Set(stdout.split(/\s+/).map((value) => value.trim()).filter(Boolean));
  } catch {
    return new Set(['eng']);
  }
}

function parseTsvLines(tsv: string, pageIndex: number, pageWidth: number, pageHeight: number, scale: number): LayoutBlock[] {
  const blocks: LayoutBlock[] = [];
  for (const line of tsv.split('\n')) {
    const cols = line.split('\t');
    if (cols.length < 12 || cols[0] !== '4') continue;
    const left = Number(cols[6]);
    const top = Number(cols[7]);
    const width = Number(cols[8]);
    const height = Number(cols[9]);
    const conf = Number(cols[10]);
    const text = cols.slice(11).join('\t').trim();
    if (!text || conf < 35 || !Number.isFinite(left) || width < 4 || height < 4) continue;
    const x = left / scale;
    const h = height / scale;
    const w = width / scale;
    const y = pageHeight - (top + height) / scale;
    if (x > pageWidth || y > pageHeight) continue;
    blocks.push({
      pageIndex,
      x: Math.max(0, x),
      y: Math.max(0, y),
      w: Math.min(w, pageWidth - x),
      h: Math.min(h, pageHeight - y),
      fontSize: Math.max(7, h * 0.78),
      text
    });
  }
  return blocks;
}

export async function ocrLayoutBlocks(filePath: string, locale = 'fr'): Promise<LayoutBlock[]> {
  return ocrQueue.run(async () => {
    const bin = await resolveTesseract();
    const langs = await availableLangs(bin);
    const wanted = LANGS[locale] || 'eng';
    const lang = langs.has(wanted) ? (langs.has('eng') && wanted !== 'eng' ? `${wanted}+eng` : wanted) : 'eng';
    const bytes = await fs.readFile(filePath);
    const pdf = await PDFDocument.load(bytes);
    const scale = 2;
    const work = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-ocr-layout-'));
    const blocks: LayoutBlock[] = [];
    try {
      await forEachRasterPage(bytes, { scale, format: 'png' }, async ({ index, image }) => {
        const page = pdf.getPage(index);
        const { width, height } = page.getSize();
        const input = path.join(work, `page-${index}.png`);
        const base = path.join(work, `out-${index}`);
        await fs.writeFile(input, image);
        await execFileAsync(bin, [input, base, '-l', lang, 'tsv'], { timeout: 120000 });
        const tsv = await fs.readFile(`${base}.tsv`, 'utf8').catch(() => '');
        blocks.push(...parseTsvLines(tsv, index, width, height, scale));
        await fs.unlink(input).catch(() => undefined);
      });
    } finally {
      await fs.rm(work, { recursive: true, force: true }).catch(() => undefined);
    }
    return blocks;
  });
}

export async function ocrPdf(filePath: string, locale = 'fr') {
  return ocrQueue.run(async () => {
    try {
      const bin = await resolveTesseract();
      const langs = await availableLangs(bin);
      const wanted = LANGS[locale] || 'eng';
      const lang = langs.has(wanted) ? (langs.has('eng') && wanted !== 'eng' ? `${wanted}+eng` : wanted) : 'eng';
      const bytes = await fs.readFile(filePath);
      const work = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-ocr-'));
      try {
        const pdf = await PDFDocument.create();
        const texts: string[] = [];
        let pdfPageFailures = 0;
        let totalPages = 0;

        totalPages = await forEachRasterPage(bytes, { scale: 2, format: 'png' }, async ({ index, image }) => {
          const input = path.join(work, `page-${index}.png`);
          const base = path.join(work, `out-${index}`);
          await fs.writeFile(input, image);
          await execFileAsync(bin, [input, base, '-l', lang], { timeout: 120000 });
          try {
            await execFileAsync(bin, [input, base, '-l', lang, 'pdf'], { timeout: 120000 });
          } catch {
            pdfPageFailures += 1;
            await fs.unlink(input).catch(() => undefined);
            return;
          }
          const pagePdf = await fs.readFile(`${base}.pdf`).catch(() => null);
          const pageTxt = await fs.readFile(`${base}.txt`, 'utf8').catch(() => '');
          if (pageTxt.trim()) texts.push(pageTxt.trim());
          if (!pagePdf) {
            pdfPageFailures += 1;
            await fs.unlink(input).catch(() => undefined);
            return;
          }
          const part = await PDFDocument.load(pagePdf);
          const copied = await pdf.copyPages(part, part.getPageIndices());
          copied.forEach((page) => pdf.addPage(page));
          await fs.unlink(input).catch(() => undefined);
        });

        if (!totalPages) throw new Error('Aucune page à reconnaître.');
        if (pdfPageFailures > 0 && pdf.getPageCount() > 0 && pdf.getPageCount() < totalPages) {
          throw new Error(
            `L’OCR n’a pas pu produire toutes les pages (${pdf.getPageCount()}/${totalPages}). Réessayez ou utilisez un autre document.`
          );
        }
        if (pdf.getPageCount() === totalPages && totalPages > 0) {
          return writeTemp(await pdf.save(), 'ocr', 'pdf');
        }
        if (pdf.getPageCount() === 0 && texts.length) {
          return writeTemp(Buffer.from(`${texts.join('\n\n')}\n`, 'utf8'), 'ocr', 'txt');
        }
        if (pdf.getPageCount() === 0) {
          throw new Error('L’OCR n’a reconnu aucun texte.');
        }
        throw new Error(
          `L’OCR n’a pas pu produire toutes les pages (${pdf.getPageCount()}/${totalPages}). Réessayez ou utilisez un autre document.`
        );
      } finally {
        await fs.rm(work, { recursive: true, force: true }).catch(() => undefined);
      }
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('Tesseract n’est pas installé')
        || (error as Error & { code?: string }).code === 'SERVER_BUSY'
      )) {
        throw error;
      }
      throw new Error(mapPdfError(error, error instanceof Error ? error.message : 'Impossible d’effectuer l’OCR.'));
    }
  });
}
