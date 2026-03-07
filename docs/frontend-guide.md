# Maktabah — Frontend Guide

## Overview

The frontend is a vanilla JavaScript Single Page Application built with Vite 5.x.
There is one HTML file (`index.html`) with a single `<div id="app">`. All page content
renders inside that div. There are no page reloads — navigation is handled entirely
through hash-based client-side routing in `main.js`.

No frontend framework (no React, no Vue). No external router library. ES6+ throughout.

---

## Folder Structure

```
frontend/
├── index.html              ← single HTML shell, contains <div id="app">
├── vite.config.js          ← dev server config, API proxy to localhost:8080
├── package.json
└── src/
    ├── pages/
    │   ├── home.js         ← hero landing page
    │   ├── library.js      ← book library (fields → subfields → books)
    │   ├── roadmap.js      ← learning roadmap with progress tracking
    │   ├── fiqhtool.js     ← fiqh comparison tool (paid only feature)
    │   ├── login.js        ← login form
    │   ├── register.js     ← registration form
    │   └── account.js      ← account info and Stripe subscription management
    ├── components/
    │   ├── navbar.js       ← top nav bar, rendered on every page
    │   ├── bookcard.js     ← book card with modal and download logic
    │   ├── fieldcard.js    ← field / subfield card
    │   ├── roadmapstep.js  ← single roadmap step node
    │   └── madhabcard.js   ← single madhab opinion card (used in fiqhtool)
    ├── api.js              ← ALL fetch() calls live here and only here
    ├── auth.js             ← auth state, current user, helper functions
    ├── main.js             ← app entry point and hash router
    └── style.css
```

---

## Routing — How main.js Works

The app uses hash-based routing. URLs look like `maktabah.com/#/library`.

### Route Table

| Hash | Page File | Notes |
|---|---|---|
| `#/` | `home.js` | Default / hero landing page |
| `#/library` | `library.js` | Public — no login needed |
| `#/roadmap` | `roadmap.js` | Requires login |
| `#/fiqhtool` | `fiqhtool.js` | Requires login + paid |
| `#/login` | `login.js` | |
| `#/register` | `register.js` | |
| `#/account` | `account.js` | Requires login |
| `#/admin` | admin panel | Only rendered if `isAdmin()` returns true |

### main.js Responsibilities

1. Reads the hash on initial page load and renders the correct page
2. Listens for `hashchange` events and re-renders when the hash changes
3. Renders the navbar component on every page before rendering page content
4. Checks auth state and redirects when needed (e.g. unauthenticated user hits `#/roadmap` → redirect to `#/login`)
5. Strips query params before route matching — this is critical.
   `#/account?payment=success` must match as `#/account`, not fail as an unknown route.

### Auth Redirects in main.js

- `#/roadmap` — if not logged in → redirect to `#/login`
- `#/fiqhtool` — if not logged in → redirect to `#/login`
- `#/account` — if not logged in → redirect to `#/login`
- `#/admin` — if not admin → render 404, not a redirect

---

## Auth State — How auth.js Works

Because the JWT is stored in an HttpOnly cookie, JavaScript cannot read it directly.
Auth state is determined by calling `GET /api/auth/me` on the backend.

### Exported Functions

```javascript
getCurrentUser()   // calls GET /api/auth/me, caches result in module variable
                   // returns user object { id, email, role, subscriptionStatus } or null

isLoggedIn()       // true if getCurrentUser() returned a non-null user

isPaid()           // true if user.subscriptionStatus === 'paid'

isAdmin()          // true if user.role === 'admin'

clearUserCache()   // clears the cached user — MUST be called after login and logout
                   // so the next call to getCurrentUser() re-fetches from the server
```

### How Pages Use auth.js

Every page calls `getCurrentUser()` on load to determine what to show.
The navbar calls it to decide whether to show the Login link or the Account link.

### Caching Rule

`getCurrentUser()` caches its result to avoid hitting `/api/auth/me` on every render.
After any login or logout action, `clearUserCache()` must be called first,
then `getCurrentUser()` will fetch fresh state from the server.

---

## API Layer — How api.js Works

**Rule: No page or component ever calls `fetch()` directly. Ever.**
All HTTP calls go through the functions exported from `api.js`.

Every function uses `credentials: 'include'` so the JWT cookie is automatically
sent with every request. This is non-negotiable — without it cookies do not work.

### All Exported Functions

