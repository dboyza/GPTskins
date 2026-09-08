"use strict";

const { defineConfig } = require("@playwright/test");
const port = Number(process.env.GPTSKINS_TEST_PORT || 8766);

module.exports = defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : 3,
  timeout: 60000,
  expect: { timeout: 5000 },
  outputDir: "artifacts/results",
  reporter: [["list"], ["html", { outputFolder: "artifacts/report", open: "never" }], ["json", { outputFile: "artifacts/results.json" }]],
  use: {
    browserName: "chromium",
    baseURL: `http://127.0.0.1:${port}`,
    locale: "en-US",
    timezoneId: "UTC",
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "tablet", use: { viewport: { width: 834, height: 1112 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: {
    command: "node tests/server.js",
    url: `http://127.0.0.1:${port}/__health`,
    reuseExistingServer: false,
    timeout: 15000
  }
});
