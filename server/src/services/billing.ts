import Stripe from 'stripe';
import type { PaidPlan } from './entitlements.js';
import { cancelEntitlement, upsertEntitlement, type Entitlement } from './entitlements.js';

export const ACCESS_COOKIE = 'pdfone_access';
export const QUOTA_COOKIE = 'pdfone_quota';

const PLAN_AMOUNTS: Record<PaidPlan, number> = {
  week: 199,
  year: 1000,
  life: 2999
};

const PLAN_NAMES: Record<PaidPlan, Record<string, string>> = {
  week: { fr: 'PDFOne — Pass 7 jours', en: 'PDFOne — 7-day pass' },
  year: { fr: 'PDFOne — Illimité annuel', en: 'PDFOne — Annual unlimited' },
  life: { fr: 'PDFOne — Pass à vie', en: 'PDFOne — Lifetime pass' }
};

export function isPaidPlan(value: unknown): value is PaidPlan {
  return value === 'week' || value === 'year' || value === 'life';
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    const error = new Error('NOT_CONFIGURED');
    error.name = 'BillingConfigError';
    throw error;
  }
  return new Stripe(key);
}

export function appUrl(): string {
  return (process.env.APP_URL || 'http://localhost:5174').replace(/\/$/, '');
}

export function stripeLocale(header: string | undefined): Stripe.Checkout.SessionCreateParams.Locale {
  const base = (header || 'fr').split(/[-_,]/)[0].toLowerCase();
  if (['fr', 'en', 'es', 'pt', 'de', 'it', 'tr'].includes(base)) {
    return base as Stripe.Checkout.SessionCreateParams.Locale;
  }
  return 'auto';
}

export function cookieMaxAge(plan: PaidPlan, expiresAt: string | null): number {
  if (plan === 'life' || !expiresAt) return 60 * 60 * 24 * 365 * 10;
  const ms = Date.parse(expiresAt) - Date.now();
  return Math.max(60, Math.floor(ms / 1000));
}

export type AccessPayload = {
  email: string;
  customerId: string;
  plan: PaidPlan;
  expiresAt: string | null;
};

export async function createCheckoutSession(plan: PaidPlan, localeHeader?: string) {
  const stripe = getStripe();
  const lang = (localeHeader || 'fr').split(/[-_,]/)[0].toLowerCase();
  const name = PLAN_NAMES[plan][lang] || PLAN_NAMES[plan].en;
  const origin = appUrl();
  const isYear = plan === 'year';

  const session = await stripe.checkout.sessions.create({
    mode: isYear ? 'subscription' : 'payment',
    success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
    locale: stripeLocale(localeHeader),
    customer_creation: isYear ? undefined : 'always',
    allow_promotion_codes: true,
    metadata: { plan },
    subscription_data: isYear ? { metadata: { plan } } : undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: PLAN_AMOUNTS[plan],
          product_data: { name },
          ...(isYear ? { recurring: { interval: 'year' as const } } : {})
        }
      }
    ]
  });

  if (!session.url) {
    throw new Error('Impossible de créer la session de paiement.');
  }

  return session.url;
}

function weekExpiry(from = new Date()): string {
  return new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

async function expiryFromSession(stripe: Stripe, session: Stripe.Checkout.Session, plan: PaidPlan): Promise<string | null> {
  if (plan === 'life') return null;
  if (plan === 'week') return weekExpiry();
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;
  if (!subscriptionId) return new Date(Date.now() + 366 * 24 * 60 * 60 * 1000).toISOString();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end
    || subscription.items.data[0]?.current_period_end;
  if (!periodEnd) return new Date(Date.now() + 366 * 24 * 60 * 60 * 1000).toISOString();
  return new Date(periodEnd * 1000).toISOString();
}

export async function entitlementFromCheckout(sessionId: string): Promise<AccessPayload> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status !== 'complete') {
    throw new Error('Le paiement n’est pas terminé.');
  }
  if (session.mode === 'payment' && session.payment_status !== 'paid') {
    throw new Error('Le paiement n’est pas confirmé.');
  }

  const plan = session.metadata?.plan;
  if (!isPaidPlan(plan)) {
    throw new Error('Offre inconnue.');
  }

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const email = session.customer_details?.email || session.customer_email || '';
  if (!customerId) {
    throw new Error('Client Stripe introuvable.');
  }

  const expiresAt = await expiryFromSession(stripe, session, plan);
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  const entry: Entitlement = {
    email,
    customerId,
    plan,
    status: 'active',
    expiresAt,
    subscriptionId
  };
  await upsertEntitlement(entry);
  return { email, customerId, plan, expiresAt };
}

export async function createPortalUrl(customerId: string) {
  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl()}/pricing`
  });
  return portal.url;
}

export async function applyStripeEvent(event: Stripe.Event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id) await entitlementFromCheckout(session.id);
    return;
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    await cancelEntitlement(customerId);
  }
}
