/**
 * Central monetization policy for One2PDF.
 * Flip GROWTH_MODE (and optional overrides) without scattering Pro checks across routes.
 *
 * Stripe / entitlements / checkout stay untouched — this only changes who may run which tools.
 */

function envFlag(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw == null || raw.trim() === '') return fallback;
  return /^(1|true|yes|on)$/i.test(raw.trim());
}

export type PremiumFeature = 'ocr' | 'translate' | 'summarize';

export type MonetizationFlags = {
  growthMode: boolean;
  standardToolsFree: boolean;
  ocrRequiresPro: boolean;
  translateRequiresPro: boolean;
  aiSummaryRequiresPro: boolean;
  /** Free users may select multiple files (merge / images→PDF) without a Pro modal. */
  freeBatchAllowed: boolean;
};

/**
 * Defaults: Growth First until ~10k monthly visitors.
 * Set GROWTH_MODE=false to restore classic freemium (daily free quota, OCR on free quota).
 */
export function getMonetizationFlags(): MonetizationFlags {
  const growthMode = envFlag('GROWTH_MODE', true);
  const standardToolsFree = envFlag('STANDARD_TOOLS_FREE', growthMode);
  const ocrRequiresPro = envFlag('OCR_REQUIRES_PRO', growthMode);
  const translateRequiresPro = envFlag('TRANSLATE_REQUIRES_PRO', growthMode);
  const aiSummaryRequiresPro = envFlag('AI_SUMMARY_REQUIRES_PRO', growthMode);
  return {
    growthMode,
    standardToolsFree,
    ocrRequiresPro,
    translateRequiresPro,
    aiSummaryRequiresPro,
    freeBatchAllowed: standardToolsFree
  };
}

/** Skip the free daily document quota (cookie + IP) for unpaid users. */
export function skipFreeDailyQuota(): boolean {
  const flags = getMonetizationFlags();
  return flags.growthMode && flags.standardToolsFree;
}

/** Whether an unpaid user must hold Pro before running this expensive feature. */
export function premiumRequiresPro(feature: PremiumFeature): boolean {
  const flags = getMonetizationFlags();
  if (feature === 'ocr') return flags.ocrRequiresPro;
  if (feature === 'translate') return flags.translateRequiresPro;
  return flags.aiSummaryRequiresPro;
}

export function publicMonetizationFlags(): MonetizationFlags {
  return getMonetizationFlags();
}

export function premiumRequiredMessage(
  req: { headers: { [key: string]: string | string[] | undefined } },
  feature: PremiumFeature
): string {
  const lang = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
  const names: Record<PremiumFeature, Record<string, string>> = {
    ocr: {
      en: 'OCR',
      fr: 'OCR',
      es: 'OCR',
      de: 'OCR',
      pt: 'OCR',
      tr: 'OCR',
      ar: 'OCR',
      it: 'OCR'
    },
    translate: {
      en: 'AI translation',
      fr: 'traduction IA',
      es: 'traducción IA',
      de: 'KI-Übersetzung',
      pt: 'tradução IA',
      tr: 'YZ çeviri',
      ar: 'الترجمة بالذكاء الاصطناعي',
      it: 'traduzione IA'
    },
    summarize: {
      en: 'AI summarization',
      fr: 'résumé IA',
      es: 'resumen IA',
      de: 'KI-Zusammenfassung',
      pt: 'resumo IA',
      tr: 'YZ özet',
      ar: 'التلخيص بالذكاء الاصطناعي',
      it: 'riassunto IA'
    }
  };
  const featureName = names[feature][lang] || names[feature].en;
  const copy: Record<string, string> = {
    en: `${featureName} is a Pro feature (higher compute cost). Upgrade to continue — core PDF tools stay free.`,
    fr: `${featureName.charAt(0).toUpperCase()}${featureName.slice(1)} est une fonctionnalité Pro (coût de calcul élevé). Passez Pro pour continuer — les outils PDF de base restent gratuits.`,
    es: `${featureName} es una función Pro (mayor coste de cómputo). Pase a Pro para continuar: las herramientas PDF básicas siguen gratis.`,
    de: `${featureName} ist eine Pro-Funktion (höhere Rechenkosten). Upgraden Sie auf Pro — die Standard-PDF-Tools bleiben kostenlos.`,
    pt: `${featureName} é um recurso Pro (maior custo de computação). Passe a Pro para continuar — as ferramentas PDF básicas continuam grátis.`,
    tr: `${featureName} bir Pro özelliğidir (yüksek işlem maliyeti). Devam etmek için Pro’ya geçin — temel PDF araçları ücretsiz kalır.`,
    ar: `${featureName} ميزة Pro (تكلفة حوسبة أعلى). قم بالترقية للمتابعة — أدوات PDF الأساسية تبقى مجانية.`,
    it: `${featureName} è una funzione Pro (costo di calcolo elevato). Passa a Pro per continuare — gli strumenti PDF di base restano gratuiti.`
  };
  return copy[lang] || copy.en;
}
