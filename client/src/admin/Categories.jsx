import { useEffect, useState } from 'react';
import { api, imgUrl } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ImageInput from './ImageInput.jsx';

export default function AdminCategories() {
  const { categories, refresh } = useStore();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  useEffect(() => { refresh(); }, []); // eslint-disable-line
  const save = async (e) => {
    e.preventDefault();
    try { await api(edit._id ? `/categories/${edit._id}` : '/categories', { method: edit._id ? 'PUT' : 'POST', body: edit }); toast('Saved'); setEdit(null); refresh(); }
    catch (e2) { toast(e2.message, 'err'); }
  };
  const del = async (c) => { if (!confirm(`Delete category “${c.name}”?`)) return; try { await api(`/categories/${c._id}`, { method: 'DELETE' }); toast('Deleted'); refresh(); } catch (e) { toast(e.message, 'err'); } };
  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Categories</h1><p className="muted">Shown in the navigation bar and on the home page.</p></div><button className="abtn" onClick={() => setEdit({ name: '', tagline: '', image: '', order: categories.length + 1 })}>+ New category</button></header>
      <div className="cat-admin">
        {categories.map((c) => (
          <div key={c._id} className="panel cat-tile">
            <img src={imgUrl(c.image)} alt="" />
            <div className="grow"><h3>{c.name}</h3><p className="muted small">{c.tagline}</p><p className="muted small">{c.count} products · /{c.slug}</p></div>
            <div className="row gap"><button className="link small" onClick={() => setEdit(c)}>Edit</button><button className="link small danger" onClick={() => del(c)}>Delete</button></div>
          </div>
        ))}
      </div>
      {edit && (
        <div className="modal-wrap" onClick={() => setEdit(null)}>
          <form className="modal panel aform" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3>{edit._id ? 'Edit category' : 'New category'}</h3>
            <label>Name<input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            <label>Tagline<input value={edit.tagline || ''} onChange={(e) => setEdit({ ...edit, tagline: e.target.value })} /></label>
            <label>Display order<input type="number" value={edit.order || 0} onChange={(e) => setEdit({ ...edit, order: +e.target.value })} /></label>
            <ImageInput value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} />
            <div className="row gap end"><button type="button" className="abtn ghost" onClick={() => setEdit(null)}>Cancel</button><button className="abtn">Save</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
