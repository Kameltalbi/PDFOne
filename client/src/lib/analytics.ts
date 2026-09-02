export const GA_MEASUREMENT_ID = 'G-YY8GVH11J4';

/** Destinations are configured in index.html via gtag('config', GA_MEASUREMENT_ID). */

export type ToolName =
  | 'merge_pdf'
  | 'pdf_to_word'
  | 'word_to_pdf'
  | 'pdf_to_excel'
  | 'excel_to_pdf'
  | 'pdf_to_ppt'
  | 'ppt_to_pdf'
  | 'compress_pdf'
  | 'protect_pdf'
  | 'pdf_to_jpg'
  | 'pdf_to_png'
  | 'pdf_to_text'
  | 'unlock_pdf'
  | 'ocr_pdf'
  | 'summarize_pdf'
  | 'translate_pdf'
  | 'html_to_pdf'
  | 'jpg_to_pdf'
  | 'png_to_pdf'
  | 'heic_to_pdf'
  | 'split_pdf'
  | 'delete_pages'
  | 'reorder_pages'
  | 'rotate_pdf'
  | 'watermark_pdf'
  | 'page_numbers'
  | 'crop_pdf'
  | 'sign_pdf'
  | 'extract_pages'
  | 'extract_images'
  | 'flatten_pdf'
  | 'header_footer'
  | 'fill_form'
  | 'edit_pdf';

export type CheckoutPlanId = 'week' | 'month' | 'year';

export type AnalyticsParams = {
  tool_name?: ToolName;
  file_type?: string;
  processing_time_ms?: number;
  plan?: string;
  billing_period?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  page_path?: string;
  page_location?: string;
};

const ALLOWED_KEYS = new Set<keyof AnalyticsParams>([
  'tool_name',
  'file_type',
  'processing_time_ms',
  'plan',
  'billing_period',
  'value',
  'currency',
  'transaction_id',
  'page_path',
  'page_location'
]);

const TOOL_BY_PATH: Record<string, ToolName> = {
  '/merge': 'merge_pdf',
  '/pdf-to-word': 'pdf_to_word',
  '/word-to-pdf': 'word_to_pdf',
  '/pdf-to-excel': 'pdf_to_excel',
  '/excel-to-pdf': 'excel_to_pdf',
  '/pdf-to-ppt': 'pdf_to_ppt',
  '/pdf-to-pptx': 'pdf_to_ppt',
  '/ppt-to-pdf': 'ppt_to_pdf',
  '/pptx-to-pdf': 'ppt_to_pdf',
  '/compress': 'compress_pdf',
  '/protect': 'protect_pdf',
  '/to-jpg': 'pdf_to_jpg',
  '/to-png': 'pdf_to_png',
  '/pdf-to-text': 'pdf_to_text',
  '/unlock': 'unlock_pdf',
  '/ocr': 'ocr_pdf',
  '/summarize': 'summarize_pdf',
  '/translate': 'translate_pdf',
  '/html-to-pdf': 'html_to_pdf',
  '/jpg-to-pdf': 'jpg_to_pdf',
  '/png-to-pdf': 'png_to_pdf',
  '/heic-to-pdf': 'heic_to_pdf',
  '/split': 'split_pdf',
  '/delete-pages': 'delete_pages',
  '/reorder': 'reorder_pages',
  '/rotate': 'rotate_pdf',
  '/watermark': 'watermark_pdf',
  '/page-numbers': 'page_numbers',
  '/crop': 'crop_pdf',
  '/sign': 'sign_pdf',
  '/extract-pages': 'extract_pages',
  '/extract-images': 'extract_images',
  '/flatten': 'flatten_pdf',
  '/header-footer': 'header_footer',
  '/fill-form': 'fill_form',
  '/edit-pdf': 'edit_pdf',
  '/edit-pdf/result': 'edit_pdf'
};

const CHECKOUT_META: Record<CheckoutPlanId, { plan: string; billing_period: string }> = {
  week: { plan: 'weekly', billing_period: 'one_time' },
  month: { plan: 'pro_monthly', billing_period: 'monthly' },
  year: { plan: 'pro_annual', billing_period: 'annual' }
};

const PURCHASE_PLAN: Record<string, string> = {
  week: 'weekly',
  month: 'pro_monthly',
  year: 'pro_annual'
};

const FILE_TYPE_ALIAS: Record<string, string> = {
  jpeg: 'jpg',
  jpe: 'jpg',
  htm: 'html',
  tif: 'tiff'
};

let lastToolOpen: ToolName | null = null;
let lastPricingViewPath: string | null = null;
const seenPurchases = new Set<string>();

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function toolNameFromPath(pathname: string): ToolName | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  return TOOL_BY_PATH[path] ?? null;
}

export function currentToolName(): ToolName | null {
  if (!isBrowser()) return null;
  return toolNameFromPath(window.location.pathname);
}

