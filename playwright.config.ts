import { defineConfig, devices } from "@playwright/test";

const APP_PORT = Number(process.env.E2E_APP_PORT ?? 3100);
const MOCK_API_PORT = Number(process.env.MOCK_API_PORT ?? 4010);

const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${APP_PORT}`;
const apiURL = process.env.E2E_API_URL ?? `http://localhost:${MOCK_API_PORT}`;

/**
 * Suite runs against a mock of the Nest API by default: a developer machine
 * cannot serve an authenticated session from the real backend (unseeded
 * database, mail key needed for the OTP), and the specs want a world they can
 * reset. Point `E2E_API_URL` at the real API to run the same specs against it —
 * the auth-dependent ones will then need seeded accounts.
 */
export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    locale: "vi-VN",
    timezoneId: "Asia/Saigon",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /responsive\.spec\.ts/,
    },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: "node e2e/mock-api/server.mjs",
          port: MOCK_API_PORT,
          reuseExistingServer: !process.env.CI,
          env: {
            MOCK_API_PORT: String(MOCK_API_PORT),
            APP_URL: baseURL,
          },
        },
        {
          command: `pnpm exec next build && pnpm exec next start -p ${APP_PORT}`,
          port: APP_PORT,
          timeout: 300_000,
          reuseExistingServer: !process.env.CI,
          env: {
            API_URL: apiURL,
            NEXT_PUBLIC_APP_URL: baseURL,
            E2E: "1",
          },
        },
      ],
});
