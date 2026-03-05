Here is the full file as plain text:

Step 13 — User Registration & Login (AUTH)

Purpose of This Step

This step introduces authentication foundations for the platform.
Features introduced:
✅ User account creation
✅ User authentication using JWT
✅ HttpOnly cookie session storage
✅ Login state detection via /api/auth/me
✅ Password hashing rules
✅ Password reset flow (forgot-password and reset-password)
✅ Authentication infrastructure for future steps
⚠ What NOT To Add In This Step (From CLAUDE.md Roadmap Rules)
Do NOT add:
🚫 Stripe logic
🚫 Progress tracking
🚫 Role-based permissions beyond basic login authentication
🚫 Payment logic
🚫 Rate limiting
🚫 Security hardening layers
Security hardening is handled after Step 18.
Password reset security hardening (Security 12) is handled after Step 18 — only the functional flow is built here.

🧠 The 4 Golden Questions (Execution Guidance For Claude)
✅ What Is The Goal of Step 13?
Build a secure authentication foundation where:

Users can register
Users can login
Users can logout
Users can request a password reset email
Users can reset their password using a valid token
Frontend can detect login state
JWT is stored only inside HttpOnly cookies

This aligns with Section 17 Security Rules.
✅ What Must Be Built?
Backend must implement:

AuthController
AuthService
Password hashing logic
JWT generation + validation
Cookie-based session storage
Password reset token generation and validation

Frontend must implement:

Login page integration
Register page integration
Auth state detection via /api/auth/me

Database — only use existing tables:

users
token_blacklist (for token invalidation intent)

Do not modify schema in this step.
The users table already contains password_reset_token and password_reset_expiry columns — use them as-is.

🏗 Architecture Rules (From CLAUDE.md Section 6)
Must strictly follow: Controller → Service → Repository
Controllers:

REST endpoints only
No business logic

Services:

Business logic only
Must convert entities to DTOs before returning

Repositories:

Database access only

Never:

Call repositories directly from controllers
Return raw JPA entities
Put business logic in controllers


🔐 Authentication Rules (From CLAUDE.md Section 17)
Password Rules
Passwords must:
✅ Be hashed using BCrypt
✅ BCrypt strength = 12
✅ Minimum 8 characters
✅ Maximum 100 characters
Never store plaintext passwords.
JWT Rules
Each JWT must contain:

userId
email
role
subscriptionStatus
jti (UUID token identifier)

Token lifecycle:

Verify signature
Verify expiration
Verify blacklist status

Token Storage Rules
JWT must be stored in cookies only:

HttpOnly = true
Secure = true
SameSite = Strict

Never store JWT in:
❌ localStorage
❌ sessionStorage
Token Blacklist Intent Rule (Very Important)
Authentication logic must be designed to support the token_blacklist table.
When logging out:

Add token jti to blacklist


🌐 Required API Endpoints
Public Authentication Endpoints:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password

Endpoint Behaviors
Register must:

Create user
Hash password
Generate JWT
Set HttpOnly cookie
Return UserDTO (fields: id, email, role, subscriptionStatus)

Login must:

Validate credentials
Set JWT cookie
Return generic error only: "Invalid email or password"
Never reveal which field failed (Section 17 Security Rule)

Logout must:

Clear cookie
Optionally blacklist token jti

Me Endpoint — GET /api/auth/me:

If authenticated → Return 200 + UserDTO (id, email, role, subscriptionStatus)
If not authenticated → Return 401

Forgot Password — POST /api/auth/forgot-password:

Accept email in request body
Always return 200 regardless of whether the email exists in the database
Never reveal whether an email is registered (Section 17 Security Rule)
If email exists: generate a secure random reset token, store token and expiry (1 hour) in password_reset_token and password_reset_expiry on the user row, send password reset email with link
Reset link format: {APP_BASE_URL}/#/reset-password?token={token}
If email does not exist: return 200 silently, do nothing else

Reset Password — POST /api/auth/reset-password:

