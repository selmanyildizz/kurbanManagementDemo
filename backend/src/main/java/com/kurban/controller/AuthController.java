package com.kurban.controller;

import com.kurban.dto.Requests;
import com.kurban.dto.Responses;
import com.kurban.entity.StaffUser;
import com.kurban.repository.StaffUserRepository;
import com.kurban.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final StaffUserRepository staffUserRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(StaffUserRepository staffUserRepo, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.staffUserRepo = staffUserRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<Responses.LoginResponse> login(@Valid @RequestBody Requests.LoginRequest req) {
        StaffUser user = staffUserRepo.findByUsername(req.username)
                .filter(StaffUser::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı adı veya şifre hatalı"));

        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Kullanıcı adı veya şifre hatalı");
        }

        String token = jwtService.generateToken(user.getUsername());

        Responses.LoginResponse resp = new Responses.LoginResponse();
        resp.token = token;
        resp.username = user.getUsername();
        resp.displayName = user.getDisplayName();
        resp.expiresAt = jwtService.getExpiration(token);
        return ResponseEntity.ok(resp);
    }
}
