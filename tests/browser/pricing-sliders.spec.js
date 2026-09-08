const { test, expect } = require('../helpers/test');
require('../../shared/themes.js');
const themes = globalThis.GPTskinsThemes.themes;

async function installSliders(page) {
  await page.goto('/tests/fixtures/pricing.html?theme=default');
  return page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      .live-slider { display:block; width:240px; height:40px; margin:16px 0; padding:4px; border-radius:999px; background:#303030; }
      .live-slider .relative { position:relative; }
      .live-slider .h-full { height:100%; }
      .live-slider .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }
      .live-slider .gap-1 { gap:4px; }
      .live-slider .rounded-full { border-radius:999px; }
      .live-slider .pointer-events-none { pointer-events:none; }
      .live-slider .z-10 { z-index:10; }
      .live-slider .shadow-sm { box-shadow:0 1px 3px #0004; }
      .live-slider [role=radio] { display:block; width:100%; height:32px; padding:6px 10px; }
    `;
    document.head.append(style);
    document.querySelector('#audience-track').remove();
    document.querySelector('#capacity-track').remove();
    const host = document.createElement('div');
    host.id = 'live-sliders';
    for (const [id, labels] of [['audience', ['Personal', 'Business']], ['capacity', ['5x', '20x']], ['billing', ['Annual', 'Monthly']]]) {
      const track = document.createElement('div');
      track.id = `${id}-slider`;
      track.className = 'live-slider relative rounded-full p-1 select-none cursor-pointer bg-token-main-surface-tertiary';
      track.setAttribute('role', 'radiogroup');
      track.setAttribute('aria-label', labels.join(' or '));
      track.innerHTML = `<div class="relative h-full"><div class="pointer-events-none absolute inset-0 grid gap-1"><div class="relative rounded-full"><div class="bg-token-bg-primary absolute inset-0 h-full rounded-full shadow-sm"></div></div><div class="relative rounded-full"></div></div><div class="relative z-10 grid gap-1"><div><button role="radio" aria-checked="true" data-state="on">${labels[0]}</button></div><div><button role="radio" aria-checked="false" data-state="off">${labels[1]}</button></div></div></div>`;
      track.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => {
        track.querySelectorAll('button').forEach(option => {
          option.setAttribute('aria-checked', String(option === button));
          option.setAttribute('data-state', option === button ? 'on' : 'off');
        });
        const paintGrid = track.querySelector('.pointer-events-none');
        paintGrid.children[index].append(track.querySelector('.shadow-sm'));
      }));
      host.append(track);
    }
    document.querySelector('#pricing-panel').prepend(host);
    return [...host.querySelectorAll('[role=radiogroup], button, .shadow-sm')].map(element => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
  });
}

async function sliderFailures(page, themeId, nativeGeometry) {
  return page.evaluate(({ themeId, nativeGeometry }) => {
    const palette = GPTskinsThemes.getTheme(themeId).colors;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const rgba = value => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    const failures = [];
    const color = (element, property, expected) => {
      const actual = getComputedStyle(element)[property];
      if (rgba(actual).some((value, index) => Math.abs(value - rgba(expected)[index]) > 1)) {
        failures.push({ element: element.id || element.className || element.textContent, property, expected, actual });
      }
    };
    for (const track of document.querySelectorAll('.live-slider')) {
      color(track, 'backgroundColor', `color-mix(in srgb, ${palette.mutedText} 16%, ${palette.surface})`);
      const thumb = track.querySelector('.shadow-sm');
      color(thumb, 'backgroundColor', palette.surface);
      if (getComputedStyle(thumb).boxShadow !== 'none') failures.push(`${track.id}: floating thumb shadow`);
      for (const button of track.querySelectorAll('button')) {
        color(button, 'backgroundColor', 'transparent');
        color(button, 'color', button.getAttribute('aria-checked') === 'true' ? palette.text : palette.mutedText);
      }
    }
    const geometry = [...document.querySelectorAll('#live-sliders [role=radiogroup], #live-sliders button, #live-sliders .shadow-sm')].map(element => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
    if (JSON.stringify(geometry) !== JSON.stringify(nativeGeometry)) failures.push({ problem: 'Native control geometry changed', geometry, nativeGeometry });
    return failures;
  }, { themeId, nativeGeometry });
}

for (const theme of themes) {
  test(`${theme.id}: pricing slider tracks and moving paint layer retain their shape`, async ({ page }) => {
    const nativeGeometry = await installSliders(page);
    if (theme.id !== 'default') {
      await page.locator('#theme-select').selectOption(theme.id);
      await expect(page.locator('#audience-slider')).toHaveAttribute('data-gptskins-plan-toggle', 'true');
      await expect.poll(() => sliderFailures(page, theme.id, nativeGeometry)).toEqual([]);
      for (const id of ['audience', 'capacity', 'billing']) {
        const track = page.locator(`#${id}-slider`);
        await track.getByRole('radio').nth(1).click();
        await expect(track.getByRole('radio').nth(1)).toHaveAttribute('aria-checked', 'true');
        await expect(track.locator('.pointer-events-none > div').nth(1).locator('.shadow-sm')).toHaveCount(1);
      }
      await expect.poll(() => sliderFailures(page, theme.id, nativeGeometry)).toEqual([]);
      await page.locator('#theme-select').selectOption('default');
    }
    await expect(page.locator('#gptskins-style')).toHaveCount(0);
    await expect(page.locator('#live-sliders [data-gptskins-plan-toggle], #live-sliders [data-gptskins-plan-toggle-option]')).toHaveCount(0);
    for (const id of ['audience', 'capacity', 'billing']) {
      await expect(page.locator(`#${id}-slider`)).toHaveCSS('background-color', 'rgb(48, 48, 48)');
      await expect(page.locator(`#${id}-slider .shadow-sm`)).toHaveCSS('background-color', 'rgb(0, 0, 0)');
      await expect(page.locator(`#${id}-slider .shadow-sm`)).not.toHaveCSS('box-shadow', 'none');
    }
  });
}
