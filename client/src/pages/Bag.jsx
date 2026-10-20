import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { imgUrl, inr } from '../api.js';

export default function Bag() {
  const { items, setQty, remove, key, subtotal } = useCart();
  const { settings } = useStore();
  const nav = useNavigate();
  const free = settings?.freeShippingThreshold ?? 999;
  const ship = subtotal >= free || !items.length ? 0 : settings?.shippingFee ?? 79;
  const tax = Math.round(subtotal * (settings?.taxRate ?? 0.18));

  if (!items.length) return (
    <div className="wrap empty tall"><h1>Your bag is empty.</h1><p className="muted lead">Sign in to see if you have any saved items, or continue shopping.</p>
      <div className="row gap center-row"><Link to="/shop" className="btn">Continue shopping</Link><Link to="/login" className="btn ghost">Sign in</Link></div></div>
  );

  return (
    <div className="wrap bag-page">
      <h1 className="page-title">Review your bag.</h1>
      <p className="muted lead center">{subtotal >= free ? 'Free delivery and free returns.' : `Add ${inr(free - subtotal)} more for free delivery.`}</p>
      <ul className="bag-list">
        {items.map((i) => (
          <li key={key(i)}>
            <img src={imgUrl(i.image)} alt="" />
            <div className="grow">
              <Link to={`/product/${i.slug}`}><h3>{i.title}</h3></Link>
              {i.color && <p className="muted">{i.color}</p>}
            </div>
            <div className="qty"><button onClick={() => setQty(key(i), i.qty - 1)}>−</button><span>{i.qty}</span><button onClick={() => setQty(key(i), i.qty + 1)}>+</button></div>
            <div className="right"><p className="price">{inr(i.price * i.qty)}</p><button className="link" onClick={() => remove(key(i))}>Remove</button></div>
          </li>
        ))}
      </ul>
      <div className="summary">
        <div className="row-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
        <div className="row-between"><span>Delivery</span><span>{ship ? inr(ship) : 'FREE'}</span></div>
        <div className="row-between"><span>GST ({Math.round((settings?.taxRate ?? 0.18) * 100)}%)</span><span>{inr(tax)}</span></div>
        <div className="row-between total"><span>Total</span><span>{inr(subtotal + ship + tax)}</span></div>
        <button className="btn block lg" onClick={() => nav('/checkout')}>Check out</button>
      </div>
    </div>
  );
}
