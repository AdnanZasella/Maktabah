# Maktabah — Security Reference

## Overview

Security is implemented in two phases:

**Phase 1 — Built into the main steps (Steps 1–18)**
Core authentication and authorisation are wired during the main build.
JWT cookies, password hashing, role checks, and Stripe webhook verification
are all part of the normal feature steps — not bolted on later.

**Phase 2 — Dedicated security hardening (Security 1–16)**
After Step 18 is complete, a full security pass is done covering rate limiting,
input validation, security headers, CORS lockdown, file upload validation, and more.

This document covers everything — both phases — as the complete security reference.

---

## Security Checklist

### Phase 1 — Built During Main Steps
- [x] Environment variables for all secrets — from day one
- [x] JWT in HttpOnly cookie — Step 13
- [x] BCrypt password hashing — Step 13
- [x] Token blacklist (logout / revocation) — Step 13
- [x] Role-based access control (user / admin) — Step 13
- [x] Subscription-based access control (free / paid) — Step 15
- [x] Stripe webhook signature verification — Step 15
- [x] Never return stack traces to the client — GlobalExceptionHandler

### Phase 2 — Security Hardening (post Step 18)
- [ ] Security 1 — HTTPS and SSL certificate
- [ ] Security 2 — Environment variables audit
- [ ] Security 3 — PDF file protection
- [ ] Security 4 — Stripe webhook verification hardening
- [ ] Security 5 — JWT HttpOnly cookie audit
- [ ] Security 6 — Rate limiting and account lockout
- [ ] Security 7 — Input validation
- [ ] Security 8 — Security headers and CORS lockdown
- [ ] Security 9 — Database user permissions
- [ ] Security 10 — Error message security
- [ ] Security 11 — Logging and monitoring
- [ ] Security 12 — Password reset security
- [ ] Security 13 — Dependency vulnerability scanning
- [ ] Security 14 — Admin panel security
- [ ] Security 15 — File upload validation
- [ ] Security 16 — Session management and token revocation

---

## Authentication

### JWT Storage
- JWT is stored **exclusively** in an HttpOnly cookie named `jwt`
- Never stored in `localStorage` or `sessionStorage` — ever, no exceptions
- JavaScript cannot read the cookie — this is intentional and required
- Cookie flags:
    - `HttpOnly=true` — prevents JavaScript access
    - `Secure=true` — only sent over HTTPS
    - `SameSite=Strict` — not sent on cross-site requests

### JWT Contents
Every token contains these claims:

| Claim | Value |
|---|---|
| Subject (`sub`) | userId as string |
| `email` | user's email address |
| `role` | `user` or `admin` |
| `subscriptionStatus` | `free` or `paid` |
| `jti` | UUID generated at token creation time |
| Expiry | 7 days from issue |

### JWT Validation — Every Authenticated Request
Every request that hits a protected endpoint goes through `JwtAuthFilter.java`:
1. Read the `jwt` cookie from the request
2. Verify the signature using the secret from `JWT_SECRET` env var
3. Check the token has not expired
4. Check the `jti` is NOT in the `token_blacklist` table
5. If all checks pass — set the Spring Security principal to the userId string
6. Controllers extract userId via: `Long.parseLong(authentication.getName())`

If any check fails → return 401 with `{ "message": "Authentication required" }`.

### Token Expiry
- 7 days
- Configured via `jwt.expiration.days=7` in `application.properties`
- After expiry the user must log in again — no refresh token mechanism

---

## Token Blacklist

### Purpose
Enables true logout. Without a blacklist, a JWT is valid until it expires —
logging out would only clear the cookie on the client, but the token itself
would still be technically valid if someone had captured it.

### How It Works
- Every JWT gets a unique `jti` (JWT ID) claim — a UUID generated at token creation
- On logout: the `jti` and its expiry timestamp are inserted into `token_blacklist`
- On every authenticated request: `JwtAuthFilter` checks the `jti` is NOT in the table
- A `@Scheduled` job runs daily at midnight and deletes all rows where `expires_at < NOW()`
  — keeps the table from growing indefinitely
- `MaktabahApplication.java` must have `@EnableScheduling` for the cleanup job to run

### token_blacklist Table
```sql
id          BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY
token_id    VARCHAR(255) NOT NULL UNIQUE   -- the jti UUID
expires_at  TIMESTAMP   NOT NULL
```

---

## Password Security

### Hashing
- BCrypt with strength 12 — no exceptions, never change this
- Minimum password length: 8 characters
- Maximum password length: 100 characters
- Hashed in `AuthService.java` before saving to database

