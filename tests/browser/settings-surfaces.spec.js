"use strict";

const { test, expect } = require('../helpers/test');
require('../../shared/themes.js');
const { themes } = globalThis.GPTskinsThemes;

async function inspectSettings(page) {
  return page.evaluate(() => {
    const ids = ['usage-tab', 'plugins-tab', 'settings-Usage', 'usage-header', 'usage-card', 'usage-detail-panel', 'usage-track', 'usage-fill', 'usage-countdown', 'usage-action', 'settings-Plugins', 'plugins-header', 'plugin-action', 'credits-badge'];
    return Object.fromEntries(ids.map(id => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return [id, {
        background: style.backgroundColor, color: style.color, opacity: style.opacity,
        borderColor: style.borderTopColor, borderWidth: style.borderTopWidth,
        radius: style.borderTopLeftRadius, width: rect.width, height: rect.height,
        decoration: style.textDecorationStyle
      }];
    }));
  });
}

for (const theme of themes) {
  test(`${theme.id}: settings panels, usage meter and actions retain native hierarchy`, async ({ page }) => {
    await page.goto('/tests/fixtures/settings-surfaces.html');
    const native = await inspectSettings(page);
    await page.getByLabel('Theme', { exact: true }).selectOption(theme.id);
    await expect(page.locator('html')).not.toHaveAttribute('data-gptskins-switching');
    const actual = await inspectSettings(page);
    const failures = [];
    const check = (condition, message) => { if (!condition) failures.push(message); };
    for (const section of ['Usage', 'Plugins']) {
      check(actual[`settings-${section}`].background === actual[`${section.toLowerCase()}-header`].background, `${section}: active content panel differs from its sticky header`);
    }
    check(actual['usage-detail-panel'].background === 'rgba(0, 0, 0, 0)', 'Nested active content panel should remain transparent');
    const countdown = actual['usage-countdown'];
    check(countdown.color !== 'rgba(0, 0, 0, 0)' && countdown.color !== 'transparent', 'Reset countdown text is invisible');
    check(countdown.background === 'rgba(0, 0, 0, 0)', 'Dotted underline is incorrectly painted as a carousel dot');
    check(countdown.opacity === '1', 'Reset countdown incorrectly inherits dot opacity');
    check(countdown.decoration === 'dotted', 'Reset countdown lost its dotted underline');
    check(actual['usage-track'].background !== actual['usage-fill'].background, 'Usage progress fill is invisible against its track');
    check(actual['usage-tab'].background !== actual['plugins-tab'].background, 'Selected settings tab lost its highlight');
    check(actual['credits-badge'].background === native['credits-badge'].background, 'Credits badge lost its native purple background');
    check(actual['credits-badge'].color === native['credits-badge'].color, 'Credits badge lost its native purple label');
    for (const id of ['usage-action']) {
      check(actual[id].background !== 'rgba(0, 0, 0, 0)', `${id}: secondary action lost its pill background`);
      check(actual[id].borderColor !== 'rgba(0, 0, 0, 0)' && actual[id].borderWidth !== '0px', `${id}: secondary action lost its border`);
    }
    for (const id of Object.keys(native)) {
      for (const property of ['width', 'height', 'radius']) {
        check(actual[id][property] === native[id][property], `${id}: native ${property} changed (${native[id][property]} to ${actual[id][property]})`);
      }
    }
    expect(failures).toEqual([]);
    const meterContrast = await page.evaluate(() => {
      const context = document.createElement('canvas').getContext('2d');
      const luminance = id => {
        context.fillStyle = getComputedStyle(document.getElementById(id)).backgroundColor;
        context.fillRect(0, 0, 1, 1);
        const linear = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(channel => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
      };
      const values = [luminance('usage-track'), luminance('usage-fill')];
      return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
    });
    expect(meterContrast, 'Usage fill must contrast with its track').toBeGreaterThanOrEqual(3);
    if (theme.id !== 'default') {
      const action = page.locator('#usage-action');
      await action.hover();
      await expect(action).not.toHaveCSS('background-color', actual['usage-action'].background);
      await action.focus();
      await page.mouse.move(0, 0);
      await expect(action).not.toHaveCSS('background-color', actual['usage-action'].background);
      await action.blur();
      await expect(action).toHaveCSS('background-color', actual['usage-action'].background);
    }
    for (const percentage of [0, 75, 100]) {
      await page.locator('#usage-fill').evaluate((element, value) => { element.style.width = `${value}%`; }, percentage);
      const fillWidth = (await page.locator('#usage-fill').boundingBox()).width;
      expect(Math.abs(fillWidth - actual['usage-track'].width * percentage / 100)).toBeLessThan(0.02);
      await expect(page.locator('#usage-fill')).toHaveCSS('background-color', actual['usage-fill'].background);
    }
    await page.locator('#usage-fill').evaluate(element => { element.style.width = '29%'; });
    await page.getByLabel('Theme', { exact: true }).selectOption('default');
    await expect(page.locator('#gptskins-style')).toHaveCount(0);
    await expect(page.locator('[data-gptskins-theme]')).toHaveCount(0);
    expect(await inspectSettings(page)).toEqual(native);
  });
}
