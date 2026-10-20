import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, imgUrl, inr } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { payWithRazorpay } from '../razorpay.js';

const STEPS = ['Processing', 'Shipped', 'Delivered'];

export default function OrderPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [o, setO] = useState(null);
  const [err, setErr] = useState('');
  const { settings } = useStore();
  const toast = useToast();
  const load = () => api(`/orders/${id}`).then(setO).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  if (err) return <div className="wrap empty"><h2>{err}</h2></div>;
  if (!o) return <div className="page-loading"><span className="spinner" /></div>;
  const stepIdx = STEPS.indexOf(o.status);
  const pay = async () => { try { setO(await payWithRazorpay(o._id, settings?.accentColor)); toast('Payment successful!'); } catch (e) { toast(e.message, 'err'); } };
  const cancel = async () => { if (!confirm('Cancel this order?')) return; try { setO(await api(`/orders/${o._id}/cancel`, { method: 'PUT' })); toast('Order cancelled'); } catch (e) { toast(e.message, 'err'); } };

  return (
    <div className="wrap order">
      {params.get('placed') && o.status !== 'Pending payment' && (
        <div className="thanks fade-up"><div className="check-badge">✓</div><h1>Thank you. Your order is placed.</h1><p className="muted lead">We’ll email you when it ships.</p></div>
      )}
      <div className="order-head">
        <div><p className="muted small">Order</p><h2>#{o._id.slice(-8).toUpperCase()}</h2><p className="muted small">{new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
        <span className={`status s-${o.status.replace(/\s/g, '').toLowerCase()}`}>{o.status}</span>
      </div>

      {o.status === 'Pending payment' && (
        <div className="card notice"><div><strong>Payment pending.</strong><p className="muted small">Complete payment to confirm your order.</p></div><button className="btn" onClick={pay}>Pay {inr(o.totalPrice)}</button></div>
      )}

      {o.status !== 'Cancelled' && o.status !== 'Pending payment' && (
        <div className="timeline">{STEPS.map((s, i) => <div key={s} className={`tl-step ${i <= stepIdx ? 'done' : ''}`}><span /><p>{s}</p></div>)}</div>
      )}

      <div className="order-grid">
        <div className="card">
          <h3>Items</h3>
          <ul className="mini-items lg">{o.items.map((i) => (
            <li key={i._id}><img src={imgUrl(i.image)} alt="" /><div className="grow"><p className="strong">{i.title}</p><p className="muted small">Qty {i.qty}{i.color ? ` · ${i.color}` : ''}</p></div><span>{inr(i.price * i.qty)}</span></li>
          ))}</ul>
        </div>
        <div className="stack">
          <div className="card"><h3>Delivery address</h3><p>{o.shippingAddress.fullName}<br />{o.shippingAddress.line1}{o.shippingAddress.line2 && <>, {o.shippingAddress.line2}</>}<br />{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}<br /><span className="muted">{o.shippingAddress.phone}</span></p></div>
          <div className="card">
            <h3>Payment</h3>
            <p>{o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay'} · <span className={o.isPaid ? 'ok-text' : 'warn-text'}>{o.isPaid ? `Paid ${new Date(o.paidAt).toLocaleDateString('en-IN')}` : 'Not paid'}</span></p>
            {o.payment?.razorpayPaymentId && <p className="muted small">Payment ID: {o.payment.razorpayPaymentId}</p>}
            <div className="row-between"><span>Subtotal</span><span>{inr(o.itemsPrice)}</span></div>
            <div className="row-between"><span>Delivery</span><span>{o.shippingPrice ? inr(o.shippingPrice) : 'FREE'}</span></div>
            <div className="row-between"><span>GST</span><span>{inr(o.taxPrice)}</span></div>
            <div className="row-between total"><span>Total</span><span>{inr(o.totalPrice)}</span></div>
          </div>
          {['Pending payment', 'Processing'].includes(o.status) && <button className="link danger" onClick={cancel}>Cancel order</button>}
        </div>
      </div>
      <p className="center mt"><Link to="/orders" className="link">← All orders</Link></p>
    </div>
  );
}
