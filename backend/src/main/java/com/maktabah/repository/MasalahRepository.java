package com.maktabah.repository;

import com.maktabah.model.Masalah;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasalahRepository extends JpaRepository<Masalah, Long> {

    List<Masalah> findByVerifiedTrue();

    List<Masalah> findByVerifiedTrueAndCategory(String category);

    List<Masalah> findByVerifiedTrueAndTitleContainingIgnoreCase(String title);
}
