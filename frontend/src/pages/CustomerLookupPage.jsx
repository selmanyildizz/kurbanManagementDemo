import { useState } from 'react';
import { api } from '../api/api';
import { useApp } from '../context/AppContext';

export default function CustomerLookupPage() {
  const { showToast } = useApp();
  const [queryToken, setQueryToken] = useState('');
  const [customerStatus, setCustomerStatus] = useState(null);

  async function handleQuery(e) {
    e.preventDefault();
    try {
      const r = await api.getStatus(queryToken.trim());
      setCustomerStatus(r);
    } catch (e) { showToast(e.message, 'error'); }
  }

  return (
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
  );
}
