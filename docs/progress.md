# Maktabah — Progress Tracker

## Current Status
- **Currently Working On:** Step 23 — Mobile responsiveness pass
- **Last Completed:** Step 22 — Frontend redesign + UI polish (completed 2026-03-10)

---

## Step Checklist

- [x] Step 1 — Spring Boot setup and PostgreSQL connection
- [x] Step 2 — Field model and repository
- [x] Step 3 — Book model and repository
- [x] Step 4 — Field and Book service and controllers
- [x] Step 5 — PDF file serving endpoint
- [x] Step 6 — Frontend basic page showing fields
- [x] Step 7 — Click field to show books
- [x] Step 8 — PDF download button
- [x] Step 9 — Styling and layout polish
- [x] Step 10 — Roadmap models and database tables
- [x] Step 11 — Roadmap API endpoints
- [x] Step 12 — Roadmap frontend page
- [x] Step 13 — User registration and login
- [x] Step 14 — Progress tracking
- [x] Step 15 — Stripe payments and access control
- [x] Step 16 — Masalah and MadhabOpinion models
- [x] Step 17 — Fiqh Tool API endpoints
- [x] Step 18 — The Fiqh Tool frontend page
- [x] Step 19 — Admin panel: backend (AdminController — users, books, roadmap, masail endpoints) + frontend (admin.js, #/admin route in main.js)
- [x] Step 20 — Scholar role: backend (User model role update, ScholarController, scholar-only masail API endpoints)
- [x] Step 21 — Scholar panel frontend (scholar.js, #/scholar route in main.js)
- [x] Step 22 — Frontend redesign (complete — home ✓, navbar ✓, account ✓, library ✓, roadmap ✓, fiqhtool ✓, login ✓, register ✓, admin ✓, scholar ✓)
- [ ] Step 23 — Mobile responsiveness pass (all pages)

---

## Security Checklist

- [ ] Security 1 — HTTPS and SSL certificate
- [ ] Security 2 — Environment variables for secrets
- [ ] Security 3 — PDF file protection
- [ ] Security 4 — Stripe webhook verification
- [ ] Security 5 — JWT HttpOnly cookies
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

## Confirmed Business Logic

### Access and Roles
- Roles in database: `user`, `scholar`, `admin`
- `user` — registered via public endpoint
- `scholar` and `admin` — created only via direct SQL INSERT, no public registration
- Scholar accounts are given to the imams/scholars who manage fiqh content

### Access by tier
- PDF downloads: FREE for all logged-in users — no subscription required
- Roadmap: visible to all logged-in users — clicking a node shows upgrade modal for free users
- Fiqh Tool: visible to all logged-in users — search/category click shows upgrade modal for free users
- Unauthenticated users redirected to #/login for roadmap and fiqh tool
- GET /api/books (listing) is PUBLIC — no login needed to browse
- GET /api/books/{id}/download requires login (any subscription)
- GET /api/masail/** requires login + paid (enforced in MasalahController — Step 17)
- GET /api/masail/categories is PUBLIC

### Scholar panel (#/scholar)
- Scholars log in with their account and land on #/scholar
- They can add, edit, remove masail and all four madhab opinions
- They verify masail themselves by clicking the verify button — this sets verified=true and makes the masalah visible to paid users
- A masalah cannot be verified unless all four madhab opinions are present
- Scholars cannot access #/admin or touch books, users, or roadmap
- Role check on BOTH frontend (do not render) AND backend (reject with 403) — never frontend alone

### Fiqh content integrity
- Never query masail without filtering verified=true — unverified content must never reach any user
- Showing unverified fiqh content is a content integrity failure, not just a bug

---

## Key Decisions and Fixes Made

### Step 15
- PaymentService.java: use `deserializeUnsafe()` NOT `getObject()` for all 4 webhook events
- PaymentController.java: catch both `SignatureVerificationException` AND `Exception` — both return 400
- Webhook user lookup: findByEmail() first, fall back to findByStripeCustomerId()
- account.js: parse payment param from `window.location.hash` NOT `window.location.search`
- createCheckout() in api.js returns URL string directly (`data.url`)
- main.js getRoute(): strips query params before route matching
- GET /api/books added as permitAll in SecurityConfig
- Books must be assigned to subfields (not top-level fields) to appear in library

### Step 14
- UserProgressRepository: use `findCompletedStepIdsByUserId` (@Query returning List<Long>) — avoids LazyInitializationException
- SecurityConfig AuthenticationEntryPoint: returns 401 with `{ "message": "Authentication required" }`

### Step 13
- JwtAuthFilter principal is the userId string — controllers extract via `Long.parseLong(authentication.getName())`
- Cookie name: `jwt`
- clearUserCache() must be called after login/logout so auth.js re-fetches from /api/auth/me
- 
### 2026-03-12 — Extended UI polish session
- Navbar: frosted glass effect, nav links white, text-shadow for contrast over hero
- Hero: flush to navbar (no gap), radial vignette behind headline for text readability
- Buttons: `.btn-primary-lg` and `.glass-card` hover — lift + emerald glow + active press state
- Stats strip: glass bg, white borders, vertical cell dividers, brighter labels, more padding
- Pricing cards: Premium card gold border/glow/bg tint; all body text brightened; free card specific brightness override; toggle unselected text brighter
- New sections: Testimonials (3 glass cards, matches features panel) + CTA banner above footer
- Footer quote updated to Quran 39:9
- Library: 2-column grid, field card fixed height removed (stretch), all accent borders unified to gold
- Filter tabs (library levels, roadmap levels+fields, fiqhtool categories): larger padding/font, visible unselected, gold active state. Roadmap field active = gold border only (not filled)
- Next: Mobile responsiveness pass (Step 23)

### 2026-03-10 — UI polish completed (post Step 22)
- Hero background image (6000×3376 Islamic bookshelf) with dark overlay + bottom fade
- Floating panel system: all content sections (features, pricing, page-content, admin) are rounded panels on dark base
- Panel backgrounds lightened for contrast: #2a3f32 (features/page-content), #304838 (pricing)
- --bg-base lightened to #1f3029, navbar set to same color as base
- Stats strip kept full-width, lightened to #2a3f32
- overflow: clip on .page-content to clip library-hero to rounded corners without breaking sticky
- Payment webhook race condition fixed: account.js now polls up to 6× (2s apart) when returning from Stripe
- Next: Mobile responsiveness pass

### 2026-03-09 — Step 22 in progress (home + navbar + account + library + roadmap + fiqhtool done)
- Full dark design system implemented in style.css (CSS variables, Playfair Display + Inter fonts)
- Navbar: centered logo, gold nav links, gold pill CTA
- Home: hero, stats, 3 feature cards, pricing toggle (129kr/1160kr), footer. "Begin Your Journey" button fixed → goes to #/account (not #/register)
- Account: glass info card + pricing section with monthly/yearly toggle
- Library: library-hero section (eyebrow + Playfair title), dark glass field/book cards, green gradient download button, dark modal. fieldcard.js accent colors updated to dark palette.
- Roadmap: library-hero header, dark glass left panel, field buttons use accent as border/glow when active (removed old inactiveBg/activeBtn/activeText keys), dark node circles with green gradients, upgrade modal uses btn-gold-full
- Fiqh Tool: library-hero header (gold accent on "Madhab"), dark search input with search icon, glass category pills, dark masalah list, madhab cards redesigned with per-madhab colored borders + 3px bottom gradient bar via ::after
- Pages confirmed by user: home ✓, navbar ✓, account ✓, library ✓, roadmap ✓, fiqhtool ✓
- Next: admin.js → scholar.js

### 2026-03-08 — Step 21 completed
- scholar.js: full masail CRUD panel (list with sort/filter, add, edit, delete, verify)
- main.js: /scholar route added, non-scholar sees 404 (same guard pattern as /admin)
- api.js: 5 scholar API functions added (scholarGetAllMasail, scholarAddMasalah, scholarUpdateMasalah, scholarDeleteMasalah, scholarVerifyMasalah)
- navbar.js: Scholar link shown only when user.role === 'scholar'
- auth.js: isScholar() helper added
- Unverified rows visually distinct in table (admin-row-unverified class)
- Verify button shows error from backend if not all 4 opinions present
- Next: Step 22 — Frontend redesign (fill in docs/design.md with reference screenshot before starting)

### Extra Features Added (outside steps)
- Hero landing page
- Field descriptions
- Book "Read more" modal with author bio
- Home link in navbar
- Upgrade modal popup on roadmap/fiqh tool interactions

---

## Stripe Testing
- Test card: 4242 4242 4242 4242, any future expiry, any CVC
- Stripe CLI: `stripe listen --forward-to localhost:8080/api/payment/webhook` — keep this terminal open, never ctrl+c
- Test account: hellohello@hotmail.com (currently paid)
- Reset to free: `UPDATE users SET subscription_status = 'free' WHERE email = 'hellohello@hotmail.com';`

---

## Environment Variables (local dev)
All set in Windows system environment variables.
IntelliJ must be fully closed and reopened to pick up newly added env vars.

DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, PDF_STORAGE_PATH,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID,
MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, APP_BASE_URL

PDF_STORAGE_PATH = C:\Users\adnan\IdeaProjects\Maktabah\pdfs (no trailing slash)

---

## Session Log

### 2026-03-05 — Steps 1–15 completed and tested
- All backend layers built and working
- Frontend all pages built including library, roadmap, fiqhtool, login, register, account
- Stripe payments fully wired including webhook
- Extra features: hero page, field descriptions, book modal, upgrade modal
- Next: Step 16 — Masalah and MadhabOpinion models

### 2026-03-08 — Step 20 completed
- ScholarService.java: getAllMasail(), addMasalah(), updateMasalah(), deleteMasalah(), verifyMasalah()
- ScholarController.java: 5 endpoints at /api/scholar/masail**, isScholar() role check via DB lookup
- No SecurityConfig change needed — anyRequest().authenticated() already covers /api/scholar/**
- DB prerequisite: ALTER TABLE users DROP CONSTRAINT users_role_check; ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user','scholar','admin'));
- Next: Step 21 — Scholar panel frontend (scholar.js, #/scholar route in main.js)

### 2026-03-07 — Step 19 completed + admin UI polish
- AdminService, AdminController: users (list, update subscription, delete), books (list, add with PDF magic bytes check, edit, delete), masail (list all incl. unverified, add, edit, verify, delete)
- admin.js: three-tab panel (Users, Books, Masail) with full CRUD
- main.js: /admin route with non-admin → 404 guard
- navbar.js: Admin link shown only to admin users
- api.js: added all admin functions, fixed adminUpdateSubscription body key
- application.properties: multipart file limit raised to 50MB
- Extra: added delete for users and masail (not in original spec but consistent with books)
- All tests passed
- Admin UI polish (same session):
  - Books table: shows field name (e.g. "Aqeedah → Rububiyyah") instead of raw field ID
  - Books table: filter by sort (ID / Title A-Z / Z-A), level, and subfield
  - Books tab: Add Book form hidden by default behind description + "Add Book" button
  - Masail tab: Add Masalah form hidden by default behind description + "Add Masalah" button
  - Masail table: filter by sort (ID / Title A-Z / Z-A), category, and verified status
- Next: Step 20 — Scholar role backend

### 2026-03-07 — Step 18 completed
- fiqhtool.js: full search + category + masalah list + detail view with madhab cards
- madhabcard.js: proper component with colour coding (Hanafi=green, Maliki=yellow, Shafi'i=blue, Hanbali=red)
- style.css: masalah list, detail view, madhab grid styles added
- Next: Step 19 — Scholar role backend

### 2026-03-07 — Steps 16 and 17 completed and tested
- Masalah and MadhabOpinion models + repositories built
- MasalahService and MasalahController built — all 4 endpoints working
- Access control confirmed: categories public, paid-only for search/category/detail, 403 for free, 401 for unauthenticated
- Unverified masail correctly return 404 — content integrity rule confirmed working
- Next: Step 18 — Fiqh Tool frontend page

### 2026-03-07 — Scholar role decision
- Added scholar role to the project — separate from admin
- Scholar has their own panel at #/scholar, manages fiqh content only
- Steps 19 and 20 added to the checklist for scholar backend and frontend
- CLAUDE.md updated to reflect scholar role and access rules
- Fix: Update the role CHECK constraint in db-schema.md to include 'scholar'. 
- Add a scholar section to security.md. 
- Either add scholar endpoints to api-endpoints.md or create a dedicated section before Step 19 begins.