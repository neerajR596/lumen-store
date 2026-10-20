import { Fragment, useEffect, useState } from 'react';
import { api, imgUrl, inr } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';

const STATUSES = ['Pending payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const toast = useToast();
  const load = () => api(`/orders${filter ? `?status=${encodeURIComponent(filter)}` : ''}`).then(setOrders);
  useEffect(() => { load(); }, [filter]); // eslint-disable-line
  const setStatus = async (o, status) => { try { const u = await api(`/orders/${o._id}/status`, { method: 'PUT', body: { status } }); setOrders((xs) => xs.map((x) => (x._id === u._id ? { ...x, ...u, user: x.user } : x))); toast(`Order marked ${status}`); } catch (e) { toast(e.message, 'err'); } };
  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Orders</h1><p className="muted">{orders ? `${orders.length} orders` : 'Loading…'}</p></div></header>
      <div className="chips left">{['', ...STATUSES].map((s) => <button key={s} className={filter === s ? 'chip on' : 'chip'} onClick={() => setFilter(s)}>{s || 'All'}</button>)}</div>
      <div className="panel flush">
        <table className="atable"><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Payment</th><th className="r">Total</th><th>Status</th></tr></thead>
          <tbody>{(orders || []).map((o) => (<Fragment key={o._id}>
            <tr className="clickable" onClick={() => setOpen(open === o._id ? null : o._id)}>
              <td className="strong">#{o._id.slice(-6).toUpperCase()}</td>
              <td className="muted">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
              <td>{o.user?.name}<br /><span className="muted small">{o.user?.email}</span></td>
              <td>{o.paymentMethod === 'cod' ? 'COD' : 'Razorpay'} <span className={o.isPaid ? 'ok-text small' : 'warn-text small'}>{o.isPaid ? '· Paid' : '· Unpaid'}</span></td>
              <td className="r">{inr(o.totalPrice)}</td>
              <td onClick={(e) => e.stopPropagation()}><select className={`status-select s-${o.status.replace(/\s/g, '').toLowerCase()}`} value={o.status} onChange={(e) => setStatus(o, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
            </tr>
            {open === o._id && (
              <tr className="expand"><td colSpan="6">
                <div className="expand-grid">
                  <ul className="plist">{o.items.map((i) => <li key={i._id}><img src={imgUrl(i.image)} alt="" /><span className="grow small">{i.title}{i.color ? ` · ${i.color}` : ''} × {i.qty}</span><span className="small">{inr(i.price * i.qty)}</span></li>)}</ul>
                  <div className="small"><strong>Ship to</strong><br />{o.shippingAddress.fullName}, {o.shippingAddress.phone}<br />{o.shippingAddress.line1}{o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ''}<br />{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}
                    {o.payment?.razorpayPaymentId && <><br /><br /><strong>Razorpay</strong><br />{o.payment.razorpayPaymentId}</>}</div>
                </div>
              </td></tr>
            )}
          </Fragment>))}</tbody></table>
        {!orders && <p className="muted pad">Loading orders…</p>}
        {orders?.length === 0 && <p className="muted pad">No orders here yet.</p>}
      </div>
    </div>
  );
}
