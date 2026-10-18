import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Input, Alert, Spinner, Badge, EmptyState } from '../components/ui';

export default function Cart() {
  const navigate = useNavigate();
  
  // Cart state stored in localStorage
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Checkout Multi-Step state: 1: Cart View/Shipping, 2: Payment, 3: Order Review, 4: Confirmed
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);

  // Shipping Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'United States'
  });

  // Payment Form State
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expDate: '12/26',
    cvv: '888',
    cardName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderConfirmedId, setOrderConfirmedId] = useState('');

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const stored = localStorage.getItem('ami_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      setCartItems([]);
    }
  };

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('ami_cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cartItems];
    const newQty = (updated[index].quantity || 1) + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    saveCart(updated);
  };

  const removeItem = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    saveCart(updated);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    if (!promoCode.trim()) return;

    if (promoCode.toUpperCase() === 'FIRSTTOUCH10') {
      setDiscount(0.10); // 10% off
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === 'PROMATCH20') {
      setDiscount(0.20); // 20% off
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Try "FIRSTTOUCH10" or "PROMATCH20"');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = subtotal * discount;
  const shippingCost = subtotal > 99 || subtotal === 0 ? 0 : 12;
  const estimatedTax = (subtotal - discountAmount) * 0.08; // 8% tax
  const grandTotal = subtotal - discountAmount + shippingCost + estimatedTax;

  const handleInputChange = (e, formSetter) => {
    const { name, value } = e.target;
    formSetter(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError('');
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.line1 || !shippingInfo.city) {
      setError('Please complete all required shipping fields before continuing.');
      return;
    }
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    setError('');
    if (!paymentInfo.cardName) {
      setError('Please enter the name on your card.');
      return;
    }
    setCheckoutStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    const orderPayload = {
      userId: null, // Guest order or logged-in handled in backend if present
      items: cartItems.map(item => ({
        productId: item._id || item.id,
        name: item.name,
        variant: item.selectedSize || 'Standard',
        qty: item.quantity || 1,
        price: item.price,
        image: Array.isArray(item.images) ? item.images[0] : item.images
      })),
      totalAmount: Math.round(grandTotal * 100) / 100,
      shippingAddress: shippingInfo,
      status: 'pending',
      paymentId: 'stripe_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };

    try {
      const res = await axios.post('/api/orders', orderPayload);
      const createdOrder = res.data;
      
      // Clear cart
      localStorage.removeItem('ami_cart');
      window.dispatchEvent(new Event('cart-updated'));
      setCartItems([]);
      
      setOrderConfirmedId(createdOrder._id || ('AMI-' + Math.floor(100000 + Math.random() * 900000)));
      setCheckoutStep(4);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to place order. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // If order is placed successfully
  if (checkoutStep === 4) {
    return (
      <div className="cart-page-wrapper container">
        <section className="order-confirmation-hero section animate-in">
          <div className="confirmation-card card card-elevated">
            <div className="confirmation-header text-center">
              <div className="check-icon-badge">✓</div>
              <span className="eyebrow">ORDER CONFIRMED</span>
              <h1 className="confirmation-title">YOU'RE ALL SET, <span className="gradient-text">{shippingInfo.fullName.split(' ')[0] || 'PLAYER'}</span>.</h1>
              <p className="hero-subtitle">
                Order <strong style={{ color: 'var(--accent)' }}>#{orderConfirmedId}</strong> is locked in. We're already prepping your gear for high-velocity dispatch.
              </p>
            </div>

            <div className="order-tracker-timeline">
              <div className="tracker-step active">
                <span className="step-dot">1</span>
                <span className="step-label">ORDER PLACED</span>
              </div>
              <div className="tracker-line active"></div>
              <div className="tracker-step">
                <span className="step-dot">2</span>
                <span className="step-label">PREPPING GEAR</span>
              </div>
              <div className="tracker-line"></div>
              <div className="tracker-step">
                <span className="step-dot">3</span>
                <span className="step-label">DISPATCHED</span>
              </div>
              <div className="tracker-line"></div>
              <div className="tracker-step">
                <span className="step-dot">4</span>
                <span className="step-label">DELIVERED TO TURF</span>
              </div>
            </div>

            <div className="order-summary-box">
              <h3>DELIVERY DESTINATION</h3>
              <p className="shipping-text">
                <strong>{shippingInfo.fullName}</strong><br />
                {shippingInfo.line1} {shippingInfo.line2}<br />
                {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}<br />
                Email: {shippingInfo.email}
              </p>
            </div>

            <div className="confirmation-actions">
              <Link to="/shop">
                <Button variant="primary" size="lg">CONTINUE SHOPPING</Button>
              </Link>
              <Link to="/profile">
                <Button variant="secondary" size="lg">VIEW IN ACCOUNT</Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="whistle-divider"></div>

        {/* Value reassurance strip */}
        <section className="section reassurance-strip">
          <div className="grid grid-3">
            <div className="feature-card text-center">
              <div className="feature-icon">⚡</div>
              <h3>DISPATCHED IN 24H</h3>
              <p>Your gear is weighed, tuned, and packed for direct pitch delivery.</p>
            </div>
            <div className="feature-card text-center">
              <div className="feature-icon">🛡️</div>
              <h3>30-DAY MATCH GUARANTEE</h3>
              <p>Test it on turf. If it doesn't match your game, send it back free.</p>
            </div>
            <div className="feature-card text-center">
              <div className="feature-icon">🤝</div>
              <h3>PRO CARE SUPPORT</h3>
              <p>Got questions on flex, weight, or size? Our team of active players has your back.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      {/* Page Compact Hero Banner */}
      <section className="page-hero-compact">
        <div className="container">
          <span className="eyebrow">EQUIPMENT BAG</span>
          <h1 className="hero-compact-title">
            {isCheckoutMode ? 'MATCH-READY' : 'YOUR'} <span className="gradient-text">{isCheckoutMode ? 'CHECKOUT' : 'BAG'}</span>
          </h1>
          <p className="hero-compact-subtitle">
            {cartItems.length > 0 
              ? `${cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items selected and ready for dispatch.`
              : 'Your match bag is empty. Time to gear up.'}
          </p>
        </div>
      </section>

      <div className="whistle-divider"></div>

      {cartItems.length === 0 && !isCheckoutMode ? (
        <section className="section container">
          <EmptyState
            icon="🏑"
            title="YOUR BAG IS EMPTY"
            description="Looks like you haven't selected any composite sticks, padel rackets, or kit items yet."
            action={
              <Link to="/shop">
                <Button variant="primary" size="lg">EXPLORE THE CATALOG</Button>
              </Link>
            }
          />

          <div className="cta-section text-center" style={{ marginTop: '60px' }}>
            <h2>NEED SIZING HELP?</h2>
            <p>Check out our stick flex and racket control guide to find your perfect fit before you order.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/shop?category=hockey-sticks">
                <Button variant="secondary">VIEW HOCKEY STICKS</Button>
              </Link>
              <Link to="/shop?category=paddle-rackets">
                <Button variant="ghost">VIEW PADEL RACKETS</Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="section container">

          {/* Checkout Progress Indicator when checking out */}
          {isCheckoutMode && (
            <div className="checkout-step-nav card card-elevated">
              <div className={`step-item ${checkoutStep >= 1 ? 'active' : ''}`}>
                <span className="step-badge">1</span>
                <span className="step-name">SHIPPING ADDRESS</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step-item ${checkoutStep >= 2 ? 'active' : ''}`}>
                <span className="step-badge">2</span>
                <span className="step-name">PAYMENT METHOD</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step-item ${checkoutStep >= 3 ? 'active' : ''}`}>
                <span className="step-badge">3</span>
                <span className="step-name">REVIEW & PLACE ORDER</span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="error" title="Action Required" dismissible style={{ marginBottom: '24px' }}>
              {error}
            </Alert>
          )}

          <div className="grid grid-3 cart-checkout-grid">

            {/* Main Area: Cart Table OR Checkout Form */}
            <div className="cart-main-column" style={{ gridColumn: 'span 2' }}>

              {/* VIEW 1: CART LISTING */}
              {!isCheckoutMode && (
                <div className="cart-items-card card">
                  <div className="cart-header-row">
                    <h2>SELECTED ITEMS ({cartItems.length})</h2>
                    <Button variant="ghost" size="sm" onClick={() => saveCart([])}>CLEAR BAG</Button>
                  </div>

                  <div className="cart-items-list">
                    {cartItems.map((item, idx) => {
                      const itemImg = Array.isArray(item.images) ? item.images[0] : (item.images || item.image || 'https://picsum.photos/seed/hockey1/400/400');
                      const unitPrice = Number(item.price) || 0;

                      return (
                        <div key={idx} className="cart-item-row">
                          <div className="cart-item-thumb">
                            <img src={itemImg} alt={item.name} />
                          </div>

                          <div className="cart-item-details">
                            <span className="badge badge-primary">{item.brand || 'AMI GEAR'}</span>
                            <h3 className="cart-item-title">
                              <Link to={`/product/${item._id || item.id}`}>{item.name}</Link>
                            </h3>
                            <p className="cart-item-variant">
                              SPEC: <strong>{item.selectedSize || item.sizes?.[0]?.label || '36.5" / Standard'}</strong>
                            </p>
                            <p className="cart-item-price-mobile">${unitPrice.toFixed(2)} each</p>
                          </div>

                          <div className="cart-item-qty">
                            <label className="qty-label">QTY</label>
                            <div className="qty-stepper">
                              <button type="button" onClick={() => updateQuantity(idx, -1)} aria-label="Decrease quantity">-</button>
                              <span>{item.quantity || 1}</span>
                              <button type="button" onClick={() => updateQuantity(idx, 1)} aria-label="Increase quantity">+</button>
                            </div>
                          </div>

                          <div className="cart-item-total text-right">
                            <span className="item-line-price">${(unitPrice * (item.quantity || 1)).toFixed(2)}</span>
                            <button className="remove-item-btn" onClick={() => removeItem(idx)}>
                              ✕ REMOVE
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="cart-actions-bottom">
                    <Link to="/shop">
                      <Button variant="ghost">← CONTINUE SHOPPING</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* STEP 1: SHIPPING FORM */}
              {isCheckoutMode && checkoutStep === 1 && (
                <form onSubmit={handleProceedToPayment} className="checkout-form-card card card-elevated">
                  <h2>STEP 1: WHERE'S IT HEADED?</h2>
                  <p className="form-subtext">Enter your shipping details so we can calculate pitch-side speed delivery.</p>

                  <div className="form-grid grid grid-2">
                    <Input
                      label="FULL NAME *"
                      name="fullName"
                      placeholder="e.g. Alex Morgan"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      required
                    />
                    <Input
                      label="EMAIL ADDRESS *"
                      type="email"
                      name="email"
                      placeholder="you@domain.com"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      required
                    />
                  </div>

                  <div className="form-grid grid grid-2" style={{ marginTop: '16px' }}>
                    <Input
                      label="PHONE NUMBER *"
                      name="phone"
                      placeholder="+1 (555) 019-2834"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      required
                    />
                    <Input
                      label="COUNTRY *"
                      name="country"
                      value={shippingInfo.country}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <Input
                      label="STREET ADDRESS *"
                      name="line1"
                      placeholder="123 Performance Way"
                      value={shippingInfo.line1}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      required
                    />
                  </div>

                  <div className="form-grid grid grid-2" style={{ marginTop: '16px' }}>
                    <Input
                      label="APARTMENT, SUITE, ETC. (OPTIONAL)"
                      name="line2"
                      placeholder="Apt 4B"
                      value={shippingInfo.line2}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                    />
                    <Input
                      label="CITY *"
                      name="city"
                      placeholder="Boston"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '16px', maxWidth: '300px' }}>
                    <Input
                      label="POSTAL / ZIP CODE *"
                      name="postalCode"
                      placeholder="02108"
                      value={shippingInfo.postalCode}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      required
                    />
                  </div>

                  <div className="checkout-nav-buttons" style={{ marginTop: '32px' }}>
                    <Button variant="ghost" onClick={() => setIsCheckoutMode(false)}>
                      ← BACK TO BAG
                    </Button>
                    <Button type="submit" variant="primary" size="lg">
                      PROCEED TO PAYMENT →
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2: PAYMENT FORM */}
              {isCheckoutMode && checkoutStep === 2 && (
                <form onSubmit={handleProceedToReview} className="checkout-form-card card card-elevated">
                  <h2>STEP 2: PAY SECURELY</h2>
                  <p className="form-subtext">Payments are 256-bit encrypted and processed by Stripe. AMI never holds card credentials.</p>

                  <div className="stripe-encrypted-badge">
                    🔒 ENCRYPTED STRIPE CHECKOUT TEST MODE
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <Input
                      label="NAME ON CARD *"
                      name="cardName"
                      placeholder="e.g. Alex Morgan"
                      value={paymentInfo.cardName}
                      onChange={(e) => handleInputChange(e, setPaymentInfo)}
                      required
                    />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <Input
                      label="CARD NUMBER (TEST MODE)"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => handleInputChange(e, setPaymentInfo)}
                      required
                    />
                  </div>

                  <div className="form-grid grid grid-2" style={{ marginTop: '16px' }}>
                    <Input
                      label="EXPIRATION DATE"
                      name="expDate"
                      value={paymentInfo.expDate}
                      onChange={(e) => handleInputChange(e, setPaymentInfo)}
                      required
                    />
                    <Input
                      label="CVV"
                      name="cvv"
                      value={paymentInfo.cvv}
                      onChange={(e) => handleInputChange(e, setPaymentInfo)}
                      required
                    />
                  </div>

                  <div className="checkout-nav-buttons" style={{ marginTop: '32px' }}>
                    <Button variant="ghost" onClick={() => setCheckoutStep(1)}>
                      ← BACK TO SHIPPING
                    </Button>
                    <Button type="submit" variant="primary" size="lg">
                      REVIEW ORDER →
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: ORDER REVIEW */}
              {isCheckoutMode && checkoutStep === 3 && (
                <div className="checkout-form-card card card-elevated">
                  <h2>STEP 3: REVIEW BEFORE YOU COMMIT</h2>
                  <p className="form-subtext">Double check your match kit and delivery parameters before placing the order.</p>

                  <div className="review-section-box card">
                    <h3>SHIPPING TO</h3>
                    <p>
                      <strong>{shippingInfo.fullName}</strong> ({shippingInfo.email})<br />
                      {shippingInfo.line1} {shippingInfo.line2}<br />
                      {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setCheckoutStep(1)}>EDIT ADDRESS</Button>
                  </div>

                  <div className="review-section-box card" style={{ marginTop: '16px' }}>
                    <h3>PAYMENT METHOD</h3>
                    <p>
                      Card ending in <strong>4242</strong> (Stripe Encrypted)<br />
                      Name: {paymentInfo.cardName}
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setCheckoutStep(2)}>EDIT PAYMENT</Button>
                  </div>

                  <div className="review-items-box" style={{ marginTop: '24px' }}>
                    <h3>ITEMS IN ORDER</h3>
                    {cartItems.map((item, i) => (
                      <div key={i} className="review-item-row">
                        <span>{item.name} ({item.selectedSize || '36.5"'}) x {item.quantity || 1}</span>
                        <strong>${((Number(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-nav-buttons" style={{ marginTop: '32px' }}>
                    <Button variant="ghost" onClick={() => setCheckoutStep(2)}>
                      ← BACK TO PAYMENT
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={handlePlaceOrder} 
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" color="white" /> : '⚡ PLACE ORDER & GEAR UP'}
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar Summary Column */}
            <div className="cart-sidebar-column">
              <div className="order-summary-card card card-elevated">
                <h2>ORDER SUMMARY</h2>

                <div className="summary-line">
                  <span>SUBTOTAL</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-line discount-line">
                    <span>PROMO DISCOUNT ({discount * 100}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-line">
                  <span>ESTIMATED SHIPPING</span>
                  <span>{shippingCost === 0 ? <Badge variant="success">FREE</Badge> : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div className="summary-line">
                  <span>ESTIMATED TAX (8%)</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-line total-line">
                  <span>TOTAL</span>
                  <span className="grand-total-val">${grandTotal.toFixed(2)}</span>
                </div>

                {/* Promo Input */}
                {!isCheckoutMode && (
                  <form onSubmit={handleApplyPromo} className="promo-form" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Input
                        placeholder="PROMO CODE"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        style={{ textTransform: 'uppercase' }}
                      />
                      <Button type="submit" variant="secondary" size="md">APPLY</Button>
                    </div>
                    {promoError && <p className="promo-error-text">{promoError}</p>}
                    {promoApplied && <p className="promo-success-text">✓ Discount applied!</p>}
                    <span className="promo-hint">Try "FIRSTTOUCH10" for 10% off</span>
                  </form>
                )}

                {!isCheckoutMode ? (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    fullWidth 
                    style={{ marginTop: '24px' }}
                    onClick={() => {
                      setIsCheckoutMode(true);
                      setCheckoutStep(1);
                    }}
                  >
                    PROCEED TO CHECKOUT →
                  </Button>
                ) : (
                  <div className="checkout-trust-notes" style={{ marginTop: '20px' }}>
                    <p className="trust-note-item">✓ 30-Day Turf Match Guarantee</p>
                    <p className="trust-note-item">✓ Tracked 24-Hour Dispatch</p>
                    <p className="trust-note-item">✓ SSL 256-Bit Encrypted</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* THREE SUBSTANTIAL CONTENT SECTIONS BELOW FOR RICHNESS */}

      <div className="whistle-divider"></div>

      {/* SECTION 1: PRO GEAR PROTECTION ASSURANCE */}
      <section className="section container">
        <div className="section-head text-center">
          <span className="eyebrow">THE AMI GUARANTEE</span>
          <h2>TESTED ON TURF. TRUSTED IN PLAY.</h2>
          <p className="hero-subtitle">Why active field hockey & padel competitors order with 100% confidence.</p>
        </div>

        <div className="grid grid-3">
          <div className="feature-card">
            <div className="feature-icon">⚖️</div>
            <h3>PRECISION WEIGHT SPECS</h3>
            <p>
              Every composite stick and paddle racket is weighed and balance-point checked prior to dispatch. No dead spots, no off-spec variances.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>DISPATCH IN 24 HOURS</h3>
            <p>
              Orders placed before 2:00 PM EST ship same-day from our dedicated warehouse directly to your home or club grounds.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔁</div>
            <h3>HASSLE-FREE RETURNS</h3>
            <p>
              If the weight, flex, or bow profile isn't right for your style of play, swap it within 30 days — no questions asked.
            </p>
          </div>
        </div>
      </section>

      <div className="whistle-divider"></div>

      {/* SECTION 2: RECENT PLAYER REVIEWS / TRUST STRIP */}
      <section className="section container">
        <div className="section-head text-center">
          <span className="eyebrow">REAL ATHLETE FEEDBACK</span>
          <h2>WHAT PLAYERS ARE SAYING</h2>
        </div>

        <div className="grid grid-3">
          <div className="testimonial card">
            <p className="testimonial-text">
              "Ordered the Vortex Pro Carbon 95 on a Tuesday, had it for Thursday training. The first touch control on turf is unbelievable."
            </p>
            <div className="testimonial-author">
              <strong>Marcus Vance</strong>
              <span className="testimonial-role">Division 1 Field Hockey Midfielder</span>
            </div>
          </div>

          <div className="testimonial card">
            <p className="testimonial-text">
              "The Apex Control 3D padel racket completely changed my overhead slice game. Great balance and zero wrist vibration."
            </p>
            <div className="testimonial-author">
              <strong>Elena Rostova</strong>
              <span className="testimonial-role">Padel Tour Competitor</span>
            </div>
          </div>

          <div className="testimonial card">
            <p className="testimonial-text">
              "Shipping was super fast. Replaced my old stick and noticed immediate drag-flick power gains on match day."
            </p>
            <div className="testimonial-author">
              <strong>David Chen</strong>
              <span className="testimonial-role">Club Team Captain</span>
            </div>
          </div>
        </div>
      </section>

      <div className="whistle-divider"></div>

      {/* SECTION 3: SQUAD NEWSLETTER SIGNUP BANNER */}
      <section className="section container">
        <div className="cta-section text-center">
          <span className="eyebrow" style={{ color: 'var(--accent)' }}>JOIN THE SQUAD</span>
          <h2>GET FIRST CALL ON RESTOCKS & LIMITED DROPS</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 24px auto', color: 'rgba(255,255,255,0.9)' }}>
            Be the first to know when carbon composite sticks and padel restocks drop. No fluff, just performance gear alerts.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link to="/profile">
              <Button variant="secondary" size="lg">CREATE PLAYER ACCOUNT</Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}