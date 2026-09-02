import { Link, Navigate, useParams } from 'react-router-dom';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { getBlogPost, type BlogBlock, type BlogPost, type InlinePart } from '../content/blog';
import { useI18n } from '../i18n';
import { pageUrl, useJsonLd } from '../lib/jsonLd';
import { usePageSeo } from '../lib/usePageSeo';
import './Legal.css';
import './Blog.css';

function renderInline(parts: InlinePart[]): ReactNode {
  return parts.map((part, index) => {
    if (typeof part === 'string') return <Fragment key={index}>{part}</Fragment>;
    return <Link key={index} to={part.to}>{part.text}</Link>;
  });
}

function renderBlock(block: BlogBlock, index: number): ReactNode {
  if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>;
  if (block.type === 'h3') return <h3 key={index}>{block.text}</h3>;
  if (block.type === 'p') {
    if ('parts' in block) {
      return <p key={index}>{renderInline(block.parts)}</p>;
    }
    return <p key={index}>{block.text}</p>;
  }
  if (block.type === 'ul') {
    return (
      <ul key={index}>
        {block.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  return (
    <ol key={index}>
      {block.items.map((item, itemIndex) => (
        <li key={itemIndex}>{typeof item === 'string' ? item : renderInline(item)}</li>
      ))}
    </ol>
  );
}

function BlogPostPage() {
  const { slug } = useParams();
  const { locale, m, t } = useI18n();
  const builtin = slug ? getBlogPost(locale, slug) : undefined;
  const [remote, setRemote] = useState<BlogPost | null>(null);
  const [ready, setReady] = useState(!slug);
  const post = remote || builtin;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setReady(false);
    setRemote(null);
    fetch(`/api/blog/${encodeURIComponent(slug)}?lang=${locale}`)
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        setRemote(payload.success ? payload.data : null);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setRemote(null);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, locale]);

  usePageSeo(post?.seoTitle, post?.seoDescription);
  useJsonLd(post ? `blog-${post.slug}` : 'blog-none', post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.publishedIso,
    inLanguage: locale === 'fr' ? 'fr-CA' : 'en',
    keywords: post.keywords,
    url: pageUrl(`/blog/${post.slug}`),
    author: { '@type': 'Organization', name: 'One2PDF', legalName: '9545-8907 QUEBEC INC.' },
    publisher: { '@type': 'Organization', name: 'One2PDF', legalName: '9545-8907 QUEBEC INC.' }
  } : null);

  if (!post) {
    if (!ready) {
      return (
        <main className="blog-page">
          <article className="blog-wrap blog-article">
            <p>…</p>
          </article>
        </main>
      );
    }
    return <Navigate to="/blog" replace />;
  }

  return (
    <main className="blog-page">
      <article className="blog-wrap blog-article">
        <Link className="blog-back" to="/blog">{m.blogPage.back}</Link>
        <p className="legal-eyebrow">{m.common.blog}</p>
        <h1>{post.title}</h1>
        <time dateTime={post.publishedIso}>{t(m.blogPage.publishedOn, { date: post.publishedLabel })}</time>
        {post.body.map(renderBlock)}
        <Link className="blog-cta" to={post.ctaTo}>{post.cta}</Link>
      </article>
    </main>
  );
}

export default BlogPostPage;
