import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl, inr } from '../api.js';

function RevenueChart({ days }) {
  const max = Math.max(1, ...days.map((d) => d.revenue));
  const [hover, setHover] = useState(null);
  return (
    <div className="chart">
      <div className="bars">
        {days.map((d, i) => (
          <div key={d.date} className="bar-col" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            {hover === i && <div className="tip"><strong>{inr(d.revenue)}</strong><span>{d.orders} order{d.orders === 1 ? '' : 's'}</span></div>}
            <div className="bar" style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }} />
            <span className="bar-lbl">{new Date(`${d.date}T00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/admin/stats').then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="error">{err}</p>;
  if (!s) return <div className="page-loading"><span className="spinner" /></div>;
  const kpis = [['Revenue', inr(Math.round(s.revenue)), 'Paid orders'], ['Orders', s.orders, 'All time'], ['Customers', s.users, 'Registered'], ['Products', s.products, 'In catalogue']];
  const week = s.daily.slice(-7).reduce((a, d) => a + d.revenue, 0);
  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Overview</h1><p className="muted">Here’s how your store is doing.</p></div><Link to="/admin/products/new" className="abtn">+ New product</Link></header>
      <div className="kpis">{kpis.map(([l, v, sub], i) => <div key={l} className={`kpi k${i}`}><p className="muted small">{l}</p><h2>{v}</h2><p className="muted small">{sub}</p></div>)}</div>
      <div className="dash-grid">
        <div className="panel span2"><div className="row-between"><h3>Revenue · last 14 days</h3><span className="muted small">This week: <strong>{inr(week)}</strong></span></div><RevenueChart days={s.daily} /></div>
        <div className="panel"><h3>Top sellers</h3><ul className="plist">{s.top.map((p) => <li key={p._id}><img src={imgUrl(p.images?.[0])} alt="" /><span className="grow small">{p.title}</span><span className="muted small">{p.sold} sold</span></li>)}</ul></div>
        <div className="panel span2"><div className="row-between"><h3>Recent orders</h3><Link to="/admin/orders" className="link small">View all</Link></div>
          {s.recent.length === 0 ? <p className="muted">No orders yet.</p> : (
            <table className="atable"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="r">Total</th></tr></thead><tbody>
              {s.recent.map((o) => <tr key={o._id}><td>#{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name || '—'}</td><td><span className={`status s-${o.status.replace(/\s/g, '').toLowerCase()}`}>{o.status}</span></td><td className="r">{inr(o.totalPrice)}</td></tr>)}
            </tbody></table>)}
        </div>
        <div className="panel"><h3>Low stock</h3>{s.lowStock.length === 0 ? <p className="muted small">All products are well stocked. ✓</p> :
          <ul className="plist">{s.lowStock.map((p) => <li key={p._id}><img src={imgUrl(p.images?.[0])} alt="" /><Link to={`/admin/products/${p._id}`} className="grow small">{p.title}</Link><span className={`small ${p.stock === 0 ? 'error' : 'warn-text'}`}>{p.stock} left</span></li>)}</ul>}
        </div>
      </div>
    </div>
  );
}
