import fs from 'fs/promises';
import { PDFDocument } from '@cantoo/pdf-lib';
import { mapPdfError } from '../utils/pdf.js';
import { writeTemp } from '../utils/temp.js';

export async function protectPdf(filePath: string, password: string): Promise<{
  filepath: string;
  filename: string;
  downloadUrl: string;
}> {
  try {
    const bytes = await fs.readFile(filePath);
    const pdf = await PDFDocument.load(bytes);
    pdf.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false
      }
    });
    const encrypted = await pdf.save();
    return writeTemp(encrypted, 'protected', 'pdf');
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible de protéger ce PDF.'));
  }
}
