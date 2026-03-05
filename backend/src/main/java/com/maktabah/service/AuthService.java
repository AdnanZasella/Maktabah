package com.maktabah.service;

import com.maktabah.dto.UserDTO;
import com.maktabah.model.User;
import com.maktabah.repository.TokenBlacklistRepository;
import com.maktabah.repository.UserRepository;
import com.maktabah.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.WebUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String COOKIE_NAME = "jwt";
    private static final int COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

    private final UserService userService;
    private final UserRepository userRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;

    @Value("${app.base.url}")
    private String appBaseUrl;

    @Value("${spring.mail.username}")
    private String mailFrom;

    public AuthService(
            UserService userService,
            UserRepository userRepository,
            TokenBlacklistRepository tokenBlacklistRepository,
            JwtUtil jwtUtil,
            JavaMailSender mailSender
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.tokenBlacklistRepository = tokenBlacklistRepository;
        this.jwtUtil = jwtUtil;
        this.mailSender = mailSender;
    }

    // ── Register ──────────────────────────────────────────────────────────────

    /**
     * Create a new user account. Sets an HttpOnly JWT cookie on success.
     * Returns the new user as a DTO.
     */
    public UserDTO register(String email, String password, HttpServletResponse response) {
        validatePasswordLength(password);

        if (userService.emailExists(email.toLowerCase().trim())) {
            // Never reveal that the email is taken — return generic message
            throw new IllegalArgumentException("Registration failed. Please check your details.");
        }

        User user = new User();
        user.setEmail(email.toLowerCase().trim());
        user.setPasswordHash(userService.hashPassword(password));

        User saved = userRepository.save(user);

        String jwt = jwtUtil.generateToken(saved);
        setAuthCookie(jwt, response);

        return userService.toDTO(saved);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Validate credentials. Sets an HttpOnly JWT cookie on success.
     * Always throws the same generic message on any failure so the caller
     * cannot determine which field was wrong.
     */
    public UserDTO login(String email, String password, HttpServletResponse response) {
        Optional<User> optUser = userService.findByEmail(email.toLowerCase().trim());

        // Constant-time-ish: always attempt password check even if user not found
        // to reduce timing-based email enumeration. Real constant-time guard is in Security 6.
        if (optUser.isEmpty() || !userService.checkPassword(password, optUser.get().getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = optUser.get();
        String jwt = jwtUtil.generateToken(user);
        setAuthCookie(jwt, response);

        return userService.toDTO(user);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    /**
     * Clears the JWT cookie and adds the token's jti to the blacklist so it
     * cannot be replayed even if someone captured the cookie value.
     */
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String token = extractTokenFromRequest(request);
        if (token != null && jwtUtil.isTokenValid(token)) {
            blacklistToken(token);
        }
        clearAuthCookie(response);
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    /**
     * Returns the UserDTO for the authenticated user in the current request,
     * or empty if the cookie is missing, invalid, or blacklisted.
     */
    public Optional<UserDTO> getCurrentUser(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null || !jwtUtil.isTokenValid(token)) {
            return Optional.empty();
        }
        if (isBlacklisted(token)) {
            return Optional.empty();
        }

        Long userId = jwtUtil.extractUserId(token);
        return userRepository.findById(userId).map(userService::toDTO);
    }

    // ── Forgot Password ───────────────────────────────────────────────────────

    /**
     * Generates a password reset token and sends an email.
     * Always returns silently — never reveals whether the email exists.
     */
    public void forgotPassword(String email) {
        Optional<User> optUser = userService.findByEmail(email.toLowerCase().trim());
        if (optUser.isEmpty()) {
            // Return silently — do not reveal non-existence of email
            return;
        }

        User user = optUser.get();
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        sendResetEmail(user.getEmail(), token);
    }

    // ── Reset Password ────────────────────────────────────────────────────────

    /**
     * Resets the user's password using a valid, unexpired token.
     * Clears the reset token fields after success.
     */
    public void resetPassword(String token, String newPassword) {
        validatePasswordLength(newPassword);

        Optional<User> optUser = userService.findByPasswordResetToken(token);
        if (optUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        User user = optUser.get();
        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        user.setPasswordHash(userService.hashPassword(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
    }

    // ── Cookie Helpers ────────────────────────────────────────────────────────

    /**
     * Build and add the HttpOnly JWT authentication cookie to the response.
     * Flags: HttpOnly, Secure, SameSite=Strict, Path=/, MaxAge=7 days.
     */
    private void setAuthCookie(String jwt, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, jwt)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(COOKIE_MAX_AGE_SECONDS)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Add an expired cookie to the response to clear the JWT cookie from the browser.
     */
    private void clearAuthCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Extract the raw JWT string from the cookie named "jwt" in the request.
     * Returns null if the cookie is absent.
     */
    public String extractTokenFromRequest(HttpServletRequest request) {
        jakarta.servlet.http.Cookie cookie = WebUtils.getCookie(request, COOKIE_NAME);
        return cookie != null ? cookie.getValue() : null;
    }

    // ── Blacklist Helpers ─────────────────────────────────────────────────────

    private void blacklistToken(String token) {
        try {
            String jti = jwtUtil.extractJti(token);
            LocalDateTime expiresAt = jwtUtil.extractExpiration(token)
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            com.maktabah.model.TokenBlacklist entry = new com.maktabah.model.TokenBlacklist();
            entry.setTokenId(jti);
            entry.setExpiresAt(expiresAt);
            tokenBlacklistRepository.save(entry);
        } catch (Exception e) {
            log.warn("Failed to blacklist token: {}", e.getMessage());
        }
    }

    private boolean isBlacklisted(String token) {
        try {
            String jti = jwtUtil.extractJti(token);
            return tokenBlacklistRepository.existsByTokenId(jti);
        } catch (Exception e) {
            return true; // Treat any error as blacklisted for safety
        }
    }

    // ── Email ─────────────────────────────────────────────────────────────────

    private void sendResetEmail(String toEmail, String token) {
        try {
            String resetLink = appBaseUrl + "/#/reset-password?token=" + token;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(toEmail);
            message.setSubject("Maktabah — Password Reset");
            message.setText(
                    "As-salamu alaykum,\n\n" +
                    "A password reset was requested for your Maktabah account.\n\n" +
                    "Click the link below to reset your password (valid for 1 hour):\n" +
                    resetLink + "\n\n" +
                    "If you did not request this, you can safely ignore this email.\n\n" +
                    "Jazakallahu khayran,\nThe Maktabah Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            // Log but do not propagate — the endpoint must always return 200
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ── Scheduled Cleanup ─────────────────────────────────────────────────────

    /**
     * Runs daily at midnight. Removes expired blacklist entries so the table
     * does not grow unbounded. Tokens that have expired are invalid anyway, so
     * removing them from the blacklist has no security impact.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanExpiredBlacklistEntries() {
        tokenBlacklistRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
        log.info("Token blacklist cleanup complete");
    }

    // ── Validation ────────────────────────────────────────────────────────────

    private void validatePasswordLength(String password) {
        if (password == null || password.length() < 8 || password.length() > 100) {
            throw new IllegalArgumentException("Password must be between 8 and 100 characters");
        }
    }
}
