# Live visual audit

Status: in progress, 2026-09-07.
Tested the real signed-in ChatGPT website in visible Chrome at 1800 x 987 CSS pixels.
The locally edited extension must be reloaded before its fixes can be verified.
A website refresh was attempted and confirmed to still load the old injected stylesheet.

## Reproduced regressions and prepared fixes

| Surface | Live evidence | Local change |
| --- | --- | --- |
| Work home | OG and Ayu Light app suggestions retain a black rectangle; the composer toolbar retains dark paint. | Override native surface tokens on `body`, where ChatGPT redefines them. |
| Chat/Work switch | Ayu Light retains a black track and dark selected segment. | Target the switch's own data attributes and painted track. |
| Native controls | Ayu Light computes `color-scheme: dark` from an inline root declaration. | Give the selected theme's color scheme precedence. |
| Disabled Send | Ayu Light uses a translucent white button and white icon at 0.35 opacity. | Use theme surface and muted text for the disabled state. |
| Library | Ayu Light header remains black. | Correct the native surface-token inheritance boundary. |
| Citation chips | Native chips retain `#303030` backgrounds in Ayu Light. | Theme the exact citation-pill hook. |
| Secondary text | Ayu Light sidebar labels and settings help are too faint. | Improve failing text tokens in 11 palettes; retain palette hues. |
| CodeMirror syntax | Yellow syntax renders `rgb(249, 220, 120)` on Ayu Light's pale code background. | Derive readable syntax hues and scope native color-token overrides to message editors. |
| Popup feedback | Theme and font changes apply, but the popup reports a refresh warning. | Acknowledge successful runtime messages. |

## Coverage so far

- OG: Work home and popup selection.
- Ayu Light: Work home, profile menu, General and Voice settings, Library and its filters, Projects and New Project dialog, conversation text, links, citations, code cards, and composer controls.
- Verdana: live application and existing CodeMirror layout; restored Default font afterward.
- Code cards inspected had rounded frames and accessible code content at the desktop width tested.
- Automated checks cover 578 palette text/background pairs and 714 syntax-color/background pairs across 34 custom themes.
- The runtime-message test reproduces the missing acknowledgment and verifies the fix.

## Remaining verification

Reload the unpacked extension, refresh ChatGPT, and verify the changed computed styles and visuals on the same elements.
Then finish every-theme switching and visual coverage, including Default cleanup, responsive layouts, pricing, remaining settings, menus, writing blocks, long code overflow, tables, and streaming.
The automated color checks do not establish whole-site visual correctness.
No claim of complete pixel-level coverage has been made.
