const { test, expect } = require('../helpers/test');
require('../../shared/themes.js');
const themes = globalThis.GPTskinsThemes.themes;

async function planFailures(page, themeId) {
  return page.evaluate((id) => {
    const p = GPTskinsThemes.getTheme(id).colors;
    const failures = [];
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rgba = (value) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const color = (id, property, expected, pseudo) => {
      const actual = getComputedStyle(document.getElementById(id), pseudo)[property];
      if (rgba(actual).some((v, i) => Math.abs(v - rgba(expected)[i]) > 1)) failures.push({ element: id, property, actual, expected, pseudo });
    };
    const attribute = (id, name, expected = 'true') => {
      const actual = document.getElementById(id).getAttribute(name);
      if (actual !== expected) failures.push({ element: id, attribute: name, actual, expected });
    };
    const luminance = (color) => rgba(color).slice(0, 3).map((channel) => { const value = channel / 255; return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const clear = 'rgba(0, 0, 0, 0)';
    for (const id of ['pricing-panel', 'plus-plan', 'team-plan']) color(id, 'backgroundColor', p.surface);
    for (const id of ['audience-toggle', 'capacity-toggle']) {
      attribute(id, 'data-gptskins-plan-toggle');
      color(id, 'backgroundColor', clear);
    }
    for (const id of ['audience-track', 'capacity-track']) color(id, 'backgroundColor', `color-mix(in srgb, ${p.mutedText} 16%, ${p.surface})`);
    for (const id of ['audience-highlight', 'capacity-highlight']) color(id, 'backgroundColor', `color-mix(in srgb, ${p.text} 5%, ${p.surface})`);
    for (const id of ['personal-option', 'business-option', 'five-option', 'twenty-option']) {
      attribute(id, 'data-gptskins-plan-toggle-option');
      const selected = document.getElementById(id).getAttribute('aria-checked') === 'true';
      color(id, 'color', selected ? p.text : p.mutedText);
      color(id, 'backgroundColor', clear);
    }
    for (const id of ['plus-action', 'pro-action', 'team-action']) {
      attribute(id, 'data-gptskins-plan-cta');
      const disabled = id !== 'plus-action';
      attribute(id, 'data-gptskins-plan-disabled', disabled ? 'true' : null);
      color(id, 'backgroundColor', disabled ? `color-mix(in srgb, ${p.mutedText} 20%, ${p.surface})` : p.accent);
      color(id, 'color', disabled ? p.text : p.accentText);
      const styles = getComputedStyle(document.getElementById(id));
      if (disabled) {
        const textLuminance = luminance(styles.color);
        const backgroundLuminance = luminance(styles.backgroundColor);
        const contrast = (Math.max(textLuminance, backgroundLuminance) + 0.05) / (Math.min(textLuminance, backgroundLuminance) + 0.05);
        if (contrast < 3) failures.push({ element: id, problem: 'Disabled label contrast below design target', contrast });
      }
      if (styles.opacity !== '1') failures.push({ element: id, opacity: styles.opacity });
      if (Number.parseFloat(styles.borderTopLeftRadius) < 20) failures.push({ element: id, radius: styles.borderTopLeftRadius });
      if (document.getElementById(id).getBoundingClientRect().height < 44) failures.push({ element: id, problem: 'CTA lost its minimum height' });
    }
    color('plan-footer', 'backgroundColor', p.surface);
    color('plan-footer', 'backgroundColor', clear, '::after');
    if (getComputedStyle(document.getElementById('plan-footer'), '::after').boxShadow !== 'none') failures.push('Footer pseudo shadow remained');
    const highlight = getComputedStyle(document.getElementById('highlighted-plan'));
    if (!highlight.backgroundImage.includes('gradient')) failures.push('Highlight gradient disappeared');
    if (highlight.backgroundImage.includes('39, 75, 114')) failures.push('Native blue gradient remained');
    color('highlighted-plan', 'color', p.text);
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) failures.push('Horizontal viewport overflow');
    return failures;
  }, themeId);
}

for (const theme of themes) {
  test(`${theme.id}: automatically detect and theme the complete pricing scene`, async ({ page }) => {
    await page.goto(`/tests/fixtures/pricing.html?theme=${theme.id}`);
    expect(await page.evaluate(() => fixtureInitialBodyPresent)).toBe(false);
    if (theme.id === 'default') {
      await expect(page.locator('html')).not.toHaveAttribute('data-gptskins-plan-page');
      await expect(page.locator('#gptskins-style')).toHaveCount(0);
      await expect(page.locator('#plus-action')).toHaveCSS('background-color', 'rgb(2, 133, 255)');
      await expect(page.locator('#pro-action')).toHaveCSS('opacity', '0.5');
      return;
    }
    await expect(page.locator('html')).toHaveAttribute('data-gptskins-plan-page', 'true');
    await expect.poll(() => planFailures(page, theme.id)).toEqual([]);
  });
}

for (const themeId of ['og', 'ayu-light']) {
  test(`${themeId}: aria-only selection overrides stale fallback tags and actions stay disabled`, async ({ page }) => {
    await page.goto(`/tests/fixtures/pricing.html?theme=${themeId}`);
    await expect(page.locator('#personal-option')).toHaveAttribute('data-gptskins-plan-active', 'true');
    // Let initial observation finish, then avoid Playwright's auto-scroll (which can trigger a rescan).
    await expect(page.locator('html')).not.toHaveAttribute('data-gptskins-switching');
    await page.getByRole('radio', { name: 'Business', exact: true }).evaluate((button) => button.click());
    await page.getByRole('radio', { name: '20x', exact: true }).evaluate((button) => button.click());
    // Internal fallback markers may remain until the next scan; explicit ARIA must win immediately.
    await expect(page.locator('#personal-option')).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('#business-option')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#five-option')).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('#twenty-option')).toHaveAttribute('aria-checked', 'true');
    await expect.poll(() => planFailures(page, themeId)).toEqual([]);
    await expect(page.locator('#pro-action')).toBeDisabled();
    await expect(page.locator('#team-action')).toHaveAttribute('aria-disabled', 'true');
    await page.locator('#theme-select').selectOption('default');
    await expect(page.locator('html')).not.toHaveAttribute('data-gptskins-plan-page');
    await expect(page.locator('[data-gptskins-plan-cta], [data-gptskins-plan-toggle], [data-gptskins-plan-active], [data-gptskins-plan-disabled]')).toHaveCount(0);
    await expect(page.locator('#plus-action')).toHaveCSS('background-color', 'rgb(2, 133, 255)');
  });
}

test('pricing content arriving after startup is detected without a theme refresh', async ({ page }) => {
  await page.goto('/tests/fixtures/pricing.html?theme=ayu-light');
  await expect(page.locator('html')).toHaveAttribute('data-gptskins-plan-page', 'true');
  await page.locator('#pricing-panel').evaluate((panel) => { globalThis.detachedPricingPanel = panel; panel.remove(); });
  await expect(page.locator('html')).not.toHaveAttribute('data-gptskins-plan-page');
  await page.locator('main').evaluate((main) => main.append(globalThis.detachedPricingPanel));
  await expect(page.locator('html')).toHaveAttribute('data-gptskins-plan-page', 'true');
  await expect.poll(() => planFailures(page, 'ayu-light')).toEqual([]);
});

test('native disabled attributes can change without leaving stale disabled paint', async ({ page }) => {
  await page.goto('/tests/fixtures/pricing.html?theme=ayu-light');
  await expect(page.locator('#pro-action')).toHaveAttribute('data-gptskins-plan-cta', 'true');
  await expect(page.locator('html')).not.toHaveAttribute('data-gptskins-switching');
  await page.evaluate(() => {
    document.getElementById('pro-action').disabled = false;
    document.getElementById('team-action').setAttribute('aria-disabled', 'false');
  });
  for (const id of ['pro-action', 'team-action']) {
    await expect(page.locator(`#${id}`)).toHaveCSS('background-color', 'rgb(255, 170, 51)');
    await expect(page.locator(`#${id}`)).toHaveCSS('color', 'rgb(36, 20, 0)');
  }
  await page.locator('#pro-action').evaluate(button => { button.disabled = true; });
  await expect(page.locator('#pro-action')).not.toHaveCSS('background-color', 'rgb(255, 170, 51)');
});
