import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Fuse from 'fuse.js';
import { 
  Sprout, Coffee, Leaf, Wheat, FlaskConical, Package, 
  MapPin, ExternalLink, X, ChevronRight, TrendingUp, Search, ImageOff
} from 'lucide-react';

// Categories defined locally (no longer imported from products.js)
const categories = [
  { id: 'All', label: '🌍 All Products' },
  { id: 'Spices & Roots', label: '🌿 Spices & Roots' },
  { id: 'Rice', label: '🍚 Rice' },
  { id: 'Coffee', label: '☕ Coffee' },
  { id: 'Millets', label: '🌾 Millets' },
  { id: 'Fresh Produce', label: '🥬 Fresh Produce' },
  { id: 'Herbal / Powder', label: '🧪 Herbal / Powder' }
];

const ProductIcon = ({ category, size = 24 }) => {
  switch (category) {
    case 'Spices & Roots': return <Sprout size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'Fresh Produce': return <Leaf size={size} />;
    case 'Rice': return <Wheat size={size} />;
    case 'Millets': return <Wheat size={size} />;
    case 'Herbal / Powder': return <FlaskConical size={size} />;
    default: return <Package size={size} />;
  }
};

const Catalog = ({ searchQuery, activeCategory, setActiveCategory, selectedProduct, setSelectedProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        // Transform Supabase column names to match our UI expectations
        const transformed = (data || []).map(p => ({
          ...p,
          desc: p.description,
          uses: p.uses || [],
          specs: p.specs || [],
          valueAdd: p.value_add || [],
          imageUrl: p.image_url
        }));
        setProducts(transformed);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleEnquiry = (productName = 'General') => {
    const message = encodeURIComponent(`Hello Igniste, I am interested in inquiring about ${productName} products from your Agri Catalogue.`);
    window.open(`https://wa.me/918252668227?text=${message}`, '_blank');
  };

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'sci', 'desc', 'uses'],
      threshold: 0.4,
      distance: 100,
      ignoreLocation: true,
    });
  }, [products]);

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
  }, [activeCategory, searchQuery, fuse, products]);

  return (
    <React.Fragment>
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

      {/* Mobile horizontal category chips */}
      <div className="mobile-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`mobile-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

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
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading premium commodities...</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="card"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Product Image */}
                    <div className="card-image-wrapper">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="card-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="card-image-fallback">
                          <ProductIcon category={product.cat} size={48} />
                        </div>
                      )}
                      <span className="card-cat-overlay">{product.cat}</span>
                    </div>

                    {/* Product Details */}
                    <div className="card-body">
                      <h3 className="card-title">{product.name}</h3>
                      <div className="card-meta">
                        {product.region && (
                          <span className="card-region">
                            <MapPin size={12} />
                            {product.region}
                          </span>
                        )}
                      </div>
                      {product.sci && <p className="card-sci">{product.sci}</p>}
                      <p className="card-desc">{product.desc}</p>
                      <div className="card-footer-info">
                        <span className="learn-more">View Details <ChevronRight size={14} /></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="no-results card">
                  <Search size={64} style={{ opacity: 0.1, marginBottom: '24px' }} />
                  <h3>No matching commodities</h3>
                  <p>We couldn't find any products matching your current search or filters.</p>
                  <button 
                    className="nav-cta secondary" 
                    style={{ marginTop: '24px' }}
                    onClick={() => { setActiveCategory('All'); }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}><X size={20}/></button>
            
            {/* Modal Image */}
            {selectedProduct.imageUrl && (
              <div className="modal-image-wrapper">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="modal-image" />
              </div>
            )}

            <div className="modal-header">
              {!selectedProduct.imageUrl && (
                <div className="modal-icon-container">
                  <ProductIcon category={selectedProduct.cat} size={48} />
                </div>
              )}
              <div>
                <h2>{selectedProduct.name}</h2>
                <div className="modal-region-badge">
                  <MapPin size={12} style={{marginRight: '6px', display: 'inline', verticalAlign: 'middle'}}/>
                  {selectedProduct.region}
                </div>
                <p className="card-sci">{selectedProduct.sci}</p>
              </div>
            </div>

            <div className="modal-content">
              <div className="modal-section">
                <h4><TrendingUp size={16} /> Overview</h4>
                <p>{selectedProduct.desc}</p>

                {selectedProduct.uses?.length > 0 && (
                  <>
                    <h4 style={{ marginTop: '32px' }}><ExternalLink size={16} /> Key Uses</h4>
                    <ul className="modal-list">
                      {selectedProduct.uses.map((use, i) => (
                        <li key={i}>
                          <span className="list-dot"></span>
                          {use}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="modal-section">
                {selectedProduct.specs?.length > 0 && (
                  <>
                    <h4>Specifications</h4>
                    <div className="spec-grid">
                      {selectedProduct.specs.map(([k, v], i) => (
                        <div key={i} className="spec-item">
                          <span className="spec-label">{k}</span>
                          <span className="spec-value">{v}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selectedProduct.valueAdd?.length > 0 && (
                  <>
                    <h4 style={{ marginTop: '32px' }}>Trading Value Add</h4>
                    <ul className="modal-list va-list">
                      {selectedProduct.valueAdd.map((va, i) => (
                        <li key={i}>
                          <ChevronRight size={14} color="var(--primary)" />
                          {va}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="nav-cta" onClick={() => handleEnquiry(selectedProduct.name)}>Inquire About {selectedProduct.name}</button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Catalog;
