# Maktabah — API Endpoints

## Overview

- All endpoints are prefixed with `/api`
- All responses are JSON except `GET /api/books/{id}/download` which returns a file
- JWT is stored in an HttpOnly cookie named `jwt` — never in localStorage
- Every authenticated request verifies the JWT signature, checks expiry, and checks `jti` against the `token_blacklist` table
- Controllers never contain business logic — all logic lives in the service layer
- Controllers never call repositories directly — always through a service

### Standard Error Responses

| Status | Body |
|---|---|
| 401 | `{ "message": "Authentication required" }` |
| 403 | `{ "message": "Access denied" }` |
| 404 | `{ "message": "Resource not found" }` |
| 500 | `{ "message": "Something went wrong. Please try again." }` |

Never return stack traces, Hibernate errors, or database messages to the client.

---

## Public Endpoints — No authentication required

### GET /api/fields
Returns all top-level fields (those with `parent_field_id = NULL`).

**Response 200**
```json
[
  { "id": 1, "name": "Aqeedah" },
  { "id": 2, "name": "Fiqh" }
]
```

---

### GET /api/fields/{id}/subfields
Returns all subfields belonging to a given top-level field.

**Response 200**
```json
[
  { "id": 5, "name": "Ruboobiyah" },
  { "id": 6, "name": "Ulohiyyah" }
]
```

---

### GET /api/books?fieldId={id}
### GET /api/books?fieldId={id}&level={level}
Returns all books in a field, optionally filtered by level. This endpoint is public — no login required.

**Query params**
- `fieldId` — required
- `level` — optional: `beginner`, `intermediate`, or `advanced`

**Response 200**
```json
[
  {
    "id": 1,
    "title": "Kitab al-Tawheed",
    "author": "Muhammad ibn Abd al-Wahhab",
    "authorBio": "...",
    "level": "beginner",
    "description": "...",
    "fieldId": 6
  }
]
```

---

### GET /api/auth/me
Used by the frontend to determine login state. JavaScript cannot read the HttpOnly cookie directly so all pages call this endpoint on load.

**Response 200** — valid cookie present
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "subscriptionStatus": "free"
}
```

**Response 401** — no cookie or invalid/expired token

---

### POST /api/auth/register
Creates a new user account, sets the JWT cookie, and returns the user.

**Request body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200** — sets `jwt` HttpOnly cookie, returns user object
**Response 400** — email already registered (return generic error — do not reveal whether email exists)

---

### POST /api/auth/login
Verifies credentials, sets the JWT cookie, returns the user.

**Request body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200** — sets `jwt` HttpOnly cookie, returns user object
**Response 401** — always returns exactly `"Invalid email or password"` — never reveal which field was wrong

---

### POST /api/auth/logout
Clears the JWT cookie and adds the token's `jti` to `token_blacklist`.

**Response 200**

---

### POST /api/auth/forgot-password
Sends a password reset email. Always returns 200 regardless of whether the email exists — never reveal registration status.

**Request body**
```json
{ "email": "user@example.com" }
```

**Response 200** — always, no exceptions

---

### POST /api/auth/reset-password
Resets the user's password using a valid unexpired token.

**Request body**
```json
{
  "token": "reset-token-uuid",
  "newPassword": "newpassword123"
}
```

**Response 200** — password updated
**Response 400** — token invalid or expired

---

### GET /api/masail/categories
Returns all available fiqh category names. Public — no login required.

**Response 200**
```json
["Taharah", "Salah", "Zakat", "Sawm", "Hajj", "Nikah", "Buyoo'", "Food and Drink", "Dress and Appearance"]
```

---

## Free User Endpoints — Valid JWT cookie required

### GET /api/roadmap?level={level}
### GET /api/roadmap?fieldId={id}&level={level}
Returns roadmap steps ordered by `step_order`. Requires login — any subscription.

**Query params**
- `level` — required: `beginner`, `intermediate`, or `advanced`
- `fieldId` — optional, filters by field

**Response 200**
```json
[
  {
    "id": 1,
    "fieldId": 1,
    "bookId": 3,
    "bookTitle": "Kitab al-Tawheed",
    "bookAuthor": "Muhammad ibn Abd al-Wahhab",
    "level": "beginner",
    "stepOrder": 1,
    "description": "Start here..."
  }
]
```

---

### GET /api/progress
Returns all roadmap step IDs the current user has marked as complete.

**Response 200**
```json
[1, 4, 7]
```

Implementation note: use `findCompletedStepIdsByUserId` returning `List<Long>` — avoids LazyInitializationException.

---

### POST /api/progress/{stepId}/complete
Marks a roadmap step as complete for the current user.

**Response 200**
**Response 404** — step not found

---

## Paid User Endpoints — Valid JWT + subscriptionStatus = 'paid'

### GET /api/books/{id}/download
Streams the PDF file as a file download. Does **not** return JSON.

**Response 200** — file stream with header `Content-Disposition: attachment; filename="book-title.pdf"`
**Response 403** — user not paid
**Response 404** — book not found in database or PDF file not found on disk

---

### GET /api/masail?category={category}
Returns all verified masail in a category. Only returns rows where `verified = TRUE`.

**Response 200**
```json
[
  {
    "id": 1,
    "title": "Going down into sujood — hands or knees first?",
    "arabicTerm": null,
    "category": "Salah",
    "description": "..."
  }
]
```

---

### GET /api/masail/search?query={query}
Searches verified masail by title. Only returns rows where `verified = TRUE`.

**Response 200** — same structure as category list above

---

### GET /api/masail/{id}
Returns one masalah with all four madhab opinions. Only works if `verified = TRUE`.

**Response 200**
```json
{
  "id": 1,
  "title": "Going down into sujood — hands or knees first?",
  "arabicTerm": null,
  "category": "Salah",
  "description": "...",
  "opinions": [
    {
      "madhab": "Hanafi",
      "opinion": "Knees first",
      "evidence": "Hadith of Wail ibn Hujr",
      "sourceBook": "...",
      "sourcePage": "..."
    },
    { "madhab": "Maliki", ... },
    { "madhab": "Shafi'i", ... },
    { "madhab": "Hanbali", ... }
  ]
}
```

**Response 404** — masalah not found or not verified

---

## Payment Endpoints

### POST /api/payment/create-checkout
Requires login (any subscription). Creates a Stripe checkout session and returns the redirect URL.

**Response 200**
```json
{ "url": "https://checkout.stripe.com/..." }
```

Frontend calls `createCheckout()` from `api.js` and reads `data.url` directly — not `data.checkoutUrl` or any other field.

---

### POST /api/payment/webhook
Called by Stripe — no authentication. Verified by Stripe signature on every request. Reject with 400 if signature invalid.

**Headers required:** `Stripe-Signature`

| Event | Action |
|---|---|
| `checkout.session.completed` | Set `subscription_status = 'paid'`, save `stripe_customer_id` and `stripe_subscription_id` |
| `customer.subscription.deleted` | Set `subscription_status = 'free'`, clear `stripe_subscription_id` |
| `invoice.payment_succeeded` | Ensure `subscription_status` remains `'paid'` |
| `invoice.payment_failed` | Log the failure — optionally email the user |

Implementation notes:
- Use `deserializeUnsafe()` NOT `getObject()` for all four webhook events
- Catch both `SignatureVerificationException` AND `Exception` — both return 400
- User lookup order: `findByEmail()` first, fall back to `findByStripeCustomerId()`

---

## Admin Endpoints — Valid JWT + role = 'admin'

Role check happens on both frontend (do not render) AND backend (reject request). Never rely on frontend alone.
Every admin action is logged: admin email, action type, affected resource ID, timestamp.

### GET /api/admin/users
Returns all users with email, role, subscription status, and joined date.

**Response 200**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "subscriptionStatus": "free",
    "createdAt": "2026-01-01T00:00:00"
  }
]
```

