import express from 'express';
import { getActiveEntitlementByEmail, getEntitlement, isEntitlementActive, usageSnapshot } from '../services/entitlements.js';
import { getFreeUsage } from '../middleware/quota.js';
import { currentSession, readUser } from './auth.js';
import { USER_COOKIE } from '../services/users.js';
import {
  ACCESS_COOKIE,
  cookieMaxAge,
  createCheckoutSession,
  createPortalUrl,
  confirmPaidCheckout,
  isPaidPlan,
  isSubscriptionPlan,
  restoreEntitlementByEmail,
  type AccessPayload
} from '../services/billing.js';
import { amountsForZone, detectPricingZone } from '../services/pricingZones.js';
import { clearCookie, clientIp, readCookie, setCookie, signValue, verifyValue } from '../utils/cookies.js';

const router = express.Router();
const restoreAttempts = new Map<string, { window: number; count: number }>();

function restoreMessage(req: express.Request, code: 'invalid' | 'none' | 'limit') {
  const lang = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
  const copy = {
    fr: {
      invalid: 'Indiquez l’e-mail utilisé lors du paiement.',
      none: 'Aucun pass actif pour cet e-mail. Vérifiez l’adresse, ou le pass a peut-être expiré.',
      limit: 'Trop de tentatives. Réessayez dans une heure.'
    },
    en: {
      invalid: 'Enter the email used at checkout.',
      none: 'No active pass for this email. Check the address, or the pass may have expired.',
      limit: 'Too many attempts. Try again in an hour.'
    }
  } as const;
  return (copy[lang as 'fr' | 'en'] || copy.fr)[code];
}

function allowRestore(ip: string) {
  const now = Date.now();
  const current = restoreAttempts.get(ip);
  if (!current || now - current.window > 60 * 60 * 1000) {
    restoreAttempts.set(ip, { window: now, count: 1 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count += 1;
  return true;
}

async function publicStatus(access: AccessPayload) {
  const stored = await getEntitlement(access.customerId);
  const usage = usageSnapshot(stored);
  return {
    paid: true as const,
    plan: access.plan,
    email: access.email,
    expiresAt: access.expiresAt,
    canManage: isSubscriptionPlan(access.plan),
    docsUsed: usage.docsUsed,
    usedToday: usage.usedToday,
    remainingMs: access.expiresAt ? Math.max(0, Date.parse(access.expiresAt) - Date.now()) : null
  };
}

function grantAccess(res: express.Response, access: AccessPayload) {
  setCookie(res, ACCESS_COOKIE, signValue(access), cookieMaxAge(access.plan, access.expiresAt));
}

router.get('/me', async (req, res) => {
  return res.json({ success: true, data: await currentSession(req, res) });
});

router.get('/prices', async (req, res) => {
  const zone = await detectPricingZone(req);
  const amounts = amountsForZone(zone);
  return res.json({
    success: true,
    data: {
      week: amounts.week,
      month: amounts.month,
      year: amounts.year
    }
  });
});

router.post('/checkout', async (req, res) => {
  const plan = req.body?.plan;
  if (!isPaidPlan(plan)) {
    return res.status(400).json({ success: false, error: 'Offre inconnue.' });
  }

  const email = (typeof req.body?.email === 'string' && req.body.email.trim())
    ? req.body.email
    : (readUser(req)?.email || '');
  const cookieAccess = verifyValue<AccessPayload>(readCookie(req, ACCESS_COOKIE));
  const activeCookie = cookieAccess && (!cookieAccess.expiresAt || Date.parse(cookieAccess.expiresAt) > Date.now())
    ? cookieAccess
    : null;
  const activeEmail = email ? await getActiveEntitlementByEmail(email) : null;
  const already = activeCookie || (activeEmail
    ? { plan: activeEmail.plan, expiresAt: activeEmail.expiresAt }
    : null);

  if (already && (plan === 'week' || (plan === 'month' && (already.plan === 'month' || already.plan === 'year')) || (plan === 'year' && already.plan === 'year'))) {
    const lang = String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
    return res.status(409).json({
      success: false,
      code: 'ALREADY_PAID',
      error: lang === 'en'
        ? 'You already have an active pass. Sign in with the email used at payment — do not pay again.'
        : 'Vous avez déjà un pass actif. Connectez-vous avec l’e-mail du paiement — ne payez pas une deuxième fois.'
    });
  }

  try {
    const zone = await detectPricingZone(req);
    const url = await createCheckoutSession(plan, String(req.headers['accept-language'] || 'fr'), email, zone);
    return res.json({ success: true, data: { url } });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        code: 'NOT_CONFIGURED',
        error: 'Ajoutez STRIPE_SECRET_KEY dans server/.env pour activer les paiements.'
      });
    }
    console.error('Checkout error:', error);
    return res.status(400).json({ success: false, error: 'Impossible de lancer le paiement.' });
  }
});

router.post('/confirm', async (req, res) => {
  const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Session de paiement manquante.' });
  }

  try {
    const { access, purchase } = await confirmPaidCheckout(sessionId);
    grantAccess(res, access);
    return res.json({
      success: true,
      data: {
        ...await publicStatus(access),
        purchase: {
          transactionId: purchase.transactionId,
          value: purchase.value,
          currency: purchase.currency,
          plan: purchase.plan
        }
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de confirmer le paiement.'
    });
  }
});

router.post('/restore', async (req, res) => {
  const ip = clientIp(req);
  if (!allowRestore(ip)) {
    return res.status(429).json({ success: false, error: restoreMessage(req, 'limit') });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  try {
    const access = await restoreEntitlementByEmail(email);
    if (!access) {
      return res.status(404).json({ success: false, error: restoreMessage(req, 'none') });
    }
    grantAccess(res, access);
    return res.json({ success: true, data: await publicStatus(access) });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      return res.status(400).json({ success: false, error: restoreMessage(req, 'invalid') });
    }
    console.error('Restore access error:', error);
    return res.status(400).json({ success: false, error: restoreMessage(req, 'none') });
  }
});

router.post('/portal', async (req, res) => {
  const access = verifyValue<AccessPayload>(readCookie(req, ACCESS_COOKIE));
  if (!access || !isSubscriptionPlan(access.plan)) {
    return res.status(401).json({ success: false, error: 'Aucun abonnement à gérer.' });
  }

  try {
    const url = await createPortalUrl(access.customerId);
    return res.json({ success: true, data: { url } });
  } catch (error) {
    console.error('Portal error:', error);
    return res.status(400).json({ success: false, error: 'Impossible d’ouvrir le portail Stripe.' });
  }
});

router.post('/logout', (_req, res) => {
  clearCookie(res, ACCESS_COOKIE);
  clearCookie(res, USER_COOKIE);
  return res.json({ success: true, data: { user: null, paid: false } });
});

export default router;
