package com.maktabah.repository;

import com.maktabah.model.MadhabOpinion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MadhabOpinionRepository extends JpaRepository<MadhabOpinion, Long> {

    List<MadhabOpinion> findByMasalahId(Long masalahId);

    long countByMasalahId(Long masalahId);

    @Transactional
    void deleteByMasalahId(Long masalahId);
}
