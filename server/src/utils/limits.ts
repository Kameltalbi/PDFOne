import {
  FREE_MAX_FILE_BYTES,
  PAID_MAX_FILE_BYTES,
  TECHNICAL_MAX_FILE_BYTES,
  limitsForPlan
} from '@mini-pdf-tools/shared';

export { FREE_MAX_FILE_BYTES, PAID_MAX_FILE_BYTES };

/** Absolute technical ceiling (configurable). Never above 1 GB. */
export function absoluteMaxFileBytes(): number {
  const configured = Number.parseInt(process.env.MAX_FILE_SIZE || '', 10);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(configured, TECHNICAL_MAX_FILE_BYTES);
  }
  return Math.min(PAID_MAX_FILE_BYTES, TECHNICAL_MAX_FILE_BYTES);
}

export function maxFileBytes(paid: boolean, plan?: string | null): number {
  const abs = absoluteMaxFileBytes();
  const commercial = paid ? limitsForPlan(plan || 'month').maxFileBytes : FREE_MAX_FILE_BYTES;
  return Math.min(commercial, abs);
}

/** Cumulative upload budget for a single multipart request. */
export function maxRequestBytes(paid: boolean, maxFiles: number, plan?: string | null): number {
  const perFile = maxFileBytes(paid, plan);
  const files = Math.max(1, maxFiles);
  return Math.min(perFile * files, paid ? absoluteMaxFileBytes() * 2 : FREE_MAX_FILE_BYTES * 3);
}

export function maxFilesPerRequest(): number {
  const configured = Number.parseInt(process.env.MAX_FILES || '', 10);
  return Number.isFinite(configured) && configured > 0 ? configured : 20;
}
