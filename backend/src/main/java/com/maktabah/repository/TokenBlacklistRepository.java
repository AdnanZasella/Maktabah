package com.maktabah.repository;

import com.maktabah.model.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {

    boolean existsByTokenId(String tokenId);

    void deleteAllByExpiresAtBefore(LocalDateTime cutoff);
}
