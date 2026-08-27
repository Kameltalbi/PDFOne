import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../../temp');
await fs.mkdir(tempDir, { recursive: true });

const PDF_MIME = new Set(['application/pdf']);
const IMAGE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

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

function createUploader(kind: 'pdf' | 'image') {
  return multer({
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
      fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10),
      files: parseInt(process.env.MAX_FILES || '10', 10)
    }
  });
}

export const upload = createUploader('pdf');
export const uploadImages = createUploader('image');

export function uploadExtensions(extensions: string[], message: string) {
  const allowed = new Set(extensions.map((value) => value.toLowerCase()));
  return multer({
    storage,
    fileFilter: (_req, file, cb) => {
      if (allowed.has(extensionOf(file))) {
        cb(null, true);
        return;
      }
      cb(new Error(message));
    },
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10),
      files: 1
    }
  });
}
