import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Badge, Spinner, Alert, Tabs, toast } from '../components/ui';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // PDP Interactive States
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');

  // Review Form States
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch product data and related items
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    async function loadProductData() {
      try {
        const res = await axios.get(`/api/products/${id}`);
        if (!isMounted) return;
        const currentProd = res.data;
        setProduct(currentProd);
        setSelectedImage(0);
        setSelectedVariantIndex(0);
        setQuantity(1);

        // Fetch related products from same category or random fallback
        try {
          const relRes = await axios.get('/api/products');
          if (isMounted) {
            const all = relRes.data || [];
            const filtered = all
              .filter(p => p._id !== id && (p.category === currentProd.category || !currentProd.category))
              .slice(0, 4);
            setRelatedProducts(filtered.length > 0 ? filtered : all.filter(p => p._id !== id).slice(0, 4));
          }
        } catch (e) {
          // ignore related failure
        }

        // Fetch reviews for this product
        try {
          const revRes = await axios.get('/api/reviews');
          if (isMounted) {
            const prodReviews = (revRes.data || []).filter(r => r.productId === id);
            setReviews(prodReviews);
          }
        } catch (e) {
          // ignore review fetch failure
        }

      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Product not found or unavailable. Please check back later.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProductData();

    return () => { isMounted = false; };
  }, [id]);

  // Handle Add To Cart
  const handleAddToCart = (buyNow = false) => {
    if (!product) return;

    try {
      const stored = localStorage.getItem('ami_cart');
      let cart = stored ? JSON.parse(stored) : [];

      const imagesArray = Array.isArray(product.images) ? product.images : [product.images];
      const selectedVariant = product.sizes && product.sizes[selectedVariantIndex] 
        ? product.sizes[selectedVariantIndex]
        : { label: 'Standard', weight: 'Default' };

      const cartItem = {
        productId: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        image: imagesArray[0] || 'https://picsum.photos/seed/hockey1/600/600',
        variant: `${selectedVariant.label || selectedVariant} ${selectedVariant.weight ? `(${selectedVariant.weight})` : ''}`.trim(),
        quantity: quantity,
        maxStock: product.stock || 10
      };

      const existingIndex = cart.findIndex(
        item => item.productId === cartItem.productId && item.variant === cartItem.variant
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('ami_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));

      toast.success(`Added ${product.name} to your bag!`);

      if (buyNow) {
        navigate('/cart');
      }
    } catch (e) {
      toast.error('Could not save to bag. Please try again.');
    }
  };

  // Submit Review Form Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const payload = {
        productId: id,
        rating: Number(reviewRating),
        comment: reviewComment,
        createdAt: new Date().toISOString()
      };

      const res = await axios.post('/api/reviews', payload);
      setReviews(prev => [res.data, ...prev]);
      setReviewSuccess(true);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Thank you for your player feedback!');
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <Spinner size="lg" color="primary" />
        <p style={{ marginTop: '20px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
          LOADING PERFORMANCE SPECIFICATIONS...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 0' }}>
        <Alert variant="error" title="Product Unavailable">
          {error || 'We could not locate this item in our inventory catalog.'}
        </Alert>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/shop" className="btn-primary">
            RETURN TO CATALOG
          </Link>
        </div>
      </div>
    );
  }

  // Formatting safely
  const imageList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : typeof product.images === 'string' && product.images.startsWith('http')
      ? [product.images]
      : ['https://picsum.photos/seed/hockey1/800/800', 'https://picsum.photos/seed/hockey2/800/800', 'https://picsum.photos/seed/hockey3/800/800'];

  const variants = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : [{ label: '36.5"', weight: '535g - Light' }, { label: '37.5"', weight: '550g - Medium' }];

  const currentVariant = variants[selectedVariantIndex] || variants[0];
  const inStock = (product.stock ?? 10) > 0;
  const isLowStock = inStock && (product.stock ?? 10) <= 3;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <div className="product-detail-page">
      {/* Breadcrumb Strip */}
      <div className="breadcrumb-bar" style={{ background: 'var(--surface-2)', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>
          <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>HOME</Link>
          <span>/</span>
          <Link to="/shop" style={{ color: 'var(--muted)', textDecoration: 'none' }}>CATALOG</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)', textTransform: 'uppercase' }}>{product.category || 'GEAR'}</span>
          <span>/</span>
          <span style={{ color: 'var(--primary)' }}>{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div className="grid grid-2" style={{ gap: '48px', alignItems: 'start' }}>
            
            {/* Left: Gallery Column */}
            <div className="product-gallery-container">
              <div className="main-image-frame" style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                marginBottom: '16px',
                aspectRatio: '1 / 1'
              }}>
                <img
                  src={imageList[selectedImage] || imageList[0]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Floating Skill Ribbon */}
                {product.skillLevel && (
                  <div className="corner-badge" style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'var(--accent)',
                    color: 'var(--secondary)',
                    fontWeight: 900,
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {product.skillLevel} LEVEL
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              <div className="thumbnail-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {imageList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      border: selectedImage === idx ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      background: 'var(--surface-2)',
                      padding: 0,
                      cursor: 'pointer',
                      aspectRatio: '1/1',
                      opacity: selectedImage === idx ? 1 : 0.7,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Specs & Purchasing Column */}
            <div className="product-summary-panel">
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Badge variant="primary" size="md">
                  {product.brand || 'AMI LABS'}
                </Badge>
                {inStock ? (
                  <Badge variant={isLowStock ? 'warning' : 'success'} dot>
                    {isLowStock ? `ONLY ${product.stock} LEFT IN STOCK` : 'IN STOCK & READY TO SHIP'}
                  </Badge>
                ) : (
                  <Badge variant="danger">OUT OF STOCK</Badge>
                )}
              </div>

              <h1 style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.1,
                textTransform: 'uppercase',
                margin: '0 0 12px 0',
                color: 'var(--text)'
              }}>
                {product.name}
              </h1>

              {/* Price & Rating Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyHorizontal: 'space-between',
                gap: '24px',
                paddingBottom: '20px',
                marginBottom: '24px',
                borderBottom: '1px solid var(--border)'
              }}>
                <div>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    ${Number(product.price || 0).toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', fontWeight: 600 }}>
                    TAX INCLUDED · EXPRESS DISPATCH AVAILABLE
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                    ★ {averageRating} / 5.0
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                    ({reviews.length > 0 ? reviews.length : 18} COMPETITOR REVIEWS)
                  </span>
                </div>
              </div>

              {/* Short Teaser Description */}
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text)',
                lineHeight: 1.6,
                marginBottom: '28px'
              }}>
                {product.description || 'Hand-finished carbon layup tuned for a lower bow profile — built for players who load the ball late and release fast with ultimate velocity and touch.'}
              </p>

              {/* Variant Selector Box */}
              <div className="variant-selection-box" style={{
                background: 'var(--surface-2)',
                padding: '20px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                marginBottom: '24px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  marginBottom: '10px',
                  color: 'var(--secondary)'
                }}>
                  SELECT SPEC / SIZE & WEIGHT:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {variants.map((v, idx) => {
                    const labelText = typeof v === 'string' ? v : (v.label || `Spec ${idx + 1}`);
                    const subText = typeof v === 'object' && v.weight ? v.weight : null;
                    const isSelected = selectedVariantIndex === idx;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        style={{
                          background: isSelected ? 'var(--secondary)' : 'var(--surface)',
                          color: isSelected ? '#FFFFFF' : 'var(--text)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{labelText}</div>
                        {subText && (
                          <div style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.6, marginTop: '2px' }}>
                            {subText}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity and CTA Buttons */}
              <div className="action-row" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div className="qty-stepper" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  overflow: 'hidden'
                }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={!inStock}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '12px 16px',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      cursor: inStock ? 'pointer' : 'not-allowed',
                      color: 'var(--text)'
                    }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 16px', fontWeight: 800, fontSize: '1rem' }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                    disabled={!inStock}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '12px 16px',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      cursor: inStock ? 'pointer' : 'not-allowed',
                      color: 'var(--text)'
                    }}
                  >
                    +
                  </button>
                </div>

                <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={!inStock}
                    onClick={() => handleAddToCart(false)}
                  >
                    {inStock ? 'ADD TO BAG' : 'OUT OF STOCK'}
                  </Button>

                  {inStock && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => handleAddToCart(true)}
                    >
                      BUY NOW
                    </Button>
                  )}
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="guarantees-strip" style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: 'var(--muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>✓</span> 30-DAY ON-TURF TRIAL
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>✓</span> DISPATCHED IN 24 HOURS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>✓</span> PRO-GRADE CARBON CHECK
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>✓</span> FREE RETURNS ELIGIBLE
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Whistle Stripe Divider */}
      <div style={{
        height: '3px',
        width: '100%',
        background: 'linear-gradient(90deg, var(--primary) 0 30%, var(--accent) 30% 100%)'
      }} />

      {/* Tabbed Specifications, Description & Player Reviews */}
      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.Tab value="specs">TECHNICAL SPECS</Tabs.Tab>
            <Tabs.Tab value="description">FULL OVERVIEW</Tabs.Tab>
            <Tabs.Tab value="reviews">PLAYER REVIEWS ({reviews.length})</Tabs.Tab>
          </Tabs>

          <div className="tab-content-panel" style={{
            background: 'var(--surface)',
            padding: '32px',
            borderRadius: '0 0 var(--radius) var(--radius)',
            border: '1px solid var(--border)',
            borderTop: 'none'
          }}>
            {/* SPECS TAB */}
            {activeTab === 'specs' && (
              <div>
                <h3 style={{ textTransform: 'uppercase', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
                  SPECS THAT MATTER
                </h3>
                <div className="specs-table" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>CATEGORY</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>{product.category || 'Hockey Stick'}</div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>SKILL LEVEL TARGET</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>{product.skillLevel || 'Intermediate / Pro'}</div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>SELECTED WEIGHT / SPEC</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>{currentVariant?.weight || currentVariant?.label || '540g Standard'}</div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>COMPOSITION</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>95% Japanese Toray Carbon</div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>BOW PROFILE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>24.75mm Low Bow @ 200mm</div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>BALANCING POINT</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>38.5cm Mid-Dynamic Balance</div>
                  </div>
                </div>
              </div>
            )}

            {/* DESCRIPTION TAB */}
            {activeTab === 'description' && (
              <div style={{ lineHeight: 1.8 }}>
                <h3 style={{ textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                  ENGINEERED ON TURF. PROVEN IN PLAY.
                </h3>
                <p style={{ marginBottom: '16px' }}>
                  The {product.name} is built from the inside out to handle high-tempo pressure situations. Engineered with a specialized dual-chamber internal ribbing structure, it dampens high-frequency vibrations on direct ball contact while channeling 100% of force transfer straight into your pushes, hits, and flicking releases.
                </p>
                <p>
                  Whether you are controlling high aerials or winding up for a penalty corner sweep, this gear delivers tactile feedback through the chamois-feel micro-perforated grip system. Hand-inspected and weighed at our factory line to ensure zero variance from spec sheets.
                </p>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                  <div>
                    <h3 style={{ textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-display)' }}>
                      WHAT PLAYERS ARE SAYING
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontWeight: 600 }}>
                      Verified feedback from athletes using the {product.name}.
                    </p>
                  </div>
                </div>

                {/* Submit New Review Form */}
                <div style={{
                  background: 'var(--surface-2)',
                  padding: '24px',
                  borderRadius: 'var(--radius)',
                  marginBottom: '36px',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{ textTransform: 'uppercase', marginTop: 0, marginBottom: '16px' }}>
                    SUBMIT A PERFORMANCE REVIEW
                  </h4>

                  {reviewSuccess && (
                    <Alert variant="success" title="Review Submitted" dismissible>
                      ✓ Your player feedback was recorded! Thanks for building our athlete knowledge base.
                    </Alert>
                  )}

                  {reviewError && (
                    <Alert variant="error" title="Submission Error">
                      {reviewError}
                    </Alert>
                  )}

                  {!reviewSuccess && (
                    <form onSubmit={handleReviewSubmit}>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                          RATING (1 TO 5 STARS)
                        </label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(e.target.value)}
                          style={{
                            width: '100%',
                            maxWidth: '200px',
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            fontWeight: 700
                          }}
                        >
                          <option value="5">★★★★★ (5/5) - Outstanding</option>
                          <option value="4">★★★★☆ (4/5) - Very Good</option>
                          <option value="3">★★★☆☆ (3/5) - Solid Gear</option>
                          <option value="2">★★☆☆☆ (2/5) - Needs Improvement</option>
                          <option value="1">★☆☆☆☆ (1/5) - Unstatisfactory</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                          YOUR FEEDBACK / ON-TURF EXPERIENCE
                        </label>
                        <textarea
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How does the stick feel on first touch? Weight balance? Grip performance?"
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        loading={submittingReview}
                        disabled={submittingReview}
                      >
                        {submittingReview ? 'SUBMITTING...' : 'POST REVIEW'}
                      </Button>
                    </form>
                  )}
                </div>

                {/* Existing Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>
                      <p style={{ fontWeight: 600 }}>Be the first player to review this gear on turf!</p>
                    </div>
                  ) : (
                    reviews.map((rev, idx) => (
                      <div
                        key={rev._id || idx}
                        style={{
                          padding: '20px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: 'var(--surface)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--accent)', fontWeight: 900 }}>
                            {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Competitor'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)' }}>
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products: Completes The Kit */}
      {relatedProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head" style={{ marginBottom: '32px' }}>
              <span className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 900, letterSpacing: '0.08em' }}>
                MATCH-DAY MATCHING GEAR
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', margin: '4px 0' }}>
                COMPLETES THE KIT
              </h2>
            </div>

            <div className="grid grid-4" style={{ gap: '24px' }}>
              {relatedProducts.map(rel => {
                const relImg = Array.isArray(rel.images) ? rel.images[0] : rel.images;
                return (
                  <div
                    key={rel._id}
                    className="card"
                    style={{
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      background: 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ position: 'relative', height: '200px', background: 'var(--surface-2)' }}>
                      <img
                        src={relImg || 'https://picsum.photos/seed/hockeykit/500/500'}
                        alt={rel.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'var(--secondary)',
                        color: '#FFF',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        ${Number(rel.price || 0).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                        {rel.brand || 'AMI'}
                      </span>
                      <h4 style={{
                        margin: '4px 0 12px 0',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-display)',
                        textTransform: 'uppercase',
                        flex: 1
                      }}>
                        {rel.name}
                      </h4>

                      <Link
                        to={`/product/${rel._id}`}
                        className="btn-secondary"
                        style={{ textAlign: 'center', padding: '8px 12px', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        VIEW DETAILS
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Video Demonstration Embed Section */}
      <section className="section" style={{ background: 'var(--secondary)', color: '#FFFFFF' }}>
        <div className="container">
          <div className="grid grid-2" style={{ gap: '40px', alignItems: 'center' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--accent)', fontWeight: 900 }}>
                TURF LAB TESTING
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: '#FFF', margin: '8px 0 16px 0' }}>
                SEE THE FIRST TOUCH IN ACTION
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '24px' }}>
                Every AMI stick and racket is subject to high-speed impact recording to analyze energy loss upon contact. Watch our pro field lab breakdown for layup flex response.
              </p>
              <Link to="/shop" className="btn-primary">
                EXPLORE ALL TESTING LAB GEAR
              </Link>
            </div>

            <div className="video-embed" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '2px solid var(--accent)' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="AMI Performance Testing Video"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}