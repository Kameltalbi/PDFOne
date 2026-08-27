import fs from 'fs/promises';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { loadPdf, mapPdfError, pagesToKeep, parsePageOrder, parseRotations } from '../utils/pdf.js';
import { writeTemp } from '../utils/temp.js';

async function rebuild(
  filePath: string,
  apply: (source: PDFDocument) => Promise<PDFDocument>,
  fallback: string
): Promise<{ filepath: string; filename: string; downloadUrl: string }> {
  try {
    const source = await loadPdf(await fs.readFile(filePath));
    const output = await apply(source);
    return writeTemp(await output.save(), 'pages', 'pdf');
  } catch (error) {
    throw new Error(mapPdfError(error, fallback));
  }
}

export function deletePages(filePath: string, rawPages: unknown) {
  return rebuild(filePath, async (source) => {
    const keep = pagesToKeep(rawPages, source.getPageCount());
    const output = await PDFDocument.create();
    const copied = await output.copyPages(source, keep.map((page) => page - 1));
    copied.forEach((page) => output.addPage(page));
    return output;
  }, 'Impossible de supprimer ces pages.');
}

export function reorderPages(filePath: string, rawOrder: unknown) {
  return rebuild(filePath, async (source) => {
    const order = parsePageOrder(rawOrder, source.getPageCount());
    const output = await PDFDocument.create();
    const copied = await output.copyPages(source, order.map((page) => page - 1));
    copied.forEach((page) => output.addPage(page));
    return output;
  }, 'Impossible de réorganiser ces pages.');
}

export function rotatePages(filePath: string, rawRotations: unknown) {
  return rebuild(filePath, async (source) => {
    const rotations = parseRotations(rawRotations, source.getPageCount());
    rotations.forEach((extra, index) => {
      if (!extra) return;
      const page = source.getPage(index);
      const current = page.getRotation().angle;
      page.setRotation(degrees(((current + extra) % 360 + 360) % 360));
    });
    return source;
  }, 'Impossible de pivoter ce PDF.');
}

function parseHexColor(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const value = match?.[1] ?? '9ca3af';
  return rgb(
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255
  );
}

function toWinAnsi(text: string) {
  const safe = text.replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, '').trim();
  return safe || 'WATERMARK';
}

export function watermarkPdf(
  filePath: string,
  options: { text: string; opacity: number; rotation: number; color: string; mosaic: boolean }
) {
  const text = options.text.trim().slice(0, 80);
  if (!text) {
    throw new Error('Indiquez le texte du filigrane.');
  }

  const opacity = Math.min(0.75, Math.max(0.08, Number(options.opacity) || 0.22));
  const rotation = [0, 45, -45].includes(Number(options.rotation)) ? Number(options.rotation) : 45;

  return rebuild(filePath, async (source) => {
    const font = await source.embedFont(StandardFonts.HelveticaBold);
    const mark = toWinAnsi(text);
    const color = parseHexColor(options.color);

    for (const page of source.getPages()) {
      const { width, height } = page.getSize();
      const size = Math.max(18, Math.min(width, height) * 0.08);
      const textWidth = font.widthOfTextAtSize(mark, size);

      const drawAt = (x: number, y: number) => {
        page.drawText(mark, {
          x,
          y,
          size,
          font,
          color,
          opacity,
          rotate: degrees(rotation)
        });
      };

      if (options.mosaic) {
        const stepX = Math.max(textWidth + 56, 160);
        const stepY = size * 3.4;
        let drawn = 0;
        for (let y = stepY * 0.4; y < height && drawn < 40; y += stepY) {
          for (let x = 24; x < width && drawn < 40; x += stepX) {
            drawAt(x, y);
            drawn += 1;
          }
        }
      } else {
        const angle = (rotation * Math.PI) / 180;
        drawAt(
          width / 2 - (textWidth / 2) * Math.cos(angle),
          height / 2 - (textWidth / 2) * Math.sin(angle)
        );
      }
    }

    return source;
  }, 'Impossible d’ajouter ce filigrane.');
}

const PAGE_POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;
const PAGE_FORMATS = ['n', 'n_of_n', 'page_n', 'page_n_of_n'] as const;

type PagePosition = (typeof PAGE_POSITIONS)[number];
type PageFormat = (typeof PAGE_FORMATS)[number];

function asPagePosition(value: unknown): PagePosition {
  return PAGE_POSITIONS.includes(value as PagePosition) ? (value as PagePosition) : 'bottom-center';
}

