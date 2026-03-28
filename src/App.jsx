import React, { useState, useMemo } from 'react';
import { products, categories } from './data/products';
import logo from './assets/logo.png';
import Fuse from 'fuse.js';
import './index.css';

const App = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Form State for Admin
  const [form, setForm] = useState({
    name: '',
    sci: '',
    desc: '',
    cat: 'Organic',
    icon: '🌿',
    specs: [['Origin', ''], ['Quality', '']],
    uses: [''],
    valueAdd: ['']
  });

  const handleEnquiry = (productName = 'General') => {
    const message = encodeURIComponent(`Hello Igniste, I am interested in inquiring about ${productName} products from your Agri Catalogue.`);
    window.open(`https://wa.me/918252668227?text=${message}`, '_blank');
  };

  const handleDownload = () => {
    window.print();
  };

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'sci', 'desc', 'uses'],
      threshold: 0.4,
      distance: 100,
      ignoreLocation: true,
    });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => activeCategory === 'All' || p.cat === activeCategory);

    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      const searchNames = new Set(searchResults.map(r => r.item.name));
      result = result.filter(p => searchNames.has(p.name));
      
      const relevanceMap = new Map(searchResults.map((r, i) => [r.item.name, i]));
      result.sort((a, b) => (relevanceMap.get(a.name) ?? 99) - (relevanceMap.get(b.name) ?? 99));
    }

    return result;
  }, [activeCategory, searchQuery, fuse]);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo-container">
          <img src={logo} alt="Igniste Logo" className="logo-img" />
          <div className="logo-text">IGN<span>🔥</span>STE</div>
        </div>
        <div className="nav-right">
          <div className="contact-quick">
            <span className="contact-label">Quick Contact:</span>
            <span className="contact-number">+91 8252668227</span>
          </div>
          <button className="nav-cta secondary" onClick={() => setIsAdminMode(!isAdminMode)}>
            {isAdminMode ? 'View Catalogue' : 'Manage Products'}
          </button>
          {!isAdminMode && <button className="nav-cta secondary" onClick={handleDownload}>Download Catalogue</button>}
          <button className="nav-cta" onClick={() => handleEnquiry()}>Enquire Now</button>
        </div>
      </nav>

      {isAdminMode ? (
        <section className="admin-portal">
          <div className="admin-header">
            <h2>Product Management <em>Portal</em></h2>
            <p>Fill in the details to generate a new product entry for your catalogue.</p>
          </div>

          <div className="admin-grid">
            <div className="admin-form card">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Saffron" />
              </div>
              <div className="form-group">
                <label>Scientific Name</label>
                <input type="text" value={form.sci} onChange={e => setForm({...form, sci: e.target.value})} placeholder="e.g. Crocus sativus" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})}>
                  {categories.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} rows="3" placeholder="Premium description..."></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Specifications (Key: Value)</label>
                  {form.specs.map((spec, i) => (
                    <div key={i} className="dynamic-input">
                      <input type="text" value={spec[0]} onChange={e => {
                        const newSpecs = [...form.specs];
                        newSpecs[i][0] = e.target.value;
                        setForm({...form, specs: newSpecs});
                      }} placeholder="Key" />
                      <input type="text" value={spec[1]} onChange={e => {
                        const newSpecs = [...form.specs];
                        newSpecs[i][1] = e.target.value;
                        setForm({...form, specs: newSpecs});
                      }} placeholder="Value" />
                    </div>
                  ))}
                  <button className="add-btn" onClick={() => setForm({...form, specs: [...form.specs, ['', '']]})}>+ Add Spec</button>
                </div>
              </div>

              <div className="form-group">
                 <label>Preview & Export</label>
                 <button className="nav-cta" onClick={() => {
                   const cleanForm = {
                     ...form,
                     specs: form.specs.filter(s => s[0] && s[1]),
                     uses: form.uses.filter(u => u),
                     valueAdd: form.valueAdd.filter(v => v)
                   };
                   navigator.clipboard.writeText(JSON.stringify(cleanForm, null, 2));
                   alert('JSON copied to clipboard! Paste it into products.js');
                 }}>Copy Product JSON</button>
              </div>
            </div>

            <div className="admin-preview">
              <label>Live Preview</label>
              <div className="card active-preview">
                <span className="card-icon">{form.icon}</span>
                <h3 className="card-title">{form.name || 'Product' }</h3>
                <p className="card-sci">{form.sci || 'Scientific'}</p>
                <p className="card-desc">{form.desc || 'Description will appear here...'}</p>
                <div className="card-badges">
                  <span className="badge">{form.cat}</span>
                </div>
              </div>
              <div className="json-box">
                <pre>{JSON.stringify(form, null, 2)}</pre>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <React.Fragment>
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
              </div>
            </div>
          </header>

          <section className="company-band">
            <div className="cb-item">
              <span className="cb-label">Type</span>
              <span className="cb-value">Agri-Commodities Trading</span>
            </div>
            <div className="cb-item">
              <span className="cb-label">Range</span>
              <span className="cb-value">Organic & Conventional</span>
            </div>
            <div className="cb-item">
              <span className="cb-label">Model</span>
              <span className="cb-value">Farm-to-Buyer Direct</span>
            </div>
            <div className="cb-item">
              <span className="cb-label">Standards</span>
              <span className="cb-value">APEDA · FSSAI · EU 396/2005</span>
            </div>
          </section>

          <div className="app-container">
            <aside className="sidebar">
              <h3>Categories</h3>
              <div className="filter-group">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label}
                    <span className="count">
                      {products.filter(p => cat.id === 'All' || p.cat === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <main className="main-content">
              <div className="product-grid">
                {filteredProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="card"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <span className="card-icon">{product.icon}</span>
                    <h3 className="card-title">{product.name}</h3>
                    <p className="card-sci">{product.sci}</p>
                    <p className="card-desc">{product.desc}</p>
                    <div className="card-badges">
                      <span className="badge">{product.cat}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="no-results">
                  <span className="no-results-icon">🌱</span>
                  <p>No products found matching your criteria.</p>
                </div>
              )}
            </main>
          </div>

          {selectedProduct && (
            <div className="overlay" onClick={() => setSelectedProduct(null)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setSelectedProduct(null)}>&times;</button>
                <div className="modal-header">
                  <span className="modal-icon">{selectedProduct.icon}</span>
                  <div>
                    <h2>{selectedProduct.name}</h2>
                    <p className="card-sci">{selectedProduct.sci}</p>
                  </div>
                </div>

                <div className="modal-content">
                  <div className="modal-section">
                    <h4>Overview</h4>
                    <p>{selectedProduct.desc}</p>

                    <h4 style={{ marginTop: '30px' }}>Key Uses</h4>
                    <ul className="modal-list">
                      {selectedProduct.uses.map((use, i) => <li key={i}>{use}</li>)}
                    </ul>
                  </div>

                  <div className="modal-section">
                    <h4>Specifications</h4>
                    <div className="spec-grid">
                      {selectedProduct.specs.map(([k, v], i) => (
                        <div key={i} className="spec-item">
                          <span className="spec-label">{k}</span>
                          <span className="spec-value">{v}</span>
                        </div>
                      ))}
                    </div>

                    <h4 style={{ marginTop: '30px' }}>Value Add</h4>
                    <ul className="modal-list va-list">
                      {selectedProduct.valueAdd.map((va, i) => <li key={i}><span>→</span> {va}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="nav-cta" onClick={() => handleEnquiry(selectedProduct.name)}>Inquire About {selectedProduct.name}</button>
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      )}

      <footer className="footer">
        <p>© 2026 Igniste Private Limited. All Rights Reserved.</p>
      </footer>

      {/* Print-only section for complete catalogue */}
      <div className="print-only">
        <div className="print-header">
          <div className="print-brand">
            <img src={logo} alt="Logo" className="print-logo" />
            <div className="print-contact">
              <strong>Igniste Private Limited</strong><br />
              Contact: +91 8252668227
            </div>
          </div>
          <div className="print-title">
            <h1>Agri Products Catalogue</h1>
            <p>Premium Commodities · Verified Quality</p>
          </div>
        </div>
        {products.map((p, i) => (
          <div key={i} className="print-product">
            <h2>{p.name} ({p.sci})</h2>
            <p className="print-desc">{p.desc}</p>
            <div className="print-specs">
              {p.specs.map(([k, v], j) => (
                <div key={j}><strong>{k}:</strong> {v}</div>
              ))}
            </div>
            <div className="print-uses">
              <strong>Uses:</strong> {p.uses.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
