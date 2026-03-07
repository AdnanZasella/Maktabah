package com.maktabah.repository;

import com.maktabah.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    @Query("SELECT up.roadmapStep.id FROM UserProgress up WHERE up.user.id = :userId AND up.completed = true")
    List<Long> findCompletedStepIdsByUserId(@Param("userId") Long userId);

    Optional<UserProgress> findByUserIdAndRoadmapStepId(Long userId, Long roadmapStepId);

    @Transactional
    void deleteByUserId(Long userId);
}
