import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('lumen_token')) { setReady(true); return; }
    api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('lumen_token')).finally(() => setReady(true));
  }, []);

  const finish = (d) => { localStorage.setItem('lumen_token', d.token); setUser(d.user); return d.user; };
  const login = (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(finish);
  const register = (name, email, password) => api('/auth/register', { method: 'POST', body: { name, email, password } }).then(finish);
  const logout = () => { localStorage.removeItem('lumen_token'); setUser(null); };
  const updateProfile = (body) => api('/auth/me', { method: 'PUT', body }).then((d) => { setUser(d.user); return d.user; });

  return <AuthCtx.Provider value={{ user, ready, login, register, logout, updateProfile }}>{children}</AuthCtx.Provider>;
}
