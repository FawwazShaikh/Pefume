import { useState, useEffect } from 'react';
import { useAuth, useUser, SignInButton } from '@clerk/clerk-react';
import './AdminPage.css';

const statusStyles = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  PROCESSING: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  SHIPPED: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  DELIVERED: 'bg-green-500/10 text-green-500 border border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-500 border border-red-500/20',
};

export default function AdminPage() {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: userLoaded } = useUser();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard Data State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockVariants: [],
    bestSellers: []
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);

  // Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    brand: '',
    featured: false,
    categoryId: '',
    images: [{ imageUrl: '', altText: '', position: 0 }],
    variants: [{ size: '5ml Decant', price: '', stock: '20', sku: '' }]
  });

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [submittingCategory, setSubmittingCategory] = useState(false);

  // Global loading/error
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Verify admin role
  useEffect(() => {
    async function checkAdminRole() {
      if (!isSignedIn) {
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setIsAdmin(false);
          setCheckingRole(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const profile = await res.json();
          if (profile.role === 'ADMIN') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    }

    if (authLoaded) {
      checkAdminRole();
    }
  }, [isSignedIn, authLoaded]);

  // 2. Fetch data based on active tab
  useEffect(() => {
    if (!isAdmin) return;

    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'products') {
      fetchProductsAndCategories();
    }
  }, [isAdmin, activeTab, orderStatusFilter]);

  // --- API FETCH FUNCTIONS ---
  const fetchDashboardStats = async () => {
    try {
      setLoadingData(true);
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingData(true);
      const token = await getToken();
      const url = `http://localhost:5000/api/admin/orders?status=${orderStatusFilter}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchProductsAndCategories = async () => {
    try {
      setLoadingData(true);
      const token = await getToken();
      
      // Fetch categories
      const catRes = await fetch('http://localhost:5000/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // Fetch products (all including inactive for admin dashboard)
      // Standard products api
      const prodRes = await fetch('http://localhost:5000/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // --- ACTIONS ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Update local orders state
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    try {
      setSubmittingCategory(true);
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName, slug: newCatSlug })
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories([...categories, newCat]);
        setNewCatName('');
        setNewCatSlug('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const token = await getToken();
      const method = editingProduct ? 'PATCH' : 'POST';
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct.id}` 
        : 'http://localhost:5000/api/products';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        fetchProductsAndCategories(); // Refresh product list
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to save product');
      }
    } catch (err) {
      setErrorMsg('Network error saving product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProductsAndCategories(); // Refresh product list
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper form updates
  const addImageField = () => {
    setProductForm({
      ...productForm,
      images: [...productForm.images, { imageUrl: '', altText: '', position: productForm.images.length }]
    });
  };

  const removeImageField = (idx) => {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_, i) => i !== idx)
    });
  };

  const updateImageField = (idx, field, val) => {
    const updated = productForm.images.map((img, i) => 
      i === idx ? { ...img, [field]: val } : img
    );
    setProductForm({ ...productForm, images: updated });
  };

  const addVariantField = () => {
    setProductForm({
      ...productForm,
      variants: [...productForm.variants, { size: '10ml Decant', price: '', stock: '20', sku: '' }]
    });
  };

  const removeVariantField = (idx) => {
    setProductForm({
      ...productForm,
      variants: productForm.variants.filter((_, i) => i !== idx)
    });
  };

  const updateVariantField = (idx, field, val) => {
    const updated = productForm.variants.map((v, i) => 
      i === idx ? { ...v, [field]: val } : v
    );
    setProductForm({ ...productForm, variants: updated });
  };

  const startEditProduct = async (prod) => {
    try {
      setLoadingData(true);
      // Fetch details including variants
      const res = await fetch(`http://localhost:5000/api/products/${prod.slug}`);
      if (res.ok) {
        const fullProd = await res.json();
        setEditingProduct(fullProd);
        setProductForm({
          name: fullProd.name || '',
          slug: fullProd.slug || '',
          description: fullProd.description || '',
          brand: fullProd.brand || '',
          featured: !!fullProd.featured,
          categoryId: fullProd.categoryId || '',
          images: fullProd.images.length > 0 ? fullProd.images.map(img => ({
            imageUrl: img.imageUrl,
            altText: img.altText || '',
            position: img.position
          })) : [{ imageUrl: '', altText: '', position: 0 }],
          variants: fullProd.variants.length > 0 ? fullProd.variants.map(v => ({
            size: v.size,
            price: v.price.toString(),
            stock: v.stock.toString(),
            sku: v.sku || ''
          })) : [{ size: '5ml Decant', price: '', stock: '20', sku: '' }]
        });
        setErrorMsg('');
        setShowProductModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      description: '',
      brand: '',
      featured: false,
      categoryId: '',
      images: [{ imageUrl: '', altText: '', position: 0 }],
      variants: [{ size: '5ml Decant', price: '', stock: '20', sku: '' }]
    });
    setErrorMsg('');
    setShowProductModal(true);
  };

  // --- SCREEN RENDERS ---
  if (!authLoaded || !userLoaded || checkingRole) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-[#E2C275] mb-2 font-serif text-xl tracking-wide animate-pulse">Accessing Secure Vault...</p>
          <p className="text-xs text-[#f0ede8]/50">Verifying administrative credentials.</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] flex items-center justify-center font-sans px-4">
        <div className="max-w-md w-full text-center bg-[#141414] border border-[#E2C275]/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E2C275] via-[#C8A855] to-[#E2C275]" />
          <h2 className="font-serif text-2xl text-[#E2C275] tracking-wide mb-3 uppercase">Admin Control Panel</h2>
          <p className="text-sm text-[#f0ede8]/70 mb-6 leading-relaxed">
            Administrative access is restricted to verified coordinators. Please authenticate to continue.
          </p>
          <SignInButton mode="modal">
            <button className="w-full py-3 bg-[#E2C275] text-[#120E0D] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#F4E7C5] transition-all duration-300 cursor-pointer">
              Admin Authenticate
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] flex items-center justify-center font-sans px-4">
        <div className="max-w-md w-full text-center bg-[#141414] border border-red-500/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
          <h2 className="font-serif text-2xl text-red-500 tracking-wide mb-3 uppercase">Access Denied</h2>
          <p className="text-sm text-[#f0ede8]/70 mb-6 leading-relaxed">
            Your profile lacks the administrative credentials required to view this interface.
          </p>
          <button 
            onClick={() => { window.location.hash = ''; }}
            className="w-full py-3 bg-transparent border border-white/20 text-[#f0ede8] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Atelier Console</h1>
            <div className="admin-subtitle">Decant Atelier Admin Dashboard</div>
          </div>
          <button 
            onClick={() => { window.location.hash = ''; }}
            className="admin-btn-secondary"
          >
            Storefront
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="admin-tabs-nav">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')} 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          >
            Products & Catalog
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            Orders List
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            Registered Users
          </button>
        </nav>

        {/* Global Loading Overlay */}
        {loadingData && (
          <div className="text-center py-8">
            <span className="text-xs text-[#E2C275] tracking-widest uppercase animate-pulse">Syncing data feeds...</span>
          </div>
        )}

        {/* TAB CONTENTS */}

        {/* Tab 1: Dashboard Stats */}
        {activeTab === 'dashboard' && !loadingData && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-label">Total Revenue</div>
                <div className="admin-stat-value">₹ {stats.totalRevenue.toLocaleString('en-IN')}.00</div>
                <div className="admin-stat-icon">💰</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Total Orders</div>
                <div className="admin-stat-value">{stats.totalOrders}</div>
                <div className="admin-stat-icon">📦</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Registered Collectors</div>
                <div className="admin-stat-value">{stats.totalUsers}</div>
                <div className="admin-stat-icon">👤</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Pending Orders</div>
                <div className="admin-stat-value">{stats.pendingOrders}</div>
                <div className="admin-stat-icon">⌛</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Best Sellers */}
              <div className="admin-card">
                <h3 className="admin-card-title">Top Fragrances</h3>
                {stats.bestSellers.length === 0 ? (
                  <p className="text-xs text-[#f0ede8]/40">No orders logged to calculate best sellers.</p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th className="text-right">Quantity Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.bestSellers.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.productName}</td>
                            <td className="text-right font-mono text-[#E2C275]">{item.totalQuantity} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Low Stock Alerts */}
              <div className="admin-card">
                <h3 className="admin-card-title">Stock Alerts</h3>
                {stats.lowStockVariants.length === 0 ? (
                  <p className="text-xs text-green-500">All atomizers and full bottles fully stocked.</p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Fragrance</th>
                          <th>Size</th>
                          <th>SKU</th>
                          <th className="text-right">In Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.lowStockVariants.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.productName}</td>
                            <td>{item.size}</td>
                            <td className="font-mono text-white/50">{item.sku}</td>
                            <td className="text-right font-mono text-red-400 font-bold">{item.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Catalog */}
        {activeTab === 'products' && !loadingData && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
            {/* Products List */}
            <div className="admin-card">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#E2C275]/10">
                <h3 className="font-serif text-lg text-[#E2C275] uppercase">Catalog Listing</h3>
                <button 
                  onClick={openCreateModal}
                  className="admin-btn"
                >
                  + Create Product
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Starting Price</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[0.65rem] text-[#f0ede8]/50">/{p.slug}</div>
                        </td>
                        <td>{p.brand}</td>
                        <td>{p.category || 'N/A'}</td>
                        <td className="font-mono">₹ {p.startingPrice.toLocaleString('en-IN')}</td>
                        <td className="text-right space-x-2">
                          <button 
                            onClick={() => startEditProduct(p)}
                            className="text-xs text-[#E2C275] hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-xs text-red-400 hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Categories Management */}
            <div className="admin-card">
              <h3 className="admin-card-title">Fragrance Categories</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4 mb-8">
                <div className="admin-form-group">
                  <label className="admin-label">Category Name</label>
                  <input 
                    type="text" 
                    required
                    className="admin-input" 
                    placeholder="e.g. Woody Oriental"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Slug</label>
                  <input 
                    type="text" 
                    required
                    className="admin-input" 
                    placeholder="e.g. woody-oriental"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submittingCategory} 
                  className="admin-btn w-full"
                >
                  {submittingCategory ? 'Adding...' : 'Add Category'}
                </button>
              </form>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Slug</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td className="font-mono text-white/50">{c.slug}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Orders List */}
        {activeTab === 'orders' && !loadingData && (
          <div className="admin-card">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#E2C275]/10">
              <h3 className="font-serif text-lg text-[#E2C275] uppercase">Orders Pipeline</h3>
              <div>
                <select 
                  className="admin-select"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="ALL">Show All Orders</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-[#f0ede8]/40 py-4 text-center">No orders matching status filter.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Client</th>
                      <th>Items Purchased</th>
                      <th>Total Amount</th>
                      <th>Pipeline Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const clientName = o.user?.name || 'Collector';
                      const clientEmail = o.user?.email || 'N/A';
                      const orderDate = new Date(o.createdAt).toLocaleDateString('en-IN');
                      
                      return (
                        <tr key={o.id}>
                          <td>
                            <div className="font-mono font-bold text-white">#{o.id.slice(-8).toUpperCase()}</div>
                            <div className="text-[0.65rem] text-[#f0ede8]/50">{orderDate}</div>
                          </td>
                          <td>
                            <div className="font-medium">{clientName}</div>
                            <div className="text-[0.65rem] text-white/50 font-mono">{clientEmail}</div>
                          </td>
                          <td>
                            <div className="space-y-1">
                              {o.orderItems.map(item => (
                                <div key={item.id} className="text-xs">
                                  • {item.productName} ({item.size}) <span className="text-[#E2C275] font-bold">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="font-mono text-white font-bold">₹ {o.total.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`admin-badge ${statusStyles[o.status] || 'bg-white/10 text-white'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <select 
                              className="admin-select py-1 text-xs w-32"
                              value={o.status}
                              disabled={updatingOrderId === o.id}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Users Table */}
        {activeTab === 'users' && !loadingData && (
          <div className="admin-card">
            <h3 className="admin-card-title">Registered Collectors</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Joined</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th className="text-right">Total Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="font-mono text-white/50">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="font-bold text-white">{u.name || 'Collector'}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <span className={`admin-badge ${u.role === 'ADMIN' ? 'bg-[#E2C275]/20 text-[#E2C275]' : 'bg-white/5 text-white/70'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-right font-mono font-bold text-[#E2C275]">{u.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Product Create/Edit Modal Dialog */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-[#E2C275]/30 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl my-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E2C275] via-[#C8A855] to-[#E2C275]" />
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-[#E2C275]/10">
              <h3 className="font-serif text-lg font-bold text-[#E2C275] uppercase">
                {editingProduct ? 'Edit Fragrance' : 'Create Fragrance'}
              </h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="text-[#f0ede8]/50 hover:text-white transition-colors text-lg font-bold bg-transparent border-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg mb-4 text-center">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="admin-form-group">
                  <label className="admin-label">Product Name</label>
                  <input 
                    type="text" 
                    required
                    className="admin-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Slug</label>
                  <input 
                    type="text" 
                    required
                    className="admin-input"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="admin-form-group">
                  <label className="admin-label">Brand House</label>
                  <input 
                    type="text" 
                    required
                    className="admin-input"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Category</label>
                  <select 
                    className="admin-select"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group flex items-center pt-6">
                  <input 
                    type="checkbox" 
                    id="featCheckbox"
                    className="accent-[#E2C275] scale-110 cursor-pointer mr-2"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  />
                  <label htmlFor="featCheckbox" className="admin-label m-0 cursor-pointer">Featured Product</label>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Description</label>
                <textarea 
                  rows="3"
                  className="admin-textarea"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              {/* Images Fields */}
              <div className="border border-white/5 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="admin-label m-0">Product Images</span>
                  <button type="button" onClick={addImageField} className="text-[#E2C275] hover:underline cursor-pointer bg-transparent border-none">
                    + Add Image URL
                  </button>
                </div>
                {productForm.images.map((img, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Image URL"
                      required
                      className="admin-input flex-grow"
                      value={img.imageUrl}
                      onChange={(e) => updateImageField(idx, 'imageUrl', e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Alt Text"
                      className="admin-input w-28"
                      value={img.altText}
                      onChange={(e) => updateImageField(idx, 'altText', e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImageField(idx)} 
                      disabled={productForm.images.length === 1}
                      className="text-red-400 font-bold hover:underline cursor-pointer bg-transparent border-none disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {/* Variants Fields */}
              <div className="border border-white/5 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="admin-label m-0">Product Variants (Atomizers/Bottles)</span>
                  <button type="button" onClick={addVariantField} className="text-[#E2C275] hover:underline cursor-pointer bg-transparent border-none">
                    + Add Variant
                  </button>
                </div>
                {productForm.variants.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Size (e.g. 5ml Decant)"
                      required
                      className="admin-input"
                      value={v.size}
                      onChange={(e) => updateVariantField(idx, 'size', e.target.value)}
                    />
                    <input 
                      type="number" 
                      placeholder="Price (INR)"
                      required
                      className="admin-input"
                      value={v.price}
                      onChange={(e) => updateVariantField(idx, 'price', e.target.value)}
                    />
                    <input 
                      type="number" 
                      placeholder="Stock"
                      required
                      className="admin-input"
                      value={v.stock}
                      onChange={(e) => updateVariantField(idx, 'stock', e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="SKU"
                      className="admin-input"
                      value={v.sku}
                      onChange={(e) => updateVariantField(idx, 'sku', e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeVariantField(idx)} 
                      disabled={productForm.variants.length === 1}
                      className="text-red-400 font-bold hover:underline cursor-pointer bg-transparent border-none disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="submit" className="admin-btn flex-grow">
                  {editingProduct ? 'Save Changes' : 'Create Fragrance'}
                </button>
                <button type="button" onClick={() => setShowProductModal(false)} className="admin-btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
