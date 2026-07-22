import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function CheckinPage() {
  const { checkin, showToast } = useApp();
  const [checkinToken, setCheckinToken] = useState('');

  async function handleCheckin(e) {
    e.preventDefault();
    if (!checkinToken.trim()) { showToast('Token girin', 'error'); return; }
    try {
      await checkin(checkinToken.trim());
      setCheckinToken('');
    } catch (e) { showToast(e.message, 'error'); }
  }

  return (
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
  );
}
