import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defineConfig } from '@playwright/test';

function getNode20Path() {
  const nvmRoot = path.join(os.homedir(), '.nvm', 'versions', 'node');
  if (!fs.existsSync(nvmRoot)) {
    return process.env.PATH;
  }

  const node20Bins = fs
    .readdirSync(nvmRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('v20.'))
    .map((entry) => path.join(nvmRoot, entry.name, 'bin'))
    .filter((binPath) => fs.existsSync(path.join(binPath, 'node')))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (node20Bins.length === 0) {
    return process.env.PATH;
  }

  return `${node20Bins[node20Bins.length - 1]}:${process.env.PATH ?? ''}`;
}

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
    command: 'cd ../../mobile-web && CI=1 npx expo start --web --port 8081 --clear',
    env: {
      ...process.env,
      EXPO_WEB_ONLY: '1',
      PATH: getNode20Path(),
    },
    port: 8081,
    timeout: 120000,
    reuseExistingServer: false,
    stderr: 'pipe',
  },
});
