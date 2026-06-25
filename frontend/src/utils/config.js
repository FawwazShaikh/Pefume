// Centralized configuration and helpers for the application
import { API_BASE_URL as base } from '../config/api.js';
export const API_BASE_URL = base;

/**
 * Sanitizes image URLs to prevent empty src attributes and mixed content warnings.
 * - Converts http:// to https:// for external URLs (except localhost).
 * - Fallbacks to placeholder image if the URL is empty or invalid.
 */
export const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '/images/perfume_placeholder.jpeg';
  }
  const trimmed = url.trim();
  // Relative paths
  if (trimmed.startsWith('/') || !trimmed.startsWith('http')) {
    return trimmed;
  }
  // Secure localhost remains http (unless configured otherwise), but external sites should be https
  if (trimmed.startsWith('http://')) {
    if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
      return trimmed;
    }
    return trimmed.replace('http://', 'https://');
  }
  return trimmed;
};
