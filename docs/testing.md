# Regression testing

Use this suite after a ChatGPT update, before shipping a theme change, and whenever a visual defect is reported.
The extension has no runtime dependencies or build step; Node.js and Playwright are development tools only.

## First run

Install Node.js 22 or newer, then run:

```sh
npm ci
npx playwright install chromium
npm test
```

The suite starts and stops its own localhost server and uses isolated Chromium sessions.
It does not connect to your signed-in Chrome profile or alter your installed extension.
Tests use synthetic content, not saved conversations or account data.
On Linux, install browser system libraries with `npx playwright install --with-deps chromium`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Syntax, unit, browser behavior, and unpacked-extension integration checks |
| `npm run test:full` | Everything above plus screenshot comparisons against reviewed baselines |
| `npm run test:unit` | Fast manifest, palette, syntax, control contrast, messaging, and live-report checks |
| `npm run test:browser` | All captured surfaces and behavioral tests at desktop, tablet, and mobile sizes |
| `npm run test:extension` | Load a temporary unpacked extension and exercise real Chrome storage and content injection |
| `npm run test:headed` | Watch the local browser tests |
| `npm run test:ui` | Interactive test selection and debugging |
| `npm run test:report` | Open the latest browser HTML report |
| `npm run test:visual` | Compare screenshots without accepting changes |
| `npm run test:visual:update` | Deliberately create or replace screenshot baselines |
| `npm run test:visual:report` | Open screenshot failures and differences |
| `npm run test:serve` | Open fixtures manually at `http://127.0.0.1:8766` |
| `npm run test:live-report -- --strict artifacts/live/RUN/*.json` | Summarize live captures and fail on missing coverage or failed review |

To reproduce one case quickly:

```sh
npm run test:browser -- --project=mobile --grep ayu-light
npm run test:browser -- tests/browser/popup.spec.js --project=desktop
npm run test:visual -- --project=desktop --grep 'ayu-light'
```

Tests have zero automatic retries so flaky behavior stays visible.
Use `--repeat-each=3` when investigating suspected flakiness.
Set `GPTSKINS_TEST_PORT` if another service occupies port 8766.

## Coverage

The catalog drives the theme and font loops, so adding a theme automatically expands the matrix.
Browser projects use 1440 × 1000, 834 × 1112, and 390 × 844 CSS pixels.

| Area | Assertions |
| --- | --- |
| Manifest and packaging | Referenced files exist, MV3, document-start injection, host permissions and script order |
| Palettes | Text and syntax contrast, switch-track contrast, valid IDs, dark/light classification and fallback |
| Popup | Every theme/font, light/dark filters, search and empty states, pressed states, keyboard selection, saved choices, fixed controls while scrolling, logo loading, success and error feedback |
| Runtime | Startup before body, every theme/font combination, storage changes/removals, message acknowledgment, independent cleanup, repeated switching, preserved scroll |
| Navigation | Marketing bypass routes, app routes, trailing slash/query/hash, back/forward, retained selections and legacy hostname |
| Surface inheritance | Native dark descendant resets, body tokens, local popover tokens, layered important rules |
| Composer | Chat/Work track, disabled Send, enabled account accent, suggestions and dynamically discovered layers |
| Sidebar and menus | Section headers, trailing controls and pseudo-elements, account state, icon stroke, hover/focus, transparent portal wrappers and rounded menus |
| Messages | Plain code, nested rounded cards, transparent shells, CodeMirror borders and horizontal scrolling, stale header tags, dynamic insertion |
| Rich content | Writing/edit surfaces, markdown tables and icons, chart labels/grid and preserved legend colors |
| Settings and pricing | Switch state/geometry, selected voice dot, highlighted pricing gradient, enabled/disabled pricing actions |
| Default | Native surfaces restored, injected styles/tags removed, independent font reset |
| Live audit tooling | Read-only collection, redaction, missing/partial coverage, schema validation and strict reporting |

Browser API mocks are used for deterministic error handling and fast exhaustive loops.
The separate extension test covers actual extension loading, storage, and content-script injection in a temporary profile.
Its temporary manifest gets only a test key so the popup URL is deterministic; production files remain unchanged.

