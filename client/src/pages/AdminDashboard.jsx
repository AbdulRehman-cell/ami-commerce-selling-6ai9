import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Spinner, Badge, Alert, Input, Textarea, Modal, Stat, Table, Tabs, toast } from '../components/ui';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  
  // Product Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'hockey-sticks',
    brand: 'AMI',
    price: '',
    stock: '',
    skillLevel: 'intermediate',
    images: '',
    description: '',
    sizes: '36.5" / 565g, 37.5" / 575g'
  });

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resProducts, resOrders] = await Promise.all([
        axios.get('/api/products').catch(() => ({ data: [] })),
        axios.get('/api/orders').catch(() => ({ data: [] }))
      ]);

      const loadedProducts = Array.isArray(resProducts.data) ? resProducts.data : [];
      const loadedOrders = Array.isArray(resOrders.data) ? resOrders.data : [];

      setProducts(loadedProducts);
      setOrders(loadedOrders);
    } catch (err) {
      console.error(err);
      setError('Failed to sync control room metrics. Refreshing token...');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract array from product.images
  const getProductImage = (imgs) => {
    if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
    if (typeof imgs === 'string' && imgs) return imgs.split(',')[0].trim();
    return 'https://picsum.photos/seed/stick1/600/600';
  };

  // Compute Metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const lowStockItems = products.filter(p => (p.stock || 0) < 10);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  // Handle Product Save (Create or Edit)
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name || '',
        category: prod.category || 'hockey-sticks',
        brand: prod.brand || 'AMI',
        price: prod.price ?? '',
        stock: prod.stock ?? '',
        skillLevel: prod.skillLevel || 'intermediate',
        images: Array.isArray(prod.images) ? prod.images.join(', ') : (prod.images || ''),
        description: prod.description || '',
        sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.sizes || '')
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'hockey-sticks',
        brand: 'AMI',
        price: '',
        stock: '',
        skillLevel: 'intermediate',
        images: '',
        description: '',
        sizes: '36.5" / 565g, 37.5" / 575g'
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Please complete all required product fields');
      return;
    }

    setSavingProduct(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: typeof formData.images === 'string' ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : formData.images,
        sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : formData.sizes
      };

      if (editingProduct) {
        const res = await axios.put(`/api/products/${editingProduct._id}`, payload);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
        toast.success(`Updated ${payload.name}`);
      } else {
        const res = await axios.post('/api/products', payload);
        setProducts([res.data, ...products]);
        toast.success(`Created ${payload.name}`);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product specification.');
    } finally {
      setSavingProduct(false);
    }
  };

  // Stock Quick-Edit
  const handleQuickStockUpdate = async (productId, newStock) => {
    const validStock = Math.max(0, parseInt(newStock, 10) || 0);
    try {
      const res = await axios.put(`/api/products/${productId}`, { stock: validStock });
      setProducts(products.map(p => p._id === productId ? res.data : p));
      toast.success('Inventory counts updated');
    } catch (err) {
      toast.error('Could not update inventory count');
    }
  };

  // Handle Order Status Update
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId.slice(-6)} marked as ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to change order status');
    }
  };

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.brand?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o._id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.userId?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="section container text-center" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div>
          <Spinner size="lg" color="primary" />
          <p className="eyebrow" style={{ marginTop: '16px' }}>INITIALIZING CONTROL ROOM METRICS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page animate-in">
      {/* Compact Page Hero Header */}
      <section className="admin-header-hero">
        <div className="container">
          <div className="hero-split-compact">
            <div>
              <span className="eyebrow">COMMAND CENTER & DISTRIBUTION</span>
              <h1>CONTROL <span className="gradient-text">ROOM</span></h1>
              <p className="hero-subtitle">
                Monitor live inventory, shift dispatch orders, and manage precision gear catalog specs.
              </p>
            </div>
            <div className="header-actions">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => handleOpenProductModal()}
                iconLeft={<span style={{ fontSize: '1.2rem', fontWeight: 900 }}>+</span>}
              >
                ADD NEW PRODUCT
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        {error && (
          <Alert variant="error" dismissible style={{ marginBottom: '24px' }}>
            {error}
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="admin-tabs-wrapper">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.Tab value="overview">OVERVIEW & ANALYTICS</Tabs.Tab>
            <Tabs.Tab value="products">PRODUCT CATALOG ({products.length})</Tabs.Tab>
            <Tabs.Tab value="orders">ORDER DISPATCH ({orders.length})</Tabs.Tab>
            <Tabs.Tab value="inventory">LOW STOCK ALERTS ({lowStockItems.length})</Tabs.Tab>
          </Tabs>
        </div>

        {/* ==================== TAB 1: OVERVIEW & ANALYTICS ==================== */}
        {activeTab === 'overview' && (
          <div className="tab-content animate-in">
            {/* KPI Cards Row */}
            <div className="grid grid-4 stats-overview-row">
              <Card variant="bordered">
                <Stat 
                  value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
                  label="TOTAL REVENUE" 
                  delta="+18.4%" 
                  deltaType="up" 
                />
              </Card>
              <Card variant="bordered">
                <Stat 
                  value={totalOrders.toString()} 
                  label="ORDERS PROCESSED" 
                  delta="+12%" 
                  deltaType="up" 
                />
              </Card>
              <Card variant="bordered">
                <Stat 
                  value={lowStockItems.length.toString()} 
                  label="LOW STOCK ALERTS" 
                  delta={lowStockItems.length > 0 ? "ACTION NEEDED" : "HEALTHY"} 
                  deltaType={lowStockItems.length > 0 ? "down" : "neutral"} 
                />
              </Card>
              <Card variant="bordered">
                <Stat 
                  value={pendingOrders.length.toString()} 
                  label="DISPATCH PENDING" 
                  delta="24h SLA" 
                  deltaType="neutral" 
                />
              </Card>
            </div>

            <div className="whistle-stripe" style={{ margin: '40px 0' }} />

            {/* Performance Visualizer & Top Sellers */}
            <div className="grid grid-2">
              <Card variant="bordered">
                <div className="card-header-flex">
                  <div>
                    <span className="eyebrow">REVENUE TRENDS</span>
                    <h3 className="uppercase">WHAT'S SELLING, WHAT'S NOT</h3>
                  </div>
                  <Badge variant="primary">LIVE STREAM</Badge>
                </div>
                <p className="text-muted" style={{ marginBottom: '24px' }}>
                  Weekly volume across Field Hockey Composite Bows vs. Padel Precision Rackets.
                </p>

                {/* Simulated Chart Bars */}
                <div className="analytics-bar-chart">
                  <div className="chart-bar-group">
                    <div className="bar-fill" style={{ height: '85%' }}><span className="bar-val">$14.2k</span></div>
                    <span className="bar-label">MON</span>
                  </div>
                  <div className="chart-bar-group">
                    <div className="bar-fill" style={{ height: '60%' }}><span className="bar-val">$9.8k</span></div>
                    <span className="bar-label">TUE</span>
                  </div>
                  <div className="chart-bar-group">
                    <div className="bar-fill" style={{ height: '95%' }}><span className="bar-val">$16.5k</span></div>
                    <span className="bar-label">WED</span>
                  </div>
                  <div className="chart-bar-group">
                    <div className="bar-fill" style={{ height: '70%' }}><span className="bar-val">$11.1k</span></div>
                    <span className="bar-label">THU</span>
                  </div>
                  <div className="chart-bar-group">
                    <div className="bar-fill" style={{ height: '100%' }}><span className="bar-val">$18.9k</span></div>
                    <span className="bar-label">FRI</span>
                  </div>
                  <div className="chart-bar-group">
                    <div className="bar-fill" style={{ height: '40%' }}><span className="bar-val">$6.2k</span></div>
                    <span className="bar-label">SAT</span>
                  </div>
                  <div className="chart-bar-group">
                    <div className="bar-fill" style={{ height: '50%' }}><span className="bar-val">$8.0k</span></div>
                    <span className="bar-label">SUN</span>
                  </div>
                </div>
              </Card>

              {/* Category Breakdown & Performance Summary */}
              <Card variant="bordered">
                <span className="eyebrow">CATEGORY SHARE</span>
                <h3 className="uppercase">PRO-GRADE RATIO</h3>
                <p className="text-muted" style={{ marginBottom: '24px' }}>
                  Distribution of units sold in current match cycle.
                </p>

                <div className="category-progress-list">
                  <div className="progress-item">
                    <div className="progress-label-row">
                      <span>FIELD HOCKEY STICKS</span>
                      <strong>52% (284 units)</strong>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '52%', background: 'var(--primary)' }} />
                    </div>
                  </div>

                  <div className="progress-item">
                    <div className="progress-label-row">
                      <span>PADEL RACKETS</span>
                      <strong>34% (186 units)</strong>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '34%', background: 'var(--secondary)' }} />
                    </div>
                  </div>

                  <div className="progress-item">
                    <div className="progress-label-row">
                      <span>MATCH KIT & PROTECTION</span>
                      <strong>14% (78 units)</strong>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '14%', background: 'var(--accent)' }} />
                    </div>
                  </div>
                </div>

                <div className="pro-tip-box" style={{ marginTop: '28px' }}>
                  <div className="badge badge-primary">PRO INSIGHT</div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)' }}>
                    Low-bow carbon sticks (36.5") are outperforming mid-bows 3-to-1. Reallocate composite layup production before weekend tournament surges.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PRODUCTS MANAGER ==================== */}
        {activeTab === 'products' && (
          <div className="tab-content animate-in">
            {/* Control Bar */}
            <div className="filter-control-bar">
              <div className="filter-inputs">
                <Input 
                  placeholder="Search by gear name or brand..." 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ minWidth: '280px' }}
                />
                <select 
                  className="admin-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">ALL CATEGORIES</option>
                  <option value="hockey-sticks">HOCKEY STICKS</option>
                  <option value="paddle-rackets">PADEL RACKETS</option>
                  <option value="kit-apparel">KIT & PROTECTION</option>
                </select>
              </div>
              <Button variant="primary" onClick={() => handleOpenProductModal()}>
                + ADD PRODUCT
              </Button>
            </div>

            {/* Products Data Table */}
            <Card variant="bordered" padding="none">
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Th>GEAR ITEM</Table.Th>
                    <Table.Th>CATEGORY</Table.Th>
                    <Table.Th>BRAND</Table.Th>
                    <Table.Th>PRICE</Table.Th>
                    <Table.Th>STOCK</Table.Th>
                    <Table.Th>SKILL FIT</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>ACTIONS</Table.Th>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {filteredProducts.length === 0 ? (
                    <Table.Row>
                      <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                        <span className="text-muted">No gear items found matching criteria.</span>
                      </Table.Td>
                    </Table.Row>
                  ) : (
                    filteredProducts.map((p) => {
                      const img = getProductImage(p.images);
                      return (
                        <Table.Row key={p._id}>
                          <Table.Td>
                            <div className="table-product-cell">
                              <img src={img} alt={p.name} className="table-thumb" />
                              <div>
                                <strong style={{ display: 'block', textTransform: 'uppercase' }}>{p.name}</strong>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>ID: {p._id.slice(-6)}</span>
                              </div>
                            </div>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="neutral">
                              {(p.category || 'Gear').replace('-', ' ').toUpperCase()}
                            </Badge>
                          </Table.Td>
                          <Table.Td><strong>{p.brand || 'AMI'}</strong></Table.Td>
                          <Table.Td><strong>${p.price?.toFixed(2)}</strong></Table.Td>
                          <Table.Td>
                            <span className={p.stock < 10 ? 'stock-warning-text' : ''}>
                              {p.stock} units
                            </span>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant={p.skillLevel === 'pro' ? 'primary' : 'secondary'}>
                              {(p.skillLevel || 'ALL').toUpperCase()}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <Button size="sm" variant="ghost" onClick={() => handleOpenProductModal(p)}>
                                EDIT
                              </Button>
                            </div>
                          </Table.Td>
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
              </Table>
            </Card>
          </div>
        )}

        {/* ==================== TAB 3: ORDERS DISPATCH ==================== */}
        {activeTab === 'orders' && (
          <div className="tab-content animate-in">
            {/* Control Bar */}
            <div className="filter-control-bar">
              <div className="filter-inputs">
                <Input 
                  placeholder="Search order ID or customer reference..." 
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ minWidth: '280px' }}
                />
                <select 
                  className="admin-select"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">ALL STATUSES</option>
                  <option value="pending">PENDING DISPATCH</option>
                  <option value="shipped">SHIPPED</option>
                  <option value="delivered">DELIVERED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Orders Data Table */}
            <Card variant="bordered" padding="none">
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Th>ORDER REF</Table.Th>
                    <Table.Th>DATE</Table.Th>
                    <Table.Th>ITEMS</Table.Th>
                    <Table.Th>TOTAL</Table.Th>
                    <Table.Th>STATUS</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>UPDATE STATUS</Table.Th>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {filteredOrders.length === 0 ? (
                    <Table.Row>
                      <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                        <span className="text-muted">No dispatch orders match that criteria.</span>
                      </Table.Td>
                    </Table.Row>
                  ) : (
                    filteredOrders.map((ord) => (
                      <Table.Row key={ord._id}>
                        <Table.Td>
                          <strong>#AMI-{(ord._id || '').slice(-6).toUpperCase()}</strong>
                        </Table.Td>
                        <Table.Td>
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Today'}
                        </Table.Td>
                        <Table.Td>
                          {Array.isArray(ord.items) ? (
                            <span>{ord.items.length} items ({ord.items.map(i => i.name || 'Item').join(', ').slice(0, 30)}...)</span>
                          ) : (
                            <span>1 item</span>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <strong>${(ord.totalAmount || 0).toFixed(2)}</strong>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            variant={
                              ord.status === 'delivered' ? 'success' : 
                              ord.status === 'shipped' ? 'primary' : 
                              ord.status === 'pending' ? 'warning' : 'danger'
                            }
                          >
                            {(ord.status || 'pending').toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <select 
                            className="status-dropdown-inline"
                            value={ord.status || 'pending'}
                            onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                          >
                            <option value="pending">PENDING</option>
                            <option value="shipped">SHIPPED</option>
                            <option value="delivered">DELIVERED</option>
                            <option value="cancelled">CANCELLED</option>
                          </select>
                        </Table.Td>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </Card>
          </div>
        )}

        {/* ==================== TAB 4: LOW STOCK ALERTS ==================== */}
        {activeTab === 'inventory' && (
          <div className="tab-content animate-in">
            <div className="section-head" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <span className="eyebrow">TURF-READY SUPPLY CHAIN</span>
              <h2>CRITICAL INVENTORY REPLENISHMENT</h2>
              <p className="hero-subtitle">
                Items with stock under 10 units require quick factory updates to prevent out-of-stock bounce rates.
              </p>
            </div>

            {lowStockItems.length === 0 ? (
              <Card variant="bordered" style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡</div>
                <h3 className="uppercase">INVENTORY HEALTH IS PERFECT</h3>
                <p className="text-muted">All sticks, rackets, and kit items have sufficient floor quantities.</p>
              </Card>
            ) : (
              <div className="grid grid-3">
                {lowStockItems.map((item) => (
                  <Card key={item._id} variant="bordered" className="stock-alert-card">
                    <div className="alert-card-header">
                      <img src={getProductImage(item.images)} alt={item.name} className="alert-thumb" />
                      <div>
                        <Badge variant="danger">LOW STOCK: {item.stock} LEFT</Badge>
                        <h4 className="uppercase" style={{ margin: '8px 0 0 0' }}>{item.name}</h4>
                      </div>
                    </div>
                    <div style={{ margin: '16px 0' }}>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>SKILL LEVEL: {item.skillLevel?.toUpperCase()}</span>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>${item.price}</div>
                    </div>
                    <div className="quick-stock-form">
                      <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>UPDATE STOCK COUNT:</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <input 
                          type="number" 
                          defaultValue={item.stock} 
                          id={`stock-input-${item._id}`}
                          className="quick-stock-input"
                        />
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => {
                            const val = document.getElementById(`stock-input-${item._id}`)?.value;
                            handleQuickStockUpdate(item._id, val);
                          }}
                        >
                          SAVE
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== PRODUCT EDIT/CREATE MODAL ==================== */}
        <Modal 
          open={isProductModalOpen} 
          onClose={() => setIsProductModalOpen(false)} 
          title={editingProduct ? "EDIT GEAR SPECIFICATION" : "ADD NEW PERFORMANCE GEAR"}
          size="lg"
        >
          <form onSubmit={handleSaveProduct} className="modal-form-grid">
            <div className="grid grid-2">
              <Input 
                label="PRODUCT NAME *" 
                placeholder="e.g. Vortex Pro Carbon 95" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input 
                label="BRAND" 
                placeholder="AMI or Gryphon" 
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div className="grid grid-3">
              <div>
                <label className="input-label">CATEGORY *</label>
                <select 
                  className="admin-select" 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="hockey-sticks">Hockey Sticks</option>
                  <option value="paddle-rackets">Paddle Rackets</option>
                  <option value="kit-apparel">Kit & Apparel</option>
                </select>
              </div>

              <Input 
                label="PRICE ($) *" 
                type="number" 
                step="0.01" 
                placeholder="249.99" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />

              <Input 
                label="INITIAL STOCK *" 
                type="number" 
                placeholder="25" 
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-2">
              <div>
                <label className="input-label">SKILL LEVEL</label>
                <select 
                  className="admin-select" 
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="pro">Pro Match</option>
                </select>
              </div>

              <Input 
                label="SIZES / WEIGHTS (Comma separated)" 
                placeholder='36.5" / 565g, 37.5" / 575g' 
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              />
            </div>

            <Textarea 
              label="IMAGE URLS (Comma separated)" 
              placeholder="https://picsum.photos/seed/stick1/600/600, https://picsum.photos/seed/stick2/600/600"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              rows={2}
            />

            <Textarea 
              label="TECHNICAL DESCRIPTION" 
              placeholder="Hand-finished carbon layup tuned for a lower bow profile..." 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Modal.Footer>
              <Button variant="ghost" type="button" onClick={() => setIsProductModalOpen(false)}>
                CANCEL
              </Button>
              <Button variant="primary" type="submit" loading={savingProduct}>
                {editingProduct ? "SAVE CHANGES" : "PUBLISH GEAR"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>

      </div>
    </div>
  );
}