import { useState, useEffect, useMemo } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { getCart, updateQuantity, removeFromCart } from '../utils/cartHelper';
import './CartPage.css';

export default function CartPage({ onBackToShop }) {
  const { isSignedIn, getToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Checkout flow states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  // Address creation form states (inline if needed)
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Load cart items initially and listen for dynamic updates
  const loadCart = () => {
    setCartItems(getCart());
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    return () => {
      window.removeEventListener('cart-updated', loadCart);
    };
  }, []);

  // Fetch addresses when starting checkout
  useEffect(() => {
    if (isSignedIn && isCheckingOut) {
      fetchAddresses();
    }
  }, [isSignedIn, isCheckingOut]);

  const fetchAddresses = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        const def = data.find(a => a.isDefault);
        if (def) setSelectedAddressId(def.id);
        else if (data.length > 0) setSelectedAddressId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Free Shipping configuration
  const FREE_SHIPPING_THRESHOLD = 1999; // Adjusted to match ScrollingMarquee
  const SHIPPING_COST = 90;

  const shipping = useMemo(() => {
    if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_COST;
  }, [subtotal]);

  const grandTotal = subtotal + shipping;
  const neededForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleBackToShop = () => {
    if (onBackToShop) {
      onBackToShop();
    } else {
      window.location.hash = 'shop';
    }
  };

  const handleContinueToCheckout = () => {
    if (!isSignedIn) {
      // Handled via SignInButton wrapper or notification
      return;
    }
    setIsCheckingOut(true);
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      if (res.ok) {
        const created = await res.json();
        setAddresses([created, ...addresses]);
        setSelectedAddressId(created.id);
        setShowAddAddress(false);
        setNewAddress({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          isDefault: false
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address.');
      return;
    }
    try {
      setPlacingOrder(true);
      const token = await getToken();
      // Map frontend cart properties to backend format
      const items = cartItems.map(item => ({
        productId: item.productId || item.id,
        variantId: item.variantId || 'default-variant',
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      }));

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          items,
          paymentMethod,
          notes
        })
      });

      if (res.ok) {
        // Clear cart
        localStorage.setItem('cart', '[]');
        localStorage.setItem('cartCount', '0');
        window.dispatchEvent(new Event('cart-updated'));
        setOrderPlacedSuccess(true);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      alert('Network error placing order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlacedSuccess) {
    return (
      <div className="cart-empty-container font-body py-24 select-none">
        <div className="cart-empty-content max-w-md bg-white border border-[#B08A50]/20 p-8 rounded-2xl shadow-xl text-center">
          <div className="text-5xl text-[#B08A50] mb-4">✦</div>
          <h2 className="cart-empty-title font-heading text-2xl mb-2 text-[#1C1B18]">Order Placed Successfully!</h2>
          <p className="cart-empty-text text-sm text-[#1C1B18]/70 mb-6 leading-relaxed">
            Thank you for your purchase. Your olfactory journey is being prepared at our atelier.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => { window.location.hash = 'profile'; }} 
              className="w-full py-3 bg-[#1C1B18] text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#B08A50] transition-colors cursor-pointer"
            >
              View Order History
            </button>
            <button 
              onClick={handleBackToShop} 
              className="w-full py-3 bg-transparent border border-[#1C1B18]/20 text-[#1C1B18] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#1C1B18]/5 transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container font-body select-none">
        <div className="cart-empty-content">
          <div className="cart-empty-icon-wrapper">
            <svg className="cart-empty-icon" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h2 className="cart-empty-title font-heading">Your Shopping Bag is Empty</h2>
          <p className="cart-empty-text">Looks like you haven't added any premium fragrances to your collection yet.</p>
          <button onClick={handleBackToShop} className="cart-empty-btn uppercase tracking-wider font-bold">
            Shop Our Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper bg-[#F7F3ED] min-h-screen py-16 font-body select-none">
      <div className="max-w-[1440px] mx-auto px-[clamp(1.5rem,4vw,3.5rem)]">
        
        {/* Breadcrumb */}
        <div className="text-[0.6rem] font-bold tracking-[3px] text-[#B08A50] uppercase mb-8">
          <span className="cursor-pointer text-[#B08A50]/60 hover:text-[#1C1B18] transition-colors" onClick={handleBackToShop}>HOME</span>
          <span className="mx-2 text-[#B08A50]/40">&gt;</span>
          <span className="text-[#1C1B18]">YOUR SHOPPING BAG</span>
        </div>

        <h1 className="cart-page-title font-heading mb-12 text-3xl sm:text-4xl font-light text-[#1C1B18] tracking-wide">
          {isCheckingOut ? 'Secure Checkout' : 'Your Shopping Bag'}
        </h1>

        <div className="cart-grid">
          
          {/* LEFT COLUMN: Cart Items or Secure Checkout */}
          <div className="cart-items-column">
            {!isCheckingOut ? (
              cartItems.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div key={`${item.id}-${item.size}`} className="cart-item-card">
                    {/* Square Image */}
                    <div className="cart-item-img-container bg-white">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                    </div>

                    {/* Item Details */}
                    <div className="cart-item-details">
                      <span className="cart-item-brand">{item.brand ? item.brand.toUpperCase() : 'DECANTS'}</span>
                      <h3 className="cart-item-name font-heading">{item.name}</h3>
                      <div className="cart-item-meta">
                        {item.size.replace(' Decant', '').replace(' Sample', '')} Decant 
                        {item.label && <span className="cart-item-label"> - {item.label}</span>}
                      </div>
                      
                      {/* Unit price display */}
                      <div className="cart-item-unit-price-row mt-1">
                        <span className="cart-item-unit-price">₹{item.price.toLocaleString('en-IN')} each</span>
                      </div>

                      {/* Quantity Selector Inline */}
                      <div className="cart-item-controls-row mt-4">
                        <div className="cart-quantity-selector">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="cart-qty-btn decrease"
                            aria-label="Decrease quantity"
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <span className="cart-qty-value">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="cart-qty-btn increase"
                            aria-label="Increase quantity"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="cart-delete-btn"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <i className="far fa-trash-can"></i>
                        </button>
                      </div>
                    </div>

                    {/* Right: Price display */}
                    <div className="cart-item-price-column">
                      <span className="cart-item-total-price">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              /* SECURE CHECKOUT FLOW */
              <div className="bg-white border border-[#B08A50]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                
                {/* 1. Address Selection */}
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-black/5 mb-4">
                    <h3 className="font-heading text-lg text-[#1C1B18]">1. Shipping Destination</h3>
                    {!showAddAddress && (
                      <button 
                        onClick={() => setShowAddAddress(true)}
                        className="text-xs font-bold text-[#B08A50] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        + Add Address
                      </button>
                    )}
                  </div>

                  {showAddAddress ? (
                    <form onSubmit={handleCreateAddress} className="space-y-3 text-xs bg-[#F7F3ED]/40 p-4 rounded-xl border border-black/5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-wider text-[#B08A50] mb-1">Full Name</label>
                          <input 
                            type="text" required
                            className="w-full bg-white border border-black/10 rounded p-2 text-sm focus:outline-none focus:border-[#B08A50]"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-wider text-[#B08A50] mb-1">Phone Number</label>
                          <input 
                            type="text" required
                            className="w-full bg-white border border-black/10 rounded p-2 text-sm focus:outline-none focus:border-[#B08A50]"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[0.6rem] font-bold uppercase tracking-wider text-[#B08A50] mb-1">Address Line 1</label>
                          <input 
                            type="text" required
                            className="w-full bg-white border border-black/10 rounded p-2 text-sm focus:outline-none focus:border-[#B08A50]"
                            value={newAddress.addressLine1}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-wider text-[#B08A50] mb-1">Postal Code</label>
                          <input 
                            type="text" required
                            className="w-full bg-white border border-black/10 rounded p-2 text-sm focus:outline-none focus:border-[#B08A50]"
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-wider text-[#B08A50] mb-1">City</label>
                          <input 
                            type="text" required
                            className="w-full bg-white border border-black/10 rounded p-2 text-sm focus:outline-none focus:border-[#B08A50]"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-wider text-[#B08A50] mb-1">State</label>
                          <input 
                            type="text" required
                            className="w-full bg-white border border-black/10 rounded p-2 text-sm focus:outline-none focus:border-[#B08A50]"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={savingAddress} className="px-4 py-2 bg-[#1C1B18] text-white rounded font-bold hover:bg-[#B08A50] transition-colors cursor-pointer">
                          {savingAddress ? 'Saving...' : 'Save Address'}
                        </button>
                        <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 bg-transparent border border-black/10 rounded hover:bg-black/5 cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-black/10 rounded-xl">
                      <p className="text-sm text-black/50 mb-3">No delivery addresses saved.</p>
                      <button 
                        onClick={() => setShowAddAddress(true)}
                        className="py-2.5 px-5 bg-[#1C1B18] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#B08A50] transition-colors cursor-pointer"
                      >
                        + Add First Shipping Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map(addr => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedAddressId === addr.id 
                              ? 'border-[#B08A50] bg-[#B08A50]/5 shadow-sm' 
                              : 'border-black/5 hover:border-black/20'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-[#1C1B18]">{addr.fullName}</span>
                            {addr.isDefault && <span className="text-[0.5rem] font-bold uppercase tracking-widest bg-[#B08A50]/15 text-[#B08A50] px-1.5 py-0.5 rounded">Default</span>}
                          </div>
                          <p className="text-[0.7rem] text-black/70 leading-relaxed font-light">
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-[0.65rem] text-black/40 mt-1 font-mono">📞 {addr.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Payment Method */}
                <div>
                  <h3 className="font-heading text-lg text-[#1C1B18] pb-3 border-b border-black/5 mb-4">2. Olfactory Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${
                        paymentMethod === 'COD' 
                          ? 'border-[#B08A50] bg-[#B08A50]/5' 
                          : 'border-black/5 hover:border-black/20'
                      }`}
                    >
                      <div className="text-sm font-bold text-[#1C1B18] mb-0.5">Cash on Delivery</div>
                      <div className="text-[0.65rem] text-black/50">Pay upon delivery (₹0 fee)</div>
                    </div>
                    <div 
                      onClick={() => setPaymentMethod('SIMULATED_CARD')}
                      className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${
                        paymentMethod === 'SIMULATED_CARD' 
                          ? 'border-[#B08A50] bg-[#B08A50]/5' 
                          : 'border-black/5 hover:border-black/20'
                      }`}
                    >
                      <div className="text-sm font-bold text-[#1C1B18] mb-0.5">Simulated Card</div>
                      <div className="text-[0.65rem] text-black/50">Instant order validation</div>
                    </div>
                  </div>
                </div>

                {/* 3. Order Notes */}
                <div>
                  <h3 className="font-heading text-lg text-[#1C1B18] pb-3 border-b border-black/5 mb-4">3. Atelier Notes (Optional)</h3>
                  <textarea 
                    rows="2"
                    placeholder="E.g., Fragrance preferences, delivery instructions..."
                    className="w-full bg-white border border-black/10 rounded-lg p-3 text-sm focus:outline-none focus:border-[#B08A50]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-black/5">
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || !selectedAddressId}
                    className="flex-grow py-3 bg-[#B08A50] text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#95723C] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {placingOrder ? 'Validating Order...' : 'Complete Purchase'}
                  </button>
                  <button 
                    onClick={() => setIsCheckingOut(false)}
                    className="py-3 px-6 bg-transparent border border-black/15 text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    Back to Bag
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h2 className="cart-summary-title font-body">ORDER SUMMARY</h2>
              
              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>SUBTOTAL</span>
                  <span className="font-bold text-[#1C1B18]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="cart-summary-row">
                  <span>SHIPPING</span>
                  <span className="font-bold text-[#1C1B18]">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              {/* Free Delivery Banner */}
              {subtotal > 0 && !isCheckingOut && (
                <div className={`cart-shipping-banner ${subtotal >= FREE_SHIPPING_THRESHOLD ? 'free-unlocked' : ''}`}>
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <div className="shipping-banner-text font-bold text-center text-xs text-[#B08A50] flex items-center justify-center gap-1.5 py-1">
                      <i className="fas fa-circle-check"></i>
                      <span>CONGRATULATIONS! FREE SHIPPING UNLOCKED</span>
                    </div>
                  ) : (
                    <div className="shipping-banner-inner">
                      <span className="shipping-banner-text">
                        ADD ₹{neededForFreeShipping.toLocaleString('en-IN')} MORE FOR FREE DELIVERY
                      </span>
                      <button onClick={handleBackToShop} className="shipping-add-more-btn">
                        ADD
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="cart-summary-divider" />

              <div className="cart-total-row">
                <span className="total-label">Total</span>
                <span className="total-value">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              {!isCheckingOut && (
                isSignedIn ? (
                  <button onClick={handleContinueToCheckout} className="cart-checkout-btn">
                    <span>CONTINUE TO CHECKOUT</span>
                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="cart-checkout-btn">
                      <span>SIGN IN TO CHECKOUT</span>
                    </button>
                  </SignInButton>
                )
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
