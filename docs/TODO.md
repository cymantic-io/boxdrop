# BoxDrop — Launch Checklist

## Web-First Feature Development

### Authentication (✅ Implemented)

- [x] **TOTP** — Authenticator app support via googleauth library
- [x] **Email OTP** — Via Resend API
- [x] **SMS OTP** — Via Twilio API
- [x] **Frontend method picker** — Users can select auth method at login
- [x] **Security settings** — View/remove/add verification methods
- [x] **Guest access** — Explore page works without login; require auth for claim/offer/message
- [x] **Refresh persistence** — Refresh should reload current page, not navigate to Explore

### Input Validation & Safety

- [x] Add field validations on frontend (ensure entries are sane, valid formats)
- [x] Add field validations on backend (enforce constraints, sanitize inputs)
- [x] Validate field sizes match database column constraints
- [x] Add length limits to text inputs with clear user feedback

### Button State Management

- [x] Disable buttons after press to prevent double-clicks
- [x] Show loading state during async operations
- [x] Re-enable buttons after response (success or error)
- [x] Apply to all submit/action buttons across the app

### User Experience

- [x] Add fun error popups with friendly messages and animations for unexpected errors

### Security Hardening (OWASP Top 10)

- [ ] **A01: Broken Access Control** — Verify user can only access/modify their own data
- [ ] **A02: Cryptographic Failures** — Ensure proper encryption of sensitive data at rest and in transit
- [ ] **A03: Injection** — Validate and sanitize all user inputs, use parameterized queries
- [ ] **A04: Insecure Design** — Review for security gaps in application logic
- [ ] **A05: Security Misconfiguration** — Hardening for production (disable debug, set secure headers)
- [ ] **A06: Vulnerable Components** — Audit dependencies for known CVEs
- [ ] **A07: Auth Failures** — Review rate limiting, token expiration, session management
- [ ] **A08: Data Integrity Failures** — Validate all data integrity (e.g., price calculations on backend)
- [ ] **A09: Logging Failures** — Ensure security events are logged without sensitive data
- [ ] **A10: SSRF** — Validate all URLs/URIs don't allow internal network access

### Review Findings (2026-03-16)

- [ ] Fix offers authorization: only buyer or seller on the offer thread can accept/reject/counter (`backend/src/main/kotlin/io/cymantic/boxdrop/offers/OfferService.kt:76`, `backend/src/main/kotlin/io/cymantic/boxdrop/offers/OfferService.kt:107`)
- [ ] Enforce token type in auth filter so refresh tokens cannot access protected routes (`backend/src/main/kotlin/io/cymantic/boxdrop/auth/JwtService.kt:36`, `backend/src/main/kotlin/io/cymantic/boxdrop/security/JwtAuthenticationFilter.kt:31`)
- [ ] Keep mocked payment flow, but guard `confirmPayment` to require a server-validated event (or a temporary mock flag) to prevent arbitrary “PAID” transitions (`backend/src/main/kotlin/io/cymantic/boxdrop/transactions/TransactionService.kt:74`)
- [ ] Add seller self-purchase guard in `claimAtPrice`, matching `claim` behavior (`backend/src/main/kotlin/io/cymantic/boxdrop/transactions/TransactionService.kt:50`)
- [ ] Rotate refresh tokens on the client by storing the new refresh token returned by `/auth/refresh` (`mobile-web/app/services/api.ts:106`)
- [ ] Fix image upload response parsing: backend returns `{ data: { url } }` but client expects a string (`backend/src/main/kotlin/io/cymantic/boxdrop/images/ImageController.kt:61`, `mobile-web/app/services/api.ts:357`)
- [ ] Prevent double-claim race by doing claim + status update transactionally or with conditional update (`backend/src/main/kotlin/io/cymantic/boxdrop/transactions/TransactionService.kt:30`)
- [ ] Return sale `address` in responses (visible to all users for now) to match UI usage (`backend/src/main/kotlin/io/cymantic/boxdrop/sales/SaleService.kt:100`)

### Server Resilience

- [ ] Add server-side rate limiting (Redis-backed, per-IP and per-user)
- [ ] Implement circuit breaker for PostgreSQL connections
- [ ] Implement circuit breaker for Redis connections

## Web Deployment

### Recommended Stack (Cheapest: ~$5-10/mo)

