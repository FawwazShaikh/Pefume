/**
 * Central Bottle Asset Resolver
 * Maps imageKey identifiers (e.g. 'travel_safe_rose_gold', 'classic_mini_black')
 * to public WebP paths or external CDN URLs.
 */
export function getBottleImageUrl(imageKey) {
  if (!imageKey) return '/bottles/classic_mini_black.webp';
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://') || imageKey.startsWith('/decant_images/')) {
    return imageKey;
  }
  if (imageKey.startsWith('/bottles/')) {
    return imageKey;
  }
  // Sanitize key and resolve to WebP asset path
  const cleanKey = imageKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `/bottles/${cleanKey}.webp`;
}
