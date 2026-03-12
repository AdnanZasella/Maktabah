package com.maktabah.service;

import com.maktabah.dto.MadhabOpinionDTO;
import com.maktabah.dto.MasalahDTO;
import com.maktabah.exception.ResourceNotFoundException;
import com.maktabah.model.MadhabOpinion;
import com.maktabah.model.Masalah;
import com.maktabah.repository.MadhabOpinionRepository;
import com.maktabah.repository.MasalahRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MasalahService {

    private final MasalahRepository masalahRepository;
    private final MadhabOpinionRepository madhabOpinionRepository;

    public MasalahService(MasalahRepository masalahRepository,
                          MadhabOpinionRepository madhabOpinionRepository) {
        this.masalahRepository = masalahRepository;
        this.madhabOpinionRepository = madhabOpinionRepository;
    }

    public List<String> getCategories() {
        return List.of(
            "Taharah", "Salah", "Zakat", "Sawm", "Hajj",
            "Nikah", "Buyoo'", "Food and Drink", "Dress and Appearance"
        );
    }

    public List<MasalahDTO> getMasailByCategory(String category) {
        return masalahRepository.findByVerifiedTrueAndCategory(category)
                .stream()
                .map(this::toListDTO)
                .toList();
    }

    public List<MasalahDTO> searchMasail(String query) {
        return masalahRepository.findByVerifiedTrueAndTitleContainingIgnoreCase(query)
                .stream()
                .map(this::toListDTO)
                .toList();
    }

    public MasalahDTO getMasalahById(Long id) {
        Masalah masalah = masalahRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masalah not found"));

        if (!Boolean.TRUE.equals(masalah.getVerified())) {
            throw new ResourceNotFoundException("Masalah not found");
        }

        List<MadhabOpinionDTO> opinions = madhabOpinionRepository.findByMasalahId(id)
                .stream()
                .map(this::toOpinionDTO)
                .toList();

        return new MasalahDTO(
                masalah.getId(),
                masalah.getTitle(),
                masalah.getArabicTerm(),
                masalah.getCategory(),
                masalah.getDescription(),
                masalah.getVerified(),
                opinions
        );
    }

    private MasalahDTO toListDTO(Masalah masalah) {
        return new MasalahDTO(
                masalah.getId(),
                masalah.getTitle(),
                masalah.getArabicTerm(),
                masalah.getCategory(),
                masalah.getDescription(),
                masalah.getVerified(),
                null
        );
    }

    private MadhabOpinionDTO toOpinionDTO(MadhabOpinion opinion) {
        return new MadhabOpinionDTO(
                opinion.getId(),
                opinion.getMasalah().getId(),
                opinion.getMadhab(),
                opinion.getOpinion(),
                opinion.getEvidence(),
                opinion.getSourceBook(),
                opinion.getSourcePage()
        );
    }
}
