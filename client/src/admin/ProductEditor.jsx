import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ImageInput from './ImageInput.jsx';
import ProductCard from '../components/ProductCard.jsx';

const EMPTY = { title: '', brand: 'Lumen', category: '', tagline: '', description: '', highlights: [], price: '', mrp: '', stock: 10, images: [''], colors: [], featured: false, isActive: true };

export default function ProductEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { categories, refresh } = useStore();
  const toast = useToast();
  const [p, setP] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (id) api(`/products/${id}`).then(({ product }) => setP({ ...EMPTY, ...product, images: product.images?.length ? product.images : [''] }));
    else setP((x) => ({ ...x, category: categories[0]?.slug || '' }));
  }, [id, categories.length]); // eslint-disable-line

  const set = (k) => (e) => setP((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { ...p, price: +p.price, mrp: p.mrp ? +p.mrp : undefined, stock: +p.stock, images: p.images.filter(Boolean), highlights: p.highlights.filter(Boolean), colors: p.colors.filter((c) => c.name) };
    try {
      const saved = id ? await api(`/products/${id}`, { method: 'PUT', body }) : await api('/products', { method: 'POST', body });
      toast(id ? 'Product updated' : 'Product created'); refresh();
      if (!id) nav(`/admin/products/${saved._id}`, { replace: true });
    } catch (e2) { toast(e2.message, 'err'); } finally { setBusy(false); }
  };
  const preview = { ...p, _id: 'preview', slug: p.slug || '', price: +p.price || 0, mrp: +p.mrp || 0, images: p.images.filter(Boolean) };

  return (
    <div className="admin-page">
      <header className="admin-head"><div><Link to="/admin/products" className="link small">← Products</Link><h1>{id ? 'Edit product' : 'New product'}</h1></div>
        <div className="row gap">{id && p.slug && <a className="abtn ghost" href={`/product/${p.slug}`} target="_blank" rel="noreferrer">View ↗</a>}<button className="abtn" form="pform" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div></header>
      <form id="pform" className="editor" onSubmit={save}>
        <div className="stack">
          <div className="panel aform">
            <h3>Details</h3>
            <label>Title<input required value={p.title} onChange={set('title')} /></label>
            <label>Tagline<input value={p.tagline} onChange={set('tagline')} placeholder="One punchy line" /></label>
            <label>Description<textarea rows="5" value={p.description} onChange={set('description')} /></label>
            <label>Highlights <span className="muted">(one per line)</span><textarea rows="4" value={p.highlights.join('\n')} onChange={(e) => setP((x) => ({ ...x, highlights: e.target.value.split('\n') }))} /></label>
            <div className="grid2f">
              <label>Category<select required value={p.category} onChange={set('category')}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
              <label>Brand<input value={p.brand} onChange={set('brand')} /></label>
            </div>
          </div>
          <div className="panel aform">
            <h3>Images</h3>
            {p.images.map((src, i) => (
              <div key={i} className="row gap top">
                <div className="grow"><ImageInput label={i === 0 ? 'Main image' : `Image ${i + 1}`} value={src} onChange={(v) => setP((x) => ({ ...x, images: x.images.map((s, j) => (j === i ? v : s)) }))} /></div>
                {p.images.length > 1 && <button type="button" className="link small danger" onClick={() => setP((x) => ({ ...x, images: x.images.filter((_, j) => j !== i) }))}>Remove</button>}
              </div>
            ))}
            <button type="button" className="abtn ghost sm" onClick={() => setP((x) => ({ ...x, images: [...x.images, ''] }))}>+ Add image</button>
          </div>
          <div className="panel aform">
            <h3>Colours</h3>
            {p.colors.map((c, i) => (
              <div key={i} className="row gap">
                <input type="color" value={c.hex || '#000000'} onChange={(e) => setP((x) => ({ ...x, colors: x.colors.map((cc, j) => (j === i ? { ...cc, hex: e.target.value } : cc)) }))} />
                <input className="grow" placeholder="Colour name" value={c.name} onChange={(e) => setP((x) => ({ ...x, colors: x.colors.map((cc, j) => (j === i ? { ...cc, name: e.target.value } : cc)) }))} />
                <button type="button" className="link small danger" onClick={() => setP((x) => ({ ...x, colors: x.colors.filter((_, j) => j !== i) }))}>Remove</button>
              </div>
            ))}
            <button type="button" className="abtn ghost sm" onClick={() => setP((x) => ({ ...x, colors: [...x.colors, { name: '', hex: '#1d1d1f' }] }))}>+ Add colour</button>
          </div>
        </div>
        <div className="stack">
          <div className="panel aform">
            <h3>Pricing & stock</h3>
            <label>Price (₹)<input required type="number" min="0" value={p.price} onChange={set('price')} /></label>
            <label>MRP (₹) <span className="muted">(shows a discount if higher)</span><input type="number" min="0" value={p.mrp || ''} onChange={set('mrp')} /></label>
            <label>Stock<input type="number" min="0" value={p.stock} onChange={set('stock')} /></label>
            <label className="check"><input type="checkbox" checked={p.featured} onChange={set('featured')} /> Featured on home page</label>
            <label className="check"><input type="checkbox" checked={p.isActive} onChange={set('isActive')} /> Visible in store</label>
          </div>
          <div className="panel"><h3>Live preview</h3><div className="preview-card" onClickCapture={(e) => e.preventDefault()}><ProductCard p={preview} /></div></div>
        </div>
      </form>
    </div>
  );
}
