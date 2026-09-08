# Auditing the current ChatGPT website

The local browser suite protects captured markup against regressions in GPTskins.
This live audit checks whether ChatGPT has introduced markup or cascade rules that those fixtures do not yet represent.
Neither a passing fixture suite nor one clean screenshot proves coverage of every live page.

## Capture an issue

1. Reload the unpacked GPTskins extension after source changes, then refresh ChatGPT.
2. Reproduce the issue on the real site and leave the affected panel open.
3. Note the theme, native ChatGPT appearance, viewport, font, interaction state, and reproduction steps.
4. Paste [the collector](../tests/live/collect.js) into browser DevTools Console, then run `const audit = collectGPTskinsAudit()`.
5. Inspect `audit.findings` and `audit.coverage`, then export with `copy(JSON.stringify(audit, null, 2))` and save it under `artifacts/live/`.

Chrome's `copy()` console helper copies the report to your clipboard.
The collector itself only reads DOM structure and computed styles.
It does not navigate, change the page, read extension storage, send requests, or alter account settings.
A computer-use agent can evaluate the same self-contained function through its supported read-only DOM API.

The report excludes page URLs, titles, message text, input values, accessible names, and arbitrary attributes.
It redacts CSS image URLs and includes a noncryptographic stylesheet fingerprint instead of stylesheet source.
It still contains theme preferences, viewport dimensions, and the types of controls visible on screen.
Review the JSON before sharing it.
Screenshots and DevTools HTML copies can contain private conversation or account information; sanitize those separately.
Do not commit private captures or an authenticated browser profile.

## Interpret the report

`schemaVersion` identifies the report format.
`theme` includes the selected theme, computed palette tokens, native color scheme, font, and injected stylesheet fingerprint.
`viewport` records CSS pixel dimensions and device scale.
`surfaces` records the fixed selector, visible sample index, geometry, computed paint, relevant native tokens, overflow dimensions, control state, and pseudo-element paint.
`coverage` distinguishes observed surfaces, surfaces not currently visible, unsupported selectors, and truncated samples.
The default cap is 25 samples per surface; use `collectGPTskinsAudit({ maxSamples: 100 })` if needed.

`OBSERVED` means sampled, not visually correct.
`NOT_COVERED` means no matching rendered element intersected the current viewport.
A renamed selector and a closed panel both produce `NOT_COVERED`, so compare with the surface that is visibly open.
Scroll and collect again to inspect content outside the viewport.
The collector cannot infer whether a hover, focus, or open state was actually exercised across a whole feature.

`failure` findings identify concrete extension lifecycle violations, such as a stylesheet left behind in Default.
`review` findings identify possible low text contrast or near-black paint inside a light custom theme.
Black accents, intentional code colors, imagery, and disabled controls can be legitimate.
Contrast checks only apply to direct text with supported opaque foreground and compositable backgrounds.
Images, gradients, filters, blending, unsupported color formats, and missing opaque ancestors make those contrast checks inconclusive.
Pseudo-element paint is recorded for inspection but is not included in text contrast compositing.
A passing contrast estimate cannot replace checking the rendered element.

## Run an update audit

Use [the coverage manifest](../tests/live/surfaces.json) as the checklist.
Record one row per theme, viewport, scenario, and interaction state in your audit notes, with `PASS`, `FAIL`, or `NOT_COVERED` and a report filename.
A `PASS` requires visual inspection and the relevant computed-style checks, not simply an empty findings array.
Use the current theme IDs from `shared/themes.js`; do not maintain a separate hardcoded theme count.

Start with the newly broken surface in a light theme, a dark theme, and Default.
Run every custom theme on the corrected surface, then complete the broader manifest to detect unrelated website changes.
Test Default against both native appearances and include theme switching with an open menu or dialog.
Check desktop, compact desktop, narrow viewport, keyboard focus, scroll states, and 200 percent zoom.
Restore the user's theme, font, appearance, and open state after testing.

