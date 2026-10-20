import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { Logo } from '../components/Icons.jsx';

function AuthShell({ title, children, foot }) {
  const { settings } = useStore();
  return (
    <div className="auth">
      <div className="auth-card fade-up">
        <Logo width={40} height={40} className="accent-text" />
        <h1>{title}</h1>
        <p className="muted">{settings?.storeName || 'Lumen'} Account</p>
        {children}
        <p className="muted small center">{foot}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setErr(''); setBusy(true);
    try { const u = await login(f.email, f.password); nav(params.get('next') || (u.isAdmin ? '/admin' : '/')); } catch (e2) { setErr(e2.message); } finally { setBusy(false); } };
  return (
    <AuthShell title="Sign in." foot={<>New here? <Link className="link" to={`/register${params.get('next') ? `?next=${params.get('next')}` : ''}`}>Create your account</Link></>}>
      <form className="form" onSubmit={submit}>
        <input type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
        <input type="password" required placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" />
        {err && <p className="error">{err}</p>}
        <button className="btn block lg" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setErr(''); setBusy(true);
    try { await register(f.name, f.email, f.password); nav(params.get('next') || '/'); } catch (e2) { setErr(e2.message); } finally { setBusy(false); } };
  return (
    <AuthShell title="Create account." foot={<>Already have one? <Link className="link" to="/login">Sign in</Link></>}>
      <form className="form" onSubmit={submit}>
        <input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
        <input type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
        <input type="password" required minLength={6} placeholder="Password (6+ characters)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" />
        {err && <p className="error">{err}</p>}
        <button className="btn block lg" disabled={busy}>{busy ? 'Creating…' : 'Continue'}</button>
      </form>
    </AuthShell>
  );
}
