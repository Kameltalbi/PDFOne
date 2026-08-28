export const FREE_MAX_FILE_BYTES = 50 * 1024 * 1024;
export const PAID_MAX_FILE_BYTES = 1024 * 1024 * 1024;

export function maxFileBytes(paid: boolean): number {
  return paid ? PAID_MAX_FILE_BYTES : FREE_MAX_FILE_BYTES;
}

export function maxFileLabel(paid: boolean): string {
  return paid ? '1 GB' : '50 MB';
}
