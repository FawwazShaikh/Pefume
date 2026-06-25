// Centralized Cart Helper to synchronize cart state in localStorage or database
// and dispatch custom events to update components like the Navbar.
import { showToast } from './toast.js';
import { CartStore } from './store.js';
import { API_BASE_URL } from './config.js';

export const getCart = () => {
  return CartStore.load();
};

export const saveCart = (cart) => {
  CartStore.save(cart);
};

// Sync database cart items to local storage cache
export const syncDbCartWithCache = async (token) => {
  return CartStore.sync(token);
};

// Merge guest local cart items into database cart on login
export const mergeCartToDb = async (token) => {
  return CartStore.merge(token);
};

export const addToCart = async (product, sizeOption, quantity = 1, token = null) => {

  // Ensure sizeOption has a valid variantId
  if (!sizeOption.variantId) {
    const sizes = product.sizes || [];
    const match = sizes.find(s => s.size === sizeOption.size);
    if (match && match.variantId) {
      sizeOption.variantId = match.variantId;
    } else {
      showToast('Size variant is not available.', 'error');
      if (import.meta.env.DEV) {
        console.error(`[CRITICAL DEVELOPMENT ERROR] addToCart failed: Product "${product.name}" size "${sizeOption.size}" has no variantId in sizes:`, product.sizes);
      }
      return;
    }
  }

  const cart = [...CartStore.getState()];
  const sizeLabel = sizeOption.size || 'Default Size';
  
  const existingItemIndex = cart.findIndex(item => {
    if (item.variantId && sizeOption.variantId && item.variantId === sizeOption.variantId) {
      return true;
    }
    const itemProdId = item.productId || item.id;
    const currProdId = product.id || product.productId;
    return itemProdId === currProdId && item.size === sizeLabel;
  });
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      productId: product.id,
      variantId: sizeOption.variantId,
      name: product.name,
      brand: product.brand,
      image: product.image || (product.images && product.images[0]) || '',
      size: sizeLabel,
      price: sizeOption.price || product.price,
      quantity: quantity,
      label: sizeOption.label || ''
    });
  }
  
  // Instant local update to keep UI highly responsive
  CartStore.save(cart);
  showToast('Added to your local shopping bag.', 'success');

  // Dispatch custom event to trigger premium Mini Bag slide-out
  window.dispatchEvent(new CustomEvent('open-mini-bag', {
    detail: {
      productId: product.id,
      variantId: sizeOption.variantId,
      name: product.name,
      brand: product.brand,
      image: product.image || (product.images && (product.images[0]?.imageUrl || product.images[0])) || '',
      size: sizeLabel,
      price: sizeOption.price || product.price,
      quantity: quantity
    }
  }));

  // Dispatch future-ready analytics event hook
  window.dispatchEvent(new CustomEvent('mini_bag_opened', {
    detail: {
      productId: product.id,
      variantId: sizeOption.variantId,
      quantity: quantity
    }
  }));

  if (token) {
    // Sync to database in the background
    fetch(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        variantId: sizeOption.variantId,
        quantity
      })
    }).then(res => {
      if (res.ok) {
        CartStore.sync(token);
      } else {
        // Background sync failed — non-critical, local cart state is still valid.
      }
    }).catch(err => {
      console.error("Cart sync failed", err);
    });
  }
};

export const updateQuantity = async (id, size, quantity, token = null) => {

  let cart = [...CartStore.getState()];
  const itemIndex = cart.findIndex(item => 
    (item.variantId && id === item.variantId) || 
    (item.id === id && item.size === size)
  );

  let dbCartItemId = null;
  if (itemIndex > -1) {
    dbCartItemId = cart[itemIndex].dbCartItemId;
    if (quantity <= 0) {
      cart = cart.filter((_, idx) => idx !== itemIndex);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    CartStore.save(cart);
  }

  if (token && dbCartItemId) {
    if (quantity <= 0) {
      // Sync removal to database in the background
      fetch(`${API_BASE_URL}/api/cart/${dbCartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => {
        if (res.ok) {
          CartStore.sync(token);
        } else {
          // Background sync failed — non-critical, local cart state is still valid.
        }
      }).catch(err => {
        console.error("Cart sync failed", err);
      });
    } else {
      // Sync quantity update to database in the background
      fetch(`${API_BASE_URL}/api/cart/${dbCartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      }).then(res => {
        if (res.ok) {
          CartStore.sync(token);
        } else {
          // Background sync failed — non-critical, local cart state is still valid.
        }
      }).catch(err => {
        console.error("Cart sync failed", err);
      });
    }
  }
};

export const removeFromCart = async (id, size, token = null) => {

  let cart = [...CartStore.getState()];
  const itemIndex = cart.findIndex(item => 
    (item.variantId && id === item.variantId) || 
    (item.id === id && item.size === size)
  );

  let dbCartItemId = null;
  if (itemIndex > -1) {
    dbCartItemId = cart[itemIndex].dbCartItemId;
    const updatedCart = cart.filter((_, idx) => idx !== itemIndex);
    CartStore.save(updatedCart);
    showToast('Selection removed.', 'success');
  }

  if (token && dbCartItemId) {
    // Sync to database in the background
    fetch(`${API_BASE_URL}/api/cart/${dbCartItemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => {
      if (res.ok) {
        CartStore.sync(token);
      } else {
        // Background sync failed — non-critical, local cart state is still valid.
      }
    }).catch(err => {
      console.error("Cart sync failed", err);
    });
  }
};

export const clearCart = () => {
  CartStore.save([]);
};
