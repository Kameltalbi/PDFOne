import { execFile, type ExecFileOptions } from 'node:child_process';

export type ExecFileResult = { stdout: string; stderr: string };

/**
 * Run a child process that is killed when `signal` aborts (queue timeout or client disconnect).
 * Prefer this over promisify(execFile) for LibreOffice, Tesseract, qpdf, etc.
 */
export function execFileAbortable(
  file: string,
  args: readonly string[],
  options: ExecFileOptions & { signal?: AbortSignal } = {}
): Promise<ExecFileResult> {
  const { signal, killSignal = 'SIGKILL', ...rest } = options;
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const error = new Error('La requête a été annulée.');
      (error as Error & { code?: string }).code = 'REQUEST_ABORTED';
      reject(error);
      return;
    }
    const child = execFile(
      file,
      [...args],
      { ...rest, signal, killSignal },
      (error, stdout, stderr) => {
        if (error) {
          if (signal?.aborted) {
            const abortErr = new Error('La requête a été annulée.');
            (abortErr as Error & { code?: string }).code = 'REQUEST_ABORTED';
            reject(abortErr);
            return;
          }
          if (/timed out|ETIMEDOUT/i.test(error.message)) {
            const timeoutErr = new Error(
              'Le traitement a pris trop de temps et a été interrompu.'
            );
            (timeoutErr as Error & { code?: string }).code = 'JOB_TIMEOUT';
            reject(timeoutErr);
            return;
          }
          reject(error);
          return;
        }
        resolve({
          stdout: typeof stdout === 'string' ? stdout : stdout.toString('utf8'),
          stderr: typeof stderr === 'string' ? stderr : stderr.toString('utf8')
        });
      }
    );
    child.stdin?.end();
  });
}
