"use strict";

// Rebuild store assets from the real popup and logo; no external requests or private data.
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const { installChromeMock } = require("../tests/helpers/chrome-mock");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "docs/store");
const origin = "http://127.0.0.1:8766";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".ttf": "font/ttf" };

async function main() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: "reduce" });
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) throw new Error(`Unexpected external request: ${url.origin}`);
      const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
      if (!file.startsWith(root + path.sep)) return route.abort();
      try { await route.fulfill({ body: await fs.readFile(file), contentType: mime[path.extname(file)] || "application/octet-stream" }); }
      catch { await route.abort(); }
    });
    const page = await context.newPage();
    const logo = `data:image/svg+xml;base64,${(await fs.readFile(path.join(root, "icons/logo.svg"))).toString("base64")}`;
    await page.setViewportSize({ width: 128, height: 128 });
    await page.setContent(`<style>body{margin:0;background:transparent}img{position:absolute;left:16px;top:16px;width:96px;height:96px}</style><img src="${logo}">`);
    await page.locator("img").evaluate((img) => img.decode());
    await page.screenshot({ path: path.join(output, "icon-128.png"), omitBackground: true });
    // The packaged manifest icon must use the same padded store artwork.
    await fs.copyFile(path.join(output, "icon-128.png"), path.join(root, "icons/icon-128.png"));
    const template = await fs.readFile(path.join(output, "graphics.html"), "utf8");
    await page.setViewportSize({ width: 440, height: 280 });
    await page.setContent(template);
    await page.locator("main").evaluate((el, logo) => {
      el.className = "promo";
      el.innerHTML = `<div class="tile left"><i style="background:#1e1e2e"></i><i style="background:#313244"></i><i style="background:#cba6f7"></i></div><div class="tile right"><i style="background:#eff1f5"></i><i style="background:#ccd0da"></i><i style="background:#40a02b"></i></div><img class="mark" src="${logo}">`;
    }, logo);
    await page.locator("img").evaluate((img) => img.decode());
    await page.screenshot({ path: path.join(output, "promo-440x280.png") });
    for (const mode of ["themes", "fonts"]) {
      const popup = await context.newPage();
      await popup.setViewportSize({ width: 390, height: 600 });
      await installChromeMock(popup, { stored: { "gptskins.theme": "og", "gptskins.font": mode === "fonts" ? "jetbrains-mono" : "default" } });
      await popup.goto(`${origin}/popup/popup.html`);
      if (mode === "fonts") await popup.getByRole("button", { name: "Font", exact: true }).click();
      await popup.evaluate(() => document.fonts.ready);
      const capture = (await popup.screenshot()).toString("base64");
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.setContent(template);
      await page.locator("main").evaluate((el, { mode, logo, capture }) => {
        const fonts = mode === "fonts";
        el.innerHTML = `<div class="brand"><img src="${logo}"><b>GPT<span>skins</span></b></div><section class="copy"><div class="eyebrow">${fonts ? "Fonts for ChatGPT" : "Themes for ChatGPT"}</div><h1>${fonts ? "A fresh type<br>of conversation." : "Find your<br>favorite shade."}</h1><p>${fonts ? "From familiar classics to coding favorites.<br>Choose your font in a click." : "Explore dark and light palettes.<br>Switch styles without leaving your chat."}</p><div class="samples">${fonts ? '<div class="font-sample" style="font-family:Georgia">Aa<small>Georgia</small></div><div class="font-sample" style="font-family:Verdana">Aa<small>Verdana</small></div><div class="font-sample" style="font-family:monospace">Aa<small>Mono</small></div>' : '<div class="sample"><i style="background:#1e1e2e"></i><i style="background:#313244"></i><i style="background:#cba6f7"></i></div><div class="sample"><i style="background:#eff1f5"></i><i style="background:#ccd0da"></i><i style="background:#40a02b"></i></div><div class="sample"><i style="background:#0f1419"></i><i style="background:#1f2430"></i><i style="background:#ffb454"></i></div>'}</div></section><img class="picker" src="data:image/png;base64,${capture}"><div class="note">Independent extension for ChatGPT. Not affiliated with OpenAI.</div>`;
      }, { mode, logo, capture });
      await page.locator("img").evaluateAll((images) => Promise.all(images.map((img) => img.decode())));
      await page.screenshot({ path: path.join(output, `screenshot-${mode}-1280x800.png`) });
      await popup.close();
    }
    console.log(`Store graphics saved to ${output}`);
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
