import { GlobalFonts } from '@napi-rs/canvas';

let regular = 'sans-serif';
let bold = 'sans-serif';
let ready = false;

const REGULAR_CANDIDATES = [
  process.env.TRANSLATE_FONT_PATH?.trim(),
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  '/System/Library/Fonts/Supplemental/Arial.ttf',
  '/Library/Fonts/Arial Unicode.ttf'
].filter((value): value is string => Boolean(value));

const BOLD_CANDIDATES = [
  process.env.TRANSLATE_FONT_BOLD_PATH?.trim(),
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'
].filter((value): value is string => Boolean(value));

function register(candidates: string[], family: string) {
  for (const candidate of candidates) {
    try {
      GlobalFonts.registerFromPath(candidate, family);
      return family;
    } catch {
      /* next */
    }
  }
  return 'sans-serif';
}

function ensureFonts() {
  if (ready) return;
  ready = true;
  regular = register(REGULAR_CANDIDATES, 'One2Translate');
  bold = register(BOLD_CANDIDATES, 'One2TranslateBold');
}

export function resolveCanvasFont(weight: 'regular' | 'bold' = 'regular'): string {
  ensureFonts();
  return weight === 'bold' ? bold : regular;
}

export function needsRtl(lang: string, blockRtl?: boolean) {
  return lang === 'ar' || Boolean(blockRtl);
}
