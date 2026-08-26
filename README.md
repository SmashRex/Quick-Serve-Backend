# QuickServe Backend

> **A production-minded REST API for a laundry and dry-cleaning pickup-and-delivery marketplace.**

QuickServe is a backend platform that connects **customers, riders, dry-cleaning partners, and operations staff** through a single API.

It manages the complete order journey, from service selection and order placement to payment, pickup, cleaning, delivery, disputes, and partner payouts.

The project is built with **Node.js, Express, PostgreSQL, and Knex.js**, with a strong focus on clean architecture, validation, authentication, authorization, and state-driven business logic.

---

## Overview

QuickServe is designed around a simple idea:

> **Make booking laundry and dry-cleaning services as convenient and trackable as ordering a ride or food.**

The backend coordinates multiple actors while keeping the business rules centralized and secure.

```text
                    ┌──────────────────┐
                    │     Customer     │
                    └────────┬─────────┘
                             │
                             ▼
┌──────────────┐      ┌───────────────┐      ┌──────────────────┐
│    Rider     │◄────►│ QuickServe API│◄────►│ Dry-Clean Partner│
└──────────────┘      └───────┬───────┘      └──────────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ Operations/Admin│
                      └─────────────────┘
```

The API is responsible for coordinating these actors while enforcing the rules that determine what each actor can see and do.

---

## Why This Project?

QuickServe was built as a hands-on backend engineering project focused on solving a realistic marketplace problem.

Rather than treating the API as a collection of CRUD endpoints, the project applies production-oriented patterns such as:

- Layered architecture
- Domain-based module organization
- JWT authentication
- Role-based authorization
- Request validation with Zod
- Server-side pricing
- Database-backed state transitions
- Transactional database operations
- Payment webhook verification
- Centralized error handling
- Cloud-based media storage
- Audit-friendly order history

The goal is to build a backend that is **predictable, testable, secure, and capable of evolving beyond an MVP**.

---

## Features

### Customer

- Account registration and login
- Email verification
- Password reset
- Access and refresh token authentication
- Address management
- Service catalog
- Order creation
- Order tracking
- Payment through Paystack
- Order cancellation
- Dispute creation
- Customer support messaging
- Device registration for future push notifications

### Rider

- Rider authentication
- Assigned task management
- Pickup and delivery workflow
- Order status updates
- Proof-of-handoff uploads

### Dry-Cleaning Partner

- Partner authentication
- Assigned order queue
- Order acceptance
- Cleaning status management
- SLA visibility
- Operations messaging

### Operations / Admin

- Order monitoring
- Rider assignment
- Partner assignment
- Partner approval and management
- Dispute management
- Payout management
- SLA monitoring
- Role and tier-based access control

### Platform

- PostgreSQL persistence
- Database migrations with Knex
- Server-side pricing
- Service-zone validation
- Paystack payments and webhooks
- Cloudinary media storage
- Transactional email
- Centralized API errors
- Append-only order status history

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | JavaScript |
| Modules | ES Modules |
| Database | PostgreSQL |
| Query Builder | Knex.js |
| Validation | Zod |
| Authentication | JWT |
| Password Hashing | bcrypt |
| File Uploads | Multer |
| Media Storage | Cloudinary |
| Payments | Paystack |
| Email | Nodemailer + Gmail SMTP |
| API Hosting | Render |
| Database Hosting | Neon |

---

## Architecture

QuickServe follows a **module-per-domain architecture**.

The application is organized around business domains rather than technical layers alone.

A typical request flows through:

```text
HTTP Request
     │
     ▼
   Route
     │
     ▼
 Middleware
     │
     ├── Authentication
     ├── Authorization
     └── Validation
     │
     ▼
 Controller
     │
     ▼
  Service
     │
     ├── PostgreSQL
     ├── Paystack
     ├── Cloudinary
     └── Email
     │
     ▼
 JSON Response
```

### Design philosophy

#### Routes

Routes define the public HTTP interface and middleware chain.

They should remain declarative and lightweight.

#### Controllers

Controllers translate HTTP requests into service calls and format responses.

They should not contain complex business logic.

#### Services

