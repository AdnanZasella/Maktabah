Step 15 — Stripe Payments and Access Control
Purpose of This Step
This step introduces the subscription payment system and enforces access control
across the entire platform based on subscription status.
Features introduced:

✅ Stripe checkout session creation for new subscriptions
✅ Stripe webhook handler for payment lifecycle events
✅ PDF downloads locked behind paid subscription
✅ Fiqh Tool locked behind paid subscription
✅ Frontend account page with upgrade flow including logout button
✅ Frontend book card shows inline upgrade prompt for free users
✅ Frontend fiqh tool page shows upgrade prompt for free users
✅ Subscription status reflected live across all pages


⚠ What NOT To Add In This Step

🚫 Masalah or MadhabOpinion models (Step 16)
🚫 Fiqh Tool API endpoints (Step 17)
🚫 Fiqh Tool frontend content (Step 18) — only the upgrade gate UI
🚫 Admin panel logic
🚫 Rate limiting
🚫 Security hardening layers
🚫 Input validation annotations (@Valid)
🚫 Any new database tables or columns
🚫 Any changes to the roadmap or progress features


🧠 The 4 Golden Questions
✅ What Is The Goal of Step 15?
Build the full Stripe subscription payment system and enforce access control so that:

Any logged-in user can start a Stripe checkout session to subscribe
Stripe webhooks update the user's subscriptionStatus in the database
PDF book downloads are restricted to paid users only
The Fiqh Tool is restricted to paid users only
Free users see upgrade prompts in the right places
The account page shows subscription status, the upgrade flow, and the logout button

✅ What Must Be Built?
Backend — new files:

PaymentService.java — checkout session creation and webhook processing
PaymentController.java — two endpoints: create-checkout and webhook

Backend — existing files to modify:

User.java — confirm stripeCustomerId, stripeSubscriptionId, subscriptionStatus fields exist
UserRepository.java — add findByStripeCustomerId() and findByStripeSubscriptionId()
BookController.java — enforce paid check on the download endpoint
SecurityConfig.java — add authorization rules for paid endpoints

Frontend — new files:

frontend/src/pages/account.js

Frontend — existing files to modify:

frontend/src/pages/library.js — update download button behaviour
frontend/src/pages/fiqhtool.js — add paid gate
frontend/src/api.js — add five new stub functions

Database — no new tables or columns. Only these existing users columns are written to:

subscription_status — updated to 'paid' or 'free' by webhook
stripe_customer_id — saved on checkout completion
stripe_subscription_id — saved on checkout, cleared on cancellation


🏗 Architecture Rules (From CLAUDE.md Section 6)

Controllers: REST endpoints only, zero business logic
Services: All business logic, convert entities to DTOs before returning
Repositories: Database access only
Never call repositories directly from controllers
Never return raw JPA entities from services
Never let one service call another service


