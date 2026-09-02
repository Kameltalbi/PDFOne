import crypto from 'crypto';
import express from 'express';
import { authenticateUser, getUserByEmail, isValidEmail, USER_COOKIE, type UserPayload } from '../services/users.js';
import { isSuperAdminEmail } from '../services/admins.js';
import {
  cancelEntitlement,
  grantComplimentary,
  isEntitlementActive,
  listEntitlementsByEmail,
  normalizeEmail,
  resetEntitlementUsage,
  usageSnapshot,
  type Entitlement
} from '../services/entitlements.js';
import { deletePost, getStoredPost, listStoredPosts, postSummary, upsertPost } from '../services/blog.js';
import { clientIp, clearCookie, readCookie, setCookie, signValue, verifyValue } from '../utils/cookies.js';

const router = express.Router();
export const OPS_COOKIE = 'pdfone_ops';

type OpsSession = { ok: true; at: number };

const loginAttempts = new Map<string, { window: number; count: number }>();

function adminSecret(): string {
  return process.env.ADMIN_SECRET?.trim() || '';
}

function secretsEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  const n = Math.max(a.length, b.length, 32);
  const aa = Buffer.alloc(n);
  const bb = Buffer.alloc(n);
  a.copy(aa);
  b.copy(bb);
  return crypto.timingSafeEqual(aa, bb) && a.length === b.length;
}

function allowLogin(ip: string) {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  if (!current || now - current.window > 60 * 60 * 1000) {
    loginAttempts.set(ip, { window: now, count: 1 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count += 1;
  return true;
}

function secretConfigured() {
  return adminSecret().length >= 12;
}

function hasSecretSession(req: express.Request) {
  if (!secretConfigured()) return false;
  return Boolean(verifyValue<OpsSession>(readCookie(req, OPS_COOKIE))?.ok);
}

function superAdminUser(req: express.Request) {
  const user = verifyValue<UserPayload>(readCookie(req, USER_COOKIE));
  if (user && isSuperAdminEmail(user.email)) return user;
  return null;
}

function isOpsAuthenticated(req: express.Request) {
  return Boolean(superAdminUser(req) || hasSecretSession(req));
}

function requireOps(req: express.Request, res: express.Response): boolean {
  if (!isOpsAuthenticated(req)) {
    res.status(401).json({ success: false, error: 'Non authentifié.' });
    return false;
  }
  return true;
}

function publicEntitlement(entry: Entitlement) {
  const usage = usageSnapshot(entry);
  const admin = entry.source === 'admin' || entry.customerId.startsWith('admin:');
  return {
    customerId: entry.customerId,
    plan: entry.plan,
    status: entry.status,
    expiresAt: entry.expiresAt,
    active: isEntitlementActive(entry),
    source: admin ? 'admin' : 'stripe',
    note: entry.note || '',
    docsUsed: usage.docsUsed,
    usedToday: usage.usedToday,
    aiUsed: entry.aiUsed || 0,
    canManageStripe: Boolean(entry.subscriptionId)
  };
}

router.get('/session', (req, res) => {
  const user = superAdminUser(req);
  return res.json({
    success: true,
    data: {
      configured: true,
      authenticated: isOpsAuthenticated(req),
      secretLogin: secretConfigured(),
      email: user?.email || null
    }
  });
});

router.post('/login', async (req, res) => {
  if (!allowLogin(clientIp(req))) {
    return res.status(429).json({ success: false, error: 'Trop de tentatives. Réessayez plus tard.' });
  }

  const secret = typeof req.body.secret === 'string' ? req.body.secret : '';
  if (secret) {
    if (!secretConfigured() || !secretsEqual(secret, adminSecret())) {
      return res.status(401).json({ success: false, error: 'Accès refusé.' });
    }
    setCookie(res, OPS_COOKIE, signValue({ ok: true, at: Date.now() } satisfies OpsSession), 60 * 60 * 12);
    return res.json({ success: true, data: { authenticated: true } });
  }

  const email = typeof req.body.email === 'string' ? req.body.email : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'E-mail ou mot de passe incorrect.' });
  }
  if (!isSuperAdminEmail(user.email)) {
    return res.status(403).json({ success: false, error: 'Compte non autorisé.' });
  }
  setCookie(res, USER_COOKIE, signValue({
    userId: user.id,
    name: user.name,
    email: user.email
  }), 60 * 60 * 24 * 365);
  return res.json({ success: true, data: { authenticated: true, email: user.email } });
});

