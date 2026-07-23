import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ListOrdered } from 'lucide-react';
import { api } from '../api/api';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { session, login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/panel" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login(username.trim(), password);
      login();
      navigate('/panel');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark login-mark" aria-hidden="true"><ListOrdered size={22} /></span>
          <h1>Kurban Sıra Sistemi</h1>
          <div className="sub">Büro Girişi</div>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label htmlFor="login-user">Kullanıcı Adı</label>
            <input id="login-user" className="input" value={username}
              onChange={e => setUsername(e.target.value)} autoFocus autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="login-pass">Şifre</label>
            <input id="login-pass" className="input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-block">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
