import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CHIPS = [
  { icon: '🔒', text: 'Güvenli token sistemi' },
  { icon: '📡', text: 'Gerçek zamanlı takip' },
  { icon: '✉️', text: 'Anlık bildirim' },
];

const FEATURES = [
  {
    icon: '📡',
    title: 'Canlı Sıra Takibi',
    text: 'Müşteriniz kendi linkinden sırasının nerede olduğunu saniyesinde görür, büroyu aramasına gerek kalmaz.',
  },
  {
    icon: '🔐',
    title: 'Maskeli Token Güvenliği',
    text: 'Kuyruk ekranında kodlar maskeli gösterilir; kimse başkasının sırasını çalamaz.',
  },
  {
    icon: '🥩',
    title: 'Çoklu Masa Yönetimi',
    text: 'Birden fazla kesim masasını aynı anda yönetin, mola ve aktiflik durumunu tek ekrandan kontrol edin.',
  },
  {
    icon: '✉️',
    title: 'Otomatik Bildirim',
    text: 'Check-in, çağrı ve teslimat anında müşteriye otomatik e-posta gönderilir.',
  },
  {
    icon: '🧾',
    title: 'Şeffaf İşlem Kaydı',
    text: 'Her adım kim tarafından, ne zaman yapıldıysa kayıt altına alınır; hesap verilebilirlik tam.',
  },
  {
    icon: '📱',
    title: 'Her Cihazda Çalışır',
    text: 'Büro panelinden mobil müşteri sayfasına kadar tüm ekranlar responsive tasarlandı.',
  },
];

const STEPS = [
  {
    icon: '📝',
    title: 'Kayıt',
    text: 'Büroya geldiğinizde kaydınız alınır. Size özel bir takip kodu oluşturulur ve telefon/e-postanıza gönderilir.',
  },
  {
    icon: '✅',
    title: 'Check-in',
    text: 'Kesim günü geldiğinizde takip kodunuzu görevliye gösterin, sıraya bu anda girersiniz.',
  },
  {
    icon: '📱',
    title: 'Canlı Takip',
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
      <header className="landing-nav">
        <div className="brand">
          <span className="emoji" aria-hidden="true">🐑</span>
          <div className="brand-name">Kurban Sıra Sistemi</div>
        </div>
        <nav className="landing-nav-links">
          <a href="#ozellikler">Özellikler</a>
          <a href="#nasil-calisir">Nasıl Çalışır</a>
        </nav>
        <Link to="/giris" className="btn btn-ghost">Personel Girişi</Link>
      </header>

      <section className="hero">
        <div className="hero-left">
          <span className="eyebrow">🐑 Kurban Bayramı Çözümü</span>
          <h1>Kurban kesim sıranızı <span className="accent-text">canlı</span> takip edin</h1>
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

          <div className="hero-chips">
            {CHIPS.map(c => (
              <div key={c.text} className="chip"><span aria-hidden="true">{c.icon}</span> {c.text}</div>
            ))}
          </div>
        </div>

        <div className="hero-right" aria-hidden="true">
          <div className="blob" />

          <div className="mockup-card mockup-main">
            <div className="mockup-chrome">
              <span /><span /><span />
            </div>
            <div className="mockup-body">
              <div className="mockup-stations">
                <div className="mockup-station">
                  <b>Masa 1</b>
                  <span className="pill pill-active">Aktif</span>
                </div>
                <div className="mockup-station">
                  <b>Masa 2</b>
                  <span className="pill pill-break">Molada</span>
                </div>
              </div>
              <div className="mockup-rows">
                <div className="mockup-row">
                  <span className="mockup-pos">1</span>
                  <span className="mockup-name">Ahmet Y.</span>
                  <span className="pill pill-called">Çağrıldı</span>
                </div>
                <div className="mockup-row">
                  <span className="mockup-pos">2</span>
                  <span className="mockup-name">Mehmet K.</span>
                  <span className="pill pill-waiting">Bekliyor</span>
                </div>
                <div className="mockup-row">
                  <span className="mockup-pos">3</span>
                  <span className="mockup-name">Zeynep A.</span>
                  <span className="pill pill-waiting">Bekliyor</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mockup-card mockup-status">
            <div className="mockup-status-icon">🔔</div>
            <div className="mockup-status-text">
              <b>Sıranız geldi!</b>
              <span>Masa 1'e gelin</span>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section" id="ozellikler">
        <div className="section-head">
          <span className="eyebrow">Özellikler</span>
          <h2>Büro için hızlı, müşteri için şeffaf</h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" aria-hidden="true">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-text">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h2>Kurban kesim sürecinizi bugün dijitalleştirin</h2>
        <p>Kayıt, check-in ve teslimatı tek panelden yönetin.</p>
        <Link to="/giris" className="btn btn-invert">Personel Girişi</Link>
      </section>

      <section className="landing-steps" id="nasil-calisir">
        <div className="section-head">
          <span className="eyebrow">Nasıl Çalışır</span>
          <h2>Üç adımda sıra takibi</h2>
        </div>
        <div className="steps-row">
          {STEPS.map((s, i) => (
            <div key={s.title} className="step-card">
              <div className="step-num">{i + 1}</div>
              <div className="step-icon" aria-hidden="true">{s.icon}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-text">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        Takip kodunuzu kaybettiyseniz büromuzla iletişime geçin.
      </footer>
    </div>
  );
}
