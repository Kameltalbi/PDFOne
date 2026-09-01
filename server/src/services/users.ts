import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeEmail } from './entitlements.js';

const scryptAsync = promisify(scrypt);

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = {
  name: string;
  email: string;
};

export const USER_COOKIE = 'pdfone_user';
export type UserPayload = {
  userId: string;
  name: string;
  email: string;
};

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../data');
const dataFile = path.join(dataDir, 'users.json');

let queue = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

async function readAll(): Promise<Record<string, StoredUser>> {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw) as Record<string, StoredUser>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, StoredUser>) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

export function publicUser(user: StoredUser): PublicUser {
  return { name: user.name, email: user.email };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

async function passwordsMatch(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = await scryptAsync(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, 'hex');
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export async function getUserByEmail(email: string | null | undefined): Promise<StoredUser | null> {
  const needle = normalizeEmail(email);
  if (!needle) return null;
  const data = await readAll();
  return Object.values(data).find((user) => user.email === needle) || null;
}

export async function getUserById(id: string | null | undefined): Promise<StoredUser | null> {
  if (!id) return null;
  const data = await readAll();
  return data[id] || null;
}

export async function createUser(name: string, email: string, password: string): Promise<StoredUser> {
  const trimmedName = name.trim();
  const normalized = normalizeEmail(email);
  if (trimmedName.length < 2) throw new Error('INVALID_NAME');
  if (!isValidEmail(normalized)) throw new Error('INVALID_EMAIL');
  if (password.length < 8) throw new Error('WEAK_PASSWORD');

  return withLock(async () => {
    const data = await readAll();
    if (Object.values(data).some((user) => user.email === normalized)) {
      throw new Error('EMAIL_TAKEN');
    }
    const user: StoredUser = {
      id: randomBytes(12).toString('hex'),
      name: trimmedName.slice(0, 80),
      email: normalized,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString()
    };
    data[user.id] = user;
    await writeAll(data);
    return user;
  });
}

export async function authenticateUser(email: string, password: string): Promise<StoredUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (!(await passwordsMatch(password, user.passwordHash))) return null;
  return user;
}
