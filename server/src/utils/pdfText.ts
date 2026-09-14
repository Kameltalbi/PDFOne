import path from 'node:path';
import { createRequire } from 'node:module';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const require = createRequire(import.meta.url);
const pdfjsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));

type TextCell = { str: string; x: number; y: number; w: number; h: number };

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function clusterItems(items: Array<{ str?: string; transform?: number[]; width?: number; height?: number; hasEOL?: boolean }>): string[][] {
  const cells: TextCell[] = items
    .filter((item) => typeof item.str === 'string' && item.str.trim() && Array.isArray(item.transform))
    .map((item) => ({
      str: String(item.str).replace(/\s+/g, ' ').trim(),
      x: item.transform![4],
      y: item.transform![5],
      w: item.width ?? 0,
      h: item.height ?? 10
    }));

  if (!cells.length) return [];
  cells.sort((a, b) => b.y - a.y || a.x - b.x);

  const yTol = Math.max(3, median(cells.map((cell) => cell.h)) * 0.65);
  const rows: TextCell[][] = [];
  for (const cell of cells) {
    const current = rows[rows.length - 1];
    if (current && Math.abs(current[0].y - cell.y) <= yTol) current.push(cell);
    else rows.push([cell]);
  }

  const xGap = Math.max(10, median(cells.map((cell) => cell.h)) * 1.35);
  return rows.map((row) => {
    row.sort((a, b) => a.x - b.x);
    const cols: string[] = [];
    let text = row[0].str;
    let endX = row[0].x + row[0].w;
    for (let index = 1; index < row.length; index++) {
      const cell = row[index];
      if (cell.x <= endX + xGap) {
        text += (cell.x > endX + 1.5 ? ' ' : '') + cell.str;
        endX = Math.max(endX, cell.x + cell.w);
      } else {
        cols.push(text);
        text = cell.str;
        endX = cell.x + cell.w;
      }
    }
    cols.push(text);
    return cols;
  });
}

export type BlockKind = 'heading' | 'paragraph' | 'list' | 'table-cell' | 'caption';
export type BlockAlign = 'left' | 'center' | 'right';

export type LayoutBlock = {
  pageIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  text: string;
  rtl?: boolean;
  fontName?: string;
  color?: string;
  align?: BlockAlign;
  rotation?: number;
  kind?: BlockKind;
};

export type LayoutPage = {
  width: number;
  height: number;
};

type RawItem = {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  rtl: boolean;
  fontName?: string;
  rotation: number;
};

function openPdf(pdfBytes: Uint8Array, password = '') {
  const source = pdfBytes instanceof Uint8Array ? pdfBytes : Uint8Array.from(pdfBytes);
  const data = Uint8Array.from(source);
  return getDocument({
    data,
    password,
    cMapUrl: `${path.join(pdfjsRoot, 'cmaps')}/`,
    cMapPacked: true,
    standardFontDataUrl: `${path.join(pdfjsRoot, 'standard_fonts')}/`,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true
  } as never);
}

function itemRotation(transform: number[]) {
  return Math.atan2(transform[1], transform[0]);
}

function isRotated(transform: number[]) {
  return Math.abs(transform[1]) > 0.08 || Math.abs(transform[2]) > 0.08;
}

function groupLines(items: RawItem[]): RawItem[][] {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const yTol = Math.max(2.5, median(sorted.map((item) => item.h)) * 0.55);
  const lines: RawItem[][] = [];
  for (const item of sorted) {
    const current = lines[lines.length - 1];
    if (current && Math.abs(current[0].y - item.y) <= yTol) current.push(item);
    else lines.push([item]);
  }
  for (const line of lines) line.sort((a, b) => a.x - b.x);
  return lines;
}

