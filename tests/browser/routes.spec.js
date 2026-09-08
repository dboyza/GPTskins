"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("../helpers/test");
const { installChromeMock } = require("../helpers/chrome-mock");
const root = path.join(__dirname, "../..");

// The reserved hostname is intercepted completely: these tests never contact ChatGPT.
async function openRouteHarness(page, hostname = "chatgpt.com") {
  await installChromeMock(page, { stored: { "gptskins.theme": "ayu-light", "gptskins.font": "georgia" } });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    const asset = ["/shared/themes.js", "/content/content.js"].includes(url.pathname);
    if (asset) return route.fulfill({ contentType: "text/javascript", body: fs.readFileSync(path.join(root, url.pathname), "utf8") });
    if (route.request().resourceType() !== "document") return route.fulfill({ status: 204, body: "" });
    return route.fulfill({ contentType: "text/html", body: `<!doctype html><html class="dark"><head><script src="/shared/themes.js"></script><script src="/content/content.js"></script></head><body><main><p>Route fixture</p></main></body></html>` });
  });
  await page.goto(`https://${hostname}/c/fixture`);
}

async function routeTo(page, pathname, method = "pushState") {
  await page.evaluate(({ pathname, method }) => history[method]({}, "", pathname), { pathname, method });
}

async function themed(page) {
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-theme", "ayu-light");
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-font", "georgia");
  await expect(page.locator("#gptskins-style")).toHaveCount(1);
}

test("marketing routes remove both styles and app routes restore saved selections", async ({ page }) => {
  await openRouteHarness(page);
  const paths = ["/overview", "/atlas", "/parent-resources", "/college-students", "/contact-sales", "/merchants", "/pricing", "/download", "/features", "/features/example", "/use-cases/example", "/codex", "/business/teams", "/plans/pro"];
  for (const pathname of paths) {
    await routeTo(page, `${pathname}/?source=test#section`);
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-theme");
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-font");
    await expect(page.locator("#gptskins-style, #gptskins-font-style")).toHaveCount(0);
    await routeTo(page, "/c/fixture");
    await themed(page);
  }
  for (const pathname of ["/", "/library", "/projects", "/scheduled", "/plugins", "/#pricing", "/features-extra", "/plans-extra"]) {
    await routeTo(page, pathname, "replaceState");
    await themed(page);
  }
});

test("back/forward navigation restores styling without losing a changed preference", async ({ page }) => {
  await openRouteHarness(page);
  await themed(page);
  await routeTo(page, "/pricing");
  await expect(page.locator("#gptskins-style")).toHaveCount(0);
  await page.evaluate(() => GPTskinsTestChrome.message({ type: "GPTSKINS_APPLY_THEME", themeId: "nord" }));
  await expect(page.locator("#gptskins-style")).toHaveCount(0);
  await page.goBack();
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-theme", "nord");
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-font", "georgia");
  await page.goForward();
  await expect(page.locator("#gptskins-style, #gptskins-font-style")).toHaveCount(0);
});

test("legacy app hostname does not inherit marketing route exclusions", async ({ page }) => {
  await openRouteHarness(page, "chat.openai.com");
  await routeTo(page, "/pricing");
  await themed(page);
});
