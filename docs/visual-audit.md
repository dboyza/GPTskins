# Live visual audit

Status: in progress, 2026-09-07.
Tested the real signed-in ChatGPT website in visible Chrome at 1800 x 987 CSS pixels.
The black-box inheritance fix has been verified after an extension reload.
The final citation, settings-control, and pricing-card fixes pass the browser fixture but still need an extension reload and live verification.

## Reproduced regressions and prepared fixes

| Surface | Live evidence | Local change |
| --- | --- | --- |
| Work home | OG and Ayu Light app suggestions retained a black rectangle; the composer toolbar retained dark paint. | Override native tokens on `html` and `body`, then restore `--main-surface-primary` inheritance where native dark mode resets every descendant. |
| Chat/Work switch | Ayu Light retains a black track and dark selected segment. | Target the switch's own data attributes and painted track. |
| Native controls | Ayu Light computes `color-scheme: dark` from an inline root declaration. | Give the selected theme's color scheme precedence. |
| Disabled Send | Ayu Light uses a translucent white button and white icon at 0.35 opacity. | Use theme surface and muted text for the disabled state. |
| Library | Ayu Light header remains black. | Correct the native surface-token inheritance boundary. |
| Citation chips | Native chips retain `#303030` backgrounds in Ayu Light because layered important utilities beat unlayered rules. | Theme the exact citation-pill hook inside the native `utilities` layer. |
| Secondary text | Ayu Light sidebar labels and settings help are too faint. | Improve failing text tokens in 11 palettes; retain palette hues. |
| CodeMirror syntax | Yellow syntax renders `rgb(249, 220, 120)` on Ayu Light's pale code background. | Derive readable syntax hues and scope native color-token overrides to message editors. |
| Popup feedback | Theme and font changes apply, but the popup reports a refresh warning. | Acknowledge successful runtime messages. |
| Settings switches | Ayu Light checked tracks are pale orange with white thumbs and inadequate contrast. | Derive a checked track with at least 3:1 contrast; preserve native thumb geometry. |
| Voice and chart indicators | Every voice dot has the same muted paint and 0.45 opacity; chart legend dots are also recolored. | Restrict size-based rules to radio buttons and honor `aria-checked`. |
| Highlighted pricing card | Pro retains a dark blue gradient beneath dark themed text in Ayu Light. | Theme the highlighted card's gradient and outline through its pricing data attributes. |

## Coverage so far

- All 34 custom themes: selected through the installed extension popup on actual Work home; computed panel/background colors and browser color scheme match each palette.
- Default: live switch removes the injected theme stylesheet and root marker, restoring native appearance.
- Screenshots inspected for OG, Ayu Light, Catppuccin Latte, Forest, Gruvbox Light, Rose, Tokyo Day, Dracula, Lobster, Matrix, Nord, Temple, and Default.
- Ayu Light: Work home, profile menu, General and Voice settings, Library and its filters, Projects and New Project dialog, conversation text, links, citations, code cards, and composer controls.
- Additional Ayu Light inspection: Notifications, Personalization, Usage, Analytics, Cloud browser, Storage, and pricing.
- Live reload verification: Work suggestion rectangle, Library header, Chat/Work track, disabled Send, native color scheme, readable CodeMirror yellow, and successful theme popup feedback.
- Verdana: live application and existing CodeMirror layout; restored Default font afterward.
- Code cards inspected had rounded frames and accessible code content at the desktop width tested.
- Automated checks cover 578 palette text/background pairs, 714 syntax-color/background pairs, and 340 switch contrast pairs across 34 custom themes.
- The runtime-message test reproduces the missing acknowledgment and verifies the fix.
- The browser fixture passed 1,948 computed-style, geometry, acknowledgment, and cleanup checks across all 35 themes plus a final return to Default.

## Repeatable regression checks

Run `node --test tests/*.test.js` and `node --check content/content.js`.
Serve the repository with `python3 -m http.server 8765 --bind 127.0.0.1`, open `http://127.0.0.1:8765/tests/fixtures/theme-surfaces.html` in Chrome, and click **Run all themes**.
The fixture loads the actual shared palette and content script with a minimal extension messaging shim.
It captures native descendant token resets, layered important citations, local popover tokens, mode controls, disabled Send, CodeMirror syntax, settings switches, voice radios, unrelated legend dots, and pricing gradients.

## Remaining verification

Reload the unpacked extension and refresh ChatGPT to verify final citation paint, switch contrast, voice selection, chart legends, and highlighted pricing cards on the exact live elements.
Broader coverage remains for responsive layouts, remaining settings and menus, writing blocks, long code overflow, tables, streaming, and the full cross-product of themes and site surfaces.
The automated color checks do not establish whole-site visual correctness.
No claim of complete pixel-level coverage has been made.
