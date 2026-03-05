package com.maktabah.security;

import com.maktabah.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration.days}") int expirationDays
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = (long) expirationDays * 24 * 60 * 60 * 1000;
    }

    /**
     * Generate a signed JWT for the given user.
     * Claims: userId, email, role, subscriptionStatus, jti (UUID).
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())           // jti claim
                .subject(String.valueOf(user.getId()))      // userId as subject
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .claim("subscriptionStatus", user.getSubscriptionStatus())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Validate token signature and expiry. Does NOT check blacklist — that is
     * done separately in JwtAuthFilter so the blacklist check is explicit.
     * Returns true if the token is structurally valid and not expired.
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extract the jti (unique token ID) claim — used for blacklist lookup.
     */
    public String extractJti(String token) {
        return parseClaims(token).getId();
    }

    /**
     * Extract the userId (subject claim).
     */
    public Long extractUserId(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    /**
     * Extract the email claim.
     */
    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    /**
     * Extract the role claim.
     */
    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /**
     * Extract the subscriptionStatus claim.
     */
    public String extractSubscriptionStatus(String token) {
        return parseClaims(token).get("subscriptionStatus", String.class);
    }

    /**
     * Extract the expiration date — used when adding a token to the blacklist
     * so the blacklist row carries the same TTL as the token itself.
     */
    public Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
