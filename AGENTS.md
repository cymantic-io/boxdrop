# BoxDrop — Agent Guide

## Project Overview

BoxDrop is a **hyper-local garage sale marketplace**. Sellers create sale events at physical locations, add item listings with automatic price decay, and buyers discover sales on a map-first interface — claiming items with Stripe payments and picking them up in person.

**Repository:** `github.com/cymantic-io/boxdrop`

## Documentation Guide

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Quick start guide |
| [AGENTS.md](AGENTS.md) | This file - comprehensive developer guide |
| [docs/DESIGN.md](docs/DESIGN.md) | Full API design reference |
| [docs/TODO.md](docs/TODO.md) | Launch checklist |
| [VS_CODE_SETUP.md](VS_CODE_SETUP.md) | IDE configuration |
| [MOBILE_CLIENTS.md](MOBILE_CLIENTS.md) | iOS/Android testing |
| [backend/README.md](backend/README.md) | Backend secrets & environment setup |
| [backend/AGENTS.md](backend/AGENTS.md) | Backend-specific patterns and config |
| [mobile-web/README.md](mobile-web/README.md) | Frontend secrets & environment setup |
| [mobile-web/AGENTS.md](mobile-web/AGENTS.md) | Frontend-specific patterns and config |

## Architecture

| Layer | Technology | Directory |
|-------|-----------|-----------|
| **Backend API** | Micronaut 4 + Kotlin (JVM 21) | `backend/` |
| **Frontend** | Expo SDK 52 + React Native + TypeScript | `mobile-web/` |
| **Database** | PostgreSQL 16 + PostGIS | via Docker |
| **Cache** | Redis 7 (rate limiting, OTP storage, pub/sub) | via Docker |
| **Object Storage** | AWS S3 (MinIO locally) | via Docker |
| **Payments** | Stripe Connect (marketplace splits, escrow) | backend integration |
| **Reverse Proxy** | Nginx (production) | `deploy/nginx/` |

## Project Structure

```
boxdrop/
├── backend/                  # Micronaut + Kotlin REST API
│   ├── build.gradle.kts      # Gradle build config (Micronaut 4.3.8)
│   ├── Dockerfile             # Multi-stage Docker build
│   └── src/main/
│       ├── kotlin/io/cymantic/boxdrop/
│       │   ├── auth/          # Registration, login, OTP/TOTP/SMS verification
│       │   ├── sales/         # Sale CRUD, activation, nearby queries
│       │   ├── listings/      # Listing CRUD, images, price decay
│       │   ├── transactions/  # Claim, payment, pickup, cancel flows
│       │   ├── search/        # Text + geo search, map endpoints
│       │   ├── messaging/     # Buyer-seller messaging threads
│       │   ├── images/        # S3 upload with size/dimension validation
│       │   ├── users/         # User profiles
│       │   ├── reviews/       # Seller reviews
│       │   ├── trust/         # Trust scores
│       │   ├── moderation/    # Content reporting
│       │   ├── saved/         # Saved/favorited listings
│       │   ├── notifications/ # Email (Resend) and SMS (Twilio) services
│       │   ├── security/      # JWT filter, rate limiting
│       │   ├── jobs/          # Scheduled jobs (price decay)
│       │   └── common/        # DTOs, exceptions, extensions
│       └── resources/
│           ├── application.yml
│           └── db/migration/  # Flyway SQL migrations (V1–V12)
├── mobile-web/               # Expo + React Native frontend
│   ├── app/
│   │   ├── screens/          # All app screens by feature
│   │   ├── components/       # Shared UI components
│   │   ├── hooks/            # React Query hooks
│   │   ├── services/api.ts   # Axios API client
│   │   ├── stores/           # Zustand state (auth, location)
│   │   ├── navigation/       # React Navigation (tabs + stacks)
│   │   ├── types/            # TypeScript types and nav params
│   │   └── theme.ts          # Design tokens and Paper theme
│   └── __tests__/            # Jest unit tests
├── tests/
│   ├── e2e/                  # Playwright E2E tests (22 specs)
│   └── load/                 # k6 load tests
├── deploy/
│   └── nginx/nginx.conf      # Reverse proxy config
├── scripts/
│   └── seed_test_sales.sql   # Test data seed script
├── docker-compose.yml        # Local infra (Postgres, Redis, MinIO)
├── build.sh                  # Full build + test pipeline
├── docs/
│   ├── DESIGN.md             # Full API design reference
│   └── TODO.md               # Launch checklist
└── AGENTS.md                 # This file - project overview
```

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 21 (Temurin) |
| Node.js | 20+ |
| Docker & Docker Compose | Latest |
| Expo CLI | `npx expo` (included via npm) |

## Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Start backend (http://localhost:8080)
cd backend && ./gradlew run

# 3. Start frontend (http://localhost:8081)
cd mobile-web && npm install && npx expo start --web
```

## Running Tests

```bash
# Backend unit/integration tests
cd backend && ./gradlew test

# Frontend unit tests
cd mobile-web && npm test

# E2E tests (requires backend + Docker running)
cd tests/e2e && npm ci && npx playwright install && npx playwright test

# Load tests
cd tests/load && k6 run api_load_test.js

# Full pipeline (all of the above)
./build.sh
```

## Seed Test Data

```bash
docker exec -i boxdrop-db-1 psql -U postgres -d boxdrop < scripts/seed_test_sales.sql
```

Creates 5 test sellers, 5 active sales near Fredericktown MO, and 13 listings. Test user password: `password123`.

## Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `db` | `postgis/postgis:16-3.4` | 5432 | PostgreSQL + PostGIS |
| `redis` | `redis:7-alpine` | 6379 | Cache, rate limiting, OTP storage |
| `minio` | `minio/minio` | 9000, 9001 | Local S3-compatible storage |

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`:
1. **Backend** — `./gradlew build` with Testcontainers (Postgres + Redis services)
2. **Frontend** — `npm ci && npm test --ci`
3. **E2E** — Playwright tests (depends on backend + frontend passing)

## Key Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL connection | `localhost:5432/boxdrop` |
| `DB_USERNAME`, `DB_PASSWORD` | DB credentials | `postgres` / (see docker-compose) |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection | `localhost:6379` |
| `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Object storage | MinIO defaults |
| `JWT_SECRET` | JWT signing key | Dev default (change in prod) |
| `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe payments | — |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Email OTP delivery | — |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | SMS OTP | — |
| `EXPO_PUBLIC_API_URL` | Frontend → backend URL | `http://localhost:8080/api` |

## Authentication Flow

Auth is **passwordless** using OTP verification:
1. Register/Login → backend creates a challenge, stores OTP in Redis (`auth_otp:{challengeId}`)
2. OTP delivered via email (Resend) or SMS (Twilio); TOTP also supported
3. Verify OTP → returns JWT access + refresh tokens
4. Frontend stores tokens in SecureStore (native) or localStorage (web)

## Image Upload Limits

Based on eBay standards, enforced on backend:
- **Max file size:** 12 MB
- **Min dimensions:** 500 × 500 px
- **Max dimensions:** 9000 × 9000 px
- **Accepted formats:** JPEG, PNG, GIF, TIFF, BMP, WEBP

## Conventions

- **Backend:** Kotlin, packages per feature domain, Micronaut Data JDBC with compile-time queries
- **Frontend:** TypeScript, functional components, React Query for server state, Zustand for client state, React Native Paper for UI
- **Database:** Flyway migrations named `V{N}__{description}.sql`
- **API responses:** Wrapped in `ApiResponse<T>` with `data` field; paginated results use `PaginatedResponse<T>`
- **Styling:** `theme.ts` defines the color palette; use `colors.*` constants, not hardcoded hex values

## Deployment

Recommended stack: **Railway** (backend) + **Vercel** (frontend) + **Neon** (PostgreSQL) + **Upstash** (Redis).

See [docs/TODO.md](docs/TODO.md) for the full deployment guide with step-by-step instructions.

For self-hosted alternative, see `deploy/nginx/nginx.conf` for the Docker-based reverse proxy config.
