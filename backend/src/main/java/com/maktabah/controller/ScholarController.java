package com.maktabah.controller;

import com.maktabah.dto.MasalahDTO;
import com.maktabah.service.ScholarService;
import com.maktabah.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/scholar")
public class ScholarController {

    private final ScholarService scholarService;
    private final UserService userService;

    public ScholarController(ScholarService scholarService, UserService userService) {
        this.scholarService = scholarService;
        this.userService = userService;
    }

    // ── Masail ────────────────────────────────────────────────────────────────

    @GetMapping("/masail")
    public ResponseEntity<?> getAllMasail(Authentication authentication) {
        if (!isScholar(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        return ResponseEntity.ok(scholarService.getAllMasail());
    }

    @PostMapping("/masail")
    public ResponseEntity<?> addMasalah(
            @RequestBody MasalahDTO request,
            Authentication authentication) {

        if (!isScholar(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        MasalahDTO created = scholarService.addMasalah(request);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/masail/{id}")
    public ResponseEntity<?> updateMasalah(
            @PathVariable Long id,
            @RequestBody MasalahDTO request,
            Authentication authentication) {

        if (!isScholar(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        MasalahDTO updated = scholarService.updateMasalah(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/masail/{id}")
    public ResponseEntity<?> deleteMasalah(
            @PathVariable Long id,
            Authentication authentication) {

        if (!isScholar(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        scholarService.deleteMasalah(id);
        return ResponseEntity.ok(Map.of("message", "Masalah deleted"));
    }

    @PutMapping("/masail/{id}/verify")
    public ResponseEntity<?> verifyMasalah(
            @PathVariable Long id,
            Authentication authentication) {

        if (!isScholar(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        try {
            scholarService.verifyMasalah(id);
            return ResponseEntity.ok(Map.of("message", "Masalah verified"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isScholar(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        Long userId = Long.parseLong(authentication.getName());
        return userService.findById(userId)
                .map(u -> "scholar".equals(u.getRole()))
                .orElse(false);
    }
}
