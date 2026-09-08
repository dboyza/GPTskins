const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { validateRecord, summarize, run } = require('./live/report.js');
const manifest = require('./live/surfaces.json');

function record({ scenario = 'work-home', theme = 'ayu-light', review = 'PENDING', nativeAppearance, findings = [], missing = [], truncated = [] } = {}) {
  const required = manifest.scenarios.find(item => item.id === scenario).required;
  const observed = required.filter(id => !missing.includes(id));
  return {
    scenario, review, nativeAppearance,
    audit: {
      schemaVersion: 1, collectedAt: '2026-09-07T12:00:00.000Z',
      theme: { id: theme }, viewport: { width: 1440, height: 1000, deviceScaleFactor: 1 },
      coverage: { observed, notCovered: missing, errors: [], truncated },
      surfaces: required.map(id => ({ id, status: missing.includes(id) ? 'NOT_COVERED' : 'OBSERVED', samples: missing.includes(id) ? [] : [{}] })), findings
    }
  };
}

function cell(report, theme = 'ayu-light') {
  return report.cells.find(item => item.theme === theme && item.viewport === 'desktop' && item.scenario === 'work-home');
}

test('observed surfaces never automatically count as a visual pass', () => {
  const report = summarize([record()]);
  assert.equal(cell(report).status, 'PENDING');
  assert.equal(report.counts.PASS, 0);
  assert.equal(report.complete, false);
  assert.equal(report.counts.PENDING, report.dimensions.cells);
});

test('explicit review passes only a fully covered scenario and leaves other cells pending', () => {
  const report = summarize([record({ review: 'PASS' })]);
  assert.equal(cell(report).status, 'PASS');
  assert.equal(report.counts.PASS, 1);
  assert.equal(report.counts.PENDING, report.dimensions.cells - 1);
  assert.equal(summarize([record({ review: 'PASS', missing: ['mode-track'] })]).counts.PASS, 0);
  assert.equal(validateRecord(record({ review: 'PASS', truncated: ['mode-option'] })).status, 'NOT_COVERED');
});

test('Default requires an inspected capture in both native appearances', () => {
  const light = record({ theme: 'default', nativeAppearance: 'light', review: 'PASS' });
  const dark = record({ theme: 'default', nativeAppearance: 'dark', review: 'PASS' });
  assert.equal(cell(summarize([light]), 'default').status, 'PENDING');
  assert.equal(cell(summarize([light, dark]), 'default').status, 'PASS');
  assert.throws(() => validateRecord(record({ theme: 'default' })), /nativeAppearance/);
});

test('failure evidence cannot be hidden by a later passing capture', () => {
  const failed = record({ review: 'PASS', findings: [{ severity: 'failure', code: 'missing-stylesheet' }] });
  const report = summarize([failed, record({ review: 'PASS' })]);
  assert.equal(cell(report).status, 'FAIL');
  assert.equal(report.failureCaptures, 1);
});

test('off-matrix dimensions are supplemental and never fill a target cell', () => {
  const capture = record({ review: 'PASS' });
  capture.audit.viewport.width = 1400;
  const report = summarize([capture]);
  assert.equal(report.counts.PASS, 0);
  assert.equal(report.supplementalViewportCaptures, 1);
});

test('rejects malformed schemas, missing metadata, and inconsistent evidence', () => {
  for (const mutate of [
    capture => { capture.audit.schemaVersion = 2; },
    capture => { capture.scenario = 'not-a-scenario'; },
    capture => { capture.review = undefined; },
    capture => { capture.audit.theme.id = 'unknown'; },
    capture => { capture.audit.collectedAt = 'yesterday'; },
    capture => { capture.audit.viewport.width = -1; },
    capture => { capture.audit.findings = {}; },
    capture => { capture.audit.findings = [{ severity: 'pass', code: 'x' }]; },
    capture => { capture.audit.surfaces[0].samples = []; },
    capture => { capture.audit.coverage.observed = []; }
  ]) {
    const capture = record(); mutate(capture);
    assert.throws(() => validateRecord(capture));
  }
});

test('summary omits freeform audit contents and records review candidates as counts', () => {
  const capture = record({ review: 'PASS', findings: [{ severity: 'review', code: 'contrast', reason: 'PRIVATE_MESSAGE' }] });
  capture.audit.privateNote = 'PRIVATE_ACCOUNT';
  capture.audit.surfaces[0].samples[0].url = 'PRIVATE_URL';
  const report = summarize([capture]);
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE_/);
  assert.equal(report.reviewCandidates, 1);
});

test('complete matrix requires every theme, target viewport, scenario and Default appearance', () => {
  const captures = [];
  for (const theme of globalThis.GPTskinsThemes.themes) for (const viewport of manifest.viewports) for (const scenario of manifest.scenarios) {
    for (const nativeAppearance of theme.id === 'default' ? ['light', 'dark'] : [undefined]) {
      const capture = record({ theme: theme.id, scenario: scenario.id, nativeAppearance, review: 'PASS' });
      capture.audit.viewport.width = viewport.width;
      capture.audit.viewport.height = viewport.height;
      captures.push(capture);
    }
  }
  const report = summarize(captures);
  assert.equal(report.complete, true);
  assert.equal(report.counts.PASS, report.dimensions.cells);
  captures.pop();
  assert.equal(summarize(captures).complete, false);
});

test('CLI writes a report and differentiates incomplete, strict, failure, and malformed results', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'gptskins-live-report-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'capture.json');
  const output = path.join(directory, 'summary.json');
  let stdout = '', stderr = '';
  const io = { stdout: { write: text => { stdout += text; } }, stderr: { write: text => { stderr += text; } } };
  fs.writeFileSync(input, JSON.stringify(record()));
  assert.equal(run(['--output', output, input], io), 0);
  assert.equal(JSON.parse(fs.readFileSync(output)).complete, false);
  assert.match(stdout, /INCOMPLETE/);
  assert.equal(run(['--strict', '--output', output, input], io), 1);
  fs.writeFileSync(input, JSON.stringify(record({ review: 'FAIL' })));
  assert.equal(run(['--output', output, input], io), 1);
  fs.writeFileSync(input, '{ PRIVATE_MALFORMED');
  assert.equal(run(['--output', output, input], io), 2);
  assert.doesNotMatch(stderr, /PRIVATE_|gptskins-live-report/);
});
