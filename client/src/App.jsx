import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { Button, Badge } from '../components/ui';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  // Listen to scroll to adjust header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update cart count from localStorage
  const updateCartCount = () => {
    try {
      const stored = localStorage.getItem('ami_cart');
      if (stored) {
        const items = JSON.parse(stored);
        const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, [location]);

  return (
    <div className="app-layout">
      {/* Top Banner Notice */}
      <div className="top-announcement-bar">
        <span>⚡ TURF-READY PERFORMANCE GEAR • FREE DISPATCH ON ORDERS OVER $99 • 30-DAY PRO MATCH GUARANTEE</span>
      </div>

      {/* Main Sticky Navigation */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <Link to="/" className="nav-brand">
            <span className="brand-badge">AMI</span>
            <span className="brand-text">PERFORMANCE</span>
          </Link>

          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
              HOME
            </NavLink>
            <NavLink to="/shop" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              SHOP ALL
            </NavLink>
            <NavLink to="/shop?category=hockey-sticks" className="nav-link">
              HOCKEY
            </NavLink>
            <NavLink to="/shop?category=paddle-rackets" className="nav-link">
              PADEL
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              ACCOUNT
            </NavLink>
          </nav>

          <div className="nav-actions">
            <Link to="/cart" className="cart-trigger-btn">
              <span className="cart-icon" aria-hidden="true">🛍️</span>
              <span className="cart-label">BAG</span>
              {cartCount > 0 && (
                <span className="cart-badge-count">{cartCount}</span>
              )}
            </Link>
            <Link to="/shop">
              <Button size="sm" variant="primary">
                GEAR UP NOW
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/checkout" element={<Cart checkoutMode={true} />} />
          <Route path="/order-confirmation/:id" element={<Cart confirmationMode={true} />} />
        </Routes>
      </main>

      {/* Whistle Stripe Divider before Footer */}
      <div className="whistle-stripe" />

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="brand-badge">AMI</span>
              <span className="brand-text" style={{ color: '#ffffff' }}>PERFORMANCE</span>
            </div>
            <p className="footer-tagline">
              "BUILT FOR THE FIRST TOUCH."
            </p>
            <p className="footer-subtext">
              AMI equips field hockey and paddle players with precision-engineered sticks, rackets, and kit — tested on turf, trusted by competitors, sized right the first time.
            </p>
            <div className="footer-badges">
              <Badge variant="primary">PRO CARBON 95</Badge>
              <Badge variant="neutral">TURF-TESTED</Badge>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">HOCKEY RANGE</h4>
            <ul className="footer-links">
              <li><Link to="/shop?category=hockey-sticks&skillLevel=pro">Pro Bow Composites</Link></li>
              <li><Link to="/shop?category=hockey-sticks&skillLevel=intermediate">Drag-Flick Specialists</Link></li>
              <li><Link to="/shop?category=hockey-sticks&skillLevel=beginner">Training & Junior Sticks</Link></li>
              <li><Link to="/shop?category=kit-apparel">Turf Cleats & Shin Guards</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">PADEL & RACKETS</h4>
            <ul className="footer-links">
              <li><Link to="/shop?category=paddle-rackets&skillLevel=pro">Diamond Power Series</Link></li>
              <li><Link to="/shop?category=paddle-rackets&skillLevel=intermediate">Teardrop Hybrid Series</Link></li>
              <li><Link to="/shop?category=paddle-rackets&skillLevel=beginner">Round Control Rackets</Link></li>
              <li><Link to="/shop?category=kit-apparel">Overgrips & Balls</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">SUPPORT & HUB</h4>
            <ul className="footer-links">
              <li><Link to="/profile">My Squad Account</Link></li>
              <li><Link to="/cart">Bag & Checkout</Link></li>
              <li><a href="#newsletter">Join The Squad Restocks</a></li>
            </ul>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} AMI ATHLETICS INC. ALL RIGHTS RESERVED. PRECISION-ENGINEERED ON TURF.</p>

          <div className="footer-meta-links">
            <span>STRICT ACCURACY SPEC</span>
            <span>·</span>
            <span>STRIPE ENCRYPTED</span>
            <span>·</span>
            <span>30-DAY FIT RETURN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}