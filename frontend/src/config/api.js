// Centralized API base URL configuration
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Clean trailing '/api' or slashes to prevent '/api/api' route issues in requests
if (baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.slice(0, -4);
}
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}

export const API_BASE_URL = baseUrl;
