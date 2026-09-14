import crypto from 'crypto';
import express from 'express';
import { authenticateUser, getUserByEmail, isValidEmail, listUsersPublic, USER_COOKIE, type UserPayload } from '../services/users.js';
import { isSuperAdminEmail } from '../services/admins.js';
import {
  cancelEntitlement,
  grantComplimentary,
  isEntitlementActive,
  listAllEntitlements,
  listEntitlementsByEmail,
  normalizeEmail,
  pickBestEntitlement,
  resetEntitlementUsage,
  usageSnapshot,
  type Entitlement
} from '../services/entitlements.js';
import { deletePost, getStoredPost, listStoredPosts, postSummary, upsertPost } from '../services/blog.js';
import { getStripe } from '../services/billing.js';
import { amountsForZone, DEFAULT_ZONE } from '../services/pricingZones.js';
import { pingConverters, runtimeHealthSnapshot } from '../utils/runtimeHealth.js';
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
    email: entry.email,
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

function planAmountCents(plan: string): number {
  const amounts = amountsForZone(DEFAULT_ZONE);
  if (plan === 'week') return amounts.week;
  if (plan === 'month') return amounts.month;
  if (plan === 'year') return amounts.year;
  return 0;
}

function planBucket(entry: Entitlement | null): 'free' | 'pro' | 'week' | 'inactive' {
  if (!entry) return 'free';
  if (!isEntitlementActive(entry)) return 'inactive';
  return entry.plan === 'week' ? 'week' : 'pro';
}

function dayStartUtc(offsetDays: number, now = new Date()): number {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.getTime();
}

function countSince(timestamps: number[], from: number, to = Date.now()): number {
  return timestamps.filter((value) => value >= from && value < to).length;
}

function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function signupSeries(createdAt: number[], days: number) {
  const start = dayStartUtc(1 - days);
  const points: number[] = [];
  const labels: string[] = [];
  for (let i = 0; i < days; i += 1) {
    const from = start + i * 86_400_000;
    const to = from + 86_400_000;
    points.push(countSince(createdAt, from, to));
    labels.push(new Date(from).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }));
  }
  return { points, labels, from: new Date(start).toISOString(), to: new Date(start + days * 86_400_000 - 1).toISOString() };
}

async function stripeMonthSnapshot() {
  try {
    const stripe = getStripe();
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    const charges = await stripe.charges.list({
      created: { gte: Math.floor(start.getTime() / 1000) },
      limit: 100
    });
    let cents = 0;
    const recent = charges.data.slice(0, 6).map((charge) => ({
      email: charge.billing_details?.email || charge.receipt_email || '—',
      plan: charge.description || '',
      amountCents: charge.amount,
      currency: charge.currency,
      date: new Date(charge.created * 1000).toISOString(),
      status: charge.paid && !charge.refunded ? 'Réussi' : (charge.refunded ? 'Remboursé' : charge.status)
    }));
    for (const charge of charges.data) {
      if (charge.paid && !charge.refunded) cents += charge.amount;
    }
    return {
      available: true,
      cents,
      currency: (charges.data[0]?.currency || 'usd').toUpperCase(),
      recent
    };
  } catch {
    return { available: false, cents: 0, currency: 'USD', recent: [] as Array<{
      email: string; plan: string; amountCents: number; currency: string; date: string; status: string;
    }> };
  }
}

