package com.maktabah.controller;

import com.maktabah.dto.RoadmapStepDTO;
import com.maktabah.service.RoadmapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @GetMapping
    public ResponseEntity<List<RoadmapStepDTO>> getRoadmap(
            @RequestParam(required = false) Long fieldId,
            @RequestParam String level) {
        return ResponseEntity.ok(roadmapService.getRoadmap(fieldId, level));
    }
}
