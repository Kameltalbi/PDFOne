import Stripe from 'stripe';
import type { PaidPlan, StoredPlan } from './entitlements.js';
import {
  cancelEntitlement,
  getActiveEntitlementByEmail,
  isEntitlementActive,
  normalizeEmail,
  upsertEntitlement,
  type Entitlement
} from './entitlements.js';
import { amountsForZone, DEFAULT_ZONE, type PricingZone } from './pricingZones.js';

export const ACCESS_COOKIE = 'pdfone_access';
export const QUOTA_COOKIE = 'pdfone_quota';

const PLAN_NAMES: Record<PaidPlan, Record<string, string>> = {
  week: { fr: 'One2PDF — Pass Semaine (7 jours)', en: 'One2PDF — 7-day pass' },
  month: { fr: 'One2PDF — Pro mensuel', en: 'One2PDF — Pro monthly' },
  year: { fr: 'One2PDF — Pro annuel', en: 'One2PDF — Pro annual' }
};

export function isPaidPlan(value: unknown): value is PaidPlan {
  return value === 'week' || value === 'month' || value === 'year';
}

export function isStoredPlan(value: unknown): value is StoredPlan {
  return isPaidPlan(value) || value === 'business' || value === 'life';
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

export async function createCheckoutSession(
  plan: PaidPlan,
  localeHeader?: string,
  email?: string,
  zone: PricingZone = DEFAULT_ZONE
) {
  const stripe = getStripe();
  const lang = (localeHeader || 'fr').split(/[-_,]/)[0].toLowerCase();
  const name = PLAN_NAMES[plan][lang] || PLAN_NAMES[plan].en;
  const origin = appUrl();
  const customerEmail = normalizeEmail(email) || undefined;
  const amount = amountsForZone(zone)[plan];
  const common = {
    success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
    locale: stripeLocale(localeHeader),
    allow_promotion_codes: true,
    metadata: { plan, zone },
    ...(customerEmail ? { customer_email: customerEmail } : {})
  } as const;

  const session = plan === 'week'
    ? await stripe.checkout.sessions.create({
      ...common,
      mode: 'payment',
      customer_creation: 'always',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: { name }
          }
        }
      ]
    })
    : await stripe.checkout.sessions.create({
      ...common,
      mode: 'subscription',
      subscription_data: { metadata: { plan, zone } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: { name },
            recurring: { interval: plan === 'year' ? 'year' : 'month' }
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
  if (plan === 'week') {
    const createdMs = (session.created || Math.floor(Date.now() / 1000)) * 1000;
    return weekExpiry(new Date(createdMs));
  }
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

export type CheckoutPurchase = {
  transactionId: string;
  value: number;
  currency: string;
  plan: StoredPlan;
};

export async function entitlementFromCheckout(sessionId: string): Promise<AccessPayload> {
  const { access } = await confirmPaidCheckout(sessionId);
  return access;
}

export async function confirmPaidCheckout(sessionId: string): Promise<{ access: AccessPayload; purchase: CheckoutPurchase }> {
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
    email: normalizeEmail(email) || email,
    customerId,
    plan,
    status: 'active',
    expiresAt,
    subscriptionId
  };
  await upsertEntitlement(entry);

  const cents = typeof session.amount_total === 'number' ? session.amount_total : 0;
  return {
    access: { email: entry.email, customerId, plan, expiresAt },
    purchase: {
      transactionId: session.id,
      value: cents / 100,
      currency: (session.currency || 'usd').toUpperCase(),
      plan
    }
  };
}

function accessFromEntitlement(entry: Entitlement): AccessPayload {
  return {
    email: entry.email,
    customerId: entry.customerId,
    plan: entry.plan,
    expiresAt: entry.expiresAt
  };
}

function planFromCheckout(session: Stripe.Checkout.Session): StoredPlan | null {
  const plan = session.metadata?.plan;
  if (isStoredPlan(plan)) return plan;
  if (session.mode === 'subscription') return 'month';
  if (session.mode === 'payment') return 'week';
  return null;
}

async function entitlementFromStripeCustomer(stripe: Stripe, customer: Stripe.Customer | Stripe.DeletedCustomer): Promise<Entitlement | null> {
  if (customer.deleted) return null;
  const customerId = customer.id;
  const email = normalizeEmail(customer.email) || customer.email || '';

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10
  });
  const liveSub = subscriptions.data.find((sub) => sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due');
  if (liveSub) {
    const metaPlan = liveSub.metadata?.plan;
    const plan: StoredPlan = isStoredPlan(metaPlan)
      ? metaPlan
      : liveSub.items.data[0]?.price?.recurring?.interval === 'year' ? 'year' : 'month';
    const periodEnd = (liveSub as Stripe.Subscription & { current_period_end?: number }).current_period_end
      || liveSub.items.data[0]?.current_period_end;
    const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
    const entry: Entitlement = {
      email,
      customerId,
      plan,
      status: 'active',
      expiresAt,
      subscriptionId: liveSub.id
    };
    if (isEntitlementActive(entry)) return upsertEntitlement(entry);
  }

  const sessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 30 });
  for (const session of sessions.data) {
    if (session.status !== 'complete') continue;
    if (session.mode === 'payment' && session.payment_status !== 'paid') continue;
    const plan = planFromCheckout(session);
    if (!plan) continue;
    const expiresAt = await expiryFromSession(stripe, session, plan);
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;
    const entry: Entitlement = {
      email: normalizeEmail(session.customer_details?.email || session.customer_email || email) || email,
      customerId,
      plan,
      status: 'active',
      expiresAt,
      subscriptionId
    };
    if (isEntitlementActive(entry)) return upsertEntitlement(entry);
  }

  return null;
}

export async function restoreEntitlementByEmail(email: string): Promise<AccessPayload | null> {
  const needle = normalizeEmail(email);
  if (!needle || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(needle)) {
    throw new Error('INVALID_EMAIL');
  }

  const local = await getActiveEntitlementByEmail(needle);
  if (local) return accessFromEntitlement(local);

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    return null;
  }

  const customers = await stripe.customers.list({ email: needle, limit: 10 });
  for (const customer of customers.data) {
    const found = await entitlementFromStripeCustomer(stripe, customer);
    if (found) return accessFromEntitlement(found);
  }

  return null;
}

export async function createPortalUrl(customerId: string) {
  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl()}/account`
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
