/Step 14 — Progress Tracking (PROGRESS)
Purpose of This Step
This step introduces user progress tracking for the learning roadmap feature.
Features introduced:
✅ Authenticated users can mark roadmap steps as complete
✅ Authenticated users can retrieve all their completed step IDs
✅ Progress state is persisted to the database via the user_progress table
✅ Frontend roadmap page reflects live completion state
✅ Completed steps show a filled green checkbox
✅ Progress is user-specific — no user can see or modify another user's progress

⚠ What NOT To Add In This Step (From CLAUDE.md Roadmap Rules)
Do NOT add:
🚫 Stripe logic
🚫 Payment gating or subscription checks
🚫 Fiqh tool logic
🚫 Admin panel logic
🚫 Rate limiting
🚫 Security hardening layers
🚫 PDF download access control (handled in Step 15)
Security hardening is handled after Step 18.
Subscription-based access control is handled in Step 15.

🧠 The 4 Golden Questions (Execution Guidance For Claude)
✅ What Is The Goal of Step 14?
Build a progress tracking system where:

Authenticated users can mark a roadmap step as complete
Authenticated users can retrieve all their completed steps
The roadmap frontend page reflects completion state on load
Progress is tied to the authenticated user via the JWT cookie
Unauthenticated users cannot access progress endpoints — they receive 401

This aligns with Section 11 REST API Endpoints (Free users — valid JWT cookie required).
✅ What Must Be Built?
Backend must implement:

UserProgressController — two endpoints
UserProgressService — business logic for retrieving and marking progress
UserProgressRepository — database access for the user_progress table

Frontend must implement:

Progress loading on roadmap page load via getProgress()
Mark complete button calling completeStep(stepId)
Completed steps display a filled green checkbox
Unauthenticated users on the roadmap page see the steps but cannot mark complete — the button redirects to #/login

Database — only use existing table: user_progress. Do not modify the schema in this step. The user_progress table already has all required columns — use them as-is.
🏗 Architecture Rules (From CLAUDE.md Section 6)
Must strictly follow: Controller → Service → Repository
Controllers: REST endpoints only, no business logic
Services: Business logic only, must convert entities to DTOs before returning
Repositories: Database access only
Never:

Call repositories directly from controllers
Return raw JPA entities from services
Put business logic in controllers
Call one service from another service

DTO rule for this step: The GET endpoint returns List<Long> (a plain list of step IDs). This is the correct and intentional DTO-equivalent for this endpoint — do NOT create a separate DTO class for it. Returning List<Long> directly from the service is compliant with CLAUDE.md Section 6 for this case.
🔐 Authentication Rules For This Step (From CLAUDE.md Section 17)
Both progress endpoints require a valid JWT cookie:

GET /api/progress — valid JWT required
POST /api/progress/{stepId}/complete — valid JWT required

If the JWT cookie is missing, invalid, or expired:
→ Return 401 with body: { "message": "Authentication required" }
The authenticated user's ID is extracted from the JWT — never accept a userId from the request body or query parameters. The backend always derives the user from the token.

🌐 Required API Endpoints
From CLAUDE.md Section 11 (Free users — valid JWT cookie required):
GET  /api/progress                        → all completed roadmap step IDs for this user
POST /api/progress/{stepId}/complete      → marks a roadmap step as complete
Endpoint Behaviours
GET /api/progress

Extract userId from authenticated JWT
Query user_progress table for all rows where user_id = userId AND completed = true
Return a JSON array of step IDs (Long values) — just the IDs, nothing else
Example response: [1, 3, 7, 12]
If user has no completed steps → return empty array []
Never return another user's progress

POST /api/progress/{stepId}/complete

Extract userId from authenticated JWT
Check if a user_progress row already exists for this (userId, stepId) pair
If row exists and completed = true → return 200 silently (idempotent — do not error)
If row exists and completed = false → update: set completed = true, set completed_at = NOW()
If no row exists → insert new row with completed = true, completed_at = NOW()
Return 200 with body: { "message": "Step marked as complete" }
If stepId does not exist in the roadmap_steps table → return 404: { "message": "Resource not found" }


📦 Database Table Used In This Step
user_progress — already exists from prior steps. Do not recreate or alter it.
id                  BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY
user_id             BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE
roadmap_step_id     BIGINT      NOT NULL REFERENCES roadmap_steps(id)
completed           BOOLEAN     NOT NULL DEFAULT FALSE
completed_at        TIMESTAMP   NULLABLE
UNIQUE (user_id, roadmap_step_id)
The UNIQUE (user_id, roadmap_step_id) constraint means each user has at most one progress row per step. The service must use an upsert-style approach (check-then-insert or update) rather than blindly inserting.

