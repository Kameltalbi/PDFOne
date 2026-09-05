export const FREE_MAX_FILE_BYTES = 20 * 1024 * 1024;
export const PAID_MAX_FILE_BYTES = 1024 * 1024 * 1024;

/** Absolute technical ceiling (configurable). Defaults to the paid plan cap. */
export function absoluteMaxFileBytes(): number {
  const configured = Number.parseInt(process.env.MAX_FILE_SIZE || '', 10);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(configured, PAID_MAX_FILE_BYTES);
  }
  return PAID_MAX_FILE_BYTES;
}

export function maxFileBytes(paid: boolean): number {
  const abs = absoluteMaxFileBytes();
  return paid ? abs : Math.min(FREE_MAX_FILE_BYTES, abs);
}

/** Cumulative upload budget for a single multipart request. */
export function maxRequestBytes(paid: boolean, maxFiles: number): number {
  const perFile = maxFileBytes(paid);
  const files = Math.max(1, maxFiles);
  return Math.min(perFile * files, paid ? absoluteMaxFileBytes() * 2 : FREE_MAX_FILE_BYTES * 3);
}

export function maxFilesPerRequest(): number {
  const configured = Number.parseInt(process.env.MAX_FILES || '', 10);
  return Number.isFinite(configured) && configured > 0 ? configured : 20;
}