router.post('/logout', (_req, res) => {
  clearCookie(res, OPS_COOKIE);
  return res.json({ success: true });
});

router.post('/lookup', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const email = normalizeEmail(typeof req.body.email === 'string' ? req.body.email : '');
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'E-mail invalide.' });
    }
    const [user, entitlements] = await Promise.all([
      getUserByEmail(email),
      listEntitlementsByEmail(email)
    ]);
    return res.json({
      success: true,
      data: {
        email,
        user: user ? { name: user.name, createdAt: user.createdAt } : null,
        entitlements: entitlements.map(publicEntitlement)
      }
    });
  } catch (error) {
    console.error('Admin lookup error:', error);
    return res.status(500).json({ success: false, error: 'Recherche impossible.' });
  }
});

router.post('/grant', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const email = normalizeEmail(typeof req.body.email === 'string' ? req.body.email : '');
    const days = Number(req.body.days);
    const note = typeof req.body.note === 'string' ? req.body.note : '';
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'E-mail invalide.' });
    }
    if (!Number.isFinite(days) || days < 1 || days > 730) {
      return res.status(400).json({ success: false, error: 'Indiquez une durée entre 1 et 730 jours.' });
    }
    const entry = await grantComplimentary(email, days, note);
    return res.json({ success: true, data: publicEntitlement(entry) });
  } catch (error) {
    console.error('Admin grant error:', error);
    return res.status(500).json({ success: false, error: 'Attribution impossible.' });
  }
});

router.post('/revoke', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const customerId = typeof req.body.customerId === 'string' ? req.body.customerId.trim() : '';
    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Identifiant manquant.' });
    }
    await cancelEntitlement(customerId);
    return res.json({ success: true });
  } catch (error) {
    console.error('Admin revoke error:', error);
    return res.status(500).json({ success: false, error: 'Révocation impossible.' });
  }
});

router.get('/blog', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const posts = await listStoredPosts();
    return res.json({ success: true, data: { posts: posts.map(postSummary) } });
  } catch (error) {
    console.error('Admin blog list error:', error);
    return res.status(500).json({ success: false, error: 'Impossible de lister les articles.' });
  }
});

router.get('/blog/:slug', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const post = await getStoredPost(req.params.slug);
    if (!post) return res.status(404).json({ success: false, error: 'Article introuvable.' });
    return res.json({ success: true, data: post });
  } catch (error) {
    console.error('Admin blog get error:', error);
    return res.status(500).json({ success: false, error: 'Impossible de charger l’article.' });
  }
});

router.put('/blog', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const post = await upsertPost(req.body || {});
    return res.json({ success: true, data: post });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'INVALID_SLUG') return res.status(400).json({ success: false, error: 'Slug invalide (minuscules, tirets, 3 à 80 caractères).' });
    if (code === 'EMPTY_BODY') return res.status(400).json({ success: false, error: 'Ajoutez un titre et un contenu (FR ou EN).' });
    if (code === 'TOO_MANY') return res.status(400).json({ success: false, error: 'Limite d’articles atteinte.' });
    console.error('Admin blog save error:', error);
    return res.status(500).json({ success: false, error: 'Enregistrement impossible.' });
  }
});

router.delete('/blog/:slug', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const ok = await deletePost(req.params.slug);
    if (!ok) return res.status(404).json({ success: false, error: 'Article introuvable.' });
    return res.json({ success: true });
  } catch (error) {
    console.error('Admin blog delete error:', error);
    return res.status(500).json({ success: false, error: 'Suppression impossible.' });
  }
});

router.post('/reset-usage', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const customerId = typeof req.body.customerId === 'string' ? req.body.customerId.trim() : '';
    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Identifiant manquant.' });
    }
    const entry = await resetEntitlementUsage(customerId);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Aucun accès trouvé.' });
    }
    return res.json({ success: true, data: publicEntitlement(entry) });
  } catch (error) {
    console.error('Admin reset error:', error);
    return res.status(500).json({ success: false, error: 'Réinitialisation impossible.' });
  }
});

export default router;
