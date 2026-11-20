import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const UI_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const API_URL = process.env.API_URL ?? 'https://jsonplaceholder.typicode.com';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'], baseURL: UI_URL } },
    { name: 'firefox', testDir: './tests/ui', use: { ...devices['Desktop Firefox'], baseURL: UI_URL } },
    { name: 'webkit', testDir: './tests/ui', use: { ...devices['Desktop Safari'], baseURL: UI_URL } },
    { name: 'api', testDir: './tests/api', use: { baseURL: API_URL } },
    {
      name: 'workato-ui',
      testDir: './tests/pipelines',
      workers: 1, // one pipeline at a time; they are slow and share the workspace
      retries: 0, // a retry would create a second pipeline
      timeout: 30 * 60_000,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: process.env.WORKATO_UI_URL ?? 'https://app.workato.com',
        storageState: '.auth/workato.json', // created by `npm run auth`
        viewport: { width: 1600, height: 900 },
        trace: 'on',
        screenshot: 'on',
        video: 'on',
      },
    },
  ],
});