🗂 Files Allowed To Be Created Or Modified
Backend — new files:

UserProgressController.java
UserProgressService.java
UserProgressRepository.java

Backend — existing files (no changes expected unless a wiring issue is found):

UserProgress.java — model already exists, confirm fields match schema
JwtAuthFilter.java — already handles authentication from Step 13, no changes needed
SecurityConfig.java — confirm /api/progress/** requires authentication (see Security Config section below)

Frontend — modify only:

frontend/src/pages/roadmap.js — add progress loading and mark complete behaviour
frontend/src/api.js — implement getProgress() and completeStep(stepId) stubs


❌ Forbidden In This Step
Must NOT add:

Stripe or payment logic
PDF download access control
Admin panel logic
Rate limiting
Security hardening
Fiqh tool logic
Any new database columns or tables
Accepting userId from the request — always derive from JWT
Do NOT touch the CORS configuration — it was correctly set in Step 13 and must not be changed in this step


🔒 Security Config Requirements
SecurityConfig.java was updated in Step 13 to handle JWT-based authentication.
For Step 14, confirm these rules are in place:
/api/progress/**    → requires authentication (valid JWT)
If SecurityConfig.java currently uses permitAll() for everything, update it to require authentication for /api/progress/** only. Do not change permissions for any other endpoints that are not part of this step. Do not touch the CORS configuration.
The JwtAuthFilter.java from Step 13 handles extracting the user from the cookie on every request — no new filter logic is needed.

🎨 Frontend Progress Behaviour
roadmap.js — Progress Integration
On page load:

Call getFields() and render the field dropdown and level selector as before
When the user selects a field and level, call getRoadmap(fieldId, level)
After rendering the roadmap steps, call getProgress() to retrieve completed step IDs
For each step, if its ID is in the completed list → render a filled green checkbox ✅
If its ID is not in the completed list → render an empty checkbox ☐

Mark complete button behaviour:

If user is not logged in: clicking the checkbox or mark-complete button redirects to #/login
If user is logged in: clicking calls completeStep(stepId), then refreshes only the checkbox state for that step (no full page reload required)
After a successful completeStep() call → the checkbox for that step turns filled green immediately

Unauthenticated state:

The roadmap steps still render and are visible to all users
The mark-complete interaction is gated behind login — not the viewing of steps


📦 api.js — Functions To Implement
From CLAUDE.md Section 15, these two stubs already exist. Implement them:
export async function getProgress() {
// GET /api/progress
// Returns array of completed step IDs e.g. [1, 3, 7]
// credentials: 'include' so JWT cookie is sent automatically
}
export async function completeStep(stepId) {
// POST /api/progress/{stepId}/complete
// Returns 200 on success
// credentials: 'include' so JWT cookie is sent automatically
}
Both functions must use credentials: 'include' so the HttpOnly cookie is sent automatically on every request — this is consistent with all other api.js functions per CLAUDE.md Section 15.

🗄 Database Interaction Rules
Progress tracking must only use:

UserProgressRepository
RoadmapStepRepository — inject this into UserProgressService to validate that a stepId exists before marking it complete. If the stepId is not found, throw ResourceNotFoundException. Do not call RoadmapStepRepository from the controller — only from UserProgressService.

Never:

Raw SQL
Cross-service calls
Accept userId from the request — always extract from the authenticated JWT principal


Step-by-Step Implementation Guide
Step 1 — Confirm Existing Model
Open UserProgress.java and confirm it maps to the user_progress table with these fields:
@Entity @Table(name = "user_progress") with the following: id (Long), user (ManyToOne → User), roadmapStep (ManyToOne → RoadmapStep), completed (boolean, default false), completedAt (LocalDateTime, nullable). Getters and setters only — zero business logic. If UserProgress.java does not match this, fix it before proceeding.
Step 2 — Create UserProgressRepository
Create UserProgressRepository.java with two methods:

findByUserIdAndCompletedTrue(Long userId) → List<UserProgress>
findByUserIdAndRoadmapStepId(Long userId, Long roadmapStepId) → Optional<UserProgress>

These two methods are all that is needed for this step.
Step 3 — Create UserProgressService
Create UserProgressService.java. Inject both UserProgressRepository and RoadmapStepRepository into this service — both are needed. UserProgressRepository handles progress rows. RoadmapStepRepository is used only to validate that the stepId exists before marking complete.
Business logic rules:
getCompletedStepIds(Long userId):

Call UserProgressRepository.findByUserIdAndCompletedTrue(userId)
Map each result to its roadmapStep.getId()
Return List<Long>

markStepComplete(Long userId, Long stepId):

Check that the RoadmapStep with stepId exists using roadmapStepRepository.findById(stepId) — if not found, throw ResourceNotFoundException
Call UserProgressRepository.findByUserIdAndRoadmapStepId(userId, stepId)
If record exists and completed = true → do nothing, return quietly (idempotent)
If record exists and completed = false → set completed = true, set completedAt = LocalDateTime.now(), save
If no record → create new UserProgress, set user, roadmapStep, completed = true, completedAt = LocalDateTime.now(), save

The service returns void from markStepComplete — the controller returns the success message.
Step 4 — Create UserProgressController
Create UserProgressController.java:
GET  /api/progress                     → calls service.getCompletedStepIds(userId), returns List<Long>
POST /api/progress/{stepId}/complete   → calls service.markStepComplete(userId, stepId), returns 200
How to extract the authenticated user's ID: JwtAuthFilter from Step 13 sets a UsernamePasswordAuthenticationToken on the SecurityContext where the principal is the User entity loaded from the database. In the controller method, accept Authentication authentication as a parameter, cast authentication.getPrincipal() to User, then call .getId() on it to get the Long userId. Never accept userId from the request body or URL parameters — always extract from the principal this way.
If JwtAuthFilter in your Step 13 implementation stored the principal differently (for example as a custom UserPrincipal or as just the email string), follow whatever type Step 13 set — the rule is always match what JwtAuthFilter puts in the principal and extract the ID from that.
Step 5 — Update SecurityConfig
Confirm that /api/progress/** requires authentication in SecurityConfig.java. If SecurityConfig already requires authentication for all non-public endpoints from Step 13, no change is needed. If it still uses permitAll() for everything, add the rule that /api/progress/** requires a valid JWT. Do not change permissions for any other path. Do not touch CORS configuration.
Step 6 — Frontend: Implement api.js Functions
In frontend/src/api.js, implement the two stubs as described in the api.js section above.
Step 7 — Frontend: Update roadmap.js
After rendering the roadmap timeline steps call getCurrentUser() from auth.js to check login state, then call getProgress() to get the array of completed step IDs. For each step rendered, check if its ID is in the completed array — if yes render filled green checkbox, if no render empty checkbox. Mark-complete interaction follows the behaviour described in the Frontend Progress Behaviour section above.

🧪 Testing Checklist
☑ Unauthenticated GET /api/progress returns 401
☑ Unauthenticated POST /api/progress/{stepId}/complete returns 401
☑ Authenticated GET /api/progress returns empty array when no steps completed
☑ Authenticated POST /api/progress/{stepId}/complete returns 200
☑ Calling complete on same step twice does not error — idempotent
☑ GET /api/progress returns the correct step IDs after marking steps complete
☑ completed_at is set correctly on the progress row
☑ POST /api/progress/{stepId}/complete with a non-existent stepId returns 404
☑ User A cannot see User B's progress — each user only sees their own
☑ Frontend roadmap page loads with correct checkboxes on page load
☑ Clicking mark-complete turns the checkbox green immediately
☑ Unauthenticated user clicking mark-complete is redirected to #/login

📌 Success Criteria For Moving To Step 15
✅ Authenticated users can mark roadmap steps as complete
✅ Authenticated users can retrieve all their completed step IDs
✅ Unauthenticated requests to both endpoints return 401
✅ Frontend roadmap page reflects completion state correctly on load
✅ Mark-complete is idempotent — calling it twice does not throw an error
✅ No other steps or features were broken by this change

🚨 Common Mistakes To Avoid (From CLAUDE.md Section 19)
Never:
❌ Return raw JPA entities — List<Long> is the correct return for the GET endpoint and no separate DTO class is needed
❌ Accept userId from the request body or URL — always extract from the JWT principal by casting authentication.getPrincipal() to the type set by JwtAuthFilter
❌ Put business logic in controllers
❌ Call UserProgressRepository directly from the controller
❌ Let one service call another service
❌ Insert a duplicate (user_id, roadmap_step_id) row — the DB has a UNIQUE constraint, handle this in the service before inserting
❌ Forget to inject RoadmapStepRepository into UserProgressService — it is required for stepId validation
❌ Touch CORS configuration — it was set correctly in Step 13

🧠 Session Initialization Rule (From CLAUDE.md Section 22)
At the start of every session Claude must:

Read CLAUDE.md
Read CLAUDE-Step-14-PROGRESS.md
Confirm current step
Then begin implementation