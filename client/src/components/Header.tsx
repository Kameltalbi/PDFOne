import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Header.css';
import pdfOneLogo from '../assets/pdfone-logo.png';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fromPDF = [
    { name: 'PDF en Word', path: '/pdf-to-word', icon: '📝' },
    { name: 'PDF en PPTX', path: '/pdf-to-pptx', icon: '📊' },
    { name: 'PDF en Excel', path: '/pdf-to-excel', icon: '📈' },
    { name: 'PDF en JPG', path: '/to-jpg', icon: '🖼️' },
    { name: 'PDF en PNG', path: '/to-png', icon: '🖼️' }
  ];

  const toPDF = [
    { name: 'Word en PDF', path: '/word-to-pdf', icon: '📝' },
    { name: 'PPTX en PDF', path: '/pptx-to-pdf', icon: '📊' },
    { name: 'Excel en PDF', path: '/excel-to-pdf', icon: '📈' },
    { name: 'JPG en PDF', path: '/jpg-to-pdf', icon: '🖼️' },
    { name: 'PNG en PDF', path: '/png-to-pdf', icon: '🖼️' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src={pdfOneLogo} alt="PDFOne" className="logo-image" />
        </Link>
        
        <nav className="nav">
          <div className="nav-dropdown" ref={dropdownRef}>
            <button 
              className="nav-link dropdown-toggle"
              onClick={toggleDropdown}
            >
              Convertir PDF
              <span className="dropdown-arrow">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-section">
                  <h4 className="dropdown-section-title">Convertir depuis un PDF</h4>
                  {fromPDF.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="dropdown-item-icon">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="dropdown-section">
                  <h4 className="dropdown-section-title">Convertir en PDF</h4>
                  {toPDF.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="dropdown-item-icon">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                  <Link 
                    to="/tools" 
                    className="dropdown-item see-all"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="dropdown-item-icon">📋</span>
                    Voir tout
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link to="/tools" className="nav-link">Tous les outils</Link>
          <Link to="/edit-pdf" className="nav-link">Modifier PDF</Link>
          <Link to="/merge" className="nav-link">Fusionner PDF</Link>
          <Link to="/compress" className="nav-link">Compresser</Link>
          <Link to="/protect" className="nav-link">Protéger</Link>
        </nav>

        <div className="header-actions">
          <button className="header-button login">Connexion</button>
          <button className="header-button signup">Inscription</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
