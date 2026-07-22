package com.kurban.service;

import com.kurban.dto.Requests;
import com.kurban.dto.Responses;
import com.kurban.entity.*;
import com.kurban.entity.QueueEntry.QueueStatus;
import com.kurban.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QueueService {

    private static final Logger log = LoggerFactory.getLogger(QueueService.class);

    private final KurbanRepository kurbanRepo;
    private final QueueEntryRepository queueRepo;
    private final ButcherStationRepository stationRepo;
    private final AuditLogRepository auditRepo;
    private final SmsService sms;

    @Value("${queue.noshow-timeout-minutes:15}")
    private int noshowTimeout;

    public QueueService(KurbanRepository kurbanRepo, QueueEntryRepository queueRepo,
                        ButcherStationRepository stationRepo, AuditLogRepository auditRepo,
                        SmsService sms) {
        this.kurbanRepo = kurbanRepo;
        this.queueRepo = queueRepo;
        this.stationRepo = stationRepo;
        this.auditRepo = auditRepo;
        this.sms = sms;
    }

    private String generateToken() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random rnd = new Random();
        String token;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
            token = sb.toString();
        } while (kurbanRepo.existsByToken(token));
        return token;
    }

    public Responses.KurbanResponse registerKurban(Requests.KurbanCreate req, String actor) {
        Kurban k = new Kurban();
        k.setToken(generateToken());
        k.setName(req.name.trim());
        k.setPhone(req.phone.trim());
        k.setShares(req.shares);
        k.setNote(req.note);
        kurbanRepo.save(k);

        sms.send(k.getPhone(), String.format(
            "Sayın %s, kurban kaydınız alındı. Gün içinde geldiğinizde sıra kodunuzu (%s) büroda gösterin.",
            k.getName(), k.getToken()));
        audit("REGISTERED", k, null, actor, "Kayıt oluşturuldu");
        return toKurbanResponse(k);
    }

    public Responses.QueueResponse checkin(String token, String actor) {
        Kurban k = kurbanRepo.findByToken(token.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Token bulunamadı: " + token));

        queueRepo.findTopByKurbanTokenOrderByCheckinTimeDesc(token.toUpperCase())
                .ifPresent(last -> {
                    switch (last.getStatus()) {
                        case WAITING, CALLED, CUTTING ->
                            throw new IllegalStateException("Bu kurban zaten kuyrukta");
                        case DONE ->
                            throw new IllegalStateException("Bu kurbanın kesimi zaten tamamlandı. Tekrar check-in yapılamaz.");
                        case NOSHOW -> { /* gelmediği için sırası düşen tekrar girebilir */ }
                    }
                });

        QueueEntry entry = new QueueEntry();
        entry.setKurban(k);
        entry.setCheckinTime(LocalDateTime.now());
        entry.setStatus(QueueStatus.WAITING);
        queueRepo.save(entry);

        int position = getWaitingPosition(entry.getId());
        sms.sendCheckinConfirm(k.getPhone(), k.getName(), position);
        audit("CHECKIN", k, null, actor, "Check-in. Sıra: " + position);
        return toQueueResponse(entry, position);
    }

    public Responses.QueueResponse callNext(int stationId, String actor) {
        ButcherStation station = stationRepo.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Masa bulunamadı"));

        if (station.getStatus() == ButcherStation.StationStatus.BREAK)
            throw new IllegalStateException(station.getName() + " molada.");
        if (station.getStatus() == ButcherStation.StationStatus.OFFLINE)
            throw new IllegalStateException(station.getName() + " aktif değil.");

        boolean busy = queueRepo.findByStationIdAndStatusIn(stationId,
                List.of(QueueStatus.CALLED, QueueStatus.CUTTING)).isPresent();
        if (busy) throw new IllegalStateException(station.getName() + " üzerinde aktif işlem var.");

        QueueEntry next = queueRepo.findWaitingOrderByCheckinTime().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Kuyrukta kimse yok"));

        next.setStation(station);
        next.setStatus(QueueStatus.CALLED);
        next.setCalledTime(LocalDateTime.now());
        queueRepo.save(next);

        sms.sendCalled(next.getKurban().getPhone(), next.getKurban().getName(), station.getName());
        audit("CALLED", next.getKurban(), station, actor, "Çağrıldı → " + station.getName());
        return toQueueResponse(next, null);
    }

    public Responses.QueueResponse startCutting(UUID entryId, String actor) {
        QueueEntry entry = getEntry(entryId);
        if (entry.getStatus() != QueueStatus.CALLED)
            throw new IllegalStateException("Sadece CALLED durumundaki giriş kesilebilir");
        entry.setStatus(QueueStatus.CUTTING);
        entry.setCuttingStartTime(LocalDateTime.now());
        queueRepo.save(entry);
        audit("CUTTING", entry.getKurban(), entry.getStation(), actor, "Kesim başladı");
        return toQueueResponse(entry, null);
    }

    public Responses.QueueResponse complete(UUID entryId, String actor) {
        QueueEntry entry = getEntry(entryId);
        if (entry.getStatus() != QueueStatus.CUTTING)
            throw new IllegalStateException("Sadece CUTTING durumundaki giriş tamamlanabilir");
        entry.setStatus(QueueStatus.DONE);
        entry.setCompletedTime(LocalDateTime.now());
        queueRepo.save(entry);
        sms.sendDone(entry.getKurban().getPhone(), entry.getKurban().getName());
        audit("DONE", entry.getKurban(), entry.getStation(), actor, "Tamamlandı");
        return toQueueResponse(entry, null);
    }

    public Responses.StationResponse toggleBreak(int stationId, String actor) {
        ButcherStation station = stationRepo.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Masa bulunamadı"));
        boolean goingOnBreak = station.getStatus() == ButcherStation.StationStatus.ACTIVE;
        station.setStatus(goingOnBreak
                ? ButcherStation.StationStatus.BREAK
                : ButcherStation.StationStatus.ACTIVE);
        stationRepo.save(station);
        if (goingOnBreak) {
            queueRepo.findWaitingOrderByCheckinTime().stream().limit(5).forEach(q ->
                sms.sendBreakNotice(q.getKurban().getPhone(), q.getKurban().getName()));
            audit("BREAK_START", null, station, actor, "Mola başladı");
        } else {
            audit("BREAK_END", null, station, actor, "Mola bitti");
        }
        return toStationResponse(station);
    }

    @Scheduled(fixedDelay = 60_000)
    public void processNoshows() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(noshowTimeout);
        queueRepo.findAllCalled().stream()
                .filter(q -> q.getCalledTime().isBefore(cutoff))
                .forEach(q -> {
                    q.setStatus(QueueStatus.NOSHOW);
                    queueRepo.save(q);
                    sms.sendNoshow(q.getKurban().getPhone(), q.getKurban().getName());
                    audit("NOSHOW", q.getKurban(), q.getStation(), "SİSTEM", noshowTimeout + " dk içinde gelmedi");
                    log.info("No-show: {} ({})", q.getKurban().getName(), q.getKurban().getToken());
                });
    }

    @Transactional(readOnly = true)
    public Responses.DashboardResponse getDashboard() {
        List<QueueEntry> activeQueue = queueRepo.findActiveQueue();
        List<ButcherStation> stations = stationRepo.findAll();

        List<QueueEntry> waiting = activeQueue.stream()
                .filter(q -> q.getStatus() == QueueStatus.WAITING).toList();
        Map<UUID, Integer> posMap = new HashMap<>();
        for (int i = 0; i < waiting.size(); i++) posMap.put(waiting.get(i).getId(), i + 1);

        Responses.DashboardResponse resp = new Responses.DashboardResponse();
        resp.waitingCount = queueRepo.countByStatus(QueueStatus.WAITING);
        resp.calledCount  = queueRepo.countByStatus(QueueStatus.CALLED);
        resp.cuttingCount = queueRepo.countByStatus(QueueStatus.CUTTING);
        resp.doneCount    = queueRepo.countByStatus(QueueStatus.DONE);
        resp.noshowCount  = queueRepo.countByStatus(QueueStatus.NOSHOW);
        resp.queue        = activeQueue.stream().map(q -> toQueueResponse(q, posMap.get(q.getId()))).collect(Collectors.toList());
        resp.stations     = stations.stream().map(this::toStationResponse).collect(Collectors.toList());
        resp.recentLogs   = auditRepo.findAllByOrderByCreatedAtDesc().stream().limit(20)
                .map(l -> { var a = new Responses.AuditResponse(); a.action = l.getAction();
                    a.kurbanName = l.getKurbanName(); a.stationName = l.getStationName();
                    a.actor = l.getActor();
                    a.note = l.getNote(); a.createdAt = l.getCreatedAt(); return a; })
                .collect(Collectors.toList());
        return resp;
    }

    @Transactional(readOnly = true)
    public Responses.CustomerStatusResponse getCustomerStatus(String token) {
        Kurban k = kurbanRepo.findByToken(token.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Token bulunamadı"));

        Optional<QueueEntry> entryOpt = queueRepo.findTopByKurbanTokenOrderByCheckinTimeDesc(token.toUpperCase());

        if (entryOpt.isEmpty()) {
            Responses.CustomerStatusResponse r = new Responses.CustomerStatusResponse();
            r.name = k.getName(); r.shares = k.getShares();
            r.statusMessage = "Henüz check-in yapılmadı. Lütfen büroya gelin.";
            return r;
        }

        QueueEntry entry = entryOpt.get();
        int position = getWaitingPosition(entry.getId());

        String msg = switch (entry.getStatus()) {
            case WAITING -> "Sırada bekliyorsunuz. Sıra no: " + position;
            case CALLED  -> "SIRANIZ GELDİ! Lütfen " + (entry.getStation() != null ? entry.getStation().getName() : "masaya") + " gelin.";
            case CUTTING -> "Kurbanınız kesiliyor.";
            case DONE    -> "Kurbanınız hazır! Teslim alabilirsiniz.";
            case NOSHOW  -> "Süre doldu, sıranız geçti. Tekrar check-in yapın.";
        };

        Responses.CustomerStatusResponse r = new Responses.CustomerStatusResponse();
        r.name = k.getName(); r.shares = k.getShares(); r.status = entry.getStatus();
        r.queuePosition = entry.getStatus() == QueueStatus.WAITING ? position : null;
        r.statusMessage = msg;
        r.stationName = entry.getStation() != null ? entry.getStation().getName() : null;
        return r;
    }

    // ── helpers ──────────────────────────────────────────────

    private int getWaitingPosition(UUID entryId) {
        List<QueueEntry> waiting = queueRepo.findWaitingOrderByCheckinTime();
        for (int i = 0; i < waiting.size(); i++)
            if (waiting.get(i).getId().equals(entryId)) return i + 1;
        return -1;
    }

    private QueueEntry getEntry(UUID id) {
        return queueRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Kayıt bulunamadı: " + id));
    }

    private void audit(String action, Kurban k, ButcherStation s, String actor, String note) {
        AuditLog l = new AuditLog();
        l.setAction(action);
        l.setKurbanId(k != null ? k.getId() : null);
        l.setKurbanName(k != null ? k.getName() : null);
        l.setStationId(s != null ? s.getId() : null);
        l.setStationName(s != null ? s.getName() : null);
        l.setActor(actor);
        l.setNote(note);
        auditRepo.save(l);
    }

    private Responses.KurbanResponse toKurbanResponse(Kurban k) {
        Responses.KurbanResponse r = new Responses.KurbanResponse();
        r.id = k.getId(); r.token = k.getToken(); r.name = k.getName();
        r.phone = k.getPhone(); r.shares = k.getShares(); r.note = k.getNote();
        r.createdAt = k.getCreatedAt();
        return r;
    }

    private Responses.QueueResponse toQueueResponse(QueueEntry q, Integer pos) {
        Responses.QueueResponse r = new Responses.QueueResponse();
        r.id = q.getId(); r.token = q.getKurban().getToken(); r.name = q.getKurban().getName();
        r.phone = q.getKurban().getPhone(); r.shares = q.getKurban().getShares();
        r.note = q.getKurban().getNote();
        r.stationId = q.getStation() != null ? q.getStation().getId() : null;
        r.stationName = q.getStation() != null ? q.getStation().getName() : null;
        r.checkinTime = q.getCheckinTime(); r.calledTime = q.getCalledTime();
        r.status = q.getStatus(); r.queuePosition = pos;
        return r;
    }

    private Responses.StationResponse toStationResponse(ButcherStation s) {
        Responses.StationResponse r = new Responses.StationResponse();
        r.id = s.getId(); r.name = s.getName(); r.status = s.getStatus();
        r.currentKurban = queueRepo.findByStationIdAndStatusIn(s.getId(),
                List.of(QueueStatus.CALLED, QueueStatus.CUTTING))
                .map(q -> toQueueResponse(q, null)).orElse(null);
        return r;
    }
}
