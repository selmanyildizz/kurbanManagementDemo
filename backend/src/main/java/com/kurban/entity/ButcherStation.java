package com.kurban.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "butcher_station")
public class ButcherStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StationStatus status;

    public enum StationStatus { ACTIVE, BREAK, OFFLINE }

    public ButcherStation() {}

    public Integer getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public StationStatus getStatus() { return status; }
    public void setStatus(StationStatus status) { this.status = status; }
}