```javascript
// Fields
getFields()                           // GET /api/fields
getSubfields(fieldId)                 // GET /api/fields/{id}/subfields

// Books
getBooks(fieldId, level = null)       // GET /api/books?fieldId=&level=
downloadBook(bookId)                  // GET /api/books/{id}/download — triggers file download

// Roadmap
getRoadmap(fieldId, level)            // GET /api/roadmap?fieldId=&level=
getProgress()                         // GET /api/progress
completeStep(stepId)                  // POST /api/progress/{stepId}/complete

// Auth
login(email, password)                // POST /api/auth/login
register(email, password)             // POST /api/auth/register
logout()                              // POST /api/auth/logout
getCurrentUser()                      // GET /api/auth/me
forgotPassword(email)                 // POST /api/auth/forgot-password
resetPassword(token, newPassword)     // POST /api/auth/reset-password

// Payments
createCheckout()                      // POST /api/payment/create-checkout
                                      // returns URL string — caller does window.location.href = url

// Masail (Fiqh Tool)
getMasailCategories()                 // GET /api/masail/categories
getMasailByCategory(category)         // GET /api/masail?category=
searchMasail(query)                   // GET /api/masail/search?query=
getMasalah(id)                        // GET /api/masail/{id}

// Admin
adminGetUsers()                       // GET /api/admin/users
adminUpdateSubscription(userId, status) // PUT /api/admin/users/{id}/subscription
adminAddBook(bookData)                // POST /api/admin/books (multipart/form-data)
adminAddMasalah(masalahData)          // POST /api/admin/masail
adminVerifyMasalah(masalahId)         // PUT /api/admin/masail/{id}/verify
```

### Base URL and Vite Proxy

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
```

In development, `VITE_API_BASE_URL` is not set, so `API_BASE` is empty string.
All `fetch('/api/...')` calls are intercepted by the Vite dev server proxy
and forwarded to `localhost:8080`. No CORS issues during development.

In production, `VITE_API_BASE_URL` is not needed because Nginx proxies `/api/` to
Spring Boot on the same domain.

---

## Page Breakdown

### home.js — Hero Landing Page
- Route: `#/`
- Public — no auth check
- Displays platform introduction, three feature sections (Library, Roadmap, Fiqh Tool)
- CTA buttons link to `#/library`, `#/roadmap`, `#/fiqhtool`

### library.js — Book Library
- Route: `#/library`
- Public — no login required to browse
- On load: calls `getFields()`, renders field cards
- On field click: calls `getSubfields(fieldId)`. If subfields exist → render them.
  If no subfields → call `getBooks(fieldId)` directly
- On subfield click: calls `getBooks(subfieldId)`, renders book cards
- Level filter bar: All / Beginner / Intermediate / Advanced
  — filters already-loaded books in memory, no new API call
- Book download button behaviour — three states:
    - Not logged in → redirect to `#/login`
    - Logged in (any plan) → call `downloadBook(bookId)`, triggers file download
    - (No paywall on downloads — all logged-in users can download)

### roadmap.js — Learning Roadmap
- Route: `#/roadmap`
- Requires login — redirect to `#/login` if not authenticated
- On load: calls `getFields()` to populate field dropdown, renders level selector
- When field and level selected: calls `getRoadmap(fieldId, level)`, renders vertical zigzag timeline
- Timeline alternates nodes left/right. Step 1 is always unlocked.
  Steps 2+ are locked until the previous step is completed.
- If logged in: calls `getProgress()`, marks completed steps with filled green checkbox
- Mark complete: calls `completeStep(stepId)`, refreshes checkbox state
- **Free users**: clicking a locked node shows upgrade modal popup — not a hard gate
- All nodes show the unlock/complete button regardless of login state

### fiqhtool.js — Fiqh Comparison Tool
- Route: `#/fiqhtool`
- Requires login — redirect to `#/login` if not authenticated
- **Free users**: page loads but search/category interaction shows upgrade modal
- If paid: calls `getMasailCategories()`, renders category filter buttons and search bar
- On search: calls `searchMasail(query)`, renders masalah list
- On category click: calls `getMasailByCategory(category)`, renders masalah list
- On masalah click: calls `getMasalah(id)`, renders four madhab cards

#### Madhab Card Colors
| Madhab | Color |
|---|---|
| Hanafi | Green |
| Maliki | Yellow |
| Shafi'i | Blue |
| Hanbali | Red |

Each card shows: madhab name, ruling (opinion), evidence (daleel), source book and page.

### login.js — Login Page
- Route: `#/login`
- Simple centered form: email, password
- On submit: calls `login(email, password)` from `api.js`
- On success: calls `clearUserCache()`, redirects to `#/library`
- On failure: shows error message below form — always exactly: "Invalid email or password"

