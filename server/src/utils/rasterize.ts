import path from 'path';
import { createRequire } from 'module';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const pdfjsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));

type RasterOptions = {
  scale?: number;
  format?: 'jpeg' | 'png';
  quality?: number;
  password?: string;
};

type PdfjsCanvas = {
  canvas: { toBuffer: (mime?: string) => Buffer };
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

export async function rasterizePdfPages(
  pdfBytes: Uint8Array,
  options: RasterOptions = {}
): Promise<Buffer[]> {
  const scale = options.scale ?? 2;
  const format = options.format ?? 'jpeg';
  const quality = options.quality ?? 85;

  const loadingTask = getDocument({
    data: toUint8(pdfBytes),
    password: options.password || '',
    cMapUrl: `${path.join(pdfjsRoot, 'cmaps')}/`,
    cMapPacked: true,
    standardFontDataUrl: `${path.join(pdfjsRoot, 'standard_fonts')}/`,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true
  } as never);

  let pdf: Awaited<typeof loadingTask.promise> | null = null;
  try {
    pdf = await loadingTask.promise;
  } catch (error) {
    await loadingTask.destroy().catch(() => undefined);
    throw error;
  }

  const canvasFactory = (pdf as unknown as { canvasFactory: PdfjsFactory }).canvasFactory;
  const images: Buffer[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

      try {
        await page.render({
          canvas: canvasAndContext.canvas,
          canvasContext: canvasAndContext.context,
          viewport
        } as never).promise;

        const png = canvasAndContext.canvas.toBuffer('image/png');
        if (format === 'png') {
          images.push(png);
        } else {
          images.push(await sharp(png).jpeg({ quality, mozjpeg: true }).toBuffer());
        }
      } finally {
        canvasFactory.destroy(canvasAndContext);
        page.cleanup();
      }
    }
  } finally {
    await loadingTask.destroy().catch(() => undefined);
  }

  return images;
}
