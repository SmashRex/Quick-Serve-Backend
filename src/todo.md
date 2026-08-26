QUICKSERVE BACKEND — IMPLEMENTATION TRACKER

How to use this: Each item has a "Definition of Done" — don't check it off until that condition is actually true, not just "code written."

Legend: ✅ Done | 🔲 Not started

PHASE 1 — FOUNDATION
#	Task	Definition of Done
✅	Project scaffold (Express, folder structure, packages installed)	npm ls shows all core packages with no errors
✅	Switch to ES6 modules	"type": "module" in package.json; server runs with import/export syntax
✅	app.js — health check + global error handler	GET /health returns 200 JSON; a thrown error returns clean JSON, not a raw stack trace
✅	Postgres connection via Knex	/db-test route (or equivalent) returns a live DB timestamp
✅	Switch validation to Zod	zod installed, express-validator removed
✅	Decision: JS now, TypeScript migration later	Documented decision, no action needed yet
🔲	Add npm run dev script (nodemon)	npm run dev starts server with auto-restart on file change
PHASE 2 — DATABASE SCHEMA (MIGRATIONS)
#	Table	Definition of Done
✅	Enable pgcrypto extension	gen_random_uuid() works in migrations
✅	users	\d users shows all columns; UUID PK confirmed
✅	addresses	FK to users confirmed; FK violation test rejected correctly
✅	service_catalog	Unique constraint on (item_type, service_type) confirmed via duplicate-insert test
✅	service_zones	polygon stored as jsonb; test insert accepted
✅	partners	status defaults to 'onboarding' confirmed via insert
✅	orders	All 4 FKs (customer_id, partner_id, pickup_address_id, delivery_address_id) confirmed in \d orders
✅	order_items	FK to orders confirmed; photo columns nullable
✅	order_status_history	No updated_at column (append-only); FK to orders confirmed
✅	order_transitions + seed	SELECT * FROM order_transitions returns exactly 10 correct rows
✅	payments	Defaults (provider='paystack', status='pending') confirmed
✅	verification_tokens	FK to users confirmed
✅	Alter users.phone → nullable	Signup with no phone succeeds, stores NULL
🔲	admin_users	Table created; role column accepts dispatcher/support/finance/super_admin
🔲	riders (+ email column decision)	Table created with email unique column added per our auth decision
🔲	disputes	Table created matching schema doc
🔲	partner_payouts	Table created matching schema doc
🔲	messages (split thread_type)	Table created; thread_type constrained to customer_thread/partner_thread
🔲	notifications	Table created matching schema doc
🔲	auth_sessions → repurpose to password_reset_tokens	Old OTP fields dropped, token_hash/used_at added
🔲	email_verified_at on partners	Column added, matches users pattern
PHASE 3 — AUTH MODULE (Customer)
#	Route	Definition of Done
✅	POST /auth/signup	201 on success; 409 on duplicate email; 400 on bad input; verification link logged to console
✅	GET /auth/verify	200 + sets email_verified_at; 400 on reused/invalid token; 400 on expired token
✅	POST /auth/login	200 + tokens on valid+verified login; 401 on wrong password; 401 on unverified email
✅	authenticate middleware	Rejects missing/invalid/expired tokens; passes valid ones through with req.user set
✅	GET /auth/me	200 with {userId, email, role} when authenticated; 401 without token
✅	POST /auth/refresh	200 with new token pair on valid refresh token; 401 on invalid/garbage/wrong-type token
✅	POST /auth/logout	200 with confirmation message; requires valid token to call
✅	Updated API doc sent to frontend dev	Doc reflects only verified, tested behavior

🎉 Auth module (customer) — COMPLETE

