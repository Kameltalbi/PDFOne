import { useMemo } from 'react';
import { useI18n } from '../i18n';
import type { Locale, Messages } from '../i18n/types';
import { useBilling, type PlanAmounts } from './billing';

export const WEEK_AI_LIMIT = 10;

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
  const vars = { weekPrice, monthPrice, yearPrice, monthEquiv, monthsFree, paidMonths, aiLimit: WEEK_AI_LIMIT };

  return {
    ...pricing,
    weekPrice,
    monthPrice,
    yearPrice,
    seoDescription: t(pricing.seoDescription, vars),
    yearEquiv: t(pricing.yearEquiv, vars),
    weekCta: t(pricing.weekCta, vars),
    weekIncludes: pricing.weekIncludes.map((item) => t(item, vars)),
    yearIncludes: pricing.yearIncludes.map((item) => t(item, vars)),
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