function splitLineClusters(line: RawItem[]): RawItem[][] {
  if (line.length <= 1) return [line];
  const gapTol = Math.max(16, median(line.map((item) => item.h)) * 1.85);
  const clusters: RawItem[][] = [];
  let current = [line[0]];
  let endX = line[0].x + line[0].w;
  for (let index = 1; index < line.length; index++) {
    const item = line[index];
    if (item.x <= endX + gapTol) {
      current.push(item);
      endX = Math.max(endX, item.x + item.w);
    } else {
      clusters.push(current);
      current = [item];
      endX = item.x + item.w;
    }
  }
  clusters.push(current);
  return clusters;
}

function inferAlign(x: number, w: number, pageWidth: number): BlockAlign {
  const left = x;
  const right = pageWidth - (x + w);
  if (w >= pageWidth * 0.58) return 'left';
  if (left > pageWidth * 0.16 && Math.abs(left - right) < Math.max(14, w * 0.35)) return 'center';
  if (right < Math.min(24, left * 0.4) && left > right * 2) return 'right';
  return 'left';
}

function isListMarker(text: string) {
  return /^\s*(?:[•●▪◦\-–]|[0-9]{1,2}[.)])\s+/.test(text);
}

function isAllCapsTitle(text: string) {
  const letters = text.replace(/[^\p{L}]/gu, '');
  if (letters.length < 8 || text.length > 80) return false;
  return letters === letters.toLocaleUpperCase() && /[\p{Lu}]{4,}/u.test(letters);
}

function inferKind(text: string, fontSize: number, medianSize: number, tableCell: boolean): BlockKind {
  if (tableCell) return 'table-cell';
  if (isListMarker(text)) return 'list';
  if (isAllCapsTitle(text) || (fontSize >= medianSize * 1.28 && text.length < 140)) return 'heading';
  if (fontSize <= medianSize * 0.86 && text.length < 90) return 'caption';
  return 'paragraph';
}

function lineBox(line: RawItem[], pageWidth: number, tableCell = false): LayoutBlock {
  const x = Math.min(...line.map((item) => item.x));
  const y = Math.min(...line.map((item) => item.y - item.h * 0.2));
  const right = Math.max(...line.map((item) => item.x + item.w));
  const top = Math.max(...line.map((item) => item.y + item.h * 0.8));
  const fontSize = median(line.map((item) => item.fontSize)) || 10;
  const text = line.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
  return {
    pageIndex: 0,
    x,
    y,
    w: Math.max(8, right - x),
    h: Math.max(fontSize * 0.9, top - y),
    fontSize,
    text,
    rtl: line.some((item) => item.rtl),
    fontName: line[0]?.fontName,
    rotation: line[0]?.rotation || 0,
    align: inferAlign(x, Math.max(8, right - x), pageWidth),
    kind: tableCell ? 'table-cell' : 'paragraph'
  };
}

function canWrapInto(prev: LayoutBlock, line: LayoutBlock) {
  if (prev.kind === 'table-cell' || line.kind === 'table-cell') return false;
  if (prev.kind === 'heading' || line.kind === 'heading' || prev.kind === 'caption') return false;
  if (isListMarker(line.text)) return false;
  if (Math.abs(prev.fontSize - line.fontSize) > Math.max(0.75, prev.fontSize * 0.12)) return false;
  if (Math.abs(prev.x - line.x) >= Math.max(8, prev.fontSize * 1.1)) return false;
  if (line.w > prev.w * 1.15) return false;
  const gap = prev.y - (line.y + line.h);
  return gap >= -2 && gap <= prev.fontSize * 0.62;
}

export function mergeParagraphs(lines: LayoutBlock[]): LayoutBlock[] {
  if (!lines.length) return [];
  const blocks: LayoutBlock[] = [];
  for (const line of lines) {
    const prev = blocks[blocks.length - 1];
    if (prev && canWrapInto(prev, line)) {
      const x = Math.min(prev.x, line.x);
      const y = Math.min(prev.y, line.y);
      const right = Math.max(prev.x + prev.w, line.x + line.w);
      const top = Math.max(prev.y + prev.h, line.y + line.h);
      prev.x = x;
      prev.y = y;
      prev.w = right - x;
      prev.h = top - y;
      prev.text = `${prev.text} ${line.text}`.replace(/\s+/g, ' ').trim();
      prev.fontSize = Math.max(prev.fontSize, line.fontSize);
      prev.rtl = prev.rtl || line.rtl;
    } else {
      blocks.push({ ...line });
    }
  }
  return blocks;
}

