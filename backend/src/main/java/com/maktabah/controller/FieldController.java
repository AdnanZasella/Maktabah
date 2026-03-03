package com.maktabah.controller;

import com.maktabah.dto.FieldDTO;
import com.maktabah.service.FieldService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fields")
public class FieldController {

    private final FieldService fieldService;

    public FieldController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    @GetMapping
    public ResponseEntity<List<FieldDTO>> getAllTopLevelFields() {
        return ResponseEntity.ok(fieldService.getAllTopLevelFields());
    }

    @GetMapping("/{id}/subfields")
    public ResponseEntity<List<FieldDTO>> getSubfields(@PathVariable Long id) {
        return ResponseEntity.ok(fieldService.getSubfields(id));
    }
}
