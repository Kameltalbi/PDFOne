import { Link } from 'react-router-dom';
import { getBlogPosts } from '../content/blog';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Legal.css';
import './Blog.css';

function Blog() {
  const { locale, m, t } = useI18n();
  usePageSeo(m.blogPage.seoTitle, m.blogPage.seoDescription);
  const posts = getBlogPosts(locale);

  return (
    <main className="blog-page">
      <div className="blog-wrap">
        <p className="legal-eyebrow">{m.common.blog}</p>
        <h1>{m.blogPage.title}</h1>
        <p className="blog-lead">{m.blogPage.subtitle}</p>
        <div className="blog-list">
          {posts.map((post) => (
            <Link key={post.slug} className="blog-card" to={`/blog/${post.slug}`}>
              <time dateTime={post.publishedIso}>{t(m.blogPage.publishedOn, { date: post.publishedLabel })}</time>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <span>{m.blogPage.readMore}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Blog;
