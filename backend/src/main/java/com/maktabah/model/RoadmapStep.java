package com.maktabah.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "roadmap_steps",
    uniqueConstraints = @UniqueConstraint(columnNames = {"field_id", "level", "step_order"})
)
public class RoadmapStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, length = 50)
    private String level;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Field getField() { return field; }
    public void setField(Field field) { this.field = field; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
