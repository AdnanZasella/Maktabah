CLAUDE.md — Maktabah Project Bible
Read this entire file before doing anything. This is the single source of truth for the Maktabah project. Never make assumptions — if something is not in this file, ask before proceeding.

Claude must always prioritize data integrity over convenience, security over speed, and explicit design over inferred behavior.

1. What Is Maktabah
   Maktabah (Arabic: مَكْتَبَة — meaning "library") is a web-based Islamic knowledge platform for Muslim students of knowledge at all levels — beginner, intermediate, and advanced. It solves a real problem that currently has no good solution: there is no clean, modern, well-organized platform in the English-speaking world that combines a verified Islamic book library, structured learning roadmaps, and a scholarly-backed fiqh comparison tool in one place.
   The platform is backed by real imams who verify all fiqh rulings before they go live. The developer has a large existing collection of Islamic PDF books ready to upload. These two things are the biggest advantages this project has over anything that currently exists.

2. The Three Core Features
   Feature 1 — Islamic Book Library
   The main feature. Users browse books organized by Islamic field and subfield, filter by knowledge level, and download PDF books directly.
   Fields and their subfields:
   Aqeedah → Ruboobiyah, Ulohiyyah, Al-Asma wa Sifat
   Fiqh → Hanafi, Maliki, Shafi'i, Hanbali
   Hadith → Mustalah al-Hadith, Sharh of major collections
   Seerah → Prophet's life, Companions, Islamic history
   Each book has: title, author, field, subfield, level (beginner / intermediate / advanced), short description, and a downloadable PDF file.
Feature 2 — Learning Roadmap
   A guided structured learning path for students who do not know where to start. The user selects their level and field and the platform shows them exactly which books to read in which order with a step number, book details, and a short explanation of why this book comes at this point in the journey. Users mark steps as complete and their progress is saved to their account.
   Feature 3 — Fiqh Comparison Tool (Khilaf Tool)
   The most unique feature on the platform. Users search or browse a masalah (a specific fiqh issue) and see all four madhabs positions side by side with their evidence (daleel) and source book references. All content is verified by the imams involved in the project before going live.
   Example masalah result:
   Masalah: Going down into sujood — hands or knees first?
   Hanafi: Knees first — Evidence: Hadith of Wail ibn Hujr — Source: [book, page]
   Maliki: Hands first — Evidence: Hadith of Abu Hurairah — Source: [book, page]
   Shafi'i: Hands first — Evidence: [daleel] — Source: [book, page]
   Hanbali: Knees first — Evidence: [daleel] — Source: [book, page]
   Fiqh categories: Taharah, Salah, Zakat, Sawm, Hajj, Nikah, Buyoo', Food and Drink, Dress and Appearance.
   CRITICAL RULE: No fiqh ruling goes live without imam verification. Ever. No exceptions.

3. Target Users
   Beginner: A Muslim who wants to start learning Islam properly but has no idea where to begin
   Intermediate: A student already studying who wants organized access to specific books and fields
   Advanced: A serious student who wants a comprehensive library and reliable fiqh reference

4. Technology Stack and Versions
   These exact versions must be used. Do not upgrade or change versions without being told to.
   Layer
   Technology
   Version
   Language
   Java
   Java 21
   Backend framework
   Spring Boot
   3.5.1
   Database ORM
   Spring Data JPA with Hibernate
   included in Spring Boot 3.5.1
   Database
   PostgreSQL
   18
   JWT library
   jjwt by io.jsonwebtoken
   0.12.x
   Frontend
   HTML, CSS, vanilla JavaScript
   ES6+
   Frontend build tool
   Vite
   5.x
   Payments
   Stripe Java SDK
   24.x
   Rate limiting
   Bucket4j
   8.x
   Connection pool
   HikariCP
   included in Spring Boot 3.5.1
   Mobile (future)
   React Native
   after website is complete

Required pom.xml Dependencies
Always include exactly these dependencies — no more, no less unless a step specifically requires adding one:
xml
<!-- Spring Boot Starters -->
<dependency>spring-boot-starter-web</dependency>
<dependency>spring-boot-starter-data-jpa</dependency>
<dependency>spring-boot-starter-security</dependency>
<dependency>spring-boot-starter-validation</dependency>
<dependency>spring-boot-starter-mail</dependency>
<dependency>spring-boot-devtools</dependency>

<!-- Database -->
<dependency>postgresql (runtime scope)</dependency>

<!-- JWT — io.jsonwebtoken jjwt 0.12.x requires all three -->
<dependency>jjwt-api 0.12.x</dependency>
<dependency>jjwt-impl 0.12.x (runtime scope)</dependency>
<dependency>jjwt-jackson 0.12.x (runtime scope)</dependency>

