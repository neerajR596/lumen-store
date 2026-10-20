import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl, inr } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AdminProducts() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const toast = useToast();
  const load = () => api('/products?all=1&limit=60&sort=newest').then((d) => setItems(d.items));
  useEffect(() => { load(); }, []);
  const patch = async (p, body) => { try { const u = await api(`/products/${p._id}`, { method: 'PUT', body }); setItems((xs) => xs.map((x) => (x._id === u._id ? u : x))); } catch (e) { toast(e.message, 'err'); } };
  const del = async (p) => { if (!confirm(`Delete “${p.title}”? This can’t be undone.`)) return; try { await api(`/products/${p._id}`, { method: 'DELETE' }); setItems((xs) => xs.filter((x) => x._id !== p._id)); toast('Product deleted'); } catch (e) { toast(e.message, 'err'); } };
  const shown = (items || []).filter((p) => !q || `${p.title} ${p.category}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Products</h1><p className="muted">{items ? `${items.length} products` : 'Loading…'}</p></div><Link to="/admin/products/new" className="abtn">+ New product</Link></header>
      <input className="asearch" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="panel flush">
        <table className="atable"><thead><tr><th>Product</th><th>Category</th><th className="r">Price</th><th className="r">Stock</th><th>Featured</th><th>Visible</th><th /></tr></thead>
          <tbody>{shown.map((p) => (
            <tr key={p._id} className={!p.isActive ? 'dim' : ''}>
              <td><Link to={`/admin/products/${p._id}`} className="prod-cell"><img src={imgUrl(p.images?.[0])} alt="" /><span>{p.title}</span></Link></td>
              <td className="muted cap">{p.category}</td>
              <td className="r">{inr(p.price)}</td>
              <td className={`r ${p.stock <= 5 ? 'warn-text' : ''}`}>{p.stock}</td>
              <td><button className={`toggle ${p.featured ? 'on' : ''}`} onClick={() => patch(p, { featured: !p.featured })} aria-label="featured" /></td>
              <td><button className={`toggle ${p.isActive ? 'on' : ''}`} onClick={() => patch(p, { isActive: !p.isActive })} aria-label="visible" /></td>
              <td className="r nowrap"><Link to={`/admin/products/${p._id}`} className="link small">Edit</Link> <button className="link small danger" onClick={() => del(p)}>Delete</button></td>
            </tr>))}
          </tbody></table>
      </div>
    </div>
  );
}
