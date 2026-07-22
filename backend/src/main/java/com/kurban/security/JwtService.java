package com.kurban.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String INSECURE_DEFAULT = "dev-only-insecure-secret-change-me-in-production";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-minutes:720}")
    private long expirationMinutes;

    private SecretKey key;

    @PostConstruct
    void init() {
        if (INSECURE_DEFAULT.equals(secret)) {
            log.warn("JWT_SECRET ayarlanmamış, güvensiz varsayılan değer kullanılıyor. " +
                    "Production'da mutlaka JWT_SECRET env var'ını ayarlayın.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationMinutes * 60)))
                .signWith(key)
                .compact();
    }

    public Instant getExpiration(String token) {
        return extractClaims(token).getExpiration().toInstant();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }
}