export function fileTypeOf(file: File): string | undefined {
  const fromName = file.name.toLowerCase();
  const dot = fromName.lastIndexOf('.');
  let ext = dot >= 0 ? fromName.slice(dot + 1) : '';
  if (!ext && file.type.includes('/')) {
    ext = file.type.slice(file.type.indexOf('/') + 1).split('+')[0] || '';
  }
  const type = FILE_TYPE_ALIAS[ext] || ext;
  if (!type || type.length > 8 || !/^[a-z0-9]+$/.test(type)) return undefined;
  return type;
}

function sanitize(params?: AnalyticsParams): Record<string, string | number> {
  if (!params) return {};
  const clean: Record<string, string | number> = {};
  for (const key of ALLOWED_KEYS) {
    const value = params[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      clean[key] = value;
    } else if (typeof value === 'string' && value && value.length <= 128) {
      clean[key] = value;
    }
  }
  return clean;
}

export function trackEvent(eventName: string, parameters?: AnalyticsParams, onDone?: () => void): void {
  if (!isBrowser()) {
    onDone?.();
    return;
  }
  if (!/^[a-z][a-z0-9_]{0,39}$/.test(eventName)) {
    onDone?.();
    return;
  }
  try {
    const payload: Record<string, unknown> = sanitize(parameters);
    if (onDone) {
      if (!window.gtag) {
        onDone();
        return;
      }
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        onDone();
      };
      payload.event_callback = finish;
      payload.event_timeout = 400;
      window.gtag?.('event', eventName, payload);
      window.setTimeout(finish, 500);
      return;
    }
    window.gtag?.('event', eventName, payload);
  } catch {
    onDone?.();
  }
}

export function trackPageView(pathname: string, search = ''): void {
  if (!isBrowser() || pathname.startsWith('/internal')) return;
  const pagePath = `${pathname}${search}`;
  trackEvent('page_view', {
    page_path: pagePath,
    page_location: window.location.href
  });
}

export function trackToolOpen(pathname: string): void {
  const tool = toolNameFromPath(pathname);
  if (!tool) {
    lastToolOpen = null;
    return;
  }
  if (lastToolOpen === tool) return;
  lastToolOpen = tool;
  trackEvent('tool_open', { tool_name: tool });
}

export function trackFileUpload(file?: File, toolName = currentToolName()): void {
  if (!toolName) return;
  const params: AnalyticsParams = { tool_name: toolName };
  if (file) {
    const type = fileTypeOf(file);
    if (type) params.file_type = type;
  }
  trackEvent('file_upload', params);
}

export function trackProcessingSuccess(startedAt?: number, toolName = currentToolName()): void {
  if (!toolName) return;
  const params: AnalyticsParams = { tool_name: toolName };
  if (typeof startedAt === 'number' && startedAt > 0) {
    params.processing_time_ms = Math.max(0, Date.now() - startedAt);
  }
  trackEvent('processing_success', params);
}

export function trackFileDownload(toolName = currentToolName()): void {
  if (!toolName) return;
  trackEvent('file_download', { tool_name: toolName });
}

export function trackPricingView(pathname: string): void {
  if (pathname !== '/pricing') {
    lastPricingViewPath = pathname;
    return;
  }
  if (lastPricingViewPath === '/pricing') return;
  lastPricingViewPath = '/pricing';
  trackEvent('pricing_view');
}

export function trackCheckoutStarted(
  plan: CheckoutPlanId,
  amountCents: number,
  currency = 'USD',
  onDone?: () => void
): void {
  const meta = CHECKOUT_META[plan];
  if (!meta) {
    onDone?.();
    return;
  }
  trackEvent('checkout_started', {
    plan: meta.plan,
    billing_period: meta.billing_period,
    value: Math.max(0, amountCents) / 100,
    currency: currency.toUpperCase()
  }, onDone);
}

function purchaseStorageKey(transactionId: string): string {
  return `one2pdf_ga4_purchase:${transactionId}`;
}

function alreadyTrackedPurchase(transactionId: string): boolean {
  if (seenPurchases.has(transactionId)) return true;
  if (!isBrowser()) return false;
  try {
    return window.sessionStorage.getItem(purchaseStorageKey(transactionId)) === '1'
      || window.localStorage.getItem(purchaseStorageKey(transactionId)) === '1';
  } catch {
    return false;
  }
}

function rememberPurchase(transactionId: string): void {
  seenPurchases.add(transactionId);
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(purchaseStorageKey(transactionId), '1');
    window.localStorage.setItem(purchaseStorageKey(transactionId), '1');
  } catch {
    /* private mode */
  }
}

export function trackPurchase(input: {
  transactionId: string;
  value: number;
  currency: string;
  plan: string;
}): void {
  const transactionId = input.transactionId.trim();
  if (!transactionId || transactionId.length > 128) return;
  if (alreadyTrackedPurchase(transactionId)) return;
  rememberPurchase(transactionId);
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: Math.max(0, input.value),
    currency: (input.currency || 'USD').toUpperCase(),
    plan: PURCHASE_PLAN[input.plan] || input.plan
  });
}
