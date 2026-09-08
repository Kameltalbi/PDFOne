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
  conversionId?: string;
  diagnostics?: Record<string, unknown>;
};

const here = path.dirname(fileURLToPath(import.meta.url));
const conversionEngineRoot = path.resolve(here, '../../../conversion-engine');

function pythonPath(): string {
  return process.env.PDF2EXCEL_PYTHON_PATH?.trim()
    || process.env.PDF2DOCX_PYTHON_PATH?.trim()
    || 'python3';
}

function timeoutMs(): number {
  const parsed = Number.parseInt(process.env.PDF2EXCEL_RUN_TIMEOUT_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300_000;
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

function publicError(response: EngineResponse | null): Error {
  const error = new Error(
    response?.message || 'La conversion PDF vers Excel a échoué.'
  );
  (error as Error & { code?: string }).code = response?.code || 'PDF2EXCEL_FAILED';
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
      ['-m', 'conversion_engine.pdf_to_excel.cli', ...args],
      {
        cwd: conversionEngineRoot,
        timeout,
        signal,
        maxBuffer: 8 * 1024 * 1024,
        env: {
          ...process.env,
          PYTHONPATH: [
            path.join(conversionEngineRoot, 'src'),
            process.env.PYTHONPATH
          ].filter(Boolean).join(path.delimiter)
        }
      },
      (error, stdout, stderr) => {
        const response = parseResponse(stdout);
        if (stderr.trim()) {
          for (const line of stderr.trim().split(/\r?\n/)) {
            console.info('PDF2EXCEL engine:', line);
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
          reject(publicError(response));
          return;
        }
        if (!response?.ok) {
          reject(publicError(response));
          return;
        }
        resolve(response);
      }
    );
  });
}

export function pdfToExcelV2Enabled(): boolean {
  return process.env.PDF_TO_EXCEL_ENGINE?.trim().toLowerCase() === 'v2';
}

export async function pingPdfToExcelEngine(): Promise<boolean> {
  try {
    const response = await runEngine(['--check'], 8_000);
    return response.ok === true;
  } catch {
    return false;
  }
}

export async function convertPdfToExcelV2(
  filePath: string,
  signal?: AbortSignal
) {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-excel-node-'));
  const output = path.join(workDir, 'workbook.xlsx');
  const report = path.join(workDir, 'quality.json');
  try {
    const response = await runEngine(
      ['--input', path.resolve(filePath), '--output', output, '--report', report],
      timeoutMs(),
      signal
    );
    const [bytes, quality] = await Promise.all([
      fs.readFile(output),
      fs.readFile(report, 'utf8').catch(() => '')
    ]);
    console.info('PDF2EXCEL completed:', JSON.stringify({
      engine: 'v2',
      conversionId: response.conversionId,
      diagnostics: quality ? JSON.parse(quality) : response.diagnostics
    }));
    return writeTemp(bytes, 'pdf-to-excel', 'xlsx');
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
