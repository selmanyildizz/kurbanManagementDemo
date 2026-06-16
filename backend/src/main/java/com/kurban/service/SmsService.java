package com.kurban.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    public void send(String phone, String message) {
        if (!enabled) {
            log.info("📱 SMS [SIM] → {} : {}", phone, message);
            return;
        }
        try {
            String url = String.format(
                "https://api.netgsm.com.tr/sms/send/get/?usercode=%s&password=%s&gsmno=%s&message=%s&msgheader=%s",
                usercode, password,
                phone.replaceAll("[^0-9]", ""),
                java.net.URLEncoder.encode(message, "UTF-8"),
                msgheader);
            var client = java.net.http.HttpClient.newHttpClient();
            var req = java.net.http.HttpRequest.newBuilder().uri(java.net.URI.create(url)).GET().build();
            var resp = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
            log.info("Netgsm: {}", resp.body());
        } catch (Exception e) {
            log.error("SMS gönderilemedi: {}", e.getMessage());
        }
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
