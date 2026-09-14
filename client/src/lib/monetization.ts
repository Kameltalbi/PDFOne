/** Client mirror of server monetization flags (from /api/billing/me). */

export type MonetizationFlags = {
  growthMode: boolean;
  standardToolsFree: boolean;
  ocrRequiresPro: boolean;
  translateRequiresPro: boolean;
  aiSummaryRequiresPro: boolean;
  freeBatchAllowed: boolean;
};

export const DEFAULT_MONETIZATION: MonetizationFlags = {
  growthMode: true,
  standardToolsFree: true,
  ocrRequiresPro: true,
  translateRequiresPro: false,
  aiSummaryRequiresPro: false,
  freeBatchAllowed: true
};

export function parseMonetization(raw: unknown): MonetizationFlags {
  if (!raw || typeof raw !== 'object') return DEFAULT_MONETIZATION;
  const value = raw as Record<string, unknown>;
  const flag = (key: keyof MonetizationFlags, fallback: boolean) =>
    typeof value[key] === 'boolean' ? (value[key] as boolean) : fallback;
  return {
    growthMode: flag('growthMode', DEFAULT_MONETIZATION.growthMode),
    standardToolsFree: flag('standardToolsFree', true),
    ocrRequiresPro: flag('ocrRequiresPro', true),
    translateRequiresPro: flag('translateRequiresPro', false),
    aiSummaryRequiresPro: flag('aiSummaryRequiresPro', false),
    freeBatchAllowed: flag('freeBatchAllowed', true)
  };
}

export type PremiumFeature = 'ocr' | 'translate' | 'summarize';

export function featureRequiresPro(flags: MonetizationFlags, feature: PremiumFeature): boolean {
  if (feature === 'ocr') return flags.ocrRequiresPro;
  if (feature === 'translate') return flags.translateRequiresPro;
  return flags.aiSummaryRequiresPro;
}
