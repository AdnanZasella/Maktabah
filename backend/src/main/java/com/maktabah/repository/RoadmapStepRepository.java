package com.maktabah.repository;

import com.maktabah.model.RoadmapStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapStepRepository extends JpaRepository<RoadmapStep, Long> {

    List<RoadmapStep> findByFieldIdAndLevelOrderByStepOrder(Long fieldId, String level);

    List<RoadmapStep> findByLevelOrderByStepOrder(String level);
}
