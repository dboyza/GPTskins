"use strict";

const { test, expect } = require("../helpers/test");
const { installChromeMock } = require("../helpers/chrome-mock");
require("../../shared/themes.js");

for (const theme of globalThis.GPTskinsThemes.themes) {
  test(`${theme.id}: read-only code has one card border and native body spacing`, async ({ page }, testInfo) => {
    await installChromeMock(page);
    await page.goto("/tests/fixtures/code-viewer.html");
    const geometry = () => page.locator(".cm-content").evaluate(el => {
      const style = getComputedStyle(el);
      return { padding: style.padding, lineHeight: style.lineHeight, height: el.getBoundingClientRect().height };
    });
    const native = await geometry();
    await page.evaluate(themeId => GPTskinsTestChrome.message({ type: "GPTSKINS_APPLY_THEME", themeId }), theme.id);
    for (const selector of ["#viewer", ".cm-scroller", ".cm-content"]) {
      await expect(page.locator(selector)).toHaveCSS("border-top-width", "0px");
      await expect(page.locator(selector)).toHaveCSS("border-radius", "0px");
      await expect(page.locator(selector)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    }
    await expect(page.locator("#card")).toHaveCSS("border-top-width", "1px");
    expect(await geometry()).toEqual(native);
    if (theme.id === "og" && testInfo.project.name === "desktop") {
      await page.locator("#card").screenshot({ path: testInfo.outputPath("code-card.png") });
    }
    await page.locator("code").evaluate(el => { el.textContent = "long_example_argument ".repeat(80); });
    await expect.poll(() => page.locator(".cm-scroller").evaluate(el => {
      el.scrollLeft = 100;
      return el.scrollLeft;
    })).toBeGreaterThan(0);
    await page.locator("code").evaluate(el => { el.textContent = "python sample_program.py"; });
    await page.evaluate(() => GPTskinsTestChrome.message({ type: "GPTSKINS_APPLY_THEME", themeId: "default" }));
    expect(await geometry()).toEqual(native);
    await expect(page.locator("[data-gptskins-code-block]")).toHaveCount(0);
  });
}
