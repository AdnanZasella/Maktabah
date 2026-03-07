# Maktabah — Stack Reference

## Overview

| Layer | Technology | Version |
|---|---|---|
| Language | Java | 21 |
| Backend framework | Spring Boot | 3.5.1 |
| Database ORM | Spring Data JPA with Hibernate | included in Spring Boot 3.5.1 |
| Database | PostgreSQL | 18 |
| JWT library | jjwt by io.jsonwebtoken | 0.12.6 |
| Frontend | HTML, CSS, vanilla JavaScript | ES6+ |
| Frontend build tool | Vite | 5.x |
| Payments | Stripe Java SDK | 24.22.0 |
| Rate limiting | Bucket4j | 8.x (security phase only) |
| Connection pool | HikariCP | included in Spring Boot 3.5.1 |
| Mobile (future) | React Native | after website is complete |

**Do not upgrade any version without an explicit decision to do so.**

---

## Backend

### Java 21
- Language level used throughout the project
- No preview features
- Installed via apt on the production VPS

### Spring Boot 3.5.1
The backbone of the backend. Provides:
- Embedded Tomcat server on port 8080
- Auto-configuration for JPA, Security, Mail, Validation
- `spring-boot-devtools` for hot reload during development
- `spring-boot-starter-validation` for `@Valid` input validation (used in security phase)

### Spring Data JPA + Hibernate
- All database access goes through JPA repositories
- Hibernate is the JPA implementation — included automatically with Spring Boot
- `spring.jpa.hibernate.ddl-auto=update` — Hibernate manages schema changes automatically
- `spring.jpa.show-sql=false` in all environments — SQL logging off by default
- Dialect: `org.hibernate.dialect.PostgreSQLDialect`

### PostgreSQL 18
- Primary database
- Local dev: runs on `localhost:5432`, database name `maktabah_db`, user `postgres`
- Production: runs on the same VPS as Spring Boot, never exposed to public internet
- Driver: `org.postgresql.Driver` (runtime scope dependency)

### HikariCP Connection Pool
- Included with Spring Boot — no separate dependency needed
- Configuration in `application.properties`:
    - `maximum-pool-size=10`
    - `minimum-idle=2`
    - `connection-timeout=30000` (30 seconds)
    - `idle-timeout=600000` (10 minutes)

### jjwt 0.12.6 (io.jsonwebtoken)
Three dependencies required — all three must be present:
- `jjwt-api` — compile scope
- `jjwt-impl` — runtime scope
- `jjwt-jackson` — runtime scope

JWT claims used in this project: `userId` (subject), `email`, `role`, `subscriptionStatus`, `jti` (UUID).
Token expiry: 7 days.
Stored in HttpOnly cookie named `jwt`.

### Stripe Java SDK 24.22.0
- Used for creating checkout sessions and verifying webhook events
- **Critical**: use `deserializeUnsafe()` NOT `getObject()` when parsing webhook event objects
  — `getObject()` returns empty due to API version mismatch with SDK 24.x
- Webhook signature must be verified on every incoming event before processing
- Stripe CLI used locally: `stripe listen --forward-to localhost:8080/api/payment/webhook`

### Bucket4j 8.x
- Rate limiting library — **not added until the security hardening phase**
- Do not include in `pom.xml` until Security 6 (Rate limiting and account lockout)

### Spring Boot Mail
- Used for password reset emails only
- Configured via `spring.mail.*` properties
- Provider: Brevo or Resend free tier in production

---

## Required pom.xml Dependencies

```xml
<!-- Spring Boot Starters -->
<dependency>spring-boot-starter-web</dependency>
<dependency>spring-boot-starter-data-jpa</dependency>
<dependency>spring-boot-starter-security</dependency>
<dependency>spring-boot-starter-validation</dependency>
<dependency>spring-boot-starter-mail</dependency>
<dependency>spring-boot-devtools</dependency>

<!-- Database -->
<dependency>postgresql (runtime scope)</dependency>

<!-- JWT — all three required -->
<dependency>jjwt-api 0.12.6</dependency>
<dependency>jjwt-impl 0.12.6 (runtime scope)</dependency>
<dependency>jjwt-jackson 0.12.6 (runtime scope)</dependency>

<!-- Stripe -->
<dependency>stripe-java 24.22.0</dependency>

<!-- Rate limiting — security phase only -->
<dependency>bucket4j-core 8.x</dependency>
```

