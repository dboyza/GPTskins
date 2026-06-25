# Codex Agent Notes

## Project
- ChatSkin is a dependency-free Manifest V3 extension for theming ChatGPT.
- Keep changes surgical. Prefer one targeted selector or tag over broad CSS guesses.
- No build step. Validate content script syntax with `node --check content/content.js`.

## ChatGPT Theming Gotchas
- When screenshots and headless Chrome disagree, use the visible Chrome window with remote debugging and inspect computed styles from the live DOM.
- ChatGPT markup changes often. Prefer stable hooks like `data-testid`, `role`, `aria-*`, and our `data-chatskin-*` tags over brittle Tailwind class chains.
- After content script edits, reload the unpacked extension and refresh ChatGPT before judging visuals.

## Known Surfaces
- Code blocks are nested inside `pre`; the visible frame may be a parent wrapper. Use `syncSurfaceTags()` and the `data-chatskin-code-frame`, `data-chatskin-code-block`, `data-chatskin-code-header`, and `data-chatskin-code-body` attributes instead of piling on more generic code selectors.
- Writing/edit blocks use `data-testid="writing-block-container"`, `data-testid="writing-block-header-surface"`, `.writing-block-editor`, `.ProseMirror`, and `[contenteditable="true"]`.
- The global `[contenteditable="true"]` composer rule can accidentally recolor writing/edit blocks. Put writing-block overrides later and make the outer and inner surfaces the same color.
- The upgrade-plan black bar is a large lower-page black/gradient layer. Keep the `data-chatskin-plan-layer` marker path working rather than theming every black div globally.
- Settings and voice UI live under `[role="dialog"]` or `[aria-modal="true"]`; switches and carousel dots need explicit contrast checks in light and dark themes.

## Verification
- For visual fixes, verify computed styles on the exact live element, not just screenshots.
- Minimum checks before committing: `node --check content/content.js` and `git -c safe.directory=C:/Users/Dylan/Documents/extension diff --check`.
- Commit finished work; do not push unless Dylan asks.
