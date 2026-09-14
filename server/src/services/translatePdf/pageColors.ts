import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { FittedBlock } from './types.js';

export type RGB = { r: number; g: number; b: number };

export type BlockPaint = {
  fill: RGB;
  text: RGB;
};

function dist(a: RGB, b: RGB) {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function luma(color: RGB) {
  return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
}

function quantizeKey(color: RGB) {
  return `${color.r >> 4},${color.g >> 4},${color.b >> 4}`;
}

function majorityColor(colors: RGB[]): RGB {
  if (!colors.length) return { r: 255, g: 255, b: 255 };
  const buckets = new Map<string, RGB[]>();
  for (const color of colors) {
    const key = quantizeKey(color);
    const list = buckets.get(key) || [];
    list.push(color);
    buckets.set(key, list);
  }
  let best: RGB[] = [];
  for (const list of buckets.values()) {
    if (list.length > best.length) best = list;
  }
  return medianColor(best.length ? best : colors);
}

function contrastColor(fill: RGB, candidates: RGB[]): RGB {
  if (!candidates.length) return luma(fill) > 140 ? { r: 17, g: 24, b: 39 } : { r: 255, g: 255, b: 255 };
  return candidates.reduce((best, color) => (dist(color, fill) > dist(best, fill) ? color : best));
}

function medianColor(colors: RGB[]): RGB {
  if (!colors.length) return { r: 255, g: 255, b: 255 };
  const mid = (key: keyof RGB) => {
    const values = colors.map((color) => color[key]).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  };
  return { r: mid('r'), g: mid('g'), b: mid('b') };
}

function paintKey(block: FittedBlock) {
  return `${block.pageIndex}:${Math.round(block.x)}:${Math.round(block.y)}`;
}

export function cssRgb(color: RGB) {
  return `rgb(${color.r},${color.g},${color.b})`;
}

export async function sampleBlockPaints(
  pdfBytes: Uint8Array,
  blocks: FittedBlock[]
): Promise<Map<string, BlockPaint>> {
  const paints = new Map<string, BlockPaint>();
  const drawn = blocks.filter((block) => !block.skip);
  if (!drawn.length) return paints;

  const data = Uint8Array.from(pdfBytes);
  const loadingTask = getDocument({
    data,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true
  } as never);
  const pdf = await loadingTask.promise;
  try {
    const byPage = new Map<number, FittedBlock[]>();
    for (const block of drawn) {
      const list = byPage.get(block.pageIndex) || [];
      list.push(block);
      byPage.set(block.pageIndex, list);
    }
    for (const [pageIndex, pageBlocks] of byPage) {
      const page = await pdf.getPage(pageIndex + 1);
      try {
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx as never, viewport }).promise;
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixel = (x: number, y: number): RGB | null => {
          const px = Math.round(x);
          const py = Math.round(y);
          if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) return null;
          const index = (py * canvas.width + px) * 4;
          return { r: image.data[index], g: image.data[index + 1], b: image.data[index + 2] };
        };
        for (const block of pageBlocks) {
          paints.set(paintKey(block), sampleOne(pixel, viewport, block));
        }
      } finally {
        page.cleanup();
      }
    }
  } finally {
    try {
      await (pdf as { destroy?: () => unknown }).destroy?.();
    } catch {
      /* ignore */
    }
  }
  return paints;
}

function sampleOne(
  pixel: (x: number, y: number) => RGB | null,
  viewport: { convertToViewportPoint: (x: number, y: number) => [number, number] },
  block: FittedBlock
): BlockPaint {
  const pad = 3;
  const outside: RGB[] = [];
  const inside: RGB[] = [];
  const corners = [
    [block.x - pad, block.y - pad],
    [block.x + block.w + pad, block.y - pad],
    [block.x - pad, block.y + block.h + pad],
    [block.x + block.w + pad, block.y + block.h + pad],
    [block.x + block.w / 2, block.y - pad],
    [block.x + block.w / 2, block.y + block.h + pad],
    [block.x - pad, block.y + block.h / 2],
    [block.x + block.w + pad, block.y + block.h / 2]
  ];
  for (const [x, y] of corners) {
    const [vx, vy] = viewport.convertToViewportPoint(x, y);
    const color = pixel(vx, vy);
    if (color) outside.push(color);
  }
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 10; col++) {
      const x = block.x + ((col + 0.5) / 10) * block.w;
      const y = block.y + ((row + 0.5) / 6) * block.h;
      const [vx, vy] = viewport.convertToViewportPoint(x, y);
      const color = pixel(vx, vy);
      if (color) inside.push(color);
    }
  }
  const fill = majorityColor(inside.length ? inside : outside);
  const ink = inside.filter((color) => dist(color, fill) > 40);
  const text = contrastColor(fill, ink);
  if (dist(text, fill) < 36) {
    return {
      fill,
      text: luma(fill) > 140 ? { r: 17, g: 24, b: 39 } : { r: 255, g: 255, b: 255 }
    };
  }
  return { fill, text };
}

export function paintFor(paints: Map<string, BlockPaint>, block: FittedBlock): BlockPaint {
  return paints.get(paintKey(block)) || {
    fill: { r: 255, g: 255, b: 255 },
    text: { r: 17, g: 24, b: 39 }
  };
}
