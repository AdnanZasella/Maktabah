package com.maktabah.controller;

import com.maktabah.dto.MasalahDTO;
import com.maktabah.model.User;
import com.maktabah.service.MasalahService;
import com.maktabah.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/masail")
public class MasalahController {

    private final MasalahService masalahService;
    private final UserService userService;

    public MasalahController(MasalahService masalahService, UserService userService) {
        this.masalahService = masalahService;
        this.userService = userService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(masalahService.getCategories());
    }

    @GetMapping
    public ResponseEntity<?> getMasailByCategory(
            @RequestParam String category,
            Authentication authentication) {

        if (!isPaid(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        return ResponseEntity.ok(masalahService.getMasailByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchMasail(
            @RequestParam String query,
            Authentication authentication) {

        if (!isPaid(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        return ResponseEntity.ok(masalahService.searchMasail(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMasalahById(
            @PathVariable Long id,
            Authentication authentication) {

        if (!isPaid(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        MasalahDTO masalah = masalahService.getMasalahById(id);
        return ResponseEntity.ok(masalah);
    }

    private boolean isPaid(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        Long userId = Long.parseLong(authentication.getName());
        Optional<User> user = userService.findById(userId);
        return user.isPresent() && "paid".equals(user.get().getSubscriptionStatus());
    }
}
