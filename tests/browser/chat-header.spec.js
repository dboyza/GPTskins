"use strict";

const { test, expect } = require("../helpers/test");
const { installChromeMock } = require("../helpers/chrome-mock");
require("../../shared/themes.js");

for (const theme of globalThis.GPTskinsThemes.themes) {
  test(`${theme.id}: sticky chat header blocks scrolled message content`, async ({ page }) => {
    await installChromeMock(page);
    await page.goto("/tests/fixtures/chat-header.html");
    const header = page.locator("#page-header");
    const native = await header.evaluate(el => getComputedStyle(el).backgroundColor);
    await page.evaluate(themeId => GPTskinsTestChrome.message({ type: "GPTSKINS_APPLY_THEME", themeId }), theme.id);
    await page.locator("main").evaluate(el => { el.scrollTop = 120; });
    await expect(header).toHaveCSS("background-color", theme.id === "default" ? native : `rgb(${theme.colors.background.slice(1).match(/../g).map(value => parseInt(value, 16)).join(", ")})`);
    expect(await header.evaluate(el => el.getBoundingClientRect().top)).toBe(0);
    await page.evaluate(() => GPTskinsTestChrome.message({ type: "GPTSKINS_APPLY_THEME", themeId: "default" }));
    await expect(header).toHaveCSS("background-color", native);
  });
}

for (const theme of globalThis.GPTskinsThemes.themes) {
  test(`${theme.id}: Sources fades preserve native scroll visibility`, async ({ page }) => {
    await installChromeMock(page);
    await page.goto("/tests/fixtures/chat-header.html");
    await page.evaluate(themeId => GPTskinsTestChrome.message({ type: "GPTSKINS_APPLY_THEME", themeId }), theme.id);
    const fades = page.locator('[data-testid^="sources-scroll-fade-"]');
    for (const fade of await fades.all()) await expect(fade).toHaveCSS("opacity", "0");
    // ChatGPT updates inline opacity as the Sources list scrolls.
    for (const opacity of ["1", "0.5", "0"]) {
      await fades.evaluateAll((elements, value) => elements.forEach(el => { el.style.opacity = value; }), opacity);
      for (const fade of await fades.all()) await expect(fade).toHaveCSS("opacity", opacity);
    }
    await page.evaluate(() => GPTskinsTestChrome.message({ type: "GPTSKINS_APPLY_THEME", themeId: "default" }));
    for (const fade of await fades.all()) await expect(fade).toHaveCSS("opacity", "0");
  });
}
