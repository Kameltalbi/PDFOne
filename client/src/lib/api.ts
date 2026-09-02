import { dictionaries } from '../i18n/dictionaries';
import { getRuntimeLocale } from '../i18n/runtime';
import { trackProcessingSuccess } from './analytics';

export type ToolResult = {
  downloadUrl: string;
  filename: string;
  originalSize?: number;
  compressedSize?: number;
  textDownloadUrl?: string;
  textFilename?: string;
};

export async function postFormData<T>(url: string, formData: FormData): Promise<T> {
  const locale = getRuntimeLocale();
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: { 'Accept-Language': locale }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || dictionaries[locale].common.processingFailed);
  }
  return payload.data as T;
}

export async function postForm(url: string, formData: FormData): Promise<ToolResult> {
  const startedAt = Date.now();
  const result = await postFormData<ToolResult>(url, formData);
  trackProcessingSuccess(startedAt);
  return result;
}

export function formatFileSize(bytes: number): string {
  const { units } = dictionaries[getRuntimeLocale()];
  if (!bytes) return `0 ${units.byte}`;
  const labels = [units.byte, units.kb, units.mb, units.gb];
  const index = Math.min(labels.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${labels[index]}`;
}
