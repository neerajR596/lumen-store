import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Account() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const save = async (e) => { e.preventDefault(); try { await updateProfile({ name, ...(password && { password }) }); setPassword(''); toast('Saved'); } catch (e2) { toast(e2.message, 'err'); } };
  const a = user.address;
  return (
    <div className="wrap account narrow">
      <h1 className="page-title">Hi, {user.name.split(' ')[0]}.</h1>
      <div className="stack">
        <form className="card form" onSubmit={save}>
          <h2>Profile</h2>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Email<input value={user.email} disabled /></label>
          <label>New password <span className="muted">(leave blank to keep)</span><input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button className="btn">Save changes</button>
        </form>
        <div className="card"><h2>Saved address</h2>{a?.line1 ? <p>{a.fullName}<br />{a.line1}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}</p> : <p className="muted">Your address is saved at checkout.</p>}</div>
        <div className="row gap">
          <Link to="/orders" className="btn ghost">Your orders</Link>
          {user.isAdmin && <Link to="/admin" className="btn ghost">Dashboard</Link>}
          <button className="btn ghost" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
