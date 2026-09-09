/** Client mirror of server monetization flags (from /api/billing/me). */

export type MonetizationFlags = {
  growthMode: boolean;
  standardToolsFree: boolean;
  ocrRequiresPro: boolean;
  translateRequiresPro: boolean;
  aiSummaryRequiresPro: boolean;
  freeBatchAllowed: boolean;
};

/** Defaults match server GROWTH_MODE=true until /me responds. */
export const DEFAULT_MONETIZATION: MonetizationFlags = {
  growthMode: true,
  standardToolsFree: true,
  ocrRequiresPro: true,
  translateRequiresPro: true,
  aiSummaryRequiresPro: true,
  freeBatchAllowed: true
};

export function parseMonetization(raw: unknown): MonetizationFlags {
  if (!raw || typeof raw !== 'object') return DEFAULT_MONETIZATION;
  const value = raw as Record<string, unknown>;
  const flag = (key: keyof MonetizationFlags, fallback: boolean) =>
    typeof value[key] === 'boolean' ? (value[key] as boolean) : fallback;
  const growthMode = flag('growthMode', DEFAULT_MONETIZATION.growthMode);
  return {
    growthMode,
    standardToolsFree: flag('standardToolsFree', growthMode),
    ocrRequiresPro: flag('ocrRequiresPro', growthMode),
    translateRequiresPro: flag('translateRequiresPro', growthMode),
    aiSummaryRequiresPro: flag('aiSummaryRequiresPro', growthMode),
    freeBatchAllowed: flag('freeBatchAllowed', growthMode)
  };
}

export type PremiumFeature = 'ocr' | 'translate' | 'summarize';

export function featureRequiresPro(flags: MonetizationFlags, feature: PremiumFeature): boolean {
  if (feature === 'ocr') return flags.ocrRequiresPro;
  if (feature === 'translate') return flags.translateRequiresPro;
  return flags.aiSummaryRequiresPro;
}
