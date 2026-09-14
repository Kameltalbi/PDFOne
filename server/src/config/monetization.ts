/**
 * Central monetization policy for One2PDF.
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

export function getMonetizationFlags(): MonetizationFlags {
  const growthMode = envFlag('GROWTH_MODE', true);
  return {
    growthMode,
    standardToolsFree: true,
    ocrRequiresPro: envFlag('OCR_REQUIRES_PRO', true),
    translateRequiresPro: false,
    aiSummaryRequiresPro: false,
    freeBatchAllowed: true
  };
}

export function publicMonetizationFlags(): MonetizationFlags {
  return getMonetizationFlags();
}

export function premiumRequiresPro(feature: PremiumFeature): boolean {
  const flags = getMonetizationFlags();
  if (feature === 'ocr') return flags.ocrRequiresPro;
  if (feature === 'translate') return flags.translateRequiresPro;
  return flags.aiSummaryRequiresPro;
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
  if (feature === 'ocr') {
    const ocrCopy: Record<string, string> = {
      en: 'OCR is available with a 7-day Pass or Pro. Upgrade to continue — core PDF tools stay free.',
      fr: 'L’OCR est disponible avec le Pass 7 jours ou Pro. Passez à une offre payante pour continuer — les outils PDF de base restent gratuits.',
      es: 'El OCR está disponible con el Pase de 7 días o Pro. Pase a una oferta de pago para continuar: las herramientas PDF básicas siguen gratis.',
      de: 'OCR ist mit dem 7-Tage-Pass oder Pro verfügbar. Upgraden Sie, um fortzufahren — die Standard-PDF-Tools bleiben kostenlos.',
      pt: 'O OCR está disponível com o Passe de 7 dias ou Pro. Passe a uma oferta paga para continuar — as ferramentas PDF básicas continuam grátis.',
      tr: 'OCR, 7 günlük Pass veya Pro ile kullanılabilir. Devam etmek için ücretli bir plana geçin — temel PDF araçları ücretsiz kalır.',
      ar: 'يتوفر OCR مع باقة 7 أيام أو Pro. قم بالترقية للمتابعة — أدوات PDF الأساسية تبقى مجانية.',
      it: 'L’OCR è disponibile con il Pass 7 giorni o Pro. Passa a un’offerta a pagamento per continuare — gli strumenti PDF di base restano gratuiti.'
    };
    return ocrCopy[lang] || ocrCopy.en;
  }
  const cap = featureName.charAt(0).toUpperCase() + featureName.slice(1);
  const creditsCopy: Record<string, string> = {
    en: `${featureName} uses AI credits (1 credit per page). This is not a Pro-only feature. If you have no credits left, wait for the next period or choose Pass / Pro for a larger pool.`,
    fr: `${cap} utilise des crédits IA (1 crédit par page). Ce n’est pas une fonctionnalité réservée à Pro. S’il ne vous reste plus de crédits, attendez la période suivante ou choisissez Pass / Pro pour un plus grand volume.`,
    es: `${cap} usa créditos de IA (1 crédito por página). No es una función exclusiva de Pro. Si no le quedan créditos, espere al siguiente período o elija Pass / Pro para un volumen mayor.`,
    de: `${cap} verbraucht KI-Credits (1 Credit pro Seite). Das ist keine reine Pro-Funktion. Sind die Credits aufgebraucht, warten Sie auf den nächsten Zeitraum oder wählen Sie Pass / Pro für ein größeres Kontingent.`,
    pt: `${cap} usa créditos de IA (1 crédito por página). Não é um recurso exclusivo Pro. Se não restarem créditos, aguarde o período seguinte ou escolha Pass / Pro para um volume maior.`,
    tr: `${cap} YZ kredisi kullanır (sayfa başına 1 kredi). Bu yalnızca Pro’ya özel bir özellik değildir. Krediniz biterse sonraki dönemi bekleyin veya daha büyük bir havuz için Pass / Pro seçin.`,
    ar: `${featureName} يستخدم أرصدة الذكاء الاصطناعي (رصيد واحد لكل صفحة). ليست ميزة محصورة على Pro. إذا نفدت الأرصدة، انتظر الفترة التالية أو اختر Pass / Pro لحجم أكبر.`,
    it: `${cap} usa crediti IA (1 credito per pagina). Non è una funzione riservata a Pro. Se i crediti sono esauriti, attendi il periodo successivo oppure scegli Pass / Pro per un volume maggiore.`
  };
  return creditsCopy[lang] || creditsCopy.en;
}
