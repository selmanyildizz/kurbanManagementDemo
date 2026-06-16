package com.kurban.repository;

import com.kurban.entity.Kurban;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface KurbanRepository extends JpaRepository<Kurban, UUID> {
    Optional<Kurban> findByToken(String token);
    boolean existsByToken(String token);
}
