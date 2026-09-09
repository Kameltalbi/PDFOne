import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTemp } from '../utils/temp.js';

type EngineResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  extension?: 'jpg' | 'zip' | 'directory';
  conversionId?: string;
  diagnostics?: Record<string, unknown>;
};

const here = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = path.resolve(here, '../../../conversion-engine');

function pythonPath(): string {
  return process.env.PDF_TO_IMAGE_PYTHON_PATH?.trim()
    || process.env.PDF2DOCX_PYTHON_PATH?.trim()
    || 'python3';
}

function positiveEnv(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function renderDpi(): number {
  const explicit = Number.parseInt(process.env.PDF_TO_IMAGE_DPI || '', 10);
  if (Number.isFinite(explicit) && explicit >= 72) {
    return Math.min(300, explicit);
  }
  const level = process.env.PDF_TO_IMAGE_QUALITY_LEVEL?.trim().toLowerCase();
  return level === 'very-high' ? 300 : level === 'high' ? 200 : 150;
}

function parseResponse(stdout: string): EngineResponse | null {
  const line = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (!line) return null;
  try {
    return JSON.parse(line) as EngineResponse;
  } catch {
    return null;
  }
}

function engineError(response: EngineResponse | null): Error {
  const error = new Error(
    response?.message || 'Impossible de convertir ce PDF en JPG.'
  );
  (error as Error & { code?: string }).code = response?.code || 'PDF_TO_IMAGE_FAILED';
  return error;
}

function runEngine(
  args: string[],
  timeout: number,
  signal?: AbortSignal
): Promise<EngineResponse> {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath(),
      ['-m', 'conversion_engine.pdf_to_image.cli', ...args],
      {
        cwd: engineRoot,
        timeout,
        signal,
        maxBuffer: 8 * 1024 * 1024,
        env: {
          ...process.env,
          PYTHONPATH: [
            path.join(engineRoot, 'src'),
            process.env.PYTHONPATH
          ].filter(Boolean).join(path.delimiter)
        }
      },
      (error, stdout, stderr) => {
        const response = parseResponse(stdout);
        if (stderr.trim()) {
          for (const line of stderr.trim().split(/\r?\n/)) {
            console.info('PDF_TO_IMAGE engine:', line);
          }
        }
        if (error) {
          if (/timed out|ETIMEDOUT/i.test(error.message)) {
            const timeoutError = new Error(
              'La conversion a pris trop de temps. Réessayez avec un fichier plus simple.'
            );
            (timeoutError as Error & { code?: string }).code = 'JOB_TIMEOUT';
            reject(timeoutError);
            return;
          }
          if (signal?.aborted) {
            const abortError = new Error('La requête a été annulée.');
            (abortError as Error & { code?: string }).code = 'REQUEST_ABORTED';
            reject(abortError);
            return;
          }
          reject(engineError(response));
          return;
        }
        if (!response?.ok) {
          reject(engineError(response));
          return;
        }
        resolve(response);
      }
    );
  });
}

export function pdfToImageV2Enabled(): boolean {
  return process.env.PDF_TO_IMAGE_ENGINE?.trim().toLowerCase() === 'v2';
}

export async function pingPdfToImageEngine(): Promise<boolean> {
  try {
    return (await runEngine(['--check'], 8_000)).ok === true;
  } catch {
    return false;
  }
}

export type PdfiumPageOptions = {
  dpi?: number;
  maxPages?: number;
  maxPixels?: number;
  maxDimension?: number;
  pageLimit?: number;
  password?: string;
};

export async function forEachPdfiumPage(
  filePath: string,
  onPage: (page: { index: number; total: number; image: Buffer }) => Promise<void> | void,
  options: PdfiumPageOptions = {},
  signal?: AbortSignal
): Promise<number> {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-ocr-render-'));
  const outputDirectory = path.join(workDir, 'pages');
  try {
    const args = [
        '--input', path.resolve(filePath),
        '--output-directory', outputDirectory,
        '--dpi', String(options.dpi || positiveEnv('OCR_RENDER_DPI', 200)),
        '--max-pages', String(options.maxPages || positiveEnv('PDF_TO_IMAGE_MAX_PAGES', 200)),
        '--max-pixels', String(options.maxPixels || positiveEnv('RASTER_MAX_PIXELS', 12_000_000)),
        '--max-dimension', String(options.maxDimension || positiveEnv('PDF_TO_IMAGE_MAX_DIMENSION', 10_000))
      ];
    if (options.pageLimit && options.pageLimit > 0) {
      args.push('--page-limit', String(options.pageLimit));
    }
    if (options.password) {
      args.push('--password', options.password);
    }
    const response = await runEngine(
      args,
      positiveEnv('PDF_TO_IMAGE_RUN_TIMEOUT_MS', 300_000),
      signal
    );
    if (response.extension !== 'directory') {
      throw engineError(response);
    }
    const names = (await fs.readdir(outputDirectory))
      .filter((name) => /^page-\d+\.png$/i.test(name))
      .sort();
    if (!names.length) {
      throw new Error('Aucune page PDF rendue pour l’OCR.');
    }
    for (const [index, name] of names.entries()) {
      if (signal?.aborted) {
        const error = new Error('La requête a été annulée.');
        (error as Error & { code?: string }).code = 'REQUEST_ABORTED';
        throw error;
      }
      const pagePath = path.join(outputDirectory, name);
      try {
        await onPage({
          index,
          total: names.length,
          image: await fs.readFile(pagePath)
        });
      } finally {
        // Drop each page file after use so multi-page jobs do not keep every PNG on disk.
        await fs.unlink(pagePath).catch(() => undefined);
      }
    }
    return names.length;
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function convertPdfToJpegV2(
  filePath: string,
  jpegQuality: number,
  signal?: AbortSignal
) {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-image-node-'));
  const output = path.join(workDir, 'rendered-output');
  try {
    const response = await runEngine(
      [
        '--input', path.resolve(filePath),
        '--output', output,
        '--dpi', String(renderDpi()),
        '--quality', String(jpegQuality),
        '--max-pages', String(positiveEnv('PDF_TO_IMAGE_MAX_PAGES', 200)),
        '--max-pixels', String(positiveEnv('RASTER_MAX_PIXELS', 12_000_000)),
        '--max-dimension', String(positiveEnv('PDF_TO_IMAGE_MAX_DIMENSION', 10_000))
      ],
      positiveEnv('PDF_TO_IMAGE_RUN_TIMEOUT_MS', 300_000),
      signal
    );
    if (!response.extension) {
      throw engineError(response);
    }
    const bytes = await fs.readFile(output);
    console.info('PDF_TO_IMAGE completed:', JSON.stringify({
      engine: 'v2',
      conversionId: response.conversionId,
      diagnostics: response.diagnostics
    }));
    const extension = response.extension === 'zip' ? 'zip' : 'jpg';
    return writeTemp(
      bytes,
      extension === 'zip' ? 'pages' : 'page',
      extension
    );
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
