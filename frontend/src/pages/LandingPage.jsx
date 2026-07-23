import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/api';
import {
  ListOrdered, ShieldCheck, Radio, MailCheck, LayoutGrid, ScrollText,
  MonitorSmartphone, ClipboardList, CheckCircle2, Smartphone, BellRing,
  ArrowRight, Search, AtSign, Check, Send,
} from 'lucide-react';

const HERO_IMG = 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=1100&q=80';
const CTA_IMG = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=80';

// Bilgi/fiyat taleplerinin düşeceği adres.
const CONTACT_EMAIL = 'selmanyildiz555@gmail.com';

// TODO: Fiyatlar örnek değerlerdir — işletmenin güncel fiyat listesiyle değiştirin.
const PLANS = [
  {
    name: 'Küçükbaş',
    price: '8.500',
    unit: '/ adet',
    desc: 'Koyun veya keçi, tam kurban.',
    items: ['Kesim ve yüzme', 'Parçalama', 'Sıra takip kodu', 'E-posta bildirimi'],
    featured: false,
  },
  {
    name: 'Büyükbaş Hisse',
    price: '3.900',
    unit: '/ hisse',
    desc: 'Yedi hisseli büyükbaşta tek hisse.',
    items: ['Kesim ve yüzme', 'Hisse ayrımı ve tartım', 'Parçalama', 'Sıra takip kodu', 'E-posta bildirimi'],
    featured: true,
  },
  {
    name: 'Büyükbaş Tam',
    price: '26.000',
    unit: '/ adet',
    desc: 'Tüm hisseler tek kişiye ait.',
    items: ['Kesim ve yüzme', 'Parçalama', 'Öncelikli sıra', 'Sıra takip kodu', 'E-posta bildirimi'],
    featured: false,
  },
];

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

const EMPTY_CONTACT = { name: '', phone: '', email: '', message: '' };

export default function LandingPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [contactError, setContactError] = useState(null);

  function handleTrack(e) {
    e.preventDefault();
    const t = token.trim().toUpperCase();
    if (t) navigate(`/durum/${t}`);
  }

  async function handleContact(e) {
    e.preventDefault();
    setContactError(null);
    setSending(true);
    try {
      await api.sendContact({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim(),
        message: contact.message.trim(),
      });
      setContact(EMPTY_CONTACT);
      setSent(true);
    } catch (err) {
      setContactError(err.message);
    } finally {
      setSending(false);
    }
  }

  // Fiyat kartındaki "Bilgi Al" formu doldurulmuş olarak açar.
  function askAbout(planName) {
    setSent(false);
    setContactError(null);
    setContact(p => ({
      ...p,
      message: `"${planName}" hizmeti hakkında bilgi almak istiyorum.`,
    }));
    document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' });
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
          <a href="#fiyatlar">Fiyatlar</a>
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

      <section className="pricing-section" id="fiyatlar">
        <div className="section-head">
          <span className="eyebrow">Fiyatlar</span>
          <h2>Hizmet ve fiyat listesi</h2>
        </div>
        <div className="pricing-grid">
          {PLANS.map(plan => (
            <div key={plan.name} className={`plan-card${plan.featured ? ' featured' : ''}`}>
              {plan.featured && <div className="plan-badge">En çok tercih edilen</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <span className="amount tabular">₺{plan.price}</span>
                <span className="unit">{plan.unit}</span>
              </div>
              <div className="plan-desc">{plan.desc}</div>
              <ul className="plan-items">
                {plan.items.map(item => (
                  <li key={item}><Check size={15} aria-hidden="true" /> {item}</li>
                ))}
              </ul>
              <button type="button" onClick={() => askAbout(plan.name)}
                className={`btn btn-block${plan.featured ? '' : ' btn-ghost'}`}>
                Bilgi Al <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <p className="pricing-note">
          Fiyatlara kesim, yüzme ve parçalama dahildir. Güncel fiyatlar ve
          toplu kayıtlar için bizimle iletişime geçin.
        </p>
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

      <section className="contact-section" id="iletisim">
        <div className="contact-card">
          <div className="contact-left">
            <span className="eyebrow">Bilgi Al</span>
            <h2>Sorunuz mu var?</h2>
            <p>
              Fiyatlar, hisse durumu veya kesim günü hakkında bilgi almak için
              formu doldurun. Talebiniz bize ulaşır, gün içerisinde telefon
              veya e-posta ile size döneriz.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="footer-link contact-direct">
              <AtSign size={15} aria-hidden="true" /> {CONTACT_EMAIL}
            </a>
          </div>

          {sent ? (
            <div className="contact-success">
              <div className="contact-success-icon" aria-hidden="true"><CheckCircle2 size={28} /></div>
              <b>Talebiniz alındı</b>
              <p>Gün içerisinde size döneceğiz. Teşekkür ederiz.</p>
              <button type="button" className="btn btn-ghost" onClick={() => setSent(false)}>
                Yeni talep gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleContact} className="form contact-form">
              <div className="field">
                <label htmlFor="ct-name">Ad Soyad</label>
                <input id="ct-name" className="input" required maxLength={120}
                  value={contact.name}
                  onChange={e => setContact(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="ct-phone">Telefon</label>
                <input id="ct-phone" className="input" type="tel" required maxLength={30}
                  placeholder="0532 111 22 33" value={contact.phone}
                  onChange={e => setContact(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="ct-email">E-posta</label>
                <input id="ct-email" className="input" type="email" required maxLength={180}
                  placeholder="ornek@mail.com" value={contact.email}
                  onChange={e => setContact(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="ct-msg">Mesajınız</label>
                <textarea id="ct-msg" className="input" rows={4} required maxLength={2000}
                  placeholder="Hangi hizmet hakkında bilgi almak istiyorsunuz?"
                  value={contact.message}
                  onChange={e => setContact(p => ({ ...p, message: e.target.value }))} />
              </div>
              {contactError && <div className="login-error">{contactError}</div>}
              <button type="submit" disabled={sending} className="btn btn-block">
                <Send size={15} aria-hidden="true" /> {sending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="landing-footer">
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
            <a href={`mailto:${CONTACT_EMAIL}`} className="footer-link">
              <AtSign size={15} aria-hidden="true" /> {CONTACT_EMAIL}
            </a>
          </div>

          <div className="footer-col">
            <h3>Bağlantılar</h3>
            <a href="#ozellikler" className="footer-link">Özellikler</a>
            <a href="#fiyatlar" className="footer-link">Fiyatlar</a>
            <a href="#nasil-calisir" className="footer-link">Nasıl Çalışır</a>
            <a href="#iletisim" className="footer-link">Bilgi Al</a>
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
