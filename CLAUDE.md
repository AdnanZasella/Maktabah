# CLAUDE.md — Maktabah

Read this file first. Then read `docs/progress.md` to know exactly which step you are on before doing anything else. Only read other docs/ files when the current step requires them. Do not build anything not asked for in the current step.

---

## 1. What Is Maktabah

A web-based Islamic knowledge platform for Muslim students at beginner, intermediate, and advanced levels. Three core features:

- **Book Library** — browse and download Islamic PDF books organized by field and level
- **Learning Roadmap** — structured guided learning paths with step-by-step book recommendations, users mark steps complete
- **Fiqh Comparison Tool** — search a fiqh issue and see all four madhab positions side by side with evidence and sources. All rulings verified by real imams before going live.

### User Tiers and Access Rules

| User | What they can do |
|---|---|
| **Not logged in** | Browse the library. Any action (download, click roadmap node, search fiqhtool) shows a **login popup**. |
| **Logged in — free** | Browse library and download PDF books. On the roadmap, clicking a node shows an **upgrade popup**. In the fiqhtool, submitting a search shows an **upgrade popup**. |
| **Logged in — paid** | Full access: library downloads, roadmap node details with completion tracking, fiqhtool search results. |
| **Scholar** | Their own panel at `#/scholar`. Can add, edit, remove masail and madhab opinions, and verify masail. Cannot access the admin panel or touch books, users, or roadmap. |
| **Admin** | Everything a paid user can do plus the admin panel at `#/admin`: manage books, roadmap steps, and users. |

The login popup and upgrade popup are already implemented. Every new feature must respect these tiers — always check auth state and subscription status before rendering gated content.

Roles in the database: `user`, `scholar`, `admin`. Scholar and admin accounts are created only via direct SQL INSERT — no public registration endpoint for either.

---

## 2. Stack

| Layer | Technology | Version                   |
|---|---|---------------------------|
| Language | Java | 21                        |
| Backend | Spring Boot | 3.5.1                     |
| ORM | Spring Data JPA + Hibernate | (included)                |
| Database | PostgreSQL | 18                        |
| JWT | jjwt by io.jsonwebtoken | 0.12.6                    |
| Frontend | HTML, CSS, vanilla JS | ES6+                      |
| Build tool | Vite | 5.x                       |
| Payments | Stripe Java SDK | 24.x                      |
| Rate limiting | Bucket4j | 8.x (security phase only) |

Full stack details: `docs/stack.md`

---

## 3. Architecture Rules — Never Break These

**Layer order: Controller → Service → Repository. Never skip or reverse.**

- **Controller** — HTTP only. No business logic. Never calls a repository directly.
- **Service** — All business logic lives here. Calls repositories. Never calls another service.
- **Repository** — All database access. JPA only. No raw JDBC or string SQL.
- **Model** — JPA entity. Fields, getters, setters, annotations only. Zero business logic.
- **DTO** — Plain Java class, no JPA. Services ALWAYS convert entities to DTOs before returning. Never return a raw JPA entity from a service — this causes Jackson infinite loop errors.

DTO naming: `BookDTO`, `FieldDTO`, `MasalahDTO` etc.

Full architecture details: `docs/architecture.md`

---

## 4. Project Structure

```
Maktabah/
├── CLAUDE.md
├── docs/
├── backend/src/main/
│   ├── java/com/maktabah/
│   │   ├── model/
│   │   ├── dto/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── controller/
│   │   ├── security/
│   │   ├── exception/
│   │   └── MaktabahApplication.java
│   └── resources/application.properties
├── frontend/
│   ├── src/
│   │   ├── pages/        (library.js, roadmap.js, fiqhtool.js, login.js, register.js, account.js, scholar.js)
│   │   ├── components/   (navbar.js, bookcard.js, fieldcard.js, roadmapstep.js, madhabcard.js)
│   │   ├── api.js        ← ALL fetch() calls live here only
│   │   ├── auth.js       ← login state and auth helpers
│   │   └── main.js       ← entry point and hash-based routing
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── pdfs/
    ├── aqeedah/
    ├── fiqh/
    ├── hadith/
    └── seerah/
```

Never create files not listed here unless the current step specifically requires it.

---

## 5. Critical Rules — Always Apply

**Build discipline**
- Only build what the current step asks for. Nothing extra.
- Do not upgrade library versions.
- Do not add rate limiting, `@Valid`, or security headers before the security phase.

**⚠ Fiqh content integrity — most critical business rule**
- Never query masail without filtering `WHERE verified = true`. Unverified masail must never be visible to any user under any circumstance.
- A masalah cannot be verified unless all four madhab opinions (Hanafi, Maliki, Shafi'i, Hanbali) are present.
- Only a scholar or admin can set `verified = true`. The scholar does this themselves through the scholar panel after they are satisfied the content is correct — there is no separate offline approval step.
- This is a religious platform. Showing unverified fiqh content is not a bug — it is a content integrity failure.

**Role checks always happen on both frontend AND backend — never rely on frontend alone.**

**Security baseline**
- All secrets in environment variables. Never hardcoded. Ever.
- JWT stored in HttpOnly cookie only. Never localStorage or sessionStorage.
- `application.properties` reads secrets via `${VARIABLE_NAME}` syntax.

**Spring Security — Steps 1 through 12**
Spring Security locks all endpoints the moment it is on the classpath. Until Step 13, `SecurityConfig.java` must contain exactly this and nothing else:

```java
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
```

**Error responses — never expose internals**
- Never return stack traces or database errors to the client.
- 500 → `{ "message": "Something went wrong. Please try again." }`
- 404 → `{ "message": "Resource not found" }`
- 401 → `{ "message": "Authentication required" }`
- 403 → `{ "message": "Access denied" }`

Full security rules: `docs/security.md`

---

## 6. Current Progress

**Always read `docs/progress.md` before doing anything.** That file is the single source of truth for which step is current, what is completed, and what is up next. Never assume — check it first.

---

## 7. Docs Reference

Read the relevant doc only when the current step requires it.

| File                     | Read when |
|--------------------------|---|
| `docs/progress.md`       | **Every session — read this first, always** |
| `docs/stack.md`          | Setting up the project or adding dependencies |
| `docs/architecture.md`   | Any backend layer work |
| `docs/db-schema.md`      | Any model or repository step |
| `docs/api-endpoints.md`  | Any controller or service step |
| `docs/frontend-guide.md` | Any frontend step (Steps 6–9, 12, 14, 15, 18, 19, 21) |
| `docs/security.md`       | Step 13 and the security phase |
| `docs/deployment.md`     | Deployment only — never during feature steps |
| `docs/design.md`         | Step 22 (frontend redesign) — read before starting, fill in before the session. |


---

## 8. Local Development

| Service | Address |
|---|---|
| Backend | localhost:8080 |
| Frontend | localhost:5173 |
| PostgreSQL | localhost:5432 |

- Database: `maktabah_db` / user: `postgres`
- Backend: `mvn spring-boot:run` from `backend/`
- Frontend: `npm run dev` from `frontend/`
- Vite proxies all `/api` calls to `localhost:8080` — no CORS issues in dev

Full deployment details: `docs/deployment.md`