### register.js — Registration Page
- Route: `#/register`
- Simple centered form: email, password, confirm password
- Frontend validates passwords match before submitting
- On submit: calls `register(email, password)`
- On success: calls `clearUserCache()`, redirects to `#/library`
- On failure: shows error below form

### account.js — Account and Subscription Page
- Route: `#/account`
- Requires login
- Shows: email address, current plan (Free or Paid with green badge)
- If free: upgrade card with Upgrade Now button
  — calls `createCheckout()`, then `window.location.href = url` (redirect to Stripe)
- If paid: shows "Active subscription" with green checkmark
- Logout button: calls `logout()`, then `clearUserCache()`, redirects to `#/login`
- Payment result detection: parse payment status from `window.location.hash`
  (NOT `window.location.search` — hash routing means query params are in the hash string)

---

## Component Breakdown

### navbar.js
Rendered on every page by `main.js` before page content.
- Shows: Maktabah logo (links to `#/`), Library, Roadmap, Fiqh Tool links
- Shows Login link if not logged in, Account link if logged in
- Highlights the currently active route
- Calls `getCurrentUser()` on render to determine login state

### bookcard.js
Individual book card. Used by `library.js` and `roadmap.js`.
- Fixed height: 300px
- Shows: field color header, title, author, level badge, description preview
- Level badge colors: green = beginner, orange = intermediate, red = advanced
- "Read more" button opens modal with full description and author bio
- Download button behaviour based on auth state (see library.js section above)

### fieldcard.js
Field or subfield card. Used by `library.js`.
- Clickable — triggers field or subfield selection
- Shows field name and description

### roadmapstep.js
Single step in the roadmap timeline. Used by `roadmap.js`.
- Shows: step number circle, book title, author, description, download button
- Shows completed (filled green) or locked state based on progress data
- Complete/unlock button triggers `completeStep()` or upgrade modal

### madhabcard.js
Single madhab opinion card. Used by `fiqhtool.js`.
- Shows: madhab name, opinion text, evidence text, source book and page
- Color-coded by madhab (see table above)
- Four cards render side by side on desktop, stacked on mobile

---

## Access Control Patterns

Three user tiers and how each is handled in the frontend:

### Guest (not logged in)
- Can browse: `#/`, `#/library`, `#/login`, `#/register`
- Hitting `#/roadmap`, `#/fiqhtool`, `#/account` → redirect to `#/login`
- Download button on book cards → redirect to `#/login`

### Free (logged in, subscription_status = 'free')
- Can browse library and view all book cards
- Can download books directly (no paywall on downloads)
- Roadmap: page loads, but clicking a step node → upgrade modal popup
- Fiqh Tool: page loads, but search/category click → upgrade modal popup
- Account page shows upgrade card

### Paid (logged in, subscription_status = 'paid')
- Full access to all features
- Roadmap: interactive with no modal
- Fiqh Tool: full search and madhab card access
- Account page shows active subscription status

### Admin (role = 'admin')
- Access to `#/admin` route — renders admin panel
- If non-admin user hits `#/admin` → render 404 page (not a redirect)
- Role check happens on BOTH frontend (do not render) AND backend (reject request)
- Never rely on the frontend check alone

---

## Styling Conventions

- Global styles in `style.css`
- CSS variables used for color palette consistency
- Level badge colors: `--color-beginner` (green), `--color-intermediate` (orange), `--color-advanced` (red)
- Madhab card colors: Hanafi (green), Maliki (yellow), Shafi'i (blue), Hanbali (red)
- Responsive: four madhab cards side by side on desktop, stacked on mobile

---

## Local Development

```bash
# From frontend/ folder
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend must also be running on `http://localhost:8080` at the same time.

The Vite proxy in `vite.config.js` forwards all `/api/` requests to the backend:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

This means all `fetch('/api/...')` calls in the frontend go to the backend
automatically with no CORS issues during development.

---

## Key Rules — Never Break These

- No page or component ever calls `fetch()` directly — always through `api.js`
- Every `fetch()` call uses `credentials: 'include'` — never omit this
- JWT is never stored in `localStorage` or `sessionStorage` — HttpOnly cookie only
- `clearUserCache()` must be called after every login and logout
- Route matching always strips query params first — never match raw hash with params
- Admin route renders 404 for non-admins — never redirect to login for admin check
- `createCheckout()` returns a URL string — use `window.location.href`, not `fetch` redirect
- Payment result param is in `window.location.hash` — NOT `window.location.search`