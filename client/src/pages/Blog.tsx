import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mergeBlogPosts, type BlogPost } from '../content/blog';
import { useI18n } from '../i18n';
import { dictionaries } from '../i18n/dictionaries';
import { localizedPath, urlLocaleFromPath } from '../i18n/localePath';
import { usePageSeo } from '../lib/usePageSeo';
import './Legal.css';
import './Blog.css';

function Blog() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const urlLocale = urlLocaleFromPath(pathname);
  const page = dictionaries[urlLocale].blogPage;
  usePageSeo(page.seoTitle, page.seoDescription);
  const [remote, setRemote] = useState<BlogPost[]>([]);
  const posts = mergeBlogPosts(urlLocale, remote);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog?lang=${urlLocale}`)
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled && payload.success) setRemote(payload.data?.posts || []);
      })
      .catch(() => {
        if (!cancelled) setRemote([]);
      });
    return () => {
      cancelled = true;
    };
  }, [urlLocale]);

  return (
    <main className="blog-page">
      <div className="blog-wrap blog-index">
        <p className="legal-eyebrow">{dictionaries[urlLocale].common.blog}</p>
        <h1>{page.title}</h1>
        <p className="blog-lead">{page.subtitle}</p>
        <div className="blog-list">
          {posts.map((post) => (
            <Link key={post.slug} className="blog-card" to={localizedPath(`/blog/${post.slug}`, urlLocale)}>
              {post.coverImage ? (
                <img className="blog-card-cover" src={post.coverImage} alt="" />
              ) : null}
              <div className="blog-card-body">
                <h2>{post.title}</h2>
                <time dateTime={post.publishedIso}>{t(page.publishedOn, { date: post.publishedLabel })}</time>
                <span>{page.readMore}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Blog;
