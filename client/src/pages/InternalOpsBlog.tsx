import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { opsRequest } from '../lib/ops';
import { formatDate } from './opsShared';

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

const TOOL_LINKS = [
  { to: '/compress', label: 'Compresser un PDF' },
  { to: '/merge', label: 'Fusionner des PDF' },
  { to: '/split', label: 'Séparer un PDF' },
  { to: '/jpg-to-pdf', label: 'JPG vers PDF' },
  { to: '/pdf-to-word', label: 'PDF vers Word' },
  { to: '/ocr', label: 'OCR PDF' },
  { to: '/pricing', label: 'Tarifs Pro' }
];

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

function statusLabel(status: BlogStatus) {
  if (status === 'published') return 'Publié';
  if (status === 'scheduled') return 'Programmé';
  return 'Brouillon';
}

export default function InternalOpsBlog() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [filter, setFilter] = useState<BlogFilter>('all');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [slug, setSlug] = useState('');
  const [slugLocked, setSlugLocked] = useState(false);
  const [status, setStatus] = useState<BlogStatus>('draft');
  const [publishedLocal, setPublishedLocal] = useState(nowLocal());
  const [coverImage, setCoverImage] = useState('');
  const [internalLinks, setInternalLinks] = useState<string[]>([]);
  const [locale, setLocale] = useState<BlogLocale>('fr');
  const [locales, setLocales] = useState<Record<BlogLocale, BlogCopy>>({
    fr: emptyCopy('fr'),
    en: emptyCopy('en')
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const copy = locales[locale];
  const visible = useMemo(
    () => posts.filter((post) => filter === 'all' || post.status === filter),
    [posts, filter]
  );

  const loadList = async () => {
    const data = await opsRequest<{ posts: PostSummary[] }>('/api/admin/blog');
    setPosts(data.posts);
  };

  useEffect(() => {
    void loadList().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Impossible de charger les articles.');
    });
  }, []);

  const patchCopy = (patch: Partial<BlogCopy>) => {
    setLocales((current) => ({ ...current, [locale]: { ...current[locale], ...patch } }));
  };

  const resetForm = () => {
    setEditing(null);
    setSlug('');
    setSlugLocked(false);
    setStatus('draft');
    setPublishedLocal(nowLocal());
    setCoverImage('');
    setInternalLinks([]);
    setLocale('fr');
    setLocales({ fr: emptyCopy('fr'), en: emptyCopy('en') });
    setSaved(null);
  };

  const startNew = () => {
    resetForm();
    setEditing('new');
  };

  const startEdit = async (target: string) => {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const post = await opsRequest<StoredPost>(`/api/admin/blog/${encodeURIComponent(target)}`);
      setEditing(post.slug);
      setSlug(post.slug);
      setSlugLocked(true);
      setStatus(post.status);
      setPublishedLocal(toLocalInput(post.publishedIso) || nowLocal());
      setCoverImage(post.coverImage || '');
      setInternalLinks(post.internalLinks || []);
      setLocales({
        fr: { ...emptyCopy('fr'), ...(post.locales.fr || {}) },
        en: { ...emptyCopy('en'), ...(post.locales.en || {}) }
      });
      setLocale(post.locales.fr ? 'fr' : 'en');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally {
      setBusy(false);
    }
  };

  const toggleLink = (to: string) => {
    setInternalLinks((current) => (
      current.includes(to) ? current.filter((item) => item !== to) : [...current, to]
    ));
    if (!copy.bodyMarkdown.includes(`](${to})`)) {
      patchCopy({
        bodyMarkdown: `${copy.bodyMarkdown.trim()}\n\n[${TOOL_LINKS.find((item) => item.to === to)?.label || to}](${to})\n`
      });
    }
  };

  const uploadCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append('image', file);
    void opsRequest<{ url: string }>('/api/admin/blog/image', { method: 'POST', body })
      .then((data) => {
        setCoverImage(data.url);
        setSaved('Image téléversée sur One2PDF.');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Téléversement impossible.');
      })
      .finally(() => setBusy(false));
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(null);
    void (async () => {
      try {
        const sourceTitle = locales.fr.title.trim() || locales.en.title.trim();
        const nextSlug = slugify(slugLocked ? slug : (slug || sourceTitle));
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
            status,
            publishedIso: Number.isNaN(publishedAt.getTime()) ? undefined : publishedAt.toISOString(),
            coverImage,
            internalLinks,
            locales: packedLocales
          })
        });
        setEditing(post.slug);
        setSlug(post.slug);
        setSlugLocked(true);
        setStatus(post.status);
        if (post.status === 'scheduled') setSaved('Programmé. Il sera publié automatiquement à l’heure indiquée.');
        else if (post.status === 'published') setSaved('Publié. Visible tout de suite sur /blog.');
        else setSaved('Brouillon enregistré.');
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

  return (
    <div className="ops-pagebody">
      <div className="ops-pagehead">
        <div>
          <h1>Blog / Articles</h1>
          <p>Mini CMS : brouillons, programmation automatique et publication.</p>
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
        {saved && <p className="ops-ok-msg">{saved}</p>}
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

      {editing && (
        <form className="ops-panel ops-blog-form" onSubmit={save}>
          <h2>{editing === 'new' ? 'Nouvel article' : `Modifier ${slug}`}</h2>
          <div className="ops-blog-meta">
            <label>
              Titre
              <input
                value={copy.title}
                onChange={(event) => {
                  const title = event.target.value;
                  patchCopy({ title });
                  if (!slugLocked && locale === 'fr') setSlug(slugify(title));
                }}
                required={locale === 'fr' || Boolean(locales.en.title)}
              />
            </label>
            <label>
              Slug
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                disabled={slugLocked}
                placeholder="généré depuis le titre FR"
              />
            </label>
            <label>
              Mot-clé principal
              <input value={copy.keywords} onChange={(event) => patchCopy({ keywords: event.target.value })} placeholder="compresser PDF" />
            </label>
          </div>
          <div className="ops-blog-meta">
            <label>
              Titre SEO
              <input value={copy.seoTitle} onChange={(event) => patchCopy({ seoTitle: event.target.value })} maxLength={70} />
            </label>
            <label>
              Meta description
              <input value={copy.seoDescription} onChange={(event) => patchCopy({ seoDescription: event.target.value })} maxLength={170} />
            </label>
          </div>
          <div className="ops-blog-meta">
            <label>
              Date / heure de publication
              <input type="datetime-local" value={publishedLocal} onChange={(event) => setPublishedLocal(event.target.value)} />
            </label>
            <label>
              Statut
              <select value={status} onChange={(event) => setStatus(event.target.value as BlogStatus)}>
                <option value="draft">Brouillon</option>
                <option value="scheduled">Programmé</option>
                <option value="published">Publié</option>
              </select>
            </label>
            <label>
              Image de couverture
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadCover} />
            </label>
          </div>
          <p className="ops-muted">
            Téléversez une image : elle est stockée sur One2PDF (JPG, PNG, WebP ou GIF, 4 Mo max). Pas besoin d’hébergeur.
            Si le statut est « Publié » avec une date future, la publication est programmée automatiquement.
            Markdown : ## titre, ### sous-titre, - liste, [texte](/compress).
          </p>
          <div className="ops-presets">
            <button type="button" className={locale === 'fr' ? 'ops-tab-on' : ''} onClick={() => setLocale('fr')}>Français</button>
            <button type="button" className={locale === 'en' ? 'ops-tab-on' : ''} onClick={() => setLocale('en')}>English</button>
          </div>
          <label>
            Chapô
            <textarea rows={3} value={copy.excerpt} onChange={(event) => patchCopy({ excerpt: event.target.value })} />
          </label>
          <div className="ops-blog-meta">
            <label>
              Bouton
              <input value={copy.cta} onChange={(event) => patchCopy({ cta: event.target.value })} />
            </label>
            <label>
              Lien du bouton
              <input value={copy.ctaTo} onChange={(event) => patchCopy({ ctaTo: event.target.value })} placeholder="/compress" />
            </label>
          </div>
          <fieldset className="ops-links">
            <legend>Liens internes</legend>
            <div className="ops-presets">
              {TOOL_LINKS.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  className={internalLinks.includes(item.to) ? 'ops-tab-on' : ''}
                  onClick={() => toggleLink(item.to)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
          {coverImage && (
            <img className="ops-cover" src={coverImage} alt="" />
          )}
          <label>
            Contenu
            <textarea
              className="ops-md"
              rows={16}
              value={copy.bodyMarkdown}
              onChange={(event) => patchCopy({ bodyMarkdown: event.target.value })}
              placeholder={'Premier paragraphe.\n\n## Titre\n\n- point\n\nAllez sur [Compresser un PDF](/compress).'}
              required={locale === 'fr' || Boolean(locales.en.bodyMarkdown)}
            />
          </label>
          <div className="ops-blog-save">
            <button type="submit" disabled={busy}>
              {busy ? 'Enregistrement…' : (status === 'published' ? 'Publier' : status === 'scheduled' ? 'Programmer' : 'Enregistrer le brouillon')}
            </button>
            <button type="button" className="ops-ghost" onClick={resetForm}>Fermer</button>
          </div>
        </form>
      )}
    </div>
  );
}
