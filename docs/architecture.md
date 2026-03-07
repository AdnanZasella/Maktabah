# Maktabah — Architecture Reference

## Project Type
Full stack web application.
Backend: Java Spring Boot REST API.
Frontend: Vanilla JavaScript SPA with Vite.
Database: PostgreSQL.
They are completely separate — backend serves JSON, frontend consumes it.

---

## The Four Layers — The Most Important Rule in This Project

Every backend feature follows this exact chain. Never skip a step. Never go sideways.

```
HTTP Request
     ↓
Controller        ← receives request, calls service, returns response
     ↓
Service           ← all business logic lives here
     ↓
Repository        ← all database access lives here
     ↓
Database
     ↓
Repository        ← returns JPA Entity to service
     ↓
Service           ← converts Entity to DTO, returns DTO to controller
     ↓
Controller        ← returns DTO as JSON response
```

### Layer Rules — Never Break These

**Model**
- Maps directly to a database table using JPA annotations
- Contains only fields, getters, setters, JPA annotations
- Zero business logic allowed

**DTO**
- Plain Java class — no JPA annotations, just fields, getters, setters
- Used to move data between service and controller
- Naming: entity name + DTO suffix — BookDTO, FieldDTO, MasalahDTO
- Services ALWAYS convert JPA entities to DTOs before returning
- NEVER return a raw JPA entity from any service method
  (raw entities cause Jackson infinite loop errors from bidirectional JPA relationships)

**Repository**
- JPA interface extending JpaRepository<Entity, Long>
- All database access goes through here and only here
- Use Spring Data JPA method naming or @Query annotation
- Never write raw JDBC or string-concatenated SQL

**Service**
- All business logic lives here and only here
- Calls repositories to get data
- Applies business rules
- Converts entities to DTOs
- Returns DTOs to controller
- NEVER calls another service
- NEVER returns a raw JPA entity

**Controller**
- REST endpoints only — receives request, calls service, returns response
- Zero business logic allowed
- NEVER calls a repository directly — always through a service
- All endpoints return JSON except GET /api/books/{id}/download which returns a file

---

## Full Project Folder Structure

```
Maktabah/
│
├── CLAUDE.md                          ← project rules (short version)
├── docs/                              ← reference docs loaded on demand
│   ├── progress.md
│   ├── architecture.md
│   ├── db-schema.md
│   ├── api-endpoints.md
│   ├── frontend-guide.md
│   ├── stack.md
│   ├── security.md
│   └── deployment.md
│
├── backend/
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/maktabah/          ← root package (NOT com.maktabah.backend)
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
│           │       └── MaktabahApplication.java   ← has @EnableScheduling
│           └── resources/
│               └── application.properties
│
├── frontend/
│   ├── index.html                     ← single HTML file, has <div id="app">
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── pages/
│       │   ├── home.js                ← hero landing page
│       │   ├── library.js             ← book library page
│       │   ├── roadmap.js             ← learning roadmap page
│       │   ├── fiqhtool.js            ← fiqh comparison tool page
│       │   ├── login.js               ← login page
│       │   ├── register.js            ← register page
│       │   └── account.js             ← account and subscription page
│       ├── components/
│       │   ├── navbar.js              ← top navigation bar
│       │   ├── bookcard.js            ← book card with modal + download logic
│       │   ├── fieldcard.js           ← field/subfield card
│       │   ├── roadmapstep.js         ← single roadmap step
│       │   └── madhabcard.js          ← single madhab opinion card
│       ├── api.js                     ← ALL fetch() calls live here only
│       ├── auth.js                    ← login state, current user, auth helpers
│       ├── main.js                    ← app entry point and client-side routing
│       └── style.css
│
├── pdfs/                              ← PDF files stored here
│   ├── aqeedah/
│   ├── fiqh/
│   ├── hadith/
│   └── seerah/
│
└── logs/                              ← application log output
```

---

## Backend — Key Architecture Details

### Package
`com.maktabah` — NOT `com.maktabah.backend`

### MaktabahApplication.java
Must have `@EnableScheduling` — required for the daily token blacklist cleanup job.

### Security Package
- `JwtUtil.java` — generates and validates JWT using jjwt 0.12.6
    - Claims: userId (subject), email, role, subscriptionStatus, jti (UUID)
    - Expiry: 7 days
- `JwtAuthFilter.java` — OncePerRequestFilter, reads `jwt` cookie
    - Principal is the userId string
    - Controllers extract userId via: `Long.parseLong(authentication.getName())`
- `SecurityConfig.java` — stateless, JWT filter runs before Spring auth filter
    - Public endpoints: /api/auth/**, /api/fields/**, GET /api/books,
      GET /api/masail/categories, /api/payment/webhook
    - Authenticated: /api/payment/create-checkout, /api/books/*/download,
      /api/masail/**, everything else
    - AuthenticationEntryPoint returns 401 with { "message": "Authentication required" }

### Exception Package
- `GlobalExceptionHandler.java` — catches all exceptions, returns clean JSON
- `ResourceNotFoundException.java` — thrown when entity not found, returns 404
- Never return stack traces or database error messages to the client

### TokenBlacklist Cleanup
- @Scheduled job runs daily at midnight
- Deletes all rows from token_blacklist where expires_at < NOW()
- Requires @EnableScheduling on MaktabahApplication.java

---

## Frontend — Key Architecture Details

### Single Page App
- One HTML file: index.html with `<div id="app">`
- All page content renders inside that div
- No page reloads — hash-based routing in main.js

### main.js Responsibilities
- Reads hash on page load, renders correct page
- Listens for hashchange events, re-renders on change
- Renders navbar on every page
- Checks auth state and redirects if needed
- Strips query params before route matching
  (fixes #/account?payment=success being treated as unknown route)

### api.js Rule
ALL fetch() calls live in api.js and only in api.js.
No page or component ever calls fetch() directly.
All functions use `credentials: 'include'` so cookies are sent automatically.

### auth.js Exports
- `getCurrentUser()` — calls GET /api/auth/me, caches result
- `isLoggedIn()` — true if getCurrentUser() returned a user
- `isPaid()` — true if user.subscriptionStatus === 'paid'
- `isAdmin()` — true if user.role === 'admin'
- `clearUserCache()` — must be called after login/logout before re-fetching

### Hash Routes
```
#/          → home.js (hero landing page)
#/library   → library.js
#/roadmap   → roadmap.js
#/fiqhtool  → fiqhtool.js
#/login     → login.js
#/register  → register.js
#/account   → account.js
#/admin     → admin panel (only if isAdmin())
```

### Vite Proxy (development only)
All fetch('/api/...') calls proxy automatically to localhost:8080.
No CORS issues during development.
Configured in vite.config.js.

---

## What Already Exists vs What Is Left

### Built and Working (Steps 1–15)
- All backend layers: models, DTOs, repositories, services, controllers
- All frontend pages: home, library, roadmap, fiqhtool, login, register, account
- JWT authentication with HttpOnly cookies
- Progress tracking
- Stripe payments and webhook
- Extra features: hero page, field descriptions, book modal, upgrade modal popup

### Still To Build
- Step 16: Masalah.java, MadhabOpinion.java models + repositories
- Step 17: MasalahService.java, MasalahController.java — fiqh tool API endpoints
- Step 18: fiqhtool.js frontend — search, category filter, madhab cards
- AdminController.java — admin panel backend
- Full security hardening phase (16 security steps)