🔐 Authorization Rules For This Step
EndpointRulePOST /api/payment/create-checkoutValid JWT requiredPOST /api/payment/webhookNo auth — Stripe signature verification onlyGET /api/books/{id}/downloadValid JWT + subscriptionStatus = 'paid'GET /api/masail/**Valid JWT + subscriptionStatus = 'paid'GET /api/masail/categoriesPUBLIC — no auth

401 response body: { "message": "Authentication required" }
403 response body: { "message": "Access denied" }


CRITICAL: Never trust the frontend to confirm a Stripe payment. The checkout
success redirect does NOT update subscription status — only the webhook does.


📦 Required pom.xml Dependency
Confirm stripe-java 24.x is present in pom.xml. If missing, add it now before
writing any code.

🔧 Environment Variables Required
Never hardcode these — always use ${ENV_VAR} syntax in application.properties.
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
APP_BASE_URL=http://localhost:5173
STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET should already be in
application.properties. Add stripe.price.id=${STRIPE_PRICE_ID} now.
The complete Stripe section in application.properties must look exactly like this after this step:
properties# Stripe
stripe.secret.key=${STRIPE_SECRET_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}
stripe.price.id=${STRIPE_PRICE_ID}
Read all four values in PaymentService using @Value. Initialize Stripe.apiKey
in a @PostConstruct method so the key is set once on startup before any method is called.

🌐 API Endpoints
POST /api/payment/create-checkout    → login required, returns { url: '...' }
POST /api/payment/webhook            → no auth, Stripe calls this
GET  /api/books/{id}/download        → valid JWT + paid required
GET  /api/masail/categories          → PUBLIC
GET  /api/masail?category={category} → valid JWT + paid required
GET  /api/masail/search?query={q}    → valid JWT + paid required
GET  /api/masail/{id}                → valid JWT + paid required
The /api/masail/** endpoints are secured here but not implemented until Steps 16–17.
In this step only add the security rules in SecurityConfig — no masail business logic.

📋 Endpoint Behaviours
POST /api/payment/create-checkout

Extract the authenticated user from the JWT principal
Call Stripe to create a checkout session in subscription mode:

Success URL: {APP_BASE_URL}/#/account?payment=success
Cancel URL: {APP_BASE_URL}/#/account?payment=cancelled
Customer email: user's email from the database
Price: read from stripe.price.id property


Return 200: { "url": "https://checkout.stripe.com/..." }
On any failure: return 500 { "message": "Something went wrong. Please try again." }

POST /api/payment/webhook

Verify the Stripe signature before doing anything — reject with 400 if invalid
Read raw request body as a plain String — do not let Spring parse it as JSON
(use @RequestBody String payload — see CRITICAL section below)
Process the four event types shown in the table below
Return 200 after successful processing — non-200 causes Stripe to retry
Return 400 only on signature verification failure
For any unrecognised event type: return 200 silently

EventActioncheckout.session.completedSet subscriptionStatus='paid', save stripeCustomerId and stripeSubscriptionIdcustomer.subscription.deletedSet subscriptionStatus='free', clear stripeSubscriptionId (set null)invoice.payment_succeededSet subscriptionStatus='paid'invoice.payment_failedLog warning with customer ID — no status change
User lookup for checkout.session.completed — two-step required:

Try findByEmail(session.getCustomerEmail()) first
If email is null or user not found, fall back to findByStripeCustomerId(session.getCustomer())
If both fail, log a warning and return silently — do not crash

This fallback is required because Stripe does not always populate customerEmail
for returning customers. See the CRITICAL section below.
GET /api/books/{id}/download

Return 401 if not authenticated
Return 403 if subscriptionStatus is not 'paid'
Then run the existing file streaming logic from Step 5 unchanged
404 if book not found in database, 404 if file not found on disk


Note: After both Step 5 (BookController paid check) and Step 6 (SecurityConfig) are
complete, the download endpoint enforces both JWT authentication and paid subscription status.
Neither step alone is sufficient — both must be complete before testing download access control.


🔒 SecurityConfig Rules
Add these rules in this exact order. Do not change any existing rules from Steps 13
or 14. Do not touch the CORS configuration.
Order matters — Spring Security matches top to bottom, first match wins:

/api/payment/webhook → permitAll
/api/masail/categories → permitAll
/api/payment/create-checkout → authenticated
/api/books/*/download → authenticated
/api/masail/** → authenticated


/api/masail/categories MUST appear before /api/masail/** — otherwise the wildcard
matches it first and blocks public access.

authenticated() only confirms a valid JWT is present. The paid check happens inside
the controller by reading the user from the principal and checking subscriptionStatus.
The /api/books/*/download pattern uses a single * wildcard matching one path segment
(the book ID). This is correct for Spring Boot 3.x PathPatterns. Do not change it.

