/** Product Hunt 50% off One2PDF Pro annual. Coupon/promo IDs stay server-side. */

export const PRODUCTHUNT_CODE = 'PRODUCTHUNT';

/** Inclusive end: 4 October 2026 23:59:59 UTC. */
export const PRODUCTHUNT_EXPIRES_AT_MS = Date.parse('2026-10-04T23:59:59.000Z');

export const ONE2PDF_YEAR_PRODUCT_ID_DEFAULT = 'prod_VCP6xGefoNGS8o';

export function isProductHuntWindowOpen(now = Date.now()): boolean {
  return now <= PRODUCTHUNT_EXPIRES_AT_MS;
}

export function one2pdfYearProductId(): string {
  return process.env.STRIPE_ONE2PDF_YEAR_PRODUCT_ID?.trim() || ONE2PDF_YEAR_PRODUCT_ID_DEFAULT;
}

export function allowYearPromotionCodes(now = Date.now()): boolean {
  return isProductHuntWindowOpen(now);
}