<!-- Stripe -->
<dependency>stripe-java 24.x</dependency>

<!-- Rate limiting — added in security phase only -->
<dependency>bucket4j-core 8.x</dependency>

5. Project Folder Structure
   Every file has a specific home. Never put files in the wrong place. Never create files not listed here unless a step specifically requires it.
   Maktabah/
   │
   ├── CLAUDE.md
   │
   ├── backend/
   │   └── src/
   │       └── main/
   │           ├── java/
   │           │   └── com/maktabah/
   │           │       ├── model/
   │           │       │   ├── Book.java
   │           │       │   ├── Field.java
   │           │       │   ├── RoadmapStep.java
   │           │       │   ├── Masalah.java
   │           │       │   ├── MadhabOpinion.java
   │           │       │   ├── User.java
   │           │       │   ├── UserProgress.java
   │           │       │   └── TokenBlacklist.java
   │           │       ├── dto/
   │           │       │   ├── BookDTO.java
   │           │       │   ├── FieldDTO.java
   │           │       │   ├── RoadmapStepDTO.java
   │           │       │   ├── MasalahDTO.java
   │           │       │   └── UserDTO.java
   │           │       ├── repository/
   │           │       │   ├── BookRepository.java
   │           │       │   ├── FieldRepository.java
   │           │       │   ├── RoadmapStepRepository.java
   │           │       │   ├── MasalahRepository.java
   │           │       │   ├── MadhabOpinionRepository.java
   │           │       │   ├── UserRepository.java
   │           │       │   ├── UserProgressRepository.java
   │           │       │   └── TokenBlacklistRepository.java
   │           │       ├── service/
   │           │       │   ├── BookService.java
   │           │       │   ├── FieldService.java
   │           │       │   ├── RoadmapService.java
   │           │       │   ├── MasalahService.java
   │           │       │   ├── UserService.java
   │           │       │   ├── UserProgressService.java
   │           │       │   └── PaymentService.java
   │           │       ├── controller/
   │           │       │   ├── BookController.java
   │           │       │   ├── FieldController.java
   │           │       │   ├── RoadmapController.java
   │           │       │   ├── MasalahController.java
   │           │       │   ├── AuthController.java
   │           │       │   ├── UserProgressController.java
   │           │       │   ├── PaymentController.java
   │           │       │   └── AdminController.java
   │           │       ├── security/
   │           │       │   ├── JwtUtil.java
   │           │       │   ├── JwtAuthFilter.java
   │           │       │   └── SecurityConfig.java
   │           │       ├── exception/
   │           │       │   ├── GlobalExceptionHandler.java
   │           │       │   └── ResourceNotFoundException.java
   │           │       └── MaktabahApplication.java
   │           └── resources/
   │               └── application.properties
   │
   ├── frontend/
   │   ├── index.html
   │   ├── vite.config.js
   │   ├── package.json
   │   └── src/
   │       ├── pages/
   │       │   ├── library.js       ← book library page
   │       │   ├── roadmap.js       ← learning roadmap page
   │       │   ├── fiqhtool.js      ← fiqh comparison tool page
   │       │   ├── login.js         ← login page
   │       │   ├── register.js      ← register page
   │       │   └── account.js       ← account and subscription page
   │       ├── components/
   │       │   ├── navbar.js        ← top navigation bar
   │       │   ├── bookcard.js      ← individual book card component
   │       │   ├── fieldcard.js     ← field/subfield card component
   │       │   ├── roadmapstep.js   ← single roadmap step component
   │       │   └── madhabcard.js    ← single madhab opinion card
   │       ├── api.js               ← ALL fetch() calls live here and only here
   │       ├── auth.js              ← login state, current user, auth helpers
   │       └── main.js              ← app entry point and client-side routing
   │
   └── pdfs/
   ├── aqeedah/
   ├── fiqh/
   ├── hadith/
   └── seerah/

6. The Four Layers — Rules That Never Change
   Model (model/)
   Java classes that map directly to database tables using JPA annotations
   Contains only fields, getters, setters, and JPA annotations
   Zero business logic allowed here
   DTO (dto/)
   Plain Java classes with no JPA annotations — just fields, getters, and setters
   Used to transfer data between the service layer and the controller layer
   Services ALWAYS convert JPA entities to DTOs before returning them
   Never return a raw JPA entity from any service method — this prevents Jackson infinite loop errors caused by bidirectional JPA relationships
   Naming convention: entity name + DTO suffix — BookDTO, FieldDTO, MasalahDTO etc.
   Repository (repository/)
   JPA interfaces that extend JpaRepository<Entity, Long>
   All database access goes through here and only here
   Use Spring Data JPA method naming conventions or @Query annotation
   Never write raw JDBC or string-concatenated SQL
   Controllers must NEVER call repositories directly — always go through a service
   Service (service/)
   All business logic lives here
   Services call repositories to get data, apply rules, convert to DTOs, and return
   Services NEVER call other services
   Always convert entities to DTOs before returning to controllers — never return raw JPA entities
   Controller (controller/)
   REST API endpoints only
   Receives HTTP requests, calls the appropriate service, returns HTTP responses
   Zero business logic allowed here
   All endpoints return JSON except GET /api/books/{id}/download which returns a file

