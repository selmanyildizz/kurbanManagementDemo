import { useState } from 'react';
import { useApp } from '../context/AppContext';

const FIELDS = [
  { key: 'name', label: 'Ad Soyad *', placeholder: 'Ahmet Yılmaz', type: 'text' },
  { key: 'phone', label: 'Telefon *', placeholder: '0532 111 22 33', type: 'tel' },
  { key: 'email', label: 'E-posta (opsiyonel)', placeholder: 'ornek@mail.com', type: 'email' },
  { key: 'note', label: 'Not (opsiyonel)', placeholder: 'Mahalle, özel istek...', type: 'text' },
];

const EMPTY_FORM = { name: '', phone: '', email: '', shares: 7, note: '' };

export default function RegisterPage() {
  const { registerKurban, showToast } = useApp();
  const [regForm, setRegForm] = useState(EMPTY_FORM);
  const [regLoading, setRegLoading] = useState(false);
  const [lastToken, setLastToken] = useState(null);
  const [tokenRevealed, setTokenRevealed] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.phone.trim()) {
      showToast('İsim ve telefon zorunlu', 'error'); return;
    }
    setRegLoading(true);
    try {
      const r = await registerKurban(regForm);
      setLastToken(r.token);
      setTokenRevealed(false);
      setRegForm(EMPTY_FORM);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setRegLoading(false); }
  }

  return (
    <div className="narrow">
      <div className="card card-pad">
        <div className="card-head" style={{ padding: '0 0 16px', border: 'none' }}>Yeni Kurban Kaydı</div>
        <form onSubmit={handleRegister} className="form">
          {FIELDS.map(f => (
            <div key={f.key} className="field">
              <label htmlFor={`reg-${f.key}`}>{f.label}</label>
              <input id={`reg-${f.key}`} className="input" type={f.type} placeholder={f.placeholder}
                value={regForm[f.key]} onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div className="field">
            <label htmlFor="reg-shares">Hisse Sayısı</label>
            <select id="reg-shares" className="input" value={regForm.shares}
              onChange={e => setRegForm(p => ({ ...p, shares: parseInt(e.target.value) }))}>
              {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} hisse</option>)}
            </select>
          </div>
          <button type="submit" disabled={regLoading} className="btn btn-block">
            {regLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>

        {lastToken && (
          <div className="token-box">
            <div className="hint">✓ Token kaydedildi</div>
            {tokenRevealed && <div className="code">{lastToken}</div>}
            <div className="hint2">Check-in sırasında bu kod girilecek</div>
            <button type="button" className="btn btn-ghost token-reveal"
              onClick={() => setTokenRevealed(v => !v)}>
              {tokenRevealed ? 'Gizle' : "Token'ı Göster"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
