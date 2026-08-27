import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { mapPdfError } from '../utils/pdf.js';
import { rasterizePdfPages } from '../utils/rasterize.js';
import { writeTemp } from '../utils/temp.js';

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

let queue = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

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

export async function ocrPdf(filePath: string, locale = 'fr') {
  return withLock(async () => {
    try {
      const bin = await resolveTesseract();
      const langs = await availableLangs(bin);
      const wanted = LANGS[locale] || 'eng';
      const lang = langs.has(wanted) ? (langs.has('eng') && wanted !== 'eng' ? `${wanted}+eng` : wanted) : 'eng';
      const bytes = await fs.readFile(filePath);
      const images = await rasterizePdfPages(bytes, { scale: 2, format: 'png' });
      if (!images.length) throw new Error('Aucune page à reconnaître.');

      const work = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-ocr-'));
      try {
        const pdf = await PDFDocument.create();
        const texts: string[] = [];
        for (const [index, image] of images.entries()) {
          const input = path.join(work, `page-${index}.png`);
          const base = path.join(work, `out-${index}`);
          await fs.writeFile(input, image);
          await execFileAsync(bin, [input, base, '-l', lang], { timeout: 120000 });
          await execFileAsync(bin, [input, base, '-l', lang, 'pdf'], { timeout: 120000 }).catch(() => undefined);
          const pagePdf = await fs.readFile(`${base}.pdf`).catch(() => null);
          const pageTxt = await fs.readFile(`${base}.txt`, 'utf8').catch(() => '');
          if (pageTxt.trim()) texts.push(pageTxt.trim());
          if (pagePdf) {
            const part = await PDFDocument.load(pagePdf);
            const copied = await pdf.copyPages(part, part.getPageIndices());
            copied.forEach((page) => pdf.addPage(page));
          }
        }
        if (pdf.getPageCount() > 0) {
          return writeTemp(await pdf.save(), 'ocr', 'pdf');
        }
        if (texts.length) {
          return writeTemp(Buffer.from(`${texts.join('\n\n')}\n`, 'utf8'), 'ocr', 'txt');
        }
        throw new Error('L’OCR n’a reconnu aucun texte.');
      } finally {
        await fs.rm(work, { recursive: true, force: true }).catch(() => undefined);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Tesseract n’est pas installé')) {
        throw error;
      }
      throw new Error(mapPdfError(error, error instanceof Error ? error.message : 'Impossible d’effectuer l’OCR.'));
    }
  });
}
