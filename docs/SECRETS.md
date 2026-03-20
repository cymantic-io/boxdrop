# Secrets And Runtime Configuration Plan

## Goal

Use API keys and other sensitive configuration without hardcoding them, committing them to GitHub, or leaking them into client bundles. Secrets should live in the runtime that consumes them.

## Principles

- Never commit real secrets to the repository.
- Keep client-visible configuration separate from backend-only secrets.
- Treat anything embedded into the web or mobile client as public.
- Use separate values for `development`, `staging`, and `production`.
- Prefer platform-native secret storage over a shared `.env` checked into CI.
- Use least-privilege credentials and rotate them periodically.

## Secret Classes

### Backend-only secrets

These must only exist in backend runtimes and deployment systems:

- `JWT_SECRET`
- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `S3_SECRET_KEY`
- `S3_ACCESS_KEY`
- database passwords
- Redis passwords

### Public runtime configuration

These may be exposed to the client and must not be treated as secret:

- `EXPO_PUBLIC_API_URL`
- browser and native maps keys such as `GOOGLE_MAPS_API_KEY`

Public keys still need restrictions:

- restrict by allowed domain for web
- restrict by bundle ID for iOS
- restrict by package name and SHA fingerprint for Android
- restrict by API scope

## Ownership By Runtime

### Local development

Store values in local untracked files:

- root `.env.local` if a root helper script needs shared values
- `backend/.env`
- `mobile-web/.env.local`

Requirements:

- commit only templates such as `.env.example`
- keep real files gitignored
- developers load local env before starting services

### Backend deployment

Primary target: Railway service variables.

Store all backend-only secrets in Railway for each deployed backend service:

- `JWT_SECRET`
- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`

Rules:

- do not source production secrets from GitHub Actions into Railway on every deploy
- let Railway own the runtime values directly
- use separate staging and production services or scoped environments

### Web deployment

Primary target: Vercel project environment variables.

Store only public frontend config in Vercel unless server-side functions are added later:

- `EXPO_PUBLIC_API_URL`
- web-specific public map key if needed

Rules:

- do not put backend secrets in the Expo web bundle
- assume all `EXPO_PUBLIC_*` values are readable by users
- use separate preview and production values

### Expo native builds

Primary target: EAS environment variables.

Use EAS environment variables for build-time app config:

- `EXPO_PUBLIC_API_URL`
- `GOOGLE_MAPS_API_KEY`
- other build-time configuration values

Rules:

- any value compiled into the app should be treated as public
- do not place Stripe secret keys, JWT secrets, Twilio tokens, or Resend API keys in Expo client code

### CI and deployment workflows

Primary target: GitHub Actions environment secrets.

Use GitHub only for deployment credentials and workflow-scoped secrets:

- `RAILWAY_TOKEN`
- `VERCEL_TOKEN`
- `EXPO_TOKEN`
- any short-lived deploy credential not stored elsewhere

Rules:

- use GitHub Environments for `staging` and `production`
- protect production with required reviewers if needed
- prefer OIDC over long-lived cloud credentials where supported
- do not treat GitHub Actions secrets as the main runtime store for app secrets

## Variable Matrix

| Variable | Secret | Consumer | Source Of Truth |
|----------|--------|----------|-----------------|
| `EXPO_PUBLIC_API_URL` | No | Expo web and native client | Vercel and EAS per environment |
| `GOOGLE_MAPS_API_KEY` | Public-restricted | Expo app config | EAS and local `.env.local` |
| `JWT_SECRET` | Yes | Backend | Railway |
| `STRIPE_API_KEY` | Yes | Backend | Railway |
| `STRIPE_WEBHOOK_SECRET` | Yes | Backend | Railway |
| `RESEND_API_KEY` | Yes | Backend | Railway |
| `TWILIO_ACCOUNT_SID` | Yes | Backend | Railway |
| `TWILIO_AUTH_TOKEN` | Yes | Backend | Railway |
| `S3_ACCESS_KEY` | Yes | Backend | Railway |
| `S3_SECRET_KEY` | Yes | Backend | Railway |
| `DB_*` | Yes | Backend | Railway or managed DB provider |
| `REDIS_*` | Yes | Backend | Railway or managed Redis provider |

## Environment Structure

Use at least these environments:

- `development`
- `staging`
- `production`

Rules:

- never reuse production secrets in staging
- never reuse staging secrets in development
- use different Stripe projects or restricted keys where possible
- use different Twilio, Resend, and storage credentials if practical

## Repository Changes To Maintain

### Commit

- `.env.example` files with placeholder values only
- documentation for secret ownership and rotation
- validation logic that fails fast when required production secrets are missing

### Do not commit

- `.env`
- `.env.local`
- service account JSON files
- copied secrets in scripts or test fixtures

## Runtime Guardrails

Add or maintain these guardrails:

1. Backend startup should fail in non-development environments if required secrets are missing or still set to placeholder values.
2. Frontend documentation should explicitly state that `EXPO_PUBLIC_*` values are public.
3. Google Maps keys must be restricted by platform and API scope.
4. CI should deploy using environment-scoped credentials, not inline secrets in workflow YAML.

## Rotation Process

For each secret rotation:

1. Create the new secret in the provider.
2. Update the runtime secret store for the target environment.
3. Redeploy the affected service.
4. Verify health checks and critical flows.
5. Revoke the old secret.
6. Record the rotation date and owner.

Recommended cadence:

- immediate rotation for any suspected leak
- scheduled rotation every 90 to 180 days for high-value credentials
- annual review for lower-risk keys that are strongly restricted

## Implementation Checklist

### Immediate

- add `mobile-web/.env.example`
- ensure `mobile-web/.env*` and `backend/.env*` patterns are gitignored as intended
- document required variables for local dev, staging, and production
- create Railway variables for backend staging and production
- create Vercel env vars for preview and production
- create EAS env vars for native build profiles
- create GitHub Environments for `staging` and `production`

### Next

- add backend validation for missing production secrets
- remove insecure placeholder defaults for production paths
- document secret rotation ownership
- add a deployment checklist that includes env var verification

### Later

- evaluate a central secret manager if the number of services grows
- move deploy authentication from long-lived GitHub secrets to OIDC where supported

## BoxDrop-Specific Advice

For this repository, the pragmatic setup is:

- Railway owns backend runtime secrets
- Vercel owns web runtime config
- EAS owns native build-time config
- GitHub Actions owns deployment credentials only
- local developers use untracked `.env` files

This keeps secrets close to the runtime that uses them and avoids turning GitHub into the primary secret database.
