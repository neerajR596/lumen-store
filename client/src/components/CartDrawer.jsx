import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { imgUrl, inr } from '../api.js';
import { CloseIcon } from './Icons.jsx';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, key, subtotal } = useCart();
  const { settings } = useStore();
  const nav = useNavigate();
  const free = settings?.freeShippingThreshold ?? 999;
  const pct = Math.min(100, (subtotal / free) * 100);
  return (
    <>
      <div className={`drawer-scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head"><h3>Your Bag</h3><button className="icon-btn" onClick={() => setOpen(false)}><CloseIcon /></button></div>
        {items.length === 0 ? (
          <div className="drawer-empty"><p>Your bag is empty.</p><Link className="btn" to="/shop" onClick={() => setOpen(false)}>Continue shopping</Link></div>
        ) : (<>
          <div className="ship-meter">
            <p className="small">{subtotal >= free ? '✓ You’ve unlocked free delivery.' : `Add ${inr(free - subtotal)} more for free delivery.`}</p>
            <div className="meter"><span style={{ width: `${pct}%` }} /></div>
          </div>
          <ul className="drawer-items">
            {items.map((i) => (
              <li key={key(i)}>
                <img src={imgUrl(i.image)} alt="" />
                <div className="grow">
                  <Link to={`/product/${i.slug}`} onClick={() => setOpen(false)} className="strong">{i.title}</Link>
                  {i.color && <p className="muted small">{i.color}</p>}
                  <div className="qty sm">
                    <button onClick={() => setQty(key(i), i.qty - 1)}>−</button><span>{i.qty}</span><button onClick={() => setQty(key(i), i.qty + 1)}>+</button>
                  </div>
                </div>
                <div className="right"><p className="strong">{inr(i.price * i.qty)}</p><button className="link small" onClick={() => remove(key(i))}>Remove</button></div>
              </li>
            ))}
          </ul>
          <div className="drawer-foot">
            <div className="row-between"><span>Subtotal</span><span className="strong">{inr(subtotal)}</span></div>
            <button className="btn block lg" onClick={() => { setOpen(false); nav('/checkout'); }}>Check out</button>
            <Link to="/bag" className="link center block-link" onClick={() => setOpen(false)}>View bag</Link>
          </div>
        </>)}
      </aside>
    </>
  );
}
