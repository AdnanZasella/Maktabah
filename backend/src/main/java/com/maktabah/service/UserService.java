package com.maktabah.service;

import com.maktabah.dto.UserDTO;
import com.maktabah.model.User;
import com.maktabah.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Hash a plaintext password with BCrypt strength 12.
     */
    public String hashPassword(String plaintext) {
        return passwordEncoder.encode(plaintext);
    }

    /**
     * Check a plaintext password against a stored BCrypt hash.
     */
    public boolean checkPassword(String plaintext, String hash) {
        return passwordEncoder.matches(plaintext, hash);
    }

    /**
     * Find a user by email — returns empty if not found.
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find a user by password reset token — returns empty if not found.
     */
    public Optional<User> findByPasswordResetToken(String token) {
        return userRepository.findByPasswordResetToken(token);
    }

    /**
     * Check if an email is already registered.
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Save a user entity and return its DTO.
     */
    public UserDTO save(User user) {
        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    /**
     * Save a user entity without converting to DTO — used internally when the
     * caller needs to keep working with the entity (e.g. after setting reset token).
     */
    public User saveEntity(User user) {
        return userRepository.save(user);
    }

    /**
     * Find a user by ID — returns empty if not found.
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Convert a User entity to a UserDTO. Never expose password hash.
     */
    public UserDTO toDTO(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getRole(), user.getSubscriptionStatus());
    }
}
