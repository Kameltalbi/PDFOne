import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { stripLocalePrefix } from '../i18n/localePath';
import { RELATED_TOOLS, TOOL_PATH_ALIAS, toolLabel } from '../lib/relatedTools';
import { Link } from './LocaleLink';
import './Studio.css';

export function RelatedTools() {
  const { pathname } = useLocation();
  const { m } = useI18n();
  const bare = stripLocalePrefix(pathname);
  const path = TOOL_PATH_ALIAS[bare] ?? bare;
  const links = RELATED_TOOLS[path];
  if (!links?.length) return null;

  return (
    <nav className="studio-related" aria-label={m.common.relatedTools}>
      <h2>{m.common.relatedTools}</h2>
      <ul>
        {links.map((to) => (
          <li key={to}>
            <Link to={to}>{toolLabel(to, m)}</Link>
          </li>
        ))}
        <li>
          <Link to="/tools">{m.nav.allTools}</Link>
        </li>
      </ul>
    </nav>
  );
}
