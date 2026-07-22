# Kurban Sıra Sistemi

Multi-user kurban kesim işletme yönetim sistemi. JWT auth, real-time kuyruk, audit logging, SMS bildirimleri.

## 🚀 Başlı Başına Özellikler

✅ **Güvenlik**
- Spring Security + JWT (HS256, bearer token)
- Multi-user auth (admin/müşteri yöneticileri)
- Actor audit trail (tüm işlemler kişi bazlı loglanır)
- DONE kaydı tekrar check-in engeli
- Token gizleme UI'da (büyük puntoda ekranda açık değil)

✅ **Operasyon**
- Real-time kuyruk (sıra, check-in, çağrı, kesim, tamamlama)
- 2 kesim masası (Masa 1, Masa 2)
- Hisse sayısı (1-7)
- Mola yönetimi per masa
- NOSHOW otomatikleştirme (15dk timeout, SMS bildirim)

✅ **Müşteri**
- QR linki: `/durum/:token` → public status page
- Token SMS ile gönderiliyor (Netgsm)
- Check-in sırasında sıra no bildiriliyor

✅ **Deployment**
- Backend: Railway (Docker, `backend/Dockerfile`, Maven→JRE) + Railway Managed PostgreSQL
- Frontend: Netlify (Vite build, statik hosting)
- Docker Compose ile local geliştirme (PostgreSQL 16, backend, Caddy reverse proxy)
- Flyway migrations (schema, staff user)
- Env-based config (.env / platform environment variables)

✅ **Frontend**
- React 18 + Vite
- Sakin Klinik tasarımı (yumuşak yeşil-beyaz, responsive)
- Responsive (mobil/tablet/desktop kırılımları)

---

## 🔧 Hızlı Başlangıç (Local Docker)

### 1. Ortam Hazırlığı

```bash
cd kurban-sistemi-v4
cp .env.example .env
```

`.env` dosyasında:

```bash
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123!
POSTGRES_DB=kurbandb

JWT_SECRET=your-random-secure-base64-32chars

ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=admin123456

SMS_ENABLED=false
CORS_ALLOWED_ORIGINS=http://localhost
DOMAIN=localhost
```

### 2. Docker Compose ile Başlat

```bash
docker compose up -d
```

Servisler:
- PostgreSQL 16 → :5432
- Backend (Spring Boot) → :8080
- Frontend (Caddy) → :80, :443

### 3. Login

**URL:** http://localhost/

**Bilgiler:**
```
Kullanıcı Adı: admin
Şifre: admin123456
```

---

## ☁️ Canlı Deployment (Railway + Netlify)

Sistem şu an **Railway** (backend + PostgreSQL) ve **Netlify** (frontend) üzerinde canlı olarak çalışıyor.

### Backend — Railway

1. Railway'de yeni proje → **GitHub repo bağla** (bu repo)
2. Servis **Settings → Source → Root Directory** → `backend` olarak ayarla (Railway `backend/Dockerfile`'ı build eder, kök dizindeki `docker-compose.yml`'i görmez)
3. **+ New → Database → Add PostgreSQL** ile ayrı bir managed Postgres servisi ekle
4. Backend servisinin **Variables** sekmesine ekle (Postgres servisinin adı neyse `${{ServisAdi.PGHOST}}` şeklinde referans ver):
   ```
   DB_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   JWT_SECRET=<güçlü rastgele base64 secret>
   ADMIN_BOOTSTRAP_USERNAME=admin
   ADMIN_BOOTSTRAP_PASSWORD=<güçlü şifre — ilk kurulumdan sonra değiştirilmeli>
   SMS_ENABLED=false
   CORS_ALLOWED_ORIGINS=https://<netlify-domain>
   ```
5. **Settings → Networking → Generate Domain** ile backend'in public URL'ini al (ör. `https://xxx.up.railway.app`)

### Frontend — Netlify

1. Netlify → **Add new site → Import from GitHub** → bu repo
2. Build ayarları:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. **Environment variables:**
   ```
   VITE_API_BASE=https://<railway-backend-domain>/api
   ```
4. Deploy sonrası aldığın Netlify URL'ini Railway backend'in `CORS_ALLOWED_ORIGINS` değişkenine ekle, backend'i redeploy et.

### Yeni Admin Kullanıcısı Ekleme (canlıda)

`ADMIN_BOOTSTRAP_*` yalnızca veritabanı boşken **ilk açılışta bir kere** çalışır — sonradan env var değiştirmek mevcut kullanıcıyı güncellemez. Yeni kullanıcı eklemek için mevcut bir admin ile login olup token al, sonra:

```bash
curl -X POST https://<railway-backend-domain>/api/admin/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"yeni_kullanici","password":"guclu_sifre","displayName":"Ad Soyad"}'
```

---

## 📱 SMS - Netgsm

### 1. Hesap Oluştur
https://www.netgsm.com.tr

### 2. .env Güncelle
```bash
SMS_ENABLED=true
SMS_USERNAME=your_username
SMS_PASSWORD=your_password
```

### 3. Test Et
```bash
docker compose logs backend -f
# Kayıt yap → SMS gönderilmeli
```

---

## 🔑 Admin Yönetimi (local Docker)

**Yeni admin ekle:**
```bash
curl -X POST http://localhost/api/admin/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ali",
    "password": "ali123456",
    "displayName": "Ali Yılmaz"
  }'
```

> Not: Şifre değiştirme veya "kullanıcı sil" endpoint'i henüz yok. Şifre yenilemek için yukarıdaki gibi yeni bir kullanıcı oluşturup eski hesabı kullanmayı bırakmak en güvenli yol — `staff_user` tablosuna doğrudan SQL ile şifre yazmak BCrypt hash'i bozar, yapılmamalı.

---

## 🐛 Troubleshooting

| Sorun | Çözüm |
|-------|-------|
| Port in use | `docker compose down && docker compose up -d` |
| DB bağlantısı başarısız | `docker compose logs db` |
| 401 Unauthorized | Token geçerli mi? Süresi dolmuş mu? |
| SMS gönderilmiyor | Netgsm kredisi var mı? Telefon geçerli mi? |

---

**Version:** 1.0 (Production-ready)  
**Updated:** 2026-07-22
