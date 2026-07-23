import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ListOrdered, ShieldCheck, Radio, MailCheck, LayoutGrid, ScrollText,
  MonitorSmartphone, ClipboardList, CheckCircle2, Smartphone, BellRing,
  ArrowRight, Search, AtSign,
} from 'lucide-react';

const HERO_IMG = 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=1100&q=80';
const CTA_IMG = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=80';

const CHIPS = [
  { Icon: ShieldCheck, text: 'Güvenli token sistemi' },
  { Icon: Radio, text: 'Gerçek zamanlı takip' },
  { Icon: MailCheck, text: 'Anlık bildirim' },
];

const FEATURES = [
  {
    Icon: Radio,
    title: 'Canlı Sıra Takibi',
    text: 'Müşteriniz kendi linkinden sırasının nerede olduğunu saniyesinde görür, büroyu aramasına gerek kalmaz.',
  },
  {
    Icon: ShieldCheck,
    title: 'Maskeli Token Güvenliği',
    text: 'Kuyruk ekranında kodlar maskeli gösterilir; kimse başkasının sırasını çalamaz.',
  },
  {
    Icon: LayoutGrid,
    title: 'Çoklu Masa Yönetimi',
    text: 'Birden fazla kesim masasını aynı anda yönetin, mola ve aktiflik durumunu tek ekrandan kontrol edin.',
  },
  {
    Icon: MailCheck,
    title: 'Otomatik Bildirim',
    text: 'Check-in, çağrı ve teslimat anında müşteriye otomatik e-posta gönderilir.',
  },
  {
    Icon: ScrollText,
    title: 'Şeffaf İşlem Kaydı',
    text: 'Her adım kim tarafından, ne zaman yapıldıysa kayıt altına alınır; hesap verilebilirlik tam.',
  },
  {
    Icon: MonitorSmartphone,
    title: 'Her Cihazda Çalışır',
    text: 'Büro panelinden mobil müşteri sayfasına kadar tüm ekranlar responsive tasarlandı.',
  },
];

const STEPS = [
  {
    Icon: ClipboardList,
    title: 'Kayıt',
    text: 'Büroya geldiğinizde kaydınız alınır. Size özel bir takip kodu oluşturulur ve e-postanıza gönderilir.',
  },
  {
    Icon: CheckCircle2,
    title: 'Check-in',
    text: 'Kesim günü geldiğinizde takip kodunuzu görevliye gösterin, sıraya bu anda girersiniz.',
  },
  {
    Icon: Smartphone,
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
          <span className="brand-mark" aria-hidden="true"><ListOrdered size={18} /></span>
          <div className="brand-name">Kurban Sıra Sistemi</div>
        </div>
        <nav className="landing-nav-links">
          <a href="#ozellikler">Özellikler</a>
          <a href="#nasil-calisir">Nasıl Çalışır</a>
          <a href="#iletisim">İletişim</a>
        </nav>
        <Link to="/giris" className="btn btn-ghost">Personel Girişi</Link>
      </header>

      <section className="hero">
        <div className="hero-left">
          <span className="eyebrow">Kurban Bayramı Çözümü</span>
          <h1>Kurban kesim sıranızı <span className="accent-text">canlı</span> takip edin</h1>
          <p className="landing-sub">
            Kayıttan teslimat anına kadar sıranızın her adımını, elinizdeki takip
            koduyla anlık olarak izleyin. Bekleme salonunda durmanıza gerek yok.
          </p>

          <form onSubmit={handleTrack} className="landing-track">
            <div className="input-icon">
              <Search size={16} aria-hidden="true" />
              <input
                className="input"
                placeholder="Takip kodunuz (ör. AB3X7K)"
                value={token}
                onChange={e => setToken(e.target.value.toUpperCase())}
                aria-label="Takip kodu"
              />
            </div>
            <button type="submit" className="btn">
              Sıramı Görüntüle <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>

          <div className="hero-chips">
            {CHIPS.map(({ Icon, text }) => (
              <div key={text} className="chip"><Icon size={14} aria-hidden="true" /> {text}</div>
            ))}
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-photo">
            <img src={HERO_IMG} alt="Otlakta koyun sürüsü" loading="eager" />
          </div>

          <div className="mockup-card mockup-main" aria-hidden="true">
            <div className="mockup-chrome"><span /><span /><span /></div>
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

          <div className="mockup-card mockup-status" aria-hidden="true">
            <div className="mockup-status-icon"><BellRing size={18} /></div>
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
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon" aria-hidden="true"><Icon size={20} /></div>
              <div className="feature-title">{title}</div>
              <div className="feature-text">{text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-banner" style={{ backgroundImage: `url(${CTA_IMG})` }}>
        <div className="cta-inner">
          <h2>Kurban kesim sürecinizi bugün dijitalleştirin</h2>
          <p>Kayıt, check-in ve teslimatı tek panelden yönetin.</p>
          <Link to="/giris" className="btn btn-invert">
            Personel Girişi <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="landing-steps" id="nasil-calisir">
        <div className="section-head">
          <span className="eyebrow">Nasıl Çalışır</span>
          <h2>Üç adımda sıra takibi</h2>
        </div>
        <div className="steps-row">
          {STEPS.map(({ Icon, title, text }, i) => (
            <div key={title} className="step-card">
              <div className="step-num">{i + 1}</div>
              <div className="step-icon" aria-hidden="true"><Icon size={24} /></div>
              <div className="step-title">{title}</div>
              <div className="step-text">{text}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer" id="iletisim">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true"><ListOrdered size={18} /></span>
              <div className="brand-name">Kurban Sıra Sistemi</div>
            </div>
            <p>
              Kurban kesim işletmeleri için sıra, kayıt ve bildirim yönetimi.
              Takip kodunuzu kaybettiyseniz bizimle iletişime geçin.
            </p>
          </div>

          <div className="footer-col">
            <h3>Bizimle İletişim</h3>
            <a href="mailto:selmanyildiz555@gmail.com" className="footer-link">
              <AtSign size={15} aria-hidden="true" /> selmanyildiz555@gmail.com
            </a>
          </div>

          <div className="footer-col">
            <h3>Bağlantılar</h3>
            <a href="#ozellikler" className="footer-link">Özellikler</a>
            <a href="#nasil-calisir" className="footer-link">Nasıl Çalışır</a>
            <Link to="/giris" className="footer-link">Personel Girişi</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Kurban Sıra Sistemi</span>
          <span>Tasarım &amp; geliştirme: <strong>Selman Yıldız</strong></span>
        </div>
      </footer>
    </div>
  );
}
