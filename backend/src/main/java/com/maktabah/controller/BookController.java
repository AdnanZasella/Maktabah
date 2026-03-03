package com.maktabah.controller;

import com.maktabah.dto.BookDTO;
import com.maktabah.service.BookService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public ResponseEntity<List<BookDTO>> getBooks(
            @RequestParam Long fieldId,
            @RequestParam(required = false) String level) {
        return ResponseEntity.ok(bookService.getBooksByField(fieldId, level));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadBook(@PathVariable Long id) {
        Resource resource = bookService.getBookFile(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
