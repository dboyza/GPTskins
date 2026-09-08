"use strict";

const { test, expect } = require("../helpers/test");
const { installChromeMock } = require("../helpers/chrome-mock");

for (const panel of ["Dark", "Light", "Font"]) {
  test(`popup ${panel} appearance`, async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 800 });
    await installChromeMock(page);
    await page.goto("/popup/popup.html");
    await page.getByRole("button", { name: panel, exact: true }).click();
    await expect(page.locator(".brand img")).toHaveJSProperty("naturalWidth", 128);
    await expect(page.locator("body")).toHaveScreenshot(`popup-${panel.toLowerCase()}.png`);
  });
}
