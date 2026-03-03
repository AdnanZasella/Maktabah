package com.maktabah.dto;

public class FieldDTO {

    private Long id;
    private String name;
    private Long parentFieldId;

    public FieldDTO() {}

    public FieldDTO(Long id, String name, Long parentFieldId) {
        this.id = id;
        this.name = name;
        this.parentFieldId = parentFieldId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getParentFieldId() { return parentFieldId; }
    public void setParentFieldId(Long parentFieldId) { this.parentFieldId = parentFieldId; }
}