| Component | Platform | Free Tier | Paid Tier |
|-----------|----------|-----------|------------|
| Backend (Kotlin) | [Railway](https://railway.app) or [Render](https://render.com) | No | $5-7/mo |
| Frontend (Web) | [Vercel](https://vercel.com) | ✅ Yes | $0 |
| Database | [Neon](https://neon.tech) or [Supabase](https://supabase.com) | ✅ Yes | $0-10/mo |
| Redis | [Upstash](https://upstash.com) | ✅ Yes | $0 |
| Storage (Images) | AWS S3 or Supabase Storage | ✅ Yes | ~$1/mo |
| Maps | Google Maps | ✅ Yes ($200 credit) | $0-200/mo |

### Quick Start Deploy

#### 1. Railway (Backend)

```bash
# Sign up at https://railway.app
# Connect your GitHub repo
# Create new project → "Deploy from GitHub repo"
# Select boxdrop repo
# Add environment variables:
#   - DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
#   - REDIS_URI
#   - JWT_SECRET
#   - STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET
#   - RESEND_API_KEY
#   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
#   - S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET
```

**Railway Docs:** https://docs.railway.app/deploy/docker

#### 2. Vercel (Frontend Web)

```bash
# Sign up at https://vercel.com
# Import your GitHub repo
# Framework preset: Other
# Build command: npx expo export
# Output directory: dist
# Environment variables:
#   - EXPO_PUBLIC_API_URL = https://your-railway-app.up.railway.app/api
```

**Vercel Docs:** https://vercel.com/docs/deployments

#### 3. Neon (PostgreSQL with PostGIS)

```bash
# Sign up at https://neon.tech
# Create project → Select region closest to users
# Get connection string
# Add to Railway environment variables
# Enable PostGIS extension:
#   psql $NEON_URL -c "CREATE EXTENSION postgis;"
```

**Neon Docs:** https://neon.tech/docs

#### 4. Upstash (Redis)

```bash
# Sign up at https://upstash.com
# Create Redis database
# Copy REST API URL
# Add to Railway: REDIS_URI=redis://$HOST:$PORT
# Or use Upstash Redis directly
```

**Upstash Docs:** https://docs.upstash.com

### PostGIS Note

Neon supports PostGIS extensions. If issues arise, alternatives:
- **Supabase** — Full PostgreSQL with PostGIS
- **CockroachDB** — No PostGIS, use lat/long queries instead

## iOS & Android Launch

### EAS Build Setup
- [ ] Install EAS CLI (`npm install -g eas-cli`)
- [ ] Run `npx eas-cli init` and `npx eas build:configure` to generate `eas.json` with dev/preview/production build profiles
- [ ] Set up Apple Developer account credentials for iOS builds
- [ ] Set up Google Play Console credentials for Android builds

### Authentication Service Keys
- [ ] **Resend (email OTP):** Sign up at [resend.com](https://resend.com), get an API key, set `RESEND_API_KEY`. Optionally set `RESEND_FROM_EMAIL` (defaults to `onboarding@resend.dev` sandbox sender). Verify a custom domain in Resend for production use.
- [ ] **Twilio (SMS OTP):** Sign up at [twilio.com](https://www.twilio.com/try-twilio), get Account SID, Auth Token, and a phone number. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Free trial has no time limit (credit-based).
- [ ] **TOTP (Authenticator apps):** No API keys needed — works offline using the `googleauth` library with time-based shared secrets.

### Google Maps API Key
- [ ] Enable **Maps SDK for Android** in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] Generate an API key and add it to `app.json` under `expo.android.config.googleMaps.apiKey`
- [ ] Rebuild the Android app (`npx expo run:android` or EAS build) — native config changes require a rebuild

### API URL Configuration
- [ ] Deploy backend to a production host
- [ ] Set `EXPO_PUBLIC_API_URL` to the production backend URL (currently defaults to `http://localhost:8080`, which is unreachable from physical devices)
- [ ] Configure per-environment API URLs in `eas.json` build profiles (dev, staging, production)

### Push Notifications
- [ ] Add `expo-notifications` dependency
- [ ] Implement device token registration on the backend
- [ ] Send push notifications for new messages, item claims, and sale activity
- [ ] Handle notification deep linking to the relevant screen

### Deep Linking
- [ ] Wire up React Navigation linking configuration using the `boxdrop` URL scheme (already set in `app.json`)
- [ ] Define link paths for key screens (sale detail, listing detail, chat)
- [ ] Configure Universal Links (iOS) and App Links (Android) for `boxdrop.me`

### App Store Submission
- [ ] Create App Store Connect listing (iOS)
- [ ] Create Google Play Console listing (Android)
- [ ] Prepare store screenshots for required device sizes
- [ ] Write store description and release notes
- [ ] Create privacy policy (required for both stores)
- [ ] Set up app review information and contact details
