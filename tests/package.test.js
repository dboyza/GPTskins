"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { createHash } = require("node:crypto");
const { root, releaseFiles, packageRelease, readZip } = require("../scripts/package");

test("release ZIP is reproducible, minimal, and preserves every runtime and license byte", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "gptskins-package-test-"));
  try {
    const first = await packageRelease({ output });
    const bytes = await fs.readFile(first.filename);
    const second = await packageRelease({ output });
    assert.deepEqual(await fs.readFile(second.filename), bytes);
    assert.equal(first.sha256, createHash("sha256").update(bytes).digest("hex"));
    assert.equal(await fs.readFile(`${first.filename}.sha256`, "utf8"), `${first.sha256}  ${path.basename(first.filename)}\n`);
    const entries = readZip(bytes);
    assert.deepEqual(entries, first.entries);
    const names = entries.map(({ name }) => name);
    assert.equal(names.filter((name) => name.endsWith(".ttf")).length, 7);
    assert.equal(names.filter((name) => name.endsWith("/OFL.txt")).length, 3);
    assert.ok(names.includes("icons/logo.svg"));
    assert.ok(names.every((name) => /^(manifest\.json|(?:content|shared|popup|icons|fonts)\/)/.test(name)));
    assert.ok(names.every((name) => !/(README|\.DS_Store|node_modules|tests|\.map$)/.test(name)));
    assert.deepEqual(entries.find(({ name }) => name === "manifest.json").data, await fs.readFile(path.join(root, "manifest.json")));
    const corrupt = Buffer.from(bytes);
    corrupt[30 + corrupt.readUInt16LE(26)] ^= 1;
    assert.throws(() => readZip(corrupt), /Corrupt ZIP entry/);
  } finally {
    await fs.rm(output, { recursive: true, force: true });
  }
});

test("missing runtime resources fail packaging instead of producing an incomplete release", async () => {
  const source = await fs.mkdtemp(path.join(os.tmpdir(), "gptskins-package-missing-"));
  try {
    await fs.cp(path.join(root, "manifest.json"), path.join(source, "manifest.json"));
    await fs.mkdir(path.join(source, "shared"));
    await fs.cp(path.join(root, "shared/themes.js"), path.join(source, "shared/themes.js"));
    await assert.rejects(releaseFiles(source), /ENOENT/);
  } finally {
    await fs.rm(source, { recursive: true, force: true });
  }
});

test("packaging rejects Chrome-invalid version strings before producing an archive", async () => {
  const source = await fs.mkdtemp(path.join(os.tmpdir(), "gptskins-package-version-"));
  try {
    for (const version of ["0", "0.0.0.0", "01.0", "1.0.0.0.0", "65536", "1.0-beta", 1]) {
      await fs.writeFile(path.join(source, "manifest.json"), JSON.stringify({ version }));
      await assert.rejects(releaseFiles(source), /Invalid extension version/, String(version));
    }
  } finally {
    await fs.rm(source, { recursive: true, force: true });
  }
});
