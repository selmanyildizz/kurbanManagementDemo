# Kurban Sıra Yönetim Sistemi

## Mimari

```
[Büro PC / Tablet]          [Müşteri Telefonu]
       |                            |
  React Frontend               React CustomerPage
       |                            |
       └──────── Spring Boot API ───┘
                      |
                  PostgreSQL
```

## Sorun → Çözüm Tablosu

| Geçen yılın sorunu | Bu sistemdeki çözüm |
|---|---|
| Erken gelen bekliyor, geç gelen önce giriyor | Sıra = checkin zamanı. Başka kriter yok. |
| Tanıdık öne geçirme | Sıra değiştirme endpoint'i YOK. Her işlem loglanıyor. |
| Kasap yorulunca müşteri bilgilendirilmiyor | Mola butonu → SMS otomatik gider |
| "Deftere isim yaz" | Sistem kayıt oluyor, token veriliyor |
| Gelmeyenler sırayı tıkıyor | 15 dk → NOSHOW, sonraki çağrılıyor |
| Kasap kanlı elle tablette işlem yapıyor | Büro her şeyi yönetiyor, kasap dokunmuyor |

---

## Kurulum

### Backend (Spring Boot)

```bash
cd backend

# H2 ile direkt çalıştır (PostgreSQL gerekmez)
./mvnw spring-boot:run

# Uygulama: http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

**PostgreSQL'e geçmek için** `application.properties` içinde:
```properties
# H2 satırlarını yorum yap, PostgreSQL satırlarını aç
spring.datasource.url=jdbc:postgresql://localhost:5432/kurbandb
spring.datasource.username=postgres
spring.datasource.password=sifre
spring.jpa.hibernate.ddl-auto=update
spring.flyway.enabled=true
```

```bash
# Docker ile PostgreSQL
docker run -d \
  --name kurban-db \
  -e POSTGRES_DB=kurbandb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=sifre \
  -p 5432:5432 \
  postgres:16
```

### Frontend (React)

```bash
cd frontend
npm create vite@latest . -- --template react
# Mevcut src/ dosyalarını kopyala
npm install
npm run dev
# http://localhost:5173
```

---

## API Referansı

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/admin/dashboard` | Tüm dashboard verisi |
| POST | `/api/admin/kurban` | Yeni kayıt |
| POST | `/api/admin/checkin` | Check-in `{token}` |
| POST | `/api/admin/queue/call-next/{stationId}` | Sıradakini çağır |
| POST | `/api/admin/queue/{entryId}/start-cutting` | Kesim başladı |
| POST | `/api/admin/queue/{entryId}/complete` | Tamamlandı |
| POST | `/api/admin/station/{id}/break` | Mola aç/kapat |
| GET | `/api/status/{token}` | Müşteri durumu (public) |

---

## Günlük Akış

```
1. SATIŞ GÜNÜ (önceden)
   Büro → "Kayıt" sekmesi → isim/telefon gir → Token alınır → SMS gider

2. KURBAN BAYRAMINDA
   Müşteri gelir → "Check-in" sekmesi → Token girilir → Sıraya eklenir
   
   Büro kasabı izler → Masa boşaldı → "Sıradakini Çağır" → SMS gider
   
   Müşteri geldi → "Kes" butonu → Kesim başladı
   
   Kasap bitirdi → Büro "Bitti" → SMS gider → Teslim

3. KASAP YORULDU
   Büro → "Mola" butonu → Sıra dondurulur → Bekleyenlere SMS

4. MÜŞTERİ MERAK EDİYOR
   SMS'teki link → Telefonda kendi durumunu görüyor
```

---

## SMS Entegrasyonu (Netgsm)

```properties
# application.properties
sms.enabled=true
sms.netgsm.usercode=KULLANICI_KODUNUZ
sms.netgsm.password=SIFRE
sms.netgsm.msgheader=FIRMAADI
```

Netgsm başvuru: https://www.netgsm.com.tr

---

## Notlar

- **Sıra değiştirme endpoint'i kasıtlı olarak yoktur.** Manipülasyon önlemi.
- Tüm işlemler `audit_log` tablosuna yazılır. Sorgulama için Log sekmesi.
- No-show kontrolü 60 saniyede bir çalışır (Scheduled task).
- Frontend 5 saniyede bir dashboard'u yeniler (polling). WebSocket eklenebilir.
