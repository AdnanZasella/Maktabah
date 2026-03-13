package com.maktabah.service;

import com.maktabah.dto.AdminUserDTO;
import com.maktabah.dto.BookDTO;
import com.maktabah.dto.MadhabOpinionDTO;
import com.maktabah.dto.MasalahDTO;
import com.maktabah.dto.RoadmapStepDTO;
import com.maktabah.exception.ResourceNotFoundException;
import com.maktabah.model.Book;
import com.maktabah.model.Field;
import com.maktabah.model.MadhabOpinion;
import com.maktabah.model.Masalah;
import com.maktabah.model.RoadmapStep;
import com.maktabah.model.User;
import com.maktabah.repository.BookRepository;
import com.maktabah.repository.FieldRepository;
import com.maktabah.repository.MadhabOpinionRepository;
import com.maktabah.repository.MasalahRepository;
import com.maktabah.repository.RoadmapStepRepository;
import com.maktabah.repository.UserProgressRepository;
import com.maktabah.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;

@Service
public class AdminService {

    private static final Set<String> VALID_MADHABS = Set.of("Hanafi", "Maliki", "Shafi'i", "Hanbali");

    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;
    private final BookRepository bookRepository;
    private final FieldRepository fieldRepository;
    private final MasalahRepository masalahRepository;
    private final MadhabOpinionRepository madhabOpinionRepository;
    private final RoadmapStepRepository roadmapStepRepository;

    @Value("${app.pdf.storage.path}")
    private String pdfStoragePath;

    public AdminService(UserRepository userRepository,
                        UserProgressRepository userProgressRepository,
                        BookRepository bookRepository,
                        FieldRepository fieldRepository,
                        MasalahRepository masalahRepository,
                        MadhabOpinionRepository madhabOpinionRepository,
                        RoadmapStepRepository roadmapStepRepository) {
        this.userRepository = userRepository;
        this.userProgressRepository = userProgressRepository;
        this.bookRepository = bookRepository;
        this.fieldRepository = fieldRepository;
        this.masalahRepository = masalahRepository;
        this.madhabOpinionRepository = madhabOpinionRepository;
        this.roadmapStepRepository = roadmapStepRepository;
    }

    // ── Users ────────────────────────────────────────────────────────────────

