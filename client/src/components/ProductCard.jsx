import { Link } from 'react-router-dom';
import { imgUrl, inr } from '../api.js';
import Stars from './Stars.jsx';

export default function ProductCard({ p, variant = 'grid' }) {
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  return (
    <Link to={`/product/${p.slug}`} className={`pcard ${variant}`}>
      <div className="pcard-media">
        {p.images?.[0] && <img src={imgUrl(p.images[0])} alt={p.title} loading="lazy" />}
        {off >= 10 && <span className="pill">Save {off}%</span>}
        {p.stock === 0 && <span className="pill dark">Sold out</span>}
      </div>
      <div className="pcard-body">
        {p.colors?.length > 0 && (
          <div className="swatches">{p.colors.slice(0, 4).map((c) => <i key={c.name} style={{ background: c.hex }} title={c.name} />)}</div>
        )}
        <h3>{p.title}</h3>
        <p className="muted">{p.tagline}</p>
        <div className="pcard-foot">
          <span className="price">{inr(p.price)}{off > 0 && <s>{inr(p.mrp)}</s>}</span>
          {p.numReviews > 0 && <Stars value={p.rating} size={12} />}
        </div>
      </div>
    </Link>
  );
}
