package com.kurban;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KurbanApplication {
    public static void main(String[] args) {
        SpringApplication.run(KurbanApplication.class, args);
    }
}
