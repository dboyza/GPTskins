"use strict";

const { test: base, expect, chromium } = require("@playwright/test");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const nativeDocument = (gated = false) => `<!doctype html><html class="dark" style="color-scheme:dark"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0;background:rgb(33,33,33);color:rgb(245,245,245);font-family:Arial,sans-serif}</style>
${gated ? '<script src="/parser-gate.js"></script>' : ""}
</head><body><main><article data-message-author-role="assistant"><div class="markdown"><p id="message">An offline integration test.</p><div id="code-card" class="not-prose"><div><span>JavaScript</span><button>Copy</button></div><pre><code>console.log('GPTskins');</code></pre></div></div></article></main></body></html>`;

const test = base.extend({
  extension: async ({ headless }, use, testInfo) => {
    const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "gptskins-extension-test-"));
    let context;
    let releaseParser = () => {};
    try {
      const production = process.env.GPTSKINS_RELEASE_PATH || path.resolve(__dirname, "../..");
      const extensionPath = path.join(temporary, "extension");
      await fs.mkdir(extensionPath);
      for (const directory of ["content", "shared", "popup", "icons", "fonts"]) {
        await fs.cp(path.join(production, directory), path.join(extensionPath, directory), { recursive: true });
      }
      await fs.copyFile(path.join(production, "manifest.json"), path.join(extensionPath, "manifest.json"));
      // Official persistent-context extension loading, using bundled Chromium.
      // https://playwright.dev/docs/chrome-extensions
      context = await chromium.launchPersistentContext(path.join(temporary, "profile"), {
        channel: "chromium",
        headless,
        viewport: { width: 1100, height: 850 },
        serviceWorkers: "block",
        args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
      });
      // Discover Chromium's real identity without altering the release manifest.
      const manager = await context.newPage();
      await manager.goto("chrome://extensions/");
      const installed = manager.locator("extensions-item").filter({ hasText: "GPTskins" });
      await expect(installed).toHaveCount(1);
      const extensionId = await installed.getAttribute("id");
      expect(extensionId).toMatch(/^[a-p]{32}$/);
      await manager.close();
      const errors = [];
      context.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
      await context.tracing.start({ screenshots: true, snapshots: true });
      const parserGate = new Promise((resolve) => { releaseParser = resolve; });
      // No ChatGPT server is contacted. All HTTP(S) requests are fulfilled or aborted.
      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.protocol === "chrome-extension:") return route.continue();
        if (url.href === "https://chatgpt.com/parser-gate.js") {
          await parserGate;
          return route.fulfill({ contentType: "text/javascript", body: "/* Parser gate released. */" });
        }
        if (request.isNavigationRequest() && ["https://chatgpt.com", "https://chat.openai.com", "https://example.com"].includes(url.origin)) {
          return route.fulfill({ contentType: "text/html", body: nativeDocument(url.pathname === "/document-start") });
        }
        return route.abort("blockedbyclient");
      });
      await use({ context, extensionId, releaseParser, errors });
    } finally {
      releaseParser();
      try {
        if (context) {
          try {
            if (testInfo.status !== testInfo.expectedStatus) {
              await context.tracing.stop({ path: testInfo.outputPath("extension-trace.zip") });
              for (const [index, page] of context.pages().entries()) {
                if (!page.isClosed()) await testInfo.attach(`page-${index}`, { body: await page.screenshot(), contentType: "image/png" });
              }
            } else await context.tracing.stop();
          } finally {
            await context.close();
          }
        }
      } finally {
        await fs.rm(temporary, { recursive: true, force: true });
      }
    }
  }
});

