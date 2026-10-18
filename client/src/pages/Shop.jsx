import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Badge, Spinner, EmptyState, Input } from '../components/ui';

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL search params
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'all';

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [priceMax, setPriceMax] = useState(350);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Sync category state with URL parameter changes
  useEffect(() => {
    const cat = new URLSearchParams(location.search).get('category') || 'all';
    setSelectedCategory(cat);
    setCurrentPage(1);
  }, [location.search]);

  // Fetch products from backend API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get('/api/products');
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load catalog products:', err);
        setError('Failed to fetch performance gear. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category Filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Brand Filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }
      // Skill Level Filter
      if (selectedSkill !== 'all' && product.skillLevel !== selectedSkill) {
        return false;
      }
      // Price Filter
      if (product.price > priceMax) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesBrand = product.brand?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      // default 'featured'
      return 0;
    });
  }, [products, selectedCategory, selectedBrand, selectedSkill, priceMax, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Available brands derived dynamically
  const availableBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand).filter(Boolean));
    return ['all', ...Array.from(brands)];
  }, [products]);

  // Quick Add handler to update local storage cart
  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('ami_cart');
      const cart = stored ? JSON.parse(stored) : [];
      const image = Array.isArray(product.images) ? product.images[0] : product.images;
      const existingIndex = cart.findIndex((item) => item.productId === product._id);

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: image || 'https://picsum.photos/seed/stick1/600/600',
          quantity: 1,
          variant: product.sizes?.[0] || 'Standard'
        });
      }

      localStorage.setItem('ami_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedSkill('all');
    setPriceMax(350);
    setSearchQuery('');
    setSortBy('featured');
    setCurrentPage(1);
    navigate('/shop');
  };

  return (
    <div className="shop-page">
      {/* 1. Page Header Hero */}
      <section className="catalog-hero-header">
        <div className="container">
          <div className="catalog-hero-content">
            <span className="eyebrow">MATCH-READY PERFORMANCE CATALOG</span>
            <h1>ENGINEERED <span className="gradient-text">TURF</span> & COURT GEAR</h1>
            <p className="catalog-hero-subtitle">
              Browse precision field hockey sticks, padel control rackets, and match-day protective kit calibrated for maximum ball control and durability.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="section catalog-main-section">
        <div className="container">
          <div className="catalog-layout">
            
            {/* Sidebar Filters */}
            <aside className="catalog-sidebar">
              <div className="filter-card">
                <div className="filter-header">
                  <h3>FILTERS</h3>
                  <button className="btn-link" onClick={handleClearFilters}>Clear All</button>
                </div>

                <div className="whistle-divider"></div>

                {/* Search Bar */}
                <div className="filter-group">
                  <label className="filter-label">Search Equipment</label>
                  <Input 
                    type="text" 
                    placeholder="Search by stick, brand..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* Category Filter */}
                <div className="filter-group">
                  <label className="filter-label">Category</label>
                  <div className="filter-pill-stack">
                    <button 
                      className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                    >
                      All Equipment
                    </button>
                    <button 
                      className={`filter-pill ${selectedCategory === 'hockey-sticks' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('hockey-sticks'); setCurrentPage(1); }}
                    >
                      Hockey Sticks
                    </button>
                    <button 
                      className={`filter-pill ${selectedCategory === 'paddle-rackets' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('paddle-rackets'); setCurrentPage(1); }}
                    >
                      Paddle Rackets
                    </button>
                    <button 
                      className={`filter-pill ${selectedCategory === 'kit-apparel' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('kit-apparel'); setCurrentPage(1); }}
                    >
                      Kit & Apparel
                    </button>
                  </div>
                </div>

                {/* Skill Level Filter */}
                <div className="filter-group">
                  <label className="filter-label">Skill Level</label>
                  <div className="filter-pill-stack">
                    <button 
                      className={`filter-pill ${selectedSkill === 'all' ? 'active' : ''}`}
                      onClick={() => { setSelectedSkill('all'); setCurrentPage(1); }}
                    >
                      Any Level
                    </button>
                    <button 
                      className={`filter-pill ${selectedSkill === 'beginner' ? 'active' : ''}`}
                      onClick={() => { setSelectedSkill('beginner'); setCurrentPage(1); }}
                    >
                      Beginner / Academy
                    </button>
                    <button 
                      className={`filter-pill ${selectedSkill === 'intermediate' ? 'active' : ''}`}
                      onClick={() => { setSelectedSkill('intermediate'); setCurrentPage(1); }}
                    >
                      Intermediate
                    </button>
                    <button 
                      className={`filter-pill ${selectedSkill === 'pro' ? 'active' : ''}`}
                      onClick={() => { setSelectedSkill('pro'); setCurrentPage(1); }}
                    >
                      Pro / Elite
                    </button>
                  </div>
                </div>

                {/* Brand Selector */}
                <div className="filter-group">
                  <label className="filter-label">Brand</label>
                  <select 
                    className="filter-select"
                    value={selectedBrand}
                    onChange={(e) => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
                  >
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand === 'all' ? 'All Brands' : brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Slider */}
                <div className="filter-group">
                  <div className="price-slider-head">
                    <label className="filter-label">Max Price</label>
                    <span className="price-value">${priceMax}</span>
                  </div>
                  <input 
                    type="range" 
                    min="30" 
                    max="350" 
                    step="10"
                    value={priceMax} 
                    onChange={(e) => { setPriceMax(Number(e.target.value)); setCurrentPage(1); }}
                    className="price-range-input"
                  />
                  <div className="price-labels">
                    <span>$30</span>
                    <span>$350</span>
                  </div>
                </div>

              </div>
            </aside>

            {/* Catalog Main Content */}
            <main className="catalog-content">
              
              {/* Sort & Count Bar */}
              <div className="catalog-control-bar">
                <div className="result-counter">
                  Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}
                </div>

                <div className="sort-wrapper">
                  <label htmlFor="sort-select">Sort By:</label>
                  <select 
                    id="sort-select"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Featured Picks</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Product Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Loader State */}
              {loading && (
                <div className="loader-container">
                  <Spinner size="lg" color="primary" />
                  <p>Loading performance gear from AMI warehouse...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="alert alert-error mb-6">
                  <p>{error}</p>
                </div>
              )}

              {/* Empty Grid State */}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="catalog-empty-wrapper">
                  <EmptyState 
                    icon="🏑"
                    title="NOTHING ON THE SHELF FOR THAT — YET"
                    description="No gear matches those filters. Try widening your price range, clearing your search query, or selecting a different skill level."
                    action={<Button onClick={handleClearFilters}>Reset Catalog Filters</Button>}
                  />
                </div>
              )}

              {/* Product Grid */}
              {!loading && !error && paginatedProducts.length > 0 && (
                <>
                  <div className="grid grid-3 product-catalog-grid">
                    {paginatedProducts.map((product) => {
                      const imgUrl = Array.isArray(product.images) 
                        ? product.images[0] 
                        : (product.images || 'https://picsum.photos/seed/stick1/600/600');

                      return (
                        <div 
                          key={product._id} 
                          className="product-card card animate-in"
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          <div className="product-card-image-wrap">
                            <img 
                              src={imgUrl} 
                              alt={product.name} 
                              className="product-card-img"
                              loading="lazy"
                            />
                            
                            {/* Corner Ribbon Badge */}
                            {product.skillLevel && (
                              <div className="skill-corner-badge">
                                {product.skillLevel.toUpperCase()}
                              </div>
                            )}

                            {/* Floating Price Pill */}
                            <div className="floating-price-pill">
                              ${product.price}
                            </div>
                          </div>

                          <div className="product-card-content">
                            <div className="product-meta-row">
                              <span className="brand-tag">{product.brand || 'AMI TURF'}</span>
                              <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                              </Badge>
                            </div>

                            <h3 className="product-title">{product.name}</h3>
                            <p className="product-desc-teaser">
                              {(product.description || '').slice(0, 75)}...
                            </p>

                            <div className="product-card-actions">
                              <Button 
                                variant="primary" 
                                fullWidth 
                                disabled={product.stock <= 0}
                                onClick={(e) => handleQuickAdd(e, product)}
                              >
                                {product.stock > 0 ? 'QUICK ADD' : 'SOLD OUT'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination-bar">
                      <Button 
                        variant="ghost" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      >
                        « Previous
                      </Button>

                      <div className="pagination-pages">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <Button 
                        variant="ghost" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      >
                        Next »
                      </Button>
                    </div>
                  )}
                </>
              )}

            </main>
          </div>
        </div>
      </section>

      {/* 2. Skill Level Guidance Strip Section */}
      <section className="section skill-guide-banner">
        <div className="container">
          <div className="whistle-divider mb-8"></div>
          <div className="section-head text-center">
            <span className="eyebrow">FIT BY SKILL LEVEL</span>
            <h2>CHOOSE YOUR SPEC. DOMINATE THE MATCH.</h2>
            <p className="max-w-2xl mx-auto">
              Not sure which carbon percentage or head shape matches your position? We engineer sticks for every stage of your match development.
            </p>
          </div>

          <div className="grid grid-3 guide-grid mt-8">
            <div className="guide-card card">
              <span className="step-num">01</span>
              <h3>ACADEMY / BEGINNER</h3>
              <p>
                Flexible composite construction designed for forgiving ball reception, softer first-touch control, and effortless push passing mechanics.
              </p>
              <div className="guide-tags">
                <span className="tag">Wood/Fiberglass</span>
                <span className="tag">Soft Touch</span>
              </div>
            </div>

            <div className="guide-card card">
              <span className="step-num">02</span>
              <h3>INTERMEDIATE</h3>
              <p>
                Balanced 50-70% carbon weave giving players enhanced flick power and quicker stick turnover without sacrificing control on heavy receptions.
              </p>
              <div className="guide-tags">
                <span className="tag">50-70% Carbon</span>
                <span className="tag">Mid Bow</span>
              </div>
            </div>

            <div className="guide-card card">
              <span className="step-num">03</span>
              <h3>ELITE / PRO SPEC</h3>
              <p>
                Ultra-stiff 90-100% Japanese Toray carbon layups optimized for high-velocity drag-flicks, violent reverse shots, and supreme ball speed.
              </p>
              <div className="guide-tags">
                <span className="tag">95%+ Carbon</span>
                <span className="tag">Extreme Low Bow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Competitive Guarantee Trust Banner */}
      <section className="section bg-surface-2 trust-guarantee-section">
        <div className="container">
          <div className="cta-section trust-cta-box">
            <div className="trust-cta-content">
              <span className="eyebrow">30-DAY PRO PROMISE</span>
              <h2>TRY IT ON TURF. IF IT FAILS YOUR GAME, WE'LL REPLACE IT.</h2>
              <p>
                Every stick, paddle, and shin guard sold by AMI includes our 30-day match guarantee. Dispatch occurs within 24 hours directly from our regional fulfillment hubs.
              </p>
              <div className="hero-actions mt-6">
                <Button variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  BACK TO CATALOG TOP
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}