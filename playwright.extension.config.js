"use strict";

const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/extension",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: "artifacts/extension-results",
  reporter: [["list"], ["html", { outputFolder: "artifacts/extension-report", open: "never" }]],
  use: { headless: true },
  projects: [{ name: "unpacked-chromium" }]
});
