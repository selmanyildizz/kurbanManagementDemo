package com.kurban.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.nio.charset.StandardCharsets;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    @Value("${sms.enabled:false}")
    private boolean enabled;

    @Value("${sms.netgsm.usercode:}")
    private String usercode;

    @Value("${sms.netgsm.password:}")
    private String password;

    @Value("${sms.netgsm.msgheader:KURBAN}")
    private String msgheader;

    @PostConstruct
    void checkConfig() {
        if (enabled && (usercode.isBlank() || password.isBlank())) {
            log.warn("SMS_ENABLED=true ama Netgsm kimlik bilgileri (usercode/password) eksik. " +
                    "SMS gönderimleri başarısız olacak.");
        }
    }

    public void send(String phone, String message) {
        if (!enabled) {
            log.info("📱 SMS [SIM] → {} : {}", phone, message);
            return;
        }
        try {
            // Netgsm REST v2: kimlik bilgileri Basic Auth header'ında gider, URL/query
            // string'de görünmez ve loglanmaz. Gövde/response body asla loglanmaz —
            // sadece HTTP durum kodu (kimlik bilgisi veya kişisel veri sızıntısını önlemek için).
            String auth = Base64.getEncoder().encodeToString(
                    (usercode + ":" + password).getBytes(StandardCharsets.UTF_8));
            String body = String.format(
                "{\"msgheader\":\"%s\",\"messages\":[{\"msg\":\"%s\",\"no\":\"%s\"}]}",
                jsonEscape(msgheader),
                jsonEscape(message),
                phone.replaceAll("[^0-9]", ""));

            var client = java.net.http.HttpClient.newHttpClient();
            var req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.netgsm.com.tr/sms/rest/v2/send"))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(body))
                    .build();
            var resp = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
            log.info("Netgsm SMS gönderim durumu: {}", resp.statusCode());
        } catch (Exception e) {
            log.error("SMS gönderilemedi: {}", e.getMessage());
        }
    }

    private String jsonEscape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public void sendCheckinConfirm(String phone, String name, int position) {
        send(phone, String.format("Sayın %s, check-in onaylandı. Sıranız: %d.", name, position));
    }

    public void sendCalled(String phone, String name, String stationName) {
        send(phone, String.format("Sayın %s, SIRANIZ GELDİ! Lütfen %s'e gelin. 15 dk içinde gelmezseniz sıranız sona alınır.", name, stationName));
    }

    public void sendNoshow(String phone, String name) {
        send(phone, String.format("Sayın %s, 15 dakika içinde gelmediniz. Sıranız sona alındı.", name));
    }

    public void sendDone(String phone, String name) {
        send(phone, String.format("Sayın %s, kurbanınız hazır! Teslim almaya gelebilirsiniz.", name));
    }

    public void sendBreakNotice(String phone, String name) {
        send(phone, String.format("Sayın %s, kasabımız kısa mola veriyor. Sıranız korunuyor.", name));
    }
}
