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

export function rotateImageDataUrl(src: string, degrees: number): Promise<string> {
  const deg = ((Math.round(Number(degrees) / 90) * 90) % 360 + 360) % 360;
  if (!src || deg === 0) return Promise.resolve(src);

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const swap = deg === 90 || deg === 270;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, swap ? image.naturalHeight : image.naturalWidth);
      canvas.height = Math.max(1, swap ? image.naturalWidth : image.naturalHeight);
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(src);
        return;
      }
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((deg * Math.PI) / 180);
      context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.onerror = () => resolve(src);
    image.src = src;
  });
}

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const PDF_PREVIEW_MAX_BYTES = 80 * 1024 * 1024;

export type ResultPreview = { src: string; objectUrl?: string };

function fileExt(name: string) {
  const clean = name.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

function tempPreviewPath(downloadUrl: string): string | null {
  try {
    const url = new URL(downloadUrl, window.location.origin);
    if (!url.pathname.startsWith('/temp/')) return null;
    if (url.pathname.endsWith('/preview')) return `${url.pathname}${url.search}`;
    return `${url.pathname}/preview${url.search}`;
  } catch {
    return null;
  }
}

export async function renderPdfThumbFromUrl(url: string, signal?: AbortSignal): Promise<string | null> {
  ensurePdfWorker();
  const local = url.startsWith('blob:') || url.startsWith('data:');
  const response = await fetch(url, local ? undefined : { signal, credentials: 'include' });
  if (!response.ok || (!local && signal?.aborted)) return null;
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength < 8 || buffer.byteLength > PDF_PREVIEW_MAX_BYTES) return null;
  const data = new Uint8Array(buffer);
  if (data[0] !== 0x25 || data[1] !== 0x50 || data[2] !== 0x44 || data[3] !== 0x46) return null;

  const pdf = await pdfjsLib.getDocument({ data }).promise;
  try {
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(1.25, 720 / Math.max(base.width, 1));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) return null;
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.78);
  } catch {
    return null;
  } finally {
    await closePdf(pdf);
  }
}

/** Thumbnail of the processed download (PDF page 1 or image). Does not consume /temp downloads. */
export async function loadResultPreview(
  downloadUrl: string,
  fileName: string,
  signal?: AbortSignal
): Promise<ResultPreview | null> {
  const ext = fileExt(fileName) || fileExt(downloadUrl);
  const local = downloadUrl.startsWith('blob:') || downloadUrl.startsWith('data:');

  try {
    if (local) {
      if (IMAGE_EXT.has(ext)) return { src: downloadUrl };
      if (ext === 'pdf' || !ext) {
        const src = await renderPdfThumbFromUrl(downloadUrl);
        return src ? { src } : null;
      }
      return null;
    }

    const previewPath = tempPreviewPath(downloadUrl);
    if (previewPath) {
      const response = await fetch(previewPath, { credentials: 'include', signal });
      if (!response.ok || signal?.aborted) return null;
      const blob = await response.blob();
      if (blob.size < 32 || signal?.aborted) return null;
      const objectUrl = URL.createObjectURL(blob);
      return { src: objectUrl, objectUrl };
    }

    if (IMAGE_EXT.has(ext)) return { src: downloadUrl };
    return null;
  } catch (error) {
    if (signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) return null;
    return null;
  }
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
