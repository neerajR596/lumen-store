import { useEffect, useState } from 'react';
import { api, imgUrl } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ImageInput from './ImageInput.jsx';

const ACCENTS = ['#0071e3', '#ff2d55', '#34c759', '#ff9f0a', '#af52de', '#1d1d1f'];

export default function Storefront() {
  const { settings, setSettings } = useStore();
  const toast = useToast();
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (settings) setS(settings); }, [settings]);
  if (!s) return <div className="page-loading"><span className="spinner" /></div>;
  const f = (k, type) => ({ value: s[k] ?? '', onChange: (e) => setS({ ...s, [k]: type === 'num' ? +e.target.value : e.target.value }) });
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const saved = await api('/settings', { method: 'PUT', body: s }); setSettings(saved); toast('Storefront updated, changes are live'); }
    catch (e2) { toast(e2.message, 'err'); } finally { setBusy(false); }
  };
  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Storefront</h1><p className="muted">Change your store’s name, hero, announcement bar, colours and delivery rules.</p></div><button className="abtn" form="sform" disabled={busy}>{busy ? 'Saving…' : 'Publish changes'}</button></header>
      <form id="sform" className="editor" onSubmit={save}>
        <div className="stack">
          <div className="panel aform">
            <h3>Brand</h3>
            <label>Store name<input {...f('storeName')} /></label>
            <span className="lbl">Accent colour</span>
            <div className="row gap">{ACCENTS.map((c) => <button type="button" key={c} className={`swatch-btn ${s.accentColor === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setS({ ...s, accentColor: c })} />)}
              <input type="color" value={s.accentColor} onChange={(e) => setS({ ...s, accentColor: e.target.value })} /></div>
          </div>
          <div className="panel aform">
            <h3>Announcement bar</h3>
            <label className="check"><input type="checkbox" checked={s.announcementActive} onChange={(e) => setS({ ...s, announcementActive: e.target.checked })} /> Show announcement</label>
            <label>Message<input {...f('announcement')} /></label>
          </div>
          <div className="panel aform">
            <h3>Hero section</h3>
            <label>Eyebrow<input {...f('heroEyebrow')} /></label>
            <label>Headline <span className="muted">(press Enter for a new line)</span><textarea rows="2" {...f('heroTitle')} /></label>
            <label>Sub-headline<input {...f('heroSubtitle')} /></label>
            <div className="grid2f"><label>Button text<input {...f('heroCtaText')} /></label><label>Button link<input {...f('heroCtaLink')} /></label></div>
            <ImageInput label="Hero image (optional, defaults to your first featured product)" value={s.heroImage} onChange={(v) => setS({ ...s, heroImage: v })} />
          </div>
          <div className="panel aform">
            <h3>Delivery & tax</h3>
            <div className="grid3f">
              <label>Free delivery above (₹)<input type="number" {...f('freeShippingThreshold', 'num')} /></label>
              <label>Delivery fee (₹)<input type="number" {...f('shippingFee', 'num')} /></label>
              <label>GST rate<input type="number" step="0.01" min="0" max="1" {...f('taxRate', 'num')} /></label>
            </div>
            <label>Footer note<input {...f('footerNote')} /></label>
          </div>
        </div>
        <div className="stack sticky-col">
          <div className="panel"><h3>Live preview</h3>
            <div className="sf-preview" style={{ '--accent': s.accentColor }}>
              {s.announcementActive && <div className="announce">{s.announcement}</div>}
              <div className="sf-nav"><strong>{s.storeName}</strong><span>Store · Audio · Home</span></div>
              <div className="sf-hero">
                <p className="eyebrow accent">{s.heroEyebrow}</p>
                <h2>{s.heroTitle.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}</h2>
                <p className="muted">{s.heroSubtitle}</p>
                <span className="btn sm">{s.heroCtaText}</span>
                {s.heroImage && <img src={imgUrl(s.heroImage)} alt="" />}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
