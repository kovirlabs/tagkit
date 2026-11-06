import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  timeout: 120000,
  reporter: 'list',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
