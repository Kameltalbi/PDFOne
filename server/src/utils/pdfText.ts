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

export type LayoutBlock = {
  pageIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  text: string;
  rtl?: boolean;
};

type RawItem = {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  rtl: boolean;
};

function openPdf(pdfBytes: Uint8Array, password = '') {
  const data = pdfBytes instanceof Uint8Array && !Buffer.isBuffer(pdfBytes)
    ? pdfBytes
    : Uint8Array.from(pdfBytes);
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

function lineBox(line: RawItem[]): LayoutBlock {
  const x = Math.min(...line.map((item) => item.x));
  const y = Math.min(...line.map((item) => item.y - item.h * 0.2));
  const right = Math.max(...line.map((item) => item.x + item.w));
  const top = Math.max(...line.map((item) => item.y + item.h * 0.8));
  const fontSize = median(line.map((item) => item.fontSize)) || 10;
  return {
    pageIndex: 0,
    x,
    y,
    w: Math.max(8, right - x),
    h: Math.max(fontSize * 0.9, top - y),
    fontSize,
    text: line.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim(),
    rtl: line.some((item) => item.rtl)
  };
}

function mergeParagraphs(lines: LayoutBlock[]): LayoutBlock[] {
  if (!lines.length) return [];
  const blocks: LayoutBlock[] = [];
  for (const line of lines) {
    const prev = blocks[blocks.length - 1];
    const gap = prev ? prev.y - (line.y + line.h) : 999;
    const sameColumn = prev
      ? Math.abs(prev.x - line.x) < Math.max(10, prev.fontSize * 1.2)
        && Math.abs(prev.w - line.w) < Math.max(prev.w, line.w) * 0.55
      : false;
    if (prev && sameColumn && gap >= -2 && gap <= prev.fontSize * 1.35) {
      const x = Math.min(prev.x, line.x);
      const y = Math.min(prev.y, line.y);
      const right = Math.max(prev.x + prev.w, line.x + line.w);
      const top = Math.max(prev.y + prev.h, line.y + line.h);
      prev.x = x;
      prev.y = y;
      prev.w = right - x;
      prev.h = top - y;
      prev.text = `${prev.text} ${line.text}`.replace(/\s+/g, ' ').trim();
      prev.fontSize = Math.min(prev.fontSize, line.fontSize);
      prev.rtl = prev.rtl || line.rtl;
    } else {
      blocks.push({ ...line });
    }
  }
  return blocks;
}

export async function extractPdfLayout(pdfBytes: Uint8Array, password = ''): Promise<{
  pageCount: number;
  blocks: LayoutBlock[];
}> {
  const loadingTask = openPdf(pdfBytes, password);
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const blocks: LayoutBlock[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const raw: RawItem[] = [];
        for (const rawItem of content.items as Array<{
          str?: string;
          width?: number;
          height?: number;
          transform?: number[];
          dir?: string;
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
            rtl: rawItem.dir === 'rtl'
          });
        }
        const pageBlocks = mergeParagraphs(groupLines(raw).map(lineBox));
        for (const block of pageBlocks) {
          if (!block.text) continue;
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
  return { pageCount, blocks };
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
