package com.kurban.controller;

import com.kurban.dto.Requests;
import com.kurban.dto.Responses;
import com.kurban.entity.ButcherStation;
import com.kurban.entity.StaffUser;
import com.kurban.repository.ButcherStationRepository;
import com.kurban.repository.StaffUserRepository;
import com.kurban.service.EmailService;
import com.kurban.service.QueueService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/admin")
class AdminController {

    private final QueueService queueService;
    private final ButcherStationRepository stationRepo;
    private final StaffUserRepository staffUserRepo;
    private final PasswordEncoder passwordEncoder;

    AdminController(QueueService queueService, ButcherStationRepository stationRepo,
                     StaffUserRepository staffUserRepo, PasswordEncoder passwordEncoder) {
        this.queueService = queueService;
        this.stationRepo = stationRepo;
        this.staffUserRepo = staffUserRepo;
        this.passwordEncoder = passwordEncoder;
    }

    private String actor(Authentication authentication) {
        String username = authentication.getName();
        return staffUserRepo.findByUsername(username)
                .map(StaffUser::getDisplayName)
                .orElse(username);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Responses.DashboardResponse> dashboard() {
        return ResponseEntity.ok(queueService.getDashboard());
    }

    @PostMapping("/kurban")
    public ResponseEntity<Responses.KurbanResponse> register(@Valid @RequestBody Requests.KurbanCreate req,
                                                               Authentication authentication) {
        return ResponseEntity.ok(queueService.registerKurban(req, actor(authentication)));
    }

    @PostMapping("/checkin")
    public ResponseEntity<Responses.QueueResponse> checkin(@Valid @RequestBody Requests.CheckinRequest req,
                                                             Authentication authentication) {
        return ResponseEntity.ok(queueService.checkin(req.token, actor(authentication)));
    }

    @PostMapping("/queue/call-next/{stationId}")
    public ResponseEntity<Responses.QueueResponse> callNext(@PathVariable int stationId,
                                                              Authentication authentication) {
        return ResponseEntity.ok(queueService.callNext(stationId, actor(authentication)));
    }

    @PostMapping("/queue/{entryId}/start-cutting")
    public ResponseEntity<Responses.QueueResponse> startCutting(@PathVariable UUID entryId,
                                                                  Authentication authentication) {
        return ResponseEntity.ok(queueService.startCutting(entryId, actor(authentication)));
    }

    @PostMapping("/queue/{entryId}/complete")
    public ResponseEntity<Responses.QueueResponse> complete(@PathVariable UUID entryId,
                                                              Authentication authentication) {
        return ResponseEntity.ok(queueService.complete(entryId, actor(authentication)));
    }

    @PostMapping("/station/{stationId}/break")
    public ResponseEntity<Responses.StationResponse> toggleBreak(@PathVariable int stationId,
                                                                   Authentication authentication) {
        return ResponseEntity.ok(queueService.toggleBreak(stationId, actor(authentication)));
    }

    @PostMapping("/station")
    public ResponseEntity<Responses.StationResponse> addStation(@Valid @RequestBody Requests.StationCreate req) {
        ButcherStation s = new ButcherStation();
        s.setName(req.name);
        s.setStatus(ButcherStation.StationStatus.ACTIVE);
        stationRepo.save(s);
        Responses.StationResponse r = new Responses.StationResponse();
        r.id = s.getId(); r.name = s.getName(); r.status = s.getStatus();
        return ResponseEntity.ok(r);
    }

    @PostMapping("/users")
    public ResponseEntity<Responses.StaffUserResponse> createUser(@Valid @RequestBody Requests.StaffUserCreate req) {
        if (staffUserRepo.existsByUsername(req.username))
            throw new IllegalArgumentException("Bu kullanıcı adı zaten kullanılıyor");

        StaffUser u = new StaffUser();
        u.setUsername(req.username.trim());
        u.setPasswordHash(passwordEncoder.encode(req.password));
        u.setDisplayName(req.displayName.trim());
        u.setActive(true);
        staffUserRepo.save(u);

        Responses.StaffUserResponse r = new Responses.StaffUserResponse();
        r.id = u.getId(); r.username = u.getUsername(); r.displayName = u.getDisplayName(); r.active = u.isActive();
        return ResponseEntity.ok(r);
    }
}

@RestController
@RequestMapping("/api/status")
class PublicController {

    private final QueueService queueService;

    PublicController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<Responses.CustomerStatusResponse> status(@PathVariable String token) {
        return ResponseEntity.ok(queueService.getCustomerStatus(token));
    }
}

@RestController
@RequestMapping("/api/contact")
class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    /** Aynı IP'den art arda form gönderimine izin verilen en kısa süre. */
    private static final long MIN_INTERVAL_MS = 30_000;
    private static final int MAX_TRACKED_IPS = 10_000;

    private final EmailService emailService;
    private final Map<String, Long> lastSubmission = new ConcurrentHashMap<>();

    ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> submit(@Valid @RequestBody Requests.ContactRequest req,
                                    HttpServletRequest http) {
        String ip = clientIp(http);
        long now = System.currentTimeMillis();

        Long previous = lastSubmission.get(ip);
        if (previous != null && now - previous < MIN_INTERVAL_MS) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Az önce bir talep gönderdiniz. Lütfen biraz bekleyin."));
        }

        boolean sent = emailService.sendContactRequest(
                req.name.trim(), req.phone.trim(), req.email.trim(), req.message.trim());
        if (!sent) {
            log.error("İletişim formu gönderilemedi (IP {})", ip);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Mesaj şu anda gönderilemedi. Lütfen daha sonra tekrar deneyin."));
        }

        // Sınırsız büyümesin: eşik aşılırsa eski kayıtlar temizlenir.
        if (lastSubmission.size() > MAX_TRACKED_IPS) {
            lastSubmission.entrySet().removeIf(e -> now - e.getValue() > MIN_INTERVAL_MS);
        }
        lastSubmission.put(ip, now);

        return ResponseEntity.ok(Map.of(
                "message", "Talebiniz alındı. Gün içerisinde size döneceğiz."));
    }

    private String clientIp(HttpServletRequest http) {
        String forwarded = http.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadArg(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getDefaultMessage())
                .orElse("Geçersiz istek");
        return ResponseEntity.badRequest().body(new ErrorResponse(message));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleBadState(IllegalStateException e) {
        return ResponseEntity.unprocessableEntity().body(new ErrorResponse(e.getMessage()));
    }

    record ErrorResponse(String message) {}
}
