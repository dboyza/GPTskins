"use strict";

const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");
const root = join(__dirname, "..");

function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

for (const file of ["content/content.js", "shared/themes.js", "popup/popup.js"]) run(["--check", file]);
run(["--test", ...readdirSync(__dirname).filter((file) => file.endsWith(".test.js")).sort().map((file) => join("tests", file))]);
