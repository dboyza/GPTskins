const { test, expect } = require('../helpers/test');
require('../../shared/themes.js');
const themes = globalThis.GPTskinsThemes.themes;
const transparent = 'rgba(0, 0, 0, 0)';

async function selectTheme(page, id) {
  await page.locator('#theme-select').selectOption(id);
  if (id === 'default') {
    await expect(page.locator('html')).not.toHaveAttribute('data-gptskins-theme');
  } else {
    await expect(page.locator('html')).toHaveAttribute('data-gptskins-theme', id);
    await expect(page.locator('#plain-body')).toHaveAttribute('data-gptskins-code-body', 'true');
  }
}

// Compare visible browser colors after conversion, including color-mix serialization.
async function collectSurfaceFailures(page, id) {
  return page.evaluate((themeId) => {
    const p = GPTskinsThemes.getTheme(themeId).colors;
    const failures = [];
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rgba = (value) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    const check = (label, actual, expected) => {
      if (actual !== expected) failures.push({ label, actual, expected });
    };
    const color = (id, property, expected) => {
      const actual = getComputedStyle(document.getElementById(id))[property];
      if (rgba(actual).some((v, i) => Math.abs(v - rgba(expected)[i]) > 1)) {
        failures.push({ label: `${id}.${property}`, actual, expected });
      }
    };
    const css = (id, property, expected) => check(`${id}.${property}`, getComputedStyle(document.getElementById(id))[property], expected);
    const tag = (id, name, expected = 'true') => check(`${id}.${name}`, document.getElementById(id).getAttribute(name), expected);
    const clear = 'rgba(0, 0, 0, 0)';
    color('sidebar-heading', 'backgroundColor', clear);
    color('trailing-button', 'backgroundColor', clear);
    color('trailing-wrap', 'backgroundColor', clear);
    check('trailing pseudo paint', getComputedStyle(document.getElementById('trailing-button'), '::before').backgroundColor, clear);
    color('account-button', 'backgroundColor', clear);
    css('sidebar-fill-icon', 'stroke', 'none');
    css('sidebar-stroke-icon', 'strokeWidth', '1.75px');
    tag('library-link', 'data-gptskins-sidebar-action', 'library');
    color('portal-wrapper', 'backgroundColor', clear);
    css('portal-wrapper', 'boxShadow', 'none');
    color('profile-menu', 'backgroundColor', p.composer);
    css('profile-menu', 'borderRadius', '18px');
    css('profile-menu', 'overflowX', 'hidden');
    color('writing-card', 'color', p.text);
    color('writing-card', 'backgroundColor', `color-mix(in srgb, ${p.surfaceStrong} 55%, ${p.surface})`);
    for (const id of ['writing-header', 'writing-editor', 'writing-content']) {
      color(id, 'backgroundColor', clear);
      color(id, 'color', p.text);
    }
    color('writing-edit', 'backgroundColor', p.surfaceStrong);
    color('writing-edit', 'color', p.text);
    css('writing-edit', 'boxShadow', 'none');
    for (const id of ['table-heading', 'table-heading-text', 'table-cell']) {
      color(id, 'color', p.text);
      css(id, 'opacity', '1');
    }
    color('table-cell', 'borderTopColor', `color-mix(in srgb, ${p.border} 65%, ${p.text} 35%)`);
    color('table-copy', 'color', p.text);
    color('chart-label', 'fill', p.mutedText);
    css('chart-label', 'opacity', '1');
    css('chart-grid', 'opacity', '1');
    color('chart-grid', 'stroke', `color-mix(in srgb, ${p.border} 60%, ${p.text} 40%)`);
    color('chart-series', 'stroke', '#3b82f6');
    color('chart-legend', 'backgroundColor', '#3b82f6');
    tag('plain-card', 'data-gptskins-code-block');
    tag('plain-body', 'data-gptskins-code-body');
    tag('plain-body', 'data-gptskins-code-scrollable');
    tag('plain-shell', 'data-gptskins-code-body-shell');
    tag('plain-shell', 'data-gptskins-code-body', null);
    css('plain-body', 'overflowX', 'auto');
    css('plain-shell', 'borderTopWidth', '0px');
    tag('nested-frame', 'data-gptskins-code-frame');
    tag('nested-card', 'data-gptskins-code-block');
    tag('nested-heading', 'data-gptskins-code-header');
    tag('nested-body', 'data-gptskins-code-body');
    color('nested-frame', 'backgroundColor', clear);
    css('nested-frame', 'borderTopWidth', '0px');
    const radius = Number.parseFloat(getComputedStyle(document.getElementById('nested-card')).borderTopLeftRadius);
    if (radius <= 0) failures.push({ label: 'nested-card rounded corners', actual: radius });
    for (const id of ['cm-editor', 'cm-scroller', 'cm-content']) {
      color(id, 'backgroundColor', clear);
      css(id, 'borderTopWidth', '0px');
      css(id, 'borderRadius', '0px');
      css(id, 'outlineWidth', '0px');
      tag(id, 'data-gptskins-code-block', null);
    }
    const cmOverflow = getComputedStyle(document.getElementById('cm-scroller')).overflowX;
    if (!['auto', 'scroll'].includes(cmOverflow)) failures.push({ label: 'CodeMirror horizontal scroll', actual: cmOverflow });
    color('suggestion-panel', 'backgroundColor', p.composer);
    color('composer-submit-button', 'backgroundColor', '#8e44ff');
    const pageWidth = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > pageWidth + 1) failures.push({ label: 'viewport overflow', actual: document.documentElement.scrollWidth, expected: pageWidth });
    return failures;
  }, id);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/content-surfaces.html');
});

