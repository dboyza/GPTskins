"use strict";

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { root, packageRelease, readZip } = require("./package");

async function main() {
  const { filename, entries: expected, sha256 } = await packageRelease();
  const entries = readZip(await fs.readFile(filename));
  assert.deepEqual(entries, expected, "ZIP contents must match every release source byte");
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "gptskins-release-"));
  try {
    for (const { name, data } of entries) {
      const destination = path.join(temporary, name);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, data);
    }
    console.log(`Testing exact package: ${path.basename(filename)}\nSHA-256: ${sha256}`);
    const result = spawnSync(process.execPath, [require.resolve("@playwright/test/cli"), "test", "--config=playwright.extension.config.js"], {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, GPTSKINS_RELEASE_PATH: temporary }
    });
    if (result.error) throw result.error;
    process.exitCode = result.status || (result.signal ? 1 : 0);
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
