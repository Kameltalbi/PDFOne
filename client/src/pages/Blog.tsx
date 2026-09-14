import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mergeBlogPosts, blogCardLead, type BlogPost } from '../content/blog';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Legal.css';
import './Blog.css';

function Blog() {
  const { locale, m, t } = useI18n();
  usePageSeo(m.blogPage.seoTitle, m.blogPage.seoDescription);
  const [remote, setRemote] = useState<BlogPost[]>([]);
  const posts = mergeBlogPosts(locale, remote);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog?lang=${locale}`)
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
  }, [locale]);

  return (
    <main className="blog-page">
      <div className="blog-wrap">
        <p className="legal-eyebrow">{m.common.blog}</p>
        <h1>{m.blogPage.title}</h1>
        <p className="blog-lead">{m.blogPage.subtitle}</p>
        <div className="blog-list">
          {posts.map((post) => {
            const lead = blogCardLead(post);
            return (
              <Link key={post.slug} className="blog-card" to={`/blog/${post.slug}`}>
                {post.coverImage ? (
                  <img className="blog-card-cover" src={post.coverImage} alt="" />
                ) : null}
                <div className="blog-card-body">
                  <h2>{post.title}</h2>
                  <time dateTime={post.publishedIso}>{t(m.blogPage.publishedOn, { date: post.publishedLabel })}</time>
                  {lead ? <p>{lead}</p> : null}
                  <span>{m.blogPage.readMore}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Blog;
