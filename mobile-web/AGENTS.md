# Mobile-Web Frontend — Agent Guide

> For project overview, quick start, and shared conventions, see the root [AGENTS.md](../AGENTS.md).
>
> For secrets and environment setup, see [README.md](README.md).

## Overview

Expo SDK 52 + React Native + TypeScript single-codebase app targeting iOS, Android, and Web. Uses React Navigation for routing, React Query for server state, Zustand for client state, and React Native Paper for Material Design UI.

## Running

```bash
# Install dependencies
npm install

# Start Expo dev server (press w for web, i for iOS, a for Android)
npx expo start

# Web only (http://localhost:8081)
npx expo start --web

# Requires backend + Docker infrastructure running:
#   docker compose -f ../docker-compose.yml up -d
#   cd ../backend && ./gradlew run
```

The frontend connects to the backend at `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:8080/api`).

## Testing

```bash
# Jest unit tests
npm test

# Watch mode
npm test -- --watch

# E2E tests (Playwright, from repo root)
cd ../tests/e2e && npx playwright test
```

Unit tests are in `__tests__/` mirroring the `app/` structure. They use `@testing-library/react-native` and `jest-expo`.

## Project Structure

```
app/
├── components/               # Shared UI components
│   ├── index.ts              # Barrel exports
│   ├── ListingCard.tsx       # Listing card for grids (4:3 image, price, category)
│   ├── SaleCard.tsx          # Sale card (title, address, dates, status)
│   ├── PhotoCarousel.tsx     # Image carousel with fullscreen modal viewer
│   ├── ClaimButton.tsx       # Claim CTA button
│   ├── SearchBar.tsx         # Search input
│   ├── StatusBadge.tsx       # Sale status chip (ACTIVE, DRAFT, etc.)
│   ├── CategoryPicker.tsx    # Category selector
│   ├── DraftItemForm.tsx     # Add-listing form (title, category, price)
│   ├── EmptyState.tsx        # Empty list placeholder
│   ├── ErrorMessage.tsx      # Error display with retry
│   ├── ErrorScreen.tsx       # Full-screen error
│   ├── LoadingScreen.tsx     # Full-screen spinner
│   ├── TopNavBar.tsx         # Web-only top navigation bar
│   └── WebContentWrapper.tsx # Max-width content wrapper for web
├── screens/                  # Feature screens
│   ├── auth/
│   │   ├── LoginScreen.tsx       # Email input → OTP challenge
│   │   ├── RegisterScreen.tsx    # Display name + email → OTP challenge
│   │   ├── VerifyCodeScreen.tsx  # 6-digit OTP entry
│   │   └── MethodPickerScreen.tsx # Choose verification method
│   ├── home/
│   │   ├── HomeScreen.tsx        # Nearby sales list with search
│   │   ├── SaleDetailScreen.tsx  # Sale info + 2-column listing grid
│   │   ├── ListingDetailScreen.tsx # Photos, pricing, save/claim
│   │   └── ClaimScreen.tsx       # Re-exports from transactions/
│   ├── map/
│   │   ├── MapScreen.tsx         # Native: react-native-maps with callout popups
│   │   └── MapScreen.web.tsx     # Web: react-leaflet with popup summaries
│   ├── create/
│   │   ├── CreateSaleScreen.tsx  # Sale creation form
│   │   └── AddListingsScreen.tsx # Add items to a sale
│   ├── saved/
│   │   └── SavedScreen.tsx       # Saved/favorited listings
│   ├── transactions/
│   │   ├── ClaimScreen.tsx       # Confirm claim → success with pickup token
│   │   └── MyTransactionsScreen.tsx # Transaction list with status badges
│   ├── messaging/
│   │   ├── InboxScreen.tsx       # Message threads list
│   │   └── ChatScreen.tsx        # Chat thread
│   └── profile/
│       ├── ProfileScreen.tsx     # Profile menu
│       ├── EditProfileScreen.tsx # Edit name, avatar, address
│       ├── MySalesScreen.tsx     # Seller's sales list
│       ├── SettingsScreen.tsx    # App settings
│       ├── SecuritySettingsScreen.tsx # Verification method management
│       ├── TOTPSetupScreen.tsx   # Authenticator app setup
│       └── SMSSetupScreen.tsx    # SMS verification setup
├── hooks/                    # React Query hooks (one file per domain)
│   ├── index.ts              # Barrel exports
│   ├── useSales.ts           # useNearbySales, useSale, useCreateSale, useActivateSale
│   ├── useListings.ts        # useListings, useListing, useCreateListing
│   ├── useSaved.ts           # useSavedListings, useSaveListing, useUnsaveListing
│   ├── useTransactions.ts    # useTransactions, useClaimListing
│   ├── useMap.ts             # useMapSales, useMapListings
│   └── ...                   # useMessages, useReviews, useCurrentUser, etc.
├── services/
│   └── api.ts                # Axios client, auth interceptors, all API functions
├── stores/
│   ├── useAuthStore.ts       # Zustand: auth state, tokens, login/logout
│   └── useLocationStore.ts   # Zustand: geolocation state
├── navigation/
│   └── AppNavigator.tsx      # React Navigation: auth stack, tab navigator, all stacks
├── types/
│   └── index.ts              # All TypeScript types, interfaces, nav param lists, constants
└── theme.ts                  # Color palette, Paper theme config
```

## Navigation Architecture

