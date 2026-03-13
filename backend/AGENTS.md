# Backend — Agent Guide

> For project overview, quick start, and shared conventions, see the root [AGENTS.md](../AGENTS.md).
>
> For secrets and environment setup, see [README.md](README.md).

## Overview

Micronaut 4.3.8 + Kotlin REST API running on Netty with JVM 21. Provides all API endpoints for the BoxDrop marketplace.

## Running

```bash
# Requires Docker infrastructure running first
docker compose -f ../docker-compose.yml up -d

# Start the API server (http://localhost:8080)
./gradlew run
```

## Testing

```bash
# Unit + integration tests (uses Testcontainers for Postgres)
./gradlew test

# Static analysis
./gradlew detekt

# Full build (compile + test + assemble)
./gradlew build
```

<!-- TODO: No backend tests exist yet — src/test/ is empty. Add unit tests for services and integration tests for controllers/repositories. -->

## Build & Docker

```bash
# Build fat JAR
./gradlew build

# Docker image (multi-stage: JDK build → JRE runtime)
docker build -t boxdrop-backend .
```

The Dockerfile uses `eclipse-temurin:21-jdk-alpine` for build and `eclipse-temurin:21-jre-alpine` for runtime. The fat JAR is at `build/libs/*-all.jar`.

## Project Structure

```
src/main/kotlin/io/cymantic/boxdrop/
├── Application.kt            # Micronaut entry point
├── auth/                     # Passwordless auth (OTP via email/SMS, TOTP)
│   ├── AuthController.kt     # POST /api/auth/register, login/start, login/verify, refresh
│   ├── AuthService.kt        # Registration, login flows, OTP orchestration
│   ├── VerificationService.kt # OTP generation/validation via Redis
│   ├── JwtService.kt         # JWT access/refresh token generation + validation
│   ├── PasswordService.kt    # BCrypt hashing (used for seed data, not login flow)
│   └── VerificationMethod.kt # Entity: EMAIL_OTP, SMS_OTP, TOTP per user
├── sales/                    # Sale events
│   ├── SaleController.kt     # CRUD + activate + nearby queries
│   ├── SaleService.kt        # Business logic (DRAFT → ACTIVE lifecycle)
│   ├── SaleRepository.kt     # PostGIS spatial queries
│   └── Sale.kt               # Entity
├── listings/                 # Items within sales
│   ├── ListingController.kt  # CRUD under /api/sales/{id}/listings and /api/listings/{id}
│   ├── ListingService.kt     # Business logic, price decay, search
│   ├── ListingRepository.kt  # JDBC queries with spatial joins
│   ├── Listing.kt            # Entity
│   ├── ListingImage.kt       # Entity
│   └── ListingImageRepository.kt
├── transactions/             # Claim → payment → pickup → complete
│   ├── TransactionController.kt # claim, confirm-payment, confirm-pickup, cancel
│   ├── TransactionService.kt # State machine (CLAIMED→PAID→PICKUP_CONFIRMED→COMPLETED)
│   ├── StripeService.kt      # Stripe Connect payment intents
│   └── Transaction.kt        # Entity
├── images/                   # Image upload to S3
│   ├── ImageController.kt    # POST /api/images/upload (multipart)
│   └── ImageStorageService.kt # S3 client (MinIO locally)
├── search/                   # Discovery
│   ├── SearchController.kt   # GET /api/search (text + geo)
│   └── MapController.kt      # GET /api/map/sales, /api/map/listings
├── messaging/                # Buyer-seller chat
│   ├── MessageController.kt  # Threads and messages
│   └── MessageService.kt
├── users/                    # User profiles
│   ├── UserController.kt     # GET/PUT /api/users/me
│   └── UserRepository.kt
├── saved/                    # Favorited listings
│   └── SavedController.kt    # POST/DELETE /api/saved/{listingId}, GET /api/saved
├── reviews/                  # Seller reviews
├── trust/                    # Trust score calculation
├── moderation/               # Content reporting
├── notifications/            # Email (Resend) and SMS (Twilio) services
├── security/                 # JWT auth filter, rate limiting filter
├── jobs/                     # Scheduled jobs (price decay)
└── common/
    ├── dto/                  # Request/response DTOs (SaleDtos, ListingDtos, AuthDtos, etc.)
    ├── exceptions/           # Custom exceptions + GlobalExceptionHandler
    └── extensions/           # SecurityExtensions (request.userId())
```

## Key Patterns

### API Response Wrapping

