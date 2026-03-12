package com.maktabah.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "masail")
public class Masalah {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "arabic_term", length = 255)
    private String arabicTerm;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean verified = false;

    @OneToMany(mappedBy = "masalah", fetch = FetchType.LAZY)
    private List<MadhabOpinion> opinions;

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

    public List<MadhabOpinion> getOpinions() { return opinions; }
    public void setOpinions(List<MadhabOpinion> opinions) { this.opinions = opinions; }
}
