"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Exercise the production message receiver without bootstrapping ChatGPT's DOM.
const source = fs.readFileSync(path.join(__dirname, "../content/content.js"), "utf8");
const start = source.indexOf("  chrome.runtime.onMessage.addListener(");
const end = source.indexOf("  chrome.storage.onChanged.addListener(", start);
assert.ok(start >= 0 && end > start, "content script must register its message receiver");

let receiver;
let applied;
let applicationError;
const apply = (kind, id) => {
  if (applicationError) throw applicationError;
  applied = { kind, id };
};
vm.runInNewContext(source.slice(start, end), {
  chrome: { runtime: { onMessage: { addListener: (listener) => { receiver = listener; } } } },
  applyTheme: (id) => apply("theme", id),
  applyFont: (id) => apply("font", id)
});

for (const [kind, id] of [["theme", "ayu-light"], ["font", "georgia"], ["theme", "default"], ["font", "default"]]) {
  applied = null;
  let acknowledgments = 0;
  receiver({ type: `GPTSKINS_APPLY_${kind.toUpperCase()}`, [`${kind}Id`]: id }, {}, (response) => {
    assert.deepEqual(applied, { kind, id }, "apply the selection before acknowledging it");
    assert.equal(response.ok, true);
    acknowledgments += 1;
  });
  assert.equal(acknowledgments, 1, `acknowledge ${kind} changes so Chrome does not report a closed message port`);
}

for (const message of [null, {}, { type: "UNRELATED_MESSAGE" }]) {
  applied = null;
  receiver(message, {}, () => assert.fail("unrelated messages must not be acknowledged"));
  assert.equal(applied, null);
}

applicationError = new Error("Theme application failed");
assert.throws(
  () => receiver({ type: "GPTSKINS_APPLY_THEME", themeId: "ayu-light" }, {}, () => assert.fail("failed application must not acknowledge success")),
  applicationError
);

console.log("Checked theme/font message acknowledgments, unrelated messages, and application failure.");
