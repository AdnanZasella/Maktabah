package com.maktabah.service;

import com.maktabah.exception.ResourceNotFoundException;
import com.maktabah.model.RoadmapStep;
import com.maktabah.model.User;
import com.maktabah.model.UserProgress;
import com.maktabah.repository.RoadmapStepRepository;
import com.maktabah.repository.UserProgressRepository;
import com.maktabah.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final RoadmapStepRepository roadmapStepRepository;
    private final UserRepository userRepository;

    public UserProgressService(
            UserProgressRepository userProgressRepository,
            RoadmapStepRepository roadmapStepRepository,
            UserRepository userRepository
    ) {
        this.userProgressRepository = userProgressRepository;
        this.roadmapStepRepository = roadmapStepRepository;
        this.userRepository = userRepository;
    }

    public List<Long> getCompletedStepIds(Long userId) {
        return userProgressRepository.findCompletedStepIdsByUserId(userId);
    }

    public void markStepComplete(Long userId, Long stepId) {
        RoadmapStep step = roadmapStepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap step not found"));

        Optional<UserProgress> existing = userProgressRepository.findByUserIdAndRoadmapStepId(userId, stepId);

        if (existing.isPresent()) {
            UserProgress progress = existing.get();
            if (progress.isCompleted()) {
                return; // Idempotent — already done
            }
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            userProgressRepository.save(progress);
        } else {
            // getReferenceById returns a JPA proxy — no DB hit, no transient entity error
            User userRef = userRepository.getReferenceById(userId);

            UserProgress progress = new UserProgress();
            progress.setUser(userRef);
            progress.setRoadmapStep(step);
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            userProgressRepository.save(progress);
        }
    }
}
