import { useState, useEffect, useCallback } from 'react';
import { api } from './api/api';

// ── Sabitler ──────────────────────────────────────────────────
const STATUS_LABEL = {
  WAITING: 'Bekliyor',
  CALLED: 'Çağrıldı',
  CUTTING: 'Kesiliyor',
  DONE: 'Hazır',
  NOSHOW: 'Gelmedi',
};
const STATUS_PILL = {
  WAITING: 'pill-waiting',
  CALLED: 'pill-called',
  CUTTING: 'pill-cutting',
  DONE: 'pill-done',
  NOSHOW: 'pill-noshow',
};
const STATION_STATUS_LABEL = { ACTIVE: 'Aktif', BREAK: 'Molada', OFFLINE: 'Kapalı' };
const STATION_PILL = { ACTIVE: 'pill-active', BREAK: 'pill-break', OFFLINE: 'pill-offline' };

// ── Yardımcılar ───────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}sn`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  return `${Math.floor(diff / 3600)}sa`;
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('');
}

// Kalabalık büro ortamında ekrana bakan biri kodu çalamasın diye
// token her listede maskeli gösterilir; tam kod yalnızca SMS'te.
function maskToken(t) {
  if (!t || t.length < 4) return t;
  return t.slice(0, 2) + '•••' + t.slice(-1);
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast ${type === 'error' ? 'error' : 'ok'}`}>
      {type === 'error' ? '✕' : '✓'} {msg}
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login(username.trim(), password);
      onLogin();
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
          <span className="emoji" aria-hidden="true">🐑</span>
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

// ── Ana Uygulama ──────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(() => api.getSession());
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('queue'); // queue | register | checkin | customer | log

  // Kayıt formu
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '', shares: 7, note: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [lastToken, setLastToken] = useState(null);
  const [tokenRevealed, setTokenRevealed] = useState(false);

  // Check-in
  const [checkinToken, setCheckinToken] = useState('');

  // Müşteri sorgulama
  const [queryToken, setQueryToken] = useState('');
  const [customerStatus, setCustomerStatus] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Dashboard polling — 5sn
  const loadDash = useCallback(async () => {
    try {
      const d = await api.getDashboard();
      setDash(d);
    } catch (e) {
      if (e.unauthorized) setSession(null);
      // backend henüz ayakta değilse sessizce geç
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    loadDash();
    const interval = setInterval(loadDash, 5000);
    return () => clearInterval(interval);
  }, [loadDash, session]);

  function handleLogout() {
    api.logout();
    setSession(null);
    setDash(null);
  }

  if (!session) {
    return <LoginForm onLogin={() => setSession(api.getSession())} />;
  }

  // ── Aksiyon handler'ları ────────────────────────────────────

  async function handleCallNext(stationId) {
    try {
      const r = await api.callNext(stationId);
      showToast(`${r.name} çağrıldı → ${r.stationName}`);
      loadDash();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function handleStartCutting(entryId, name) {
    try {
      await api.startCutting(entryId);
      showToast(`${name} kesimi başladı`);
      loadDash();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function handleComplete(entryId, name) {
    try {
      await api.complete(entryId);
      showToast(`${name} tamamlandı. SMS gönderildi.`);
      loadDash();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function handleBreak(stationId, stationName) {
    try {
      const r = await api.toggleBreak(stationId);
      showToast(`${stationName}: ${STATION_STATUS_LABEL[r.status]}`);
      loadDash();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.phone.trim()) {
      showToast('İsim ve telefon zorunlu', 'error'); return;
    }
    setRegLoading(true);
    try {
      const r = await api.registerKurban(regForm);
      setLastToken(r.token);
      setTokenRevealed(false);
      setRegForm({ name: '', phone: '', email: '', shares: 7, note: '' });
      showToast(`${r.name} kaydedildi. Token gönderildi.`);
      loadDash();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setRegLoading(false); }
  }

  async function handleCheckin(e) {
    e.preventDefault();
    if (!checkinToken.trim()) { showToast('Token girin', 'error'); return; }
    try {
      const r = await api.checkin(checkinToken.trim());
      setCheckinToken('');
      showToast(`${r.name} check-in! Sıra: ${r.queuePosition}`);
      loadDash();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function handleQuery(e) {
    e.preventDefault();
    try {
      const r = await api.getStatus(queryToken.trim());
      setCustomerStatus(r);
    } catch (e) { showToast(e.message, 'error'); }
  }

  const s = dash;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <span className="emoji" aria-hidden="true">🐑</span>
          <div>
            <div className="brand-name">Kurban Sıra Sistemi</div>
            <div className="brand-sub">Büro Paneli</div>
          </div>
        </div>

        <nav className="tabs" aria-label="Bölümler">
          {[
            { id: 'queue', label: 'Kuyruk' },
            { id: 'register', label: 'Kayıt' },
            { id: 'checkin', label: 'Check-in' },
            { id: 'customer', label: 'Müşteri' },
            { id: 'log', label: 'Log' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={activeTab === t.id ? 'on' : ''}>{t.label}</button>
          ))}
        </nav>

        <div className="header-right">
          {s && (
            <div className="stats">
              <div className="stat stat-waiting"><b className="tabular">{s.waitingCount}</b><span>Bekliyor</span></div>
              <div className="stat stat-cutting"><b className="tabular">{s.cuttingCount}</b><span>Kesiliyor</span></div>
              <div className="stat stat-done"><b className="tabular">{s.doneCount}</b><span>Hazır</span></div>
            </div>
          )}
          <div className="user-chip">
            <div className="avatar">{initials(session.displayName)}</div>
            <span>{session.displayName}</span>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '7px 13px', fontSize: 12.5 }}>Çıkış</button>
          </div>
        </div>
      </header>

      <main className="app-body">

        {/* ── KUYRUK SEKMESİ ──────────────────────────────── */}
        {activeTab === 'queue' && (
          <div className="queue-layout">
            <div>
              {/* Masalar */}
              {s && (
                <div className="stations">
                  {s.stations?.map(st => (
                    <div key={st.id} className="station">
                      <div className="station-head">
                        <b>{st.name}</b>
                        <span className={`pill ${STATION_PILL[st.status]}`}>{STATION_STATUS_LABEL[st.status]}</span>
                      </div>

                      {st.currentKurban ? (
                        <div className="occupant">
                          <div className="nm">{st.currentKurban.name}</div>
                          <div className="meta tabular">
                            {st.currentKurban.shares} hisse · {STATUS_LABEL[st.currentKurban.status]}
                          </div>
                        </div>
                      ) : (
                        <div className="station-empty">Boş</div>
                      )}

                      <div className="station-actions">
                        {st.currentKurban?.status === 'CALLED' && (
                          <button onClick={() => handleStartCutting(st.currentKurban.id, st.currentKurban.name)}
                            className="btn btn-danger">🔪 Kes</button>
                        )}
                        {st.currentKurban?.status === 'CUTTING' && (
                          <button onClick={() => handleComplete(st.currentKurban.id, st.currentKurban.name)}
                            className="btn btn-done">✓ Bitti</button>
                        )}
                        {!st.currentKurban && st.status === 'ACTIVE' && (
                          <button onClick={() => handleCallNext(st.id)} className="btn">▶ Sıradakini Çağır</button>
                        )}
                        <button onClick={() => handleBreak(st.id, st.name)}
                          className={`btn ${st.status === 'BREAK' ? 'btn-done' : 'btn-warn'}`}>
                          {st.status === 'BREAK' ? '▶ Devam' : '⏸ Mola'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Kuyruk listesi */}
              <div className="card">
                <div className="card-head">
                  <span>Aktif Kuyruk</span>
                  <span className="tabular">{s?.queue?.length || 0}</span>
                </div>
                {loading && <div className="empty-note">Yükleniyor...</div>}
                {!loading && (!s?.queue?.length) && <div className="empty-note">Kuyruk boş</div>}
                {s?.queue?.map(q => (
                  <div key={q.id} className={`qrow ${q.status === 'CALLED' ? 'called-bg' : ''}`}>
                    <div className="qpos tabular">{q.queuePosition ?? '—'}</div>
                    <div className="qinfo">
                      <div className="qname-line">
                        <span className="qname">{q.name}</span>
                        <span className={`pill ${STATUS_PILL[q.status]}`}>{STATUS_LABEL[q.status]}</span>
                        {q.stationName && <span className="qstation">{q.stationName}</span>}
                      </div>
                      <div className="qmeta tabular">
                        {q.shares} hisse · check-in: {timeAgo(q.checkinTime)} önce
                        {q.note && <> · {q.note}</>}
                      </div>
                    </div>
                    <span className="qtoken">{maskToken(q.token)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ: Log */}
            <div className="card">
              <div className="card-head">Son İşlemler</div>
              {s?.recentLogs?.map((l, i) => (
                <div key={i} className="logrow">
                  <div className="log-head">
                    <span className="log-act">{l.action}</span>
                    <span className="log-time">{timeAgo(l.createdAt)}</span>
                  </div>
                  <div className="log-line">
                    {l.kurbanName && <>{l.kurbanName} </>}
                    {l.stationName && <span className="log-station">→ {l.stationName}</span>}
                  </div>
                  {l.actor && <div className="log-actor">👤 {l.actor}</div>}
                  {l.note && <div className="log-note">{l.note}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── KAYIT SEKMESİ ────────────────────────────── */}
        {activeTab === 'register' && (
          <div className="narrow">
            <div className="card card-pad">
              <div className="card-head" style={{ padding: '0 0 16px', border: 'none' }}>Yeni Kurban Kaydı</div>
              <form onSubmit={handleRegister} className="form">
                {[
                  { key: 'name', label: 'Ad Soyad *', placeholder: 'Ahmet Yılmaz', type: 'text' },
                  { key: 'phone', label: 'Telefon *', placeholder: '0532 111 22 33', type: 'tel' },
                  { key: 'email', label: 'E-posta (opsiyonel)', placeholder: 'ornek@mail.com', type: 'email' },
                  { key: 'note', label: 'Not (opsiyonel)', placeholder: 'Mahalle, özel istek...', type: 'text' },
                ].map(f => (
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
        )}

        {/* ── CHECK-IN SEKMESİ ─────────────────────────── */}
        {activeTab === 'checkin' && (
          <div className="narrow">
            <div className="card card-pad">
              <div className="card-head" style={{ padding: '0 0 6px', border: 'none' }}>Müşteri Check-in</div>
              <p style={{ fontSize: 13, color: 'var(--dim)', margin: '0 0 18px' }}>
                Müşteri fiziksel olarak geldiğinde tokenını gir. Sırası o an başlar.
              </p>
              <form onSubmit={handleCheckin} className="inline-form">
                <input
                  className="input token-input"
                  placeholder="Token (ör. AB3X7K)"
                  value={checkinToken}
                  onChange={e => setCheckinToken(e.target.value.toUpperCase())}
                  aria-label="Check-in token"
                />
                <button type="submit" className="btn btn-done">✓ Giriş</button>
              </form>
              <p style={{ fontSize: 12, color: 'var(--noshow)', margin: '14px 0 0' }}>
                Erken gelen = erken sıra. Sıralama tamamen check-in zamanına göre yapılır.
              </p>
            </div>
          </div>
        )}

        {/* ── MÜŞTERİ SORGULAMA SEKMESİ ───────────────── */}
        {activeTab === 'customer' && (
          <div className="narrow">
            <div className="card card-pad">
              <div className="card-head" style={{ padding: '0 0 16px', border: 'none' }}>Müşteri Durumu Sorgula</div>
              <form onSubmit={handleQuery} className="inline-form" style={{ marginBottom: 20 }}>
                <input className="input token-input" placeholder="Token gir..." value={queryToken}
                  onChange={e => setQueryToken(e.target.value.toUpperCase())}
                  aria-label="Sorgulanacak token" />
                <button type="submit" className="btn">Sorgula</button>
              </form>

              {customerStatus && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{customerStatus.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 14 }} className="tabular">
                    {customerStatus.shares} hisse
                  </div>
                  <div className={`status-banner ${customerStatus.status || 'none'}`}>
                    {customerStatus.statusMessage}
                  </div>
                  {customerStatus.stationName && (
                    <div style={{ marginTop: 12, fontSize: 13, color: 'var(--dim)' }}>
                      Masa: {customerStatus.stationName}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LOG SEKMESİ ──────────────────────────────── */}
        {activeTab === 'log' && (
          <div className="card">
            <div className="card-head">Tüm İşlem Geçmişi</div>
            {s?.recentLogs?.map((l, i) => (
              <div key={i} className="logtable-row">
                <span className="t">{new Date(l.createdAt).toLocaleTimeString('tr-TR')}</span>
                <span className="a">{l.action}</span>
                <span className="n">{l.kurbanName || '—'}</span>
                <span className="s">{l.stationName || ''}</span>
                <span className="who">{l.actor ? `👤 ${l.actor}` : ''}</span>
                {l.note && <span className="note">{l.note}</span>}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
