import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';

const SORTS = [['newest', 'Newest'], ['popular', 'Most popular'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', 'Top rated']];
const RANGES = [['', '', 'Any price'], ['', '5000', 'Under ₹5,000'], ['5000', '20000', '₹5,000 – ₹20,000'], ['20000', '50000', '₹20,000 – ₹50,000'], ['50000', '', 'Over ₹50,000']];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { categories } = useStore();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const category = params.get('category') || '', q = params.get('q') || '', sort = params.get('sort') || 'newest';
  const min = params.get('min') || '', max = params.get('max') || '', page = +params.get('page') || 1;

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ limit: 12, page, sort, ...(category && { category }), ...(q && { q }), ...(min && { min }), ...(max && { max }) });
    api(`/products?${qs}`).then(setData).catch(() => setData({ items: [], total: 0, pages: 1 })).finally(() => setLoading(false));
  }, [category, q, sort, min, max, page]);

  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...patch }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };
  const cat = categories.find((c) => c.slug === category);

  return (
    <div className="shop wrap">
      <header className="shop-head">
        <Reveal as="h1">{q ? <>Results for “{q}”</> : cat ? cat.name : <>Store. <span className="muted">The best way to buy the things you love.</span></>}</Reveal>
        {cat && <p className="muted lead">{cat.tagline}</p>}
      </header>

      <div className="chips">
        <button className={!category ? 'chip on' : 'chip'} onClick={() => set({ category: '' })}>All</button>
        {categories.map((c) => <button key={c.slug} className={category === c.slug ? 'chip on' : 'chip'} onClick={() => set({ category: c.slug })}>{c.name}</button>)}
      </div>

      <div className="shop-bar">
        <span className="muted">{loading ? 'Loading…' : `${data.total} product${data.total === 1 ? '' : 's'}`}</span>
        <div className="shop-filters">
          <select value={`${min}|${max}`} onChange={(e) => { const [a, b] = e.target.value.split('|'); set({ min: a, max: b }); }}>
            {RANGES.map(([a, b, l]) => <option key={l} value={`${a}|${b}`}>{l}</option>)}
          </select>
          <select value={sort} onChange={(e) => set({ sort: e.target.value })}>
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {(q || min || max) && <button className="link" onClick={() => set({ q: '', min: '', max: '' })}>Clear filters</button>}
        </div>
      </div>

      {loading ? (
        <div className="pgrid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton card-skel" />)}</div>
      ) : data.items.length === 0 ? (
        <div className="empty"><h2>No products found.</h2><p className="muted">Try a different search or category.</p></div>
      ) : (
        <div className="pgrid">{data.items.map((p, i) => <Reveal key={p._id} delay={(i % 4) * 50}><ProductCard p={p} /></Reveal>)}</div>
      )}

      {data.pages > 1 && (
        <div className="pager">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
            <button key={n} className={n === page ? 'on' : ''} onClick={() => { set({ page: n === 1 ? '' : String(n) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{n}</button>
          ))}
        </div>
      )}
    </div>
  );
}
