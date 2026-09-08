"use strict";

const { defineConfig } = require("@playwright/test");
const base = require("./playwright.config");

module.exports = defineConfig(base, {
  testDir: "./tests/visual",
  outputDir: "artifacts/visual-results",
  snapshotPathTemplate: "{testDir}/baselines/{platform}/{projectName}/{arg}{ext}",
  updateSnapshots: "none",
  expect: { toHaveScreenshot: { animations: "disabled", caret: "hide", threshold: 0.1, maxDiffPixels: 0 } },
  reporter: [["list"], ["html", { outputFolder: "artifacts/visual-report", open: "never" }]]
});
