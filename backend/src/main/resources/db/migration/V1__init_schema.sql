-- Kurban: hisse sahibi kayıtları
CREATE TABLE kurban (
    id          UUID PRIMARY KEY,
    token       VARCHAR(8) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(255) NOT NULL,
    shares      INTEGER NOT NULL,
    note        VARCHAR(255),
    created_at  TIMESTAMP NOT NULL
);

-- Kesim masaları
CREATE TABLE butcher_station (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    status  VARCHAR(20) NOT NULL
);

-- Sıra girişleri
CREATE TABLE queue_entry (
    id                  UUID PRIMARY KEY,
    kurban_id           UUID NOT NULL REFERENCES kurban(id),
    station_id          INTEGER REFERENCES butcher_station(id),
    checkin_time        TIMESTAMP NOT NULL,
    called_time         TIMESTAMP,
    cutting_start_time  TIMESTAMP,
    completed_time      TIMESTAMP,
    status              VARCHAR(20) NOT NULL
);

CREATE INDEX idx_queue_entry_kurban_id ON queue_entry(kurban_id);
CREATE INDEX idx_queue_entry_status ON queue_entry(status);

-- İşlem denetim kaydı
CREATE TABLE audit_log (
    id            UUID PRIMARY KEY,
    action        VARCHAR(50) NOT NULL,
    kurban_id     UUID,
    kurban_name   VARCHAR(255),
    station_id    INTEGER,
    station_name  VARCHAR(255),
    actor         VARCHAR(255),
    note          VARCHAR(255),
    created_at    TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Varsayılan kesim masaları
INSERT INTO butcher_station (name, status) VALUES ('Masa 1', 'ACTIVE');
INSERT INTO butcher_station (name, status) VALUES ('Masa 2', 'ACTIVE');
