"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
require("../shared/themes.js");
const api = globalThis.GPTskinsThemes;

test("manifest loads existing assets and applies themes at document_start", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.match(manifest.version, /^\d+\.\d+\.\d+(?:\.\d+)?$/);
  assert.deepEqual(manifest.permissions.slice().sort(), ["activeTab", "storage"]);
  const scripts = manifest.content_scripts;
  assert.equal(scripts.length, 1);
  assert.deepEqual(scripts[0].js, ["shared/themes.js", "content/content.js"]);
  assert.equal(scripts[0].run_at, "document_start");
  assert.deepEqual(scripts[0].matches.slice().sort(), manifest.host_permissions.slice().sort());
  assert.deepEqual(manifest.host_permissions.slice().sort(), ["https://chat.openai.com/*", "https://chatgpt.com/*"]);
  for (const asset of [...scripts[0].js, manifest.action.default_popup, ...Object.values(manifest.icons), ...Object.values(manifest.action.default_icon)]) {
    assert.ok(fs.statSync(path.join(root, asset)).isFile(), `Missing packaged asset: ${asset}`);
  }
});

test("theme and font catalogs are internally complete and identifiers fall back safely", () => {
  for (const [catalog, getter] of [[api.themes, api.getTheme], [api.fonts, api.getFont]]) {
    assert.equal(new Set(catalog.map((entry) => entry.id)).size, catalog.length);
    assert.equal(catalog.filter((entry) => entry.id === "default").length, 1);
    for (const entry of catalog) {
      assert.match(entry.id, /^[a-z0-9-]+$/);
      assert.ok(entry.name && entry.description);
      assert.equal(getter(entry.id), entry);
    }
    for (const invalid of [undefined, null, "removed-theme", "__proto__", "constructor"]) assert.equal(getter(invalid).id, "default");
  }
  assert.deepEqual([...api.darkThemeIds].sort(), api.themes.filter((theme) => theme.dark).map((theme) => theme.id).sort());
  for (const theme of api.themes.filter((entry) => entry.id !== "default")) {
    for (const key of ["background", "surface", "surfaceStrong", "text", "mutedText", "border", "accent", "accentText", "composer", "switchTrackChecked"]) {
      assert.match(theme.colors[key], /^#[\da-f]{6}$/i, `${theme.id}.${key}`);
    }
  }
});
