package com.kurban.repository;

import com.kurban.entity.QueueEntry;
import com.kurban.entity.QueueEntry.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, UUID> {

    @Query("SELECT q FROM QueueEntry q WHERE q.status = 'WAITING' AND q.station IS NULL ORDER BY q.checkinTime ASC")
    List<QueueEntry> findWaitingOrderByCheckinTime();

    Optional<QueueEntry> findByStationIdAndStatusIn(Integer stationId, List<QueueStatus> statuses);

    Optional<QueueEntry> findTopByKurbanTokenOrderByCheckinTimeDesc(String token);

    @Query("SELECT q FROM QueueEntry q WHERE q.status = 'CALLED'")
    List<QueueEntry> findAllCalled();

    @Query("SELECT q FROM QueueEntry q WHERE q.status IN ('WAITING','CALLED','CUTTING') ORDER BY q.checkinTime ASC")
    List<QueueEntry> findActiveQueue();

    long countByStatus(QueueStatus status);
}
