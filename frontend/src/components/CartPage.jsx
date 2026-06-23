import { useState, useEffect, useMemo } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCart, updateQuantity, removeFromCart, clearCart, mergeCartToDb } from '../utils/cartHelper';
import { showToast } from '../utils/toast';
import './CartPage.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage({ onBackToShop, products = [] }) {
  const { isSignedIn, getToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Checkout flow states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping Address, 2: Delivery, 3: Payment, 4: Review

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
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

  const resetAddressForm = () => {
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
  };

  // Delivery options
  const [deliveryMethod, setDeliveryMethod] = useState('STANDARD'); // STANDARD, EXPRESS
  
  // Payment methods
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD, RAZORPAY
  
  // Order notes & placement states
  const [notes, setNotes] = useState('');
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [galleryIndexMap, setGalleryIndexMap] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const [storeSettings, setStoreSettings] = useState(null);

  const FREE_SHIPPING_THRESHOLD = storeSettings ? parseFloat(storeSettings.freeShippingThreshold) : 1999;
  const SHIPPING_CHARGES = storeSettings ? parseFloat(storeSettings.shippingCharges) : 100;

  // Sync cart items on load and list for updates
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

  // Fetch store settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('http://localhost:5000/api/settings');
        if (res.ok) {
          const data = await res.json();
          setStoreSettings(data);
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
      }
    }
    fetchSettings();
  }, []);

  // Sync and merge cart when user logs in
  useEffect(() => {
    async function syncAndMerge() {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            await mergeCartToDb(token);
          }
        } catch (err) {
          console.error('Error syncing cart on sign-in:', err);
        }
      }
    }
    syncAndMerge();
  }, [isSignedIn]);

  // Wrapper handlers for cart operations to pass auth token
  const handleUpdateQuantity = async (variantIdOrId, size, newQty) => {
    const token = isSignedIn ? await getToken() : null;
    await updateQuantity(variantIdOrId, size, newQty, token);
  };

  const handleRemoveFromCart = async (variantIdOrId, size) => {
    const token = isSignedIn ? await getToken() : null;
    await removeFromCart(variantIdOrId, size, token);
  };

  // Fetch addresses when checkout starts or is active
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
        // Autoselect default address or first address
        const def = data.find(a => a.isDefault);
        if (def) {
          setSelectedAddressId(def.id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  useEffect(() => {
    if (isSignedIn && isCheckingOut) {
      fetchAddresses();
    }
  }, [isSignedIn, isCheckingOut]);

  // Calculate pricing totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    if (deliveryMethod === 'EXPRESS') return 150;
    const threshold = storeSettings ? parseFloat(storeSettings.freeShippingThreshold) : 1999;
    const charge = storeSettings ? parseFloat(storeSettings.shippingCharges) : 100;
    return subtotal >= threshold ? 0 : charge;
  }, [subtotal, deliveryMethod, storeSettings]);

  const grandTotal = subtotal + shipping + (giftWrapping ? 150 : 0);

  const handleBackToShop = () => {
    if (onBackToShop) {
      onBackToShop();
    } else {
      window.location.hash = 'shop';
    }
  };

  // Continue checkout
  const handleContinueToCheckout = () => {
    if (!isSignedIn) return;
    setIsCheckingOut(true);
    setCheckoutStep(1);
  };

  // Save new address during checkout
  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
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
        setAddresses([created, ...addresses.map(a => newAddress.isDefault ? { ...a, isDefault: false } : a)]);
        setSelectedAddressId(created.id);
        setShowAddAddressForm(false);
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
      } else {
        const errData = await res.json();
        setAddressError(errData.error || 'Failed to create address.');
      }
    } catch (err) {
      console.error(err);
      setAddressError('Network error. Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  // Place final order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a shipping destination.', 'warning');
      return;
    }
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    setPlacingOrder(true);
    try {
      const token = await getToken();
      const items = cartItems.map(item => {
        if (!item.variantId) {
          if (import.meta.env.DEV) {
            console.error(`[CRITICAL DEVELOPMENT ERROR] Cart item "${item.name}" size "${item.size}" is missing variantId!`);
          }
          throw new Error(`Variant ID missing for cart item: ${item.name} (${item.size})`);
        }
        return {
          productId: item.productId || item.id,
          variantId: item.variantId,
          name: item.name,
          size: item.size,
          price: item.price,
          quantity: item.quantity
        };
      });

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
          notes: giftWrapping ? `[GIFT WRAP REQUESTED (+₹150)] ${notes}` : notes
        })
      });

      if (res.ok) {
        const orderData = await res.json();
        
        if (paymentMethod === 'RAZORPAY') {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            showToast('Razorpay Checkout SDK failed to load. Please verify your connection.', 'error');
            setPlacingOrder(false);
            return;
          }

          const options = {
            key: storeSettings ? storeSettings.razorpayKey : 'rzp_test_AtelierKey2026',
            amount: Math.round(orderData.total * 100),
            currency: 'INR',
            name: storeSettings ? storeSettings.storeName : 'Decant Atelier',
            description: 'Luxury Fragrance Purchase',
            order_id: orderData.razorpayOrderId,
            handler: async function (response) {
              try {
                const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    orderId: orderData.id
                    })
                });
                if (verifyRes.ok) {
                  setPlacedOrderId(orderData.id);
                  clearCart();
                  setOrderPlacedSuccess(true);
                } else {
                  const errData = await verifyRes.json();
                  showToast(errData.error || 'Payment verification failed.', 'error');
                }
              } catch (verifyErr) {
                console.error('Error verifying payment:', verifyErr);
                showToast('Verification error. Please contact support with Order ID: ' + orderData.id, 'error');
              }
            },
            prefill: {
              name: selectedAddress ? selectedAddress.fullName : '',
              contact: selectedAddress ? selectedAddress.phone : ''
            },
            theme: {
              color: '#1C1B18'
            },
            modal: {
              ondismiss: async function () {
                console.log('User closed payment gateway modal.');
                try {
                  await fetch('http://localhost:5000/api/payments/fail', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ orderId: orderData.id })
                  });
                } catch (failErr) {
                  console.error('Failed to notify payment failure:', failErr);
                }
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', async function (response) {
            console.error('Payment gateway payment failed:', response.error);
            showToast('Payment failed: ' + response.error.description, 'error');
            try {
              await fetch('http://localhost:5000/api/payments/fail', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId: orderData.id })
              });
            } catch (failErr) {
              console.error('Failed to notify payment failure:', failErr);
            }
          });
          rzp.open();
        } else {
          // COD placement flow completes immediately
          setPlacedOrderId(orderData.id);
          clearCart();
          setOrderPlacedSuccess(true);
        }
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to place order', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error placing order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const selectedAddress = useMemo(() => {
    return addresses.find(a => a.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  // Render Order placed successfully screen
  if (orderPlacedSuccess) {
    return (
      <div className="luxury-cart-container min-h-screen bg-[#F7F3ED] font-body text-[#1C1B18] pb-24 select-none pt-12">

        <div className="max-w-xl mx-auto text-center px-4 py-12 bg-[#FEFCF9] border border-black/5 mt-12 shadow-sm">
          <div className="text-3xl text-[#B08A50] mb-6">✦</div>
          <h2 className="font-heading text-3xl font-light uppercase tracking-wide mb-4">Purchase Confirmed</h2>
          {placedOrderId && (
            <p className="text-[0.62rem] font-bold tracking-[2px] text-black/40 uppercase mb-6">
              ORDER REF: #{placedOrderId.slice(-8).toUpperCase()}
            </p>
          )}
          <p className="text-xs text-black/60 leading-relaxed mb-8">
            Thank you for shopping at Decant Atelier. Your olfactory selections have been verified and are being hand-poured at our studio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => { window.location.hash = 'profile'; }} 
              className="py-3 px-6 bg-[#1C1B18] text-[#FEFCF9] hover:bg-[#B08A50] text-[0.68rem] font-bold tracking-widest uppercase transition-all duration-300"
            >
              View Order Details
            </button>
            <button 
              onClick={handleBackToShop} 
              className="py-3 px-6 border border-black/15 text-black/70 hover:text-black text-[0.68rem] font-bold tracking-widest uppercase transition-all duration-300"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Empty Cart Screen
  if (cartItems.length === 0) {
    return (
      <div className="luxury-cart-container min-h-screen bg-[#F7F3ED] font-body text-[#1C1B18] pb-24 select-none pt-12">

        <div className="max-w-xl mx-auto text-center px-4 py-16 bg-[#FEFCF9] border border-black/5 mt-16 shadow-sm">
          <h2 className="font-heading text-3xl font-light uppercase tracking-wide mb-4">Your Shopping Bag</h2>
          <p className="text-xs text-black/50 leading-relaxed mb-8">
            There are currently no items in your luxury fragrance bag.
          </p>
          <button 
            onClick={handleBackToShop} 
            className="py-3 px-8 bg-[#1C1B18] text-[#FEFCF9] hover:bg-[#B08A50] text-[0.68rem] font-bold tracking-widest uppercase transition-all duration-300 shadow-sm"
          >
            Explore the Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="luxury-cart-container min-h-screen bg-[#F7F3ED] font-body text-[#1C1B18] pb-24 select-none">
      
      {/* Responsive Luxury Page Hero */}
      <section className="page-hero">
        <div className="page-hero-bg-text">ATELIER BAG</div>
        <div className="page-hero-content">
          <span className="page-hero-eyebrow">Decant Atelier</span>
          <h1 className="page-hero-title">
            {isCheckingOut ? `Checkout (Step ${checkoutStep}/4)` : 'Your Shopping Bag'}
          </h1>
          <p className="page-hero-subtitle">
            {isCheckingOut 
              ? 'Securely complete your olfactory order selection and delivery details.' 
              : `${cartItems.length} exceptional fragrance selection(s) curated for your collection.`
            }
          </p>
          <div className="page-hero-divider" />
        </div>
      </section>
      
      <main className="max-w-[1440px] mx-auto px-4 md:px-12 pt-12">
        {isCheckingOut && (
          <button 
            onClick={() => {
              if (checkoutStep > 1) {
                setCheckoutStep(checkoutStep - 1);
              } else {
                setIsCheckingOut(false);
              }
            }} 
            className="mb-8 text-[0.65rem] font-bold tracking-widest uppercase hover:text-[#B08A50] transition-colors cursor-pointer"
          >
            ← Back to Bag
          </button>
        )}

        <div className="luxury-cart-grid">
          
          {/* LEFT PANEL: Cart Rows or Multi-Step Form */}
          <div className="luxury-cart-left-pane">
            {!isCheckingOut ? (
              /* SHOPPING BAG PRODUCT LIST */
              <div className="space-y-6">
                
                {/* Visual Progress Bar for Free Shipping */}
                <div className="bg-[#FEFCF9] border border-black/5 p-6 mb-4 text-left shadow-sm">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
                    <span>
                      {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                        <span className="text-[#B08A50]">✦ Congratulations! You qualify for Free Shipping</span>
                      ) : (
                        `Add ₹${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')} more for Free Shipping`
                      )}
                    </span>
                    <span className="text-black/50">
                      {Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))}%
                    </span>
                  </div>
                  <div className="free-shipping-progress">
                    <div 
                      className="free-shipping-progress-bar" 
                      style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bag-items-list divide-y divide-black/8">
                  {cartItems.map((item) => {
                    const itemKey = `${item.id}-${item.size}`;
                    const fullProduct = products.find(p => p.id === item.productId || p.id === item.id);
                    const gallery = fullProduct?.images || [item.image];
                    const activeImgIdx = galleryIndexMap[itemKey] || 0;
                    const activeImage = gallery[activeImgIdx] || item.image;

                    return (
                      <div key={itemKey} className="product-row py-6 first:pt-0">
                        <div className="flex gap-6 items-start">
                          
                          {/* Product Image and Thumbnail Gallery */}
                          <div className="flex flex-col gap-2 flex-shrink-0 items-center">
                            <div className="product-image-box border border-black/5 bg-white relative w-20 h-24 overflow-hidden flex items-center justify-center">
                              <img src={activeImage} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            {gallery.length > 1 && (
                              <div className="flex gap-1 justify-center w-20 overflow-x-auto scrollbar-hide">
                                {gallery.slice(0, 4).map((gImg, gIdx) => (
                                  <button
                                    key={gIdx}
                                    onClick={() => setGalleryIndexMap(prev => ({ ...prev, [itemKey]: gIdx }))}
                                    className={`w-4 h-4 rounded-md border overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                                      activeImgIdx === gIdx ? 'border-[#B08A50] scale-110' : 'border-neutral-200 opacity-60 hover:opacity-100'
                                    }`}
                                  >
                                    <img src={gImg} className="w-full h-full object-cover" alt="mini-thumb" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[0.58rem] font-bold text-black/40 uppercase tracking-widest block">
                                {item.brand ? item.brand.toUpperCase() : 'DECANTS'}
                              </span>
                              <h3 className="font-heading text-lg font-normal text-[#1C1B18] text-left">
                                {item.name}
                              </h3>
                              <span className="text-[0.72rem] text-black/50 block font-body text-left">
                                Size: {item.size} {item.label && `(${item.label})`}
                              </span>
                            </div>

                            {/* Price & Quantity Selector Column */}
                            <div className="flex items-center gap-8 justify-between md:justify-end">
                              <div>
                                <span className="text-[0.62rem] font-bold text-black/40 uppercase tracking-widest block mb-1">Price</span>
                                <span className="text-xs font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
                              </div>

                              {/* Inline Quantity Controls */}
                              <div>
                                <span className="text-[0.62rem] font-bold text-black/40 uppercase tracking-widest block mb-1 text-center">Quantity</span>
                                <div className="flex items-center border border-black/8 bg-white h-9 px-2">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.variantId || item.id, item.size, item.quantity - 1)}
                                    className="w-6 h-full flex items-center justify-center text-xs text-black/55 hover:text-black cursor-pointer"
                                    aria-label="Decrease quantity"
                                  >
                                    <i className="fas fa-minus text-[10px]"></i>
                                  </button>
                                  <span className="w-8 text-center text-xs font-bold text-[#1C1B18] select-none">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.variantId || item.id, item.size, item.quantity + 1)}
                                    className="w-6 h-full flex items-center justify-center text-xs text-black/55 hover:text-black cursor-pointer"
                                    aria-label="Increase quantity"
                                  >
                                    <i className="fas fa-plus text-[10px]"></i>
                                  </button>
                                </div>
                              </div>

                              {/* Delete Item */}
                              <div className="text-right">
                                <span className="text-[0.62rem] font-bold text-black/40 uppercase tracking-widest block mb-1">Remove</span>
                                <button 
                                  onClick={() => handleRemoveFromCart(item.variantId || item.id, item.size)}
                                  className="text-xs text-black/45 hover:text-black transition-colors cursor-pointer"
                                  title="Delete Item"
                                >
                                  <i className="far fa-trash-can"></i>
                                </button>
                              </div>
                            </div>

                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkbox option for Signature Gift Wrapping */}
                <div className="bg-[#FEFCF9] border border-black/5 p-6 flex items-center justify-between text-left shadow-sm">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">🎁</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C1B18] uppercase tracking-wider">
                        Signature Gift Wrapping (+₹150)
                      </h4>
                      <p className="text-[0.68rem] text-black/50 mt-1 leading-relaxed">
                        Housed in a luxury textured paper box with signature hot-stamped gold foil ribbon, including a custom handwritten notes card.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={giftWrapping}
                    onChange={(e) => setGiftWrapping(e.target.checked)}
                    className="accent-[#B08A50] w-5 h-5 cursor-pointer ml-4"
                  />
                </div>

                {/* Order Notes comments field */}
                <div className="bg-[#FEFCF9] border border-black/5 p-6 text-left shadow-sm">
                  <h4 className="text-xs font-bold text-[#1C1B18] uppercase tracking-wider mb-2">
                    Order Notes
                  </h4>
                  <p className="text-[0.62rem] text-black/40 uppercase tracking-wider mb-3">
                    Add special instructions, courier preferences, or handwritten card messages:
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Enter your order notes or gift messages..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#F7F3ED]/40 border border-black/8 p-3 text-xs text-[#1C1B18] placeholder-black/30 focus:outline-none focus:border-[#B08A50] resize-none"
                  />
                </div>

              </div>
            ) : (
              /* MULTI-STEP SECURE CHECKOUT FLOW */
              <div className="checkout-steps-form">
                
                {/* STEP 1: SHIPPING ADDRESS */}
                {checkoutStep === 1 && (
                  <div className="space-y-6">
                    <div className="step-header pb-4 border-b border-black/8">
                      <h3 className="font-heading text-2xl font-light uppercase tracking-wide">1. Shipping Address</h3>
                      <p className="text-xs text-black/45 font-body">Select one of your saved delivery addresses or specify a new shipping destination.</p>
                    </div>

                    {addresses.length > 0 && !showAddAddressForm && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.map(addr => (
                            <div 
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`checkout-address-select-box ${selectedAddressId === addr.id ? 'active' : ''}`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold">{addr.fullName}</span>
                                {addr.isDefault && <span className="default-indicator-tag">Default</span>}
                              </div>
                              <p className="text-[0.72rem] text-black/70 leading-relaxed font-body">
                                {addr.addressLine1}
                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                                <br />
                                {addr.city}, {addr.state} - {addr.postalCode}
                              </p>
                              <span className="text-[0.58rem] font-bold tracking-wider text-black/45 block mt-2">📞 {addr.phone}</span>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => {
                            resetAddressForm();
                            setShowAddAddressForm(true);
                          }}
                          className="py-2.5 px-5 border border-black/15 text-xs font-bold tracking-widest uppercase hover:bg-black/5 transition-all duration-300"
                        >
                          + Deliver to New Address
                        </button>
                      </div>
                    )}

                    {(addresses.length === 0 || showAddAddressForm) && (
                      <div className="bg-[#FEFCF9] border border-black/5 p-6 max-w-xl">
                        <h4 className="font-heading text-lg font-light uppercase tracking-wide mb-5">
                          New Delivery Address
                        </h4>
                        
                        {addressError && (
                          <div className="p-3 bg-[#FF003C]/5 text-[#FF003C] text-xs font-bold uppercase tracking-wider mb-6">
                            {addressError}
                          </div>
                        )}

                        <form onSubmit={handleCreateAddress} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[0.58rem] font-bold uppercase tracking-wider text-black/50 block">Recipient Full Name</label>
                              <input
                                type="text" required
                                value={newAddress.fullName}
                                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                className="checkout-luxury-input"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.58rem] font-bold uppercase tracking-wider text-black/50 block">Contact Phone Number</label>
                              <input
                                type="text" required
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                className="checkout-luxury-input"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[0.58rem] font-bold uppercase tracking-wider text-black/50 block">Address Line 1</label>
                            <input
                              type="text" required
                              value={newAddress.addressLine1}
                              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                              className="checkout-luxury-input"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[0.58rem] font-bold uppercase tracking-wider text-black/50 block">Address Line 2 (Optional)</label>
                            <input
                              type="text"
                              value={newAddress.addressLine2}
                              onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                              className="checkout-luxury-input"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[0.58rem] font-bold uppercase tracking-wider text-black/50 block">City</label>
                              <input
                                type="text" required
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                className="checkout-luxury-input"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.58rem] font-bold uppercase tracking-wider text-black/50 block">State</label>
                              <input
                                type="text" required
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                className="checkout-luxury-input"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.58rem] font-bold uppercase tracking-wider text-black/50 block">ZIP / PIN Code</label>
                              <input
                                type="text" required
                                value={newAddress.postalCode}
                                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                className="checkout-luxury-input"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 select-none">
                            <input
                              id="newAddressDefaultCheckbox"
                              type="checkbox"
                              checked={newAddress.isDefault}
                              onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                              className="accent-[#B08A50]"
                            />
                            <label htmlFor="newAddressDefaultCheckbox" className="text-[0.62rem] tracking-wider text-black/60 uppercase cursor-pointer">
                              Set as default delivery address
                            </label>
                          </div>

                          <div className="flex items-center gap-3 pt-3 border-t border-black/5">
                            <button
                              type="submit"
                              disabled={savingAddress}
                              className="py-2.5 px-6 bg-[#1C1B18] text-[#FEFCF9] hover:bg-[#B08A50] text-[0.65rem] font-bold tracking-widest uppercase transition-colors"
                            >
                              {savingAddress ? 'Saving...' : 'Save and Select'}
                            </button>
                            {addresses.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowAddAddressForm(false)}
                                className="py-2.5 px-6 border border-black/10 text-black/60 hover:text-black text-[0.65rem] font-bold tracking-widest uppercase transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Step Actions */}
                    <div className="pt-8 border-t border-black/8 flex items-center justify-between">
                      <button
                        onClick={() => setIsCheckingOut(false)}
                        className="text-[0.65rem] font-bold tracking-widest uppercase text-black/45 hover:text-black transition-colors"
                      >
                        Cancel Checkout
                      </button>
                      <button
                        disabled={!selectedAddressId}
                        onClick={() => setCheckoutStep(2)}
                        className="py-3 px-8 bg-[#1C1B18] hover:bg-[#B08A50] text-[#FEFCF9] text-[0.68rem] font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Delivery
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: DELIVERY METHOD */}
                {checkoutStep === 2 && (
                  <div className="space-y-6">
                    <div className="step-header pb-4 border-b border-black/8">
                      <h3 className="font-heading text-2xl font-light uppercase tracking-wide">2. Delivery Method</h3>
                      <p className="text-xs text-black/45 font-body">Choose a transit speed and method for your order shipping.</p>
                    </div>

                    <div className="space-y-3 max-w-xl">
                      <div 
                        onClick={() => setDeliveryMethod('STANDARD')}
                        className={`delivery-option-box ${deliveryMethod === 'STANDARD' ? 'active' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold">Standard Atelier Delivery</span>
                          <span className="text-xs font-bold text-[#B08A50]">
                            {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : `₹${SHIPPING_CHARGES}`}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-black/60 leading-relaxed font-body">
                          Complimentary for orders over ₹{FREE_SHIPPING_THRESHOLD}. Arrives in 3-5 business days.
                        </p>
                      </div>

                      <div 
                        onClick={() => setDeliveryMethod('EXPRESS')}
                        className={`delivery-option-box ${deliveryMethod === 'EXPRESS' ? 'active' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold">Express Direct Air courier</span>
                          <span className="text-xs font-bold text-[#B08A50]">₹150</span>
                        </div>
                        <p className="text-[0.68rem] text-black/60 leading-relaxed font-body">
                          Guaranteed priority shipment. Arrives in 1-2 business days.
                        </p>
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div className="pt-8 border-t border-black/8 flex items-center justify-between">
                      <button
                        onClick={() => setCheckoutStep(1)}
                        className="text-[0.65rem] font-bold tracking-widest uppercase text-black/45 hover:text-black transition-colors"
                      >
                        Back to Address
                      </button>
                      <button
                        onClick={() => setCheckoutStep(3)}
                        className="py-3 px-8 bg-[#1C1B18] hover:bg-[#B08A50] text-[#FEFCF9] text-[0.68rem] font-bold tracking-widest uppercase transition-all duration-300"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PAYMENT METHOD */}
                {checkoutStep === 3 && (
                  <div className="space-y-6">
                    <div className="step-header pb-4 border-b border-black/8">
                      <h3 className="font-heading text-2xl font-light uppercase tracking-wide">3. Payment Details</h3>
                      <p className="text-xs text-black/45 font-body">Choose a transaction gateway to authenticate order validation.</p>
                    </div>

                    <div className="space-y-3 max-w-xl">
                      <div 
                        onClick={() => setPaymentMethod('COD')}
                        className={`payment-option-box ${paymentMethod === 'COD' ? 'active' : ''}`}
                      >
                        <span className="text-xs font-bold block mb-1">Cash on Delivery (COD)</span>
                        <p className="text-[0.68rem] text-black/60 leading-relaxed font-body">
                          Settle your transaction in cash directly upon receipt of packages. No added fee.
                        </p>
                      </div>

                      <div 
                        onClick={() => setPaymentMethod('RAZORPAY')}
                        className={`payment-option-box ${paymentMethod === 'RAZORPAY' ? 'active' : ''}`}
                      >
                        <span className="text-xs font-bold block mb-1">Simulated Card Validation</span>
                        <p className="text-[0.68rem] text-black/60 leading-relaxed font-body">
                          Simulated Razorpay transaction for instant and secure ledger logging.
                        </p>
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div className="pt-8 border-t border-black/8 flex items-center justify-between">
                      <button
                        onClick={() => setCheckoutStep(2)}
                        className="text-[0.65rem] font-bold tracking-widest uppercase text-black/45 hover:text-black transition-colors"
                      >
                        Back to Delivery
                      </button>
                      <button
                        onClick={() => setCheckoutStep(4)}
                        className="py-3 px-8 bg-[#1C1B18] hover:bg-[#B08A50] text-[#FEFCF9] text-[0.68rem] font-bold tracking-widest uppercase transition-all duration-300"
                      >
                        Continue to Review
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW ORDER */}
                {checkoutStep === 4 && (
                  <div className="space-y-6">
                    <div className="step-header pb-4 border-b border-black/8">
                      <h3 className="font-heading text-2xl font-light uppercase tracking-wide">4. Review and Place</h3>
                      <p className="text-xs text-black/45 font-body">Verify all delivery and ledger parameters before validating purchase.</p>
                    </div>

                    <div className="space-y-6 text-xs text-black/75">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FEFCF9] border border-black/5 p-6">
                        <div>
                          <h4 className="font-bold text-[0.62rem] uppercase tracking-wider text-black/50 mb-2">Shipping Destination</h4>
                          {selectedAddress ? (
                            <div className="space-y-1 font-body">
                              <p className="font-bold text-[#1C1B18]">{selectedAddress.fullName}</p>
                              <p>{selectedAddress.addressLine1}</p>
                              {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
                              <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}</p>
                              <p className="pt-1 text-black/50">📞 {selectedAddress.phone}</p>
                            </div>
                          ) : (
                            <p className="text-[#FF003C] italic">No address selected.</p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-bold text-[0.62rem] uppercase tracking-wider text-black/50 mb-1">Delivery Speed</h4>
                            <p className="font-bold">
                              {deliveryMethod === 'EXPRESS' ? 'Express Courier (1-2 business days)' : 'Standard Delivery (3-5 business days)'}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-bold text-[0.62rem] uppercase tracking-wider text-black/50 mb-1">Ledger Method</h4>
                            <p className="font-bold">
                              {paymentMethod === 'RAZORPAY' ? 'Simulated Card Payment' : 'Cash on Delivery (COD)'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Optional Notes */}
                      <div className="space-y-1">
                        <label className="text-[0.58rem] font-bold uppercase tracking-wider text-black/50 block">Atelier Notes (Optional)</label>
                        <textarea
                          rows="2"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Any batch, decanting, or shipping instructions..."
                          className="checkout-luxury-textarea"
                        />
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div className="pt-8 border-t border-black/8 flex items-center justify-between">
                      <button
                        onClick={() => setCheckoutStep(3)}
                        className="text-[0.65rem] font-bold tracking-widest uppercase text-black/45 hover:text-black transition-colors"
                      >
                        Back to Payment
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={placingOrder || !selectedAddressId}
                        className="py-3.5 px-8 bg-[#1C1B18] hover:bg-[#B08A50] text-[#FEFCF9] text-[0.68rem] font-bold tracking-widest uppercase transition-all duration-300 shadow-md"
                      >
                        {placingOrder ? 'Processing Purchase...' : 'Complete Purchase'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* RIGHT PANEL: Sticky Order Summary */}
          <div className="luxury-cart-summary-pane">
            <div className="luxury-summary-card">
              <h2 className="font-body text-xs font-bold tracking-[2px] uppercase mb-6 pb-2.5 border-b border-black/8">
                Order Summary
              </h2>

              <div className="space-y-4 text-xs font-body mb-6">
                
                {/* Summary Item list when checking out */}
                {isCheckingOut && (
                  <div className="checkout-summary-items-mini border-b border-black/5 pb-4 mb-4 space-y-3.5 max-h-[160px] overflow-y-auto scrollbar-hide">
                    {cartItems.map(item => (
                      <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-[0.72rem] text-black/70">
                        <span className="truncate max-w-[180px]">{item.name} <strong className="font-semibold text-[#1C1B18]">x{item.quantity}</strong></span>
                        <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-black/50">SUBTOTAL</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-black/50">SHIPPING</span>
                  <span className="font-semibold text-[#B08A50]">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-black/50">ESTIMATED TAX</span>
                  <span className="font-semibold text-black/40">Included</span>
                </div>
              </div>

              {/* Free delivery promo banner */}
              {subtotal > 0 && !isCheckingOut && (
                <div className="summary-promo-banner mb-6">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <div className="text-[0.62rem] font-bold text-center text-[#B08A50] tracking-wider uppercase py-1">
                      <i className="fas fa-circle-check mr-1"></i> Complimentary Shipping Unlocked
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[0.62rem] font-bold text-black/60 tracking-wider uppercase">
                      <span>Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')} for Free Delivery</span>
                      <button onClick={handleBackToShop} className="underline text-[#B08A50] hover:text-[#1C1B18] cursor-pointer">
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-black/8 pt-6 mb-8 flex justify-between items-center">
                <span className="font-body text-xs font-bold tracking-wider uppercase">Total</span>
                <span className="font-heading text-2xl font-semibold text-[#B08A50]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {!isCheckingOut && (
                isSignedIn ? (
                  <button onClick={handleContinueToCheckout} className="luxury-summary-checkout-btn">
                    <span>Proceed to Checkout</span>
                    <span className="arrow">→</span>
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="luxury-summary-checkout-btn">
                      <span>Sign In to Checkout</span>
                    </button>
                  </SignInButton>
                )
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
