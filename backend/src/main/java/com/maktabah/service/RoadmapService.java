package com.maktabah.service;

import com.maktabah.dto.RoadmapStepDTO;
import com.maktabah.model.RoadmapStep;
import com.maktabah.repository.RoadmapStepRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoadmapService {

    private final RoadmapStepRepository roadmapStepRepository;

    public RoadmapService(RoadmapStepRepository roadmapStepRepository) {
        this.roadmapStepRepository = roadmapStepRepository;
    }

    public List<RoadmapStepDTO> getRoadmap(Long fieldId, String level) {
        List<RoadmapStep> steps;
        if (fieldId != null) {
            steps = roadmapStepRepository.findByFieldIdAndLevelOrderByStepOrder(fieldId, level);
        } else {
            steps = roadmapStepRepository.findByLevelOrderByStepOrder(level);
        }
        return steps.stream().map(this::toDTO).toList();
    }

    private RoadmapStepDTO toDTO(RoadmapStep step) {
        return new RoadmapStepDTO(
                step.getId(),
                step.getField().getId(),
                step.getBook().getId(),
                step.getBook().getTitle(),
                step.getBook().getAuthor(),
                step.getBook().getPdfFilename(),
                step.getLevel(),
                step.getStepOrder(),
                step.getDescription()
        );
    }
}
