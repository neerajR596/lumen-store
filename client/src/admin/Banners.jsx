import { useEffect, useState } from 'react';
import { api, imgUrl } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import ImageInput from './ImageInput.jsx';

const NEW = { eyebrow: '', title: '', subtitle: '', image: '', ctaText: 'Shop now', ctaLink: '/shop', secondaryText: '', secondaryLink: '', theme: 'light', size: 'full', active: true };

function TilePreview({ b }) {
  return (
    <div className={`tile mini ${b.theme}`}>
      <div className="tile-copy">{b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}<h2>{b.title || 'Banner title'}</h2>{b.subtitle && <p className="tile-sub">{b.subtitle}</p>}
        <div className="cta-pair">{b.ctaText && <span className={`btn sm ${b.theme === 'dark' ? 'on-dark' : ''}`}>{b.ctaText}</span>}{b.secondaryText && <span className="link-arrow">{b.secondaryText} ›</span>}</div></div>
      {b.image && <div className="tile-media"><img src={imgUrl(b.image)} alt="" /></div>}
    </div>
  );
}

export default function AdminBanners() {
  const [list, setList] = useState([]);
  const [edit, setEdit] = useState(null);
  const toast = useToast();
  const load = () => api('/banners?all=1').then(setList);
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    try { await api(edit._id ? `/banners/${edit._id}` : '/banners', { method: edit._id ? 'PUT' : 'POST', body: { ...edit, order: edit.order ?? list.length + 1 } }); toast('Banner saved, live on the home page'); setEdit(null); load(); }
    catch (e2) { toast(e2.message, 'err'); }
  };
  const patch = async (b, body) => { await api(`/banners/${b._id}`, { method: 'PUT', body }); load(); };
  const move = async (i, d) => {
    const a = list[i], b = list[i + d]; if (!b) return;
    await Promise.all([api(`/banners/${a._id}`, { method: 'PUT', body: { order: i + d } }), api(`/banners/${b._id}`, { method: 'PUT', body: { order: i } })]);
    load();
  };
  const del = async (b) => { if (!confirm('Delete this banner?')) return; await api(`/banners/${b._id}`, { method: 'DELETE' }); toast('Banner deleted'); load(); };
  const f = (k) => ({ value: edit?.[k] ?? '', onChange: (e) => setEdit({ ...edit, [k]: e.target.value }) });

  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Home banners</h1><p className="muted">The big showcase tiles under the hero. Full-width tiles stack; half-width tiles sit side by side.</p></div><button className="abtn" onClick={() => setEdit({ ...NEW })}>+ New banner</button></header>
      <div className="banner-list">
        {list.map((b, i) => (
          <div key={b._id} className={`panel banner-row ${!b.active ? 'dim' : ''}`}>
            <div className="banner-thumb"><TilePreview b={b} /></div>
            <div className="grow"><h3>{b.title}</h3><p className="muted small">{b.subtitle}</p><p className="small"><span className="tag">{b.size === 'half' ? 'Half width' : 'Full width'}</span> <span className="tag">{b.theme}</span></p></div>
            <div className="banner-actions">
              <label className="row gap small">Live <button className={`toggle ${b.active ? 'on' : ''}`} onClick={() => patch(b, { active: !b.active })} /></label>
              <div className="row gap"><button className="abtn ghost sm" onClick={() => move(i, -1)} disabled={i === 0}>↑</button><button className="abtn ghost sm" onClick={() => move(i, 1)} disabled={i === list.length - 1}>↓</button></div>
              <div className="row gap"><button className="link small" onClick={() => setEdit(b)}>Edit</button><button className="link small danger" onClick={() => del(b)}>Delete</button></div>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="muted">No banners yet. Create one to showcase products on the home page.</p>}
      </div>

      {edit && (
        <div className="modal-wrap" onClick={() => setEdit(null)}>
          <form className="modal wide panel" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3>{edit._id ? 'Edit banner' : 'New banner'}</h3>
            <div className="modal-split">
              <div className="aform">
                <div className="grid2f"><label>Eyebrow<input {...f('eyebrow')} placeholder="e.g. New" /></label><label>Title<input required {...f('title')} /></label></div>
                <label>Subtitle<input {...f('subtitle')} /></label>
                <ImageInput value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} />
                <div className="grid2f"><label>Button text<input {...f('ctaText')} /></label><label>Button link<input {...f('ctaLink')} placeholder="/product/… or /shop?category=…" /></label></div>
                <div className="grid2f"><label>Second link text<input {...f('secondaryText')} placeholder="Learn more" /></label><label>Second link<input {...f('secondaryLink')} /></label></div>
                <div className="grid2f">
                  <label>Theme<select {...f('theme')}><option value="light">Light</option><option value="dark">Dark</option></select></label>
                  <label>Size<select {...f('size')}><option value="full">Full width</option><option value="half">Half width</option></select></label>
                </div>
              </div>
              <div><p className="muted small">Live preview</p><TilePreview b={edit} /></div>
            </div>
            <div className="row gap end"><button type="button" className="abtn ghost" onClick={() => setEdit(null)}>Cancel</button><button className="abtn">Save banner</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
