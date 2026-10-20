import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { Logo } from '../components/Icons.jsx';

const I = (d) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const LINKS = [
  ['', 'Overview', I(<><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></>)],
  ['products', 'Products', I(<><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></>)],
  ['categories', 'Categories', I(<><path d="M4 6h16M4 12h16M4 18h10" /></>)],
  ['banners', 'Home banners', I(<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M7 20h10" /></>)],
  ['storefront', 'Storefront', I(<><path d="M4 10h16l-1-5H5l-1 5ZM5 10v10h14V10" /><path d="M10 20v-5h4v5" /></>)],
  ['orders', 'Orders', I(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>)],
  ['users', 'Customers', I(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5" /><path d="M16 4a3.5 3.5 0 0 1 0 7M18 15c2 .7 3 2.3 3.5 5" /></>)],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useStore();
  return (
    <div className="admin">
      <aside className="aside">
        <Link to="/admin" className="aside-brand"><Logo /><span>{settings?.storeName || 'Lumen'}</span><em>Admin</em></Link>
        <nav>{LINKS.map(([to, label, icon]) => <NavLink key={to} to={to ? `/admin/${to}` : '/admin'} end={!to}>{icon}<span>{label}</span></NavLink>)}</nav>
        <div className="aside-foot">
          <Link to="/" target="_blank" className="view-store">View store ↗</Link>
          <div className="me"><span className="avatar">{user?.name?.[0]}</span><div><p className="strong small">{user?.name}</p><button className="link small" onClick={logout}>Sign out</button></div></div>
        </div>
      </aside>
      <section className="admin-main"><Outlet /></section>
    </div>
  );
}
