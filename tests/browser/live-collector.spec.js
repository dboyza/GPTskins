"use strict";

const { test, expect } = require("../helpers/test");
const { collectGPTskinsAudit } = require("../live/collect");

test("live collector reports visible coverage without changing the page or exposing text", async ({ page }, testInfo) => {
  await page.goto("/tests/fixtures/theme-surfaces.html");
  await page.getByLabel("Theme", { exact: true }).selectOption("ayu-light");
  await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-switching");
  await page.evaluate(() => {
    document.querySelector("#work-panel li").textContent = "PRIVATE-MESSAGE-DO-NOT-COLLECT";
    document.querySelector("#work-panel").setAttribute("data-private", "PRIVATE-ATTRIBUTE-DO-NOT-COLLECT");
  });
  const before = await page.locator("html").innerHTML();
  const report = await page.evaluate(collectGPTskinsAudit);
  expect(await page.locator("html").innerHTML()).toBe(before);
  expect(report.theme.id).toBe("ayu-light");
  expect(report.theme.stylesheet.present).toBe(true);
  expect(report.theme.stylesheet.fingerprint).toMatch(/^fnv1a32:/);
  expect(report.coverage.observed).toContain("page");
  expect(report.coverage.notCovered).toContain("writing-block");
  expect(report.coverage.errors).toEqual([]);
  expect(JSON.stringify(report)).not.toContain("PRIVATE-");
  expect(JSON.stringify(report)).not.toContain(page.url());
  await testInfo.attach("sanitized-audit", { body: JSON.stringify(report, null, 2), contentType: "application/json" });
});

test("live collector flags a reproduced black-surface leak and Default cleanup violation", async ({ page }) => {
  await page.goto("/tests/fixtures/theme-surfaces.html");
  await page.getByLabel("Theme", { exact: true }).selectOption("ayu-light");
  await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-switching");
  await page.locator("#work-panel").evaluate((panel) => panel.style.setProperty("background", "#000", "important"));
  await page.locator("#work-panel").scrollIntoViewIfNeeded();
  const report = await page.evaluate(collectGPTskinsAudit);
  expect(report.findings).toEqual(expect.arrayContaining([expect.objectContaining({ code: "dark-surface-on-light-theme", surface: "work-panel" })]));
  await page.evaluate(() => document.documentElement.removeAttribute("data-gptskins-theme"));
  const dirtyDefault = await page.evaluate(collectGPTskinsAudit);
  expect(dirtyDefault.findings).toEqual(expect.arrayContaining([expect.objectContaining({ code: "default-stylesheet", severity: "failure" })]));
});