router.get('/session', (req, res) => {
  const user = superAdminUser(req);
  return res.json({
    success: true,
    data: {
      configured: true,
      authenticated: isOpsAuthenticated(req),
      secretLogin: secretConfigured(),
      email: user?.email || null,
      name: user?.name || null
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

router.get('/overview', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const days = Number(req.query.days) === 30 || Number(req.query.days) === 90 ? Number(req.query.days) : 7;
    const [users, entitlements, posts, revenue, health] = await Promise.all([
      listUsersPublic(),
      listAllEntitlements(),
      listStoredPosts(),
      stripeMonthSnapshot(),
      runtimeHealthSnapshot()
    ]);
    const now = Date.now();
    const bestByEmail = new Map<string, Entitlement[]>();
    for (const entry of entitlements) {
      const email = normalizeEmail(entry.email);
      if (!email) continue;
      const list = bestByEmail.get(email) || [];
      list.push(entry);
      bestByEmail.set(email, list);
    }
    const userEmails = new Set(users.map((user) => user.email));
    let free = 0;
    let pro = 0;
    let week = 0;
    let inactive = 0;
    for (const user of users) {
      const bucket = planBucket(pickBestEntitlement(bestByEmail.get(user.email) || [], now));
      if (bucket === 'pro') pro += 1;
      else if (bucket === 'week') week += 1;
      else if (bucket === 'inactive') inactive += 1;
      else free += 1;
    }
    for (const [email, list] of bestByEmail) {
      if (userEmails.has(email)) continue;
      const bucket = planBucket(pickBestEntitlement(list, now));
      if (bucket === 'pro') pro += 1;
      else if (bucket === 'week') week += 1;
      else if (bucket === 'inactive') inactive += 1;
    }
    const createdAt = users.map((user) => Date.parse(user.createdAt)).filter((value) => Number.isFinite(value));
    const weekAgo = dayStartUtc(-7);
    const twoWeeksAgo = dayStartUtc(-14);
    const usersWeekAgo = createdAt.filter((value) => value < weekAgo).length;
    const newUsers = countSince(createdAt, weekAgo);
    const prevNewUsers = countSince(createdAt, twoWeeksAgo, weekAgo);
    const activeWeek = entitlements.filter((entry) => isEntitlementActive(entry) && entry.plan === 'week').length;
    const activePro = entitlements.filter((entry) => isEntitlementActive(entry) && entry.plan !== 'week').length;
    const signups = signupSeries(createdAt, days);
    const recentUsers = users.slice(0, 6).map((user) => {
      const best = pickBestEntitlement(bestByEmail.get(user.email) || [], now);
      const bucket = planBucket(best);
      return {
        email: user.email,
        name: user.name,
        plan: bucket === 'week' ? 'week' : (best?.plan || 'free'),
        bucket,
        createdAt: user.createdAt,
        status: bucket === 'inactive' ? 'Inactif' : 'Actif'
      };
    });
    const fallbackPayments = entitlements
      .filter((entry) => entry.source !== 'admin' && !entry.customerId.startsWith('admin:'))
      .slice()
      .sort((a, b) => String(b.expiresAt || '').localeCompare(String(a.expiresAt || '')))
      .slice(0, 6)
      .map((entry) => ({
        email: entry.email,
        plan: entry.plan,
        amountCents: planAmountCents(entry.plan),
        currency: 'USD',
        date: entry.expiresAt || '',
        status: isEntitlementActive(entry) ? 'Réussi' : entry.status
      }));
    return res.json({
      success: true,
      data: {
        kpis: {
          users: users.length,
          usersDelta: percentDelta(users.length, usersWeekAgo),
          pro: activePro,
          week: activeWeek,
          revenueCents: revenue.cents,
          revenueCurrency: revenue.currency,
          revenueAvailable: revenue.available,
          newUsers,
          newUsersDelta: percentDelta(newUsers, prevNewUsers)
        },
        mix: { free, pro, week, inactive, total: free + pro + week + inactive },
        signups,
        recentUsers,
        recentPayments: revenue.recent.length > 0 ? revenue.recent : fallbackPayments,
        recentPosts: posts.slice(0, 5).map(postSummary),
        services: {
          api: true,
          stripe: revenue.available || Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
          tempDisk: health.tempDisk,
          eventLoopLagMs: health.eventLoopLagMs,
          memoryMb: Math.round((health.memory.rss || 0) / (1024 * 1024)),
          checkedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ success: false, error: 'Impossible de charger le tableau de bord.' });
  }
});

router.get('/users', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const q = normalizeEmail(typeof req.query.q === 'string' ? req.query.q : '');
    const [users, entitlements] = await Promise.all([listUsersPublic(), listAllEntitlements()]);
    const now = Date.now();
    const byEmail = new Map<string, Entitlement[]>();
    for (const entry of entitlements) {
      const email = normalizeEmail(entry.email);
      if (!email) continue;
      const list = byEmail.get(email) || [];
      list.push(entry);
      byEmail.set(email, list);
    }
    const rows = users
      .filter((user) => !q || user.email.includes(q) || user.name.toLowerCase().includes(q))
      .slice(0, 400)
      .map((user) => {
        const best = pickBestEntitlement(byEmail.get(user.email) || [], now);
        const bucket = planBucket(best);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          plan: best?.plan || 'free',
          bucket,
          active: bucket === 'pro' || bucket === 'week',
          expiresAt: best?.expiresAt || null
        };
      });
    return res.json({ success: true, data: { users: rows } });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ success: false, error: 'Impossible de lister les utilisateurs.' });
  }
});

router.get('/entitlements', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const entries = await listAllEntitlements();
    return res.json({
      success: true,
      data: {
        entitlements: entries
          .map(publicEntitlement)
          .sort((a, b) => String(b.expiresAt || '').localeCompare(String(a.expiresAt || '')))
      }
    });
  } catch (error) {
    console.error('Admin entitlements error:', error);
    return res.status(500).json({ success: false, error: 'Impossible de lister les abonnements.' });
  }
});

router.get('/system', async (req, res) => {
  if (!requireOps(req, res)) return;
  try {
    const ready = req.query.ready === '1';
    const [health, converters] = await Promise.all([
      runtimeHealthSnapshot(),
      ready ? pingConverters() : Promise.resolve(null)
    ]);
    return res.json({
      success: true,
      data: {
        health,
        converters,
        stripe: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin system error:', error);
    return res.status(500).json({ success: false, error: 'Impossible de lire l’état système.' });
  }
});

export default router;
