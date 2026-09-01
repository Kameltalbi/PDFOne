import { installMapPolyfill } from './mapPolyfill';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from './pdfjsWorker.ts?worker&url';

installMapPolyfill();

let workerReady = false;

export function ensurePdfWorker() {
  if (workerReady) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  workerReady = true;
}

async function closePdf(pdf: object) {
  const doc = pdf as { destroy?: () => unknown; cleanup?: () => void };
  if (typeof doc.destroy === 'function') {
    await doc.destroy();
    return;
  }
  doc.cleanup?.();
}

async function readPdfData(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

export async function getPdfPageCount(file: File): Promise<number> {
  ensurePdfWorker();
  const data = await readPdfData(file);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const count = pdf.numPages;
  await closePdf(pdf);
  return count;
}

export async function inspectPdfFile(file: File, scale = 0.85): Promise<{ pages: number; thumb: string | null }> {
  ensurePdfWorker();
  const data = await readPdfData(file);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  try {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) return { pages: pdf.numPages, thumb: null };
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    return { pages: pdf.numPages, thumb: canvas.toDataURL('image/jpeg', 0.78) };
  } catch {
    return { pages: pdf.numPages, thumb: null };
  } finally {
    await closePdf(pdf);
  }
}

export async function renderPdfPage(file: File, pageNumber: number, scale = 0.45): Promise<string> {
  ensurePdfWorker();
  const data = await readPdfData(file);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  try {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas indisponible');
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.72);
  } finally {
    await closePdf(pdf);
  }
}

export async function renderPdfPages(file: File, scale = 0.32): Promise<string[]> {
  ensurePdfWorker();
  const data = await readPdfData(file);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const thumbs: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) continue;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      thumbs.push(canvas.toDataURL('image/jpeg', 0.65));
    }
  } finally {
    await closePdf(pdf);
  }
  return thumbs;
}

export function parsePageRanges(input: string, pageCount: number): number[] {
  const pages = new Set<number>();
  const chunks = input.split(',').map((chunk) => chunk.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const range = chunk.split('-').map((part) => Number(part.trim()));
    if (range.length === 1 && Number.isInteger(range[0])) {
      if (range[0] >= 1 && range[0] <= pageCount) pages.add(range[0]);
      continue;
    }
    if (range.length === 2 && Number.isInteger(range[0]) && Number.isInteger(range[1])) {
      const start = Math.max(1, Math.min(range[0], range[1]));
      const end = Math.min(pageCount, Math.max(range[0], range[1]));
      for (let page = start; page <= end; page++) pages.add(page);
    }
  }

  return [...pages].sort((a, b) => a - b);
}
