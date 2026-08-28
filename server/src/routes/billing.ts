import express from 'express';
import { getEntitlement, isEntitlementActive } from '../services/entitlements.js';
import {
  ACCESS_COOKIE,
  cookieMaxAge,
  createCheckoutSession,
  createPortalUrl,
  entitlementFromCheckout,
  isPaidPlan,
  isSubscriptionPlan,
  type AccessPayload
} from '../services/billing.js';
import { clearCookie, readCookie, setCookie, signValue, verifyValue } from '../utils/cookies.js';

const router = express.Router();

function publicEntitlement(access: AccessPayload) {
  return {
    paid: true as const,
    plan: access.plan,
    email: access.email,
    expiresAt: access.expiresAt,
    canManage: isSubscriptionPlan(access.plan)
  };
}

router.get('/me', async (req, res) => {
  const access = verifyValue<AccessPayload>(readCookie(req, ACCESS_COOKIE));
  if (!access) {
    return res.json({ success: true, data: { paid: false } });
  }

  const stored = await getEntitlement(access.customerId);
  if (stored && !isEntitlementActive(stored)) {
    clearCookie(res, ACCESS_COOKIE);
    return res.json({ success: true, data: { paid: false } });
  }

  const current = stored
    ? { email: stored.email, customerId: stored.customerId, plan: stored.plan, expiresAt: stored.expiresAt }
    : access;

  if (current.expiresAt && Date.parse(current.expiresAt) <= Date.now()) {
    clearCookie(res, ACCESS_COOKIE);
    return res.json({ success: true, data: { paid: false } });
  }

  return res.json({ success: true, data: publicEntitlement(current) });
});

router.post('/checkout', async (req, res) => {
  const plan = req.body?.plan;
  if (!isPaidPlan(plan)) {
    return res.status(400).json({ success: false, error: 'Offre inconnue.' });
  }

  try {
    const url = await createCheckoutSession(plan, String(req.headers['accept-language'] || 'fr'));
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
    const access = await entitlementFromCheckout(sessionId);
    setCookie(res, ACCESS_COOKIE, signValue(access), cookieMaxAge(access.plan, access.expiresAt));
    return res.json({ success: true, data: publicEntitlement(access) });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de confirmer le paiement.'
    });
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
  return res.json({ success: true, data: { paid: false } });
});

export default router;
