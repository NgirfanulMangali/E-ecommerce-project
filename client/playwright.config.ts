/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Keep this file at the client root so `npx playwright test` from `client/`
 * does not pick up Vitest files under `src/test`.
 */
export default defineConfig({
  testDir: "./src/E2E",
  testMatch: "**/*.spec.ts",
  testIgnore: ["**/test/**", "**/*.test.ts", "**/*.test.tsx"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev --prefix ../server",
      // GET / is 404 (no root route). Playwright requires 2xx before tests start.
      url: "http://127.0.0.1:5000/products",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
