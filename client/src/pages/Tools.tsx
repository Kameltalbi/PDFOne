import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Tools.css';

type Tool = { name: string; path?: string; icon: string; color: string; badge?: 'Nouveau' | 'Bientôt'; keywords?: string };

const popularTools: Tool[] = [
  { name: 'Modifier PDF', path: '/edit-pdf', icon: '📝', color: '#f59e0b', badge: 'Nouveau', keywords: 'éditer texte dessiner' },
  { name: 'Compresser PDF', path: '/compress', icon: '⇊', color: '#f05b43' },
  { name: 'Fusionner PDF', path: '/merge', icon: '📂', color: '#f59e0b' },
  { name: 'PDF en Word', path: '/pdf-to-word', icon: 'W', color: '#2684ff' },
  { name: 'Word en PDF', path: '/word-to-pdf', icon: 'W', color: '#2684ff' },
  { name: 'PDF en JPG', path: '/to-jpg', icon: 'JPG', color: '#7c5cff' },
  { name: 'JPG en PDF', icon: '▧', color: '#7c5cff', badge: 'Bientôt' },
  { name: 'PDF en Excel', path: '/pdf-to-excel', icon: 'X', color: '#18a957' },
  { name: 'Protéger PDF', path: '/protect', icon: '✓', color: '#3b82f6' },
  { name: 'Diviser PDF', icon: '✂', color: '#252525', badge: 'Bientôt' },
  { name: 'Pivoter PDF', icon: '↻', color: '#31b524', badge: 'Bientôt' },
  { name: 'Signer PDF', icon: '✍', color: '#292929', badge: 'Bientôt' },
  { name: 'Supprimer des pages', icon: '🗑', color: '#333333', badge: 'Bientôt' },
  { name: 'Réorganiser les pages', icon: '▦', color: '#f59e0b', badge: 'Bientôt' }
];

const otherTools: Tool[] = [
  { name: 'PDF OCR', icon: 'OCR', color: '#374151', badge: 'Bientôt' },
  { name: 'Résumer un PDF', icon: '☷', color: '#54b92f', badge: 'Bientôt' },
  { name: 'Traduire le PDF', icon: 'A文', color: '#ef5b45', badge: 'Bientôt' },
  { name: 'PNG en PDF', icon: 'PNG', color: '#27b51c', badge: 'Bientôt' },
  { name: 'PDF en PNG', icon: '⇩', color: '#27b51c', badge: 'Bientôt' },
  { name: 'Déverrouiller PDF', icon: '🔓', color: '#333333', badge: 'Bientôt' },
  { name: 'Rogner PDF', icon: '⌗', color: '#333333', badge: 'Bientôt' },
  { name: 'Ajouter un filigrane', icon: 'W', color: '#0ea5e9', badge: 'Bientôt' },
  { name: 'Numéroter les pages', icon: '#', color: '#6366f1', badge: 'Bientôt' },
  { name: 'PDF en PowerPoint', icon: 'P', color: '#f05b43', badge: 'Bientôt' },
  { name: 'PowerPoint en PDF', icon: 'P', color: '#f05b43', badge: 'Bientôt' },
  { name: 'PDF en texte', icon: 'TXT', color: '#2684ff', badge: 'Bientôt' },
  { name: 'Images en PDF', icon: 'IMG', color: '#ef5b45', badge: 'Bientôt' },
  { name: 'HTML en PDF', icon: '</>', color: '#7c5cff', badge: 'Bientôt' }
];

function ToolCard({ tool }: { tool: Tool }) {
  const content = <>{tool.badge && <span className={`pdf-tool-badge ${tool.badge === 'Nouveau' ? 'new' : ''}`}>{tool.badge}</span>}<span className="pdf-tool-icon" style={{ color: tool.color, borderColor: tool.color }} aria-hidden="true">{tool.icon}</span><span className="pdf-tool-name">{tool.name}</span></>;
  return tool.path ? <Link className="pdf-tool-card" to={tool.path}>{content}</Link> : <div className="pdf-tool-card unavailable" aria-disabled="true">{content}</div>;
}

function Tools() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const filterTools = (tools: Tool[]) => tools.filter((tool) => `${tool.name} ${tool.keywords || ''}`.toLocaleLowerCase('fr').includes(normalizedQuery));
  const popular = useMemo(() => filterTools(popularTools), [normalizedQuery]);
  const others = useMemo(() => filterTools(otherTools), [normalizedQuery]);

  return <main className="pdf-tools-page">
    <section className="pdf-tools-intro">
      <p className="pdf-tools-eyebrow">TOUS VOS OUTILS AU MÊME ENDROIT</p><h1>Outils PDF en ligne</h1><p>Modifiez, convertissez et organisez vos documents simplement.</p>
      <label className="pdf-tools-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un outil PDF…" aria-label="Rechercher un outil PDF" />{query && <button onClick={() => setQuery('')} aria-label="Effacer la recherche">×</button>}</label>
    </section>
    <div className="pdf-tools-content">
      {popular.length > 0 && <section className="pdf-tool-section"><h2>Outils PDF populaires</h2><div className="pdf-tools-grid">{popular.map((tool) => <ToolCard key={tool.name} tool={tool} />)}</div></section>}
      {others.length > 0 && <section className="pdf-tool-section"><h2>Autres outils PDF</h2><div className="pdf-tools-grid">{others.map((tool) => <ToolCard key={tool.name} tool={tool} />)}</div></section>}
      {popular.length + others.length === 0 && <div className="pdf-tools-empty"><span>⌕</span><h2>Aucun outil trouvé</h2><p>Essayez un autre mot-clé.</p></div>}
    </div>
  </main>;
}

export default Tools;
