"use strict";

const { test, expect } = require("../helpers/test");
require("../../shared/themes.js");
const { themes } = globalThis.GPTskinsThemes;

for (const theme of themes) {
  test(`${theme.id}: captured native cascade and controls`, async ({ page }, testInfo) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/tests/fixtures/theme-surfaces.html");
    await page.getByLabel("Theme", { exact: true }).selectOption(theme.id);
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-switching");
    const report = await page.evaluate(() => checkFixtureTheme());
    await testInfo.attach("computed-style-checks", { body: JSON.stringify(report, null, 2), contentType: "application/json" });
    expect(report.checks).toBeGreaterThan(0);
    expect(report.failures).toEqual([]);
    expect(errors).toEqual([]);
    await testInfo.attach("surfaces", { body: await page.screenshot({ fullPage: true, animations: "disabled" }), contentType: "image/png" });
  });
}

test("all themes repeatedly switch and return to clean Default", async ({ page }, testInfo) => {
  await page.goto("/tests/fixtures/theme-surfaces.html");
  for (let pass = 0; pass < 2; pass += 1) {
    await page.getByRole("button", { name: "Run all themes", exact: true }).click();
    await expect(page.locator("#test-status")).toHaveAttribute("data-state", "passed", { timeout: 30000 });
    const report = await page.locator("#test-report").textContent();
    await testInfo.attach(`switch-cycle-${pass + 1}`, { body: report, contentType: "application/json" });
    expect(JSON.parse(report).results).toHaveLength(themes.length + 1);
    expect(JSON.parse(report).failures).toBe(0);
    await expect(page.locator("#gptskins-style")).toHaveCount(0);
    await expect(page.locator("[data-gptskins-theme]")).toHaveCount(0);
  }
});

test("custom palettes also override native light appearance and inline color scheme", async ({ page }) => {
  await page.goto("/tests/fixtures/theme-surfaces.html");
  await page.evaluate(() => {
    document.documentElement.classList.replace("dark", "light");
    document.documentElement.style.colorScheme = "light";
  });
  for (const theme of themes.filter((entry) => entry.id !== "default")) {
    await page.getByLabel("Theme", { exact: true }).selectOption(theme.id);
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-switching");
    const report = await page.evaluate(() => checkFixtureTheme());
    expect(report.failures, theme.id).toEqual([]);
  }
  await page.getByLabel("Theme", { exact: true }).selectOption("default");
  await expect(page.locator("#gptskins-style")).toHaveCount(0);
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
});
