import { createCanvas } from '@napi-rs/canvas';
import type { LayoutBlock } from '../../utils/pdfText.js';
import { needsRtl, resolveCanvasFont } from './fontResolver.js';
import type { FittedBlock } from './types.js';

function wrapLines(
  ctx: { measureText: (text: string) => { width: number } },
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
      continue;
    }
    let rest = word;
    while (rest.length) {
      let cut = rest.length;
      while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > maxWidth) cut -= 1;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    current = '';
  }
  if (current) lines.push(current);
  return lines;
}

export function fitBlock(block: LayoutBlock, translation: string, lang: string, maxExtra: number): Pick<FittedBlock, 'fittedSize' | 'extraHeight' | 'warning'> {
  const font = resolveCanvasFont(
    block.kind === 'heading' || (block.kind === 'list' && block.fontSize >= 13) ? 'bold' : 'regular'
  );
  const canvas = createCanvas(8, 8);
  const ctx = canvas.getContext('2d');
  const original = Math.max(6.4, block.fontSize);
  const tight = block.h <= original * 1.7
    || block.kind === 'table-cell'
    || block.kind === 'caption'
    || block.kind === 'heading';
  const minSize = Math.max(tight ? 6.4 : 7, original * (tight ? 0.72 : 0.76));
  const maxWidth = Math.max(8, block.w - 2);
  const rtl = needsRtl(lang, block.rtl);
  ctx.direction = rtl ? 'rtl' : 'ltr';

  const trySize = (size: number, height: number) => {
    ctx.font = `${size}px ${font}`;
    if (tight) {
      return {
        lines: [translation],
        lineHeight: size,
        fits: ctx.measureText(translation).width <= maxWidth && size <= height + 0.8
      };
    }
    const lines = wrapLines(ctx, translation, maxWidth);
    const lineHeight = size * (lines.length === 1 ? 1.08 : 1.18);
    return { lines, lineHeight, fits: lines.length * lineHeight <= height };
  };

  let size = original;
  let extra = 0;
  for (let candidate = original; candidate >= minSize - 0.05; candidate -= 0.25) {
    if (trySize(candidate, block.h).fits) {
      return { fittedSize: candidate, extraHeight: 0 };
    }
  }
  size = minSize;
  if (tight) {
    ctx.font = `${minSize}px ${font}`;
    const measured = ctx.measureText(translation).width;
    const fitted = measured <= maxWidth
      ? minSize
      : Math.max(5.8, minSize * (maxWidth / Math.max(1, measured)));
    return {
      fittedSize: fitted,
      extraHeight: 0,
      warning: fitted < 6.2
        ? `Block ${block.pageIndex}:${Math.round(block.x)},${Math.round(block.y)} could not fit without clipping.`
        : undefined
    };
  }

  const needed = trySize(size, 10_000);
  const required = needed.lines.length * needed.lineHeight + 3;
  extra = Math.min(maxExtra, Math.max(0, required - block.h));
  if (trySize(size, block.h + extra).fits) {
    return { fittedSize: size, extraHeight: extra };
  }
  return {
    fittedSize: size,
    extraHeight: extra,
    warning: `Block ${block.pageIndex}:${Math.round(block.x)},${Math.round(block.y)} could not fit without clipping.`
  };
}

export function renderBlockPng(
  text: string,
  widthPt: number,
  heightPt: number,
  fontSize: number,
  lang: string,
  rtlHint?: boolean,
  align: 'left' | 'center' | 'right' = 'left',
  style?: { fill?: string; color?: string; bold?: boolean }
): Buffer {
  const font = resolveCanvasFont(style?.bold ? 'bold' : 'regular');
  const scale = 2;
  const width = Math.max(8, Math.round(widthPt * scale));
  const height = Math.max(8, Math.round(heightPt * scale));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = style?.fill || '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = style?.color || '#111827';
  ctx.textBaseline = 'top';
  const rtl = needsRtl(lang, rtlHint);
  ctx.direction = rtl ? 'rtl' : 'ltr';
  let drawSize = fontSize * scale;
  ctx.font = `${drawSize}px ${font}`;
  const maxWidth = Math.max(4, width - 4);
  const lines = wrapLines(ctx, text, maxWidth);
  if (lines.length === 1) {
    const measured = ctx.measureText(lines[0]).width;
    if (measured > maxWidth && measured > 0) {
      drawSize = Math.max(6.4 * scale, drawSize * (maxWidth / measured));
      ctx.font = `${drawSize}px ${font}`;
    }
  }
  const lineHeight = lines.length === 1
    ? Math.min(drawSize * 1.05, height)
    : drawSize * 1.18;
  const total = lines.length * lineHeight;
  const startY = Math.max(0, (height - total) / 2);
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    if (y + lineHeight * 0.55 > height) return;
    let x = 3;
    ctx.textAlign = 'left';
    if (rtl || align === 'right') {
      ctx.textAlign = 'right';
      x = width - 3;
    } else if (align === 'center') {
      ctx.textAlign = 'center';
      x = width / 2;
    }
    ctx.fillText(line, x, y, maxWidth);
  });
  return canvas.toBuffer('image/png');
}

export function boxesOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
