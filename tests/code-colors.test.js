"use strict";

const assert = require("node:assert/strict");

require("../shared/themes.js");

const { themes, getTheme, getCodeColors } = globalThis.GPTskinsThemes;
const hueRanges = {
  "red-200": [350, 360],
  "orange-200": [15, 40],
  "yellow-200": [40, 65],
  "green-200": [120, 165],
  "blue-200": [205, 230],
  "pink-200": [320, 345],
  "purple-200": [250, 275]
};

function channels(hex) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
}

function luminance(hex) {
  const [red, green, blue] = channels(hex)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function hue(hex) {
  const [red, green, blue] = channels(hex);
  const maximum = Math.max(red, green, blue);
  const delta = maximum - Math.min(red, green, blue);
  assert.ok(delta > 0, `Syntax color ${hex} must preserve its hue`);
  const sector = maximum === red ? (green - blue) / delta
    : maximum === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  return (sector * 60 + 360) % 360;
}

assert.deepEqual(getCodeColors("default"), {}, "Default must preserve native syntax colors");
assert.deepEqual(getCodeColors("unknown"), {}, "Unknown themes must fall back to Default");
assert.deepEqual(getCodeColors(getTheme("default")), {});
assert.deepEqual(getCodeColors("one-dark"), getCodeColors("one"), "Theme aliases must resolve");

for (const theme of themes.filter((item) => item.id !== "default")) {
  const original = JSON.stringify(theme);
  const colors = getCodeColors(theme);
  assert.deepEqual(colors, getCodeColors(theme.id), `${theme.id} object and id results must agree`);
  assert.equal(JSON.stringify(theme), original, `${theme.id} palette must remain unchanged`);
  assert.deepEqual(Object.keys(colors).sort(), Object.keys(hueRanges).sort());
  assert.equal(new Set(Object.values(colors)).size, 7, `${theme.id} syntax colors must remain distinct`);

  for (const [token, color] of Object.entries(colors)) {
    assert.match(color, /^#[0-9a-f]{6}$/i);
    const [minimumHue, maximumHue] = hueRanges[token];
    assert.ok(hue(color) >= minimumHue && hue(color) <= maximumHue, `${theme.id} ${token} must preserve its semantic hue`);

    for (const surface of ["surface", "surfaceStrong", "composer"]) {
      const [light, dark] = [luminance(color), luminance(theme.colors[surface])].sort((a, b) => b - a);
      const contrast = (light + 0.05) / (dark + 0.05);
      assert.ok(contrast >= 4.5, `${theme.id} ${token} on ${surface}: ${contrast.toFixed(2)}:1 is below 4.5:1`);
    }
  }
}

assert.equal(getCodeColors("og")["yellow-200"], "#f9dc78", "Already readable syntax colors should stay unchanged");
assert.notEqual(getCodeColors("ayu-light")["yellow-200"], "#f9dc78", "Light code surfaces need darker syntax colors");

console.log(`Checked syntax colors across ${themes.length - 1} GPTskins theme palettes.`);
