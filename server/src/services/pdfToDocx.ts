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
  durationMs?: number;
  quality?: Record<string, unknown>;
};

const here = path.dirname(fileURLToPath(import.meta.url));
export const conversionEngineRoot = path.resolve(
  here,
  '../../../conversion-engine'
);

export function pdfToDocxPython(): string {
  return process.env.PDF2DOCX_PYTHON_PATH?.trim() || 'python3';
}

function engineTimeoutMs(): number {
  const parsed = Number.parseInt(process.env.PDF2DOCX_RUN_TIMEOUT_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300_000;
}

function engineError(response: EngineResponse | null): Error {
  const error = new Error(
    response?.message || 'La conversion PDF vers Word a échoué.'
  );
  (error as Error & { code?: string }).code = response?.code || 'PDF2DOCX_FAILED';
  return error;
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

export async function pingPdfToDocxEngine(): Promise<boolean> {
  try {
    const { response } = await runEngine(['--check'], 8_000);
    return response?.ok === true;
  } catch {
    return false;
  }
}

function runEngine(
  args: string[],
  timeout: number,
  signal?: AbortSignal
): Promise<{ response: EngineResponse | null; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      pdfToDocxPython(),
      ['-m', 'conversion_engine.cli', ...args],
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
            console.info('PDF2DOCX engine:', line);
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
        resolve({ response, stderr });
      }
    );
    child.stdin?.end();
  });
}

export async function convertPdfToDocx(
  filePath: string,
  signal?: AbortSignal
) {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfone-docx-node-'));
  const output = path.join(workDir, 'document.docx');
  const report = path.join(workDir, 'quality.json');
  try {
    const { response } = await runEngine(
      ['--input', path.resolve(filePath), '--output', output, '--report', report],
      engineTimeoutMs(),
      signal
    );
    if (!response?.ok) throw engineError(response);
    const [bytes, quality] = await Promise.all([
      fs.readFile(output),
      fs.readFile(report, 'utf8').catch(() => '')
    ]);
    console.info('PDF2DOCX completed:', JSON.stringify({
      conversionId: response.conversionId,
      durationMs: response.durationMs,
      quality: quality ? JSON.parse(quality) : response.quality
    }));
    return writeTemp(bytes, 'pdf-to-word', 'docx');
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
