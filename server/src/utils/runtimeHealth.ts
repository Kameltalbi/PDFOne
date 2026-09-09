import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import { tempDir } from './temp.js';
import { sharedJobBudget } from './resourceBudget.js';
import {
  pingPdfToDocxEngine
} from '../services/pdfToDocx.js';
import {
  pdfToExcelV2Enabled,
  pingPdfToExcelEngine
} from '../services/pdfToExcel.js';
import {
  pdfToImageV2Enabled,
  pingPdfToImageEngine
} from '../services/pdfToImage.js';

const execFileAsync = promisify(execFile);

export type DiskStats = {
  /** Absolute path — keep server-side only; never expose on public /health. */
  path: string;
  freeBytes: number | null;
  totalBytes: number | null;
};

function envBytes(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function minFreeTempBytes(): number {
  return envBytes('MIN_FREE_TEMP_BYTES', 512 * 1024 * 1024);
}

export async function diskStatsFor(dirPath: string): Promise<DiskStats> {
  try {
    const stats = await fs.statfs(dirPath);
    return {
      path: dirPath,
      freeBytes: Number(stats.bfree) * Number(stats.bsize),
      totalBytes: Number(stats.blocks) * Number(stats.bsize)
    };
  } catch {
    return { path: dirPath, freeBytes: null, totalBytes: null };
  }
}

export async function assertTempSpace(neededBytes = 0): Promise<void> {
  await fs.mkdir(tempDir, { recursive: true });
  const stats = await diskStatsFor(tempDir);
  if (stats.freeBytes == null) return;
  const required = Math.max(neededBytes, minFreeTempBytes());
  if (stats.freeBytes < required) {
    const error = new Error(
      'Espace disque temporaire insuffisant. Réessayez plus tard ou avec un fichier plus petit.'
    );
    (error as Error & { code?: string }).code = 'TEMP_DISK_FULL';
    throw error;
  }
}

async function firstExisting(paths: Array<string | undefined>): Promise<string | null> {
  for (const candidate of paths) {
    if (!candidate) continue;
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      /* next */
    }
  }
  return null;
}

export async function converterAvailability() {
  const libreoffice = await firstExisting([
    process.env.LIBREOFFICE_PATH,
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/usr/bin/soffice',
    '/usr/bin/libreoffice',
    '/usr/local/bin/soffice',
    '/opt/homebrew/bin/soffice'
  ]);
  const tesseract = await firstExisting([
    process.env.TESSERACT_PATH,
    '/opt/homebrew/bin/tesseract',
    '/usr/local/bin/tesseract',
    '/usr/bin/tesseract'
  ]);
  const pdfToDocxPythonPath = await firstExisting([
    process.env.PDF2DOCX_PYTHON_PATH,
    '/opt/homebrew/bin/python3',
    '/usr/local/bin/python3',
    '/usr/bin/python3',
    '/Library/Developer/CommandLineTools/usr/bin/python3'
  ]);
  return {
    libreoffice: Boolean(libreoffice),
    tesseract: Boolean(tesseract),
    pdfToDocx: Boolean(pdfToDocxPythonPath),
    libreofficePath: libreoffice,
    tesseractPath: tesseract,
    pdfToDocxPythonPath
  };
}

export async function pingConverters() {
  const available = await converterAvailability();
  let libreofficeOk = false;
  let tesseractOk = false;
  let pdfToDocxOk = false;
  let pdfToExcelOk: boolean | null = null;
  let pdfToImageOk: boolean | null = null;
  if (available.libreofficePath) {
    try {
      await execFileAsync(available.libreofficePath, ['--version'], { timeout: 8000 });
      libreofficeOk = true;
    } catch {
      libreofficeOk = false;
    }
  }
  if (available.tesseractPath) {
    try {
      await execFileAsync(available.tesseractPath, ['--version'], { timeout: 5000 });
      tesseractOk = true;
    } catch {
      tesseractOk = false;
    }
  }
  if (available.pdfToDocxPythonPath) {
    pdfToDocxOk = await pingPdfToDocxEngine();
  }
  if (pdfToExcelV2Enabled()) {
    pdfToExcelOk = await pingPdfToExcelEngine();
  }
  if (pdfToImageV2Enabled()) {
    pdfToImageOk = await pingPdfToImageEngine();
  }
  return {
    libreoffice: available.libreoffice,
    tesseract: available.tesseract,
    pdfToDocx: available.pdfToDocx,
    libreofficeOk,
    tesseractOk,
    pdfToDocxOk,
    pdfToExcelEngine: pdfToExcelV2Enabled() ? 'v2' : 'v1',
    pdfToExcelOk,
    pdfToImageEngine: pdfToImageV2Enabled() ? 'v2' : 'v1',
    pdfToImageOk
  };
}

let eventLoopLagMs = 0;
let lagTimer: ReturnType<typeof setInterval> | null = null;

export function startEventLoopMonitor(intervalMs = 2000) {
  if (lagTimer) return;
  let expected = Date.now() + intervalMs;
  lagTimer = setInterval(() => {
    const now = Date.now();
    eventLoopLagMs = Math.max(0, now - expected);
    expected = now + intervalMs;
  }, intervalMs);
  lagTimer.unref?.();
}

export function getEventLoopLagMs() {
  return eventLoopLagMs;
}

export async function runtimeHealthSnapshot() {
  const mem = process.memoryUsage();
  const disk = await diskStatsFor(tempDir);
  const converters = await converterAvailability();
  return {
    uptimeSec: Math.round(process.uptime()),
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      free: os.freemem()
    },
    jobBudget: sharedJobBudget.stats(),
    eventLoopLagMs: getEventLoopLagMs(),
    tempDisk: {
      freeBytes: disk.freeBytes,
      totalBytes: disk.totalBytes,
      minFreeBytes: minFreeTempBytes()
    },
    converters: {
      libreoffice: converters.libreoffice,
      tesseract: converters.tesseract,
      pdfToDocx: converters.pdfToDocx,
      pdfToExcelEngine: pdfToExcelV2Enabled() ? 'v2' : 'v1',
      pdfToImageEngine: pdfToImageV2Enabled() ? 'v2' : 'v1'
    }
  };
}
