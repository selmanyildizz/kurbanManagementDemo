/**
 * CustomerPage.jsx
 *
 * Müşteri QR linki → /durum/AB3X7K
 * Backend'e 10sn'de bir polling yapar.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/api';

const STATUS_ICON = {
  WAITING: '⏳',
  CALLED: '🔔',
  CUTTING: '🔪',
  DONE: '✅',
  NOSHOW: '⏰',
};

export default function CustomerPage() {
  const { token } = useParams();
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

  const statusKey = status?.status || 'none';

  return (
    <div className="customer-wrap">
      <div className="customer-brand">
        <span className="emoji" aria-hidden="true">🐑</span>
        <h1>Kurban Takip</h1>
      </div>

      {error && <div className="customer-error">{error}</div>}

      {status && !error && (
        <div className="customer-card">
          <div className={`customer-hero ${statusKey}`}>
            <div className="icon" aria-hidden="true">{STATUS_ICON[status.status] ?? '📋'}</div>
            <div className="msg">{status.statusMessage}</div>
          </div>
          <div className="customer-grid">
            {[
              ['İsim', status.name],
              ['Hisse', status.shares + ' hisse'],
              status.queuePosition && ['Sıra No', status.queuePosition + '. sıra'],
              status.stationName && ['Masa', status.stationName],
            ].filter(Boolean).map(([label, val]) => (
              <div key={label} className="customer-cell">
                <div className="lbl">{label}</div>
                <div className="val tabular">{val}</div>
              </div>
            ))}
          </div>
          <div className="customer-foot">Otomatik yenileniyor...</div>
        </div>
      )}
    </div>
  );
}
