package com.maktabah.dto;

public class BookDTO {

    private Long id;
    private String title;
    private String author;
    private Long fieldId;
    private String level;
    private String description;
    private String authorBio;
    private String pdfFilename;

    public BookDTO() {}

    public BookDTO(Long id, String title, String author, Long fieldId,
                   String level, String description, String authorBio, String pdfFilename) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.fieldId = fieldId;
        this.level = level;
        this.description = description;
        this.authorBio = authorBio;
        this.pdfFilename = pdfFilename;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public Long getFieldId() { return fieldId; }
    public void setFieldId(Long fieldId) { this.fieldId = fieldId; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAuthorBio() { return authorBio; }
    public void setAuthorBio(String authorBio) { this.authorBio = authorBio; }

    public String getPdfFilename() { return pdfFilename; }
    public void setPdfFilename(String pdfFilename) { this.pdfFilename = pdfFilename; }
}
