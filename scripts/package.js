"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const { createHash } = require("node:crypto");

const root = path.resolve(__dirname, "..");

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function releaseFiles(source = root) {
  const manifest = JSON.parse(await fs.readFile(path.join(source, "manifest.json"), "utf8"));
  const version = manifest.version;
  if (typeof version !== "string" || !/^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){0,3}$/.test(version) ||
      version.split(".").some((part) => Number(part) > 65535) || version.split(".").every((part) => Number(part) === 0)) {
    throw new Error("Invalid extension version");
  }
  const realSource = await fs.realpath(source);
  const catalog = vm.createContext({});
  vm.runInContext(await fs.readFile(path.join(source, "shared/themes.js"), "utf8"), catalog);
  const files = new Set([
    "manifest.json", "shared/themes.js", "content/content.js",
    "popup/popup.html", "popup/popup.js", "popup/popup.css", "icons/logo.svg",
    ...Object.values(manifest.icons), ...Object.values(manifest.action.default_icon),
    manifest.action.default_popup,
    ...manifest.content_scripts.flatMap((script) => [...(script.js || []), ...(script.css || [])])
  ]);
  for (const font of catalog.GPTskinsThemes.fonts) {
    for (const face of font.faces || []) {
      files.add(face.path);
      files.add(path.posix.join(path.posix.dirname(face.path), "OFL.txt"));
    }
  }
  const entries = [];
  for (const name of [...files].sort()) {
    if (path.posix.isAbsolute(name) || name.includes("\\") || name.split("/").some((part) => !part || part === "." || part === "..")) {
      throw new Error(`Unsafe release path: ${name}`);
    }
    const filename = path.join(source, name);
    if (!(await fs.lstat(filename)).isFile()) throw new Error(`Release resource is not a regular file: ${name}`);
    if (await fs.realpath(filename) !== path.join(realSource, name)) throw new Error(`Release resource traverses a symlink: ${name}`);
    entries.push({ name, data: await fs.readFile(filename) });
  }
  return { manifest, entries };
}

// ZIP's uncompressed method keeps packaging dependency-free and reproducible.
// Entries have a fixed 1980-01-01 timestamp, UTF-8 names, and no host metadata.
function createZip(entries) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const filename = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(crc32(data), 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(filename.length, 26);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(20, 4);
    local.copy(directory, 6, 4, 28);
    directory.writeUInt32LE(offset, 42);
    locals.push(local, filename, data);
    central.push(directory, filename);
    offset += local.length + filename.length + data.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

// Reads this packager's stored ZIP format for byte-for-byte release verification.
// This is deliberately not a general-purpose archive extractor.
function readZip(zip) {
  const entries = [];
  let offset = 0;
  while (zip.readUInt32LE(offset) === 0x04034b50) {
    if (zip.readUInt16LE(offset + 8) !== 0) throw new Error("Expected stored ZIP entries");
    const size = zip.readUInt32LE(offset + 18);
    const nameLength = zip.readUInt16LE(offset + 26);
    const extraLength = zip.readUInt16LE(offset + 28);
    const name = zip.subarray(offset + 30, offset + 30 + nameLength).toString("utf8");
    const start = offset + 30 + nameLength + extraLength;
    const data = zip.subarray(start, start + size);
    if (data.length !== size || crc32(data) !== zip.readUInt32LE(offset + 14)) throw new Error(`Corrupt ZIP entry: ${name}`);
    entries.push({ name, data });
    offset = start + size;
  }
  const end = zip.length - 22;
  if (zip.readUInt32LE(end) !== 0x06054b50 || zip.readUInt32LE(end + 16) !== offset || zip.readUInt16LE(end + 10) !== entries.length) {
    throw new Error("Invalid ZIP directory");
  }
  return entries;
}

async function packageRelease({ source = root, output = path.join(root, "artifacts") } = {}) {
  const { manifest, entries } = await releaseFiles(source);
  const zip = createZip(entries);
  await fs.mkdir(output, { recursive: true });
  const filename = path.join(output, `gptskins-${manifest.version}.zip`);
  await fs.writeFile(filename, zip);
  const sha256 = createHash("sha256").update(zip).digest("hex");
  await fs.writeFile(`${filename}.sha256`, `${sha256}  ${path.basename(filename)}\n`);
  return { filename, sha256, entries };
}

if (require.main === module) {
  packageRelease().then(({ filename, sha256, entries }) => {
    console.log(`Packaged ${entries.length} files: ${filename}\nSHA-256: ${sha256}`);
  }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { root, releaseFiles, createZip, readZip, packageRelease };
