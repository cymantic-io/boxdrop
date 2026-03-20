# BoxDrop — Hyper-Local Garage Sale Marketplace

A **hyper-local marketplace** for garage sales and yard sales. Sellers create sale events at a physical location and time, add multiple items with photos and automatic price decay, and buyers discover sales on a map-first interface — claiming items with Stripe payments and picking them up in person.

## Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Start backend (http://localhost:8080)
cd backend && ./gradlew run

# 3. Start frontend (http://localhost:8081)
cd mobile-web && npm install && npx expo start
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Micronaut 4 + Kotlin (JVM 21) |
| Frontend | Expo SDK 52 + React Native + TypeScript |
| Database | PostgreSQL 16 + PostGIS |
| Cache | Redis 7 |
| Storage | AWS S3 (MinIO locally) |
| Payments | Stripe Connect |

## Project Structure

```
boxdrop/
├── backend/                  # Micronaut + Kotlin REST API
├── mobile-web/               # Expo + React Native app
├── tests/
│   ├── e2e/                 # Playwright E2E tests
│   └── load/                # k6 load tests
├── docs/
│   ├── DESIGN.md            # Full API design reference
│   ├── TODO.md              # Launch checklist
│   └── SECRETS.md           # Secrets and runtime config plan
├── AGENTS.md                # Developer guide (comprehensive)
├── VS_CODE_SETUP.md         # IDE setup guide
└── MOBILE_CLIENTS.md        # iOS/Android testing guide
```

## Key Commands

```bash
# Backend
cd backend && ./gradlew run          # Start API server
cd backend && ./gradlew test         # Run tests
cd backend && ./gradlew detekt      # Code quality

# Frontend
cd mobile-web && npx expo start     # Start dev server
cd mobile-web && npm test           # Run Jest tests

# E2E Tests
cd tests/e2e && npx playwright test
```

## Seed Test Data

```bash
./scripts/refresh_seed_data.sh
```

Uploads the checked-in seed images to local MinIO, resets the local database, and reseeds it with 5 sellers, 3 buyers, 5 sales, 13 listings, and local image URLs. Test user password: `password123`.

For a seed-only run without resetting the database, use:

```bash
docker exec -i boxdrop-db-1 psql -U postgres -d boxdrop < scripts/seed_test_sales.sql
```

## Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) | Comprehensive developer guide |
| [docs/DESIGN.md](docs/DESIGN.md) | Full API design reference |
| [docs/TODO.md](docs/TODO.md) | Launch checklist |
| [docs/SECRETS.md](docs/SECRETS.md) | Secrets and runtime config plan |
| [VS_CODE_SETUP.md](VS_CODE_SETUP.md) | IDE configuration |
| [MOBILE_CLIENTS.md](MOBILE_CLIENTS.md) | iOS/Android testing |

## Environment Variables

Key variables (see `backend/src/main/resources/application.yml` for full list):

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL | `localhost:5432/boxdrop` |
| `REDIS_URI` | Redis | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing key | Dev default |
| `STRIPE_API_KEY` | Stripe payments | — |
| `EXPO_PUBLIC_API_URL` | Frontend → backend | `http://localhost:8080/api` |

## License

MIT
