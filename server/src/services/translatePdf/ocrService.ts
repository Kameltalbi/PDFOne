import { mergeParagraphs, type LayoutBlock } from '../../utils/pdfText.js';
import { ocrLayoutBlocks } from '../ocr.js';

export async function extractOcrBlocks(filePath: string, locale: string): Promise<LayoutBlock[]> {
  const raw = await ocrLayoutBlocks(filePath, locale);
  const byPage = new Map<number, LayoutBlock[]>();
  for (const block of raw) {
    const list = byPage.get(block.pageIndex) || [];
    list.push(block);
    byPage.set(block.pageIndex, list);
  }
  const merged: LayoutBlock[] = [];
  for (const [, pageBlocks] of [...byPage.entries()].sort((a, b) => a[0] - b[0])) {
    const sorted = [...pageBlocks].sort((a, b) => b.y - a.y || a.x - b.x);
    merged.push(...mergeParagraphs(sorted));
  }
  return merged;
}
