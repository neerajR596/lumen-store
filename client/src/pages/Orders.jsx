import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl, inr } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api('/orders/mine').then(setOrders).catch(() => setOrders([])); }, []);
  if (!orders) return <div className="page-loading"><span className="spinner" /></div>;
  return (
    <div className="wrap orders">
      <h1 className="page-title">Your orders.</h1>
      {orders.length === 0 ? <div className="empty"><p className="muted lead">You haven’t placed any orders yet.</p><Link to="/shop" className="btn">Start shopping</Link></div> : (
        <ul className="order-list">{orders.map((o) => (
          <li key={o._id}><Link to={`/orders/${o._id}`} className="card order-row">
            <div className="thumbs-stack">{o.items.slice(0, 3).map((i) => <img key={i._id} src={imgUrl(i.image)} alt="" />)}</div>
            <div className="grow"><p className="strong">#{o._id.slice(-8).toUpperCase()}</p><p className="muted small">{new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {o.items.reduce((s, i) => s + i.qty, 0)} item(s)</p></div>
            <span className={`status s-${o.status.replace(/\s/g, '').toLowerCase()}`}>{o.status}</span>
            <span className="strong">{inr(o.totalPrice)}</span>
          </Link></li>
        ))}</ul>
      )}
    </div>
  );
}
