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

    @PostConstruct
    void checkConfig() {
        if (enabled && (from.isBlank() || apiKey.isBlank())) {
            log.warn("EMAIL_ENABLED=true ama EMAIL_FROM veya EMAIL_API_KEY ayarlanmamış. E-posta gönderimleri başarısız olacak.");
        }
    }

    @Async
    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;
        if (!enabled) {
            log.info("✉️ Email [SIM] → {} : {} — {}", to, subject, body);
            return;
        }
        try {
            // Brevo'nun HTTPS API'si kullanılıyor (SMTP değil) — bazı PaaS
            // sağlayıcıları (Railway dahil) giden SMTP portlarını (25/465/587)
            // spam önleme amacıyla engelliyor; API HTTPS/443 üzerinden çalıştığı
            // için bu kısıtlamadan etkilenmez.
            String jsonBody = String.format(
                "{\"sender\":{\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"%s\",\"textContent\":\"%s\"}",
                jsonEscape(from), jsonEscape(to), jsonEscape(subject), jsonEscape(body));

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
            } else {
                log.error("E-posta gönderilemedi. Brevo durum kodu: {}", resp.statusCode());
            }
        } catch (Exception e) {
            log.error("E-posta gönderilemedi: {}", e.getMessage());
        }
    }

    private String jsonEscape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
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
}
