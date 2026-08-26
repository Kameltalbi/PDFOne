import { Link } from 'react-router-dom';
import './Home.css';
import pdfOneLogo from '../assets/pdfone-logo.png';
import heroImage from '../assets/pdf-editor-hero.jpg';

const tools = [
  { name: 'Modifier PDF', description: 'Texte, images, signature et annotations.', icon: 'T', path: '/edit-pdf', tone: 'red' },
  { name: 'Fusionner PDF', description: 'Réunissez plusieurs PDF dans le bon ordre.', icon: '⇄', path: '/merge', tone: 'orange' },
  { name: 'Compresser PDF', description: 'Réduisez le poids sans sacrifier la qualité.', icon: '⇊', path: '/compress', tone: 'blue' },
  { name: 'PDF en Word', description: 'Transformez vos PDF en documents éditables.', icon: 'W', path: '/pdf-to-word', tone: 'blue' },
  { name: 'PDF en Excel', description: 'Récupérez vos tableaux dans un classeur.', icon: 'X', path: '/pdf-to-excel', tone: 'green' },
  { name: 'Protéger PDF', description: 'Sécurisez vos fichiers et vos informations.', icon: '✓', path: '/protect', tone: 'orange' }
];

function Home() {
  return <div className="pro-home">
    <main>
      <section className="pro-hero">
        <div className="pro-hero-glow one" /><div className="pro-hero-glow two" />
        <div className="pro-hero-inner">
          <div className="pro-hero-copy">
            <span className="pro-eyebrow"><i /> SIMPLE, RAPIDE ET SÉCURISÉ</span>
            <h1>Vos documents PDF,<br /><span>enfin simples à gérer.</span></h1>
            <p>Modifiez, convertissez, fusionnez et protégez vos fichiers avec une suite d’outils professionnelle accessible directement depuis votre navigateur.</p>
            <div className="pro-hero-actions">
              <Link to="/edit-pdf" className="pro-btn primary">Modifier un PDF <span>→</span></Link>
              <Link to="/tools" className="pro-btn secondary">Découvrir tous les outils</Link>
            </div>
            <div className="pro-trust-row"><span>✓ Sans installation</span><span>✓ Jusqu’à 100 Mo</span><span>✓ Fichiers supprimés automatiquement</span></div>
          </div>

          <div className="pro-product-visual" aria-label="Aperçu de l’éditeur PDFOne">
            <div className="pro-hero-photo"><img src={heroImage} alt="Professionnelle utilisant l’éditeur de documents PDFOne" /></div>
            <div className="pro-floating-card secure"><span>✓</span><div><b>Document sécurisé</b><small>Traitement protégé</small></div></div>
            <div className="pro-floating-card fast"><span>⚡</span><div><b>Prêt en quelques secondes</b><small>Aucune installation</small></div></div>
          </div>
        </div>
      </section>

      <section className="pro-tools-section">
        <div className="pro-section-heading"><div><span>OUTILS POPULAIRES</span><h2>Tout ce qu’il faut pour travailler avec vos PDF</h2></div><Link to="/tools">Voir tous les outils <b>→</b></Link></div>
        <div className="pro-tools-grid">{tools.map((tool) => <Link key={tool.name} to={tool.path} className="pro-tool-card"><span className={`pro-tool-icon ${tool.tone}`}>{tool.icon}</span><div><h3>{tool.name}</h3><p>{tool.description}</p></div><b className="pro-tool-arrow">→</b></Link>)}</div>
      </section>

      <section className="pro-process">
        <div className="pro-process-copy"><span className="pro-section-label">UNE EXPÉRIENCE SANS FRICTION</span><h2>Du fichier au résultat<br />en trois étapes.</h2><p>Une interface claire pensée pour vous faire gagner du temps, quel que soit votre appareil.</p><Link to="/edit-pdf" className="pro-text-link">Essayer l’éditeur PDF <span>→</span></Link></div>
        <div className="pro-steps">
          <article><span>01</span><div><h3>Choisissez votre fichier</h3><p>Importez votre PDF par sélection ou glisser-déposer.</p></div></article>
          <article><span>02</span><div><h3>Appliquez vos modifications</h3><p>Utilisez des outils précis avec un aperçu instantané.</p></div></article>
          <article><span>03</span><div><h3>Téléchargez le résultat</h3><p>Récupérez un document prêt à partager en quelques secondes.</p></div></article>
        </div>
      </section>

      <section className="pro-values">
        <article><span>⌁</span><h3>Rapide par conception</h3><p>Des traitements optimisés pour ne pas ralentir votre journée.</p></article>
        <article><span>◈</span><h3>Respect de vos données</h3><p>Vos fichiers temporaires sont supprimés automatiquement.</p></article>
        <article><span>◎</span><h3>Accessible partout</h3><p>Une expérience fluide sur ordinateur, tablette et mobile.</p></article>
        <article><span>◇</span><h3>Une qualité professionnelle</h3><p>Des exports fidèles, prêts pour vos usages quotidiens.</p></article>
      </section>

      <section className="pro-final-cta"><div><span>PRÊT À COMMENCER ?</span><h2>Votre prochain PDF est déjà plus simple.</h2><p>Découvrez tous les outils PDFOne et avancez sans perdre de temps.</p></div><Link to="/tools" className="pro-btn light">Explorer les outils <span>→</span></Link></section>
    </main>

    <footer className="pro-footer"><div className="pro-footer-top"><Link to="/" className="pro-footer-logo"><img src={pdfOneLogo} alt="PDFOne" /></Link><p>La boîte à outils PDF simple et professionnelle.</p><nav><Link to="/tools">Tous les outils</Link><Link to="/edit-pdf">Modifier PDF</Link><Link to="/privacy">Confidentialité</Link><Link to="/contact">Contact</Link></nav></div><div className="pro-footer-bottom"><span>© 2026 PDFOne. Tous droits réservés.</span><span>Vos fichiers sont supprimés automatiquement après traitement.</span></div></footer>
  </div>;
}

export default Home;