Request body: token, newPassword
Look up user by password_reset_token
If token not found or password_reset_expiry is in the past → return 400: "Invalid or expired reset token"
If token valid: hash the new password with BCrypt strength 12, save new password_hash, set password_reset_token = null, set password_reset_expiry = null
Return 200: "Password reset successful"
Password rules apply: minimum 8, maximum 100 characters


🎨 Frontend Authentication Behaviour
Login Page:

On success → redirect to #/library

Register Page must:

Validate password match on frontend
Send request to backend
On success → redirect to #/library

Auth State Detection:

Frontend must always use GET /api/auth/me
200 → User is logged in
401 → User is guest
Auth state must be stored in memory only


📦 Files Allowed To Be Modified
Backend:

AuthController.java
AuthService.java
JwtUtil.java
TokenBlacklist.java
TokenBlacklistRepository.java
UserService.java
UserRepository.java
SecurityConfig.java (only auth permissions if needed)

Frontend:

frontend/src/auth.js
frontend/src/pages/login.js
frontend/src/pages/register.js
frontend/src/api.js
frontend/src/main.js (auth redirects only)


❌ Forbidden In This Step
Must NOT add:

Stripe integration
Rate limiting
Payment logic
Admin panel logic
Security hardening features
Account lockout logic (failed_attempts, lock_until) — handled in Security 6


🗄 Database Interaction Rules
Authentication must only use:

UserRepository
TokenBlacklistRepository (if needed)

Never:

Raw SQL
Cross-service calls


🧪 Testing Checklist
✅ User can register
✅ Password is hashed with BCrypt strength 12
✅ User can login
✅ HttpOnly cookie is set
✅ /api/auth/me detects session
✅ /api/auth/me returns 401 when not authenticated
✅ Logout clears session
✅ Frontend redirects to #/library after login and register
✅ forgot-password returns 200 for both existing and non-existing emails
✅ reset-password rejects expired or invalid tokens with 400
✅ reset-password clears token fields after successful reset
✅ reset-password hashes new password correctly

📌 Success Criteria For Moving To Step 14
✅ Users can register
✅ Users can login
✅ Users can logout
✅ Auth state is correctly detected
✅ forgot-password and reset-password flows work end to end
✅ Security rules are respected

🚨 Common Mistakes To Avoid (From CLAUDE.md Section 19)
Never:
❌ Return raw JPA entities
❌ Put business logic in controllers
❌ Reveal password or auth failure details
❌ Trust frontend for security decisions
❌ Reveal whether an email address is registered (forgot-password must always return 200)
Always: Return DTOs only.

🧠 Session Initialization Rule (From CLAUDE.md Section 22)
At the start of every session Claude must:

Read CLAUDE.md
Read Step13-AUTH.md
Confirm current step
Then begin implementation



Step by Step Guide To Complete Step 13
Step 13 — Authentication Implementation Guide (AUTH)
Goal
Implement core authentication infrastructure for the platform.
Required Features:

User registration
User login and logout
JWT authentication
HttpOnly cookie session storage
Auth state detection via /api/auth/me
Password reset flow (forgot-password and reset-password)

Do not implement:

Stripe
Payments
Rate limiting
Security hardening
Admin logic
Progress tracking
Account lockout (handled in Security 6)

Security hardening will be implemented after Step 18.

Architecture Rules (Must Follow)
Always follow: Controller → Service → Repository

Controllers = request routing only
Services = business logic only
Repositories = database access only
Services must return DTOs only
Never return JPA entities from services
Never place business logic inside controllers


Backend Implementation Order
Step 1 — Password Security
Implement password hashing using BCrypt.
Requirements:

BCrypt strength = 12
Password length must be between 8 and 100 characters
Never store plaintext passwords

Files: AuthService.java, UserService.java

Step 2 — JWT Token System
Create JwtUtil.java.
Token must contain:

userId
email
role
subscriptionStatus
jti (UUID token identifier)

Token Rules:

Expiration = 7 days
Verify signature
Verify expiration
Support blacklist validation (token_blacklist table)


Step 3 — Cookie Session Storage
After login or registration: Generate JWT → Store inside cookie.
Cookie Settings:

HttpOnly = true
Secure = true
SameSite = Strict

Never store JWT in localStorage or sessionStorage.

