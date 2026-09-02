import { useEffect, useState, type FormEvent } from 'react';
import { opsRequest } from '../lib/ops';

type BlogLocale = 'fr' | 'en';

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
  status: 'draft' | 'published';
  publishedIso: string;
  locales: Partial<Record<BlogLocale, BlogCopy>>;
  updatedAt: string;
};

type PostSummary = {
  slug: string;
  status: 'draft' | 'published';
  publishedIso: string;
  updatedAt: string;
  title: string;
  locales: string[];
};

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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function InternalOpsBlog() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [slug, setSlug] = useState('');
  const [slugLocked, setSlugLocked] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [publishedIso, setPublishedIso] = useState(todayIso());
  const [locale, setLocale] = useState<BlogLocale>('fr');
  const [locales, setLocales] = useState<Record<BlogLocale, BlogCopy>>({
    fr: emptyCopy('fr'),
    en: emptyCopy('en')
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const copy = locales[locale];

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
    setPublishedIso(todayIso());
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
      setPublishedIso(post.publishedIso.slice(0, 10));
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

  const save = (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(null);
    void (async () => {
      try {
        const nextSlug = slugLocked ? slug : (slug || slugify(locales.fr.title || locales.en.title));
        const post = await opsRequest<StoredPost>('/api/admin/blog', {
          method: 'PUT',
          body: JSON.stringify({
            slug: nextSlug,
            status,
            publishedIso,
            locales
          })
        });
        setEditing(post.slug);
        setSlug(post.slug);
        setSlugLocked(true);
        setSaved(status === 'published' ? 'Publié. Visible tout de suite sur /blog.' : 'Brouillon enregistré.');
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
    <div className="ops-blog">
      <div className="ops-blog-head">
        <div>
          <h2>Articles</h2>
          <p className="ops-muted">
            Markdown simple : ## titre, ### sous-titre, - liste, 1. étapes, [texte](/compress).
            FR ou EN suffisent ; les autres langues reprennent l’anglais puis le français.
            Les deux guides d’origine restent dans le code.
          </p>
        </div>
        <button type="button" onClick={startNew} disabled={busy}>Nouvel article</button>
      </div>

      {error && <p className="ops-error">{error}</p>}
      {saved && <p className="ops-ok-msg">{saved}</p>}

      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Statut</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={4}><p>Aucun article ajouté pour l’instant.</p></td></tr>
            ) : posts.map((post) => (
              <tr key={post.slug}>
                <td>
                  <strong>{post.title}</strong>
                  <p>/blog/{post.slug} · {post.locales.join(', ') || '—'}</p>
                </td>
                <td>
                  <span className={post.status === 'published' ? 'ops-ok' : 'ops-off'}>
                    {post.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td>{post.publishedIso}</td>
                <td className="ops-actions">
                  <button type="button" onClick={() => void startEdit(post.slug)} disabled={busy}>Modifier</button>
                  <button type="button" className="ops-danger" onClick={() => remove(post.slug)} disabled={busy}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <form className="ops-blog-form" onSubmit={save}>
          <h2>{editing === 'new' ? 'Nouvel article' : `Modifier ${slug}`}</h2>
          <div className="ops-blog-meta">
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
              Date
              <input type="date" value={publishedIso} onChange={(event) => setPublishedIso(event.target.value)} />
            </label>
            <label>
              Statut
              <select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </label>
          </div>

          <div className="ops-presets">
            <button type="button" className={locale === 'fr' ? 'ops-tab-on' : ''} onClick={() => setLocale('fr')}>Français</button>
            <button type="button" className={locale === 'en' ? 'ops-tab-on' : ''} onClick={() => setLocale('en')}>English</button>
          </div>

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
            Chapô
            <textarea rows={3} value={copy.excerpt} onChange={(event) => patchCopy({ excerpt: event.target.value })} />
          </label>
          <div className="ops-blog-meta">
            <label>
              Titre SEO
              <input value={copy.seoTitle} onChange={(event) => patchCopy({ seoTitle: event.target.value })} />
            </label>
            <label>
              Description SEO
              <input value={copy.seoDescription} onChange={(event) => patchCopy({ seoDescription: event.target.value })} />
            </label>
          </div>
          <label>
            Mots-clés
            <input value={copy.keywords} onChange={(event) => patchCopy({ keywords: event.target.value })} />
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
          <label>
            Contenu
            <textarea
              className="ops-md"
              rows={16}
              value={copy.bodyMarkdown}
              onChange={(event) => patchCopy({ bodyMarkdown: event.target.value })}
              placeholder={'Premier paragraphe.\n\n## Titre\n\n- point\n- point\n\nAllez sur [Compresser un PDF](/compress).'}
              required={locale === 'fr' || Boolean(locales.en.bodyMarkdown)}
            />
          </label>
          <div className="ops-blog-save">
            <button type="submit" disabled={busy}>{busy ? 'Enregistrement…' : (status === 'published' ? 'Publier' : 'Enregistrer le brouillon')}</button>
            <button type="button" className="ops-ghost" onClick={resetForm}>Fermer</button>
          </div>
        </form>
      )}
    </div>
  );
}
