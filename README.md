# Maktabah

A web-based Islamic knowledge platform for Muslim students at beginner, intermediate, and advanced levels. 

## What it does

**Book Library** — Browse and download Islamic PDF books organized by field and level, covering Aqeedah, Fiqh, Hadith, and Seerah.

**Learning Roadmap** — Guided learning paths with step-by-step book recommendations. Users track their own progress by marking steps complete.

**Fiqh Comparison Tool** — Search a fiqh issue and see all four madhab positions (Hanafi, Maliki, Shafi'i, Hanbali) side by side with evidences and sources. Every ruling is verified by a real scholar before it goes live.

## Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Backend | Spring Boot 3.5.1 |
| ORM | Spring Data JPA + Hibernate |
| Database | PostgreSQL 18 |
| Auth | JWT (jjwt 0.12.6) via HttpOnly cookies |
| Frontend | HTML, CSS, Vanilla JS (ES6+) |
| Build Tool | Vite 5.x |
| Payments | Stripe Java SDK 24.x |

## Architecture

Strict layered architecture — Controller → Service → Repository. No skipping, no reversing.

- **Controller** — HTTP only, no business logic
- **Service** — All business logic. Entities are always converted to DTOs before being returned
- **Repository** — All database access via JPA
- **Model** — JPA entities only, zero business logic
- **DTO** — Plain Java classes. Raw JPA entities are never returned from a service

## Access levels

| User | Access |
|------|--------|
| Not logged in | Browse the library |
| Free account | Browse and download PDF books |
| Paid account | Library, roadmap with completion tracking, fiqh tool |
| Scholar | Own panel to add, edit, and verify fiqh rulings |
| Admin | Everything above plus managing books, roadmap, and users |

## Project structure

\```
Maktabah/
├── backend/src/main/java/com/maktabah/
│   ├── model/
│   ├── dto/
│   ├── repository/
│   ├── service/
│   ├── controller/
│   ├── security/
│   └── exception/
├── frontend/src/
│   ├── pages/
│   ├── components/
│   ├── api.js
│   ├── auth.js
│   └── main.js
└── pdfs/
    ├── aqeedah/
    ├── fiqh/
    ├── hadith/
    └── seerah/
\```

## Running locally

Prerequisites: Java 21, Node.js, PostgreSQL 18

\```bash
# Backend — runs on localhost:8080
cd backend
mvn spring-boot:run

# Frontend — runs on localhost:5173
cd frontend
npm install
npm run dev
\```

Database: `maktabah_db` on `localhost:5432`, user `postgres`.

Vite proxies all `/api` calls to the backend so there are no CORS issues in development.

## Fiqh content rules

Unverified content is never shown to any user under any circumstance — all queries filter by `verified = true`. A ruling cannot be marked verified unless all four madhab opinions are present. Only scholars and admins can verify. Scholar and admin accounts are created via direct database access, not through the registration flow.

## Security

- All secrets in environment variables, never hardcoded
- JWTs stored in HttpOnly cookies only
- Role checks enforced on both frontend and backend
- Error responses never expose stack traces or internal details


## Claude code

This project is made with help from Claude code, the whole project was made to improve my Java Fullstack skills aswell as learning to work with Claude Code in a professional way.
