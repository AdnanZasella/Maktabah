package com.maktabah.dto;

public class MadhabOpinionDTO {

    private Long id;
    private Long masalahId;
    private String madhab;
    private String opinion;
    private String evidence;
    private String sourceBook;
    private String sourcePage;

    public MadhabOpinionDTO() {}

    public MadhabOpinionDTO(Long id, Long masalahId, String madhab, String opinion,
                            String evidence, String sourceBook, String sourcePage) {
        this.id = id;
        this.masalahId = masalahId;
        this.madhab = madhab;
        this.opinion = opinion;
        this.evidence = evidence;
        this.sourceBook = sourceBook;
        this.sourcePage = sourcePage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMasalahId() { return masalahId; }
    public void setMasalahId(Long masalahId) { this.masalahId = masalahId; }

    public String getMadhab() { return madhab; }
    public void setMadhab(String madhab) { this.madhab = madhab; }

    public String getOpinion() { return opinion; }
    public void setOpinion(String opinion) { this.opinion = opinion; }

    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }

    public String getSourceBook() { return sourceBook; }
    public void setSourceBook(String sourceBook) { this.sourceBook = sourceBook; }

    public String getSourcePage() { return sourcePage; }
    public void setSourcePage(String sourcePage) { this.sourcePage = sourcePage; }
}
