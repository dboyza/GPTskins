"use strict";

const { test, expect } = require("../helpers/test");
const { installChromeMock } = require("../helpers/chrome-mock");

async function openPopup(page, options) {
  await page.setViewportSize({ width: 420, height: 800 });
  await installChromeMock(page, options);
  await page.goto("/popup/popup.html");
  await expect(page.getByRole("status")).toHaveText("Pick a theme for ChatGPT.");
}

async function expectState(page, key, value, message, status) {
  await expect(page.getByRole("status")).toHaveText(status);
  const state = await page.evaluate(() => ({ values: GPTskinsTestChrome.stored(), calls: GPTskinsTestChrome.calls }));
  expect(state.values[key]).toBe(value);
  expect(state.calls.messages.at(-1)).toEqual({ id: 17, message });
  expect(state.calls.queries.at(-1)).toEqual({ active: true, currentWindow: true });
}

test("every theme is discoverable, selectable, messaged and persisted", async ({ page }) => {
  await openPopup(page);
  const themes = await page.evaluate(() => GPTskinsThemes.themes.map(({ id, dark }) => ({ id, dark })));
  const visited = [];
  for (const mode of ["dark", "light"]) {
    await page.locator(`[data-theme-mode="${mode}"]`).click();
    await expect(page.locator(`[data-theme-mode="${mode}"]`)).toHaveAttribute("aria-pressed", "true");
    const expected = themes.filter((theme) => (theme.dark || theme.id === "default" ? "dark" : "light") === mode);
    await expect(page.locator("[data-theme-id]")).toHaveCount(expected.length);
    for (const { id } of expected) {
      await page.locator(`[data-theme-id="${id}"]`).click();
      await expect(page.locator('[data-theme-id][aria-pressed="true"]')).toHaveCount(1);
      await expect(page.locator(`[data-theme-id="${id}"]`)).toHaveAttribute("aria-pressed", "true");
      await expectState(page, "gptskins.theme", id, { type: "GPTSKINS_APPLY_THEME", themeId: id }, "Theme applied.");
      visited.push(id);
    }
  }
  expect([...visited].sort()).toEqual(themes.map(({ id }) => id).sort());
  await page.reload();
  await expect(page.locator(`[data-theme-id="${visited.at(-1)}"]`)).toHaveAttribute("aria-pressed", "true");
});

test("font panel selects every font independently and restores its saved choice", async ({ page }) => {
  await openPopup(page, { stored: { "gptskins.theme": "ayu-light" } });
  await page.getByRole("button", { name: "Font", exact: true }).click();
  await expect(page.locator("#theme-panel")).toBeHidden();
  await expect(page.locator("#font-panel")).toBeVisible();
  const fonts = await page.evaluate(() => GPTskinsThemes.fonts.map(({ id }) => id));
  for (const id of fonts) {
    await page.locator(`[data-font-id="${id}"]`).click();
    await expect(page.locator('[data-font-id][aria-pressed="true"]')).toHaveCount(1);
    await expectState(page, "gptskins.font", id, { type: "GPTSKINS_APPLY_FONT", fontId: id }, "Font applied.");
  }
  expect(await page.evaluate(() => GPTskinsTestChrome.stored()["gptskins.theme"])).toBe("ayu-light");
  await page.reload();
  await expect(page.locator('[data-theme-id="ayu-light"]')).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Font", exact: true }).click();
  await expect(page.locator(`[data-font-id="${fonts.at(-1)}"]`)).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await expect(page.locator("#font-panel")).toBeHidden();
  await expect(page.locator("#theme-panel")).toBeVisible();
});

for (const stored of [{}, { "gptskins.theme": "removed-theme", "gptskins.font": "removed-font" }]) {
  test(`missing or invalid preferences fall back to Default: ${JSON.stringify(stored)}`, async ({ page }) => {
    await openPopup(page, { stored });
    await expect(page.locator('[data-theme-id="default"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-theme-mode="dark"]')).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Font", exact: true }).click();
    await expect(page.locator('[data-font-id="default"]')).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => GPTskinsTestChrome.calls.writes)).toEqual([]);
  });
}

const deliveryCases = [
  { label: "no active tab", options: { tabs: [] }, theme: "Saved. Open ChatGPT to see this theme.", font: "Saved. Open ChatGPT to see this font.", sends: 0 },
  { label: "unrelated tab", options: { tabs: [{ id: 17, url: "https://example.com/" }] }, theme: "Saved. Open ChatGPT to see this theme.", font: "Saved. Open ChatGPT to see this font.", sends: 0 },
  { label: "lookalike host", options: { tabs: [{ id: 17, url: "https://chatgpt.com.example.org/" }] }, theme: "Saved. Open ChatGPT to see this theme.", font: "Saved. Open ChatGPT to see this font.", sends: 0 },
  { label: "legacy ChatGPT domain", options: { tabs: [{ id: 17, url: "https://chat.openai.com/c/example" }] }, theme: "Theme applied.", font: "Font applied.", sends: 2 },
  { label: "content script unavailable", options: { sendError: "Receiving end does not exist" }, theme: "Saved. Refresh ChatGPT if it was already open.", font: "Saved. Refresh ChatGPT if it was already open.", sends: 2 },
  { label: "storage failure with live tab", options: { setError: "Quota exceeded" }, theme: "Theme applied, but couldn't save it.", font: "Font applied, but couldn't save it.", sends: 2 },
  { label: "storage failure without live tab", options: { setError: "Quota exceeded", tabs: [] }, theme: "Couldn't save theme. Try again.", font: "Couldn't save font. Try again.", sends: 0 }
];
for (const scenario of deliveryCases) {
  test(`delivery status: ${scenario.label}`, async ({ page }) => {
    await openPopup(page, scenario.options);
    await page.locator('[data-theme-id="og"]').click();
    await expect(page.getByRole("status")).toHaveText(scenario.theme);
    await page.getByRole("button", { name: "Font", exact: true }).click();
    await page.locator('[data-font-id="verdana"]').click();
    await expect(page.getByRole("status")).toHaveText(scenario.font);
    const state = await page.evaluate(() => ({ stored: GPTskinsTestChrome.stored(), calls: GPTskinsTestChrome.calls }));
    expect(state.calls.messages).toHaveLength(scenario.sends);
    expect(state.calls.writes).toEqual([{ "gptskins.theme": "og" }, { "gptskins.font": "verdana" }]);
    expect(state.stored).toEqual(scenario.options.setError ? {} : { "gptskins.theme": "og", "gptskins.font": "verdana" });
  });
}

test("saved aliases resolve to canonical choices and keyboard activation works", async ({ page }) => {
  await openPopup(page, { stored: { "gptskins.theme": "midnight", "gptskins.font": "georgia" } });
  await expect(page.locator('[data-theme-id="night-owl"]')).toHaveAttribute("aria-pressed", "true");
  const lightFilter = page.getByRole("button", { name: "Light", exact: true });
  await lightFilter.focus();
  await page.keyboard.press("Space");
  await expect(lightFilter).toHaveAttribute("aria-pressed", "true");
  const theme = page.locator('[data-theme-id="ayu-light"]');
  await theme.focus();
  await page.keyboard.press("Enter");
  await expect(theme).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toHaveText("Theme applied.");
  await expect(page.locator(".popup-shell")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("a storage read error still opens a usable Default popup", async ({ page }) => {
  await openPopup(page, { getError: "Storage is unavailable" });
  await expect(page.locator('[data-theme-id="default"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('[data-theme-id="og"]').click();
  await expect(page.getByRole("status")).toHaveText("Theme applied.");
});
