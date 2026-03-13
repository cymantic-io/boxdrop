# BoxDrop Mobile-Web

A React Native web application built with Expo for the BoxDrop marketplace.

## Tech Stack

- **Framework**: React Native 0.76.9
- **Platform**: Expo 52.0.0
- **Language**: TypeScript 5.3.3
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Data Fetching**: TanStack React Query
- **Navigation**: React Navigation
- **UI Library**: React Native Paper
- **Maps**: React Native Maps
- **Testing**: Jest, Playwright
- **Build Tool**: Metro

## Project Structure

```
mobile-web/
├── app/                          # App navigation and screens
├── assets/                       # Images, fonts, etc.
├── __tests__/                    # Test files
├── public/                       # Web public assets
├── App.tsx                       # Root component
├── app.json                      # Expo configuration
├── app.config.js                 # Expo config (JS)
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler config
├── jest.config.js                # Jest testing config
├── jest.setup.js                 # Jest setup file
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── .env                          # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

```bash
cd mobile-web
npm install
```

### Development

```bash
# Start Expo dev server (interactive menu)
npm start

# Or run on specific platform
npm run android      # Android emulator
npm run ios          # iOS simulator
npm run web          # Web browser
```

## Environment Setup

Create a `.env` file in the mobile-web directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
GOOGLE_MAPS_API_KEY=AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Getting Google Maps API Key

The Google Maps API key is required for map features on Android and web:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable **Maps SDK for Android** and **Maps SDK for JavaScript**
4. Go to **Credentials** → **Create API Key**
5. Copy the API key and add to `.env` as `GOOGLE_MAPS_API_KEY`
6. (Optional) Restrict the key to Android package `io.cymantic.boxdrop` for security

**Note**: Changing native config (Google Maps key) requires a rebuild:
```bash
GOOGLE_MAPS_API_KEY=your_key npm run android -- --build-locally
GOOGLE_MAPS_API_KEY=your_key npm run ios -- --build-locally
```

Or with Expo EAS:
```bash
GOOGLE_MAPS_API_KEY=your_key eas build --platform android
GOOGLE_MAPS_API_KEY=your_key eas build --platform ios
```

## Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm test` - Run Jest tests

## Testing

### Unit & Component Tests

```bash
npm test
```

### E2E Tests

E2E tests with Playwright are located in the parent `tests/` directory:

```bash
cd ../tests
npm test
```

## Building

### Android APK

```bash
GOOGLE_MAPS_API_KEY=your_key npm run android -- --build-locally
```

### iOS

```bash
GOOGLE_MAPS_API_KEY=your_key npm run ios -- --build-locally
```

### Web

```bash
npm run web
```

## Code Quality

Use TypeScript for type safety. Configuration in `tsconfig.json`:

- Strict mode enabled
- ES2020 target
- JSX support (React Native)

## Key Dependencies

- **Navigation**: React Navigation (bottom tabs, native stack)
- **State**: Zustand for lightweight state management
- **HTTP**: Axios for API calls
- **Forms**: React Hook Form for form handling
- **Maps**: React Native Maps for location features
- **Icons**: Vector icons from Expo and React Native Vector Icons
- **Location**: Expo Location services
- **Camera**: Expo Camera for photo capture
- **Storage**: Expo Secure Store for sensitive data

## Expo Features

Configured Expo modules:
- Camera
- Font loading
- Image picker
- Location services
- Secure storage
- Status bar

## Configuration Files

- `app.json` - Expo app metadata and iOS/Android settings
- `app.config.js` - Expo config (JS) with environment variable support for Google Maps
- `babel.config.js` - Transforms TypeScript and JSX
- `metro.config.js` - JavaScript bundler configuration
- `jest.config.js` - Test runner configuration
- `tsconfig.json` - TypeScript compiler options

## Deployment

See [MOBILE_CLIENTS.md](../MOBILE_CLIENTS.md) for deployment instructions for iOS and Android.
