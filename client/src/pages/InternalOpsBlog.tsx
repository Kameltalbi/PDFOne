import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { dictionaries } from '../i18n/dictionaries';
import { TOOL_CATALOG } from '../lib/toolCatalog';
import { opsRequest } from '../lib/ops';
import { formatDate } from './opsShared';
import OpsRichTextEditor from './OpsRichTextEditor';
import { looksLikeHtml } from './opsRichText';

type BlogLocale = 'fr' | 'en';
type BlogStatus = 'draft' | 'published' | 'scheduled';
type BlogFilter = 'all' | 'draft' | 'scheduled' | 'published';

type BlogCopy = {
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  cta: string;
  ctaTo: string;
  bodyMarkdown: string;
};

type StoredPost = {
  slug: string;
  status: BlogStatus;
  publishedIso: string;
  coverImage?: string;
  coverAlt?: string;
  internalLinks?: string[];
  locales: Partial<Record<BlogLocale, BlogCopy>>;
  updatedAt: string;
};

type PostSummary = {
  slug: string;
  status: BlogStatus;
  publishedIso: string;
  updatedAt: string;
  title: string;
  locales: string[];
};

type SeoLock = { title: boolean; description: boolean };

const ASSOCIATED_TOOLS = TOOL_CATALOG
  .filter((tool) => !tool.path.startsWith('/compress-pdf-'))
  .map((tool) => ({
    path: tool.path,
    en: tool.label(dictionaries.en),
    fr: tool.label(dictionaries.fr)
  }));

const emptyLocks = (): Record<BlogLocale, SeoLock> => ({
  fr: { title: false, description: false },
  en: { title: false, description: false }
});