Services contain the application's business rules.

Examples include:

- Creating an order
- Calculating an order price
- Assigning a rider
- Validating an order transition
- Resolving a dispute
- Processing a payment
- Creating a payout

#### Middleware

Middleware handles cross-cutting concerns such as:

- Authentication
- Authorization
- Request validation
- Error handling

This separation keeps the business logic independent from Express.

---

## Project Structure

```text
quickserve-backend/
│
├── src/
│   │
│   ├── app.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   ├── paystack.js
│   │   └── email.js
│   │
│   ├── db/
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── addresses/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── riders/
│   │   ├── riderTasks/
│   │   ├── partners/
│   │   ├── partnerOrders/
│   │   ├── adminOrders/
│   │   ├── adminPartners/
│   │   ├── adminDisputes/
│   │   ├── adminPayouts/
│   │   ├── messages/
│   │   ├── notifications/
│   │   └── devices/
│   │
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── authorizeTier.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   │
│   ├── services/
│   │   └── orderTransitions.service.js
│   │
│   └── utils/
│       ├── formatters.js
│       ├── geo.js
│       ├── cloudinaryStorage.js
│       ├── paystackClient.js
│       └── email.js
│
├── .env.example
├── .gitignore
├── knexfile.js
├── package.json
├── server.js
└── README.md
```

Each domain owns its routes, controllers, services, and validation where applicable.

This makes features easier to reason about and reduces the risk of business logic becoming scattered across the application.

---

# Order Lifecycle

Orders are not treated as arbitrary records whose status can be changed freely.

QuickServe uses a **state-machine-driven order pipeline**.

```text
order_placed
      │
      ▼
rider_assigned
      │
      ▼
picked_up
      │
      ▼
at_hub
      │
      ▼
sent_to_partner
      │
      ▼
at_partner
      │
      ▼
cleaning_in_progress
      │
      ▼
ready_for_pickup
      │
      ▼
returned_to_hub
      │
      ▼
out_for_delivery
      │
      ▼
delivered
```

Two additional states are used outside the normal pipeline:

```text
cancelled
disputed
```

### Why a state machine?

Without a state machine, a client could potentially request invalid changes such as:

```text
order_placed → delivered
```

or:

```text
delivered → cleaning_in_progress
```

QuickServe prevents this by validating every transition against explicit server-side rules.

---

## State Transition Architecture

The transition system acts as a guardrail around the order lifecycle.

```text
Current Status
      +
Requested Status
      +
Actor Role
      │
      ▼
Transition Rules
      │
 ┌────┴────┐
 │         │
Allowed   Rejected
 │
 ▼
Database Transaction
 │
 ├── Update order
 └── Write status history
```

Every successful status transition is recorded in an append-only `order_status_history` table.

This provides an audit trail that can be used to understand:

- What happened to an order
- When the change happened
- Which actor initiated it
- How the order reached its current state

---

# Authentication & Authorization

QuickServe uses **JWT access and refresh tokens**.

Authenticated requests use:

```http
Authorization: Bearer <accessToken>
```

The backend distinguishes between:

- **Authentication:** Who is making the request?
- **Authorization:** Is that user allowed to perform this action?

A protected route can therefore follow:

```text
authenticate
      ↓
authorize(role)
      ↓
authorizeTier(permission)
      ↓
validate(request)
      ↓
controller
```

Authorization is enforced server-side.

The frontend is never trusted to enforce permissions by itself.

### Supported roles

```text
customer
rider
partner
admin
```

Administrative access can be further restricted through tiers such as:

```text
dispatcher
support
finance
super_admin
```

---

# API

## Base URL

Development:

```text
http://localhost:3000/api/v1
```

Production:

```text
https://<production-domain>/api/v1
```

API versioning is used to provide a stable contract as the platform evolves.

---

## API Conventions

### Request and response fields

The API uses `camelCase`.

Database columns use `snake_case`.

Example:

```json
{
  "orderId": "ord_123",
  "currentStatus": "cleaning_in_progress",
  "createdAt": "2026-08-26T08:00:00.000Z"
}
```

### Error responses

Errors follow a consistent structure:

```json
{
  "message": "Human-readable error description",
  "error": "VALIDATION_ERROR",
  "statusCode": 400
}
```

Common error categories include:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
CONFLICT
INVALID_STATE_TRANSITION
PAYMENT_ERROR
EXTERNAL_SERVICE_ERROR
INTERNAL_SERVER_ERROR
```

---

# API Route Overview

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register customer |
| `POST` | `/auth/login` | Customer login |
| `POST` | `/auth/refresh` | Refresh access token |
| `GET` | `/auth/verify` | Verify account |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password |

## Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders` | List customer orders |
| `POST` | `/orders` | Create an order |
| `GET` | `/orders/:orderId` | Get order details |
| `POST` | `/orders/:orderId/cancel` | Cancel an eligible order |
| `POST` | `/orders/:orderId/disputes` | Raise a dispute |
| `GET` | `/orders/:orderId/status-history` | View order history |

## Payments

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders/:orderId/pay` | Initialize payment |
| `GET` | `/orders/:orderId/payment-status` | Check payment status |
| `POST` | `/payments/webhook` | Receive Paystack webhook |

## Rider

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/rider-auth/login` | Rider login |
| `GET` | `/rider/tasks` | List assigned tasks |
| `GET` | `/rider/tasks/:orderId` | View task |
| `POST` | `/rider/tasks/:orderId/status` | Update task status |
| `POST` | `/rider/tasks/:orderId/proof` | Upload proof |

## Partner

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/partner-auth/login` | Partner login |
| `GET` | `/partner/orders` | List assigned orders |
| `GET` | `/partner/orders/:orderId` | View partner order |
| `POST` | `/partner/orders/:orderId/accept` | Accept order |
| `POST` | `/partner/orders/:orderId/status` | Update cleaning status |
| `GET` | `/partner/orders/:orderId/sla` | View SLA information |

## Admin

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin-auth/login` | Admin login |
| `GET` | `/admin/orders` | List and filter orders |
| `POST` | `/admin/orders/:orderId/assign-rider` | Assign rider |
| `POST` | `/admin/orders/:orderId/assign-partner` | Assign partner |
| `GET` | `/admin/disputes` | List disputes |
| `PUT` | `/admin/disputes/:disputeId/resolve` | Resolve dispute |
| `GET` | `/admin/payouts` | List payouts |
| `PUT` | `/admin/payouts/:payoutId/mark-paid` | Mark payout as paid |

> The API route map is intentionally high-level. Detailed request and response schemas can be maintained in dedicated API documentation as the modules mature.

---

# Key Engineering Decisions

## Server-side pricing

The client never determines the final order price.

Prices are resolved from the service catalog on the backend.

```text
Client request
      ↓
Service selection
      ↓
Server-side catalog lookup
      ↓
Price calculation
      ↓
Order total
```

This prevents clients from manipulating prices.

---

## Database-backed state rules

Order transitions are controlled through explicit rules rather than scattered `if` statements across controllers.

This keeps the order lifecycle centralized and easier to test.

---

## Transactional order updates

Important multi-step operations use database transactions where consistency matters.

For example:

```text
Update order status
        +
Create status history
```

should succeed together or fail together.

---

## Non-destructive disputes

A dispute should not destroy the operational history of an order.

The system preserves the order's previous state so that operations can resolve the dispute and return the order to the appropriate workflow.

---

## Service-zone validation

QuickServe currently stores service zones as JSONB polygons and performs point-in-polygon checks in application code.

This keeps the initial implementation relatively lightweight while leaving room for a more advanced geospatial implementation later.

---

## Automatic payouts

When an order reaches `delivered`, the backend can create the corresponding partner payout record automatically.

This removes the need for operations staff to manually initiate every payout.

---

# Payments

QuickServe integrates with **Paystack** for payment processing.

The payment flow is designed around server-side verification.

```text
Customer
   │
   ▼
QuickServe
   │
   ▼
Paystack
   │
   ▼
Webhook
   │
   ▼
Signature Verification
   │
   ▼
Transaction Verification
   │
   ▼
Order Payment Update
```

