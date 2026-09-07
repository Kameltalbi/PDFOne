import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '../..');
export const fixturesDir = path.join(repoRoot, 'capacity/fixtures');

export function fixturePath(name: string): string {
  const full = path.join(fixturesDir, name);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing fixture ${name}. Run: node capacity/generate-fixtures.mjs`);
  }
  return full;
}

/** Small synthetic PDF for free-plan flows. */
export const SMALL_PDF = () => fixturePath('text-2pages.pdf');

/** Above free 20 MB limit — used for Pro / rejection checks. */
export const LARGE_PDF = () => fixturePath('pdf-25mb.pdf');

export const WORD_DOC = () => fixturePath('document.docx');
export const SHEET_CSV = () => fixturePath('sheet.csv');
export const IMAGE_JPG = () => fixturePath('image.jpg');
export const SCAN_PDF = () => fixturePath('scan-2pages.pdf');
export const FORM_PDF = () => fixturePath('form.pdf');
export const PROTECTED_PDF = () => fixturePath('protected.pdf');
export const PROTECTED_PASSWORD = 'synthetic-test-only';
