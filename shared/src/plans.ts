/** Commercial plan limits — single source for server and client. Do not put Stripe prices here. */

export const FREE_MAX_FILE_BYTES = 20 * 1024 * 1024;
export const PAID_MAX_FILE_BYTES = 100 * 1024 * 1024;
export const TECHNICAL_MAX_FILE_BYTES = 1024 * 1024 * 1024;

export const AI_SCHEMA_VERSION = 2;

export type PaidPlanId = 'week' | 'month' | 'year';
export type PlanId = 'free' | PaidPlanId;
export type AiTool = 'translate' | 'summarize';
export type AiPeriod = 'calendar-month' | 'pass-lifetime';

export type PlanLimits = {
  id: PlanId;
  dailyJobs: number | null;
  maxFileBytes: number;
  aiCredits: number;
  aiPeriod: AiPeriod;
  ads: boolean;
  ocr: boolean;
};

/** Per-tool multipliers. Change later without touching entitlement storage. */
export const AI_TOOL_WEIGHTS: Record<AiTool, number> = {
  translate: 1,
  summarize: 1
};

/** Engine caps used both for billing and for refusing oversized jobs. */
export const AI_BILLABLE_PAGE_CAP: Record<AiTool, number> = {
  translate: 100,
  summarize: 20
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    id: 'free',
    dailyJobs: 5,
    maxFileBytes: FREE_MAX_FILE_BYTES,
    aiCredits: 5,
    aiPeriod: 'calendar-month',
    ads: true,
    ocr: false
  },
  week: {
    id: 'week',
    dailyJobs: null,
    maxFileBytes: PAID_MAX_FILE_BYTES,
    aiCredits: 100,
    aiPeriod: 'pass-lifetime',
    ads: false,
    ocr: true
  },
  month: {
    id: 'month',
    dailyJobs: null,
    maxFileBytes: PAID_MAX_FILE_BYTES,
    aiCredits: 500,
    aiPeriod: 'calendar-month',
    ads: false,
    ocr: true
  },
  year: {
    id: 'year',
    dailyJobs: null,
    maxFileBytes: PAID_MAX_FILE_BYTES,
    aiCredits: 500,
    aiPeriod: 'calendar-month',
    ads: false,
    ocr: true
  }
};

/** Catalog ids for standard PDF tools (OCR / summarize / translate excluded). */
export const STANDARD_TOOL_IDS = [
  'edit',
  'fillSign',
  'compress',
  'merge',
  'pdfToWord',
  'wordToPdf',
  'pdfToJpg',
  'jpgToPdf',
  'pdfToExcel',
  'protect',
  'split',
  'rotate',
  'sign',
  'deletePages',
  'reorderPages',
  'pngToPdf',
  'pdfToPng',
  'unlock',
  'crop',
  'watermark',
  'pageNumbers',
  'excelToPdf',
  'pdfToPpt',
  'pptToPdf',
  'pdfToText',
  'imagesToPdf',
  'htmlToPdf',
  'extractPages',
  'extractImages',
  'flatten',
  'headerFooter',
  'fillForm',
  'heicToPdf'
] as const;

export type StandardToolId = (typeof STANDARD_TOOL_IDS)[number];

export function calendarMonthKey(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export function limitsForPlan(plan: string | null | undefined): PlanLimits {
  if (plan === 'week') return PLAN_LIMITS.week;
  if (plan === 'year') return PLAN_LIMITS.year;
  if (plan === 'month' || plan === 'business' || plan === 'life') return PLAN_LIMITS.month;
  return PLAN_LIMITS.free;
}

export function billedPages(tool: AiTool, pageCount: number): number {
  const pages = Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0;
  const cap = AI_BILLABLE_PAGE_CAP[tool];
  return Math.min(Math.max(1, pages || 1), cap);
}

export function aiCreditCost(tool: AiTool, pageCount: number, weights = AI_TOOL_WEIGHTS): number {
  const weight = weights[tool] ?? 1;
  return billedPages(tool, pageCount) * weight;
}

export function formatFileSizeLabel(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${Math.round(mb / 1024)} GB`;
  if (mb >= 1) return `${Math.round(mb)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function publicPlanSnapshot() {
  return {
    free: PLAN_LIMITS.free,
    week: PLAN_LIMITS.week,
    month: PLAN_LIMITS.month,
    year: PLAN_LIMITS.year,
    aiWeights: { ...AI_TOOL_WEIGHTS },
    aiPageCaps: { ...AI_BILLABLE_PAGE_CAP },
    standardToolIds: [...STANDARD_TOOL_IDS]
  };
}