function classifyPageBlocks(blocks: LayoutBlock[], pageWidth: number): LayoutBlock[] {
  const sizes = blocks.map((block) => block.fontSize);
  const medianSize = median(sizes) || 10;
  return blocks.map((block) => ({
    ...block,
    align: block.align || inferAlign(block.x, block.w, pageWidth),
    kind: inferKind(block.text, block.fontSize, medianSize, block.kind === 'table-cell')
  }));
}

export async function extractPdfLayout(pdfBytes: Uint8Array, password = ''): Promise<{
  pageCount: number;
  blocks: LayoutBlock[];
  pages: LayoutPage[];
}> {
  const loadingTask = openPdf(pdfBytes, password);
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const blocks: LayoutBlock[] = [];
  const pages: LayoutPage[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      try {
        const viewport = page.getViewport({ scale: 1 });
        pages.push({ width: viewport.width, height: viewport.height });
        const content = await page.getTextContent();
        const raw: RawItem[] = [];
        for (const rawItem of content.items as Array<{
          str?: string;
          width?: number;
          height?: number;
          transform?: number[];
          dir?: string;
          fontName?: string;
        }>) {
          if (typeof rawItem.str !== 'string' || !rawItem.str.trim() || !Array.isArray(rawItem.transform)) continue;
          if (isRotated(rawItem.transform)) continue;
          const fontSize = Math.hypot(rawItem.transform[0], rawItem.transform[1]) || (rawItem.height ?? 10);
          raw.push({
            str: rawItem.str.replace(/\s+/g, ' ').trim(),
            x: rawItem.transform[4],
            y: rawItem.transform[5],
            w: rawItem.width ?? fontSize,
            h: rawItem.height ?? fontSize,
            fontSize,
            rtl: rawItem.dir === 'rtl',
            fontName: rawItem.fontName,
            rotation: itemRotation(rawItem.transform)
          });
        }
        const lineBlocks: LayoutBlock[] = [];
        for (const line of groupLines(raw)) {
          const clusters = splitLineClusters(line);
          const tableRow = clusters.length >= 2;
          for (const cluster of clusters) {
            const box = lineBox(cluster, viewport.width, tableRow);
            if (box.text) lineBlocks.push(box);
          }
        }
        const pageBlocks = classifyPageBlocks(
          mergeParagraphs(classifyPageBlocks(lineBlocks, viewport.width)),
          viewport.width
        );
        for (const block of pageBlocks) {
          blocks.push({ ...block, pageIndex: pageNumber - 1 });
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
  return { pageCount, blocks, pages };
}

export async function extractPdfRows(pdfBytes: Uint8Array, password = ''): Promise<string[][]> {
  const loadingTask = openPdf(pdfBytes, password);
  const pdf = await loadingTask.promise;
  const rows: string[][] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const pageRows = clusterItems(content.items as Array<{ str?: string; transform?: number[]; width?: number; height?: number }>);
        if (pageNumber > 1 && pageRows.length) {
          rows.push([]);
        }
        rows.push(...pageRows);
      } finally {
        page.cleanup();
      }
    }
  } finally {
    try {
      await (pdf as { destroy?: () => unknown }).destroy?.();
    } catch {
      /* pdf.js versions differ on destroy() */
    }
  }
  return rows.filter((row) => row.some((cell) => cell.trim()));
}

export async function extractPdfText(pdfBytes: Uint8Array, password = ''): Promise<string> {
  const rows = await extractPdfRows(pdfBytes, password);
  return rows.map((row) => row.join(' ')).join('\n').trim();
}
