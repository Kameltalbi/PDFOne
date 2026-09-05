import path from 'path';
import { createRequire } from 'module';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const pdfjsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));

export type RasterOptions = {
  scale?: number;
  format?: 'jpeg' | 'png';
  quality?: number;
  password?: string;
  /** Soft cap on decoded pixels per page (width * height). */
  maxPixels?: number;
};

type PdfjsCanvas = {
  canvas: { toBuffer: (mime?: string) => Buffer; width?: number; height?: number };
  context: unknown;
};

type PdfjsFactory = {
  create: (width: number, height: number) => PdfjsCanvas;
  destroy: (canvas: PdfjsCanvas) => void;
};

function toUint8(bytes: Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array && !Buffer.isBuffer(bytes)
    ? bytes
    : Uint8Array.from(bytes);
}

function maxPixelsBudget(options: RasterOptions): number {
  const configured = Number.parseInt(process.env.RASTER_MAX_PIXELS || '', 10);
  if (Number.isFinite(configured) && configured > 0) return configured;
  if (options.maxPixels && options.maxPixels > 0) return options.maxPixels;
  return 12_000_000;
}

function effectiveScale(
  pageWidth: number,
  pageHeight: number,
  requested: number,
  maxPixels: number
): number {
  const base = Math.max(0.25, requested);
  const pixels = pageWidth * pageHeight * base * base;
  if (pixels <= maxPixels) return base;
  return Math.max(0.25, base * Math.sqrt(maxPixels / pixels));
}

async function openPdf(pdfBytes: Uint8Array, password: string) {
  const loadingTask = getDocument({
    data: toUint8(pdfBytes),
    password: password || '',
    cMapUrl: `${path.join(pdfjsRoot, 'cmaps')}/`,
    cMapPacked: true,
    standardFontDataUrl: `${path.join(pdfjsRoot, 'standard_fonts')}/`,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true
  } as never);

  try {
    const pdf = await loadingTask.promise;
    return { loadingTask, pdf };
  } catch (error) {
    await loadingTask.destroy().catch(() => undefined);
    throw error;
  }
}

/**
 * Render pages one at a time. The page buffer is not retained after `onPage` resolves,
 * so callers can stream into a PDF/zip/OCR without holding every page in RAM.
 */
export async function forEachRasterPage(
  pdfBytes: Uint8Array,
  options: RasterOptions,
  onPage: (page: { index: number; total: number; image: Buffer }) => Promise<void> | void
): Promise<number> {
  const scale = options.scale ?? 2;
  const format = options.format ?? 'jpeg';
  const quality = options.quality ?? 85;
  const maxPixels = maxPixelsBudget(options);
  const { loadingTask, pdf } = await openPdf(pdfBytes, options.password || '');
  const canvasFactory = (pdf as unknown as { canvasFactory: PdfjsFactory }).canvasFactory;
  const total = pdf.numPages;

  try {
    for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const pageScale = effectiveScale(baseViewport.width, baseViewport.height, scale, maxPixels);
      const viewport = page.getViewport({ scale: pageScale });
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

      try {
        await page.render({
          canvas: canvasAndContext.canvas,
          canvasContext: canvasAndContext.context,
          viewport
        } as never).promise;

        const png = canvasAndContext.canvas.toBuffer('image/png');
        const image = format === 'png'
          ? png
          : await sharp(png).jpeg({ quality, mozjpeg: true }).toBuffer();
        await onPage({ index: pageNumber - 1, total, image });
      } finally {
        canvasFactory.destroy(canvasAndContext);
        page.cleanup();
      }
    }
  } finally {
    await loadingTask.destroy().catch(() => undefined);
  }

  return total;
}

/** Convenience when the caller truly needs every page at once. Prefer `forEachRasterPage`. */
export async function rasterizePdfPages(
  pdfBytes: Uint8Array,
  options: RasterOptions = {}
): Promise<Buffer[]> {
  const images: Buffer[] = [];
  await forEachRasterPage(pdfBytes, options, ({ image }) => {
    images.push(image);
  });
  return images;
}
