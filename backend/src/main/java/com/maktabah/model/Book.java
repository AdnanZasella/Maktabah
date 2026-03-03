package com.maktabah.model;

import jakarta.persistence.*;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @Column(nullable = false, length = 50)
    private String level;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "author_bio", columnDefinition = "TEXT")
    private String authorBio;

    @Column(name = "pdf_filename", nullable = false, length = 500)
    private String pdfFilename;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public Field getField() { return field; }
    public void setField(Field field) { this.field = field; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAuthorBio() { return authorBio; }
    public void setAuthorBio(String authorBio) { this.authorBio = authorBio; }

    public String getPdfFilename() { return pdfFilename; }
    public void setPdfFilename(String pdfFilename) { this.pdfFilename = pdfFilename; }
}
