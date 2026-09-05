import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { extractPdfRows } from '../utils/pdfText.js';
import { writeTemp } from '../utils/temp.js';
import { rowsToXlsx } from '../utils/xlsx.js';
import { officeQueue } from '../utils/jobQueue.js';

const execFileAsync = promisify(execFile);

export const OFFICE_JOBS = {
  'pdf-to-word': { in: ['.pdf'], out: 'docx', filter: 'MS Word 2007 XML', inFilter: 'writer_pdf_import' },
  'word-to-pdf': { in: ['.doc', '.docx', '.odt', '.rtf'], out: 'pdf', filter: 'writer_pdf_Export' },
  'pdf-to-excel': { in: ['.pdf'], out: 'xlsx' },
  'excel-to-pdf': { in: ['.xls', '.xlsx', '.ods', '.csv'], out: 'pdf', filter: 'calc_pdf_Export' },
  'pdf-to-ppt': { in: ['.pdf'], out: 'pptx', filter: 'Impress MS PowerPoint 2007 XML', inFilter: 'impress_pdf_import' },
  'ppt-to-pdf': { in: ['.ppt', '.pptx', '.odp'], out: 'pdf', filter: 'impress_pdf_Export' },
  'html-to-pdf': { in: ['.html', '.htm'], out: 'pdf', filter: 'writer_pdf_Export' }
} as const;

export type OfficeJob = keyof typeof OFFICE_JOBS;

const CANDIDATES = [
  process.env.LIBREOFFICE_PATH,
  '/Applications/LibreOffice.app/Contents/MacOS/soffice',
  '/usr/bin/soffice',
  '/usr/bin/libreoffice',
  '/usr/local/bin/soffice',
  '/opt/homebrew/bin/soffice'
].filter((value): value is string => Boolean(value));

let cachedBinary: string | null = null;

async function resolveSoffice(): Promise<string> {
  if (cachedBinary) return cachedBinary;
  for (const candidate of CANDIDATES) {
    try {
      await fs.access(candidate);
      cachedBinary = candidate;
      return candidate;
    } catch {
      /* try next */
    }
  }
  throw new Error('LibreOffice n’est pas installé sur le serveur. Installez-le pour convertir les fichiers Office.');
}

async function rmTree(dir: string) {
  await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
}

async function findOutput(outDir: string, ext: string): Promise<string | null> {
  const files = await fs.readdir(outDir);
  const match = files.find((name) => name.toLowerCase().endsWith(`.${ext}`));
  return match ? path.join(outDir, match) : null;
}

function attemptsFor(job: OfficeJob): Array<{ target: string; inFilter?: string }> {
  const spec = OFFICE_JOBS[job];
  const convertTo = 'filter' in spec && spec.filter ? `${spec.out}:${spec.filter}` : spec.out;
  const inFilter = 'inFilter' in spec ? spec.inFilter : undefined;
  if (job === 'pdf-to-ppt') {
    return [
      { target: 'pptx', inFilter: 'impress_pdf_import' },
      { target: convertTo }
    ];
  }
  return [
    { target: convertTo, inFilter },
    { target: spec.out, inFilter },
    { target: convertTo },
    { target: spec.out }
  ].filter((attempt, index, list) => (
    Boolean(attempt.target)
    && list.findIndex((item) => item.target === attempt.target && item.inFilter === attempt.inFilter) === index
  ));
}

async function pdfToExcel(filePath: string) {
  const pdfBytes = await fs.readFile(filePath);
  const rows = await extractPdfRows(pdfBytes);
  const xlsx = await rowsToXlsx(rows.length ? rows : [[
    'Aucun texte extractible dans ce PDF. Les pages scannées nécessitent un OCR.'
  ]]);
  return writeTemp(xlsx, 'pdf-to-excel', 'xlsx');
}

export async function convertOfficeFile(filePath: string, job: OfficeJob) {
  const spec = OFFICE_JOBS[job];
  const ext = path.extname(filePath).toLowerCase();
  if (!(spec.in as readonly string[]).includes(ext)) {
    throw new Error('Ce type de fichier n’est pas accepté pour cette conversion.');
  }

  if (job === 'pdf-to-excel') {
    return officeQueue.run(() => pdfToExcel(filePath));
  }

  return officeQueue.run(async () => {
    const soffice = await resolveSoffice();
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-lo-out-'));
    const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-lo-profile-'));
    try {
      let produced: string | null = null;
      let lastError: unknown;
      for (const attempt of attemptsFor(job)) {
        const existing = await fs.readdir(outDir);
        await Promise.all(existing.map((name) => fs.unlink(path.join(outDir, name)).catch(() => undefined)));
        const args = [
          '--headless',
          '--nologo',
          '--norestore',
          '--nolockcheck',
          '--nodefault',
          '--nofirststartwizard',
          `-env:UserInstallation=${pathToFileURL(profile).href}`
        ];
        if (attempt.inFilter) args.push(`--infilter=${attempt.inFilter}`);
        args.push('--convert-to', attempt.target, '--outdir', outDir, filePath);
        try {
          await execFileAsync(soffice, args, {
            timeout: 180000,
            maxBuffer: 8 * 1024 * 1024,
            env: { ...process.env, SAL_USE_VCLPLUGIN: 'svp' }
          });
        } catch (error) {
          lastError = error;
        }
        produced = await findOutput(outDir, spec.out);
        if (produced) break;
      }

      if (!produced) {
        const message = lastError instanceof Error ? lastError.message : String(lastError ?? '');
        if (/timeout|ETIMEDOUT/i.test(message)) {
          throw new Error('La conversion a pris trop de temps. Réessayez avec un fichier plus simple.');
        }
        throw new Error('LibreOffice n’a pas produit de fichier converti.');
      }

      const bytes = await fs.readFile(produced);
      return writeTemp(bytes, job, spec.out);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('LibreOffice n’est pas installé')
        || error.message.includes('n’a pas produit')
        || error.message.includes('pris trop de temps')
        || (error as Error & { code?: string }).code === 'SERVER_BUSY'
      )) {
        throw error;
      }
      throw new Error('Impossible de convertir ce fichier avec LibreOffice.');
    } finally {
      await rmTree(outDir);
      await rmTree(profile);
    }
  });
}
