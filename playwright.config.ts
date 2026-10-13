import { defineConfig } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL,
    hasTouch: true,
    actionTimeout: 15_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "npm run start --workspace=@funberry/web -- --port 3000",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "public",
      testMatch: /public\.spec\.ts/,
    },
    {
      name: "account",
      testMatch: /account\.spec\.ts|a11y\.spec\.ts/,
      dependencies: ["public"],
      use: { storageState: "e2e/.auth/dummy.json" },
    },
  ],
});
