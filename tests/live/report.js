#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const manifest = require('./surfaces.json');
require('../../shared/themes.js');
const themeIds = globalThis.GPTskinsThemes.themes.map(theme => theme.id);

function validateRecord(record) {
  const invalid = message => { throw new Error(message); };
  if (!record || typeof record !== 'object' || Array.isArray(record)) invalid('Expected a capture wrapper object.');
  const scenario = manifest.scenarios.find(item => item.id === record.scenario);
  if (!scenario) invalid('Unknown or missing scenario.');
  if (!['PASS', 'FAIL', 'NOT_COVERED', 'PENDING'].includes(record.review)) invalid('Review must be PASS, FAIL, NOT_COVERED, or PENDING.');
  const audit = record.audit;
  if (!audit || audit.schemaVersion !== 1) invalid('Unsupported or missing audit schemaVersion.');
  if (typeof audit.collectedAt !== 'string' || !Number.isFinite(Date.parse(audit.collectedAt))) invalid('Missing or invalid collection timestamp.');
  if (!themeIds.includes(audit.theme?.id)) invalid('Unknown or missing theme.');
  if (!audit.viewport || !['width', 'height', 'deviceScaleFactor'].every(key => Number.isFinite(audit.viewport[key]) && audit.viewport[key] > 0)) invalid('Invalid viewport dimensions.');
  if (audit.theme.id === 'default' && !['light', 'dark'].includes(record.nativeAppearance)) invalid('Default captures require nativeAppearance: light or dark.');
  if (!Array.isArray(audit.surfaces) || !Array.isArray(audit.findings)) invalid('Missing surfaces or findings arrays.');
  for (const name of ['observed', 'notCovered', 'errors', 'truncated']) if (!Array.isArray(audit.coverage?.[name]) || !audit.coverage[name].every(id => typeof id === 'string')) invalid('Invalid coverage arrays.');
  const surfaceIds = new Set();
  for (const surface of audit.surfaces) {
    if (!surface || typeof surface.id !== 'string' || !['OBSERVED', 'NOT_COVERED', 'ERROR'].includes(surface.status) || !Array.isArray(surface.samples)) invalid('Invalid surface record.');
    if (surfaceIds.has(surface.id)) invalid('Duplicate surface record.');
    surfaceIds.add(surface.id);
    if (surface.status === 'OBSERVED' && surface.samples.length === 0) invalid('Observed surface has no evidence samples.');
    if ((surface.status === 'OBSERVED') !== audit.coverage.observed.includes(surface.id)) invalid('Surface status disagrees with coverage.');
  }
  for (const id of audit.coverage.observed) if (!surfaceIds.has(id)) invalid('Coverage references a missing surface.');
  for (const finding of audit.findings) if (!finding || !['review', 'failure'].includes(finding.severity) || typeof finding.code !== 'string') invalid('Invalid finding record.');
  const viewport = manifest.viewports.find(item => item.width === audit.viewport.width && item.height === audit.viewport.height);
  const missing = scenario.required.filter(id => !audit.coverage.observed.includes(id));
  const requiredErrors = scenario.required.filter(id => audit.coverage.errors.includes(id));
  const requiredTruncated = scenario.required.filter(id => audit.coverage.truncated.includes(id));
  const failures = audit.findings.filter(finding => finding.severity === 'failure').length;
  const candidates = audit.findings.filter(finding => finding.severity === 'review').length;
  let status = 'PENDING';
  if (record.review === 'FAIL' || failures) status = 'FAIL';
  else if (record.review === 'NOT_COVERED' || missing.length || requiredErrors.length || requiredTruncated.length) status = 'NOT_COVERED';
  else if (record.review === 'PASS') status = 'PASS';
  return { theme: audit.theme.id, viewport: viewport?.name || null, scenario: scenario.id, nativeAppearance: audit.theme.id === 'default' ? record.nativeAppearance : null, status, missing, requiredErrors, requiredTruncated, failures, reviewCandidates: candidates };
}

