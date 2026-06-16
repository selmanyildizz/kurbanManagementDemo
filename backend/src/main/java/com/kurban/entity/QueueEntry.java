package com.kurban.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "queue_entry")
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kurban_id", nullable = false)
    private Kurban kurban;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "station_id")
    private ButcherStation station;

    @Column(nullable = false)
    private LocalDateTime checkinTime;

    private LocalDateTime calledTime;
    private LocalDateTime cuttingStartTime;
    private LocalDateTime completedTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QueueStatus status;

    public enum QueueStatus { WAITING, CALLED, CUTTING, DONE, NOSHOW }

    public QueueEntry() {}

    public UUID getId() { return id; }
    public Kurban getKurban() { return kurban; }
    public void setKurban(Kurban kurban) { this.kurban = kurban; }
    public ButcherStation getStation() { return station; }
    public void setStation(ButcherStation station) { this.station = station; }
    public LocalDateTime getCheckinTime() { return checkinTime; }
    public void setCheckinTime(LocalDateTime checkinTime) { this.checkinTime = checkinTime; }
    public LocalDateTime getCalledTime() { return calledTime; }
    public void setCalledTime(LocalDateTime calledTime) { this.calledTime = calledTime; }
    public LocalDateTime getCuttingStartTime() { return cuttingStartTime; }
    public void setCuttingStartTime(LocalDateTime t) { this.cuttingStartTime = t; }
    public LocalDateTime getCompletedTime() { return completedTime; }
    public void setCompletedTime(LocalDateTime t) { this.completedTime = t; }
    public QueueStatus getStatus() { return status; }
    public void setStatus(QueueStatus status) { this.status = status; }
}
