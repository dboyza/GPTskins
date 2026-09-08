"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

test("store PNGs use required dimensions and color formats, with the packaged icon matching", () => {
  for (const [name, width, height, colorType] of [
    ["icon-128.png", 128, 128, 6],
    ["promo-440x280.png", 440, 280, 2],
    ["screenshot-themes-1280x800.png", 1280, 800, 2],
    ["screenshot-fonts-1280x800.png", 1280, 800, 2]
  ]) {
    const png = fs.readFileSync(path.join(root, "docs/store", name));
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", name);
    assert.equal(png.readUInt32BE(16), width, name);
    assert.equal(png.readUInt32BE(20), height, name);
    assert.equal(png[24], 8, name);
    assert.equal(png[25], colorType, name);
  }
  assert.deepEqual(fs.readFileSync(path.join(root, "docs/store/icon-128.png")), fs.readFileSync(path.join(root, "icons/icon-128.png")));
});
