package com.maktabah.service;

import com.maktabah.dto.MadhabOpinionDTO;
import com.maktabah.dto.MasalahDTO;
import com.maktabah.exception.ResourceNotFoundException;
import com.maktabah.model.MadhabOpinion;
import com.maktabah.model.Masalah;
import com.maktabah.repository.MadhabOpinionRepository;
import com.maktabah.repository.MasalahRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ScholarService {

    private static final Set<String> VALID_MADHABS = Set.of("Hanafi", "Maliki", "Shafi'i", "Hanbali");

    private final MasalahRepository masalahRepository;
    private final MadhabOpinionRepository madhabOpinionRepository;

    public ScholarService(MasalahRepository masalahRepository,
                          MadhabOpinionRepository madhabOpinionRepository) {
        this.masalahRepository = masalahRepository;
        this.madhabOpinionRepository = madhabOpinionRepository;
    }

    // ── List ──────────────────────────────────────────────────────────────────

    public List<MasalahDTO> getAllMasail() {
        return masalahRepository.findAll()
                .stream()
                .map(m -> {
                    List<MadhabOpinionDTO> opinions = madhabOpinionRepository.findByMasalahId(m.getId())
                            .stream().map(this::toOpinionDTO).toList();
                    return toMasalahDTO(m, opinions);
                })
                .toList();
    }

    // ── Add ───────────────────────────────────────────────────────────────────

    public MasalahDTO addMasalah(MasalahDTO request) {
        Masalah masalah = new Masalah();
        masalah.setTitle(request.getTitle());
        masalah.setArabicTerm(request.getArabicTerm());
        masalah.setCategory(request.getCategory());
        masalah.setDescription(request.getDescription());
        masalah.setVerified(false);
        Masalah saved = masalahRepository.save(masalah);

        if (request.getOpinions() != null) {
            for (MadhabOpinionDTO dto : request.getOpinions()) {
                saveOpinion(saved, dto);
            }
        }

        List<MadhabOpinionDTO> opinions = madhabOpinionRepository.findByMasalahId(saved.getId())
                .stream().map(this::toOpinionDTO).toList();
        return toMasalahDTO(saved, opinions);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public MasalahDTO updateMasalah(Long id, MasalahDTO request) {
        Masalah masalah = masalahRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masalah not found"));

        masalah.setTitle(request.getTitle());
        masalah.setArabicTerm(request.getArabicTerm());
        masalah.setCategory(request.getCategory());
        masalah.setDescription(request.getDescription());
        masalahRepository.save(masalah);

        madhabOpinionRepository.deleteByMasalahId(id);

        if (request.getOpinions() != null) {
            for (MadhabOpinionDTO dto : request.getOpinions()) {
                saveOpinion(masalah, dto);
            }
        }

        List<MadhabOpinionDTO> opinions = madhabOpinionRepository.findByMasalahId(id)
                .stream().map(this::toOpinionDTO).toList();
        return toMasalahDTO(masalah, opinions);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void deleteMasalah(Long id) {
        Masalah masalah = masalahRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masalah not found"));
        madhabOpinionRepository.deleteByMasalahId(id);
        masalahRepository.delete(masalah);
    }

    // ── Verify ────────────────────────────────────────────────────────────────

    public void verifyMasalah(Long id) {
        Masalah masalah = masalahRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masalah not found"));

        List<MadhabOpinion> opinions = madhabOpinionRepository.findByMasalahId(id);
        Set<String> presentMadhabs = new HashSet<>();
        for (MadhabOpinion o : opinions) {
            presentMadhabs.add(o.getMadhab());
        }

        if (!presentMadhabs.containsAll(VALID_MADHABS)) {
            throw new IllegalStateException("All four madhab opinions must be present before verifying");
        }

        masalah.setVerified(true);
        masalahRepository.save(masalah);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void saveOpinion(Masalah masalah, MadhabOpinionDTO dto) {
        MadhabOpinion opinion = new MadhabOpinion();
        opinion.setMasalah(masalah);
        opinion.setMadhab(dto.getMadhab());
        opinion.setOpinion(dto.getOpinion());
        opinion.setEvidence(dto.getEvidence());
        opinion.setSourceBook(dto.getSourceBook());
        opinion.setSourcePage(dto.getSourcePage());
        madhabOpinionRepository.save(opinion);
    }

    private MasalahDTO toMasalahDTO(Masalah masalah, List<MadhabOpinionDTO> opinions) {
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

    private MadhabOpinionDTO toOpinionDTO(MadhabOpinion o) {
        return new MadhabOpinionDTO(
                o.getId(),
                o.getMasalah().getId(),
                o.getMadhab(),
                o.getOpinion(),
                o.getEvidence(),
                o.getSourceBook(),
                o.getSourcePage()
        );
    }
}
