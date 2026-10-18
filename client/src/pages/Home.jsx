import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Spinner, Badge, toast } from '../components/ui';

export default function Home() {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products');
      // If array, select top items, or filter
      const data = Array.isArray(res.data) ? res.data : [];
      setBestSellers(data.slice(0, 6));
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const stored = localStorage.getItem('ami_cart');
      let cart = stored ? JSON.parse(stored) : [];
      const existingIndex = cart.findIndex(item => item.id === product._id);

      const imageUrl = Array.isArray(product.images) 
        ? product.images[0] 
        : (product.images || 'https://picsum.photos/seed/stick1/600/600');

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          id: product._id,
          name: product.name,
          price: product.price,
          brand: product.brand,
          category: product.category,
          image: imageUrl,
          quantity: 1,
          size: product.sizes?.[0] || 'Standard'
        });
      }

      localStorage.setItem('ami_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      toast.success(`${product.name} added to your bag!`);
    } catch (err) {
      toast.error('Could not add item to bag.');
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    setNewsletterLoading(true);
    setNewsletterError('');

    // Simulate API dispatch / success response
    setTimeout(() => {
      setNewsletterLoading(false);
      setNewsletterSuccess(true);
      toast.success('Welcome to the squad! Discount code sent.');
    }, 900);
  };

  return (
    <div className="home-page animate-in">
      {/* SECTION 1: HERO BANNER (Diagonal Split Motif) */}
      <section className="hero">
        <img 
          className="hero-bg" 
          src="https://picsum.photos/seed/turfaction/1600/900" 
          alt="Field Hockey Action on Turf" 
        />
        <div className="container hero-content-wrapper">
          <div className="hero-text-block">
            <span className="eyebrow hero-eyebrow">HIGH-PERFORMANCE TURF & COURT GEAR</span>
            <h1>
              BUILT FOR THE <span className="gradient-text">FIRST TOUCH</span>.
            </h1>
            <p className="hero-subtitle">
              Field hockey sticks, paddle rackets, and match-day kit — precision-engineered for competitors who don't settle for close enough.
            </p>

            {/* Sport Quick Selector Chips */}
            <div className="hero-chips-bar">
              <span className="chips-label">SELECT SPORT:</span>
              <div className="chips-group">
                <button className="chip-btn" onClick={() => navigate('/shop?category=hockey-sticks')}>
                  👡 FIELD HOCKEY
                </button>
                <button className="chip-btn" onClick={() => navigate('/shop?category=paddle-rackets')}>
                  🎾 PADEL RACKETS
                </button>
                <button className="chip-btn" onClick={() => navigate('/shop?category=kit-apparel')}>
                  🎽 MATCH KIT
                </button>
              </div>
            </div>

            <div className="hero-actions">
              <Button size="lg" onClick={() => navigate('/shop')}>
                SHOP THE RANGE
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/shop?skillLevel=pro')}>
                FIND YOUR FIT
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Whistle Stripe Section Divider Motif */}
      <div className="whistle-stripe" />

      {/* SECTION 2: TRUST & STAT STRIP */}
      <section className="trust-strip-section">
        <div className="container">
          <div className="stats-row grid-4">
            <div className="stat-card">
              <span className="stat-value">12,000+</span>
              <span className="stat-label">PLAYERS OUTFITTED</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">30 DAYS</span>
              <span className="stat-label">PRO-MATCH TRIAL</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">100%</span>
              <span className="stat-label">CARBON COMPOSITES</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">24 HOURS</span>
              <span className="stat-label">EXPRESS DISPATCH</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED CATEGORIES (3 Bold Tiles with Corner Badges) */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">OUR CORE CATEGORIES</span>
            <h2>THREE CATEGORIES. ZERO COMPROMISE.</h2>
            <p>Every piece of gear is weighed, flex-tested, and field-checked before hitting the pitch.</p>
          </div>

          <div className="grid grid-3 categories-grid">
            {/* Category 1 */}
            <div className="category-tile card" onClick={() => navigate('/shop?category=hockey-sticks')}>
              <div className="tile-ribbon-badge">PRO</div>
              <div className="category-img-wrapper">
                <img src="https://picsum.photos/seed/stickscat/800/600" alt="Field Hockey Sticks" />
              </div>
              <div className="category-tile-content">
                <h3>FIELD HOCKEY STICKS</h3>
                <p>Low bow, mid bow, wood-to-carbon — find the flex and bow profile that matches your swing signature.</p>
                <div className="category-tile-cta">
                  <span>EXPLORE STICKS</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            </div>

            {/* Category 2 */}
            <div className="category-tile card" onClick={() => navigate('/shop?category=paddle-rackets')}>
              <div className="tile-ribbon-badge">NEW</div>
              <div className="category-img-wrapper">
                <img src="https://picsum.photos/seed/paddlecat/800/600" alt="Padel Rackets" />
              </div>
              <div className="category-tile-content">
                <h3>PADEL RACKETS</h3>
                <p>Control, teardrop power, or diamond balance — tuned for explosive smashes and tight wall control.</p>
                <div className="category-tile-cta">
                  <span>EXPLORE PADEL</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            </div>

            {/* Category 3 */}
            <div className="category-tile card" onClick={() => navigate('/shop?category=kit-apparel')}>
              <div className="tile-ribbon-badge">HOT</div>
              <div className="category-img-wrapper">
                <img src="https://picsum.photos/seed/gearapparel/800/600" alt="Kit and Protection" />
              </div>
              <div className="category-tile-content">
                <h3>KIT & PROTECTION</h3>
                <p>Touring bags, high-density shin guards, tactile gloves, and grip tape built to endure long match days.</p>
                <div className="category-tile-cta">
                  <span>EXPLORE KIT</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: BEST-SELLERS CAROUSEL / GRID */}
      <section className="section section-dark-accent">
        <div className="container">
          <div className="section-head section-head-left flex-between">
            <div>
              <span className="eyebrow">TURF FAVOURITES</span>
              <h2>WHAT'S LEAVING THE SHELVES</h2>
              <p>The sticks, rackets, and kit our competitive players keep coming back for.</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/shop')}>
              VIEW ALL GEAR ({bestSellers.length})
            </Button>
          </div>

          {loading ? (
            <div className="loading-container">
              <Spinner size="lg" />
              <p>Fetching turf gear...</p>
            </div>
          ) : bestSellers.length === 0 ? (
            <div className="empty-catalog-fallback">
              <p>Catalog is loading or updating. Check back shortly!</p>
              <Button onClick={() => navigate('/shop')}>Browse Catalog</Button>
            </div>
          ) : (
            <div className="products-carousel-grid grid grid-3">
              {bestSellers.map((product) => {
                const imgUrl = Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : (typeof product.images === 'string' ? product.images : 'https://picsum.photos/seed/productcard/600/600');

                return (
                  <div 
                    key={product._id} 
                    className="product-card card" 
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="floating-price-tag">
                      ${product.price}
                    </div>

                    <div className="product-image-container">
                      <img src={imgUrl} alt={product.name} />
                      <div className="skill-badge-overlay">
                        <Badge variant="neutral">{product.skillLevel || 'ALL SKILLS'}</Badge>
                      </div>
                    </div>

                    <div className="product-card-body">
                      <span className="product-brand-tag">{product.brand || 'AMI SPORTS'}</span>
                      <h4 className="product-title">{product.name}</h4>
                      
                      <div className="product-meta">
                        <div className="rating-stars">
                          ★★★★★ <span className="rating-num">(4.9)</span>
                        </div>
                        <span className="stock-status">
                          {product.stock < 5 ? `ONLY ${product.stock} LEFT` : 'IN STOCK'}
                        </span>
                      </div>

                      <div className="product-card-action">
                        <Button 
                          fullWidth 
                          onClick={(e) => handleQuickAdd(product, e)}
                        >
                          QUICK ADD
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Whistle Stripe Section Divider Motif */}
      <div className="whistle-stripe" />

      {/* SECTION 5: WHY AMI (4-COLUMN VALUE PROPS GRID) */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">THE PERFORMANCE ADVANTAGE</span>
            <h2>WHY PLAYERS SWITCH TO AMI</h2>
            <p>Designed in the lab, tested under floodlights, trusted on match day.</p>
          </div>

          <div className="grid grid-4 features-grid">
            <div className="feature-card card">
              <div className="feature-icon">📐</div>
              <h3>PRO-TESTED SPECS</h3>
              <p>Every stick is weighed, flexed, and benchmarked for balance point and bow height before dispatch.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">⚡</div>
              <h3>FIT BY SKILL LEVEL</h3>
              <p>Beginner, intermediate, or pro — we match gear carbon composition to your current swing torque.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🚀</div>
              <h3>FAST 24H DELIVERY</h3>
              <p>Orders processed within hours, fully tracked door-to-turf so you never miss weekend fixtures.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🛡️</div>
              <h3>REAL PLAYER GUARANTEE</h3>
              <p>Test your stick on turf for 30 days. If it doesn't upgrade your first touch, swap it free.</p>
            </div>
          </div>
        </div>
      </section>

      {/*SECTION 6: ATHLETE SHOWCASE & VIDEO FEATURE */}
      <section className="section section-surface">
        <div className="container">
          <div className="grid grid-2 showcase-split">
            <div className="showcase-media-column">
              <div className="video-embed aspect-hero">
                <iframe 
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&muted=1" 
                  title="AMI Precision Stick Testing" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <span className="media-caption">WATCH: The 95% Carbon Layup Impact Mechanics</span>
            </div>

            <div className="showcase-text-column">
              <span className="eyebrow">CRAFT & MATERIALS</span>
              <h2>ENGINEERED ON TURF. PROVEN IN PLAY.</h2>
              <p>
                Standard retail sticks degrade after a single heavy season. AMI's dual-chamber carbon structure distributes power across the shaft, delivering maximum drag-flick whip without sacrificing 3D skill control.
              </p>

              <div className="showcase-specs-list">
                <div className="spec-item">
                  <strong>J-Shape Head Profile:</strong> Maximum surface area for aggressive drag-flicks and stopping power.
                </div>
                <div className="spec-item">
                  <strong>EVA Foam Core:</strong> Dampens high-impact vibration through your wrists on cold turf mornings.
                </div>
                <div className="spec-item">
                  <strong>Tackified Micro-Grip:</strong> Anti-slip performative synthetic surface engineered for wet conditions.
                </div>
              </div>

              <div className="showcase-action">
                <Button onClick={() => navigate('/shop')}>BROWSE PRO-GRADE EQUIPMENT</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">MATCH REVIEWS</span>
            <h2>TESTED BY THE PROS</h2>
            <p>Read what elite collegiate and club athletes say after 90 minutes on the field.</p>
          </div>

          <div className="grid grid-3 testimonials-grid">
            <div className="testimonial card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "The Vortex Pro 95 changed my aerial game overnight. The bow placement gives me effortless velocity without losing soft control on receiving."
              </p>
              <div className="testimonial-author-block">
                <img className="avatar" src="https://i.pravatar.cc/300?img=32" alt="Marcus Vance" />
                <div>
                  <h4 className="author-name">MARCUS VANCE</h4>
                  <span className="testimonial-role">National League Midfielder</span>
                </div>
              </div>
            </div>

            <div className="testimonial card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Switched our whole padel squad to the AMI Carbon Alpha rackets this season. Unbelievable durability against wall strikes and unmatched spin."
              </p>
              <div className="testimonial-author-block">
                <img className="avatar" src="https://i.pravatar.cc/300?img=47" alt="Elena Rostova" />
                <div>
                  <h4 className="author-name">ELENA ROSTOVA</h4>
                  <span className="testimonial-role">Premier Padel Tour Player</span>
                </div>
              </div>
            </div>

            <div className="testimonial card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Sizing shin guards and composite sticks for a youth development squad used to be a nightmare. AMI's skill fit system got every player sorted."
              </p>
              <div className="testimonial-author-block">
                <img className="avatar" src="https://i.pravatar.cc/300?img=12" alt="David Sterling" />
                <div>
                  <h4 className="author-name">DAVID STERLING</h4>
                  <span className="testimonial-role">Academy Head Coach</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: NEWSLETTER / JOIN THE SQUAD BLOCK */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="cta-section dark-cta-box">
            <div className="cta-content">
              <span className="eyebrow eyebrow-accent">JOIN THE AMI SQUAD</span>
              <h2>GET FIRST CALL ON RESTOCKS & LIMITED DROPS</h2>
              <p>
                New stick arrivals, padel batch drops, and end-of-season kit deals — straight to your inbox. No spam, just pure performance gear.
              </p>

              {newsletterSuccess ? (
                <div className="alert alert-success newsletter-success-msg">
                  ✓ YOU'RE IN THE SQUAD! Check your email for your 15% welcome code.
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <div className="form-group-inline">
                    <input
                      type="email"
                      className="input-field"
                      placeholder="Enter your email (e.g. player@pitch.com)"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      disabled={newsletterLoading}
                    />
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={newsletterLoading}
                    >
                      {newsletterLoading ? 'JOINING...' : 'GEAR UP NOW'}
                    </Button>
                  </div>
                  {newsletterError && <p className="form-error-msg">{newsletterError}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RICH FOOTER */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-col brand-col">
            <Link to="/" className="nav-brand footer-logo">
              <span className="brand-badge">AMI</span>
              <span className="brand-text">PERFORMANCE</span>
            </Link>
            <p className="footer-tagline">
              Precision-engineered field hockey sticks, padel rackets, and match-day kit for athletes who demand total dominance.
            </p>
            <div className="footer-socials">
              <span className="social-pill">INSTAGRAM</span>
              <span className="social-pill">YOUTUBE</span>
              <span className="social-pill">STRAVA</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">FIELD HOCKEY</h4>
            <ul className="footer-links">
              <li><Link to="/shop?category=hockey-sticks">Low Bow Carbon Sticks</Link></li>
              <li><Link to="/shop?category=hockey-sticks">Mid Bow All-Rounders</Link></li>
              <li><Link to="/shop?category=hockey-sticks">Wood Core Training Sticks</Link></li>
              <li><Link to="/shop?category=kit-apparel">Grip Tape & Accessories</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">PADEL RACKETS</h4>
            <ul className="footer-links">
              <li><Link to="/shop?category=paddle-rackets">Teardrop Power Series</Link></li>
              <li><Link to="/shop?category=paddle-rackets">Round Control Models</Link></li>
              <li><Link to="/shop?category=paddle-rackets">Diamond Attack Rackets</Link></li>
              <li><Link to="/shop?category=kit-apparel">Padel Balls & Protectors</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">SUPPORT & HUB</h4>
            <ul className="footer-links">
              <li><Link to="/profile">My Account & Orders</Link></li>
              <li><Link to="/cart">View Shopping Bag</Link></li>
              <li><a href="#size-guide" onClick={(e) => { e.preventDefault(); toast.info('Size Guide: 36.5" suits players 5\'3" to 5\'10"'); }}>Stick Sizing Guide</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container flex-between">
            <span>&copy; {new Date().getFullYear()} AMI SPORTS INC. ALL RIGHTS RESERVED.</span>
            <span>BUILT FOR THE FIRST TOUCH.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}