PHASE 4 — AUTH MODULE (Rider / Partner / Admin)
#	Task	Definition of Done
🔲	Decide: same hard email-verification gate for partner/admin, or different?	Explicit decision recorded
🔲	riders table + email column	Migration run, confirmed via \d riders
🔲	POST /admin/riders (ops creates rider account)	201 on success; rider row created with hashed password
🔲	POST /auth/login extended for rider/partner/ops (or separate endpoints — per earlier decision)	Each role can log in and receives correct role in JWT payload
🔲	authorize(role) middleware (role-based access control)	Route protected by e.g. authorize('ops') rejects other roles with 403
🔲	Admin role-tier checks (dispatcher/support/finance/super_admin)	At least one route (e.g. payouts) enforces specific sub-roles
🔲	POST /partner/onboarding (self-signup)	201 on success; partner starts in status: 'onboarding'
🔲	POST /admin/partners/:id/approve	Partner status flips to active; max_turnaround_hours confirmable/adjustable
PHASE 5 — CUSTOMER ORDER FLOW
#	Task	Definition of Done
🔲	POST /addresses	Address created, linked to authenticated customer
🔲	GET /addresses	Returns only the logged-in customer's own addresses
🔲	PUT /addresses/:id	Edits succeed; customer cannot edit another user's address (ownership check)
🔲	Zone-check logic (service_zones)	Order creation rejects/waitlists addresses outside active zones
🔲	Pricing lookup (service_catalog)	order_items.item_price pulled from catalog, not client-supplied — verified by attempting to pass a fake price and confirming it's ignored
🔲	POST /orders	Order + order_items created atomically; current_status defaults to order_placed; first order_status_history row written
🔲	GET /orders	Returns only the logged-in customer's own orders
🔲	GET /orders/:id	Returns order + current status; 403/404 if not the owner
🔲	GET /orders/:id/history	Returns full order_status_history for that order
🔲	POST /orders/:id/cancel	Succeeds only if current_status is before picked_up; rejected otherwise
🔲	Order-creation email-verification gate	POST /orders rejects if email_verified_at IS NULL (per earlier decision, revisit given hard-gate-at-login now exists)
PHASE 6 — PAYMENTS (PAYSTACK)
#	Task	Definition of Done
🔲	Paystack account/test keys obtained	Keys added to .env
🔲	POST /orders/:id/pay	Returns Paystack payment init URL/reference
🔲	POST /payments/webhook	Correctly verifies Paystack signature; updates payments.status and orders.payment_status
🔲	GET /orders/:id/payment-status	Reflects real-time payment state
🔲	Webhook signature verification tested	A forged/unsigned webhook request is rejected
PHASE 7 — RIDER MODULE
#	Task	Definition of Done
🔲	GET /rider/tasks	Returns only tasks assigned to the logged-in rider
🔲	Transition-validation service (order_transitions lookup)	Reusable function; rejects any transition not in the table
🔲	POST /rider/tasks/:orderId/status	Validated against order_transitions; writes order_status_history row
🔲	POST /rider/tasks/:orderId/proof	Blocks status advance to at_hub/delivered if required photo missing
🔲	PUT /rider/status (availability toggle)	Rider's status field updates correctly
🔲	File storage for proof photos (S3 or equivalent)	Uploaded photo returns a real accessible URL, stored in order_items
PHASE 8 — PARTNER MODULE
#	Task	Definition of Done
🔲	GET /partner/orders	Returns only orders assigned to logged-in partner
🔲	POST /partner/orders/:id/accept	Starts SLA countdown; returns deadline timestamp
🔲	POST /partner/orders/:id/status	Validated against order_transitions
🔲	GET /partner/orders/:id/sla	Returns accurate time remaining
🔲	SLA breach detection (delayed state)	Automated check flags breached orders; visible in GET /admin/orders/breaches
PHASE 9 — ADMIN/OPS MODULE
#	Task	Definition of Done
🔲	GET /admin/orders (filterable)	Filters by status/zone/partner all work; pagination contract decided and implemented
🔲	POST /admin/orders/:id/assign-rider	Accepts leg param; writes assignment; validated against transitions
🔲	POST /admin/orders/:id/assign-partner	Assigns order to partner correctly
🔲	GET /admin/orders/:id/proof-photos	Returns both pickup/delivery photo URLs for dispute review
🔲	GET /admin/partners, GET /admin/partners/:id	List + detail views working
🔲	PUT /admin/partners/:id	Status/SLA updates persist correctly
🔲	GET /admin/disputes, GET /admin/disputes/:id	List + detail views working
🔲	PUT /admin/disputes/:id/resolve	Resolution recorded; dispute closed
🔲	GET /admin/payouts	Lists pending/paid payouts
🔲	PUT /admin/payouts/:id/mark-paid	Restricted to finance/super_admin roles only — verified via 403 test with wrong role
PHASE 10 — MESSAGING & NOTIFICATIONS
#	Task	Definition of Done
🔲	messages split-thread routes (customer/partner)	Customer can only see/send on customer_thread; partner only on partner_thread
🔲	GET /admin/orders/:id/messages	Ops sees both threads, clearly labeled, never merged
🔲	GET /notifications, PUT /notifications/:id/read	Working per-user
🔲	POST /devices/register	Push token stored in device_tokens
🔲	Firebase integration — real-time order status writes	Status change in Postgres triggers a Firebase write in the same request
PHASE 11 — HARDENING (pre-launch)
#	Task	Definition of Done
🔲	Real email provider connected	Verification/reset emails actually deliver, not just console logs
🔲	Password reset flow (/auth/forgot-password, /auth/reset-password)	Full round trip tested
🔲	Rate limiting on auth routes	Repeated failed logins throttled
🔲	Environment secrets rotated from dev placeholders	Real, unique JWT_ACCESS_SECRET/JWT_REFRESH_SECRET in production .env
🔲	Load/basic security review of transition-validation logic	Confirmed no route can bypass order_transitions

warning package-lock.json found. Your project contains lock files generated by tools other than Yarn. It is advised not to mix package managers in order to avoid resolution inconsistencies caused by unsynchronized lock files. To clear this warning, remove package-lock.json.
[1/4] Resolving packages...
(node:95) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
warning firebase-admin > @google-cloud/storage > gaxios > uuid@9.0.1: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
warning firebase-admin > @google-cloud/storage > teeny-request > uuid@9.0.1: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
warning firebase-admin > google-auth-library > gaxios > node-fetch > fetch-blob > node-domexception@1.0.0: Use your platform's native DOMException instead
warning firebase-admin > @google-cloud/firestore > google-gax > rimraf > glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
warning multer@1.4.5-lts.2: Multer 1.x is impacted by a number of vulnerabilities, which have been patched in 2.x. You should upgrade to the latest 2.x version.