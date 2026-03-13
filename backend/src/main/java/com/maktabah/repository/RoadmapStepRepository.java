package com.maktabah.repository;

import com.maktabah.model.RoadmapStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoadmapStepRepository extends JpaRepository<RoadmapStep, Long> {

    List<RoadmapStep> findByFieldIdAndLevelOrderByStepOrder(Long fieldId, String level);

    List<RoadmapStep> findByLevelOrderByStepOrder(String level);

    @Query("SELECT r FROM RoadmapStep r ORDER BY r.field.id ASC, r.level ASC, r.stepOrder ASC")
    List<RoadmapStep> findAllOrdered();
}
