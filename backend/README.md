# BoxDrop Backend

A Kotlin/Micronaut REST API for the BoxDrop hyper-local garage sale marketplace.

## Tech Stack

- **Language**: Kotlin 1.9.22
- **Framework**: Micronaut 4.3.8
- **Runtime**: Netty
- **Build**: Gradle with Kotlin DSL
- **Database**: PostgreSQL with Flyway migrations
- **Cache**: Redis
- **Testing**: JUnit 5, TestContainers, MockK

## Getting Started

### Prerequisites

- Java 17+
- Gradle 8.0+
- PostgreSQL 14+
- Redis 6+
- (Optional) Docker & Docker Compose

### Installation

```bash
cd backend
./gradlew build
```

### Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values**:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   STRIPE_API_KEY=sk_test_xxxxxxxxxxxxx
   # ... other keys
   ```

3. **Load environment and run**:
   ```bash
   source .env
   ./gradlew run
   ```

Or use the dev helper script:
```bash
source .env
./dev.sh backend:run
```

## Configuration

All configuration is managed via **environment variables** in `application.yml`:

### Database
- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: boxdrop)
- `DB_USERNAME` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)

### Redis
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)

### JWT Authentication
- `JWT_SECRET` - JWT signing secret (min 32 characters, required for production)

### S3 File Storage
- `S3_BUCKET` - S3 bucket name (default: boxdrop-images)
- `S3_REGION` - AWS region (default: us-east-1)
- `S3_ENDPOINT` - S3-compatible endpoint (default: http://localhost:9000)
- `S3_ACCESS_KEY` - Access key (default: minioadmin)
- `S3_SECRET_KEY` - Secret key (default: minioadmin)

### Email (Resend)
- `RESEND_API_KEY` - API key from https://resend.com
- `RESEND_FROM_EMAIL` - Sender email (default: onboarding@resend.dev)

### SMS (Twilio)
- `TWILIO_ACCOUNT_SID` - Account SID from Twilio
- `TWILIO_AUTH_TOKEN` - Auth token from Twilio
- `TWILIO_FROM_NUMBER` - Sender phone number

### Payments (Stripe)
- `STRIPE_API_KEY` - API key from https://dashboard.stripe.com/apikeys
- `STRIPE_WEBHOOK_SECRET` - Webhook secret

### Rate Limiting
- `RATE_LIMIT_MAX` - Max requests per window (default: 5000)
- `RATE_LIMIT_WINDOW` - Time window in seconds (default: 60)

### OTP
- `OTP_EXPIRY` - OTP expiry in seconds (default: 600)

## Running the Server

### Development

```bash
# Quick start (requires .env file)
source .env && ./gradlew run

# Or using dev helper
./dev.sh backend:run
```

Server starts on `http://localhost:8080` with debug port on `5005`.

### With Docker Compose

```bash
docker-compose up backend
```

Includes PostgreSQL and Redis services.

## Testing

```bash
# Run all tests
./gradlew test

# Run specific test
./gradlew test --tests "io.cymantic.boxdrop.auth.*"

# Code quality checks
./gradlew detekt

# OWASP dependency check
./gradlew dependencyCheck
```

## Building

### Development Build
```bash
./gradlew build
```

### Production Build
```bash
./gradlew build -Dmicronaut.openapi.enabled=false
```

Output JAR: `build/libs/boxdrop-backend-*.jar`

## Database Migrations

Migrations are automatically applied on startup via Flyway:
- Located in: `src/main/resources/db/migration/`
- Naming: `V<version>_<description>.sql`

Example:
```sql
-- V1__Initial_schema.sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL
);
```

## Project Structure

```
backend/
├── src/
│   ├── main/kotlin/io/cymantic/boxdrop/
│   │   ├── Application.kt
│   │   ├── auth/                 # Authentication & JWT
│   │   ├── users/                # User management
│   │   ├── listings/             # Product listings
│   │   ├── sales/                # Sale transactions
│   │   ├── offers/               # Offers/negotiations
│   │   ├── notifications/        # Email & SMS
│   │   ├── payments/             # Stripe integration
│   │   ├── images/               # Image upload/storage
│   │   ├── reviews/              # Ratings & reviews
│   │   ├── messaging/            # User messaging
│   │   ├── trust/                # Trust scoring
│   │   ├── moderation/           # Content moderation
│   │   ├── security/             # Filters & rate limiting
│   │   ├── common/               # Shared DTOs, exceptions
│   │   └── jobs/                 # Scheduled jobs
│   ├── test/kotlin/              # Unit tests
│   └── resources/
│       ├── application.yml       # Configuration
│       └── db/migration/         # SQL migrations
├── build.gradle.kts              # Build configuration
├── gradle.properties             # Gradle properties
└── .env.example                  # Environment template
```

## Key Directories

### Controllers (REST Endpoints)
- `auth/` - POST `/api/auth/signup`, `/api/auth/login`
- `listings/` - GET `/api/listings`, POST `/api/listings`
- `sales/` - Sale transactions API
- `users/` - GET `/api/users/{id}`, PUT `/api/users/{id}`

### Services
- `AuthService` - Authentication logic
- `UserService` - User operations
- `ListingService` - Listing management
- `PaymentService` - Stripe integration
- `NotificationService` - Email/SMS

### Repositories
- Using Micronaut Data JDBC
- Pattern: `Interface extends CrudRepository<T, ID>`

## Debugging

### VS Code
1. Set breakpoint in code
2. Run debug configuration: "Attach to Backend (Port 5005)"
3. Step through with F10/F11

### IntelliJ IDEA
1. Set breakpoint
2. Run → Debug → Select "gradlew run"

### Debug Environment Variable
```bash
export JAVA_TOOL_OPTIONS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"
./gradlew run
```

## Deployment

### Build Docker Image
```bash
docker build -t boxdrop-backend:latest .
```

### Run Container
```bash
docker run -e RESEND_API_KEY=re_xxx -e STRIPE_API_KEY=sk_xxx \
  -p 8080:8080 boxdrop-backend:latest
```

## Common Tasks

```bash
# Format code
./gradlew ktlintFormat

# Static analysis
./gradlew detekt

# Dependency vulnerabilities
./gradlew dependencyCheck

# Full build with checks
./gradlew clean build detekt

# Run specific gradle task
./gradlew taskName
```

## Troubleshooting

### Connection refused to PostgreSQL
- Ensure PostgreSQL is running on localhost:5432
- Check `DB_HOST` and `DB_PORT` in `.env`
- Or start with Docker: `docker-compose up postgres`

### Redis connection errors
- Ensure Redis is running on localhost:6379
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`
- Or start with Docker: `docker-compose up redis`

### Detekt errors
- Run: `./gradlew detekt` to see all issues
- Most are auto-fixable with Kotlin formatter

### Build failures
- Clear build cache: `rm -rf build && ./gradlew build`
- Update dependencies: `./gradlew build --refresh-dependencies`
- Check Java version: `java -version` (must be 17+)

## Contributing

1. Create feature branch from `main`
2. Make changes and run tests: `./gradlew test`
3. Run code quality checks: `./gradlew detekt`
4. Commit and push to origin
5. Create pull request

## References

- Micronaut: https://micronaut.io/
- Kotlin: https://kotlinlang.org/
- Gradle: https://gradle.org/
- PostgreSQL: https://www.postgresql.org/
- Redis: https://redis.io/
