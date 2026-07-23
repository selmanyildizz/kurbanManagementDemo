import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const STEPS = [
  {
    icon: '📝',
    title: '1. Kayıt',
    text: 'Büroya geldiğinizde kaydınız alınır. Size özel bir takip kodu oluşturulur ve telefon/e-postanıza gönderilir.',
  },
  {
    icon: '✅',
    title: '2. Check-in',
    text: 'Kesim günü geldiğinizde takip kodunuzu görevliye gösterin, sıraya bu anda girersiniz.',
  },
  {
    icon: '📱',
    title: '3. Canlı Takip',
    text: 'Size gönderilen linkten sıranızı anlık izleyin. Sıranız geldiğinde ve kesim tamamlandığında bilgilendirilirsiniz.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');

  function handleTrack(e) {
    e.preventDefault();
    const t = token.trim().toUpperCase();
    if (t) navigate(`/durum/${t}`);
  }

  return (
    <div className="landing">
      <header className="landing-top">
        <div className="brand">
          <span className="emoji" aria-hidden="true">🐑</span>
          <div className="brand-name">Kurban Sıra Sistemi</div>
        </div>
        <Link to="/giris" className="btn btn-ghost">Personel Girişi</Link>
      </header>

      <section className="landing-hero">
        <h1>Kurban kesim sürecinizi<br />baştan sona takip edin</h1>
        <p className="landing-sub">
          Kayıttan teslimat anına kadar sıranızın her adımını, elinizdeki takip
          koduyla anlık olarak izleyin. Bekleme salonunda durmanıza gerek yok.
        </p>

        <form onSubmit={handleTrack} className="landing-track">
          <input
            className="input"
            placeholder="Takip kodunuz (ör. AB3X7K)"
            value={token}
            onChange={e => setToken(e.target.value.toUpperCase())}
            aria-label="Takip kodu"
          />
          <button type="submit" className="btn">Sıramı Görüntüle</button>
        </form>
      </section>

      <section className="landing-steps">
        {STEPS.map(s => (
          <div key={s.title} className="step-card">
            <div className="step-icon" aria-hidden="true">{s.icon}</div>
            <div className="step-title">{s.title}</div>
            <div className="step-text">{s.text}</div>
          </div>
        ))}
      </section>

      <footer className="landing-footer">
        Takip kodunuzu kaybettiyseniz büromuzla iletişime geçin.
      </footer>
    </div>
  );
}
