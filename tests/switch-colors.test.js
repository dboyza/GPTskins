"use strict";

const assert = require("node:assert/strict");

require("../shared/themes.js");

const { themes } = globalThis.GPTskinsThemes;

function channels(hex) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function luminance(hex) {
  return channelLuminance(channels(hex));
}

function channelLuminance(rgb) {
  const [red, green, blue] = rgb.map((channel) => channel / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function checkContrast(theme, foreground, background) {
  const [light, dark] = [luminance(theme.colors[foreground]), luminance(theme.colors[background])].sort((a, b) => b - a);
  const ratio = (light + 0.05) / (dark + 0.05);
  assert.ok(ratio >= 3, `${theme.id} ${foreground} against ${background}: ${ratio.toFixed(2)}:1 is below 3:1`);
}

assert.deepEqual(themes.find((theme) => theme.id === "default").colors, {}, "Default must preserve native controls");

for (const theme of themes.filter((item) => item.id !== "default")) {
  for (const token of ["mutedText", "surface", "switchTrackChecked"]) {
    assert.match(theme.colors[token], /^#[0-9a-f]{6}$/i, `${theme.id} needs a hex ${token}`);
  }

  for (const surface of ["background", "surface", "surfaceStrong", "composer"]) {
    checkContrast(theme, "mutedText", surface);
    checkContrast(theme, "switchTrackChecked", surface);
  }
  checkContrast(theme, "surface", "mutedText");
  checkContrast(theme, "surface", "switchTrackChecked");

  // Native thumb position also identifies state; track color must visibly change with it.
  const unchecked = channels(theme.colors.mutedText);
  const checked = channels(theme.colors.switchTrackChecked);
  const largestChannelChange = Math.max(...checked.map((channel, index) => Math.abs(channel - unchecked[index])));
  assert.ok(largestChannelChange >= 24, `${theme.id} checked and unchecked tracks are too similar`);

  // Our 3:1 design target keeps disabled labels visible against their pills.
  const disabledBackground = channels(theme.colors.mutedText).map((value, index) => value * 0.2 + channels(theme.colors.surface)[index] * 0.8);
  const [light, dark] = [luminance(theme.colors.text), channelLuminance(disabledBackground)].sort((a, b) => b - a);
  assert.ok((light + 0.05) / (dark + 0.05) >= 3, `${theme.id} disabled plan label must remain readable`);
}

console.log(`Checked switch colors across ${themes.length - 1} GPTskins theme palettes.`);
