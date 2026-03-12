package com.maktabah.dto;

import java.util.List;

public class MasalahDTO {

    private Long id;
    private String title;
    private String arabicTerm;
    private String category;
    private String description;
    private Boolean verified;
    private List<MadhabOpinionDTO> opinions;

    public MasalahDTO() {}

    public MasalahDTO(Long id, String title, String arabicTerm, String category,
                      String description, Boolean verified, List<MadhabOpinionDTO> opinions) {
        this.id = id;
        this.title = title;
        this.arabicTerm = arabicTerm;
        this.category = category;
        this.description = description;
        this.verified = verified;
        this.opinions = opinions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArabicTerm() { return arabicTerm; }
    public void setArabicTerm(String arabicTerm) { this.arabicTerm = arabicTerm; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public List<MadhabOpinionDTO> getOpinions() { return opinions; }
    public void setOpinions(List<MadhabOpinionDTO> opinions) { this.opinions = opinions; }
}
