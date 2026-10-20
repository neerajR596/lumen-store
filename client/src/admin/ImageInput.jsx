import { useRef, useState } from 'react';
import { api, imgUrl } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';

// Paste an image URL or upload a file from your computer (stored on the server).
export default function ImageInput({ value, onChange, label = 'Image', compact }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const upload = async (file) => {
    if (!file) return;
    const fd = new FormData(); fd.append('image', file);
    setBusy(true);
    try { const { url } = await api('/admin/upload', { method: 'POST', form: fd }); onChange(url); toast('Image uploaded'); }
    catch (e) { toast(e.message, 'err'); } finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  };
  return (
    <div className={`img-input ${compact ? 'compact' : ''}`}>
      {label && <span className="lbl">{label}</span>}
      <div className="img-input-row">
        <div className="img-prev">{value ? <img src={imgUrl(value)} alt="" /> : <span>No image</span>}</div>
        <div className="grow">
          <input placeholder="https://… or upload" value={value || ''} onChange={(e) => onChange(e.target.value)} />
          <div className="row gap">
            <button type="button" className="abtn sm" onClick={() => ref.current?.click()} disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
            {value && <button type="button" className="abtn sm ghost" onClick={() => onChange('')}>Clear</button>}
          </div>
          <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
      </div>
    </div>
  );
}
