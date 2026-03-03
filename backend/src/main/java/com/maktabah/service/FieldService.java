package com.maktabah.service;

import com.maktabah.dto.FieldDTO;
import com.maktabah.exception.ResourceNotFoundException;
import com.maktabah.model.Field;
import com.maktabah.repository.FieldRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FieldService {

    private final FieldRepository fieldRepository;

    public FieldService(FieldRepository fieldRepository) {
        this.fieldRepository = fieldRepository;
    }

    public List<FieldDTO> getAllTopLevelFields() {
        return fieldRepository.findByParentFieldIsNull()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<FieldDTO> getSubfields(Long parentId) {
        if (!fieldRepository.existsById(parentId)) {
            throw new ResourceNotFoundException("Field not found with id: " + parentId);
        }
        return fieldRepository.findByParentFieldId(parentId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private FieldDTO toDTO(Field field) {
        Long parentId = field.getParentField() != null ? field.getParentField().getId() : null;
        return new FieldDTO(field.getId(), field.getName(), parentId);
    }
}
