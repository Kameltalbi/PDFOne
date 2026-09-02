import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { markdownToBlocks, type BlogBlock } from './blogMarkdown.js';

export const BLOG_LOCALES = ['fr', 'en', 'es', 'pt', 'de', 'tr', 'ar', 'it'] as const;
export type BlogLocale = (typeof BLOG_LOCALES)[number];

export type BlogLocaleCopy = {
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  cta: string;
  ctaTo: string;
  bodyMarkdown: string;
};

export type StoredBlogPost = {
  slug: string;
  status: 'draft' | 'published';
  publishedIso: string;
  locales: Partial<Record<BlogLocale, BlogLocaleCopy>>;
  updatedAt: string;
};

export type PublicBlogPost = {
  slug: string;
  publishedIso: string;
  publishedLabel: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  title: string;
  excerpt: string;
  body: BlogBlock[];
  cta: string;
  ctaTo: string;
};

const MAX_POSTS = 80;
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../data');
const dataFile = path.join(dataDir, 'blog.json');

let queue = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

async function readAll(): Promise<StoredBlogPost[]> {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw) as { posts?: StoredBlogPost[] } | StoredBlogPost[];
    return Array.isArray(parsed) ? parsed : (parsed.posts || []);
  } catch {
    return [];
  }
}

async function writeAll(posts: StoredBlogPost[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify({ posts }, null, 2));
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 80;
}

function isValidPath(value: string): boolean {
  return /^\/[a-zA-Z0-9/_\-?=#%.]*$/.test(value) && value.length <= 120;
}

function clip(value: unknown, max: number): string {
  return String(value || '').trim().slice(0, max);
}

function asLocale(value: string | undefined): BlogLocale {
  const lang = (value || 'en').slice(0, 2).toLowerCase();
  return (BLOG_LOCALES as readonly string[]).includes(lang) ? (lang as BlogLocale) : 'en';
}

function pickCopy(post: StoredBlogPost, locale: BlogLocale): BlogLocaleCopy | null {
  return post.locales[locale] || post.locales.en || post.locales.fr || Object.values(post.locales)[0] || null;
}

function publishedLabel(iso: string, locale: BlogLocale): string {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(date.getTime())) return iso;
  const tag = locale === 'fr' ? 'fr-CA' : locale === 'en' ? 'en-GB' : locale;
  return new Intl.DateTimeFormat(tag, { dateStyle: 'long' }).format(date);
}

export function toPublicPost(post: StoredBlogPost, locale: string): PublicBlogPost | null {
  const lang = asLocale(locale);
  const copy = pickCopy(post, lang);
  if (!copy?.title) return null;
  const body = markdownToBlocks(copy.bodyMarkdown || '');
  if (body.length === 0) return null;
  return {
    slug: post.slug,
    publishedIso: post.publishedIso,
    publishedLabel: publishedLabel(post.publishedIso, lang),
    seoTitle: copy.seoTitle || copy.title,
    seoDescription: copy.seoDescription || copy.excerpt,
    keywords: copy.keywords,
    title: copy.title,
    excerpt: copy.excerpt,
    body,
    cta: copy.cta || (lang === 'fr' ? 'Essayer One2PDF' : 'Try One2PDF'),
    ctaTo: isValidPath(copy.ctaTo) ? copy.ctaTo : '/tools'
  };
}

function sanitizeCopy(raw: Partial<BlogLocaleCopy> | undefined): BlogLocaleCopy | null {
  if (!raw) return null;
  const title = clip(raw.title, 140);
  const bodyMarkdown = clip(raw.bodyMarkdown, 80000);
  if (!title || !bodyMarkdown) return null;
  const ctaTo = clip(raw.ctaTo, 120) || '/tools';
  return {
    title,
    excerpt: clip(raw.excerpt, 400),
    seoTitle: clip(raw.seoTitle, 70) || title.slice(0, 70),
    seoDescription: clip(raw.seoDescription, 170) || clip(raw.excerpt, 170),
    keywords: clip(raw.keywords, 160),
    cta: clip(raw.cta, 80),
    ctaTo: isValidPath(ctaTo) ? ctaTo : '/tools',
    bodyMarkdown
  };
}

export async function listStoredPosts(): Promise<StoredBlogPost[]> {
  const posts = await readAll();
  return posts.sort((a, b) => b.publishedIso.localeCompare(a.publishedIso) || b.updatedAt.localeCompare(a.updatedAt));
}

export async function listPublishedPosts(locale: string): Promise<PublicBlogPost[]> {
  const posts = await listStoredPosts();
  return posts
    .filter((post) => post.status === 'published')
    .map((post) => toPublicPost(post, locale))
    .filter((post): post is PublicBlogPost => Boolean(post));
}

export async function getStoredPost(slug: string): Promise<StoredBlogPost | null> {
  const posts = await readAll();
  return posts.find((post) => post.slug === slug) || null;
}

export async function getPublishedPost(slug: string, locale: string): Promise<PublicBlogPost | null> {
  const post = await getStoredPost(slug);
  if (!post || post.status !== 'published') return null;
  return toPublicPost(post, locale);
}

export async function upsertPost(input: {
  slug?: string;
  status?: string;
  publishedIso?: string;
  locales?: Partial<Record<BlogLocale, Partial<BlogLocaleCopy>>>;
}): Promise<StoredBlogPost> {
  return withLock(async () => {
    const posts = await readAll();
    const title = input.locales?.fr?.title || input.locales?.en?.title || '';
    const slug = isValidSlug(String(input.slug || '')) ? String(input.slug) : slugify(title);
    if (!isValidSlug(slug)) throw new Error('INVALID_SLUG');

    const locales: StoredBlogPost['locales'] = {};
    for (const lang of BLOG_LOCALES) {
      const copy = sanitizeCopy(input.locales?.[lang]);
      if (copy) locales[lang] = copy;
    }
    if (Object.keys(locales).length === 0) throw new Error('EMPTY_BODY');

    const existing = posts.find((post) => post.slug === slug);
    if (!existing && posts.length >= MAX_POSTS) throw new Error('TOO_MANY');

    const publishedIso = /^\d{4}-\d{2}-\d{2}$/.test(String(input.publishedIso || ''))
      ? String(input.publishedIso)
      : (existing?.publishedIso || new Date().toISOString().slice(0, 10));
    const status = input.status === 'published' ? 'published' : 'draft';
    const next: StoredBlogPost = {
      slug,
      status,
      publishedIso,
      locales,
      updatedAt: new Date().toISOString()
    };
    const without = posts.filter((post) => post.slug !== slug);
    without.push(next);
    await writeAll(without);
    return next;
  });
}

export async function deletePost(slug: string): Promise<boolean> {
  return withLock(async () => {
    const posts = await readAll();
    const next = posts.filter((post) => post.slug !== slug);
    if (next.length === posts.length) return false;
    await writeAll(next);
    return true;
  });
}

export function postSummary(post: StoredBlogPost) {
  const copy = post.locales.fr || post.locales.en || Object.values(post.locales)[0];
  return {
    slug: post.slug,
    status: post.status,
    publishedIso: post.publishedIso,
    updatedAt: post.updatedAt,
    title: copy?.title || post.slug,
    locales: Object.keys(post.locales)
  };
}
