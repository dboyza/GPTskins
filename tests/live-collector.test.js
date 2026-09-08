const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { collectGPTskinsAudit } = require('./live/collect.js');
const manifest = require('./live/surfaces.json');

function capture({ theme = 'ayu-light', stylesheet = true, nodes = [], overrides = {} } = {}) {
  const baseCSS = {
    display: 'block', visibility: 'visible', opacity: '1', backgroundImage: 'none',
    backgroundColor: 'rgb(250, 250, 250)', color: 'rgb(40, 40, 40)',
    filter: 'none', mixBlendMode: 'normal', fontSize: '16px', fontWeight: '400',
    content: 'none', colorScheme: 'light', ...overrides
  };
  const root = { getAttribute: name => name === 'data-gptskins-theme' ? theme : null };
  const elements = nodes.map(node => ({
    tagName: 'DIV', clientWidth: 120, scrollWidth: 120, clientHeight: 30, scrollHeight: 30,
    parentElement: null,
    childNodes: node.text === false ? [] : [{ nodeType: 3, textContent: 'PRIVATE_MESSAGE_do_not_export' }],
    getBoundingClientRect: () => ({ x: 0, y: 0, top: 0, left: 0, right: 120, bottom: 30, width: 120, height: 30, ...node.bounds }),
    getAttribute: name => node.attributes?.[name] ?? 'PRIVATE_ATTRIBUTE_do_not_export',
    matches: selector => selector === ':disabled' && Boolean(node.disabled),
    ...node
  }));
  const doc = {
    documentElement: root,
    getElementById: id => id === 'gptskins-style' && stylesheet ? { textContent: 'PRIVATE_SOURCE_do_not_export' } : null,
    querySelectorAll: selector => selector === 'body' ? elements : [],
    title: 'PRIVATE_TITLE_do_not_export', URL: 'https://chatgpt.com/c/PRIVATE_URL_do_not_export'
  };
  const context = {
    document: doc,
    window: { innerWidth: 1440, innerHeight: 1000, devicePixelRatio: 2 },
    getComputedStyle: (element, pseudo) => ({ ...baseCSS, ...element.css, ...(pseudo ? { content: '"PRIVATE_PSEUDO_do_not_export"' } : {}), getPropertyValue: name => name === '--gptskins-background' ? '#fafafa' : '' })
  };
  return vm.runInNewContext(`(${collectGPTskinsAudit.toString()})(${JSON.stringify({ maxSamples: 2 })})`, context);
}

test('collector is standalone and leaves absent surfaces explicitly not covered', () => {
  const report = capture();
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.theme.id, 'ayu-light');
  assert.equal(report.coverage.observed.length, 0);
  assert.equal(report.coverage.notCovered.length, report.surfaces.length);
  assert.equal(report.findings.length, 0);
  assert.match(report.theme.stylesheet.fingerprint, /^fnv1a32:[a-f0-9]{8}$/);
});

test('every coverage scenario references a collector surface and has inspection checks', () => {
  const ids = new Set(capture().surfaces.map(surface => surface.id));
  assert.equal(new Set(manifest.scenarios.map(scenario => scenario.id)).size, manifest.scenarios.length);
  for (const scenario of manifest.scenarios) {
    assert.ok(scenario.checks.length > 0, scenario.id);
    for (const required of scenario.required) assert.ok(ids.has(required), `${scenario.id}: ${required}`);
  }
});

test('reports Default stylesheet residue and missing custom stylesheet', () => {
  assert.equal(capture({ theme: null }).findings[0].code, 'default-stylesheet');
  assert.equal(capture({ stylesheet: false }).findings[0].code, 'missing-stylesheet');
  const native = capture({ theme: null, stylesheet: false });
  assert.equal(native.findings.length, 0);
  assert.equal(native.theme.stylesheet.fingerprint, null);
});

test('exports paint evidence without private content or CSS image URLs', () => {
  const report = capture({ nodes: [{ css: { backgroundImage: 'url("https://private.example/image?secret=123")' } }] });
  const serialized = JSON.stringify(report);
  assert.doesNotMatch(serialized, /PRIVATE_|private\.example|secret=123/);
  assert.match(serialized, /url\(\[redacted\]\)/);
  assert.equal(report.surfaces[0].samples[0].pseudo['::before'].generated, true);
});

