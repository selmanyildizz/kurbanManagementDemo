package com.kurban.config;

import com.kurban.entity.StaffUser;
import com.kurban.repository.StaffUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * İlk personel hesabını oluşturur. Henüz hiçbir kullanıcı-yönetimi arayüzü
 * olmadığından, ADMIN_BOOTSTRAP_USERNAME/ADMIN_BOOTSTRAP_PASSWORD env var'ları
 * ile tek seferlik, ortam bazlı bir bootstrap sağlar. Bu değerler boşsa
 * hiçbir şey yapmaz (staff_user tablosu boş kalır, giriş mümkün olmaz —
 * bilinçli bir varsayılan, kimse yanlışlıkla açık bir hesapla karşılaşmasın).
 */
@Component
@Order(1)
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final StaffUserRepository staffUserRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.bootstrap.username:}")
    private String bootstrapUsername;

    @Value("${admin.bootstrap.password:}")
    private String bootstrapPassword;

    public AdminBootstrap(StaffUserRepository staffUserRepo, PasswordEncoder passwordEncoder) {
        this.staffUserRepo = staffUserRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (staffUserRepo.count() > 0) return;
        if (bootstrapUsername.isBlank() || bootstrapPassword.isBlank()) {
            log.warn("Hiç personel hesabı yok ve ADMIN_BOOTSTRAP_USERNAME/PASSWORD ayarlanmamış. " +
                    "Giriş yapılamayacak — bu env var'ları ayarlayıp yeniden başlatın.");
            return;
        }

        StaffUser admin = new StaffUser();
        admin.setUsername(bootstrapUsername.trim());
        admin.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
        admin.setDisplayName(bootstrapUsername.trim());
        admin.setActive(true);
        staffUserRepo.save(admin);
        log.warn("Bootstrap admin hesabı oluşturuldu: {}", admin.getUsername());
    }
}
