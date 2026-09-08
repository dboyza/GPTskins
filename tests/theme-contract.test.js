"use strict";

const assert = require("node:assert/strict");

require("../shared/themes.js");

const { themes } = globalThis.GPTskinsThemes;

function luminance(hex) {
  const channels = [1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

assert.equal(new Set(themes.map((theme) => theme.id)).size, themes.length, "theme ids must be unique");

// These tokens paint conversation text, settings help, composer hints, and sidebar labels.
const mainSurfaces = ["background", "surface", "surfaceStrong", "composer", "assistantBubble", "userBubble"];
const textSurfaces = {
  text: mainSurfaces,
  mutedText: mainSurfaces,
  sidebarText: ["sidebar", "sidebarHover"],
  sidebarMuted: ["sidebar", "sidebarHover"],
  accentText: ["accent"]
};

for (const theme of themes.filter((item) => item.id !== "default")) {
  for (const [foreground, backgrounds] of Object.entries(textSurfaces)) {
    assert.match(theme.colors[foreground], /^#[0-9a-f]{6}$/i, `${theme.id} needs a hex ${foreground}`);
    for (const background of backgrounds) {
      assert.match(theme.colors[background], /^#[0-9a-f]{6}$/i, `${theme.id} needs a hex ${background}`);
      const ratio = contrast(theme.colors[foreground], theme.colors[background]);
      assert.ok(ratio >= 4.5, `${theme.id} ${foreground} on ${background} contrast is ${ratio.toFixed(2)}:1, below 4.5:1`);
    }
  }
}

console.log(`Checked ${themes.length - 1} GPTskins theme palettes.`);
