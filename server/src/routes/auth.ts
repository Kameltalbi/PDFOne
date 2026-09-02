import express from 'express';
import { isSuperAdminEmail } from '../services/admins.js';
import { getActiveEntitlementByEmail, isEntitlementActive, usageSnapshot } from '../services/entitlements.js';
import { getFreeUsage } from '../middleware/quota.js';
import {
  ACCESS_COOKIE,
  cookieMaxAge,
  isSubscriptionPlan,
  restoreEntitlementByEmail,
  type AccessPayload
} from '../services/billing.js';
import {
  authenticateUser,
  createUser,
  getUserById,
  publicUser,
  USER_COOKIE,
  type PublicUser,
  type UserPayload
} from '../services/users.js';
import { clearCookie, clientIp, readCookie, setCookie, signValue, verifyValue } from '../utils/cookies.js';

const router = express.Router();
const loginAttempts = new Map<string, { window: number; count: number }>();

function langOf(req: express.Request) {
  return String(req.headers['accept-language'] || 'fr').slice(0, 2).toLowerCase();
}

function authMessage(req: express.Request, code: 'invalid' | 'taken' | 'weak' | 'name' | 'login' | 'limit') {
  const copy = {
    fr: {
      invalid: 'Indiquez un e-mail valide.',
      taken: 'Un compte existe déjà avec cet e-mail. Connectez-vous.',
      weak: 'Le mot de passe doit contenir au moins 8 caractères.',
      name: 'Indiquez votre nom (2 caractères minimum).',
      login: 'E-mail ou mot de passe incorrect.',
      limit: 'Trop de tentatives. Réessayez dans une heure.'
    },
    en: {
      invalid: 'Enter a valid email address.',
      taken: 'An account already exists for this email. Sign in.',
      weak: 'Password must be at least 8 characters.',
      name: 'Enter your name (2 characters minimum).',
      login: 'Incorrect email or password.',
      limit: 'Too many attempts. Try again in an hour.'
    }
  } as const;
  return (copy[langOf(req) as 'fr' | 'en'] || copy.fr)[code];
}

function allowAttempt(ip: string) {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  if (!current || now - current.window > 60 * 60 * 1000) {
    loginAttempts.set(ip, { window: now, count: 1 });
    return true;
  }
  if (current.count >= 12) return false;
  current.count += 1;
  return true;
}

export function readUser(req: express.Request): UserPayload | null {
  return verifyValue<UserPayload>(readCookie(req, USER_COOKIE));
}

function grantUser(res: express.Response, user: { id: string; name: string; email: string }) {
  setCookie(res, USER_COOKIE, signValue({
    userId: user.id,
    name: user.name,
    email: user.email
  } satisfies UserPayload), 60 * 60 * 24 * 365);
}

async function attachPass(res: express.Response, email: string): Promise<AccessPayload | null> {
  try {
    const access = await restoreEntitlementByEmail(email);
    if (!access) return null;
    setCookie(res, ACCESS_COOKIE, signValue(access), cookieMaxAge(access.plan, access.expiresAt));
    return access;
  } catch {
    return null;
  }
}

async function sessionPayload(
  req: express.Request,
  res: express.Response,
  user: PublicUser | null,
  accessOverride?: AccessPayload | null
) {
  const cookieAccess = verifyValue<AccessPayload>(readCookie(req, ACCESS_COOKIE));
  const access = accessOverride || cookieAccess;
  const stored = user
    ? await getActiveEntitlementByEmail(user.email)
    : access
      ? await getActiveEntitlementByEmail(access.email)
      : null;
  const live = stored && isEntitlementActive(stored)
    ? stored
    : (access && (!access.expiresAt || Date.parse(access.expiresAt) > Date.now()) ? access : null);

  const superadmin = Boolean(user && isSuperAdminEmail(user.email));

  if (live) {
    const usage = usageSnapshot(stored);
    return {
      user,
      superadmin,
      paid: true as const,
      plan: live.plan,
      email: live.email,
      expiresAt: live.expiresAt,
      canManage: Boolean(stored?.subscriptionId) && isSubscriptionPlan(live.plan),
      docsUsed: usage.docsUsed,
      usedToday: usage.usedToday,
      remainingMs: live.expiresAt ? Math.max(0, Date.parse(live.expiresAt) - Date.now()) : null
    };
  }

  return {
    user,
    superadmin,
    paid: false as const,
    ...getFreeUsage(req)
  };
}

router.post('/signup', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name : '';
  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  try {
    const user = await createUser(name, email, password);
    grantUser(res, user);
    const access = await attachPass(res, user.email);
    return res.json({ success: true, data: await sessionPayload(req, res, publicUser(user), access) });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'INVALID_EMAIL') return res.status(400).json({ success: false, error: authMessage(req, 'invalid') });
    if (code === 'EMAIL_TAKEN') return res.status(409).json({ success: false, error: authMessage(req, 'taken') });
    if (code === 'WEAK_PASSWORD') return res.status(400).json({ success: false, error: authMessage(req, 'weak') });
    if (code === 'INVALID_NAME') return res.status(400).json({ success: false, error: authMessage(req, 'name') });
    console.error('Signup error:', error);
    return res.status(400).json({ success: false, error: authMessage(req, 'invalid') });
  }
});

router.post('/login', async (req, res) => {
  if (!allowAttempt(clientIp(req))) {
    return res.status(429).json({ success: false, error: authMessage(req, 'limit') });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ success: false, error: authMessage(req, 'login') });
  }

  grantUser(res, user);
  const access = await attachPass(res, user.email);
  return res.json({ success: true, data: await sessionPayload(req, res, publicUser(user), access) });
});

router.post('/logout', (_req, res) => {
  clearCookie(res, USER_COOKIE);
  clearCookie(res, ACCESS_COOKIE);
  return res.json({ success: true, data: { user: null, paid: false } });
});

export async function currentSession(req: express.Request, res: express.Response) {
  const payload = readUser(req);
  const stored = payload ? await getUserById(payload.userId) : null;
  if (payload && !stored) clearCookie(res, USER_COOKIE);
  return sessionPayload(req, res, stored ? publicUser(stored) : null);
}

export default router;
