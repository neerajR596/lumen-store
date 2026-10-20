import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, imgUrl, inr } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import Stars from '../components/Stars.jsx';
import { Truck, Return, Shield } from '../components/Icons.jsx';

export default function ProductPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [img, setImg] = useState(0);
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const { add } = useCart();
  const { user } = useAuth();
  const { categories, settings } = useStore();
  const toast = useToast();

  const load = () => api(`/products/${slug}`).then((d) => { setData(d); setColor(d.product.colors?.[0]?.name || ''); }).catch((e) => setErr(e.message));
  useEffect(() => { setData(null); setImg(0); setQty(1); load(); }, [slug]); // eslint-disable-line

  if (err) return <div className="wrap empty"><h2>{err}</h2><Link to="/shop" className="link">Back to the store</Link></div>;
  if (!data) return <div className="page-loading"><span className="spinner" /></div>;
  const { product: p, related } = data;
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const cat = categories.find((c) => c.slug === p.category);
  const emi = Math.round(p.price / 12);

  const submitReview = async (e) => {
    e.preventDefault();
    try { await api(`/products/${p._id}/reviews`, { method: 'POST', body: review }); toast('Thanks for your review!'); setReview({ rating: 5, comment: '' }); load(); }
    catch (e2) { toast(e2.message, 'err'); }
  };

  return (
    <div className="pdp">
      <div className="localnav">
        <div className="wrap row-between">
          <strong>{p.title}</strong>
          <div className="row gap"><span className="muted small hide-sm">{inr(p.price)}</span>
            <button className="btn sm" disabled={p.stock === 0} onClick={() => add(p, qty, color)}>{p.stock === 0 ? 'Sold out' : 'Add to Bag'}</button></div>
        </div>
      </div>

      <section className="wrap pdp-main">
        <div className="gallery">
          <div className="gallery-main"><img key={img} className="fade-in" src={imgUrl(p.images?.[img])} alt={p.title} /></div>
          {p.images?.length > 1 && (
            <div className="thumbs">{p.images.map((src, i) => <button key={src} className={i === img ? 'on' : ''} onClick={() => setImg(i)}><img src={imgUrl(src)} alt="" /></button>)}</div>
          )}
        </div>

        <div className="buybox">
          {cat && <Link to={`/shop?category=${cat.slug}`} className="eyebrow accent">{cat.name}</Link>}
          <h1>{p.title}</h1>
          <p className="lead muted">{p.tagline}</p>
          {p.numReviews > 0 && <a href="#reviews" className="row gap small"><Stars value={p.rating} /> <span className="muted">{p.rating} · {p.numReviews} review{p.numReviews > 1 ? 's' : ''}</span></a>}
          <div className="price-block">
            <span className="big-price">{inr(p.price)}</span>
            {off > 0 && <><s className="muted">{inr(p.mrp)}</s><span className="save">Save {off}%</span></>}
            <p className="muted small">Inclusive of all taxes · or {inr(emi)}/mo. for 12 mo.*</p>
          </div>

          {p.colors?.length > 0 && (
            <div className="opt">
              <p className="opt-label">Colour <span className="muted">· {color}</span></p>
              <div className="color-row">{p.colors.map((c) => (
                <button key={c.name} className={`color-dot ${color === c.name ? 'on' : ''}`} style={{ '--c': c.hex }} onClick={() => setColor(c.name)} aria-label={c.name} />
              ))}</div>
            </div>
          )}

          <div className="opt">
            <p className="opt-label">Quantity</p>
            <div className="qty"><button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button><span>{qty}</span><button onClick={() => setQty((q) => Math.min(10, p.stock || 1, q + 1))}>+</button></div>
            <p className={`small ${p.stock > 5 ? 'ok-text' : 'warn-text'}`}>{p.stock === 0 ? 'Currently unavailable' : p.stock <= 5 ? `Only ${p.stock} left, order soon` : 'In stock, ready to ship'}</p>
          </div>

          <button className="btn block lg" disabled={p.stock === 0} onClick={() => add(p, qty, color)}>{p.stock === 0 ? 'Sold out' : 'Add to Bag'}</button>

          <ul className="perks">
            <li><Truck /><div><strong>{p.price >= (settings?.freeShippingThreshold ?? 999) ? 'Free delivery' : 'Fast delivery'}</strong><span className="muted small">Arrives in 2–5 business days</span></div></li>
            <li><Return /><div><strong>10-day returns</strong><span className="muted small">Free and easy</span></div></li>
            <li><Shield /><div><strong>1-year warranty</strong><span className="muted small">Genuine product guarantee</span></div></li>
          </ul>
        </div>
      </section>

      <section className="pdp-story">
        <div className="wrap narrow">
          <Reveal as="h2" className="display">{p.tagline || p.title}</Reveal>
          <Reveal as="p" className="lead">{p.description}</Reveal>
          {p.highlights?.length > 0 && (
            <div className="highlights">{p.highlights.map((h, i) => <Reveal key={h} delay={i * 70} className="hl"><span>{String(i + 1).padStart(2, '0')}</span>{h}</Reveal>)}</div>
          )}
        </div>
      </section>

      <section className="wrap reviews" id="reviews">
        <h2 className="section-title"><b>Reviews.</b> <span className="muted">{p.numReviews ? `${p.rating} out of 5` : 'Be the first to review.'}</span></h2>
        <div className="reviews-grid">
          <div className="review-list">
            {p.reviews.length === 0 && <p className="muted">No reviews yet.</p>}
            {p.reviews.slice().reverse().map((r) => (
              <div key={r._id} className="review"><Stars value={r.rating} /><p className="strong">{r.name}</p><p>{r.comment}</p><p className="muted small">{new Date(r.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p></div>
            ))}
          </div>
          {user ? (
            <form className="card form" onSubmit={submitReview}>
              <h3>Write a review</h3>
              <div className="star-pick">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className={n <= review.rating ? 'on' : ''} onClick={() => setReview((r) => ({ ...r, rating: n }))}>★</button>)}</div>
              <textarea rows="4" placeholder="What did you think?" value={review.comment} onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))} />
              <button className="btn">Submit review</button>
            </form>
          ) : <div className="card"><p><Link className="link" to={`/login?next=/product/${p.slug}`}>Sign in</Link> to write a review.</p></div>}
        </div>
      </section>

      {related.length > 0 && (
        <section className="wrap related">
          <h2 className="section-title"><b>You may also like.</b></h2>
          <div className="pgrid">{related.map((r) => <ProductCard key={r._id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
