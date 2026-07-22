package com.kurban.dto;

import com.kurban.entity.ButcherStation;
import com.kurban.entity.QueueEntry;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class Responses {

    public static class KurbanResponse {
        public UUID id;
        public String token;
        public String name;
        public String phone;
        public int shares;
        public String note;
        public LocalDateTime createdAt;
    }

    public static class QueueResponse {
        public UUID id;
        public String token;
        public String name;
        public String phone;
        public int shares;
        public String note;
        public Integer stationId;
        public String stationName;
        public LocalDateTime checkinTime;
        public LocalDateTime calledTime;
        public QueueEntry.QueueStatus status;
        public Integer queuePosition;
    }

    public static class StationResponse {
        public Integer id;
        public String name;
        public ButcherStation.StationStatus status;
        public QueueResponse currentKurban;
    }

    public static class DashboardResponse {
        public long waitingCount;
        public long calledCount;
        public long cuttingCount;
        public long doneCount;
        public long noshowCount;
        public List<StationResponse> stations;
        public List<QueueResponse> queue;
        public List<AuditResponse> recentLogs;
    }

    public static class AuditResponse {
        public String action;
        public String kurbanName;
        public String stationName;
        public String actor;
        public String note;
        public LocalDateTime createdAt;
    }

    public static class CustomerStatusResponse {
        public String name;
        public int shares;
        public QueueEntry.QueueStatus status;
        public Integer queuePosition;
        public String statusMessage;
        public String stationName;
    }

    public static class LoginResponse {
        public String token;
        public String username;
        public String displayName;
        public Instant expiresAt;
    }

    public static class StaffUserResponse {
        public UUID id;
        public String username;
        public String displayName;
        public boolean active;
    }
}
