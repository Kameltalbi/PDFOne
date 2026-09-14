import {
  FREE_MAX_FILE_BYTES,
  PAID_MAX_FILE_BYTES,
  formatFileSizeLabel,
  limitsForPlan
} from '@mini-pdf-tools/shared';

export { FREE_MAX_FILE_BYTES, PAID_MAX_FILE_BYTES };

export function maxFileBytes(paid: boolean, plan?: string | null): number {
  return paid ? limitsForPlan(plan || 'month').maxFileBytes : FREE_MAX_FILE_BYTES;
}

export function maxFileLabel(paid: boolean, plan?: string | null): string {
  return formatFileSizeLabel(maxFileBytes(paid, plan));
}

export function isFreeOversized(size: number, paid: boolean): boolean {
  return !paid && size > FREE_MAX_FILE_BYTES;
}
