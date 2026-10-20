import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);
const load = () => { try { return JSON.parse(localStorage.getItem('lumen_cart')) || []; } catch { return []; } };

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { localStorage.setItem('lumen_cart', JSON.stringify(items)); } catch { /* ignore */ } }, [items]);

  const key = (i) => `${i.product}:${i.color || ''}`;
  const add = (p, qty = 1, color) => {
    setItems((cur) => {
      const item = { product: p._id, slug: p.slug, title: p.title, image: p.images?.[0], price: p.price, stock: p.stock, color, qty };
      const ex = cur.find((i) => key(i) === key(item));
      if (ex) return cur.map((i) => (key(i) === key(item) ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
      return [...cur, item];
    });
    setOpen(true);
  };
  const setQty = (k, qty) => setItems((cur) => cur.map((i) => (key(i) === k ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)));
  const remove = (k) => setItems((cur) => cur.filter((i) => key(i) !== k));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  const value = useMemo(() => ({ items, add, setQty, remove, clear, count, subtotal, key, open, setOpen }), [items, open]); // eslint-disable-line
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
