# BoxDrop — Launch Checklist

## Deployment Infrastructure

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
# Build command: npx expo export:web
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