test('CSS URL redaction consumes quoted parentheses and escaped quotes completely', () => {
  const backgrounds = [
    'url("https://private.example/image(foo)?token=PRIVATE_SUFFIX")',
    String.raw`url("https://private.example/image(\"quoted\")?token=PRIVATE_SUFFIX")`,
    String.raw`url('https://private.example/image(\'quoted\')?token=PRIVATE_SUFFIX')`,
    String.raw`url(https://private.example/image\(foo\)?token=PRIVATE_SUFFIX)`
  ];
  for (const backgroundImage of backgrounds) {
    const report = capture({ nodes: [{ css: { backgroundImage } }] });
    assert.equal(report.surfaces[0].samples[0].css.backgroundImage, 'url([redacted])');
    assert.doesNotMatch(JSON.stringify(report), /PRIVATE_|private\.example|token=/);
  }
  const multiple = capture({ nodes: [{ css: { backgroundImage: `${backgrounds[0]}, linear-gradient(red, blue), ${backgrounds[1]}` } }] });
  assert.equal(multiple.surfaces[0].samples[0].css.backgroundImage, 'url([redacted]), linear-gradient(red, blue), url([redacted])');
});

test('text contrast finds actual low contrast and marks gradient checks inconclusive', () => {
  const report = capture({ nodes: [{ css: { color: 'rgb(200, 200, 200)' } }, { css: { backgroundImage: 'linear-gradient(red, blue)' } }] });
  assert.equal(report.surfaces[0].samples[0].textContrast.status, 'REVIEW');
  assert.equal(report.surfaces[0].samples[1].textContrast.status, 'NOT_ASSESSED');
  assert.equal(report.findings.filter(finding => finding.code === 'text-contrast').length, 1);
});


test('ancestor opacity makes text contrast inconclusive even over an opaque child', () => {
  const report = capture({ nodes: [{ parentElement: { css: { opacity: '0.5' }, parentElement: null } }] });
  assert.equal(report.surfaces[0].samples[0].textContrast.status, 'NOT_ASSESSED');
});

test('SVG paint is recorded without pretending its CSS color is its text fill', () => {
  const report = capture({ nodes: [{ namespaceURI: 'http://www.w3.org/2000/svg', css: { color: 'rgb(250, 250, 250)', fill: 'rgb(40, 40, 40)' } }] });
  assert.equal(report.surfaces[0].samples[0].textContrast.status, 'NOT_ASSESSED');
  assert.equal(report.surfaces[0].samples[0].css.fill, 'rgb(40, 40, 40)');
});

test('disabled text and transparent text colors are not asserted as normal text', () => {
  const report = capture({ nodes: [{ disabled: true, css: { color: 'rgb(200, 200, 200)' } }, { css: { color: 'rgba(40, 40, 40, 0.2)' } }] });
  assert.equal(report.findings.filter(finding => finding.code === 'text-contrast').length, 0);
});

test('near-black paint is a review candidate in light custom themes only', () => {
  const nodes = [{ text: false, css: { backgroundColor: 'rgb(0, 0, 0)' } }];
  assert.equal(capture({ nodes }).findings[0].code, 'dark-surface-on-light-theme');
  assert.equal(capture({ theme: null, stylesheet: false, nodes }).findings.length, 0);
});

test('bounds, hidden elements and sample limits are reflected in coverage', () => {
  const report = capture({ nodes: [{}, {}, {}, { css: { display: 'none' } }, { bounds: { top: 1100, bottom: 1130 } }] });
  assert.equal(report.surfaces[0].matched, 5);
  assert.equal(report.surfaces[0].visible, 3);
  assert.equal(report.surfaces[0].samples.length, 2);
  assert.equal(report.surfaces[0].truncated, true);
  assert.equal(report.coverage.truncated[0], 'page');
});

test('collector source has no automatic execution or external I/O', () => {
  const source = fs.readFileSync(path.join(__dirname, 'live/collect.js'), 'utf8');
  assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|localStorage|sessionStorage|chrome|sendBeacon)\s*[.(]/);
  assert.doesNotMatch(source, /\.(click|appendChild|setAttribute|remove|navigate)\s*\(/);
});