## Screenshot baselines

Screenshot comparisons cover every theme in both captured surface galleries and the pricing scene at all three sizes, plus the popup panels.
Baselines are separated by operating system and viewport because font rendering differs across platforms.
The checked-in initial baselines were generated on macOS using the pinned Playwright Chromium version.
On another platform, generate its baseline set once and review it before relying on comparisons.
Missing baselines fail normal comparison runs instead of silently passing.

To accept an intentional appearance change:

1. Reproduce and understand the difference before updating anything.
2. Run the functional suite and inspect the affected fixture in headed mode.
3. Generate only the relevant candidate baselines with `npm run test:visual:update -- --project=desktop --grep 'ayu-light'`.
4. Review the changed PNGs and commit only the intended changes.
5. Run `npm run test:visual` again without update mode to prove the comparisons are stable.

Do not fix a red screenshot test by blindly replacing its baseline.
Fixture baselines document the extension's supported rendering contracts; they are not screenshots of the entire live ChatGPT site.

## After a ChatGPT update

1. Run `npm test` to check the existing contracts and open the HTML report.
2. Reproduce the reported issue on the actual signed-in site using the installed extension.
3. Follow [the live audit workflow](live-audit.md) to capture the affected surface, its native Default appearance, exact computed paint, theme, viewport, and stylesheet fingerprint.
4. Inspect the exact element and its ancestors/pseudo-elements to find the paint owner and CSS rule priority.
5. Reduce the new markup into a synthetic fixture with generic text and no account identifiers, URLs, or private content.
6. Add an assertion that fails with the existing extension, then make the smallest production fix.
7. Run `npm run test:full`, reload the unpacked extension, refresh ChatGPT, and verify the original live element again.
8. Update the live coverage report and commit the fix, assertion, and any reviewed baseline changes together.

The [scenario manifest](../tests/live/surfaces.json) tracks the live pages, dialogs, interaction states, and viewport/theme matrix.
The collector marks missing or offscreen elements `NOT_COVERED`; observation alone is never a visual pass.
New ChatGPT markup can escape old fixtures, so a green local suite must be paired with live reproduction after upstream changes.

## Reports and CI

`artifacts/report/` contains the browser HTML report, attached gallery screenshots, and computed-style results.
`artifacts/results.json` is machine-readable; failures retain screenshots, video, and Playwright traces.
`artifacts/visual-report/` contains expected, actual, and difference images for screenshot failures.
The unpacked-extension report is in `artifacts/extension-report/` and can be opened with `npx playwright show-report artifacts/extension-report`.
Live reports belong under `artifacts/live/` and are ignored by Git.

GitHub Actions runs the portable functional and extension suites on pushes, pull requests, and manual dispatch, and retains reports for 14 days.
Screenshot baseline comparison remains an explicit platform-specific command rather than comparing Linux screenshots against macOS references.
The browser matrix exercises the Chromium rendering engine used by Chrome and Edge; it does not claim separate branded-browser certification.

## Test structure

- `tests/*.test.js`: Node checks with no browser.
- `tests/browser/`: exhaustive browser behavior and computed styles.
- `tests/fixtures/`: sanitized examples of supported ChatGPT structures and cascade regressions.
- `tests/helpers/`: explicit Chrome API mocks and browser error/network guards.
- `tests/extension/`: actual unpacked extension integration.
- `tests/visual/`: screenshot comparisons and reviewed platform baselines.
- `tests/live/`: read-only collector, scenario manifest, and coverage reporter.

Keep fixture selectors aligned with observed ChatGPT hooks.
Assert observable behavior, paint, geometry, and cleanup rather than source-text fragments or arbitrary assertion counts.
Preserve unknown live markup as an explicit coverage gap until it has been reproduced and captured.

Playwright's official [configuration](https://playwright.dev/docs/test-configuration), [visual comparison](https://playwright.dev/docs/test-snapshots), and [extension testing](https://playwright.dev/docs/chrome-extensions) documentation describes the underlying runner behavior.
