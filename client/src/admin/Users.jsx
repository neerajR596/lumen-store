import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const { user: me } = useAuth();
  const toast = useToast();
  useEffect(() => { api('/admin/users').then(setUsers); }, []);
  const toggle = async (u) => { try { const n = await api(`/admin/users/${u._id}`, { method: 'PUT', body: { isAdmin: !u.isAdmin } }); setUsers((xs) => xs.map((x) => (x._id === n._id ? n : x))); toast(n.isAdmin ? `${n.name} is now an admin` : `${n.name} is no longer an admin`); } catch (e) { toast(e.message, 'err'); } };
  const del = async (u) => { if (!confirm(`Delete ${u.name}?`)) return; try { await api(`/admin/users/${u._id}`, { method: 'DELETE' }); setUsers((xs) => xs.filter((x) => x._id !== u._id)); } catch (e) { toast(e.message, 'err'); } };
  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Customers</h1><p className="muted">{users ? `${users.length} accounts` : 'Loading…'}</p></div></header>
      <div className="panel flush">
        <table className="atable"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Admin</th><th /></tr></thead>
          <tbody>{(users || []).map((u) => (
            <tr key={u._id}><td><span className="avatar sm">{u.name[0]}</span> {u.name}</td><td className="muted">{u.email}</td><td className="muted">{new Date(u.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
              <td><button className={`toggle ${u.isAdmin ? 'on' : ''}`} disabled={u._id === me._id} onClick={() => toggle(u)} /></td>
              <td className="r">{u._id !== me._id && <button className="link small danger" onClick={() => del(u)}>Delete</button>}</td></tr>
          ))}</tbody></table>
      </div>
    </div>
  );
}
