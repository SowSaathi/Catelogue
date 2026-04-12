import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import './index.css';
import Catalog from './pages/Catalog';

const App = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const popularSearches = ["Black Turmeric", "Ginger", "Rice", "Coffee"];

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo-container">
          <img src={logo} alt="Igniste Logo" className="logo-img" />
          <div className="logo-text">IGN<span>🔥</span>STE</div>
        </div>
        <button className="nav-toggle" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle menu">
          {navOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-right ${navOpen ? 'open' : ''}`}>
          <div className="contact-pill">
            <span className="contact-label">Quick Contact:</span>
            <span className="contact-number">+91 8252668227</span>
          </div>
          <button className="nav-cta" onClick={() => { 
            const message = encodeURIComponent(`Hello Igniste, I am interested in inquiring about products from your Agri Catalogue.`);
            window.open(`https://wa.me/918252668227?text=${message}`, '_blank');
            setNavOpen(false); 
          }}>Enquire Now</button>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="dot"></span>
            Igniste Private Limited
          </div>
          <h1>Premium Agri <em>Commodities</em></h1>
          <p>Connecting global buyers with verified, high-quality agricultural products directly from the source. Organic, sustainable, and supply-ready.</p>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search premium products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="popular-chips">
              <span>Popular:</span>
              {popularSearches.map(term => (
                <button 
                  key={term} 
                  className="chip-btn" 
                  onClick={() => setSearchQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Catalog */}
      <Catalog 
        searchQuery={searchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Igniste Private Limited. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;
