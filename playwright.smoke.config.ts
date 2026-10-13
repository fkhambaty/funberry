import { defineConfig } from "@playwright/test";

const baseURL = process.env.SMOKE_BASE_URL || "https://www.funberrykids.in";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /production-smoke\.spec\.ts/,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
});
