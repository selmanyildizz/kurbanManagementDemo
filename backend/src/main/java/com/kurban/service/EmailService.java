package com.kurban.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${email.enabled:false}")
    private boolean enabled;

    @Value("${email.from:}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    void checkConfig() {
        if (enabled && from.isBlank()) {
            log.warn("EMAIL_ENABLED=true ama EMAIL_FROM ayarlanmamış. E-posta gönderimleri başarısız olacak.");
        }
    }

    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;
        if (!enabled) {
            log.info("✉️ Email [SIM] → {} : {} — {}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("E-posta gönderildi: {}", to);
        } catch (Exception e) {
            log.error("E-posta gönderilemedi: {}", e.getMessage());
        }
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
