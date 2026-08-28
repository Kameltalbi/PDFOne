import Stripe from 'stripe';
import type { PaidPlan, StoredPlan } from './entitlements.js';
import { cancelEntitlement, upsertEntitlement, type Entitlement } from './entitlements.js';

export const ACCESS_COOKIE = 'pdfone_access';
export const QUOTA_COOKIE = 'pdfone_quota';

const PLAN_AMOUNTS: Record<PaidPlan, number> = {
  month: 599,
  year: 4900,
  business: 1999
};

const PLAN_INTERVAL: Record<PaidPlan, 'month' | 'year'> = {
  month: 'month',
  year: 'year',
  business: 'month'
};

const PLAN_NAMES: Record<PaidPlan, Record<string, string>> = {
  month: { fr: 'One2PDF — Pro mensuel', en: 'One2PDF — Pro monthly' },
  year: { fr: 'One2PDF — Pro annuel', en: 'One2PDF — Pro annual' },
  business: { fr: 'One2PDF — Business (5 utilisateurs)', en: 'One2PDF — Business (5 users)' }
};

export function isPaidPlan(value: unknown): value is PaidPlan {
  return value === 'month' || value === 'year' || value === 'business';
}

export function isStoredPlan(value: unknown): value is StoredPlan {
  return isPaidPlan(value) || value === 'week' || value === 'life';
}

export function isSubscriptionPlan(plan: StoredPlan): boolean {
  return plan === 'month' || plan === 'year' || plan === 'business';
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

export function cookieMaxAge(plan: StoredPlan, expiresAt: string | null): number {
  if (plan === 'life' || !expiresAt) return 60 * 60 * 24 * 365 * 10;
  const ms = Date.parse(expiresAt) - Date.now();
  return Math.max(60, Math.floor(ms / 1000));
}

export type AccessPayload = {
  email: string;
  customerId: string;
  plan: StoredPlan;
  expiresAt: string | null;
};

export async function createCheckoutSession(plan: PaidPlan, localeHeader?: string) {
  const stripe = getStripe();
  const lang = (localeHeader || 'fr').split(/[-_,]/)[0].toLowerCase();
  const name = PLAN_NAMES[plan][lang] || PLAN_NAMES[plan].en;
  const origin = appUrl();
  const interval = PLAN_INTERVAL[plan];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
    locale: stripeLocale(localeHeader),
    allow_promotion_codes: true,
    metadata: { plan },
    subscription_data: { metadata: { plan } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: PLAN_AMOUNTS[plan],
          product_data: { name },
          recurring: { interval }
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

async function expiryFromSession(stripe: Stripe, session: Stripe.Checkout.Session, plan: StoredPlan): Promise<string | null> {
  if (plan === 'life') return null;
  if (plan === 'week') return weekExpiry();
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;
  if (!subscriptionId) return new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end
    || subscription.items.data[0]?.current_period_end;
  if (!periodEnd) return new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
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
  if (!isStoredPlan(plan)) {
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