Why the masail security rules are added now even though masail logic comes in Steps 16–17:
SecurityConfig will reject requests to /api/masail/** before they reach any controller.
This means you can fully test that free users receive 403 and unauthenticated users receive
401 right now — without any MasalahController existing yet. That is expected and correct.


⚠ CRITICAL — Webhook Raw Body
Stripe signature verification requires the exact raw request bytes. If Spring parses
the body as JSON first, verification will always fail with 400.

Use @RequestBody String payload on the webhook method — never a DTO or Object
Add produces = MediaType.TEXT_PLAIN_VALUE to the webhook @PostMapping
Return a plain string response body ("OK"), not JSON


⚠ CRITICAL — Webhook Deserialization Safety
event.getDataObjectDeserializer().getObject() returns Optional<StripeObject>.
This can be empty if the SDK does not recognise the object shape.

Never call .orElseThrow() — this crashes the handler and causes Stripe to retry
In every case block: check .isEmpty() first, log a warning, then break
Only cast to the specific Stripe type after confirming the Optional is present

Apply this pattern to all four event case blocks:
javavar deserializer = event.getDataObjectDeserializer();
if (deserializer.getObject().isEmpty()) {
log.warn("Empty deserializer for event type: {}", event.getType());
break;
}
// Safe to cast now
Session session = (Session) deserializer.getObject().get();

⚠ CRITICAL — Webhook customerEmail Null Safety
session.getCustomerEmail() can return null when an existing Stripe customer checks out.
If you only look up by email, the user will never be upgraded in this case.
Always use the two-step lookup: try email first, fall back to stripeCustomerId.
Log a warning if both return empty and return silently — do not crash.
javaOptional<User> userOpt = Optional.empty();

String email = session.getCustomerEmail();
if (email != null) {
userOpt = userRepository.findByEmail(email);
}
if (userOpt.isEmpty()) {
userOpt = userRepository.findByStripeCustomerId(session.getCustomer());
}
if (userOpt.isEmpty()) {
log.warn("No user found for checkout session: {}", session.getId());
break;
}
User user = userOpt.get();

⚠ CRITICAL — Hash Routing and Payment Query Params
The frontend uses hash-based routing. After Stripe redirects to:
http://localhost:5173/#/account?payment=success
The ?payment=success param is inside the hash — it is NOT in window.location.search.
window.location.search will always be empty on this URL.
In account.js, parse the payment param from window.location.hash by splitting on ?
and passing the second part to URLSearchParams. Never use window.location.search.
javascript// CORRECT
const hashParts = window.location.hash.split('?');
const params = new URLSearchParams(hashParts[1] || '');
const paymentStatus = params.get('payment'); // 'success' | 'cancelled' | null

// WRONG — will always be null on hash-routed URLs
const params = new URLSearchParams(window.location.search);

⚠ CRITICAL — isPaid() Depends on getCurrentUser() Being Awaited First
isPaid() in auth.js reads from a module-level variable that is only populated
after getCurrentUser() has been called and its Promise has resolved.
If you call isPaid() before await getCurrentUser() completes, it will always return
false — even for paid users.
Always follow this exact pattern in any page that uses isPaid():
javascript// CORRECT
const user = await getCurrentUser();
if (!user) { window.location.hash = '#/login'; return; }
if (!isPaid()) { renderUpgradePrompt(); return; }

// WRONG — isPaid() runs before getCurrentUser() resolves
getCurrentUser().then(...);
if (!isPaid()) { ... } // always false here
This applies to fiqhtool.js and any other page that gates on subscription status.

🎨 Frontend Behaviour
account.js
Imports needed:
javascriptimport { getCurrentUser, isPaid } from '../auth.js';
import { createCheckout, logout } from '../api.js';
On load sequence:

Parse payment status from window.location.hash (not window.location.search) — see CRITICAL section above
Call await getCurrentUser() — if null redirect to #/login and return
If paymentStatus is 'success' — call await getCurrentUser() again to get fresh status from server.
This second call is required because the webhook may have updated subscriptionStatus after
the Stripe redirect, and the first call may have run before the webhook fired.
Render the page

Page must show:

User email
Plan badge — green "Paid" or grey "Free" based on subscriptionStatus
If free: upgrade card with feature list and "Upgrade Now" button
If paid: "Active subscription" with green checkmark, no upgrade card
Green success banner if paymentStatus === 'success'
Neutral cancelled banner if paymentStatus === 'cancelled'
Logout button at bottom

Button behaviours:

Upgrade Now → call createCheckout(), redirect to data.url
Logout → call logout(), redirect to #/login


library.js
Add to existing imports (do not replace them):
javascriptimport { getCurrentUser } from '../auth.js';
import { downloadBook } from '../api.js';
Call getCurrentUser() once on page load and store in a variable.
Do not call it again on each click.
Download button behaviour per user state:
StateBehaviourNot logged inRedirect to #/loginLogged in, freeReplace button with inline upgrade prompt linking to #/accountLogged in, paidCall downloadBook(bookId)

fiqhtool.js
Imports needed:
javascriptimport { getCurrentUser, isPaid } from '../auth.js';
import { getMasailCategories } from '../api.js';
On load — follow this exact async sequence to avoid isPaid() returning false prematurely:
javascriptconst user = await getCurrentUser();
if (!user) {
window.location.hash = '#/login';
return;
}
// isPaid() is safe to call now because getCurrentUser() has resolved
if (!isPaid()) {
renderUpgradePrompt();
return;
}
// Paid user — render tool
const categories = await getMasailCategories();
renderCategoryButtons(categories);
renderSearchBarShell();
Do not implement masail content rendering — that is Step 18. Only render:

Upgrade prompt (for free users)
Category buttons and search bar shell (for paid users)


📦 api.js — Five New Functions To Add
All must use credentials: 'include'.
Before adding anything, confirm these still exist and are unchanged:

logout() — added in Step 13
downloadBook() — added in an earlier step

Add only these five new functions — do not remove or change any existing functions:
javascriptexport async function createCheckout() {
const res = await fetch(`${API_BASE}/api/payment/create-checkout`, {
method: 'POST',
credentials: 'include'
});
if (!res.ok) throw new Error('Checkout failed');
return res.json(); // returns { url: '...' }
}

export async function getMasailCategories() {
const res = await fetch(`${API_BASE}/api/masail/categories`, {
credentials: 'include'
});
if (!res.ok) throw new Error('Failed to fetch categories');
return res.json(); // returns array of strings
}

export async function getMasailByCategory(category) {
const res = await fetch(`${API_BASE}/api/masail?category=${encodeURIComponent(category)}`, {
credentials: 'include'
});
if (!res.ok) throw new Error('Failed to fetch masail');
return res.json();
}

export async function searchMasail(query) {
const res = await fetch(`${API_BASE}/api/masail/search?query=${encodeURIComponent(query)}`, {
credentials: 'include'
});
if (!res.ok) throw new Error('Search failed');
return res.json();
}

export async function getMasalah(id) {
const res = await fetch(`${API_BASE}/api/masail/${id}`, {
credentials: 'include'
});
if (!res.ok) throw new Error('Failed to fetch masalah');
return res.json();
}

🧱 Step-by-Step Implementation Order
Step 1 — Confirm User.java fields
Open User.java. Confirm subscriptionStatus, stripeCustomerId, and
stripeSubscriptionId exist with correct @Column annotations, plus getters and
setters. Add any that are missing. No business logic — fields only.
Step 2 — Update UserRepository
Add findByStripeCustomerId(String) and findByStripeSubscriptionId(String).
Confirm findByEmail(String) already exists from Step 13.
Step 3 — Create PaymentService

Annotate with @Service
Constructor-inject UserRepository
Use @Value to read: stripe.secret.key, stripe.webhook.secret, stripe.price.id, app.base.url
Use @PostConstruct to set Stripe.apiKey on startup
Implement createCheckoutSession(User user) — builds Stripe SessionCreateParams
in subscription mode with the correct success/cancel URLs and price, calls
Session.create(), returns the session URL
Implement handleWebhook(String payload, String sigHeader) — calls
Webhook.constructEvent() to verify signature (let SignatureVerificationException
bubble up to the controller), switches on event type, processes the four events
using the safe Optional deserialization pattern and two-step user lookup described
in the CRITICAL sections above

Step 4 — Create PaymentController

Annotate with @RestController, @RequestMapping("/api/payment")
Constructor-inject PaymentService
POST /create-checkout — extract user from Authentication principal, call
service, return { "url": "..." } on success, 500 with message on failure
POST /webhook — @RequestBody String, produces = TEXT_PLAIN_VALUE, call
service, return 200 "OK" on success, 400 on SignatureVerificationException

Step 5 — Update BookController download endpoint
Before the existing file streaming logic, add auth and paid checks:
javaif (authentication == null || !authentication.isAuthenticated()) {
return ResponseEntity.status(401)
.body(Map.of("message", "Authentication required"));
}
User user = (User) authentication.getPrincipal();
if (!"paid".equals(user.getSubscriptionStatus())) {
return ResponseEntity.status(403)
.body(Map.of("message", "Access denied"));
}
// Existing file streaming logic below — leave unchanged
Leave all existing file streaming logic below these checks unchanged.
Step 6 — Update SecurityConfig
Add the five new matcher rules in the exact order listed in the SecurityConfig section.
Do not change CORS or any existing rules.

After both Step 5 and Step 6 are complete, the download endpoint enforces both JWT
authentication AND paid subscription status. Test access control only after both steps are done.

Step 7 — Build account.js
Create the file. Follow the load sequence and render requirements above.
Parse payment params from the hash — not from window.location.search.
Re-call getCurrentUser() on payment=success to pick up webhook-updated status.
Step 8 — Update library.js
Add the two imports. Call getCurrentUser() once on load. Implement the three-state
download button handler.
Step 9 — Update fiqhtool.js
Add the two imports. Follow the exact async sequence in the fiqhtool.js section above —
await getCurrentUser() must resolve before calling isPaid().
Do not implement masail content — that is Step 18.
Step 10 — Update api.js
Add the five new functions using the implementations shown above.
Confirm all existing functions are untouched.

🧪 Testing Checklist
Setup

☑ All four environment variables are set
☑ stripe.price.id=${STRIPE_PRICE_ID} is in application.properties
☑ stripe-java 24.x is in pom.xml
☑ Stripe CLI running: stripe listen --forward-to localhost:8080/api/payment/webhook
☑ Use test card 4242 4242 4242 4242 to simulate payment

Payment Flow

☑ POST /api/payment/create-checkout returns a Stripe URL for a logged-in user
☑ POST /api/payment/create-checkout returns 401 for unauthenticated request
☑ Stripe checkout opens in the browser
☑ After test payment: webhook fires checkout.session.completed
☑ After webhook: user subscriptionStatus in database is 'paid'
☑ After webhook: stripeCustomerId and stripeSubscriptionId saved in database
☑ customer.subscription.deleted resets user to 'free', clears stripeSubscriptionId
☑ Invalid Stripe signature returns 400
☑ Valid signature returns 200
☑ Unrecognised event type returns 200 silently
☑ Empty deserializer result logs warning and returns 200 — does not crash
☑ Null customerEmail in checkout.session.completed still upgrades user via customerId fallback

Access Control — Backend

☑ Unauthenticated download → 401
☑ Free user download → 403
☑ Paid user download → file streams correctly
☑ Unauthenticated GET /api/masail?category=Salah → 401 (SecurityConfig rejects before any controller — this is expected and correct)
☑ Free user GET /api/masail?category=Salah → 403 (SecurityConfig rejects before any controller — this is expected and correct)
☑ Paid user GET /api/masail?category=Salah → 200 (empty array is fine — no masail logic until Steps 16–17)
☑ GET /api/masail/categories → 200 with no auth

Frontend — account.js

☑ Unauthenticated user redirected to #/login
☑ Free user sees "Free" badge and upgrade card
☑ Paid user sees green "Paid" badge and "Active subscription"
☑ Upgrade Now redirects to Stripe checkout URL
☑ ?payment=success banner appears (parsed from hash, not window.location.search)
☑ ?payment=cancelled banner appears
☑ Logout redirects to #/login
☑ After successful payment, account page shows "Paid" badge (second getCurrentUser() call picked up webhook update)

Frontend — library.js

☑ Not logged in: download click → #/login
☑ Free user: download click → inline upgrade prompt on card
☑ Paid user: download click → file downloads
☑ getCurrentUser() called once on load only

Frontend — fiqhtool.js

☑ Not logged in → #/login
☑ Free user → upgrade prompt, no search bar or categories rendered
☑ Paid user → category buttons and search bar shell rendered
☑ isPaid() is only called after await getCurrentUser() has resolved

Regression

☑ Library, roadmap, login, and registration still work correctly
☑ logout() still exists unchanged in api.js
☑ downloadBook() still exists unchanged in api.js


✅ Success Criteria For Moving To Step 16

✅ Stripe checkout creates a session and redirects the user
✅ Webhook sets subscriptionStatus to 'paid' on checkout completion
✅ Webhook resets subscriptionStatus to 'free' on subscription cancellation
✅ Webhook never crashes on empty deserialization
✅ Webhook handles null customerEmail via customerId fallback
✅ PDF download returns 403 for free users and streams file for paid users
✅ Masail endpoints return 403 for free users
✅ GET /api/masail/categories is publicly accessible
✅ account.js shows correct state for free and paid users
✅ library.js shows correct three-state download behaviour
✅ fiqhtool.js shows upgrade gate for non-paid users
✅ Payment banners render from hash params correctly
✅ No regression in any existing feature


🚨 Common Mistakes To Avoid

❌ Parsing ?payment=success from window.location.search — it is inside the hash, always parse from window.location.hash
❌ Calling isPaid() before await getCurrentUser() has resolved — isPaid() reads a module-level variable that is only set after getCurrentUser() completes. It will always return false if called too early
❌ Using .orElseThrow() on the webhook deserializer Optional — always check .isEmpty() first and break silently if empty
❌ Only looking up the user by customerEmail in checkout.session.completed — email can be null, always fall back to findByStripeCustomerId()
❌ Trusting the payment=success redirect to confirm payment — only the webhook is truth
❌ Using @RequestBody Object or a DTO on the webhook method — must be @RequestBody String
❌ Forgetting produces = MediaType.TEXT_PLAIN_VALUE on the webhook @PostMapping
❌ Hardcoding any Stripe key or price ID — always use ${ENV_VAR} syntax
❌ Forgetting to add stripe.price.id to application.properties — PaymentService will fail to start with an injection error
❌ Calling UserRepository directly from PaymentController — always go through PaymentService
❌ Letting one service call another service
❌ Returning non-200 to Stripe after successful webhook processing — causes retries
❌ Skipping Stripe signature verification before processing any webhook payload
❌ Putting /api/masail/** before /api/masail/categories in SecurityConfig
❌ Implementing masail service or database logic in this step — that is Steps 16–17
❌ Removing or rewriting logout() or downloadBook() in api.js
❌ Forgetting imports in frontend files — getCurrentUser and isPaid come from auth.js; createCheckout, logout, downloadBook, getMasailCategories come from api.js
❌ Changing the CORS configuration — it was set correctly in Step 13
❌ Testing download access control before both Step 5 and Step 6 are complete — both are required together


🧠 Session Initialization Rule
At the start of every session Claude must:

Read CLAUDE.md
Read CLAUDE-Step-14-PROGRESS.md
Read CLAUDE-Step-15-Access-Control.md
Confirm current step
Then begin implementation