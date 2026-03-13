package com.maktabah.controller;

import com.maktabah.dto.AdminUserDTO;
import com.maktabah.dto.BookDTO;
import com.maktabah.dto.MasalahDTO;
import com.maktabah.dto.RoadmapStepDTO;
import com.maktabah.service.AdminService;
import com.maktabah.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    public AdminController(AdminService adminService, UserService userService) {
        this.adminService = adminService;
        this.userService = userService;
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        List<AdminUserDTO> users = adminService.getUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PutMapping("/users/{id}/subscription")
    public ResponseEntity<?> updateSubscription(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        String status = body.get("subscriptionStatus");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "subscriptionStatus is required"));
        }
        adminService.updateSubscription(id, status);
        return ResponseEntity.ok(Map.of("message", "Subscription updated"));
    }

    // ── Books ─────────────────────────────────────────────────────────────────

    @GetMapping("/books")
    public ResponseEntity<?> getAllBooks(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        return ResponseEntity.ok(adminService.getAllBooks());
    }

    @PostMapping("/books")
    public ResponseEntity<?> addBook(
            @RequestParam String title,
            @RequestParam String author,
            @RequestParam Long fieldId,
            @RequestParam String level,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String authorBio,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        try {
            BookDTO book = adminService.addBook(title, author, fieldId, level, description, authorBio, file);
            return ResponseEntity.status(201).body(book);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Something went wrong. Please try again."));
        }
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<?> updateBook(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String author,
            @RequestParam Long fieldId,
            @RequestParam String level,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String authorBio,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        if (title == null || author == null || fieldId == null || level == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "title, author, fieldId, and level are required"));
        }
        try {
            BookDTO book = adminService.updateBook(id, title, author, fieldId, level, description, authorBio, file);
            return ResponseEntity.ok(book);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Something went wrong. Please try again."));
        }
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<?> deleteBook(
            @PathVariable Long id,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        adminService.deleteBook(id);
        return ResponseEntity.ok(Map.of("message", "Book deleted"));
    }

    // ── Masail ────────────────────────────────────────────────────────────────

    @GetMapping("/masail")
    public ResponseEntity<?> getAllMasail(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        return ResponseEntity.ok(adminService.getAllMasail());
    }

    @PostMapping("/masail")
    public ResponseEntity<?> addMasalah(
            @RequestBody MasalahDTO request,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        MasalahDTO created = adminService.addMasalah(request);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/masail/{id}")
    public ResponseEntity<?> updateMasalah(
            @PathVariable Long id,
            @RequestBody MasalahDTO request,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        MasalahDTO updated = adminService.updateMasalah(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/masail/{id}")
    public ResponseEntity<?> deleteMasalah(
            @PathVariable Long id,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        adminService.deleteMasalah(id);
        return ResponseEntity.ok(Map.of("message", "Masalah deleted"));
    }

    @PutMapping("/masail/{id}/verify")
    public ResponseEntity<?> verifyMasalah(
            @PathVariable Long id,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        try {
            adminService.verifyMasalah(id);
            return ResponseEntity.ok(Map.of("message", "Masalah verified"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Roadmap Steps ─────────────────────────────────────────────────────────────

    @GetMapping("/roadmap")
    public ResponseEntity<?> getAllRoadmapSteps(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        return ResponseEntity.ok(adminService.getAllRoadmapSteps());
    }

    @PostMapping("/roadmap")
    public ResponseEntity<?> addRoadmapStep(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        try {
            Long fieldId = Long.valueOf(body.get("fieldId").toString());
            Long bookId = Long.valueOf(body.get("bookId").toString());
            String level = (String) body.get("level");
            Integer stepOrder = Integer.valueOf(body.get("stepOrder").toString());
            String description = (String) body.get("description");

            if (level == null || level.isBlank() || description == null || description.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "level and description are required"));
            }

            RoadmapStepDTO step = adminService.addRoadmapStep(fieldId, bookId, level, stepOrder, description);
            return ResponseEntity.status(201).body(step);
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "fieldId, bookId, level, stepOrder, and description are required"));
        } catch (com.maktabah.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "A step with this field, level, and step order already exists"));
        }
    }

    @PutMapping("/roadmap/{id}")
    public ResponseEntity<?> updateRoadmapStep(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        try {
            Long fieldId = Long.valueOf(body.get("fieldId").toString());
            Long bookId = Long.valueOf(body.get("bookId").toString());
            String level = (String) body.get("level");
            Integer stepOrder = Integer.valueOf(body.get("stepOrder").toString());
            String description = (String) body.get("description");

            if (level == null || level.isBlank() || description == null || description.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "level and description are required"));
            }

            RoadmapStepDTO step = adminService.updateRoadmapStep(id, fieldId, bookId, level, stepOrder, description);
            return ResponseEntity.ok(step);
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "fieldId, bookId, level, stepOrder, and description are required"));
        } catch (com.maktabah.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "A step with this field, level, and step order already exists"));
        }
    }

    @DeleteMapping("/roadmap/{id}")
    public ResponseEntity<?> deleteRoadmapStep(
            @PathVariable Long id,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        try {
            adminService.deleteRoadmapStep(id);
            return ResponseEntity.ok(Map.of("message", "Roadmap step deleted"));
        } catch (com.maktabah.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        Long userId = Long.parseLong(authentication.getName());
        return userService.findById(userId)
                .map(u -> "admin".equals(u.getRole()))
                .orElse(false);
    }
}
