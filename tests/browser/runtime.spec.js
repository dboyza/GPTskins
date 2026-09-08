"use strict";

const { test, expect } = require("../helpers/test");
const { installChromeMock } = require("../helpers/chrome-mock");

const body = `<main><article data-message-author-role="assistant"><div class="markdown">
<div id="code-card" class="not-prose"><div id="code-header"><span>JavaScript</span><button>Copy</button></div><pre id="code-body"><code>console.log('GPTskins');</code></pre></div>
<p id="paragraph">A regular paragraph.</p></div></article>
<div id="scroll-area" class="overflow-y-auto" style="height:100px;overflow:auto"><div style="height:1000px">Scrollable content</div></div>
</main>`;

async function openRuntime(page, options = {}, content = body) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await installChromeMock(page, options);
  await page.route("**/tests/runtime-harness.html", (route) => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><html class="dark" style="color-scheme:dark"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0;background:rgb(33,33,33);font-family:Arial,sans-serif}pre{max-width:100%;overflow:auto}</style>
<script src="/shared/themes.js"></script><script src="/content/content.js"></script>
<script>globalThis.GPTskinsBeforeBody = { body: !!document.body, theme: document.documentElement.dataset.gptskinsTheme || null };</script>
</head><body>${content}</body></html>`
  }));
  await page.goto("/tests/runtime-harness.html");
  return errors;
}

async function message(page, value) {
  expect(await page.evaluate((input) => GPTskinsTestChrome.message(input), value)).toEqual([{ ok: true }]);
}

async function applyTheme(page, id) {
  await message(page, { type: "GPTSKINS_APPLY_THEME", themeId: id });
}

async function expectNoTheme(page) {
  await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-theme");
  await expect(page.locator("#gptskins-style")).toHaveCount(0);
  expect(await page.evaluate(() => Array.from(document.querySelectorAll("*")).flatMap((element) => element.getAttributeNames().filter((name) => name.startsWith("data-gptskins-") && name !== "data-gptskins-font")))).toEqual([]);
}

test("document_start applies preferences before body and observes subsequently parsed content", async ({ page }) => {
  const errors = await openRuntime(page, { stored: { "gptskins.theme": "ayu-light", "gptskins.font": "georgia" } });
  expect(await page.evaluate(() => GPTskinsBeforeBody)).toEqual({ body: false, theme: "ayu-light" });
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-font", "georgia");
  await expect(page.locator("#code-card")).toHaveAttribute("data-gptskins-code-block", "true");
  await expect(page.locator("#code-body")).toHaveAttribute("data-gptskins-code-body", "true");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(page.locator("#paragraph")).toHaveCSS("font-family", /Georgia/);
  expect(errors).toEqual([]);
});

for (const stored of [{}, { "gptskins.theme": "missing", "gptskins.font": "missing" }]) {
  test(`native defaults without valid settings: ${JSON.stringify(stored)}`, async ({ page }) => {
    const errors = await openRuntime(page, { stored });
    await expectNoTheme(page);
    await expect(page.locator("#gptskins-font-style")).toHaveCount(0);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(33, 33, 33)");
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    expect(errors).toEqual([]);
  });
}

test("all theme and font combinations remain independent and Default removes their own artifacts", async ({ page }) => {
  test.setTimeout(120000);
  const errors = await openRuntime(page);
  const catalog = await page.evaluate(() => ({ themes: GPTskinsThemes.themes.map(({ id, dark }) => ({ id, dark })), fonts: GPTskinsThemes.fonts.map(({ id, stack }) => ({ id, stack })) }));
  for (const font of catalog.fonts) {
    await message(page, { type: "GPTSKINS_APPLY_FONT", fontId: font.id });
    for (const theme of catalog.themes) {
      await applyTheme(page, theme.id);
      if (theme.id === "default") await expectNoTheme(page);
      else {
        await expect(page.locator("html")).toHaveAttribute("data-gptskins-theme", theme.id);
        await expect(page.locator("#gptskins-style")).toHaveCount(1);
        await expect(page.locator("html")).toHaveCSS("color-scheme", theme.dark ? "dark" : "light");
      }
      if (font.id === "default") {
        await expect(page.locator("#gptskins-font-style")).toHaveCount(0);
        await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-font");
      } else {
        await expect(page.locator("html")).toHaveAttribute("data-gptskins-font", font.id);
        await expect(page.locator("#gptskins-font-style")).toHaveCount(1);
        expect(await page.locator("#paragraph").evaluate((element) => getComputedStyle(element).fontFamily)).toContain(font.stack.split(",")[0]);
      }
    }
  }
  await applyTheme(page, "default");
  await message(page, { type: "GPTSKINS_APPLY_FONT", fontId: "default" });
  await expectNoTheme(page);
  await expect(page.locator("#gptskins-font-style")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("sync events apply changes and removals but ignore unrelated keys and namespaces", async ({ page }) => {
  const errors = await openRuntime(page, { stored: { "gptskins.theme": "og", "gptskins.font": "verdana" } });
  for (const namespace of ["local", "session", "managed"]) {
    await page.evaluate((area) => GPTskinsTestChrome.change({ "gptskins.theme": { newValue: "ayu-light" }, "gptskins.font": { newValue: "georgia" } }, area), namespace);
    await expect(page.locator("html")).toHaveAttribute("data-gptskins-theme", "og");
    await expect(page.locator("html")).toHaveAttribute("data-gptskins-font", "verdana");
  }
  await page.evaluate(() => GPTskinsTestChrome.change({ "another.extension": { newValue: "default" } }));
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-theme", "og");
  await page.evaluate(() => GPTskinsTestChrome.change({ "gptskins.theme": { oldValue: "og", newValue: "ayu-light" }, "gptskins.font": { oldValue: "verdana", newValue: "georgia" } }));
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-theme", "ayu-light");
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-font", "georgia");
  await page.evaluate(() => GPTskinsTestChrome.change({ "gptskins.theme": { oldValue: "ayu-light" } }));
  await expectNoTheme(page);
  await expect(page.locator("html")).toHaveAttribute("data-gptskins-font", "georgia");
  await page.evaluate(() => GPTskinsTestChrome.change({ "gptskins.font": { oldValue: "georgia" } }));
  await expect(page.locator("#gptskins-font-style")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("invalid and unrelated runtime messages cannot leave stale theme state", async ({ page }) => {
  const errors = await openRuntime(page, { stored: { "gptskins.theme": "og", "gptskins.font": "verdana" } });
  for (const unrelated of [null, {}, { type: "ANOTHER_EXTENSION_MESSAGE", themeId: "default" }]) {
    expect(await page.evaluate((input) => GPTskinsTestChrome.message(input), unrelated)).toEqual([]);
    await expect(page.locator("html")).toHaveAttribute("data-gptskins-theme", "og");
  }
  await applyTheme(page, "removed-theme");
  await expectNoTheme(page);
  await message(page, { type: "GPTSKINS_APPLY_FONT", fontId: "removed-font" });
  await expect(page.locator("#gptskins-font-style")).toHaveCount(0);
  await message(page, { type: "GPTSKINS_APPLY_THEME" });
  await message(page, { type: "GPTSKINS_APPLY_FONT" });
  await expectNoTheme(page);
  expect(errors).toEqual([]);
});

test("streamed DOM is tagged, ordinary prose is protected, and cleanup survives repeated switches", async ({ page }) => {
  const errors = await openRuntime(page, { stored: { "gptskins.theme": "og" } });
  await page.evaluate(() => {
    const article = document.createElement("article");
    article.dataset.messageAuthorRole = "assistant";
    article.id = "streamed";
    article.innerHTML = '<div class="markdown"><h2 data-gptskins-code-header="true">Ordinary heading</h2><p data-gptskins-code-header="true">Ordinary text</p><hr data-gptskins-code-header="true"><div id="streamed-card" class="not-prose"><div id="streamed-header"><span>Python</span><button>Copy</button></div><pre id="streamed-pre"><code>print("streamed")</code></pre></div><div class="cm-editor"><div class="cm-scroller"><pre id="cm-internal">editor text</pre></div></div></div>';
    document.querySelector("main").appendChild(article);
  });
  await expect(page.locator("#streamed-card")).toHaveAttribute("data-gptskins-code-block", "true");
  await expect(page.locator("#streamed-pre")).toHaveAttribute("data-gptskins-code-body", "true");
  await expect(page.locator("#streamed-pre")).toHaveCSS("overflow-x", "auto");
  await expect(page.locator('#streamed :is(h2,p,hr)[data-gptskins-code-header]')).toHaveCount(0);
  await expect(page.locator('#cm-internal[data-gptskins-code-body]')).toHaveCount(0);
  for (const id of ["ayu-light", "og", "default", "catppuccin-latte", "default", "og"]) {
    await applyTheme(page, id);
    if (id === "default") await expectNoTheme(page);
    else await expect(page.locator("#streamed-card")).toHaveAttribute("data-gptskins-code-block", "true");
  }
  await expect(page.locator("html")).not.toHaveAttribute("data-gptskins-switching");
  expect(errors).toEqual([]);
});

test("theme changes preserve a scrolled conversation position", async ({ page }) => {
  await openRuntime(page, { stored: { "gptskins.theme": "og" } });
  // Theme application restores scroll over two animation frames; assert the settled position.
  const settleScroll = () => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
  await settleScroll();
  for (const top of [345, 900]) {
    await page.locator("#scroll-area").evaluate((element, value) => { element.scrollTop = value; }, top);
    for (const id of ["ayu-light", "default", "og"]) {
      await applyTheme(page, id);
      await settleScroll();
      expect(await page.locator("#scroll-area").evaluate((element) => element.scrollTop)).toBe(top);
    }
  }
});
