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
const STATUS_COLOR = {
  WAITING: '#f59e0b',
  CALLED: '#3b82f6',
  CUTTING: '#ef4444',
  DONE: '#10b981',
  NOSHOW: '#6b7280',
};
const STATION_STATUS_LABEL = { ACTIVE: 'Aktif', BREAK: 'Molada', OFFLINE: 'Kapalı' };

// ── Yardımcılar ───────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}sn`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  return `${Math.floor(diff / 3600)}sa`;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'error' ? '#ef4444' : '#10b981',
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,.3)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {type === 'error' ? '✕' : '✓'} {msg}
    </div>
  );
}

// ── Ana Uygulama ──────────────────────────────────────────────
export default function App() {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('queue'); // queue | register | checkin | customer | log

  // Kayıt formu
  const [regForm, setRegForm] = useState({ name: '', phone: '', shares: 7, note: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [lastToken, setLastToken] = useState(null);

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
      // backend henüz ayakta değilse sessizce geç
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDash();
    const interval = setInterval(loadDash, 5000);
    return () => clearInterval(interval);
  }, [loadDash]);

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
      setRegForm({ name: '', phone: '', shares: 7, note: '' });
      showToast(`${r.name} kaydedildi. Token: ${r.token}`);
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

  // ── Render yardımcıları ────────────────────────────────────

  const s = dash;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🐑</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Kurban Sıra Sistemi</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Büro Paneli</div>
          </div>
        </div>

        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'queue', label: '📋 Kuyruk' },
            { id: 'register', label: '➕ Kayıt' },
            { id: 'checkin', label: '✅ Check-in' },
            { id: 'customer', label: '🔍 Müşteri' },
            { id: 'log', label: '📜 Log' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '7px 13px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: activeTab === t.id ? '#2563eb' : '#0f172a',
              color: activeTab === t.id ? '#fff' : '#94a3b8',
            }}>{t.label}</button>
          ))}
        </div>

        {/* İstatistik özeti */}
        {s && (
          <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
            {[
              { label: 'Bekliyor', val: s.waitingCount, color: '#f59e0b' },
              { label: 'Kesiliyor', val: s.cuttingCount, color: '#ef4444' },
              { label: 'Hazır', val: s.doneCount, color: '#10b981' },
            ].map(x => (
              <div key={x.label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: x.color }}>{x.val}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{x.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>

        {/* ── KUYRUK SEKMESİ ──────────────────────────────── */}
        {activeTab === 'queue' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

            {/* Sol: Aktif kuyruk */}
            <div>
              {/* Masalar */}
              {s && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(s.stations?.length || 2, 4)}, 1fr)`, gap: 12, marginBottom: 20 }}>
                  {s.stations?.map(st => (
                    <div key={st.id} style={{
                      background: '#1e293b', borderRadius: 14, padding: 16,
                      border: `2px solid ${st.status === 'ACTIVE' ? '#10b981' : st.status === 'BREAK' ? '#f59e0b' : '#475569'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700 }}>{st.name}</div>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                          background: st.status === 'ACTIVE' ? '#064e3b' : st.status === 'BREAK' ? '#451a03' : '#1e293b',
                          color: st.status === 'ACTIVE' ? '#34d399' : st.status === 'BREAK' ? '#fbbf24' : '#6b7280',
                        }}>
                          {STATION_STATUS_LABEL[st.status]}
                        </span>
                      </div>

                      {/* Masadaki aktif kurban */}
                      {st.currentKurban ? (
                        <div style={{ background: '#0f172a', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{st.currentKurban.name}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                            {st.currentKurban.shares} hisse · {STATUS_LABEL[st.currentKurban.status]}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            {st.currentKurban.status === 'CALLED' && (
                              <button onClick={() => handleStartCutting(st.currentKurban.id, st.currentKurban.name)}
                                style={btnStyle('#dc2626')}>🔪 Kes</button>
                            )}
                            {st.currentKurban.status === 'CUTTING' && (
                              <button onClick={() => handleComplete(st.currentKurban.id, st.currentKurban.name)}
                                style={btnStyle('#059669')}>✓ Bitti</button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#475569', fontSize: 13, marginBottom: 10 }}>Boş</div>
                      )}

                      {/* Aksiyon butonları */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!st.currentKurban && st.status === 'ACTIVE' && (
                          <button onClick={() => handleCallNext(st.id)}
                            style={btnStyle('#1d4ed8', { flex: 1 })}>
                            ▶ Sıradakini Çağır
                          </button>
                        )}
                        <button onClick={() => handleBreak(st.id, st.name)}
                          style={btnStyle(st.status === 'BREAK' ? '#059669' : '#92400e', { flex: st.currentKurban ? 1 : 0 })}>
                          {st.status === 'BREAK' ? '▶ Devam' : '⏸ Mola'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Kuyruk listesi */}
              <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', fontWeight: 700, fontSize: 14 }}>
                  Aktif Kuyruk {s ? `(${s.queue?.length || 0})` : ''}
                </div>
                {loading && <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Yükleniyor...</div>}
                {!loading && (!s?.queue?.length) && (
                  <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Kuyruk boş</div>
                )}
                {s?.queue?.map(q => (
                  <div key={q.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                    borderBottom: '1px solid #1e293b',
                    background: q.status === 'CALLED' ? '#1c1a00' : 'transparent',
                  }}>
                    {/* Sıra no */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: q.status === 'WAITING' ? '#1c1400' : '#0f172a',
                      color: STATUS_COLOR[q.status], fontWeight: 800, fontSize: 16, flexShrink: 0,
                    }}>
                      {q.queuePosition ?? '—'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700 }}>{q.name}</span>
                        <span style={{
                          fontSize: 11, padding: '1px 7px', borderRadius: 5, fontWeight: 600,
                          background: STATUS_COLOR[q.status] + '22', color: STATUS_COLOR[q.status],
                        }}>{STATUS_LABEL[q.status]}</span>
                        {q.stationName && <span style={{ fontSize: 11, color: '#64748b' }}>{q.stationName}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {q.shares} hisse · check-in: {timeAgo(q.checkinTime)} önce
                        {q.note && <> · <span style={{ color: '#94a3b8' }}>{q.note}</span></>}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{q.token}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ: Log */}
            <div>
              <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', fontWeight: 700, fontSize: 14 }}>
                  📜 Son İşlemler
                </div>
                {s?.recentLogs?.map((l, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #0f172a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{l.action}</span>
                      <span style={{ fontSize: 11, color: '#475569' }}>{timeAgo(l.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                      {l.kurbanName && <>{l.kurbanName} </>}
                      {l.stationName && <span style={{ color: '#64748b' }}>→ {l.stationName}</span>}
                    </div>
                    {l.note && <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{l.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── KAYIT SEKMESİ ────────────────────────────── */}
        {activeTab === 'register' && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Yeni Kurban Kaydı</div>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'name', label: 'Ad Soyad *', placeholder: 'Ahmet Yılmaz', type: 'text' },
                  { key: 'phone', label: 'Telefon *', placeholder: '0532 111 22 33', type: 'tel' },
                  { key: 'note', label: 'Not (opsiyonel)', placeholder: 'Mahalle, özel istek...', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={regForm[f.key]} onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Hisse Sayısı</label>
                  <select value={regForm.shares} onChange={e => setRegForm(p => ({ ...p, shares: parseInt(e.target.value) }))}
                    style={inputStyle}>
                    {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} hisse</option>)}
                  </select>
                </div>
                <button type="submit" disabled={regLoading} style={btnStyle('#1d4ed8', { width: '100%', padding: '12px', fontSize: 15, marginTop: 4 })}>
                  {regLoading ? 'Kaydediliyor...' : '💾 Kaydet & SMS Gönder'}
                </button>
              </form>

              {lastToken && (
                <div style={{ marginTop: 20, background: '#0f172a', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Müşteriye verilecek token</div>
                  <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 6, color: '#f59e0b' }}>{lastToken}</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>Check-in sırasında bu kod girilecek</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHECK-IN SEKMESİ ─────────────────────────── */}
        {activeTab === 'checkin' && (
          <div style={{ maxWidth: 440 }}>
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Müşteri Check-in</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                Müşteri fiziksel olarak geldiğinde tokenını gir. Sırası o an başlar.
              </div>
              <form onSubmit={handleCheckin} style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder="Token (ör. AB3X7K)"
                  value={checkinToken}
                  onChange={e => setCheckinToken(e.target.value.toUpperCase())}
                  style={{ ...inputStyle, flex: 1, letterSpacing: 3, fontSize: 18, fontWeight: 700, textAlign: 'center' }}
                />
                <button type="submit" style={btnStyle('#059669', { padding: '10px 20px' })}>✓ Giriş</button>
              </form>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 12 }}>
                ℹ️ Erken gelen = erken sıra. Sıralama tamamen check-in zamanına göre yapılır.
              </div>
            </div>
          </div>
        )}

        {/* ── MÜŞTERİ SORGULAMA SEKMESİ ───────────────── */}
        {activeTab === 'customer' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Müşteri Durumu Sorgula</div>
              <form onSubmit={handleQuery} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <input placeholder="Token gir..." value={queryToken}
                  onChange={e => setQueryToken(e.target.value.toUpperCase())}
                  style={{ ...inputStyle, flex: 1, letterSpacing: 3 }} />
                <button type="submit" style={btnStyle('#1d4ed8', { padding: '10px 20px' })}>Sorgula</button>
              </form>

              {customerStatus && (
                <div style={{ background: '#0f172a', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{customerStatus.name}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>{customerStatus.shares} hisse</div>
                  <div style={{
                    padding: '14px 18px', borderRadius: 10,
                    background: customerStatus.status === 'DONE' ? '#064e3b'
                      : customerStatus.status === 'CALLED' ? '#1e1b4b'
                      : customerStatus.status === 'CUTTING' ? '#450a0a' : '#1c1400',
                    color: customerStatus.status === 'DONE' ? '#34d399'
                      : customerStatus.status === 'CALLED' ? '#818cf8'
                      : customerStatus.status === 'CUTTING' ? '#fca5a5' : '#fbbf24',
                    fontWeight: 600, fontSize: 15,
                  }}>
                    {customerStatus.statusMessage}
                  </div>
                  {customerStatus.stationName && (
                    <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>Masa: {customerStatus.stationName}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LOG SEKMESİ ──────────────────────────────── */}
        {activeTab === 'log' && (
          <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #334155', fontWeight: 700 }}>
              Tüm İşlem Geçmişi
            </div>
            {s?.recentLogs?.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 20px', borderBottom: '1px solid #0f172a', fontSize: 13 }}>
                <span style={{ color: '#475569', minWidth: 60, fontFamily: 'monospace' }}>{new Date(l.createdAt).toLocaleTimeString('tr-TR')}</span>
                <span style={{ minWidth: 100, color: '#94a3b8', fontWeight: 600 }}>{l.action}</span>
                <span style={{ flex: 1 }}>{l.kurbanName || '—'}</span>
                <span style={{ color: '#64748b' }}>{l.stationName || ''}</span>
                <span style={{ color: '#475569' }}>{l.note}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Stil yardımcıları ──────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9',
  fontSize: 14, boxSizing: 'border-box', outline: 'none',
};

function btnStyle(bg, extra = {}) {
  return {
    padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: bg, color: '#fff', fontWeight: 600, fontSize: 13,
    transition: 'opacity .15s', ...extra,
  };
}
