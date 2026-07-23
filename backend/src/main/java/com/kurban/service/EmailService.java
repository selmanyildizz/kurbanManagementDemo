package com.kurban.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final HttpClient client = HttpClient.newHttpClient();

    @Value("${email.enabled:false}")
    private boolean enabled;

    @Value("${email.from:}")
    private String from;

    @Value("${email.brevo.api-key:}")
    private String apiKey;

    /** Bilgi taleplerinin düşeceği kutu; boşsa {@code email.from} kullanılır. */
    @Value("${email.contact-to:}")
    private String contactTo;

    @PostConstruct
    void checkConfig() {
        if (enabled && (from.isBlank() || apiKey.isBlank())) {
            log.warn("EMAIL_ENABLED=true ama EMAIL_FROM veya EMAIL_API_KEY ayarlanmamış. E-posta gönderimleri başarısız olacak.");
        }
    }

    /** Ateşle-unut gönderim: müşteri bildirimleri isteği bloklamamalı. */
    @Async
    public void send(String to, String subject, String body) {
        doSend(to, subject, body);
    }

    /**
     * Senkron gönderim; çağıran tarafın başarıyı bilmesi gerektiğinde
     * (ör. iletişim formu, kullanıcıya sonuç gösterilecek) kullanılır.
     */
    public boolean doSend(String to, String subject, String body) {
        return doSend(to, subject, body, null, null);
    }

    /**
     * @param senderName gelen kutusunda görünecek isim; {@code sender.email}
     *                   her zaman doğrulanmış {@code email.from} olmak zorunda
     *                   (Brevo doğrulanmamış adresten göndermeyi reddeder).
     * @param replyTo    "Yanıtla" dendiğinde gidilecek adres.
     */
    public boolean doSend(String to, String subject, String body, String senderName, String replyTo) {
        if (to == null || to.isBlank()) return false;
        if (!enabled) {
            log.info("✉️ Email [SIM] → {} (yanıt: {}) : {} — {}",
                    to, replyTo == null ? "-" : replyTo, subject, body);
            return true;
        }
        try {
            // Brevo'nun HTTPS API'si kullanılıyor (SMTP değil) — bazı PaaS
            // sağlayıcıları (Railway dahil) giden SMTP portlarını (25/465/587)
            // spam önleme amacıyla engelliyor; API HTTPS/443 üzerinden çalıştığı
            // için bu kısıtlamadan etkilenmez.
            StringBuilder sender = new StringBuilder("{\"email\":\"").append(jsonEscape(from)).append('"');
            if (senderName != null && !senderName.isBlank()) {
                sender.append(",\"name\":\"").append(jsonEscape(senderName)).append('"');
            }
            sender.append('}');

            String replyToPart = (replyTo == null || replyTo.isBlank()) ? ""
                    : String.format(",\"replyTo\":{\"email\":\"%s\"}", jsonEscape(replyTo));

            String jsonBody = String.format(
                "{\"sender\":%s,\"to\":[{\"email\":\"%s\"}]%s,\"subject\":\"%s\",\"textContent\":\"%s\"}",
                sender, jsonEscape(to), replyToPart, jsonEscape(subject), jsonEscape(body));

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                log.info("E-posta gönderildi: {}", to);
                return true;
            }
            log.error("E-posta gönderilemedi. Brevo durum kodu: {}", resp.statusCode());
            return false;
        } catch (Exception e) {
            log.error("E-posta gönderilemedi: {}", e.getMessage());
            return false;
        }
    }

    private String jsonEscape(String s) {
        StringBuilder sb = new StringBuilder(s.length() + 16);
        for (char c : s.toCharArray()) {
            switch (c) {
                case '\\' -> sb.append("\\\\");
                case '"'  -> sb.append("\\\"");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                default -> {
                    // Kalan kontrol karakterleri JSON'da düz geçemez.
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
                }
            }
        }
        return sb.toString();
    }

    public void sendRegistration(String email, String name, String token) {
        send(email, "Kurban Kaydınız Alındı",
            String.format("Sayın %s, kurban kaydınız alındı. Gün içinde geldiğinizde sıra kodunuzu (%s) büroda gösterin.", name, token));
    }

    public void sendCheckinConfirm(String email, String name, int position) {
        send(email, "Check-in Onaylandı", String.format("Sayın %s, check-in onaylandı. Sıranız: %d.", name, position));
    }

    public void sendCalled(String email, String name, String stationName) {
        send(email, "Sıranız Geldi", String.format("Sayın %s, SIRANIZ GELDİ! Lütfen %s'e gelin. 15 dk içinde gelmezseniz sıranız sona alınır.", name, stationName));
    }

    public void sendNoshow(String email, String name) {
        send(email, "Sıranız Sona Alındı", String.format("Sayın %s, 15 dakika içinde gelmediniz. Sıranız sona alındı.", name));
    }

    public void sendDone(String email, String name) {
        send(email, "Kurbanınız Hazır", String.format("Sayın %s, kurbanınız hazır! Teslim almaya gelebilirsiniz.", name));
    }

    public void sendBreakNotice(String email, String name) {
        send(email, "Mola Bildirimi", String.format("Sayın %s, kasabımız kısa mola veriyor. Sıranız korunuyor.", name));
    }

    /**
     * Landing sayfasındaki bilgi talebini işletmeye iletir. Mail, gelen
     * kutusunda ziyaretçinin adıyla görünür ve "Yanıtla" doğrudan ziyaretçiye
     * gider; gönderen adres ise doğrulanmış {@code email.from} kalmak zorunda.
     */
    public boolean sendContactRequest(String name, String phone, String email, String message) {
        String to = contactTo.isBlank() ? from : contactTo;
        if (to.isBlank()) {
            log.error("Bilgi talebi iletilemiyor: EMAIL_CONTACT_TO (veya EMAIL_FROM) ayarlanmamış.");
            return false;
        }
        String body = String.format("""
                Web sitesinden yeni bilgi talebi:

                Ad Soyad : %s
                Telefon  : %s
                E-posta  : %s

                Mesaj:
                %s
                """, name, phone, email, message);
        return doSend(to, "Bilgi Talebi — " + name, body, name, email);
    }
}