Step 4 — Authentication Controller
Implement AuthController with these public endpoints:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password

Register Flow:

Create user
Hash password with BCrypt strength 12
Generate JWT
Set cookie
Return UserDTO (id, email, role, subscriptionStatus)

Login Flow:

Validate credentials
If invalid → return "Invalid email or password" — do not reveal which field failed
Generate JWT
Set cookie
Return UserDTO (id, email, role, subscriptionStatus)

Logout Flow:

Clear authentication cookie
Optionally add token jti to blacklist table

Me Endpoint:

If authenticated → return 200 + UserDTO (id, email, role, subscriptionStatus)
If not authenticated → return 401

Forgot Password Flow:

Always return 200 — never reveal if the email exists or not
Look up user by email
If user not found → return 200 silently, do nothing else
If user found:

Generate a secure random reset token
Store token and expiry (1 hour from now) in password_reset_token and password_reset_expiry
Send email to the user with reset link
Reset link format: {APP_BASE_URL}/#/reset-password?token={token}


Use Spring Mail with MAIL_* environment variables from application.properties

Reset Password Flow:

Look up user by password_reset_token value
If no user found → return 400: "Invalid or expired reset token"
If password_reset_expiry is in the past → return 400: "Invalid or expired reset token"
Validate newPassword: minimum 8, maximum 100 characters
Hash newPassword with BCrypt strength 12
Save new password_hash on the user
Set password_reset_token = null
Set password_reset_expiry = null
Return 200: "Password reset successful"


Step 5 — Token Blacklist Model
Confirm TokenBlacklist.java exists with these fields matching the token_blacklist table:

id (BIGINT, primary key)
tokenId (VARCHAR 255, unique) — stores the JWT jti claim
expiresAt (TIMESTAMP)

Used by:

Logout flow (add jti to blacklist)
JWT validation (check jti not in blacklist before allowing request)

Files: TokenBlacklist.java, TokenBlacklistRepository.java

Frontend Implementation
Modify only:

frontend/src/auth.js
frontend/src/pages/login.js
frontend/src/pages/register.js
frontend/src/api.js
frontend/src/main.js

Auth Rules:

Always check login state using GET /api/auth/me
Auth state must be stored only in memory

Login Page:

On success → redirect to #/library
On failure → show "Invalid email or password"

Register Page:

Validate password match on frontend before submitting
On success → redirect to #/library

api.js — implement these two stubs that already exist per CLAUDE.md Section 15:

forgotPassword(email)
resetPassword(token, newPassword)


Database Rules
Use only existing tables:

users
token_blacklist

The users table already has these columns — use them, do not recreate:

password_reset_token VARCHAR(255)
password_reset_expiry TIMESTAMP

Do not modify schema in this step.

Security Rules
Passwords:

BCrypt only, strength 12
Never expose password hashes

JWT:

HttpOnly cookies only
Never use localStorage or sessionStorage

Error Responses:

Never expose authentication internals
forgot-password always returns 200
Login error is always "Invalid email or password" — never specify which field


Testing Checklist
☑ User can register
☑ Password is hashed with BCrypt strength 12
☑ User can login
☑ HttpOnly cookie is set
☑ /api/auth/me returns correct UserDTO when authenticated
☑ /api/auth/me returns 401 when not authenticated
☑ Logout clears session
☑ Frontend redirects to #/library after login and register
☑ forgot-password returns 200 for both existing and non-existing emails
☑ reset-password rejects expired or invalid tokens with 400
☑ reset-password clears token fields after successful reset
☑ reset-password hashes new password correctly

Completion Criteria
Step 13 is complete only if:

Users can register
Users can login
Users can logout
Auth state detection works correctly
forgot-password flow works end to end
reset-password flow works end to end
All security rules from CLAUDE.md Section 17 are respected


Forbidden
Do NOT add:

Stripe
Payments
Rate limiting
Security hardening
Admin logic
Account lockout logic (failed_attempts, lock_until) — this is Security 6


Session Start Rule
At start of every session:

Read CLAUDE.md
Read Step13-AUTH.md
Confirm current step
Then begin work