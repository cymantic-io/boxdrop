# BoxDrop — TODO

## iOS & Android Launch

### EAS Build Setup
- [ ] Install EAS CLI (`npm install -g eas-cli`)
- [ ] Run `npx eas-cli init` and `npx eas build:configure` to generate `eas.json` with dev/preview/production build profiles
- [ ] Set up Apple Developer account credentials for iOS builds
- [ ] Set up Google Play Console credentials for Android builds

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
