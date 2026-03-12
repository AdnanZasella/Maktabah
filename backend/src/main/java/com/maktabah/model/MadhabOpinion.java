package com.maktabah.model;

import jakarta.persistence.*;

@Entity
@Table(name = "madhab_opinions")
public class MadhabOpinion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "masalah_id", nullable = false)
    private Masalah masalah;

    @Column(nullable = false, length = 50,
            columnDefinition = "VARCHAR(50) CHECK (madhab IN ('Hanafi','Maliki','Shafi''i','Hanbali'))")
    private String madhab;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String opinion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String evidence;

    @Column(name = "source_book", length = 255)
    private String sourceBook;

    @Column(name = "source_page", length = 50)
    private String sourcePage;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Masalah getMasalah() { return masalah; }
    public void setMasalah(Masalah masalah) { this.masalah = masalah; }

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
