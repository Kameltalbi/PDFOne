import type { LayoutBlock } from '../../utils/pdfText.js';

export function digitalTextScore(blocks: LayoutBlock[], pageCount: number) {
  const chars = blocks.reduce((sum, block) => sum + block.text.replace(/\s/g, '').length, 0);
  return chars / Math.max(1, pageCount);
}

export function shouldUseOcr(blocks: LayoutBlock[], pageCount: number) {
  return digitalTextScore(blocks, pageCount) < 45;
}

export function documentTitle(blocks: LayoutBlock[]): string | undefined {
  const firstPage = blocks.filter((block) => block.pageIndex === 0);
  const heading = firstPage.find((block) => block.kind === 'heading' && block.text.trim().length > 3);
  if (heading) return heading.text.trim().slice(0, 180);
  const first = firstPage.find((block) => block.text.trim().length > 8);
  return first?.text.trim().slice(0, 180);
}
