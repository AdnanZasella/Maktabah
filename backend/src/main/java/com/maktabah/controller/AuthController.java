package com.maktabah.controller;

import com.maktabah.dto.UserDTO;
import com.maktabah.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(
            @RequestBody RegisterRequest body,
            HttpServletResponse response
    ) {
        UserDTO user = authService.register(body.email(), body.password(), response);
        return ResponseEntity.ok(user);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(
            @RequestBody LoginRequest body,
            HttpServletResponse response
    ) {
        UserDTO user = authService.login(body.email(), body.password(), response);
        return ResponseEntity.ok(user);
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        authService.logout(request, response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // GET /api/auth/me
    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(HttpServletRequest request) {
        Optional<UserDTO> user = authService.getCurrentUser(request);
        return user
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody ForgotPasswordRequest body
    ) {
        authService.forgotPassword(body.email());
        // Always 200 — never reveal whether the email exists
        return ResponseEntity.ok(Map.of("message", "If that email is registered, a reset link has been sent."));
    }

    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody ResetPasswordRequest body
    ) {
        authService.resetPassword(body.token(), body.newPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    // ── Request body records ──────────────────────────────────────────────────

    record RegisterRequest(String email, String password) {}
    record LoginRequest(String email, String password) {}
    record ForgotPasswordRequest(String email) {}
    record ResetPasswordRequest(String token, String newPassword) {}
}
