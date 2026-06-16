package com.kurban.repository;

import com.kurban.entity.ButcherStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ButcherStationRepository extends JpaRepository<ButcherStation, Integer> {
    List<ButcherStation> findByStatusNot(ButcherStation.StationStatus status);
}
