# Maktabah — Database Schema

## Overview

- **Database:** PostgreSQL 18
- **ORM:** Spring Data JPA with Hibernate (included in Spring Boot 3.5.1)
- **All primary keys:** `BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY`
- **All credentials** come from environment variables — never hardcoded

---

## Tables

### fields

Stores top-level Islamic fields and their subfields. Self-referencing via `parent_field_id`.

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY GENERATED ALWAYS AS IDENTITY |
| name | VARCHAR(255) | NOT NULL UNIQUE |
| parent_field_id | BIGINT | NULLABLE REFERENCES fields(id) |

- Top-level fields have `parent_field_id = NULL`
- Subfields have `parent_field_id` pointing to their parent row
- Field names are unique across the entire table

**Exact field and subfield names as seeded in the database:**

| Top-level field | Subfields |
|---|---|
| Aqeedah | Ruboobiyah, Ulohiyyah, Al asma wa sifat |
| Fiqh | Hanafi, Maliki, Shafii, Hanbali |
| Hadith | Mustalah al-Hadith, Hadith Collections, Hadith Commentary (Sharh), Arbaeen & Selected Hadith |
| Seerah | Classical Seerah Works, Seerah Summaries, Shamail (Prophetic Characteristics) |

> These exact strings are used in SQL lookups (`WHERE name = '...'`). Do not change spelling or casing.

---

### books

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY GENERATED ALWAYS AS IDENTITY |
| title | VARCHAR(255) | NOT NULL |
| author | VARCHAR(255) | NOT NULL |
| author_bio | TEXT | NULLABLE |
| field_id | BIGINT | NOT NULL REFERENCES fields(id) |
| level | VARCHAR(50) | NOT NULL CHECK (level IN ('beginner','intermediate','advanced')) |
| description | TEXT | NULLABLE |
| pdf_filename | VARCHAR(500) | NOT NULL |

- `author_bio` was added to support the book detail modal on the frontend
- `pdf_filename` stores a relative path from the `pdfs/` folder
- Format: `fieldname/book-title-in-lowercase-hyphens.pdf`
- Example: `aqeedah/kitab-al-tawheed.pdf`
- Books are assigned to **subfields** (not top-level fields) — this is required for them to appear in the library

---

### roadmap_steps

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY GENERATED ALWAYS AS IDENTITY |
| field_id | BIGINT | NOT NULL REFERENCES fields(id) |
| book_id | BIGINT | NOT NULL REFERENCES books(id) |
| level | VARCHAR(50) | NOT NULL CHECK (level IN ('beginner','intermediate','advanced')) |
| step_order | INTEGER | NOT NULL |
| description | TEXT | NOT NULL |

- UNIQUE constraint on `(field_id, level, step_order)` — no duplicate positions within a field+level combination
- `field_id` on roadmap steps references the **top-level field** (Aqeedah, Fiqh, Hadith, Seerah) — not a subfield
- Seed data uses `WHERE NOT EXISTS` guards so it is safe to run multiple times

---

### masail

Stores fiqh issues. Invisible to all users until `verified = TRUE`.

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY GENERATED ALWAYS AS IDENTITY |
| title | VARCHAR(255) | NOT NULL |
| arabic_term | VARCHAR(255) | NULLABLE |
| category | VARCHAR(100) | NOT NULL |
| description | TEXT | NULLABLE |
| verified | BOOLEAN | NOT NULL DEFAULT FALSE |

- `verified = FALSE`: invisible to all users including paid users
- `verified = TRUE`: set only by admin after imam sign-off — never before
- Cannot be verified unless all four madhab opinions exist
- Fiqh categories: Taharah, Salah, Zakat, Sawm, Hajj, Nikah, Buyoo', Food and Drink, Dress and Appearance

---

### madhab_opinions

Four rows per masalah — one per madhab.

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY GENERATED ALWAYS AS IDENTITY |
| masalah_id | BIGINT | NOT NULL REFERENCES masail(id) |
| madhab | VARCHAR(50) | NOT NULL CHECK (madhab IN ('Hanafi','Maliki','Shafi''i','Hanbali')) |
| opinion | TEXT | NOT NULL |
| evidence | TEXT | NOT NULL |
| source_book | VARCHAR(255) | NULLABLE |
| source_page | VARCHAR(50) | NULLABLE |

---

### users

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY GENERATED ALWAYS AS IDENTITY |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(50) | NOT NULL DEFAULT 'user' CHECK (role IN ('user','scholar','admin')) |
| subscription_status | VARCHAR(50) | NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free','paid')) |
| stripe_customer_id | VARCHAR(255) | NULLABLE |
| stripe_subscription_id | VARCHAR(255) | NULLABLE |
| failed_attempts | INTEGER | NOT NULL DEFAULT 0 |
| lock_until | TIMESTAMP | NULLABLE |
| password_reset_token | VARCHAR(255) | NULLABLE |
| password_reset_expiry | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW() |

- Passwords hashed with BCrypt strength 12 — no exceptions
- Admin accounts created only via direct SQL INSERT — no public endpoint ever
- On `customer.subscription.deleted` webhook: set `subscription_status = 'free'`, clear `stripe_subscription_id`
- Login errors always return exactly `"Invalid email or password"` — never reveal which field was wrong
- `forgot-password` always returns 200 regardless of whether the email exists
- Webhook user lookup: find by email first, fall back to `stripe_customer_id`

---

### user_progress

Tracks which roadmap steps each user has completed.

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY GENERATED ALWAYS AS IDENTITY |
| user_id | BIGINT | NOT NULL REFERENCES users(id) ON DELETE CASCADE |
| roadmap_step_id | BIGINT | NOT NULL REFERENCES roadmap_steps(id) |
| completed | BOOLEAN | NOT NULL DEFAULT FALSE |
| completed_at | TIMESTAMP | NULLABLE |

- UNIQUE constraint on `(user_id, roadmap_step_id)`
- Use `findCompletedStepIdsByUserId` with `@Query` returning `List<Long>` — avoids LazyInitializationException

---

### token_blacklist

Stores revoked JWTs by their `jti` claim so logged-out tokens cannot be reused.

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY GENERATED ALWAYS AS IDENTITY |
| token_id | VARCHAR(255) | NOT NULL UNIQUE |
| expires_at | TIMESTAMP | NOT NULL |

- `token_id` is the JWT `jti` claim — a UUID generated at token creation time
- Every authenticated request checks this table before proceeding
- A `@Scheduled` job runs daily at midnight and deletes all rows where `expires_at < NOW()`
- `MaktabahApplication.java` must have `@EnableScheduling` for the scheduled job to run

---

## Access Rules Summary

| Content | Who can access |
|---|---|
| Browse books (listing) | Public — no login required |
| Download a PDF | Logged in (any subscription) |
| Roadmap steps | Logged in (any subscription) |
| Fiqh Tool / masail | Logged in + paid subscription |
| Admin endpoints | Logged in + role = 'admin' |
| Unverified masalah | Nobody — not even via the public API |