import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import './Legal.css';

function NotFound() {
  const { m } = useI18n();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = m.common.notFoundTitle;

    let robots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !robots;
    const previousRobots = robots?.getAttribute('content') ?? '';
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');

    return () => {
      document.title = previousTitle;
      if (created) robots?.remove();
      else if (previousRobots) robots?.setAttribute('content', previousRobots);
      else robots?.remove();
    };
  }, [m.common.notFoundTitle]);

  return (
    <main className="legal-page">
      <article className="legal-panel">
        <p className="legal-eyebrow">404</p>
        <h1>{m.common.notFoundHeading}</h1>
        <p>{m.common.notFoundText}</p>
        <p>
          <Link className="legal-mail" to="/">{m.common.notFoundHome}</Link>
        </p>
      </article>
    </main>
  );
}

export default NotFound;
