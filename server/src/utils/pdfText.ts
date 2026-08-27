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

export async function extractPdfRows(pdfBytes: Uint8Array, password = ''): Promise<string[][]> {
  const data = pdfBytes instanceof Uint8Array && !Buffer.isBuffer(pdfBytes)
    ? pdfBytes
    : Uint8Array.from(pdfBytes);
  const loadingTask = getDocument({
    data,
    password,
    cMapUrl: `${path.join(pdfjsRoot, 'cmaps')}/`,
    cMapPacked: true,
    standardFontDataUrl: `${path.join(pdfjsRoot, 'standard_fonts')}/`,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true
  } as never);
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
