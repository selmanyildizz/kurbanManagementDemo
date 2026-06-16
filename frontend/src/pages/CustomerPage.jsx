/**
 * CustomerPage.jsx
 * 
 * Müşteri QR linki → http://localhost:5173/durum/AB3X7K
 * React Router ile: <Route path="/durum/:token" element={<CustomerPage />} />
 * 
 * Bu sayfa backend'e 10sn'de bir polling yapar.
 */
import { useState, useEffect } from 'react';
import { api } from '../api/api';

const STATUS_CONFIG = {
  null: { icon: '📋', color: '#f59e0b', bg: '#451a03', msg: '' },
  WAITING: { icon: '⏳', color: '#f59e0b', bg: '#1c1400' },
  CALLED: { icon: '🔔', color: '#818cf8', bg: '#1e1b4b' },
  CUTTING: { icon: '🔪', color: '#fca5a5', bg: '#450a0a' },
  DONE: { icon: '✅', color: '#34d399', bg: '#064e3b' },
  NOSHOW: { icon: '⏰', color: '#6b7280', bg: '#1e293b' },
};

export default function CustomerPage({ token }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const r = await api.getStatus(token);
      setStatus(r);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const cfg = STATUS_CONFIG[status?.status] ?? STATUS_CONFIG[null];

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', color: '#f1f5f9',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 36 }}>🐑</span>
        <div style={{ fontWeight: 800, fontSize: 22, marginTop: 8 }}>Kurban Takip</div>
      </div>

      {error && (
        <div style={{ background: '#450a0a', color: '#fca5a5', padding: 16, borderRadius: 12, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {status && !error && (
        <div style={{ width: '100%', maxWidth: 380, background: '#1e293b', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ background: cfg.bg, padding: 24, textAlign: 'center', borderBottom: '1px solid #334155' }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>{cfg.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: cfg.color }}>{status.statusMessage}</div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['İsim', status.name],
                ['Hisse', status.shares + ' hisse'],
                status.queuePosition && ['Sıra No', status.queuePosition + '. sıra'],
                status.stationName && ['Masa', status.stationName],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} style={{ background: '#0f172a', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 700 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '0 20px 16px', fontSize: 12, color: '#475569', textAlign: 'center' }}>
            Otomatik yenileniyor...
          </div>
        </div>
      )}
    </div>
  );
}