---

### PUT /api/admin/users/{id}/subscription
Manually sets a user's subscription status.

**Request body**
```json
{ "subscriptionStatus": "paid" }
```

**Response 200**

---

### POST /api/admin/books
Adds a new book. Accepts `multipart/form-data` with book metadata fields and a PDF file.

**Form fields:** `title`, `author`, `fieldId`, `level`, `description`, `file` (PDF)

PDF validation rules:
- Must be a real PDF (magic bytes check — not just extension)
- Renamed to the correct lowercase-hyphens convention
- Saved to the correct subfolder under `pdfs/`

**Response 201**

---

### PUT /api/admin/books/{id}
Edits book metadata. Does not replace the PDF file.

**Response 200**

---

### DELETE /api/admin/books/{id}
Deletes the book record and removes the PDF file from disk.

**Response 200**

---

### POST /api/admin/masail
Adds a new masalah with all four madhab opinions in one request. Created with `verified = FALSE` by default.

**Request body**
```json
{
  "title": "...",
  "arabicTerm": "...",
  "category": "Salah",
  "description": "...",
  "opinions": [
    { "madhab": "Hanafi", "opinion": "...", "evidence": "...", "sourceBook": "...", "sourcePage": "..." },
    { "madhab": "Maliki", "opinion": "...", "evidence": "...", "sourceBook": "...", "sourcePage": "..." },
    { "madhab": "Shafi'i", "opinion": "...", "evidence": "...", "sourceBook": "...", "sourcePage": "..." },
    { "madhab": "Hanbali", "opinion": "...", "evidence": "...", "sourceBook": "...", "sourcePage": "..." }
  ]
}
```

**Response 201**

---

### PUT /api/admin/masail/{id}
Edits a masalah or any of its madhab opinions.

**Response 200**

---

### PUT /api/admin/masail/{id}/verify
Sets `verified = TRUE`. Only called after the imam has reviewed and approved offline.
Cannot be called if any of the four madhab opinions are missing.

**Response 200**
**Response 400** — not all four opinions exist

---

## JwtAuthFilter — How Authentication Works

The `JwtAuthFilter` runs before every request:
1. Reads the `jwt` cookie
2. Validates the JWT signature and expiry
3. Checks the `jti` claim is not in `token_blacklist`
4. Sets the Spring Security principal to the **userId string**

Controllers extract the current user ID like this:
```java
Long userId = Long.parseLong(authentication.getName());
```

Never use any other method to get the current user in a controller.