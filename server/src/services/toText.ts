import fs from 'node:fs/promises';
import { mapPdfError } from '../utils/pdf.js';
import { extractPdfText } from '../utils/pdfText.js';
import { writeTemp } from '../utils/temp.js';

export async function pdfToText(filePath: string, password = '') {
  try {
    const bytes = await fs.readFile(filePath);
    const text = await extractPdfText(bytes, password);
    if (!text) {
      throw new Error('Aucun texte extractible dans ce PDF. Essayez l’OCR pour un document scanné.');
    }
    return writeTemp(Buffer.from(`${text}\n`, 'utf8'), 'texte', 'txt');
  } catch (error) {
    throw new Error(mapPdfError(error, error instanceof Error ? error.message : 'Impossible d’extraire le texte.'));
  }
}