### Login Error Message
Login failure always returns exactly: **"Invalid email or password"**
Never reveal which field was wrong. Never say "email not found" or "wrong password".
This applies to the API response and to what the frontend displays.

### Account Lockout (Security Phase 6)
- After repeated failed login attempts, the account is locked temporarily
- `failed_attempts` and `lock_until` columns on the `users` table track this
- Lockout logic implemented during Security 6 — not during the main steps

### Forgot Password
- `POST /api/auth/forgot-password` always returns HTTP 200 regardless of whether
  the email exists in the database
- Never reveal whether a specific email is registered
- A time-limited token is stored in `password_reset_token` and `password_reset_expiry`
  on the user row
- Reset link sent via email contains the token
- `POST /api/auth/reset-password` validates the token and expiry before allowing change

---

## Authorisation

### Three Access Levels

⚠ TODO — Step 19: Add scholar tier here before writing any code.
Scholar (role = 'scholar'):
- Access to /api/scholar/** endpoints only
- Can add, edit, delete, and verify masail and madhab opinions
- Cannot access /api/admin/** or any book, user, or roadmap endpoints
- Backend rejects with 403 if a scholar hits any non-scholar protected endpoint
- Role check on BOTH frontend (do not render #/scholar for non-scholars) AND backend

**Public — no authentication required**
- Browse fields and subfields
- Browse book listings
- View fiqh categories
- Register and login
- Stripe webhook (verified by signature, not JWT)

**Authenticated (any logged-in user)**
- Download PDF books
- View and interact with roadmap
- Mark roadmap steps as complete
- Manage account and subscription

**Paid (subscriptionStatus = 'paid')**
- Search and browse masail (fiqh tool)
- View madhab opinions with evidence

**Admin (role = 'admin')**
- All admin endpoints under `/api/admin/**`
- Manage books, masail, and users
- Verify masail after imam sign-off

### Authorisation Rules
- `401 Unauthorized` — no cookie, invalid token, or expired token
- `403 Forbidden` — valid token but insufficient role or subscription
- Paid check: `subscriptionStatus` must equal exactly the string `'paid'`
- Admin check: `role` must equal exactly the string `'admin'`
- Role and subscription checks happen in the **backend** — always
- Frontend checks (hiding UI elements) are a convenience only, never relied on for security

### Admin Account Creation
Admin accounts are created **only** via direct SQL INSERT into the `users` table.
There is no public endpoint for creating admin accounts. Ever.

```sql
INSERT INTO users (email, password_hash, role, subscription_status)
VALUES ('admin@maktabah.com', '$2a$12$...bcrypt_hash...', 'admin', 'free');
```

---

## Fiqh Content Protection

### Masalah Visibility Rule
A masalah is **never** shown to any user — including paid users — unless `verified = TRUE`.

The verification flow:
1. Admin adds masalah with all four madhab opinions via `POST /api/admin/masail`
2. Imam reviews the content offline
3. After imam sign-off, admin clicks Verify in the admin panel
4. `PUT /api/admin/masail/{id}/verify` sets `verified = TRUE`
5. Masalah now becomes visible to paid users in the fiqh tool

This rule is enforced in `MasalahService.java` — all queries filter on `verified = TRUE`.
No fiqh ruling goes live without imam verification. No exceptions.

---

## PDF Protection

### Access Control
PDFs are never served from a publicly accessible URL.
Every download goes through the protected endpoint:
`GET /api/books/{id}/download` — requires valid JWT (any subscription).

### Storage
PDFs are stored on the server filesystem, not in the `public/` or `static/` folder.
The path is configured via `PDF_STORAGE_PATH` environment variable.
Spring Boot serves them programmatically — they are not directly accessible via URL.

### Response Headers
```
Content-Disposition: attachment; filename="book-title.pdf"
```

### File Not Found
If the file exists in the database but not on disk: return 404 with
`{ "message": "Book file not found" }`.

### Upload Validation (Security Phase 15)
When admin uploads a PDF via `POST /api/admin/books`:
- Validate by magic bytes (first 4 bytes must be `%PDF`) — not by file extension alone
- Rename to the correct convention: lowercase, hyphens, `.pdf`
- Save to the correct subfolder matching the book's field
- Reject anything that is not a real PDF

---

## Stripe Webhook Security

### Signature Verification
Every incoming request to `POST /api/payment/webhook` must have its signature verified
before any processing occurs. Reject with HTTP 400 if the signature is invalid.

```java
// In PaymentController.java
try {
    Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
    paymentService.handleEvent(event);
    return ResponseEntity.ok().build();
} catch (SignatureVerificationException e) {
    return ResponseEntity.badRequest().build();
} catch (Exception e) {
    // Catches NumberFormatException from malformed timestamps and other edge cases
    return ResponseEntity.badRequest().build();
}
```

Both `SignatureVerificationException` AND `Exception` must be caught.
Malformed signature timestamps throw `NumberFormatException` which bypasses
a catch block that only handles `SignatureVerificationException`.

### Webhook Event Parsing
Use `deserializeUnsafe()` — NOT `getObject()` — when extracting event data objects.
`getObject()` returns empty due to Stripe API version mismatch with stripe-java 24.x SDK.

### Payment Trust Rule
Never trust the frontend to confirm a payment.
The only source of truth for subscription status is the Stripe webhook.
`checkout.session.completed` → set `subscription_status = 'paid'`
`customer.subscription.deleted` → set `subscription_status = 'free'`

---

## Error Handling and Information Leakage

### GlobalExceptionHandler.java
Catches all unhandled exceptions and returns clean JSON — never stack traces.

| Situation | HTTP Status | Response Body |
|---|---|---|
| Resource not found | 404 | `{ "message": "Resource not found" }` |
| Not authenticated | 401 | `{ "message": "Authentication required" }` |
| Insufficient permissions | 403 | `{ "message": "Access denied" }` |
| Any server error | 500 | `{ "message": "Something went wrong. Please try again." }` |

All detailed error information — stack traces, SQL errors, Hibernate messages —
goes to the log file only. Never to the client.

### What Never Goes to the Client
- Java stack traces
- Hibernate or database error messages
- SQL query details
- Which specific field caused a validation failure (in login — just say "Invalid email or password")
- Whether a specific email address is registered in the system
- Internal file paths

---

## Secrets Management

### Rule
All secrets live in environment variables. Never written in source code.
`application.properties` reads secrets using `${VARIABLE_NAME}` syntax only.

### What Counts as a Secret
- Database password
- JWT secret key (must be at least 64 characters long)
- Stripe secret key
- Stripe webhook secret
- Stripe price ID
- Email account password
- Any API key

### Local Development
Set as Windows system environment variables.
IntelliJ must be fully closed and reopened after adding new variables.

### Production
Stored in `/opt/maktabah/.env` on the VPS.
Referenced by the systemd service file via `EnvironmentFile=/opt/maktabah/.env`.
File permissions: `chmod 600` — only the `maktabah` system user can read it.

### Version Control
`.env` files with real values are in `.gitignore` — never committed.
An `.env.example` file with placeholder values is safe to commit.

---

## CORS Configuration

### Rules
- Configured in `SecurityConfig.java` only — never in individual controllers
- Never use wildcard `*` for allowed origins in any environment
- `allowCredentials = true` is required for cookies to work cross-origin

### Allowed Origins
- Development: `http://localhost:5173`
- Production: `https://maktabah.com` (read from `FRONTEND_URL` env var)

`SecurityConfig.java` reads the allowed origin from `app.frontend.url` property
so the same config works in both environments without code changes.

### Allowed Methods
`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

### Allowed Headers
`Content-Type`, `Authorization`

---

## SecurityConfig — Public vs Protected Endpoints

```
PUBLIC (no authentication required):
  /api/auth/**
  /api/fields/**
  GET /api/books          (browsing — listing only)
  GET /api/masail/categories
  /api/payment/webhook

AUTHENTICATED (valid JWT required):
  GET /api/books/{id}/download
  GET /api/roadmap/**
  GET /api/progress/**
  POST /api/progress/**
  POST /api/payment/create-checkout
  /api/masail/**          (also requires paid subscription — checked in service)

ADMIN (valid JWT + role = 'admin'):
  /api/admin/**
```

---

## Security Phase 2 — What Each Step Does

### Security 1 — HTTPS and SSL Certificate
Install Certbot on the VPS. Obtain Let's Encrypt certificate for the domain.
Configure Nginx to redirect HTTP → HTTPS and serve on port 443.
Spring Boot itself does not handle HTTPS — Nginx handles it.

### Security 2 — Environment Variables Audit
Verify no secrets exist anywhere in source code or committed config files.
Confirm `.gitignore` covers all `.env` variants.
Check `application.properties` uses only `${VARIABLE}` references.

### Security 3 — PDF File Protection
Verify PDFs are not accessible via direct URL.
Confirm download endpoint checks JWT before serving any file.
Verify `Content-Disposition: attachment` header is set on all PDF responses.

### Security 4 — Stripe Webhook Verification Hardening
Audit that every webhook code path verifies the signature before processing.
Confirm both `SignatureVerificationException` and `Exception` are caught.
Confirm `deserializeUnsafe()` is used, not `getObject()`.

### Security 5 — JWT HttpOnly Cookie Audit
Verify `HttpOnly=true`, `Secure=true`, `SameSite=Strict` on the JWT cookie.
Verify no JWT value is ever written to `localStorage` or `sessionStorage`.
Verify `jti` is checked against `token_blacklist` on every authenticated request.

### Security 6 — Rate Limiting and Account Lockout
Add Bucket4j dependency (`bucket4j-core 8.x`) — only added at this step.
Rate limit login endpoint to prevent brute force.
Implement `failed_attempts` counter on users table.
Lock account temporarily after N consecutive failures using `lock_until` column.

### Security 7 — Input Validation
Add `@Valid` annotations to controller method parameters.
Add Bean Validation constraints (`@NotBlank`, `@Email`, `@Size`) to DTOs.
Validate all user-supplied strings — especially search queries and free text fields.
Return 400 with a generic message for validation failures — never expose field details.

### Security 8 — Security Headers and CORS Lockdown
Add HTTP security headers via Spring Security:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
  Lock CORS to production domain only — remove any development origins.

### Security 9 — Database User Permissions
Create a dedicated PostgreSQL user for the application with least-privilege permissions.
Grant only `SELECT`, `INSERT`, `UPDATE`, `DELETE` on the application tables.
Revoke `CREATE`, `DROP`, `ALTER` from the application user.
Schema migrations (DDL) are only run by a separate admin user manually.

### Security 10 — Error Message Security
Audit every API response — confirm no stack traces, SQL, or internal paths leak.
Confirm `GlobalExceptionHandler` catches all exception types.
Confirm login error always returns exactly "Invalid email or password".
Confirm forgot-password always returns 200 regardless of email existence.

### Security 11 — Logging and Monitoring
Verify `logging.file.name=logs/maktabah.log` is configured.
Log all admin actions: admin email, action, affected resource ID, timestamp.
Log all authentication events: login success, login failure, logout.
Log all payment events: webhook received, subscription changed.
Never log passwords, tokens, or full JWT strings.

### Security 12 — Password Reset Security
Verify reset tokens are cryptographically random and sufficiently long.
Verify `password_reset_expiry` is checked before allowing a reset.
Verify token is deleted from the database immediately after use.
Verify reset tokens cannot be reused.

### Security 13 — Dependency Vulnerability Scanning
Run `mvn dependency-check:check` (OWASP dependency check plugin).
Review output for any HIGH or CRITICAL vulnerabilities.
Update or replace any vulnerable dependencies.

### Security 14 — Admin Panel Security
Verify every admin endpoint checks `role = 'admin'` on the backend — not just frontend.
Verify admin panel route renders 404 (not redirect) for non-admin users.
Verify all admin actions are logged with timestamp and admin identity.
Verify masail cannot be verified unless all four madhab opinions exist.

### Security 15 — File Upload Validation
Validate uploaded files by magic bytes — not file extension alone.
PDF magic bytes: first 4 bytes must be `25 50 44 46` (`%PDF`).
Reject files that fail the magic bytes check with a 400 error.
Enforce maximum file size limit.
Rename all uploaded files to the safe convention before saving.

### Security 16 — Session Management and Token Revocation
Verify token blacklist cleanup job is running (daily at midnight).
Verify `@EnableScheduling` is on `MaktabahApplication.java`.
Test that a blacklisted token is rejected even before its expiry.
Verify logout correctly inserts `jti` into `token_blacklist`.

---

## Quick Reference — Things That Must Never Happen

| Never Do This | Reason |
|---|---|
| Store JWT in localStorage or sessionStorage | XSS can steal it |
| Use wildcard `*` in CORS allowed origins | Opens API to any domain |
| Return stack traces to the client | Exposes internals to attackers |
| Reveal whether an email is registered | Account enumeration attack |
| Trust the frontend to confirm Stripe payment | Can be spoofed — webhook only |
| Serve PDFs from a public URL | Bypasses access control |
| Show a masalah with verified=false | Unverified fiqh content goes live |
| Hardcode any secret in source code | Gets committed to git |
| Skip Stripe webhook signature verification | Fake webhooks can change subscription status |
| Let one service call another service | Breaks the architecture, creates hidden coupling |
| Call a repository from a controller | Bypasses business logic layer |
| Create admin accounts via a public endpoint | Allows anyone to become admin |