Use an existing test conversation or a dedicated QA conversation.
A useful sample contains headings, lists, a long code line, a Markdown table, a writing block, citations, and a chart when available.
The collector never creates or submits a conversation.
Account-gated features, unavailable UI, microphone use, purchases, subscription changes, destructive actions, and external sharing are not prerequisites for a visual pass.
Mark inaccessible scenarios `NOT_COVERED` and record the reason.

## Summarize a full audit

Save each capture with explicit scenario and review metadata rather than treating observed elements as a pass.
For example, after visually checking every Work home checklist item and examining the collector's review findings, export this wrapper from the Console:

```js
copy(JSON.stringify({
  scenario: "work-home",
  review: "PASS",
  audit: collectGPTskinsAudit()
}, null, 2))
```

Use `PENDING` when you have collected evidence but have not finished visual review.
Use `FAIL` for a reproduced defect and `NOT_COVERED` for an unavailable or incomplete scenario.
`PASS` attests that you inspected the scenario's checklist, including relevant interaction states and any candidate findings.
Default captures also require `nativeAppearance: "light"` or `nativeAppearance: "dark"` in the wrapper.
Both native appearances are required for a passing Default matrix cell.

Save wrappers as separate JSON files in a new `artifacts/live/<run>/` directory for each website update or verification run.
The report intentionally keeps any failure in the selected input set, even when another capture passes.
After fixing an issue, collect a fresh verification run instead of deleting evidence from the original run.

```sh
node tests/live/report.js --output artifacts/live-summary.json artifacts/live/<run>/*.json
node tests/live/report.js --strict --output artifacts/live-summary.json artifacts/live/<run>/*.json
```

Replace `<run>` with your audit directory name.
The CLI produces the full current-theme by target-viewport by scenario matrix, with `PASS`, `FAIL`, `NOT_COVERED`, or `PENDING` in each cell.
A review marked `PASS` cannot pass a cell when required surfaces are absent, have selector errors, or have truncated evidence.
Viewport sizes must match the manifest exactly to fill a target cell; captures at other sizes remain supplemental evidence.
Device scale is retained in the original capture but does not add a separate matrix dimension.
The summary retains only validated metadata and counts, excluding freeform notes, CSS evidence, input filenames, and finding descriptions.

The normal command exits `1` for any failed capture and `2` for invalid input or output errors.
It exits `0` for an incomplete audit without failures while clearly printing `INCOMPLETE`.
`--strict` also exits `1` when any matrix cell is pending or not covered, making it suitable as an explicit full-audit gate.
The strict gate does not treat unavailable account features as passed.
Keep their `NOT_COVERED` status visible and decide whether that limitation is acceptable outside the automated result.

## Turn a live issue into a regression

1. Capture the broken live surface and inspect the exact painted element, its ancestors, and `::before` and `::after`.
2. Identify the winning native declaration, cascade layer, selector, inherited token, or layout owner.
3. Reduce the DOM and native CSS to a minimal example in `tests/fixtures/`, replacing all user text, links, identifiers, and account data with synthetic content.
4. Preserve the native cascade layer, `!important`, dark-mode boundary, nesting, and inline style that caused the failure.
5. Add a browser assertion for the actual user-visible property or behavior, including Default cleanup and relevant interaction states.
6. Demonstrate that the assertion fails before the production fix and passes afterward.
7. Run the automated suite across the theme matrix, then reload the extension and verify the corrected live element again.
8. Add newly discovered surface hooks to `tests/live/collect.js` and the matching scenario in `tests/live/surfaces.json`.

Prefer exact paint, contrast, geometry, overflow, and lifecycle assertions over checking for the presence of a CSS source string.
Use stable screenshot baselines for synthetic fixtures where a numeric assertion cannot describe the visual contract.
Review changed baselines rather than automatically accepting them after an upstream update.
Keep live-site evidence separate from synthetic fixture results in the audit report.
