import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { api, imgUrl, inr } from '../api.js';
import { Logo, SearchIcon, BagIcon, UserIcon, CloseIcon, MenuIcon } from './Icons.jsx';

export default function Nav() {
  const { count, setOpen } = useCart();
  const { user, logout } = useAuth();
  const { settings, categories } = useStore();
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => { if (searching) setTimeout(() => inputRef.current?.focus(), 50); else { setQ(''); setResults([]); } }, [searching]);
  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(() => api(`/products?q=${encodeURIComponent(q)}&limit=5`).then((d) => setResults(d.items)).catch(() => {}), 180);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && (setSearching(false), setMenu(false));
    window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc);
  }, []);

  const submit = (e) => { e.preventDefault(); if (q.trim()) { nav(`/shop?q=${encodeURIComponent(q)}`); setSearching(false); } };

  return (
    <>
      {settings?.announcementActive && settings?.announcement && <div className="announce">{settings.announcement}</div>}
      <header className={`gnav ${searching ? 'searching' : ''}`}>
        <nav className="gnav-inner">
          <Link to="/" className="brand" aria-label="Home"><Logo /><span>{settings?.storeName || 'Lumen'}</span></Link>
          <ul className={`gnav-links ${mobile ? 'open' : ''}`} onClick={() => setMobile(false)}>
            <li><NavLink to="/shop" end>Store</NavLink></li>
            {categories.slice(0, 6).map((c) => <li key={c.slug}><NavLink to={`/shop?category=${c.slug}`}>{c.name}</NavLink></li>)}
          </ul>
          <div className="gnav-actions">
            <button className="icon-btn" onClick={() => setSearching(true)} aria-label="Search"><SearchIcon /></button>
            <button className="icon-btn bag" onClick={() => setOpen(true)} aria-label="Bag"><BagIcon />{count > 0 && <b>{count}</b>}</button>
            <div className="acct">
              <button className="icon-btn" onClick={() => setMenu((m) => !m)} aria-label="Account"><UserIcon /></button>
              {menu && (
                <div className="acct-menu" onMouseLeave={() => setMenu(false)} onClick={() => setMenu(false)}>
                  {user ? (<>
                    <p className="muted small">Signed in as</p><p className="strong">{user.name}</p><hr />
                    {user.isAdmin && <Link to="/admin">Dashboard</Link>}
                    <Link to="/orders">Orders</Link><Link to="/account">Account</Link>
                    <button onClick={logout}>Sign out</button>
                  </>) : (<>
                    <Link to="/login">Sign in</Link><Link to="/register">Create account</Link><Link to="/bag">Bag</Link>
                  </>)}
                </div>
              )}
            </div>
            <button className="icon-btn mobile-only" onClick={() => setMobile((m) => !m)} aria-label="Menu"><MenuIcon /></button>
          </div>
        </nav>
        {searching && (
          <div className="search-panel">
            <form onSubmit={submit} className="search-row">
              <SearchIcon width={22} height={22} />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${settings?.storeName || 'Lumen'}`} />
              <button type="button" className="icon-btn" onClick={() => setSearching(false)}><CloseIcon /></button>
            </form>
            <div className="search-results">
              {results.length > 0 ? results.map((p) => (
                <Link key={p._id} to={`/product/${p.slug}`} onClick={() => setSearching(false)} className="sr-item">
                  <img src={imgUrl(p.images?.[0])} alt="" /><span>{p.title}</span><span className="muted">{inr(p.price)}</span>
                </Link>
              )) : (
                <div className="quick-links"><p className="muted small">Quick links</p>
                  {categories.slice(0, 5).map((c) => <Link key={c.slug} to={`/shop?category=${c.slug}`} onClick={() => setSearching(false)}>→ {c.name}</Link>)}
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      {searching && <div className="scrim" onClick={() => setSearching(false)} />}
    </>
  );
}
