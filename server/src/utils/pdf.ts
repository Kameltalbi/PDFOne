import { PDFDocument } from 'pdf-lib';

export function mapPdfError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/encrypted/i.test(message) || /password/i.test(message)) {
    return 'Ce PDF est protégé par un mot de passe. Déverrouillez-le avant de continuer.';
  }
  if (/invalid|fail.*parse|not a pdf|must be a/i.test(message)) {
    return 'Le fichier PDF est invalide ou corrompu.';
  }
  return fallback;
}

export async function loadPdf(bytes: Buffer | Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes);
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible de lire ce PDF.'));
  }
}

export function parsePageSelection(raw: unknown, pageCount: number): number[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('Sélectionnez au moins une page.');
  }

  const pages = [...new Set(
    raw
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= pageCount)
  )].sort((a, b) => a - b);

  if (pages.length === 0) {
    throw new Error('Aucune page valide n’a été sélectionnée.');
  }

  return pages;
}

export function pagesToKeep(rawDelete: unknown, pageCount: number): number[] {
  const toDelete = parsePageSelection(rawDelete, pageCount);
  if (toDelete.length >= pageCount) {
    throw new Error('Il doit rester au moins une page dans le document.');
  }
  return Array.from({ length: pageCount }, (_, index) => index + 1).filter((page) => !toDelete.includes(page));
}

export function parsePageOrder(raw: unknown, pageCount: number): number[] {
  if (!Array.isArray(raw) || raw.length !== pageCount) {
    throw new Error('L’ordre des pages est invalide.');
  }

  const pages = raw.map((value) => Number(value));
  const unique = new Set(pages);
  if (
    unique.size !== pageCount
    || pages.some((page) => !Number.isInteger(page) || page < 1 || page > pageCount)
  ) {
    throw new Error('L’ordre des pages est invalide.');
  }

  return pages;
}

export function parseRotations(raw: unknown, pageCount: number): number[] {
  const values = Array.isArray(raw) ? raw.map((value) => Number(value)) : [];
  if (values.length !== pageCount || values.some((value) => !Number.isInteger(value))) {
    throw new Error('Les rotations demandées sont invalides.');
  }
  return values.map((value) => ((value % 360) + 360) % 360);
}
