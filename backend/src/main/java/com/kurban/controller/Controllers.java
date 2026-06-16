package com.kurban.controller;

import com.kurban.dto.Requests;
import com.kurban.dto.Responses;
import com.kurban.entity.ButcherStation;
import com.kurban.repository.ButcherStationRepository;
import com.kurban.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
class AdminController {

    private final QueueService queueService;
    private final ButcherStationRepository stationRepo;

    AdminController(QueueService queueService, ButcherStationRepository stationRepo) {
        this.queueService = queueService;
        this.stationRepo = stationRepo;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Responses.DashboardResponse> dashboard() {
        return ResponseEntity.ok(queueService.getDashboard());
    }

    @PostMapping("/kurban")
    public ResponseEntity<Responses.KurbanResponse> register(@Valid @RequestBody Requests.KurbanCreate req) {
        return ResponseEntity.ok(queueService.registerKurban(req));
    }

    @PostMapping("/checkin")
    public ResponseEntity<Responses.QueueResponse> checkin(@Valid @RequestBody Requests.CheckinRequest req) {
        return ResponseEntity.ok(queueService.checkin(req.token));
    }

    @PostMapping("/queue/call-next/{stationId}")
    public ResponseEntity<Responses.QueueResponse> callNext(@PathVariable int stationId) {
        return ResponseEntity.ok(queueService.callNext(stationId));
    }

    @PostMapping("/queue/{entryId}/start-cutting")
    public ResponseEntity<Responses.QueueResponse> startCutting(@PathVariable UUID entryId) {
        return ResponseEntity.ok(queueService.startCutting(entryId));
    }

    @PostMapping("/queue/{entryId}/complete")
    public ResponseEntity<Responses.QueueResponse> complete(@PathVariable UUID entryId) {
        return ResponseEntity.ok(queueService.complete(entryId));
    }

    @PostMapping("/station/{stationId}/break")
    public ResponseEntity<Responses.StationResponse> toggleBreak(@PathVariable int stationId) {
        return ResponseEntity.ok(queueService.toggleBreak(stationId));
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
}

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = "*")
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

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadArg(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleBadState(IllegalStateException e) {
        return ResponseEntity.unprocessableEntity().body(new ErrorResponse(e.getMessage()));
    }

    record ErrorResponse(String message) {}
}