7. application.properties Template
   Use this exact structure. All secret values come from environment variables.
   properties
# Server
server.port=8080

# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# HikariCP Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=false

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration.days=7

# PDF Storage
app.pdf.storage.path=${PDF_STORAGE_PATH}

# Stripe
stripe.secret.key=${STRIPE_SECRET_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}

# Email (for password reset)
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# App base URL (used in password reset emails)
app.base.url=${APP_BASE_URL}

# Logging
logging.level.com.maktabah=INFO
logging.file.name=logs/maktabah.log
Local development environment variables — set these on your machine, never commit them:
DB_URL=jdbc:postgresql://localhost:5432/maktabah_db
DB_USERNAME=postgres
DB_PASSWORD=your_local_password
JWT_SECRET=a-very-long-random-string-at-least-64-characters-long
PDF_STORAGE_PATH=C:/path/to/Maktabah/pdfs/
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your_app_password
APP_BASE_URL=http://localhost:5173
IMPORTANT — Spring Security During Steps 1 Through 12
Spring Boot auto-enables Spring Security the moment the dependency is in pom.xml. This locks down every endpoint by default. Steps 1 through 12 are built before authentication exists so SecurityConfig.java must permit all requests during this phase.
From Step 1 until Step 12 SecurityConfig.java must contain exactly this:
java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
http.csrf(csrf -> csrf.disable())
.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
return http.build();
}
}
This permissive config is completely replaced with proper JWT security in Step 13. Do not add any authentication logic before Step 13.