test("the real unpacked extension injects, synchronizes, persists and cleans up", async ({ extension }) => {
  const { context, extensionId, releaseParser, errors } = extension;
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup/popup.html`);
  await expect(popup.getByRole("status")).toHaveText("Pick a theme for ChatGPT.");
  expect(await popup.evaluate(() => chrome.runtime.id)).toBe(extensionId);
  expect(await popup.evaluate(() => typeof globalThis.GPTskinsTestChrome)).toBe("undefined");

  await popup.locator('[data-theme-id="og"]').click();
  await expect(popup.getByRole("status")).toHaveText("Saved. Open ChatGPT to see this theme.");
  const chat = await context.newPage();
  await chat.goto("https://chatgpt.com/document-start", { waitUntil: "commit" });
  // The parser is paused in head. Positive theme paint proves document_start
  // injection and asynchronous storage reading both work before body exists.
  await expect(chat.locator("html")).toHaveAttribute("data-gptskins-theme", "og");
  await expect(chat.locator("body")).toHaveCount(0);
  releaseParser();
  await chat.waitForLoadState("load");
  await expect(chat.locator("#code-card")).toHaveAttribute("data-gptskins-code-block", "true");
  expect(await chat.evaluate(() => typeof globalThis.GPTskinsThemes)).toBe("undefined");

  await popup.bringToFront();
  await popup.locator('[data-theme-mode="light"]').click();
  await popup.locator('[data-theme-id="ayu-light"]').click();
  await expect(chat.locator("html")).toHaveAttribute("data-gptskins-theme", "ayu-light");
  await expect(chat.locator("html")).toHaveCSS("color-scheme", "light");
  // Keep ChatGPT active as it is when Chrome opens the action popup.
  // Programmatic activation avoids turning the popup's test tab into the active tab.
  await chat.bringToFront();
  await popup.evaluate(() => document.querySelector('[data-theme-id="ayu-light"]').click());
  await expect(popup.getByRole("status")).toHaveText("Theme applied.");
  await popup.getByRole("button", { name: "Font", exact: true }).click();
  const bundledFonts = await popup.evaluate(() => globalThis.GPTskinsThemes.fonts
    .filter((font) => font.faces?.length)
    .map(({ id, family, faces }) => ({ id, family, faces })));
  expect(bundledFonts.map((font) => font.id).sort()).toEqual(["fira-code", "jetbrains-mono", "space-mono"]);
  const verifyBundledFont = async (page, font) => {
    const loaded = await page.evaluate(async ({ font, extensionId }) => {
      const results = [];
      for (const face of font.faces) {
        const weight = String(face.weight).split(" ")[0];
        const matches = await document.fonts.load(`${face.style} ${weight} 16px "${font.family}"`, "const answer = 42; !== =>");
        const definition = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules]).find((rule) =>
          rule.type === CSSRule.FONT_FACE_RULE &&
          rule.style.fontFamily.replace(/^['"]|['"]$/g, "") === font.family &&
          rule.style.fontWeight === face.weight && rule.style.fontStyle === face.style);
        results.push({
          family: font.family,
          style: face.style,
          matches: matches.map((match) => ({ family: match.family.replace(/^['"]|['"]$/g, ""), style: match.style, status: match.status })),
          source: definition?.style.getPropertyValue("src"),
          expectedSource: `url("chrome-extension://${extensionId}/${face.path}") format("truetype")`
        });
      }
      return results;
    }, { font, extensionId });
    for (const face of loaded) {
      expect(face.matches, `${font.id}: the real font must load instead of falling back`).not.toHaveLength(0);
      expect(face.matches).toContainEqual({ family: face.family, style: face.style, status: "loaded" });
      expect(face.source, `${font.id}: the loaded face must use only its packaged extension file`).toBe(face.expectedSource);
    }
  };
  for (const font of bundledFonts) {
    await verifyBundledFont(popup, font);
    await popup.locator(`[data-font-id="${font.id}"]`).click();
    await expect(chat.locator("html")).toHaveAttribute("data-gptskins-font", font.id);
    await expect(chat.locator("#message")).toHaveCSS("font-family", new RegExp(font.family));
    await verifyBundledFont(chat, font);
  }
  await popup.locator('[data-font-id="space-mono"]').click();
  await chat.reload();
  await expect(chat.locator("html")).toHaveAttribute("data-gptskins-font", "space-mono");
  await verifyBundledFont(chat, bundledFonts.find((font) => font.id === "space-mono"));
  const fontLegacy = await context.newPage();
  await fontLegacy.goto("https://chat.openai.com/");
  await expect(fontLegacy.locator("html")).toHaveAttribute("data-gptskins-font", "space-mono");
  await verifyBundledFont(fontLegacy, bundledFonts.find((font) => font.id === "space-mono"));
  await fontLegacy.close();
  await popup.locator('[data-font-id="georgia"]').click();
  await expect(chat.locator("#message")).toHaveCSS("font-family", /Georgia/);
  await chat.reload();
  await expect(chat.locator("html")).toHaveAttribute("data-gptskins-theme", "ayu-light");
  await expect(chat.locator("html")).toHaveAttribute("data-gptskins-font", "georgia");
  await popup.reload();
  await expect(popup.locator('[data-theme-id="ayu-light"]')).toHaveAttribute("aria-pressed", "true");

  // Exercise actual tabs messaging and actual content-script acknowledgement.
  const reply = await popup.evaluate(async () => {
    const [target] = await chrome.tabs.query({ url: "https://chatgpt.com/*" });
    return chrome.tabs.sendMessage(target.id, { type: "GPTSKINS_APPLY_THEME", themeId: "dracula" });
  });
  expect(reply).toEqual({ ok: true });
  await expect(chat.locator("html")).toHaveAttribute("data-gptskins-theme", "dracula");
  await expect(chat.locator("html")).toHaveCSS("color-scheme", "dark");

  const legacy = await context.newPage();
  await legacy.goto("https://chat.openai.com/");
  await expect(legacy.locator("html")).toHaveAttribute("data-gptskins-theme", "ayu-light");
  const unrelated = await context.newPage();
  await unrelated.goto("https://example.com/");
  await expect(unrelated.locator("#gptskins-style")).toHaveCount(0);
  await expect(unrelated.locator("html")).not.toHaveAttribute("data-gptskins-theme");
  await unrelated.bringToFront();
  expect(await popup.evaluate(async () => {
    const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
    return active.url;
  })).toBeUndefined();
  await popup.evaluate(() => document.querySelector('[data-theme-id="ayu-light"]').click());
  await expect(popup.getByRole("status")).toHaveText("Saved. Open ChatGPT to see this theme.");
  expect(await popup.evaluate(() => chrome.storage.sync.get("gptskins.theme"))).toEqual({ "gptskins.theme": "ayu-light" });

  await popup.bringToFront();
  await popup.locator('[data-theme-mode="dark"]').click();
  await popup.locator('[data-theme-id="default"]').click();
  for (const page of [chat, legacy]) {
    await expect(page.locator("#gptskins-style")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-theme");
    await expect(page.locator("html")).toHaveAttribute("data-gptskins-font", "georgia");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(33, 33, 33)");
  }
  await popup.getByRole("button", { name: "Font", exact: true }).click();
  await popup.locator('[data-font-id="default"]').click();
  for (const page of [chat, legacy]) {
    await expect(page.locator("#gptskins-font-style")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-font");
    await expect(page.locator("#message")).toHaveCSS("font-family", "Arial, sans-serif");
  }
  await chat.reload();
  await expect(chat.locator("#gptskins-style, #gptskins-font-style")).toHaveCount(0);
  expect(await popup.evaluate(() => chrome.storage.sync.get(null))).toEqual({ "gptskins.theme": "default", "gptskins.font": "default" });
  expect(errors).toEqual([]);
});