    public List<AdminUserDTO> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> new AdminUserDTO(u.getId(), u.getEmail(), u.getRole(),
                        u.getSubscriptionStatus(), u.getCreatedAt()))
                .toList();
    }

    public void updateSubscription(Long userId, String subscriptionStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setSubscriptionStatus(subscriptionStatus);
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userProgressRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }

    // ── Books ─────────────────────────────────────────────────────────────────

    public List<BookDTO> getAllBooks() {
        return bookRepository.findAll()
                .stream()
                .map(this::toBookDTO)
                .toList();
    }

    public BookDTO addBook(String title, String author, Long fieldId, String level,
                           String description, String authorBio, MultipartFile file) throws IOException {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found"));

        String pdfFilename = "";
        if (file != null && !file.isEmpty()) {
            validatePdfMagicBytes(file);
            String subfolder = getTopLevelFieldName(field);
            String filename = toKebabCase(title) + ".pdf";
            pdfFilename = subfolder + "/" + filename;
            Path targetDir = Paths.get(pdfStoragePath, subfolder);
            Files.createDirectories(targetDir);
            Files.write(targetDir.resolve(filename), file.getBytes());
        }

        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setField(field);
        book.setLevel(level);
        book.setDescription(description);
        book.setAuthorBio(authorBio);
        book.setPdfFilename(pdfFilename);

        return toBookDTO(bookRepository.save(book));
    }

    public BookDTO updateBook(Long id, String title, String author, Long fieldId,
                              String level, String description, String authorBio,
                              MultipartFile file) throws IOException {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found"));

        book.setTitle(title);
        book.setAuthor(author);
        book.setField(field);
        book.setLevel(level);
        book.setDescription(description);
        book.setAuthorBio(authorBio);

        if (file != null && !file.isEmpty()) {
            validatePdfMagicBytes(file);
            String subfolder = getTopLevelFieldName(field);
            String filename = toKebabCase(title) + ".pdf";
            Path targetDir = Paths.get(pdfStoragePath, subfolder);
            Files.createDirectories(targetDir);
            Files.write(targetDir.resolve(filename), file.getBytes());
            book.setPdfFilename(subfolder + "/" + filename);
        }

        return toBookDTO(bookRepository.save(book));
    }

    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        Path filePath = Paths.get(pdfStoragePath).resolve(book.getPdfFilename()).normalize();
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but do not block deletion of the DB record
        }

        bookRepository.delete(book);
    }

    // ── Masail ────────────────────────────────────────────────────────────────

    public List<MasalahDTO> getAllMasail() {
        return masalahRepository.findAll()
                .stream()
                .map(m -> {
                    List<MadhabOpinionDTO> opinions = madhabOpinionRepository.findByMasalahId(m.getId())
                            .stream().map(this::toOpinionDTO).toList();
                    return toMasalahDTO(m, opinions);
                })
                .toList();
    }

    public MasalahDTO addMasalah(MasalahDTO request) {
        Masalah masalah = new Masalah();
        masalah.setTitle(request.getTitle());
        masalah.setArabicTerm(request.getArabicTerm());
        masalah.setCategory(request.getCategory());
        masalah.setDescription(request.getDescription());
        masalah.setVerified(false);
        Masalah saved = masalahRepository.save(masalah);

        if (request.getOpinions() != null) {
            for (MadhabOpinionDTO dto : request.getOpinions()) {
                saveOpinion(saved, dto);
            }
        }

        List<MadhabOpinionDTO> opinions = madhabOpinionRepository.findByMasalahId(saved.getId())
                .stream().map(this::toOpinionDTO).toList();
        return toMasalahDTO(saved, opinions);
    }

    public MasalahDTO updateMasalah(Long id, MasalahDTO request) {
        Masalah masalah = masalahRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masalah not found"));

        masalah.setTitle(request.getTitle());
        masalah.setArabicTerm(request.getArabicTerm());
        masalah.setCategory(request.getCategory());
        masalah.setDescription(request.getDescription());
        masalahRepository.save(masalah);

        madhabOpinionRepository.deleteByMasalahId(id);

        if (request.getOpinions() != null) {
            for (MadhabOpinionDTO dto : request.getOpinions()) {
                saveOpinion(masalah, dto);
            }
        }

        List<MadhabOpinionDTO> opinions = madhabOpinionRepository.findByMasalahId(id)
                .stream().map(this::toOpinionDTO).toList();
        return toMasalahDTO(masalah, opinions);
    }

    public void verifyMasalah(Long id) {
        Masalah masalah = masalahRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masalah not found"));

        List<MadhabOpinion> opinions = madhabOpinionRepository.findByMasalahId(id);
        Set<String> presentMadhabs = new java.util.HashSet<>();
        for (MadhabOpinion o : opinions) {
            presentMadhabs.add(o.getMadhab());
        }

        if (!presentMadhabs.containsAll(VALID_MADHABS)) {
            throw new IllegalStateException("All four madhab opinions must be present before verifying");
        }

        masalah.setVerified(true);
        masalahRepository.save(masalah);
    }

    public void deleteMasalah(Long id) {
        Masalah masalah = masalahRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masalah not found"));
        madhabOpinionRepository.deleteByMasalahId(id);
        masalahRepository.delete(masalah);
    }

    // ── Roadmap Steps ─────────────────────────────────────────────────────────────

    public List<RoadmapStepDTO> getAllRoadmapSteps() {
        return roadmapStepRepository.findAllOrdered()
                .stream()
                .map(this::toRoadmapStepDTO)
                .toList();
    }

    public RoadmapStepDTO addRoadmapStep(Long fieldId, Long bookId, String level,
                                          Integer stepOrder, String description) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        RoadmapStep step = new RoadmapStep();
        step.setField(field);
        step.setBook(book);
        step.setLevel(level);
        step.setStepOrder(stepOrder);
        step.setDescription(description);

        return toRoadmapStepDTO(roadmapStepRepository.save(step));
    }

    public RoadmapStepDTO updateRoadmapStep(Long id, Long fieldId, Long bookId, String level,
                                             Integer stepOrder, String description) {
        RoadmapStep step = roadmapStepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap step not found"));

        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        step.setField(field);
        step.setBook(book);
        step.setLevel(level);
        step.setStepOrder(stepOrder);
        step.setDescription(description);

        return toRoadmapStepDTO(roadmapStepRepository.save(step));
    }

    public void deleteRoadmapStep(Long id) {
        RoadmapStep step = roadmapStepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap step not found"));
        roadmapStepRepository.delete(step);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validatePdfMagicBytes(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            if (is.read(header) < 4) {
                throw new IllegalArgumentException("File is too small to be a valid PDF");
            }
            // PDF magic bytes: %PDF → 0x25 0x50 0x44 0x46
            if (header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) {
                throw new IllegalArgumentException("File is not a valid PDF");
            }
        }
    }

    private String getTopLevelFieldName(Field field) {
        Field top = field;
        while (top.getParentField() != null) {
            top = top.getParentField();
        }
        return top.getName().toLowerCase().replaceAll("\\s+", "-");
    }

    private String toKebabCase(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }

    private void saveOpinion(Masalah masalah, MadhabOpinionDTO dto) {
        MadhabOpinion opinion = new MadhabOpinion();
        opinion.setMasalah(masalah);
        opinion.setMadhab(dto.getMadhab());
        opinion.setOpinion(dto.getOpinion());
        opinion.setEvidence(dto.getEvidence());
        opinion.setSourceBook(dto.getSourceBook());
        opinion.setSourcePage(dto.getSourcePage());
        madhabOpinionRepository.save(opinion);
    }

    private RoadmapStepDTO toRoadmapStepDTO(RoadmapStep step) {
        RoadmapStepDTO dto = new RoadmapStepDTO(
                step.getId(),
                step.getField().getId(),
                step.getBook().getId(),
                step.getBook().getTitle(),
                step.getBook().getAuthor(),
                step.getBook().getPdfFilename(),
                step.getLevel(),
                step.getStepOrder(),
                step.getDescription()
        );
        dto.setFieldName(step.getField().getName());
        return dto;
    }

    private BookDTO toBookDTO(Book book) {
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

    private MasalahDTO toMasalahDTO(Masalah masalah, List<MadhabOpinionDTO> opinions) {
        return new MasalahDTO(
                masalah.getId(),
                masalah.getTitle(),
                masalah.getArabicTerm(),
                masalah.getCategory(),
                masalah.getDescription(),
                masalah.getVerified(),
                opinions
        );
    }

    private MadhabOpinionDTO toOpinionDTO(MadhabOpinion o) {
        return new MadhabOpinionDTO(
                o.getId(),
                o.getMasalah().getId(),
                o.getMadhab(),
                o.getOpinion(),
                o.getEvidence(),
                o.getSourceBook(),
                o.getSourcePage()
        );
    }
}