8. Frontend Routing
   The frontend uses hash-based client-side routing. No external router library. Everything is handled in main.js.
   How it works:
   The URL looks like: maktabah.com/#/library or maktabah.com/#/roadmap
   main.js listens to the window hashchange event
   When the hash changes main.js reads the hash, finds the matching page, and renders it into the main content div in index.html
   index.html has one single div with id="app" — all page content is rendered inside it
   The navbar links use href="#/library", href="#/roadmap" etc.
   Routes and which file handles them:
   #/          → library.js (default)
   #/library   → library.js
   #/roadmap   → roadmap.js
   #/fiqhtool  → fiqhtool.js
   #/login     → login.js
   #/register  → register.js
   #/account   → account.js
   #/admin     → admin panel (only rendered if user role is admin)
   main.js is responsible for:
   Reading the current hash on page load and rendering the correct page
   Listening for hash changes and re-rendering
   Rendering the navbar on every page
   Checking auth state and redirecting if needed (e.g. redirect to #/login if unauthenticated user hits #/account)

9. Auth State and the /api/auth/me Endpoint
   Since JWT is stored in an HttpOnly cookie, JavaScript cannot read it directly. The frontend determines login state using a dedicated endpoint.
   GET /api/auth/me
   If the cookie is valid: returns 200 with JSON containing id, email, role, subscriptionStatus
   If no cookie or invalid cookie: returns 401
   How auth.js works
   auth.js exports getCurrentUser() which:
   Calls GET /api/auth/me
   If 200: stores the user object in a module-level variable and returns it
   If 401: sets the variable to null and returns null
   auth.js also exports:
   isLoggedIn() — returns true if getCurrentUser() returned a user
   isPaid() — returns true if user.subscriptionStatus === 'paid'
   isAdmin() — returns true if user.role === 'admin'
   Every page calls getCurrentUser() on load to determine what to show. The navbar calls it to decide whether to show Login or Account link.

10. Database Schema
    fields
    id                BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    name              VARCHAR(255)    NOT NULL UNIQUE
    parent_field_id   BIGINT          NULLABLE REFERENCES fields(id)
    Top level fields: parent_field_id = NULL
    Subfields: parent_field_id points to parent
    Field names are unique across the entire table
    books
    id              BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    title           VARCHAR(255)    NOT NULL
    author          VARCHAR(255)    NOT NULL
    field_id        BIGINT          NOT NULL REFERENCES fields(id)
    level           VARCHAR(50)     NOT NULL CHECK (level IN ('beginner','intermediate','advanced'))
    description     TEXT            NULLABLE
    pdf_filename    VARCHAR(500)    NOT NULL
    PDF filename stored as relative path from pdfs/ folder. Format: fieldname/book-title-in-lowercase-hyphens.pdf Example: aqeedah/usool-al-thalatha.pdf
    roadmap_steps
    id              BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    field_id        BIGINT          NOT NULL REFERENCES fields(id)
    book_id         BIGINT          NOT NULL REFERENCES books(id)
    level           VARCHAR(50)     NOT NULL CHECK (level IN ('beginner','intermediate','advanced'))
    step_order      INTEGER         NOT NULL
    description     TEXT            NOT NULL
    UNIQUE (field_id, level, step_order)
    masail
    id              BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    title           VARCHAR(255)    NOT NULL
    arabic_term     VARCHAR(255)    NULLABLE
    category        VARCHAR(100)    NOT NULL
    description     TEXT            NULLABLE
    verified        BOOLEAN         NOT NULL DEFAULT FALSE
    verified=FALSE: invisible to all users including paid users
    verified=TRUE: set only by admin after imam sign-off
    Cannot be verified unless all four madhab opinions exist
    madhab_opinions
    id              BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    masalah_id      BIGINT          NOT NULL REFERENCES masail(id)
    madhab          VARCHAR(50)     NOT NULL CHECK (madhab IN ('Hanafi','Maliki','Shafi''i','Hanbali'))
    opinion         TEXT            NOT NULL
    evidence        TEXT            NOT NULL
    source_book     VARCHAR(255)    NULLABLE
    source_page     VARCHAR(50)     NULLABLE
    users
    id                      BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    email                   VARCHAR(255)    UNIQUE NOT NULL
    password_hash           VARCHAR(255)    NOT NULL
    role                    VARCHAR(50)     NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin'))
    subscription_status     VARCHAR(50)     NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free','paid'))
    stripe_customer_id      VARCHAR(255)    NULLABLE
    stripe_subscription_id  VARCHAR(255)    NULLABLE
    failed_attempts         INTEGER         NOT NULL DEFAULT 0
    lock_until              TIMESTAMP       NULLABLE
    password_reset_token    VARCHAR(255)    NULLABLE
    password_reset_expiry   TIMESTAMP       NULLABLE
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW()
    Passwords hashed with BCrypt strength 12
    Admin accounts created only via direct SQL INSERT — no public endpoint
    Subscription cancelled webhook sets subscription_status back to 'free' and clears stripe_subscription_id
    user_progress
    id                  BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    user_id             BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE
    roadmap_step_id     BIGINT          NOT NULL REFERENCES roadmap_steps(id)
    completed           BOOLEAN         NOT NULL DEFAULT FALSE
    completed_at        TIMESTAMP       NULLABLE
    UNIQUE (user_id, roadmap_step_id)
    token_blacklist
    id          BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    token_id    VARCHAR(255)    NOT NULL UNIQUE
    expires_at  TIMESTAMP       NOT NULL
    token_id is the JWT jti claim — a UUID generated when the token is created
    Every authenticated request checks this table before proceeding
    A @Scheduled job runs daily at midnight and deletes all rows where expires_at < NOW()
    MaktabahApplication.java must have the @EnableScheduling annotation for the scheduled job to run

11. REST API Endpoints
    Public — no authentication required
    GET  /api/fields                              all top level fields
    GET  /api/fields/{id}/subfields               subfields of a given field
    GET  /api/auth/me                             returns current user or 401
    POST /api/auth/register                       create account, sets JWT cookie, returns user
    POST /api/auth/login                          verify credentials, sets JWT cookie, returns user
    POST /api/auth/logout                         clears JWT cookie
    POST /api/auth/forgot-password                sends reset email (always returns 200)
    POST /api/auth/reset-password                 resets password using valid unexpired token
    GET  /api/masail/categories                   all fiqh categories (names only)
    Free users — valid JWT cookie required
    GET  /api/books?fieldId={id}                  books in a field
    GET  /api/books?fieldId={id}&level={level}    books filtered by field and level
    GET  /api/roadmap?level={level}               roadmap steps for a level ordered by step_order
    GET  /api/roadmap?fieldId={id}&level={level}  roadmap steps for field and level
    GET  /api/progress                            all completed roadmap step IDs for this user
    POST /api/progress/{stepId}/complete          marks a roadmap step as complete
    Paid users — valid JWT required AND subscriptionStatus = 'paid'
    GET  /api/books/{id}/download                 streams PDF file as attachment download
    GET  /api/masail?category={category}          all verified masail in a category
    GET  /api/masail/search?query={query}         search verified masail by title
    GET  /api/masail/{id}                         one masalah with all four madhab opinions
    Payments
    POST /api/payment/create-checkout             login required — returns Stripe checkout session URL
    POST /api/payment/webhook                     no auth — Stripe calls this, verified by signature
    Admin — valid JWT required AND role = 'admin'
    GET    /api/admin/users                       list all users with email and subscription status
    PUT    /api/admin/users/{id}/subscription     manually set a user's subscription status
    POST   /api/admin/books                       add a new book (supports PDF file upload)
    PUT    /api/admin/books/{id}                  edit book details
    DELETE /api/admin/books/{id}                  delete a book and its PDF file
    POST   /api/admin/masail                      add masalah with all four madhab opinions
    PUT    /api/admin/masail/{id}                 edit masalah or its opinions
    PUT    /api/admin/masail/{id}/verify          set verified=true — only after imam sign-off

12. Stripe Webhook Events
    Verify signature on every webhook before processing. Reject with 400 if signature invalid.
    Event
    Action
    checkout.session.completed
    Set subscriptionStatus='paid', save stripe_customer_id and stripe_subscription_id on user
    customer.subscription.deleted
    Set subscriptionStatus='free', clear stripe_subscription_id
    invoice.payment_succeeded
    Ensure subscriptionStatus remains 'paid'
    invoice.payment_failed
    Log the failure — optionally email the user


13. CORS Configuration
    Spring Boot must be configured to allow requests from the frontend origin.
    During development allow: http://localhost:5173
    In production allow: the live domain only (e.g. https://maktabah.com)
    Configure CORS in SecurityConfig.java — not in individual controllers. Never use wildcard (*) for allowed origins in any environment. Allowed methods: GET, POST, PUT, DELETE, OPTIONS Allowed headers: Content-Type, Authorization Allow credentials: true (required for cookies to work cross-origin in development)

14. What Each Frontend Page Does
    library.js
    On load: calls getFields() from api.js, renders field cards
    On field click: calls getSubfields(fieldId), if subfields exist renders them, if not calls getBooks(fieldId) directly
    On subfield click: calls getBooks(subfieldId), renders book cards
    Book card shows for all users: cover area with field color, title, author, level badge (green=beginner, orange=intermediate, red=advanced), description preview
    Book card download button behaviour:
    Not logged in: clicking download redirects to #/login
    Logged in but free: clicking download shows inline upgrade prompt on the card — "Upgrade to download this book" with a button linking to #/account
    Logged in and paid: clicking download calls downloadBook(bookId) which triggers the file download
    Level filter bar at top: All / Beginner / Intermediate / Advanced — filters already loaded books in memory, no new API call
    roadmap.js
    On load: calls getFields() to populate the field dropdown, renders level selector buttons
    When level and field selected: calls getRoadmap(fieldId, level), renders vertical timeline
    Timeline step shows: step number circle, book title, author, description of why this book is here, download button (same behaviour as library), checkbox to mark complete
    If user is logged in: calls getProgress() and checks completed steps — shows filled green checkbox on completed steps
    Mark complete button calls completeStep(stepId) then refreshes the checkboxes
    fiqhtool.js
    On load: checks isPaid() from auth.js — if not paid renders upgrade prompt and stops
    If paid: calls getMasailCategories(), renders category filter buttons and search bar
    On search or category select: calls searchMasail(query) or getMasailByCategory(category), renders masalah list
    On masalah click: calls getMasalah(id), renders four madhab cards side by side (desktop) or stacked (mobile)
    Each madhab card color: Hanafi=green, Maliki=yellow, Shafi'i=blue, Hanbali=red
    Each card shows: madhab name, ruling text, evidence text, source book and page
    login.js
    Simple centered form with email and password fields. On submit calls login(email, password) from api.js. On success redirects to #/library. On failure shows error message below the form: "Invalid email or password."
    register.js
    Simple centered form with email, password, and confirm password fields. Validates passwords match on frontend before submitting. On submit calls register(email, password). On success redirects to #/library. On failure shows error below form.
    account.js
    Shows:
    Email address of logged in user
    Current plan: Free or Paid (with green badge if paid)
    If free: prominent upgrade card with price and feature list and Upgrade Now button that calls createCheckout() then redirects to Stripe
    If paid: shows "Active subscription" with green checkmark
    Logout button at bottom — calls logout() then redirects to #/login
    navbar.js
    Shows: Maktabah logo (links to #/library), Library, Roadmap, Fiqh Tool links, and either Login link (if not logged in) or Account link (if logged in). Highlights the currently active page link. Renders on every page via main.js.

15. api.js Structure
    All fetch calls live here. Pages import these functions and never use fetch() directly.
    javascript
    // Base URL — reads from environment or defaults to empty string (uses Vite proxy in dev)
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// All functions use credentials: 'include' so cookies are sent automatically

export async function getFields() {}
export async function getSubfields(fieldId) {}
export async function getBooks(fieldId, level = null) {}
export async function downloadBook(bookId) {}       // triggers browser file download
export async function getRoadmap(fieldId, level) {}
export async function getProgress() {}
export async function completeStep(stepId) {}
export async function login(email, password) {}
export async function register(email, password) {}
export async function logout() {}
export async function getCurrentUser() {}           // GET /api/auth/me
export async function forgotPassword(email) {}
export async function resetPassword(token, newPassword) {}
export async function createCheckout() {}
export async function getMasailCategories() {}
export async function getMasailByCategory(category) {}
export async function searchMasail(query) {}
export async function getMasalah(id) {}

// Admin functions
export async function adminGetUsers() {}
export async function adminUpdateSubscription(userId, status) {}
export async function adminAddBook(bookData) {}
export async function adminAddMasalah(masalahData) {}
export async function adminVerifyMasalah(masalahId) {}

16. PDF Rules
    PDFs stored in pdfs/ folder at project root — never inside the frontend public folder
    Subfolders match field names: pdfs/aqeedah/, pdfs/fiqh/, pdfs/hadith/, pdfs/seerah/
    Filename convention: lowercase, hyphens for spaces, no special characters, .pdf extension
    Correct: usool-al-thalatha.pdf
    Wrong: Usool Al Thalatha.pdf or كتاب.pdf
    Database stores relative path from pdfs/ folder: aqeedah/usool-al-thalatha.pdf
    app.pdf.storage.path in application.properties holds absolute path to pdfs/ folder on the server
    Download endpoint: combines app.pdf.storage.path with pdf_filename from database to build full path
    Response header for downloads: Content-Disposition: attachment; filename="book-title.pdf"
    If file not found on disk: return 404 with message "Book file not found"
    Admin PDF upload: file is validated (must be real PDF by magic bytes check), renamed to the correct convention, saved to the correct subfolder

17. Security Rules
    When Security Is Added
    Environment variables: from day one — never hardcode secrets
    Basic JWT authentication is added in Step 13 — this replaces the permissive SecurityConfig
    Full security hardening (rate limiting, headers, input validation etc.) is done in a dedicated security phase after Step 18
    Do not add rate limiting, security headers, or @Valid annotations during the main 18 steps — keep steps focused on functionality
    Authentication
    JWT stored in HttpOnly cookie only — never localStorage or sessionStorage
    Cookie flags: HttpOnly=true, Secure=true, SameSite=Strict
    Every JWT contains a unique jti claim (random UUID generated at token creation)
    Token expiry: 7 days
    Every authenticated request: verify signature, check expiry, check jti not in token_blacklist table
    Authorization
    401: not authenticated (no cookie or invalid/expired token)
    403: authenticated but insufficient permissions (wrong role or not paid)
    Paid content: check subscriptionStatus equals exactly the string 'paid'
    Admin content: check role equals exactly the string 'admin'
    Passwords
    BCrypt with strength 12 — no exceptions
    Minimum 8 characters, maximum 100 characters
    Login error always returns exactly: "Invalid email or password" — never reveal which field was wrong
    forgot-password always returns 200 success regardless of whether email exists
    Error Responses
    Never return Java stack traces to the client
    Never return Hibernate or database error messages to the client
    500 response body: { "message": "Something went wrong. Please try again." }
    404 response body: { "message": "Resource not found" }
    401 response body: { "message": "Authentication required" }
    403 response body: { "message": "Access denied" }
    All detailed error information goes to the log file only
    Secrets
    All secrets in environment variables — never written in application.properties directly
    application.properties reads secrets using ${VARIABLE_NAME} syntax
    .env.example file with placeholder values is safe to commit
    .env file with real values is in .gitignore and never committed

18. Admin Panel Rules
    Admin accounts created only via direct SQL INSERT into the users table — no public registration endpoint
    Admin panel accessible at #/admin route — main.js checks isAdmin() before rendering it, renders a 404 page if not admin
    Role check happens on BOTH frontend (do not render) AND backend (reject request) — never rely on frontend alone
    Every admin action logged: admin email, action type, affected resource ID, timestamp
    Masalah publish flow: admin adds masalah with all four opinions → imam reviews offline → admin clicks verify button → verified=true → masalah becomes visible to paid users
    Admin PDF upload: POST /api/admin/books accepts multipart/form-data with book metadata fields and a PDF file
    Admin Panel Layout
    The admin panel has three tabs:
    Books tab:
    Table showing all books with columns: title, author, field, level, and action buttons
    Edit button opens an inline form to update book details
    Delete button removes the book and its PDF file from disk
    Add Book form at the top: title, author, field dropdown, level dropdown, description, PDF file upload
    Masail tab:
    Table showing all masail with columns: title, category, verified status (green badge or red badge), and action buttons
    Unverified masail show a green Verify button — clicking it sets verified=true after imam has confirmed
    Edit button opens form to update masalah details or its madhab opinions
    Add Masalah form: title, arabic term, category, description, and four opinion sections (one per madhab each with opinion, evidence, source book, source page)
    Users tab:
    Table showing all users with columns: email, role, subscription status, joined date
    Subscription status has a dropdown to manually change between free and paid
    No delete user functionality — users are never deleted, only managed

19. What NOT To Do
    Never put business logic in a controller
    Never call a repository from a controller — always go through the service
    Never return a raw JPA entity from a service — always convert to a DTO first
    Never store JWT in localStorage or sessionStorage — HttpOnly cookie only
    Never hardcode a secret, password, API key, or file path in source code
    Never serve PDFs from a publicly accessible URL — always through the protected download endpoint
    Never show a masalah where verified=false to any user
    Never trust the frontend to confirm a Stripe payment — always use the webhook
    Never return a Java stack trace or database error message to the frontend
    Never reveal whether a specific email address is registered in the system
    Never let one service call another service
    Never use wildcard CORS origins
    Never skip the Stripe webhook signature verification

20. Ports and Local Development
    Service
    Address
    Backend
    localhost:8080
    Frontend
    localhost:5173
    PostgreSQL
    localhost:5432

Database name: maktabah_db Local database user: postgres
Run commands:
Backend: mvn spring-boot:run (from backend/ folder)
Frontend: npm run dev (from frontend/ folder)
Both must run simultaneously during development
Vite proxy in vite.config.js:
javascript
server: {
proxy: {
'/api': {
target: 'http://localhost:8080',
changeOrigin: true
}
}
}
In development all fetch('/api/...') calls in the frontend automatically go to the backend on port 8080 through this proxy. No CORS issues during development.

21. Current Progress
    Completed Steps
    Step 1 — Spring Boot setup and PostgreSQL connection
    Step 2 — Field model and repository
    Step 3 — Book model and repository
    Step 4 — Field and Book service and controllers
    Step 5 — PDF file serving endpoint
    Step 6 — Frontend basic page showing fields
    Step 7 — Click field to show books (built inside Step 6)
    Step 8 — PDF download button (built inside Step 6)
    Step 9 — Styling and layout polish
    Frontend code review — checking for early bugs before moving to Step 10 
    Currently Working On
    Step 14 — Progress tracking
    Extra Features Added Beyond Steps (not in original checklist)
    - Home/hero landing page at #/ with feature cards
    - Field cards show one-line descriptions of each Islamic field
    - Book cards have "Read more →" modal showing author biography and full description
    - author_bio TEXT column added to books table (nullable, auto-added by Hibernate)
    - "← Home" back link on library page
    Up Next
    Step Checklist
    Step 1 — Spring Boot setup and PostgreSQL connection ✓
    Step 2 — Field model and repository ✓
    Step 3 — Book model and repository ✓
    Step 4 — Field and Book service and controllers ✓
    Step 5 — PDF file serving endpoint ✓
    Step 6 — Frontend basic page showing fields ✓
    Step 7 — Click field to show books ✓
    Step 8 — PDF download button ✓
    Step 9 — Styling and layout polish ✓
    Step 10 — Roadmap models and database tables ✓
    Step 11 — Roadmap API endpoints ✓
    Step 12 — Roadmap frontend page ✓
    Step 13 — User registration and login ✓
    Step 14 — Progress tracking
    Step 15 — Stripe payments and access control
    Step 16 — Masalah and MadhabOpinion models
    Step 17 — Fiqh Tool API endpoints
    Step 18 — Fiqh Tool frontend page
    Security Checklist
    Security 1 — HTTPS and SSL certificate
    Security 2 — Environment variables for secrets
    Security 3 — PDF file protection
    Security 4 — Stripe webhook verification
    Security 5 — JWT HttpOnly cookies
    Security 6 — Rate limiting and account lockout
    Security 7 — Input validation
    Security 8 — Security headers and CORS lockdown
    Security 9 — Database user permissions
    Security 10 — Error message security
    Security 11 — Logging and monitoring
    Security 12 — Password reset security
    Security 13 — Dependency vulnerability scanning
    Security 14 — Admin panel security
    Security 15 — File upload validation
    Security 16 — Session management and token revocation

22. How To Start Every Session
    Copy and paste this at the start of every Claude Code session before doing anything else:
    "Please read the CLAUDE.md file in this project root before we begin. That file contains the complete specification for everything we are building. Once you have read it, confirm you understand the project, state which step we are currently on based on the checklist in Section 21, and then we will begin. Today I want to work on: [describe your goal for this session]."
    At the end of every session update Section 21: check off completed steps and update the Currently Working On and Up Next lines.

## 23. Deployment and Production Infrastructure

### Hosting Stack

| Component | Service | Cost |
|---|---|---|
| VPS Server (backend + database) | Hetzner Cloud CX22 | ~€4-6/month |
| Frontend hosting | Netlify (free tier) | Free |
| SSL certificate | Let's Encrypt via Certbot | Free |
| Domain name | Any registrar | ~€10-15/year |
| Email sending (password reset) | Brevo or Resend free tier | Free at launch |
| PDF storage | Same VPS at launch | Included in VPS |

### Server Setup on Hetzner VPS

The VPS runs Ubuntu 22.04 LTS. On it we install:
- Java 21 (via apt)
- PostgreSQL 15 or 16 (via apt)
- Nginx (reverse proxy in front of Spring Boot)
- Certbot (for Let's Encrypt SSL certificate)
- The Spring Boot JAR file run as a systemd background service

### How Traffic Flows in Production
User browser ↓ HTTPS port 443 Nginx (handles SSL, serves frontend files, proxies API) ↓ HTTP localhost:8080 (internal only) Spring Boot application ↓ PostgreSQL database (localhost:5432, internal only)

Nginx does three things:
1. Serves the built frontend files (HTML/CSS/JS) directly
2. Proxies all /api requests to Spring Boot on port 8080
3. Handles the SSL certificate so Spring Boot never needs to deal with HTTPS

PostgreSQL and Spring Boot are never exposed to the public internet directly. Only Nginx is.

### Frontend Build and Deployment

Vite builds the frontend into a dist/ folder of plain HTML, CSS, and JS files.
These static files are copied to the VPS and served directly by Nginx.
No Node.js needed on the server — just the built files.

Build command: npm run build (run from frontend/ folder)
Output folder: frontend/dist/
Nginx serves from: /var/www/maktabah/ on the server

### Environment Variables in Production

On the VPS, environment variables are set in the systemd service file that runs Spring Boot.
They are never in any code file or committed to version control.

Example systemd service file at /etc/systemd/system/maktabah.service:
[Unit] Description=Maktabah Spring Boot Application After=network.target
[Service] User=maktabah ExecStart=/usr/bin/java -jar /opt/maktabah/maktabah.jar EnvironmentFile=/opt/maktabah/.env Restart=always RestartSec=10
[Install] WantedBy=multi-user.target

The .env file at /opt/maktabah/.env on the server contains all production secrets.
This file has restricted permissions (chmod 600) so only the maktabah user can read it.

### Production application.properties Additions

These properties are added or changed for production — they override development values:
```properties
# In production Spring Boot runs behind Nginx so no HTTPS needed here
server.port=8080

# Cookie must work over HTTPS in production
# This is already handled by the Secure flag on the JWT cookie

# CORS — in production only allow the real domain
# Update SecurityConfig to read this from an environment variable
app.frontend.url=${FRONTEND_URL}
```

Add FRONTEND_URL to production .env:
FRONTEND_URL=https://maktabah.com

Update SecurityConfig CORS allowed origins to read from app.frontend.url instead of
hardcoding localhost:5173 — this way the same config works in both environments.

### Nginx Configuration

Nginx config file at /etc/nginx/sites-available/maktabah:
```nginx
server {
    listen 80;
    server_name maktabah.com www.maktabah.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name maktabah.com www.maktabah.com;

    ssl_certificate /etc/letsencrypt/live/maktabah.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maktabah.com/privkey.pem;

    # Serve frontend static files
    root /var/www/maktabah;
    index index.html;

    # All non-API routes serve index.html (handles hash routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Spring Boot
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Deployment Steps When Releasing an Update

1. Run mvn clean package in backend/ — produces a JAR file in target/
2. Run npm run build in frontend/ — produces built files in dist/
3. Copy the new JAR to /opt/maktabah/ on the server
4. Copy the dist/ contents to /var/www/maktabah/ on the server
5. Restart the Spring Boot service: sudo systemctl restart maktabah
6. Verify it is running: sudo systemctl status maktabah

### PDF Storage Future Plan

At launch PDFs are stored on the VPS at the path defined by PDF_STORAGE_PATH.
When the PDF library grows large or the VPS disk fills up, migrate to object storage:
- DigitalOcean Spaces or AWS S3
- Only the download endpoint in BookController needs to change
- The database pdf_filename values stay the same
- Everything else in the codebase is unaffected

This migration is not needed at launch — plan for it when storage exceeds 10GB.

"At the end of this session, update MEMORY.md with anything worth remembering — decisions made, bugs fixed, dead ends found."

Make it a good habit to tell me the context left on this conversation so it dont drag it too long
