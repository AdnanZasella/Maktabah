package com.maktabah.repository;

import com.maktabah.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByFieldId(Long fieldId);

    List<Book> findByFieldIdAndLevel(Long fieldId, String level);
}