function asPageFormat(value: unknown): PageFormat {
  return PAGE_FORMATS.includes(value as PageFormat) ? (value as PageFormat) : 'n_of_n';
}

function pageNumberLabel(format: PageFormat, n: number, total: number, locale: string) {
  const french = locale.toLowerCase().startsWith('fr');
  if (format === 'n') return String(n);
  if (format === 'page_n') return `Page ${n}`;
  if (format === 'page_n_of_n') return french ? `Page ${n} sur ${total}` : `Page ${n} of ${total}`;
  return `${n} / ${total}`;
}

function numberAnchor(position: PagePosition, width: number, height: number, textWidth: number, size: number) {
  const margin = 18;
  const top = height - margin - size;
  const bottom = margin;
  const left = margin;
  const right = Math.max(margin, width - margin - textWidth);
  const center = (width - textWidth) / 2;
  if (position === 'top-left') return { x: left, y: top };
  if (position === 'top-center') return { x: center, y: top };
  if (position === 'top-right') return { x: right, y: top };
  if (position === 'bottom-left') return { x: left, y: bottom };
  if (position === 'bottom-right') return { x: right, y: bottom };
  return { x: center, y: bottom };
}

export function numberPages(
  filePath: string,
  options: { format: string; position: string; start: number; color: string; locale: string }
) {
  const format = asPageFormat(options.format);
  const position = asPagePosition(options.position);
  const start = Math.min(9999, Math.max(1, Math.floor(Number(options.start) || 1)));
  const locale = options.locale || 'en';

  return rebuild(filePath, async (source) => {
    const font = await source.embedFont(StandardFonts.Helvetica);
    const color = parseHexColor(options.color);
    const pages = source.getPages();
    const total = start + pages.length - 1;
    const size = 11;

    pages.forEach((page, index) => {
      const n = start + index;
      const label = pageNumberLabel(format, n, total, locale);
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(label, size);
      const { x, y } = numberAnchor(position, width, height, textWidth, size);
      page.drawText(label, { x, y, size, font, color });
    });

    return source;
  }, 'Impossible d’ajouter les numéros de page.');
}

type CropMargins = { top: number; right: number; bottom: number; left: number };

function clampMargin(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(0.4, Math.max(0, n));
}

function visualMarginsToBox(page: { getCropBox: () => { x: number; y: number; width: number; height: number }; getRotation: () => { angle: number } }, margins: CropMargins) {
  const { x, y, width, height } = page.getCropBox();
  const rotation = ((page.getRotation().angle % 360) + 360) % 360;
  const { top, right, bottom, left } = margins;

  if (rotation === 90) {
    return {
      left: x + width * top,
      bottom: y + height * left,
      right: x + width * (1 - bottom),
      top: y + height * (1 - right)
    };
  }
  if (rotation === 270) {
    return {
      left: x + width * bottom,
      bottom: y + height * right,
      right: x + width * (1 - top),
      top: y + height * (1 - left)
    };
  }
  if (rotation === 180) {
    return {
      left: x + width * right,
      bottom: y + height * top,
      right: x + width * (1 - left),
      top: y + height * (1 - bottom)
    };
  }
  return {
    left: x + width * left,
    bottom: y + height * bottom,
    right: x + width * (1 - right),
    top: y + height * (1 - top)
  };
}

export function cropPages(filePath: string, raw: CropMargins) {
  const margins = {
    top: clampMargin(raw.top),
    right: clampMargin(raw.right),
    bottom: clampMargin(raw.bottom),
    left: clampMargin(raw.left)
  };

  if (margins.top + margins.right + margins.bottom + margins.left === 0) {
    throw new Error('Indiquez une marge à rogner.');
  }
  if (margins.top + margins.bottom >= 0.85 || margins.left + margins.right >= 0.85) {
    throw new Error('Les marges sont trop larges pour ce PDF.');
  }

  return rebuild(filePath, async (source) => {
    for (const page of source.getPages()) {
      const box = visualMarginsToBox(page, margins);
      const width = box.right - box.left;
      const height = box.top - box.bottom;
      if (width < 24 || height < 24) {
        throw new Error('Les marges sont trop larges pour ce PDF.');
      }
      page.setMediaBox(box.left, box.bottom, width, height);
      page.setCropBox(box.left, box.bottom, width, height);
      page.setBleedBox(box.left, box.bottom, width, height);
      page.setTrimBox(box.left, box.bottom, width, height);
      page.setArtBox(box.left, box.bottom, width, height);
    }
    return source;
  }, 'Impossible de rogner ce PDF.');
}
