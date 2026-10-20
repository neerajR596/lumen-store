import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, imgUrl, inr } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { payWithRazorpay } from '../razorpay.js';

const STATES = ['Andhra Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Puducherry','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

export default function Checkout() {
  const { items, clear } = useCart();
  const { user, updateProfile } = useAuth();
  const { settings } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [quote, setQuote] = useState(null);
  const [payCfg, setPayCfg] = useState({ razorpayEnabled: false });
  const [method, setMethod] = useState('razorpay');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [addr, setAddr] = useState({ fullName: user?.name || '', phone: '', line1: '', line2: '', city: '', state: 'Delhi', pincode: '', ...(user?.address || {}) });

  useEffect(() => {
    if (!items.length) return;
    api('/orders/quote', { method: 'POST', body: { items } }).then(setQuote).catch((e) => setError(e.message));
    api('/payments/config').then((c) => { setPayCfg(c); if (!c.razorpayEnabled) setMethod('cod'); }).catch(() => {});
  }, [items]);

  if (!items.length) return <div className="wrap empty tall"><h1>Your bag is empty.</h1><Link to="/shop" className="btn">Continue shopping</Link></div>;
  const f = (k) => ({ value: addr[k] || '', onChange: (e) => setAddr((a) => ({ ...a, [k]: e.target.value })) });

  const place = async (e) => {
    e.preventDefault(); setError('');
    if (!/^\d{10}$/.test(addr.phone)) return setError('Enter a valid 10-digit phone number');
    if (!/^\d{6}$/.test(addr.pincode)) return setError('Enter a valid 6-digit PIN code');
    setBusy(true);
    try {
      updateProfile({ address: addr }).catch(() => {});
      const order = await api('/orders', { method: 'POST', body: { items, shippingAddress: addr, paymentMethod: method } });
      clear();
      if (method === 'razorpay') {
        try { await payWithRazorpay(order._id, settings?.accentColor); toast('Payment successful!'); }
        catch (pe) { toast(pe.message, 'err'); }
      } else toast('Order placed!');
      nav(`/orders/${order._id}?placed=1`);
    } catch (e2) { setError(e2.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="wrap checkout">
      <h1 className="page-title">Checkout.</h1>
      <form className="checkout-grid" onSubmit={place}>
        <div>
          <section className="card form">
            <h2>Where should we send your order?</h2>
            <div className="grid2f">
              <label>Full name<input required {...f('fullName')} /></label>
              <label>Phone<input required inputMode="numeric" maxLength={10} placeholder="10-digit mobile" {...f('phone')} /></label>
            </div>
            <label>Address line 1<input required placeholder="House no., street" {...f('line1')} /></label>
            <label>Address line 2 <span className="muted">(optional)</span><input placeholder="Area, landmark" {...f('line2')} /></label>
            <div className="grid3f">
              <label>City<input required {...f('city')} /></label>
              <label>State<select {...f('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label>PIN code<input required inputMode="numeric" maxLength={6} {...f('pincode')} /></label>
            </div>
          </section>

          <section className="card form">
            <h2>How would you like to pay?</h2>
            <label className={`pay-opt ${method === 'razorpay' ? 'on' : ''} ${!payCfg.razorpayEnabled ? 'disabled' : ''}`}>
              <input type="radio" name="pm" checked={method === 'razorpay'} disabled={!payCfg.razorpayEnabled} onChange={() => setMethod('razorpay')} />
              <div><strong>Pay online</strong><span className="muted small">UPI, cards, netbanking & wallets via Razorpay</span>
                {!payCfg.razorpayEnabled && <span className="warn-text small">Add Razorpay test keys in server/.env to enable.</span>}</div>
              <span className="pay-badges"><i>UPI</i><i>VISA</i><i>RuPay</i></span>
            </label>
            <label className={`pay-opt ${method === 'cod' ? 'on' : ''}`}>
              <input type="radio" name="pm" checked={method === 'cod'} onChange={() => setMethod('cod')} />
              <div><strong>Cash on delivery</strong><span className="muted small">Pay when your order arrives</span></div>
            </label>
          </section>
        </div>

        <aside className="card summary sticky">
          <h2>Order summary</h2>
          <ul className="mini-items">{(quote?.items || []).map((i) => (
            <li key={i.product + (i.color || '')}><img src={imgUrl(i.image)} alt="" /><div className="grow"><p className="strong small">{i.title}</p><p className="muted small">Qty {i.qty}{i.color ? ` · ${i.color}` : ''}</p></div><span className="small">{inr(i.price * i.qty)}</span></li>
          ))}</ul>
          {quote ? (<>
            <div className="row-between"><span>Subtotal</span><span>{inr(quote.itemsPrice)}</span></div>
            <div className="row-between"><span>Delivery</span><span>{quote.shippingPrice ? inr(quote.shippingPrice) : 'FREE'}</span></div>
            <div className="row-between"><span>GST</span><span>{inr(quote.taxPrice)}</span></div>
            <div className="row-between total"><span>Total</span><span>{inr(quote.totalPrice)}</span></div>
          </>) : !error && <div className="skeleton" style={{ height: 120 }} />}
          {error && <p className="error">{error}</p>}
          <button className="btn block lg" disabled={busy || !quote}>{busy ? 'Placing order…' : method === 'razorpay' ? `Pay ${quote ? inr(quote.totalPrice) : ''}` : 'Place order'}</button>
          <p className="muted small center">🔒 Payments are encrypted and secure.</p>
        </aside>
      </form>
    </div>
  );
}
