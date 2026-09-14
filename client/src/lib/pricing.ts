import { useMemo } from 'react';
import { PLAN_LIMITS, formatFileSizeLabel } from '@mini-pdf-tools/shared';
import { useI18n } from '../i18n';
import type { Locale, Messages } from '../i18n/types';
import { useBilling, type PlanAmounts } from './billing';

export function formatMoney(cents: number, locale: Locale): string {
  const value = (Math.max(0, cents) / 100).toFixed(2);
  if (locale === 'fr') return `${value.replace('.', ',')} $`;
  return `$${value}`;
}

export function monthsFreeVsMonthly(monthCents: number, yearCents: number): number {
  if (!monthCents) return 0;
  return Math.max(0, Math.round(12 - yearCents / monthCents));
}

export function applyRegionalCopy(
  pricing: Messages['pricing'],
  amounts: PlanAmounts,
  locale: Locale,
  t: (template: string, vars?: Record<string, string | number>) => string
): Messages['pricing'] {
  const weekPrice = formatMoney(amounts.week, locale);
  const monthPrice = formatMoney(amounts.month, locale);
  const yearPrice = formatMoney(amounts.year, locale);
  const monthEquiv = formatMoney(Math.round(amounts.year / 12), locale);
  const monthsFree = monthsFreeVsMonthly(amounts.month, amounts.year);
  const paidMonths = Math.max(1, 12 - monthsFree);
  const vars = {
    weekPrice,
    monthPrice,
    yearPrice,
    monthEquiv,
    monthsFree,
    paidMonths,
    dailyJobs: PLAN_LIMITS.free.dailyJobs ?? 5,
    freeAi: PLAN_LIMITS.free.aiCredits,
    weekAi: PLAN_LIMITS.week.aiCredits,
    proAi: PLAN_LIMITS.month.aiCredits,
    freeSize: formatFileSizeLabel(PLAN_LIMITS.free.maxFileBytes),
    paidSize: formatFileSizeLabel(PLAN_LIMITS.month.maxFileBytes),
    summarizeCap: 20,
    translateCap: 100
  };

  return {
    ...pricing,
    weekPrice,
    monthPrice,
    yearPrice,
    seoDescription: t(pricing.seoDescription, vars),
    yearEquiv: t(pricing.yearEquiv, vars),
    weekCta: t(pricing.weekCta, vars),
    weekIncludes: pricing.weekIncludes.map((item) => t(item, vars)),
    monthIncludes: pricing.monthIncludes.map((item) => t(item, vars)),
    yearIncludes: pricing.yearIncludes.map((item) => t(item, vars)),
    freeIncludes: pricing.freeIncludes.map((item) => t(item, vars)),
    faq: pricing.faq.map((item) => ({
      question: item.question,
      answer: t(item.answer, vars)
    }))
  };
}

export function usePricingCopy(): Messages['pricing'] {
  const { m, t, locale } = useI18n();
  const { prices } = useBilling();
  return useMemo(
    () => applyRegionalCopy(m.pricing, prices, locale, t),
    [m.pricing, prices, locale, t]
  );
}
