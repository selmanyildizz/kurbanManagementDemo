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
- Docker multi-stage (backend: Maven→JRE, frontend: Node→Caddy)
- Docker Compose: PostgreSQL 16, backend, Caddy reverse proxy
- Flyway migrations (schema, staff user)
- Env-based config (.env)
- Caddy auto HTTPS + SPA routing

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

## 🌐 VPS Deployment

### Gereksinimler

- Ubuntu 22.04+
- Docker + Docker Compose
- 2+ GB RAM, 20+ GB disk

### Adımlar

```bash
ssh user@vps_ip
git clone https://github.com/your-org/kurban-sistemi-v4.git
cd kurban-sistemi-v4

cp .env.example .env
# DOMAIN, DB_PASSWORD, JWT_SECRET, SMS bilgilerini düzelt
nano .env

docker compose up -d
```

Caddy otomatik HTTPS sağlar (Let's Encrypt).

---

## ☁️ Frontend - Vercel

```bash
cd frontend
vercel deploy
```

Vercel dashboard → Environment Variables:
```
VITE_API_BASE=https://api.your-domain.com
```

VPS .env:
```bash
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
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

## 🔑 Admin Yönetimi

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

**Şifre değiştir (SQL):**
```bash
docker compose exec db psql -U postgres kurbandb
UPDATE staff_user SET password_hash = crypt('new_password', gen_salt('bf'))
WHERE username = 'admin';
```

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
