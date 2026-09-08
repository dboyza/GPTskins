"use strict";

const { test, expect } = require("../helpers/test");
require("../../shared/themes.js");

for (const theme of globalThis.GPTskinsThemes.themes) {
  test(`${theme.id}: approved surface appearance`, async ({ page }) => {
    await page.goto("/tests/fixtures/theme-surfaces.html");
    await page.getByLabel("Theme", { exact: true }).selectOption(theme.id);
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-switching");
    await expect(page.locator(".fixture-grid")).toHaveScreenshot(`${theme.id}-surfaces.png`);
  });
  test(`${theme.id}: approved message and menu appearance`, async ({ page }) => {
    await page.goto("/tests/fixtures/content-surfaces.html");
    await page.getByLabel("Theme", { exact: true }).selectOption(theme.id);
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-switching");
    await expect(page.locator(".gallery")).toHaveScreenshot(`${theme.id}-content.png`);
  });
  test(`${theme.id}: approved pricing appearance`, async ({ page }) => {
    await page.goto("/tests/fixtures/pricing.html");
    await page.locator("#theme-select").selectOption(theme.id);
    if (theme.id !== "default") await expect(page.locator("html")).toHaveAttribute("data-gptskins-plan-page", "true");
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-switching");
    await expect(page.locator("#pricing-panel")).toHaveScreenshot(`${theme.id}-pricing.png`);
  });
}
