package com.maktabah.repository;

import com.maktabah.model.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldRepository extends JpaRepository<Field, Long> {

    List<Field> findByParentFieldIsNull();

    List<Field> findByParentFieldId(Long parentFieldId);
}
