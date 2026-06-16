package com.kurban.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String action;

    private UUID kurbanId;
    private String kurbanName;
    private Integer stationId;
    private String stationName;
    private String actor;
    private String note;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public AuditLog() {}

    public UUID getId() { return id; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public UUID getKurbanId() { return kurbanId; }
    public void setKurbanId(UUID kurbanId) { this.kurbanId = kurbanId; }
    public String getKurbanName() { return kurbanName; }
    public void setKurbanName(String kurbanName) { this.kurbanName = kurbanName; }
    public Integer getStationId() { return stationId; }
    public void setStationId(Integer stationId) { this.stationId = stationId; }
    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }
    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
