package com.maktabah.dto;

import java.time.LocalDateTime;

public class AdminUserDTO {

    private Long id;
    private String email;
    private String role;
    private String subscriptionStatus;
    private LocalDateTime createdAt;

    public AdminUserDTO(Long id, String email, String role, String subscriptionStatus, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.subscriptionStatus = subscriptionStatus;
        this.createdAt = createdAt;
    }


    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getSubscriptionStatus() { return subscriptionStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
