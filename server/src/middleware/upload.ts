import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { isPaid } from './quota.js';
import { FREE_MAX_FILE_BYTES, PAID_MAX_FILE_BYTES } from '../utils/limits.js';
import { cleanupUploads } from '../utils/temp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../../temp');
await fs.mkdir(tempDir, { recursive: true });

const PDF_MIME = new Set(['application/pdf']);
const IMAGE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const absMax = Math.max(
  PAID_MAX_FILE_BYTES,
  Number.parseInt(process.env.MAX_FILE_SIZE || '0', 10) || 0
);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

function extensionOf(file: Express.Multer.File): string {
  return path.extname(file.originalname || '').toLowerCase();
}

export async function rejectOversizedFreeUploads(req: Request, res: Response, next: NextFunction) {
  const files = [
    ...(req.file ? [req.file] : []),
    ...((Array.isArray(req.files) ? req.files : []) as Express.Multer.File[])
  ];
  if (files.length === 0) return next();

  const paid = await isPaid(req, res);
  const max = paid ? PAID_MAX_FILE_BYTES : FREE_MAX_FILE_BYTES;
  if (!files.some((file) => file.size > max)) return next();

  await cleanupUploads(files);
  return res.status(400).json({
    success: false,
    error: paid
      ? 'Le fichier dépasse la limite technique de 1 Go.'
      : 'Le plan gratuit est limité à 50 Mo. Passez Pro pour les fichiers plus volumineux.'
  });
}

function afterLimit(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, (err?: unknown) => {
      if (err) return next(err);
      void rejectOversizedFreeUploads(req, res, next);
    });
  };
}

function createUploader(kind: 'pdf' | 'image') {
  const instance = multer({
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
      cb(new Error('Seules les images JPG, PNG ou WebP sont acceptées.'));
    },
    limits: {
      fileSize: absMax,
      files: parseInt(process.env.MAX_FILES || '10', 10)
    }
  });

  return {
    single: (field: string) => afterLimit(instance.single(field)),
    array: (field: string, maxCount?: number) => afterLimit(instance.array(field, maxCount))
  };
}

export const upload = createUploader('pdf');
export const uploadImages = createUploader('image');

export function uploadExtensions(extensions: string[], message: string) {
  const allowed = new Set(extensions.map((value) => value.toLowerCase()));
  const instance = multer({
    storage,
    fileFilter: (_req, file, cb) => {
      if (allowed.has(extensionOf(file))) {
        cb(null, true);
        return;
      }
      cb(new Error(message));
    },
    limits: {
      fileSize: absMax,
      files: 1
    }
  });
  return {
    single: (field: string) => afterLimit(instance.single(field)),
    array: (field: string, maxCount?: number) => afterLimit(instance.array(field, maxCount))
  };
}
