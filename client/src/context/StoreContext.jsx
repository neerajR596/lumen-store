import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

// Holds the admin-editable storefront content (settings + categories) and applies the accent colour.
export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const refresh = useCallback(() => Promise.all([
    api('/settings').then(setSettings),
    api('/categories').then(setCategories),
  ]).catch(() => {}), []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (settings?.accentColor) document.documentElement.style.setProperty('--accent', settings.accentColor);
    if (settings?.storeName) document.title = `${settings.storeName}: ${settings.heroTitle?.split('\n')[0] || 'Store'}`;
  }, [settings]);
  return <StoreCtx.Provider value={{ settings, categories, refresh, setSettings }}>{children}</StoreCtx.Provider>;
}