function summarize(records) {
  const captures = records.map(validateRecord);
  const cells = [];
  for (const theme of themeIds) for (const viewport of manifest.viewports) for (const scenario of manifest.scenarios) {
    const matching = captures.filter(capture => capture.theme === theme && capture.viewport === viewport.name && capture.scenario === scenario.id);
    const appearances = theme === 'default' ? ['light', 'dark'] : [null];
    const variants = appearances.map(nativeAppearance => {
      const results = matching.filter(capture => capture.nativeAppearance === nativeAppearance);
      // A later pass must not silently erase a failed capture from this audit run.
      const status = results.some(result => result.status === 'FAIL') ? 'FAIL'
        : results.some(result => result.status === 'PASS') ? 'PASS'
          : results.some(result => result.status === 'NOT_COVERED') ? 'NOT_COVERED' : 'PENDING';
      return { nativeAppearance, status, captures: results.length };
    });
    const status = variants.some(variant => variant.status === 'FAIL') ? 'FAIL'
      : variants.every(variant => variant.status === 'PASS') ? 'PASS'
        : variants.some(variant => variant.status === 'NOT_COVERED') ? 'NOT_COVERED' : 'PENDING';
    cells.push({ theme, viewport: viewport.name, scenario: scenario.id, status, variants });
  }
  const counts = Object.fromEntries(['PASS', 'FAIL', 'NOT_COVERED', 'PENDING'].map(status => [status, cells.filter(cell => cell.status === status).length]));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    complete: counts.PASS === cells.length,
    counts,
    dimensions: { themes: themeIds.length, viewports: manifest.viewports.length, scenarios: manifest.scenarios.length, cells: cells.length },
    captureCount: captures.length,
    supplementalViewportCaptures: captures.filter(capture => !capture.viewport).length,
    failureCaptures: captures.filter(capture => capture.status === 'FAIL').length,
    reviewCandidates: captures.reduce((sum, capture) => sum + capture.reviewCandidates, 0),
    note: 'PASS requires an explicit human review and all required surfaces observed without truncated evidence. Default requires both native appearances. Unobserved cells remain pending. Findings marked review require visual judgment.',
    captures,
    cells
  };
}

function run(argv, io = { stdout: process.stdout, stderr: process.stderr }) {
  let output = 'artifacts/live-summary.json';
  let strict = false;
  const inputs = [];
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === '--strict') strict = true;
    else if (argv[index] === '--output') {
      if (!argv[index + 1] || argv[index + 1].startsWith('--')) { io.stderr.write('Missing --output destination.\n'); return 2; }
      output = argv[++index];
    } else if (argv[index].startsWith('--')) { io.stderr.write('Unknown option.\n'); return 2; }
    else inputs.push(argv[index]);
  }
  if (!inputs.length) { io.stderr.write('Usage: node tests/live/report.js [--strict] [--output FILE] CAPTURE.json ...\n'); return 2; }
  if (inputs.some(input => path.resolve(input) === path.resolve(output))) { io.stderr.write('Summary output must differ from every input capture.\n'); return 2; }
  const records = [];
  for (let index = 0; index < inputs.length; index++) {
    try {
      const record = JSON.parse(fs.readFileSync(inputs[index], 'utf8'));
      validateRecord(record);
      records.push(record);
    } catch (error) {
      // Do not print parser errors, paths, or record contents, which may contain private data.
      io.stderr.write(`Input ${index + 1}: cannot read a valid live capture wrapper. Check the schema and required metadata.\n`);
      return 2;
    }
  }
  const report = summarize(records);
  try { fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`); }
  catch { io.stderr.write('Unable to write summary output.\n'); return 2; }
  io.stdout.write(`${report.complete ? 'COMPLETE' : 'INCOMPLETE'} live audit: ${report.counts.PASS}/${report.dimensions.cells} cells passed; ${report.counts.FAIL} failed; ${report.counts.NOT_COVERED} not covered; ${report.counts.PENDING} pending.\n`);
  io.stdout.write(`${report.captureCount} captures; ${report.reviewCandidates} review candidates; ${report.supplementalViewportCaptures} captures outside target viewport dimensions.\n`);
  return report.failureCaptures || (strict && !report.complete) ? 1 : 0;
}

module.exports = { validateRecord, summarize, run };
if (require.main === module) process.exitCode = run(process.argv.slice(2));
