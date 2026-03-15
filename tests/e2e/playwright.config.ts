import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  timeout: 60000,
  retries: 1,
  workers: 1,
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    geolocation: { latitude: 37.5597, longitude: -90.2940 },
    permissions: ['geolocation'],
  },
  webServer: {
    command: 'cd ../../mobile-web && CI=1 npx expo start --web --port 8081',
    port: 8081,
    timeout: 120000,
    reuseExistingServer: true,
    stderr: 'pipe',
  },
});
