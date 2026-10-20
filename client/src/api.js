// Tiny fetch wrapper. In dev, Vite proxies /api to the Express server.
const BASE = import.meta.env.VITE_API_URL || '';

export function getToken() { try { return localStorage.getItem('lumen_token'); } catch { return null; } }

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !form) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}/api${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

export const imgUrl = (u) => (!u ? '' : u.startsWith('/uploads') ? `${BASE}${u}` : u);
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
