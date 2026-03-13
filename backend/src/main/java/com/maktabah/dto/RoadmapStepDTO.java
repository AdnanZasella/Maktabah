package com.maktabah.dto;

public class RoadmapStepDTO {

    private Long id;
    private Long fieldId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookPdfFilename;
    private String level;
    private Integer stepOrder;
    private String description;
    private String fieldName;

    public RoadmapStepDTO() {}

    public RoadmapStepDTO(Long id, Long fieldId, Long bookId, String bookTitle,
                          String bookAuthor, String bookPdfFilename,
                          String level, Integer stepOrder, String description) {
        this.id = id;
        this.fieldId = fieldId;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
        this.bookPdfFilename = bookPdfFilename;
        this.level = level;
        this.stepOrder = stepOrder;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFieldId() { return fieldId; }
    public void setFieldId(Long fieldId) { this.fieldId = fieldId; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public String getBookAuthor() { return bookAuthor; }
    public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }

    public String getBookPdfFilename() { return bookPdfFilename; }
    public void setBookPdfFilename(String bookPdfFilename) { this.bookPdfFilename = bookPdfFilename; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }
}
