import { API_BASE_URL } from './config.js';
import { getBottleImageUrl } from './bottleResolver.js';

let catalogCache = null;
let fetchPromise = null;
const preloadedImages = new Set();

/**
 * Fetch active bottle options from central catalog with caching.
 * @param {string} [productId] - Optional Product ID filter
 * @param {string} [size] - Optional size filter (e.g. '5ml', '10ml')
 */
export async function getBottleCatalog(productId = null, size = null) {
  const queryParams = new URLSearchParams();
  if (productId) queryParams.append('productId', productId);
  if (size) queryParams.append('size', size);

  const url = `${API_BASE_URL}/api/bottles${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.map(b => ({
        ...b,
        imageUrl: getBottleImageUrl(b.imageKey)
      }));
    }
  } catch (err) {
    console.error('Failed to fetch bottle catalog from backend API:', err);
  }

  // Fallback to static catalog if API fails
  return getFallbackBottles(size);
}

/**
 * Preloads selected bottle image + next 2 visible bottle images
 * to guarantee instantaneous image transitions on user interaction.
 * @param {Array} bottleList - List of bottle objects
 * @param {string} selectedId - Currently selected bottle ID
 */
export function preloadBottleQueue(bottleList = [], selectedId = null) {
  if (!Array.isArray(bottleList) || bottleList.length === 0) return;

  const selectedIndex = bottleList.findIndex(b => b.id === selectedId);
  const queueIndices = new Set();

  if (selectedIndex >= 0) {
    queueIndices.add(selectedIndex);
    queueIndices.add((selectedIndex + 1) % bottleList.length);
    queueIndices.add((selectedIndex + 2) % bottleList.length);
  } else {
    queueIndices.add(0);
    if (bottleList.length > 1) queueIndices.add(1);
    if (bottleList.length > 2) queueIndices.add(2);
  }

  queueIndices.forEach(idx => {
    const bottle = bottleList[idx];
    if (bottle && bottle.imageKey) {
      const imgUrl = getBottleImageUrl(bottle.imageKey);
      if (!preloadedImages.has(imgUrl)) {
        preloadedImages.add(imgUrl);
        const img = new Image();
        img.src = imgUrl;
      }
    }
  });
}

function getFallbackBottles(size) {
  const target = (size || '').toLowerCase();
  const allFallback = [
    { id: 'classic-mini-black', sku: 'BTL-CM-BLK', name: 'Classic Mini Spray', finish: 'Matte Black', category: 'CLASSIC_MINI', imageKey: 'classic_mini_black', priceAdjustment: 0, badge: 'Included', isDefault: true, availableSizes: ['5ml', '10ml'] },
    { id: 'classic-mini-gold', sku: 'BTL-CM-GLD', name: 'Classic Mini Spray', finish: 'Metallic Gold', category: 'CLASSIC_MINI', imageKey: 'classic_mini_gold', priceAdjustment: 0, badge: 'Included', isDefault: false, availableSizes: ['5ml', '10ml'] },
    { id: 'metal-atomizer-black', sku: 'BTL-MA-BLK', name: 'Classic Metal Atomizer', finish: 'Matte Black', category: 'CLASSIC_METAL', imageKey: 'metal_atomizer_black', priceAdjustment: 0, badge: 'Included', isDefault: true, availableSizes: ['10ml', '20ml'] },
    { id: 'metal-atomizer-gold', sku: 'BTL-MA-GLD', name: 'Classic Metal Atomizer', finish: 'Metallic Gold', category: 'CLASSIC_METAL', imageKey: 'metal_atomizer_gold', priceAdjustment: 0, badge: 'Included', isDefault: false, availableSizes: ['10ml', '20ml'] },
    { id: 'premium-metal-atomizer', sku: 'BTL-PMA-STL', name: 'Premium Classic Metal Atomizer', finish: 'Brushed Steel', category: 'PREMIUM', imageKey: 'premium_metal_atomizer', priceAdjustment: 55, badge: 'Premium', isDefault: false, availableSizes: ['10ml', '20ml', '30ml'] },
    { id: 'travel-safe-black', sku: 'BTL-TS-BLK', name: 'Travel Safe Atomizer', finish: 'Midnight Black', category: 'TRAVEL_SAFE', imageKey: 'travel_safe_black', priceAdjustment: 199, badge: 'Upgrade', isDefault: false, availableSizes: ['5ml', '10ml', '20ml', '30ml'] },
    { id: 'travel-safe-silver', sku: 'BTL-TS-SLV', name: 'Travel Safe Atomizer', finish: 'Gunmetal Silver', category: 'TRAVEL_SAFE', imageKey: 'travel_safe_silver', priceAdjustment: 199, badge: 'Upgrade', isDefault: false, availableSizes: ['5ml', '10ml', '20ml', '30ml'] },
    { id: 'travel-safe-rose-gold', sku: 'BTL-TS-RSG', name: 'Travel Safe Atomizer', finish: 'Rose Gold', category: 'TRAVEL_SAFE', imageKey: 'travel_safe_rose_gold', priceAdjustment: 199, badge: 'Upgrade', isDefault: false, availableSizes: ['5ml', '10ml', '20ml', '30ml'] },
    { id: 'travel-safe-crimson', sku: 'BTL-TS-CRM', name: 'Travel Safe Atomizer', finish: 'Crimson Red', category: 'TRAVEL_SAFE', imageKey: 'travel_safe_crimson', priceAdjustment: 199, badge: 'Limited Edition', isDefault: false, availableSizes: ['5ml', '10ml', '20ml', '30ml'] },
    { id: 'travel-safe-magenta', sku: 'BTL-TS-MAG', name: 'Travel Safe Atomizer', finish: 'Magenta Velvet', category: 'TRAVEL_SAFE', imageKey: 'travel_safe_magenta', priceAdjustment: 199, badge: 'Limited Edition', isDefault: false, availableSizes: ['5ml', '10ml', '20ml', '30ml'] }
  ];

  if (!target) return allFallback.map(b => ({ ...b, imageUrl: getBottleImageUrl(b.imageKey) }));

  return allFallback
    .filter(b => b.availableSizes.includes(target))
    .map(b => ({ ...b, imageUrl: getBottleImageUrl(b.imageKey) }));
}
