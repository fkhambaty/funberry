import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

export default defineConfig({
  ...baseConfig,
  globalSetup: undefined,
  projects: [
    {
      name: "public",
      testMatch: /public\.spec\.ts/,
    },
  ],
});