```
Root
├── Auth Stack (unauthenticated)
│   ├── Login
│   ├── Register
│   ├── VerifyCode
│   └── MethodPicker
└── Main Tabs (authenticated)
    ├── HomeTab → Home → SaleDetail → ListingDetail → Claim
    ├── MapTab → Map → SaleDetail → ListingDetail
    ├── CreateTab → CreateSale → AddListings → SaleDetail
    ├── SavedTab → Saved → ListingDetail
    └── ProfileTab → Profile → MySales / MyTransactions / Inbox / Chat / EditProfile / Settings / Security
```

On web, the bottom tabs are hidden and replaced by `TopNavBar` at the top. Stack screen headers are also hidden on web.

## Key Patterns

### API Client (`services/api.ts`)

- Axios instance with base URL from `EXPO_PUBLIC_API_URL`
- Request interceptor: auto-attaches `Authorization: Bearer` from `useAuthStore`
- Response interceptor: auto-refreshes expired tokens using refresh token
- All functions return unwrapped data (not the Axios response)
- Image upload constants exported: `IMAGE_MAX_FILE_SIZE`, `IMAGE_MIN_DIMENSION`, `IMAGE_MAX_DIMENSION`, `IMAGE_ACCEPTED_TYPES`

### State Management

- **Server state:** React Query (`@tanstack/react-query`) — all data fetching through custom hooks in `hooks/`
- **Client state:** Zustand — only for auth tokens (`useAuthStore`) and geolocation (`useLocationStore`)
- **Auth tokens:** Stored in `expo-secure-store` on native, `localStorage` on web
  - Keys: `auth_access_token`, `auth_refresh_token`, `auth_user_id`

### Styling Conventions

- All colors come from `theme.ts` via `colors.*` constants — **never use hardcoded hex values**
- React Native Paper components for Material Design (Text, Button, Card, Chip, TextInput)
- `WebContentWrapper` constrains content to `maxWidth: 960` on web
- Paper theme is configured in `theme.ts` as `paperTheme`

Color palette:
```
primary: '#2A9D8F'      primaryDark: '#1A7A6E'
accent: '#E76F51'        highlight: '#F4A261'
background: '#F7F7F8'    surface: '#FFFFFF'
darkSurface: '#264653'   (nav bar, dark backgrounds)
textPrimary: '#1D2939'   textSecondary: '#667085'   textMuted: '#98A2B3'
success: '#12B76A'       error: '#F04438'            warning: '#F79009'
border: '#E4E7EC'
```

### Platform-Specific Files

Use `.web.tsx` suffix for web-specific implementations. React Native's module resolution picks the right file:
- `MapScreen.tsx` — native (react-native-maps)
- `MapScreen.web.tsx` — web (react-leaflet with Leaflet)

### Test IDs

Key `testID` values used in E2E tests:
- `login-email`, `login-submit` — Login form
- `register-name`, `register-email`, `register-submit` — Register form
- `error-email`, `error-password` — Validation errors
- `home-screen` — Home screen container
- `search-input` — Search bar
- `search-empty` — Empty search results

### Component Conventions

- Functional components with named exports
- Props interfaces defined inline or in the component file
- React Native Paper's `Text` (with `variant` prop) for typography
- `Card` with `mode="outlined"` for list items
- `Button` with `mode="contained"` or `mode="outlined"`

## Adding a New Screen

1. Create the screen component in `app/screens/{feature}/`
2. Add navigation params to the relevant `*StackParamList` in `app/types/index.ts`
3. Register the screen in `app/navigation/AppNavigator.tsx`
4. Add API functions in `app/services/api.ts`
5. Add React Query hooks in `app/hooks/`
6. Export hooks from `app/hooks/index.ts`

## Adding a New Component

1. Create in `app/components/`
2. Export from `app/components/index.ts`
3. Use `colors.*` from `theme.ts` for all color values
4. Use React Native Paper components where appropriate

## Dependencies

Key packages (see `package.json`):
- `expo` ~52.0.0 — Framework
- `react-native` 0.76.9 — Core
- `react-native-web` ~0.19.13 — Web support
- `@react-navigation/native` ^7.0.0 — Navigation
- `@tanstack/react-query` ^5.0.0 — Server state
- `zustand` ^5.0.0 — Client state
- `axios` ^1.7.0 — HTTP client
- `react-native-paper` ^5.15.0 — Material UI
- `react-native-maps` 1.18.0 — Native maps
- `react-leaflet` ^4.2.1 + `leaflet` ^1.9.4 — Web maps
- `expo-image-picker` ~16.0.0 — Image selection
- `expo-location` ~18.0.0 — Geolocation
- `expo-secure-store` ~14.0.0 — Secure token storage
- `react-hook-form` ^7.54.0 — Form handling

## Deployment

<!-- TODO: EAS Build setup for iOS and Android (eas.json build profiles) -->
<!-- TODO: App Store Connect and Google Play Console listings -->
<!-- TODO: Production EXPO_PUBLIC_API_URL configuration per environment -->
<!-- TODO: Push notifications (expo-notifications + backend device token registration) -->
<!-- TODO: Deep linking configuration (boxdrop URL scheme, Universal/App Links) -->
<!-- TODO: App store screenshots, descriptions, privacy policy -->
<!-- TODO: OTA update strategy (EAS Update or CodePush) -->
<!-- TODO: Web hosting for Expo web build (Vercel, Netlify, S3+CloudFront) -->
<!-- TODO: Analytics integration -->
