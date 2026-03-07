package com.maktabah.service;

import com.maktabah.dto.BookDTO;
import com.maktabah.exception.ResourceNotFoundException;
import com.maktabah.model.Book;
import com.maktabah.repository.BookRepository;
import com.maktabah.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Value("${app.pdf.storage.path}")
    private String pdfStoragePath;

    public BookService(BookRepository bookRepository, UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public boolean isUserPaid(Long userId) {
        return userRepository.findById(userId)
                .map(u -> "paid".equals(u.getSubscriptionStatus()))
                .orElse(false);
    }

    public List<BookDTO> getBooksByField(Long fieldId, String level) {
        List<Book> books;
        if (level != null && !level.isBlank()) {
            books = bookRepository.findByFieldIdAndLevel(fieldId, level);
        } else {
            books = bookRepository.findByFieldId(fieldId);
        }
        return books.stream().map(this::toDTO).toList();
    }

    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return toDTO(book);
    }

    public Resource getBookFile(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        try {
            Path filePath = Paths.get(pdfStoragePath).resolve(book.getPdfFilename()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Book file not found");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Book file not found");
        }
    }

    private BookDTO toDTO(Book book) {
        return new BookDTO(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getField().getId(),
                book.getLevel(),
                book.getDescription(),
                book.getAuthorBio(),
                book.getPdfFilename()
        );
    }
}