All responses use `ApiResponse<T>`:
```kotlin
data class ApiResponse<T>(val data: T)
```

Paginated responses use `PaginatedResponse<T>` with `data`, `page`, `size`, `totalElements`, `totalPages`.

Error responses use `ErrorResponse` with `error`, `message`, `status` fields.

### Authentication

- JWT tokens in `Authorization: Bearer <token>` header
- `JwtAuthenticationFilter` validates tokens on all `/api/**` routes except `/api/auth/**`
- Use `request.userId()` extension to get the authenticated user's UUID
- OTPs stored in Redis at `auth_otp:{challengeId}` with 600s TTL
- Challenges stored at `auth_challenge:{challengeId}`

### Database

- **Micronaut Data JDBC** with compile-time query generation via `kapt`
- **Flyway** migrations in `src/main/resources/db/migration/` (V1 through V12)
- **PostGIS** for geospatial queries (`GEOGRAPHY(Point, 4326)` on sales table)
- Repository interfaces extend `CrudRepository<Entity, UUID>`
- Custom queries use `@Query` annotation with native SQL

### Image Upload Validation

Enforced in `ImageController.kt`:
- Max file size: 12 MB
- Min dimensions: 500 × 500 px
- Max dimensions: 9000 × 9000 px
- Allowed types: JPEG, PNG, GIF, TIFF, BMP, WEBP
- Uses `javax.imageio.ImageIO` for dimension validation

### Sale Lifecycle

```
DRAFT → ACTIVE (via POST /api/sales/{id}/activate)
```

Only ACTIVE sales appear in nearby/map queries.

### Transaction State Machine

```
CLAIMED → PAYMENT_PENDING → PAID → PICKUP_CONFIRMED → COMPLETED
                                                      ↘ CANCELLED
CLAIMED → CANCELLED
```

## Configuration

All config in `src/main/resources/application.yml`. Key sections:

| Config Path | Purpose |
|-------------|---------|
| `datasources.default.*` | PostgreSQL connection |
| `redis.uri` | Redis connection |
| `boxdrop.jwt.*` | JWT secret and expiry times |
| `boxdrop.s3.*` | S3/MinIO bucket, endpoint, credentials |
| `boxdrop.rate-limit.*` | Rate limiting config |
| `boxdrop.stripe.*` | Stripe API key, webhook secret, platform fee |
| `boxdrop.resend.*` | Resend email API key |
| `boxdrop.twilio.*` | Twilio SMS credentials |

All values support environment variable overrides with defaults for local development.

## Dependencies

Key dependencies (see `build.gradle.kts`):
- `io.micronaut:micronaut-http-server-netty` — HTTP server
- `io.micronaut.data:micronaut-data-jdbc` — Compile-time JDBC repositories
- `io.micronaut.flyway:micronaut-flyway` — Database migrations
- `io.micronaut.redis:micronaut-redis-lettuce` — Redis client
- `com.auth0:java-jwt` — JWT token handling
- `software.amazon.awssdk:s3` — S3 image storage
- `com.stripe:stripe-java` — Stripe payments
- `com.warrenstrange:googleauth` — TOTP authenticator support
- `org.mindrot:jbcrypt` — Password hashing (for seed data)
- `io.micronaut.serde:micronaut-serde-jackson` — JSON serialization

## Adding a New Feature Domain

1. Create a new package under `io.cymantic.boxdrop/{feature}/`
2. Add entity class annotated with `@MappedEntity` and `@Serdeable`
3. Add repository interface extending `CrudRepository`, annotated with `@JdbcRepository(dialect = Dialect.POSTGRES)`
4. Add service class annotated with `@Singleton`
5. Add controller annotated with `@Controller("/api/{feature}")`
6. Add DTOs in `common/dto/`
7. Add Flyway migration `V{N}__{description}.sql`

## Deployment

<!-- TODO: Production hosting platform not decided (AWS ECS, GCP Cloud Run, fly.io, etc.) -->
<!-- TODO: Production database (managed PostgreSQL with PostGIS) -->
<!-- TODO: Production Redis (ElastiCache, Upstash, etc.) -->
<!-- TODO: Production S3 bucket configuration -->
<!-- TODO: Secrets management strategy (env vars, Vault, AWS Secrets Manager) -->
<!-- TODO: Health check / readiness probe endpoints -->
<!-- TODO: Logging and monitoring (structured logging, APM) -->
<!-- TODO: Auto-scaling configuration -->