const emptyCopy = (locale: BlogLocale): BlogCopy => ({
  title: '',
  excerpt: '',
  seoTitle: '',
  seoDescription: '',
  keywords: '',
  cta: locale === 'fr' ? 'Essayer One2PDF' : 'Try One2PDF',
  ctaTo: '/tools',
  bodyMarkdown: ''
});

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toLocalInput(iso: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T09:00:00`) : new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function nowLocal() {
  return toLocalInput(new Date().toISOString());
}

function splitLocal(value: string) {
  const [date, time = ''] = value.split('T');
  return { date: date || '', time: time.slice(0, 5) };
}

function joinLocal(date: string, time: string) {
  if (!date) return '';
  return `${date}T${time || '09:00'}`;
}

function slugify(value: string) {
  const slug = value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  if (slug.length >= 3) return slug;
  const fallback = `article-${slug || 'post'}`.replace(/-+$/g, '');
  return fallback.length >= 3 ? fallback.slice(0, 80) : 'article-post';
}

function suggestSeoTitle(title: string) {
  const clean = title.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  if (/one2pdf/i.test(clean)) return clean;
  return `${clean} | One2PDF`;
}

function suggestDescription(excerpt: string) {
  return excerpt.trim().replace(/\s+/g, ' ');
}

function toolButtonLabel(name: string, locale: BlogLocale) {
  const clean = name.trim();
  if (!clean) return locale === 'fr' ? 'Essayer One2PDF' : 'Try One2PDF';
  if (locale === 'fr' || /now$/i.test(clean)) return clean;
  return `${clean} Now`;
}

function matchTool(post: StoredPost) {
  const candidates = [
    post.locales.en?.ctaTo,
    post.locales.fr?.ctaTo,
    ...(post.internalLinks || [])
  ].filter((value): value is string => Boolean(value && value !== '/tools'));
  return ASSOCIATED_TOOLS.find((tool) => candidates.includes(tool.path))?.path || '';
}

function initialLocale(post: StoredPost): BlogLocale {
  const hasEn = Boolean(post.locales.en?.title?.trim() || post.locales.en?.bodyMarkdown?.trim());
  const hasFr = Boolean(post.locales.fr?.title?.trim() || post.locales.fr?.bodyMarkdown?.trim());
  if (hasEn && !hasFr) return 'en';
  if (hasFr && !hasEn) return 'fr';
  return hasEn ? 'en' : 'fr';
}

function statusLabel(status: BlogStatus) {
  if (status === 'published') return 'Publié';
  if (status === 'scheduled') return 'Programmé';
  return 'Brouillon';
}

function lengthTone(length: number, min: number, max: number) {
  if (length === 0) return 'empty';
  if (length >= min && length <= max) return 'ok';
  return 'warn';
}

function previewHtml(value: string) {
  const source = value.trim();
  if (!source) return '<p>Le contenu de l’article s’affichera ici.</p>';
  if (looksLikeHtml(source)) return source;
  return source
    .split(/\n{2,}/)
    .map((chunk) => `<p>${chunk.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export default function InternalOpsBlog() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [filter, setFilter] = useState<BlogFilter>('all');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugFrozen, setSlugFrozen] = useState(false);
  const [status, setStatus] = useState<BlogStatus>('draft');
  const [publishedLocal, setPublishedLocal] = useState(nowLocal());
  const [coverImage, setCoverImage] = useState('');
  const [coverAlt, setCoverAlt] = useState('');
  const [toolPath, setToolPath] = useState('');
  const [internalLinks, setInternalLinks] = useState<string[]>([]);
  const [locale, setLocale] = useState<BlogLocale>('en');
  const [locales, setLocales] = useState<Record<BlogLocale, BlogCopy>>({
    fr: emptyCopy('fr'),
    en: emptyCopy('en')
  });
  const [seoLocks, setSeoLocks] = useState<Record<BlogLocale, SeoLock>>(emptyLocks);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const saveBannerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const copy = locales[locale];
  const selectedTool = ASSOCIATED_TOOLS.find((tool) => tool.path === toolPath);
  const schedule = splitLocal(publishedLocal);
  const visible = useMemo(
    () => posts.filter((post) => filter === 'all' || post.status === filter),
    [posts, filter]
  );
  const previewSlug = slug.trim()
    ? slugify(slug)
    : (copy.title.trim() ? slugify(copy.title) : 'slug');

  const loadList = async () => {
    const data = await opsRequest<{ posts: PostSummary[] }>('/api/admin/blog');
    setPosts(data.posts);
  };

  useEffect(() => {
    void loadList().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Impossible de charger les articles.');
    });
  }, []);

  useEffect(() => {
    if (!saved || !saveBannerRef.current) return;
    saveBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [saved]);

  const patchCopy = (patch: Partial<BlogCopy>) => {
    setLocales((current) => ({ ...current, [locale]: { ...current[locale], ...patch } }));
  };

  const lockSeo = (field: keyof SeoLock) => {
    setSeoLocks((current) => ({ ...current, [locale]: { ...current[locale], [field]: true } }));
  };

  const resetForm = () => {
    setEditing(null);
    setSlug('');
    setSlugTouched(false);
    setSlugFrozen(false);
    setStatus('draft');
    setPublishedLocal(nowLocal());
    setCoverImage('');
    setCoverAlt('');
    setToolPath('');
    setInternalLinks([]);
    setLocale('en');
    setLocales({ fr: emptyCopy('fr'), en: emptyCopy('en') });
    setSeoLocks(emptyLocks());
    setPreview(false);
    setSaved(null);
    setError(null);
  };

  const startNew = () => {
    resetForm();
    setEditing('new');
    setLocale('en');
  };

  const startEdit = async (target: string) => {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const post = await opsRequest<StoredPost>(`/api/admin/blog/${encodeURIComponent(target)}`);
      const nextLocales = {
        fr: { ...emptyCopy('fr'), ...(post.locales.fr || {}) },
        en: { ...emptyCopy('en'), ...(post.locales.en || {}) }
      };
      setEditing(post.slug);
      setSlug(post.slug);
      setSlugTouched(true);
      setSlugFrozen(post.status === 'published');
      setStatus(post.status);
      setPublishedLocal(toLocalInput(post.publishedIso) || nowLocal());
      setCoverImage(post.coverImage || '');
      setCoverAlt(post.coverAlt || '');
      setInternalLinks(post.internalLinks || []);
      setToolPath(matchTool(post));
      setLocales(nextLocales);
      setSeoLocks({
        fr: {
          title: Boolean(post.locales.fr?.seoTitle?.trim()),
          description: Boolean(post.locales.fr?.seoDescription?.trim())
        },
        en: {
          title: Boolean(post.locales.en?.seoTitle?.trim()),
          description: Boolean(post.locales.en?.seoDescription?.trim())
        }
      });
      setLocale(initialLocale(post));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally {
      setBusy(false);
    }
  };

  const applyTool = (path: string) => {
    const tool = ASSOCIATED_TOOLS.find((item) => item.path === path);
    setToolPath(path);
    setInternalLinks(tool ? [tool.path] : []);
    setLocales((current) => ({
      fr: {
        ...current.fr,
        cta: tool ? toolButtonLabel(tool.fr, 'fr') : 'Essayer One2PDF',
        ctaTo: tool ? tool.path : '/tools'
      },
      en: {
        ...current.en,
        cta: tool ? toolButtonLabel(tool.en, 'en') : 'Try One2PDF',
        ctaTo: tool ? tool.path : '/tools'
      }
    }));
  };

  const uploadCoverFile = (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Choisissez une image JPG, PNG, WebP ou GIF.');
      return;
    }
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append('image', file);
    void opsRequest<{ url: string }>('/api/admin/blog/image', { method: 'POST', body })
      .then((data) => setCoverImage(data.url))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Téléversement impossible.');
      })
      .finally(() => setBusy(false));
  };

  const uploadCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    uploadCoverFile(file);
  };

  const onDropCover = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    uploadCoverFile(event.dataTransfer.files?.[0]);
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(null);
    void (async () => {
      try {
        const sourceTitle = locales.en.title.trim() || locales.fr.title.trim();
        const nextSlug = slugify(slug.trim() || sourceTitle);
        const publishedAt = publishedLocal ? new Date(publishedLocal) : new Date();
        const packedLocales = {
          ...(locales.fr.title.trim() ? { fr: locales.fr } : {}),
          ...(locales.en.title.trim() ? { en: locales.en } : {})
        };
        if (!packedLocales.fr && !packedLocales.en) {
          throw new Error('Ajoutez un titre et un contenu (FR ou EN).');
        }
        const post = await opsRequest<StoredPost>('/api/admin/blog', {
          method: 'PUT',
          body: JSON.stringify({
            slug: nextSlug,
            previousSlug: editing && editing !== 'new' && editing !== nextSlug ? editing : undefined,
            status,
            publishedIso: Number.isNaN(publishedAt.getTime()) ? undefined : publishedAt.toISOString(),
            coverImage,
            coverAlt,
            internalLinks: toolPath ? [toolPath] : internalLinks,
            locales: packedLocales
          })
        });
        setEditing(post.slug);
        setSlug(post.slug);
        setSlugTouched(true);
        setSlugFrozen(post.status === 'published');
        setStatus(post.status);
        if (post.status === 'published') setFilter('published');
        if (post.status === 'scheduled') {
          setSaved('Article programmé. Il sera publié automatiquement à l’heure indiquée.');
        } else if (post.status === 'published') {
          setSaved(`Article publié. Il est en ligne sur /blog/${post.slug}.`);
        } else {
          setSaved('Brouillon enregistré. Il n’est pas encore visible sur le blog.');
        }
        await loadList();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
      } finally {
        setBusy(false);
      }
    })();
  };

  const remove = (target: string) => {
    if (!window.confirm(`Supprimer l’article « ${target} » ? Il disparaîtra du blog public.`)) return;
    setBusy(true);
    setError(null);
    void (async () => {
      try {
        await opsRequest(`/api/admin/blog/${encodeURIComponent(target)}`, { method: 'DELETE' });
        if (editing === target) resetForm();
        await loadList();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Suppression impossible.');
      } finally {
        setBusy(false);
      }
    })();
  };

  const onTitle = (value: string) => {
    const patch: Partial<BlogCopy> = { title: value };
    if (!seoLocks[locale].title) patch.seoTitle = suggestSeoTitle(value);
    patchCopy(patch);
    if (editing === 'new' && !slugTouched && !slugFrozen) {
      setSlug(value.trim() ? slugify(value) : '');
    }
  };

  const onExcerpt = (value: string) => {
    const patch: Partial<BlogCopy> = { excerpt: value };
    if (!seoLocks[locale].description) patch.seoDescription = suggestDescription(value);
    patchCopy(patch);
  };

  const chooseStatus = (next: BlogStatus) => {
    setStatus(next);
    if (next !== 'scheduled') return;
    const current = publishedLocal ? new Date(publishedLocal) : new Date(0);
    if (Number.isNaN(current.getTime()) || current.getTime() <= Date.now()) {
      setPublishedLocal(toLocalInput(new Date(Date.now() + 60 * 60 * 1000).toISOString()));
    }
  };

  const actionLabel = status === 'draft'
    ? 'Enregistrer le brouillon'
    : status === 'scheduled'
      ? 'Programmer'
      : 'Publier';

  return (
    <div className="ops-pagebody">
      {!editing && (
        <>
          <div className="ops-pagehead">
            <div>
              <h1>Blog / Articles</h1>
              <p>Brouillons, programmation et publication.</p>
            </div>
            <button type="button" onClick={startNew} disabled={busy}>Nouvel article</button>
          </div>
          <section className="ops-panel">
            <div className="ops-seg">
              {([
                ['all', 'Tous'],
                ['draft', 'Brouillons'],
                ['scheduled', 'Programmés'],
                ['published', 'Publiés']
              ] as const).map(([id, label]) => (
                <button key={id} type="button" className={filter === id ? 'ops-tab-on' : ''} onClick={() => setFilter(id)}>
                  {label}
                  <em>{id === 'all' ? posts.length : posts.filter((post) => post.status === id).length}</em>
                </button>
              ))}
            </div>
            {error && <p className="ops-error">{error}</p>}
            <div className="ops-table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Statut</th>
                    <th>Publication</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr><td colSpan={4}><p>Aucun article dans ce filtre.</p></td></tr>
                  ) : visible.map((post) => (
                    <tr key={post.slug}>
                      <td>
                        <strong>{post.title}</strong>
                        <p>/blog/{post.slug} · {post.locales.join(', ') || '—'}</p>
                      </td>
                      <td>
                        <span className={post.status === 'published' ? 'ops-ok' : post.status === 'scheduled' ? 'ops-pill ops-pill-week' : 'ops-off'}>
                          {statusLabel(post.status)}
                        </span>
                      </td>
                      <td>{formatDate(post.publishedIso, true)}</td>
                      <td className="ops-actions">
                        <button type="button" onClick={() => void startEdit(post.slug)} disabled={busy}>Modifier</button>
                        <button type="button" className="ops-danger" onClick={() => remove(post.slug)} disabled={busy}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {editing && (
        <form className="ops-editor-page" onSubmit={save}>
          <header className="ops-editor-top">
            <button type="button" className="ops-back" onClick={resetForm}>← Articles</button>
            <div className="ops-editor-actions">
              <div className="ops-lang" role="group" aria-label="Langue de l’article">
                <button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button>
                <button type="button" aria-pressed={locale === 'fr'} onClick={() => setLocale('fr')}>Français</button>
              </div>
              <button type="button" className="ops-ghost" onClick={() => setPreview(true)}>Aperçu</button>
              <button type="submit" className="ops-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </header>
          <h1>{editing === 'new' ? 'Nouvel article' : 'Modifier l’article'}</h1>
          {error && <p className="ops-error">{error}</p>}
          {saved && (
            <div ref={saveBannerRef} className="ops-publish-ok" role="status">
              <strong>{saved}</strong>
              {status === 'published' && slug && saved.startsWith('Article publié') ? (
                <a href={`/blog/${slug}`} target="_blank" rel="noreferrer">Voir l’article sur le blog</a>
              ) : null}
            </div>
          )}
          <div className="ops-editor-grid">
            <div className="ops-editor-main">
              <section className="ops-editor-card">
                <h2>Contenu éditorial</h2>
                <div className="ops-stack">
                  <label className="ops-field">
                    <span>Titre de l’article</span>
                    <input
                      className="ops-title-input"
                      value={copy.title}
                      placeholder="Titre de l’article"
                      onChange={(event) => onTitle(event.target.value)}
                      required={!locales[locale === 'fr' ? 'en' : 'fr'].title.trim()}
                    />
                  </label>
                  <label className="ops-field">
                    <span>Chapô</span>
                    <textarea
                      rows={3}
                      value={copy.excerpt}
                      placeholder="Deux ou trois phrases pour la carte du blog"
                      onChange={(event) => onExcerpt(event.target.value)}
                    />
                  </label>
                  <div className="ops-field">
                    <span>Article</span>
                    <OpsRichTextEditor
                      value={copy.bodyMarkdown}
                      onChange={(html) => patchCopy({ bodyMarkdown: html })}
                      placeholder="Écrivez l’article, puis mettez le texte en forme."
                    />
                    <p className="ops-field-help">Alignement à gauche par défaut</p>
                  </div>
                </div>
              </section>

              <section className="ops-editor-card">
                <h2>Référencement SEO</h2>
                <div className="ops-stack">
                  <label className="ops-field">
                    <span>Mot-clé principal</span>
                    <input
                      value={copy.keywords}
                      placeholder="merge PDF files"
                      onChange={(event) => patchCopy({ keywords: event.target.value })}
                    />
                  </label>
                  <label className="ops-field">
                    <span>Titre SEO</span>
                    <input
                      value={copy.seoTitle}
                      onChange={(event) => {
                        lockSeo('title');
                        patchCopy({ seoTitle: event.target.value });
                      }}
                    />
                    <em className={`ops-hint ops-hint-${lengthTone(copy.seoTitle.length, 50, 60)}`}>
                      {copy.seoTitle.length} caractères · recommandé 50 à 60
                    </em>
                  </label>
                  <label className="ops-field">
                    <span>Méta-description</span>
                    <textarea
                      rows={3}
                      value={copy.seoDescription}
                      onChange={(event) => {
                        lockSeo('description');
                        patchCopy({ seoDescription: event.target.value });
                      }}
                    />
                    <em className={`ops-hint ops-hint-${lengthTone(copy.seoDescription.length, 140, 160)}`}>
                      {copy.seoDescription.length} caractères · recommandé 140 à 160
                    </em>
                  </label>
                  <label className="ops-field">
                    <span>Slug</span>
                    <input
                      value={slug}
                      disabled={slugFrozen}
                      placeholder="généré depuis le titre"
                      onChange={(event) => {
                        setSlugTouched(true);
                        setSlug(event.target.value);
                      }}
                    />
                    {slugFrozen ? <em className="ops-field-help">Le slug d’un article publié n’est pas modifié automatiquement.</em> : null}
                  </label>
                  <div className="ops-google">
                    <strong>Aperçu Google indicatif</strong>
                    <p className="ops-google-url">one2pdf.com › blog › {previewSlug}</p>
                    <p className="ops-google-title">{copy.seoTitle || copy.title || 'Titre SEO'}</p>
                    <p className="ops-google-desc">{copy.seoDescription || copy.excerpt || 'La méta-description s’affiche ici.'}</p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="ops-editor-side">
              <section className="ops-editor-card">
                <h2>Publication</h2>
                <div className="ops-stack">
                  <label className="ops-field">
                    <span>Statut</span>
                    <select value={status} onChange={(event) => chooseStatus(event.target.value as BlogStatus)}>
                      <option value="draft">Brouillon</option>
                      <option value="scheduled">Programmé</option>
                      <option value="published">Publié</option>
                    </select>
                  </label>
                  {status === 'scheduled' ? (
                    <>
                      <label className="ops-field">
                        <span>Date</span>
                        <input
                          type="date"
                          value={schedule.date}
                          required
                          onChange={(event) => setPublishedLocal(joinLocal(event.target.value, schedule.time || '09:00'))}
                        />
                      </label>
                      <label className="ops-field">
                        <span>Heure</span>
                        <input
                          type="time"
                          value={schedule.time}
                          required
                          onChange={(event) => setPublishedLocal(joinLocal(schedule.date, event.target.value))}
                        />
                      </label>
                      <p className="ops-field-help">L’heure suit votre fuseau horaire. L’article sera publié automatiquement à ce moment.</p>
                    </>
                  ) : null}
                  <button type="submit" className="ops-primary ops-publish-btn" disabled={busy}>
                    {busy ? 'Enregistrement…' : actionLabel}
                  </button>
                </div>
              </section>

              <section className="ops-editor-card">
                <h2>Image de couverture</h2>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={uploadCover}
                />
                {coverImage ? (
                  <div
                    className="ops-cover-preview"
                    onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDropCover}
                  >
                    <img src={coverImage} alt={coverAlt || ''} />
                    <div className="ops-cover-actions">
                      <button type="button" onClick={() => fileRef.current?.click()}>Remplacer</button>
                      <button type="button" onClick={() => { setCoverImage(''); setCoverAlt(''); }}>Supprimer</button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`ops-drop ${dragOver ? 'ops-drop-on' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                    onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDropCover}
                  >
                    <strong>Ajouter une image</strong>
                    <span>JPG, PNG, WebP</span>
                  </div>
                )}
                <label className="ops-field" style={{ marginTop: '0.85rem' }}>
                  <span>Texte alternatif (ALT)</span>
                  <input
                    value={coverAlt}
                    placeholder="Description de l’image"
                    onChange={(event) => setCoverAlt(event.target.value)}
                  />
                </label>
              </section>

              <section className="ops-editor-card">
                <h2>Outil associé</h2>
                <label className="ops-field">
                  <span>Outil</span>
                  <select value={toolPath} onChange={(event) => applyTool(event.target.value)}>
                    <option value="">Aucun</option>
                    {ASSOCIATED_TOOLS.map((tool) => (
                      <option key={tool.path} value={tool.path}>{tool[locale]}</option>
                    ))}
                  </select>
                </label>
                {selectedTool ? (
                  <div className="ops-tool-auto">
                    <span>Bouton automatique</span>
                    <p className="ops-tool-btn">{toolButtonLabel(selectedTool[locale], locale)}</p>
                    <span>Lien généré automatiquement</span>
                    <code>{selectedTool.path}</code>
                  </div>
                ) : (
                  <p className="ops-field-help">Le bouton et le lien de l’article sont créés à partir de l’outil choisi.</p>
                )}
              </section>
            </aside>
          </div>

          {preview && (
            <div className="ops-preview" role="presentation" onClick={() => setPreview(false)}>
              <div
                className="ops-preview-card"
                role="dialog"
                aria-modal="true"
                aria-label="Aperçu de l’article"
                onClick={(event) => event.stopPropagation()}
              >
                <header>
                  <strong>Aperçu</strong>
                  <button type="button" className="ops-text-btn" onClick={() => setPreview(false)}>Fermer</button>
                </header>
                {coverImage ? <img className="ops-preview-cover" src={coverImage} alt={coverAlt || ''} /> : null}
                <h2>{copy.title || 'Sans titre'}</h2>
                {copy.excerpt ? <p>{copy.excerpt}</p> : null}
                <div className="ops-preview-body" dangerouslySetInnerHTML={{ __html: previewHtml(copy.bodyMarkdown) }} />
                <p className="ops-tool-btn">{copy.cta || (locale === 'fr' ? 'Essayer One2PDF' : 'Try One2PDF')}</p>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
