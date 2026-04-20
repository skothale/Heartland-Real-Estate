/**
 * API base for browser requests.
 * - With VITE_API_URL: always use that origin (bypasses dev proxy).
 * - Without: relative "/api/..." (Vite dev server proxy to backend, if configured).
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.VITE_API_URL;
  if (base && String(base).trim()) {
    return `${String(base).replace(/\/$/, '')}${p}`;
  }
  return p;
}
