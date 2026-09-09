export type SummaryMode = 'quick' | 'detailed' | 'key_points';
export type SummaryLanguage = 'same' | 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ar';

const SUMMARY_MODES = new Set<SummaryMode>(['quick', 'detailed', 'key_points']);
const SUMMARY_LANGUAGES = new Set<SummaryLanguage>(['same', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ar']);

export function parseSummaryMode(raw: unknown): SummaryMode | null {
  const value = String(raw ?? '').toLowerCase().trim();
  // Legacy UI values
  if (value === 'short') return 'quick';
  if (value === 'medium' || value === 'long') return 'detailed';
  if (SUMMARY_MODES.has(value as SummaryMode)) return value as SummaryMode;
  return null;
}

export function parseSummaryLanguage(raw: unknown): SummaryLanguage | null {
  const value = String(raw ?? 'same').toLowerCase().trim();
  if (value === 'auto' || value === 'same_as_document' || value === '') return 'same';
  if (SUMMARY_LANGUAGES.has(value as SummaryLanguage)) return value as SummaryLanguage;
  return null;
}
