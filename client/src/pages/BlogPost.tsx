import { Link, Navigate, useParams } from 'react-router-dom';
import { getBlogPost } from '../content/blog';
import { useI18n } from '../i18n';
import { usePageSeo } from '../lib/usePageSeo';
import './Legal.css';
import './Blog.css';

function BlogPostPage() {
  const { slug } = useParams();
  const { locale, m, t } = useI18n();
  const post = slug ? getBlogPost(locale, slug) : undefined;
  usePageSeo(post?.seoTitle, post?.seoDescription);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <main className="blog-page">
      <article className="blog-wrap blog-article">
        <Link className="blog-back" to="/blog">{m.blogPage.back}</Link>
        <p className="legal-eyebrow">{m.common.blog}</p>
        <h1>{post.title}</h1>
        <time dateTime={post.publishedIso}>{t(m.blogPage.publishedOn, { date: post.publishedLabel })}</time>
        <p>{post.intro}</p>

        <h2>{post.h2Why}</h2>
        <p>{post.whyLead}</p>
        <h3>{post.whyImagesTitle}</h3>
        <p>{post.whyImages}</p>
        <h3>{post.whyPagesTitle}</h3>
        <p>{post.whyPages}</p>

        <h2>{post.h2Solution}</h2>
        <p>{post.solutionLead}</p>
        <h3>{post.stepsTitle}</h3>
        <ol>
          <li>
            {post.step1Before}
            <Link to="/compress">{post.compressLabel}</Link>
            {post.step1After}
          </li>
          {post.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <h2>{post.h2Bonus}</h2>
        <h3>{post.bonusMergeTitle}</h3>
        <p>
          {post.bonusMerge}{' '}
          <Link to="/merge">{locale === 'fr' ? 'Fusionner des PDF' : 'Merge PDFs'}</Link>
        </p>
        <h3>{post.bonusImagesTitle}</h3>
        <p>
          {post.bonusImages}{' '}
          <Link to="/jpg-to-pdf">{locale === 'fr' ? 'JPG vers PDF' : 'JPG to PDF'}</Link>
        </p>

        <p>{post.conclusion}</p>
        <Link className="blog-cta" to="/compress">{post.cta}</Link>
      </article>
    </main>
  );
}

export default BlogPostPage;
