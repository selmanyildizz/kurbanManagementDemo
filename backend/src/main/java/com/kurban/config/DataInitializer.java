package com.kurban.config;

import com.kurban.entity.ButcherStation;
import com.kurban.repository.ButcherStationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ButcherStationRepository stationRepo;

    public DataInitializer(ButcherStationRepository stationRepo) {
        this.stationRepo = stationRepo;
    }

    @Override
    public void run(String... args) {
        if (stationRepo.count() == 0) {
            ButcherStation s1 = new ButcherStation();
            s1.setName("Masa 1");
            s1.setStatus(ButcherStation.StationStatus.ACTIVE);
            stationRepo.save(s1);

            ButcherStation s2 = new ButcherStation();
            s2.setName("Masa 2");
            s2.setStatus(ButcherStation.StationStatus.ACTIVE);
            stationRepo.save(s2);
        }
    }
}