The backend does not trust a client-side payment result as the final source of truth.

Webhook processing should also be idempotent so that duplicate webhook deliveries do not create duplicate financial records.

---

# File Uploads

Multer is used to process incoming file uploads.

Cloudinary provides persistent media storage.

```text
Client
  │
  ▼
Multer
  │
  ▼
Memory
  │
  ▼
Cloudinary
  │
  ▼
Media URL
```

Uploads are primarily used for rider proof-of-handoff images.

Upload endpoints should validate:

- File type
- File size
- Authentication
- Authorization
- Resource ownership

---

# Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
NODE_ENV=development
APP_BASE_URL=http://localhost:3000

DATABASE_URL=postgres://user:password@localhost:5432/quickserve

JWT_ACCESS_SECRET=your_long_random_secret
JWT_REFRESH_SECRET=your_different_long_random_secret

PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your16characterapppassword
```

Never commit `.env` or production credentials to Git.

Use `.env.example` as the public configuration template.

### Generate secure JWT secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Generate different values for the access and refresh token secrets.

---

# Getting Started

## Prerequisites

Make sure you have:

- Node.js 18+
- npm
- PostgreSQL 14+
- Git

For full functionality, you will also need accounts for:

- Paystack
- Cloudinary
- Gmail SMTP

Test credentials are sufficient for local development.

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd quickserve-backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows, you can create the `.env` file manually and copy the values from `.env.example`.

---

## Database Setup

Run the latest migrations:

```bash
npx knex migrate:latest
```

Seed required reference data:

```bash
npx knex seed:run
```

The order transition rules must be seeded for the order state machine to operate correctly.

---

## Running Locally

Start the development server:

```bash
npm run dev
```

Or start the server directly:

```bash
node server.js
```

The API should now be available at:

```text
http://localhost:3000
```

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

---

# Development Workflow

When adding a feature, follow the domain architecture:

```text
1. Define the business rule
          ↓
2. Create validation schema
          ↓
3. Implement service logic
          ↓
4. Add controller
          ↓
5. Add route
          ↓
6. Add migration if needed
          ↓
7. Test the complete flow
```

A new feature should answer:

- Who can use it?
- What data does it accept?
- What business rules apply?
- What database records change?
- Does it require a transaction?
- Does it call an external service?
- Does it need an audit record?
- Does it trigger a notification?

---

# Testing

The project is intended to support multiple testing layers.

## Unit tests

Good candidates include:

- Order transition rules
- Price calculation
- Service-zone calculations
- Permission checks
- Data formatting

## Integration tests

Examples:

- Creating an order
- Assigning a rider
- Assigning a partner
- Resolving a dispute
- Creating a payout
- Processing a payment

## API tests

Examples:

```text
POST /api/v1/auth/login
POST /api/v1/orders
POST /api/v1/orders/:orderId/pay
POST /api/v1/admin/orders/:orderId/assign-rider
```

## State machine testing

Every valid transition should have a success test.

Every invalid transition should have a rejection test.

Critical cases should also verify:

- Correct actor permissions
- Status history creation
- Transactional consistency
- Duplicate transition handling
- Dispute restoration

---

# Security

Security is a core concern because QuickServe handles authentication, customer information, payments, operational data, and uploaded media.

### Authentication

- Passwords are hashed with bcrypt.
- JWT secrets are stored in environment variables.
- Access and refresh tokens use separate secrets.
- Credentials are never committed to the repository.

### Authorization

Sensitive values such as:

- Price
- Payment state
- Order status
- User identity
- Role

must be determined or verified server-side.

### Payments

- Verify Paystack webhook signatures.
- Verify transaction ownership.
- Verify expected payment amounts.
- Prevent duplicate webhook processing.

### Uploads

- Restrict file types.
- Restrict file sizes.
- Authenticate upload requests.
- Verify resource ownership.

### Production

Production deployments should use:

- HTTPS
- Explicit CORS configuration
- Rate limiting
- Secure secrets
- Structured logging
- Error monitoring
- Database backups

If you discover a security vulnerability, please avoid publishing exploit details in a public issue. Use the repository's private security reporting process when available.

---

# Deployment

QuickServe can be deployed using:

```text
                 ┌──────────────┐
                 │    Render    │
                 │   Node API   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │     Neon     │
                 │  PostgreSQL  │
                 └──────────────┘