for (const theme of themes.filter((theme) => theme.id !== 'default')) {
  test(`${theme.id}: sidebar, portals, writing, data, code and composer surfaces`, async ({ page }) => {
    await selectTheme(page, theme.id);
    await expect.soft.poll(() => collectSurfaceFailures(page, theme.id)).toEqual([]);
    for (const id of ['plain-body', 'nested-body', 'cm-scroller']) {
      const scroller = page.locator(`#${id}`);
      const geometry = await scroller.evaluate((element) => {
        element.scrollLeft = 120;
        return { width: element.clientWidth, content: element.scrollWidth, offset: element.scrollLeft };
      });
      expect(geometry.content, `${id} fixture must actually overflow`).toBeGreaterThan(geometry.width);
      expect(geometry.offset, `${id} text must remain reachable`).toBeGreaterThan(0);
    }
  });
}

for (const id of ['og', 'ayu-light', 'catppuccin-latte']) {
  test(`${id}: hover and keyboard focus have visible feedback without stray squares`, async ({ page }) => {
    await selectTheme(page, id);
    const palette = globalThis.GPTskinsThemes.getTheme(id).colors;
    const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
    await page.locator('#sidebar-heading').hover();
    await expect(page.locator('#sidebar-heading')).toHaveCSS('background-color', transparent);
    await page.locator('#trailing-button').hover();
    await expect(page.locator('#trailing-button')).toHaveCSS('background-color', transparent);
    await expect(page.locator('#trailing-wrap')).toHaveCSS('background-color', transparent);
    await page.locator('#account-button').hover();
    await expect(page.locator('#account-button')).toHaveCSS('background-color', rgb(palette.sidebarHover));
    await page.locator('h1').hover();
    await expect(page.locator('#account-button')).toHaveCSS('background-color', transparent);
    await page.locator('#trailing-button').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#library-link')).toBeFocused();
    await expect(page.locator('#library-link')).toHaveCSS('background-color', rgb(palette.sidebarHover));
    await page.locator('#settings-menu-row').hover();
    const menuHover = await page.locator('#settings-menu-row').evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(menuHover).not.toBe(transparent);
    expect(menuHover).not.toBe(await page.locator('#profile-menu').evaluate((element) => getComputedStyle(element).backgroundColor));
    await page.locator('#profile-menu-row').focus();
    await expect(page.locator('#profile-menu-row')).toHaveCSS('background-color', menuHover);
    await page.locator('#writing-edit').hover();
    await expect(page.locator('#writing-edit')).not.toHaveCSS('background-color', rgb(palette.surfaceStrong));
    await page.locator('#composer-submit-button').hover();
    await expect(page.locator('#composer-submit-button')).toHaveCSS('background-color', 'rgb(142, 68, 255)');
  });
}

test('dynamic message insertion retags code and clears stale semantic-header tags', async ({ page }) => {
  await selectTheme(page, 'ayu-light');
  await page.locator('#insertion-zone').evaluate((element) => {
    element.innerHTML = '<div class="markdown"><h2 data-gptskins-code-header="true">New heading</h2><p data-gptskins-code-header="true">A paragraph</p><hr data-gptskins-code-header="true"><div id="dynamic-card" class="group/code"><div>JavaScript <button>Copy</button></div><pre id="dynamic-code"><code>const ready = true;</code></pre></div></div>';
  });
  await expect(page.locator('#dynamic-card')).toHaveAttribute('data-gptskins-code-block', 'true');
  await expect(page.locator('#dynamic-code')).toHaveAttribute('data-gptskins-code-body', 'true');
  await expect(page.locator('#insertion-zone :is(h2,p,hr)[data-gptskins-code-header]')).toHaveCount(0);
  await selectTheme(page, 'og');
  await expect(page.locator('#insertion-zone :is(h2,p,hr)[data-gptskins-code-header]')).toHaveCount(0);
});

test('late anonymous composer panel is discovered without tagging message content', async ({ page }) => {
  await selectTheme(page, 'ayu-light');
  await page.locator('form').evaluate((form) => {
    const panel = document.createElement('div');
    panel.id = 'anonymous-panel';
    panel.style.cssText = 'background:rgb(0,0,0);height:64px;width:100%';
    panel.textContent = 'Dynamically inserted suggestion';
    form.append(panel);
    const message = document.createElement('div');
    message.id = 'message-black-layer';
    message.style.cssText = 'background:rgb(0,0,0);height:64px;width:100%';
    document.getElementById('insertion-zone').append(message);
  });
  await expect(page.locator('#anonymous-panel')).toHaveAttribute('data-gptskins-suggestion-layer', 'true');
  await expect(page.locator('#anonymous-panel')).not.toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(page.locator('#message-black-layer')).not.toHaveAttribute('data-gptskins-suggestion-layer');
});

test('Default is a native pass-through after repeated theme switches', async ({ page }) => {
  const native = await page.locator('#writing-card').evaluate((element) => getComputedStyle(element).backgroundColor);
  for (const id of ['ayu-light', 'og', 'default', 'catppuccin-latte', 'default']) await selectTheme(page, id);
  await expect(page.locator('#gptskins-style')).toHaveCount(0);
  await expect(page.locator('#writing-card')).toHaveCSS('background-color', native);
  const stale = await page.evaluate(() => [...document.querySelectorAll('*')].flatMap((element) => [...element.attributes].filter((attribute) => /^data-gptskins-(code-|suggestion-layer|sidebar-action|scroll-button|plan-)/.test(attribute.name)).map((attribute) => attribute.name)));
  expect(stale).toEqual([]);
  await page.locator('#insertion-zone').evaluate((element) => { element.innerHTML = '<pre><code>Native dynamic content</code></pre>'; });
  await expect(page.locator('#insertion-zone [data-gptskins-code-body]')).toHaveCount(0);
});
