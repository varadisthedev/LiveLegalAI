// Central API base URL — strips any trailing slash so concatenation is always safe.
// Set VITE_BACKEND_URL in your .env or Vercel dashboard WITHOUT a trailing slash.
// e.g. VITE_BACKEND_URL=https://livelegal-backend.up.railway.app

const rawUrl = import.meta.env.VITE_BACKEND_URL || 'https://livelegal-backend.up.railway.app';

// Remove trailing slash(es) defensively
export const API_BASE = rawUrl.replace(/\/+$/, '');

/**
 * Convenience wrapper — always returns a clean URL.
 * Usage: apiUrl('/api/document/history')
 */
export const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