```

## Production migrations

Run migrations against the production database:

```bash
DATABASE_URL="your-neon-connection-string" npx knex migrate:latest
```

Seed required reference data:

```bash
DATABASE_URL="your-neon-connection-string" npx knex seed:run
```

Production environment variables should be configured through the hosting provider's secret/environment management system.

---

# Project Status

QuickServe is an actively developed backend project.

### Current focus

- Core authentication
- Order lifecycle
- Role-based access
- Rider workflow
- Partner workflow
- Payments
- Disputes
- Payouts
- Operational administration

### Planned improvements

- [ ] Redis-backed rate limiting
- [ ] Firebase push notifications
- [ ] Dedicated transactional email provider
- [ ] Platform commission model
- [ ] Payment reconciliation
- [ ] Refund workflow
- [ ] Advanced geospatial services
- [ ] OpenAPI documentation
- [ ] Automated API testing
- [ ] Structured logging and observability
- [ ] Expanded dispute workflows
- [ ] Rider availability and location tracking
- [ ] Partner capacity management

---

# Contributing

Contributions, suggestions, and improvements are welcome.

## Before contributing

1. Read the project architecture.
2. Check existing issues before creating a duplicate.
3. Keep changes focused.
4. Follow the existing module structure.
5. Avoid putting business logic in controllers.
6. Add validation for externally supplied data.
7. Add or update tests for important behavior.
8. Keep secrets and credentials out of commits.

## Suggested workflow

```bash
git checkout -b feature/your-feature
```

Make your changes, test them locally, then commit:

```bash
git add .
git commit -m "feat: describe your change"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Then open a pull request.

### Commit style

Where practical, use conventional commit prefixes:

```text
feat: add partner order acceptance
fix: prevent duplicate payment processing
refactor: simplify order transition service
docs: update API documentation
test: cover cancellation transitions
chore: update dependencies
```

---

# API Documentation

Detailed request and response documentation should live alongside the project as the API matures.

A future OpenAPI specification is planned so that the API can be consumed by:

- Frontend applications
- Mobile applications
- Internal operations dashboards
- Third-party integrations
- API testing tools

---

# Roadmap

The long-term direction for QuickServe is to evolve from a backend learning project into a robust marketplace infrastructure.

### Platform

- [ ] Customer application
- [ ] Rider application
- [ ] Partner dashboard
- [ ] Operations dashboard

### Marketplace

- [ ] Dynamic service catalog
- [ ] Partner discovery
- [ ] Ratings and reviews
- [ ] Availability management
- [ ] Service-area expansion

### Logistics

- [ ] Rider location tracking
- [ ] Route optimization
- [ ] Delivery ETA
- [ ] Rider availability
- [ ] Pickup scheduling

### Financials

- [ ] Platform commissions
- [ ] Refunds
- [ ] Payment reconciliation
- [ ] Automated partner settlements
- [ ] Financial reporting

### Infrastructure

- [ ] Redis
- [ ] Background jobs
- [ ] Queue-based notifications
- [ ] Observability
- [ ] Automated deployment pipelines
- [ ] Comprehensive API test suite

---

# License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the full license text.

> **Note:** If this repository will contain proprietary QuickServe business logic, credentials, or commercially sensitive material, choose a license deliberately before publishing. MIT permits broad reuse, modification, and redistribution.

---

# Author

**QuickServe Backend**

Built with Node.js, Express, PostgreSQL, and a focus on practical backend engineering.

---

## Final Note

QuickServe is more than a collection of API endpoints.

The architecture is designed around a few core principles:

> **The client is not the source of truth.**

> **Business rules belong in services.**

> **State changes must be explicit and validated.**

> **Important operations should be auditable.**

> **External integrations should be isolated behind clear boundaries.**

> **Predictable APIs are easier to build, test, and maintain.**

The project is intentionally structured to demonstrate how a real marketplace backend can be designed, developed, tested, and evolved over time.