---

## Frontend

### Vanilla JavaScript (ES6+)
- No framework — no React, no Vue, no Angular
- ES6 modules throughout (`import` / `export`)
- Hash-based client-side routing — no router library

### Vite 5.x
- Dev server on `localhost:5173`
- Proxies all `/api/` requests to `localhost:8080` during development
- Build command: `npm run build` — outputs to `frontend/dist/`
- Output is plain HTML, CSS, JS — no Node.js needed on the server

### style.css
- Global stylesheet
- CSS variables for color palette
- No CSS preprocessor (no Sass, no Less)
- No CSS framework (no Tailwind, no Bootstrap)

---

## application.properties Template

All secret values come from environment variables. Never hardcode secrets.

```properties
# Server
server.port=8080

# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# HikariCP
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

# Email
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# App base URL
app.base.url=${APP_BASE_URL}

# Logging
logging.level.com.maktabah=INFO
logging.file.name=logs/maktabah.log
```

---

## Environment Variables

### Local Development
Set in Windows system environment variables.
**IntelliJ must be fully closed and reopened to pick up newly added variables.**

| Variable | Example Value |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/maktabah_db` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | your local password |
| `JWT_SECRET` | random string, minimum 64 characters |
| `PDF_STORAGE_PATH` | `C:\Users\adnan\IdeaProjects\Maktabah\pdfs` (no trailing slash) |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PRICE_ID` | `price_...` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | your email |
| `MAIL_PASSWORD` | your app password |
| `APP_BASE_URL` | `http://localhost:5173` |

### Production
Set in `/opt/maktabah/.env` on the VPS, referenced by the systemd service file.
File permissions: `chmod 600` — only the `maktabah` system user can read it.
Never committed to version control.

Additional production variable:

| Variable | Value |
|---|---|
| `FRONTEND_URL` | `https://maktabah.com` |

---

## Ports

| Service | Address |
|---|---|
| Backend (Spring Boot) | `localhost:8080` |
| Frontend (Vite dev server) | `localhost:5173` |
| PostgreSQL | `localhost:5432` |

Both backend and frontend must run simultaneously during development.

---

## Run Commands

```bash
# Backend — from backend/ folder
mvn spring-boot:run
or run "MaktabahApplication" in intellij

# Frontend — from frontend/ folder
npm run dev

# Frontend production build — from frontend/ folder
npm run build

# Stripe webhook forwarding (local dev) — keep this terminal open
stripe listen --forward-to localhost:8080/api/payment/webhook
```

---

## Package and File Locations

| What | Where |
|---|---|
| Java root package | `com.maktabah` (NOT `com.maktabah.backend`) |
| App entry point | `backend/src/main/java/com/maktabah/MaktabahApplication.java` |
| Properties file | `backend/src/main/resources/application.properties` |
| Frontend entry | `frontend/src/main.js` |
| Frontend API layer | `frontend/src/api.js` |
| PDF files | `Maktabah/pdfs/aqeedah/`, `fiqh/`, `hadith/`, `seerah/` |
| Log output | `logs/maktabah.log` |

---

## What Is NOT Used

- No Lombok — all getters/setters written manually
- No MapStruct — entity-to-DTO conversion done manually in service layer
- No Redis — token blacklist stored in PostgreSQL (`token_blacklist` table)
- No message queue — all operations synchronous
- No Docker — direct installation on VPS
- No ORM other than Hibernate — no raw JDBC, no MyBatis
- No CSS framework — plain CSS with variables
- No JS framework — plain ES6+ vanilla JS
- No external router — hash routing handled manually in `main.js`