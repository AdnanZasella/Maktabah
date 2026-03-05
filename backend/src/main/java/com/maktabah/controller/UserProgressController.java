package com.maktabah.controller;

import com.maktabah.service.UserProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class UserProgressController {

    private final UserProgressService userProgressService;

    public UserProgressController(UserProgressService userProgressService) {
        this.userProgressService = userProgressService;
    }

    // GET /api/progress
    @GetMapping
    public ResponseEntity<List<Long>> getProgress(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<Long> completedIds = userProgressService.getCompletedStepIds(userId);
        return ResponseEntity.ok(completedIds);
    }

    // POST /api/progress/{stepId}/complete
    @PostMapping("/{stepId}/complete")
    public ResponseEntity<Map<String, String>> completeStep(
            @PathVariable Long stepId,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        userProgressService.markStepComplete(userId, stepId);
        return ResponseEntity.ok(Map.of("message", "Step marked as complete"));
    }
}
