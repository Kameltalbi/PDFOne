import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { isPaid } from './quota.js';
import {
  absoluteMaxFileBytes,
  maxFileBytes,
  maxFilesPerRequest,
  maxRequestBytes
} from '../utils/limits.js';
import { cleanupUploads, retainTemp } from '../utils/temp.js';
import { assertTempSpace } from '../utils/runtimeHealth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../../temp');
await fs.mkdir(tempDir, { recursive: true });

const PDF_MIME = new Set(['application/pdf']);
const IMAGE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

function extensionOf(file: Express.Multer.File): string {
  return path.extname(file.originalname || '').toLowerCase();
}

function collectedFiles(req: Request): Express.Multer.File[] {
  return [
    ...(req.file ? [req.file] : []),
    ...((Array.isArray(req.files) ? req.files : []) as Express.Multer.File[])
  ];
}

async function rejectOversized(req: Request, res: Response, next: NextFunction) {
  const files = collectedFiles(req);
  if (files.length === 0) return next();

  const paid = await isPaid(req, res);
  const max = maxFileBytes(paid);
  const totalBudget = maxRequestBytes(paid, maxFilesPerRequest());
  const total = files.reduce((sum, file) => sum + (file.size || 0), 0);

  if (files.some((file) => file.size > max) || total > totalBudget) {
    await cleanupUploads(files);
    return res.status(400).json({
      success: false,
      error: paid
        ? 'Le fichier ou le lot dépasse la limite technique autorisée.'
        : 'Le plan gratuit est limité à 20 Mo par fichier. Passez Pro pour les fichiers plus volumineux.'
    });
  }

  for (const file of files) retainTemp(file.path);
  return next();
}

function withPaidLimits(
  build: (limits: { fileSize: number; files: number }) => RequestHandler
): RequestHandler {
  return (req, res, next) => {
    void (async () => {
      try {
        await assertTempSpace();
        const paid = await isPaid(req, res);
        const fileSize = maxFileBytes(paid);
        const files = maxFilesPerRequest();
        const handler = build({ fileSize, files });
        handler(req, res, (err?: unknown) => {
          if (err) {
            void cleanupUploads(collectedFiles(req));
            return next(err);
          }
          void rejectOversized(req, res, next);
        });
      } catch (error) {
        if (error instanceof Error && (error as Error & { code?: string }).code === 'TEMP_DISK_FULL') {
          return res.status(503).json({ success: false, code: 'TEMP_DISK_FULL', error: error.message });
        }
        return next(error);
      }
    })();
  };
}

function createUploader(kind: 'pdf' | 'image') {
  const make = (limits: { fileSize: number; files: number }) =>
    multer({
      storage,
      fileFilter: (_req, file, cb) => {
        if (kind === 'pdf') {
          if (PDF_MIME.has(file.mimetype) || extensionOf(file) === '.pdf') {
            cb(null, true);
            return;
          }
          cb(new Error('Seuls les fichiers PDF sont acceptés.'));
          return;
        }
        if (IMAGE_MIME.has(file.mimetype) || IMAGE_EXT.has(extensionOf(file))) {
          cb(null, true);
          return;
        }
        cb(new Error('Seules les images JPG, PNG, WebP ou HEIC sont acceptées.'));
      },
      limits: {
        fileSize: Math.min(limits.fileSize, absoluteMaxFileBytes()),
        files: limits.files
      }
    });

  return {
    single: (field: string) => withPaidLimits((limits) => make(limits).single(field)),
    array: (field: string, maxCount?: number) =>
      withPaidLimits((limits) => make(limits).array(field, maxCount ?? limits.files))
  };
}

export const upload = createUploader('pdf');
export const uploadImages = createUploader('image');

export function uploadExtensions(extensions: string[], message: string) {
  const allowed = new Set(extensions.map((value) => value.toLowerCase()));
  const make = (limits: { fileSize: number; files: number }) =>
    multer({
      storage,
      fileFilter: (_req, file, cb) => {
        if (allowed.has(extensionOf(file))) {
          cb(null, true);
          return;
        }
        cb(new Error(message));
      },
      limits: {
        fileSize: Math.min(limits.fileSize, absoluteMaxFileBytes()),
        files: 1
      }
    });

  return {
    single: (field: string) => withPaidLimits((limits) => make(limits).single(field)),
    array: (field: string, maxCount?: number) =>
      withPaidLimits((limits) => make(limits).array(field, maxCount ?? 1))
  };
}

