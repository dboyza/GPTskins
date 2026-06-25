# Codex Agent Notes

## Project
- GPTskins is a dependency-free Manifest V3 extension for theming ChatGPT.
- Keep changes surgical. Prefer one targeted selector or tag over broad CSS guesses.
- No build step. Validate content script syntax with `node --check content/content.js`.

## ChatGPT Theming Gotchas
- When screenshots and headless Chrome disagree, use the visible Chrome window with remote debugging and inspect computed styles from the live DOM.
- ChatGPT markup changes often. Prefer stable hooks like `data-testid`, `role`, `aria-*`, and our `data-chatskin-*` tags over brittle Tailwind class chains.
- After content script edits, reload the unpacked extension and refresh ChatGPT before judging visuals.

## Known Surfaces
- Code blocks are nested inside `pre`; the visible frame may be a parent wrapper. Use `syncSurfaceTags()` and the `data-chatskin-code-frame`, `data-chatskin-code-block`, `data-chatskin-code-header`, and `data-chatskin-code-body` attributes instead of piling on more generic code selectors.
- Never let headings/paragraphs/hr become `data-chatskin-code-header`. Theme switches can leave stale tags, so `syncSurfaceTags()` must strip that attribute from `h1`-`h6`, `p`, and `hr`.
- Code body/draft snippets need horizontal scrolling. Do not leave every code wrapper on `overflow: hidden`; ensure `data-chatskin-code-body` keeps `overflow-x: auto`.
- Newer ChatGPT code blocks may put the whole rounded code card as the first child inside `pre`. In that case the outer `pre` is only a transparent frame; tag the inner rounded card/header/body instead or the theme paints a square rectangle behind it.
- Code block headers can have a sticky wrapper plus an inner `bg-token-bg-elevated-secondary` flex row. Round the inner painted row too; otherwise the word `Python` sits on a square strip.
- If an early header patch does not work, check later broad token rules like `pre [class*="bg-token-bg-elevated-secondary"]`; later rules must carry the same radius/overflow or they win the cascade.
- The desired shape is the whole code card, not just the header/body. For `pre.overflow-visible.px-0` blocks, round the inner `border-token-border-light ... rounded` / `overflow-clip ... rounded` card itself.
- If the rounded card is nested below a wrapper inside `pre`, make the outer `pre.overflow-visible.px-0:has(...)` transparent; otherwise it paints a square rectangle behind the rounded card.
- For normal code snippets, only the real `pre` should get `data-chatskin-code-body`. Parent wrappers should use `data-chatskin-code-body-shell` so they clip/clear backgrounds without drawing a second rectangular border around the rounded snippet.
- Some draft/code examples are CodeMirror, not plain `pre`. The scroll owner is `.cm-scroller`; use forced horizontal `scroll`, not `auto`, when the visible scrollbar affordance matters. Never tag `.cm-editor` internals as GPTskins code blocks. The shell can be `.pe-11.pt-3` inside an `overflow-clip` elevated surface.
- CodeMirror email/message snippets should not draw their own inner rounded border. Keep `.cm-editor`, `.cm-scroller`, and `.cm-content` transparent, borderless, radiusless, and outline-free; the outer shell owns the shape.
- If CodeMirror still shows an inner line, hide the `.pe-11.pt-3 .cm-editor[class*="cm-"]` `border-color` and `outline-color`; do not change snippet layout.
- Markdown tables need explicit primary text, opaque header/cell descendants, and a stronger border mix. Light themes can leave table headers, copy icons, and row dividers on near-white ChatGPT token colors.
- Recharts axes and grid lines are SVG attributes/classes, not normal text tokens. Set `.recharts-text`/axis tick `fill` plus grid/axis `stroke` for light theme contrast.
- Writing/edit blocks use `data-testid="writing-block-container"`, `data-testid="writing-block-header-surface"`, `.writing-block-editor`, `.ProseMirror`, and `[contenteditable="true"]`.
- The global `[contenteditable="true"]` composer rule can accidentally recolor writing/edit blocks. Put writing-block overrides later and make the outer and inner surfaces the same color.
- The writing-block Edit button uses `data-testid="writing-block-header-magic-edit-button"` and can keep a dark token background in light themes. Set its background, text, border, icon, and hover colors explicitly.
- The upgrade-plan black bar can be `.thread-bottom-container::after`, not a real div. Keep thread-bottom pseudo-elements transparent for all themed pages; use `data-chatskin-plan-layer` only as a fallback and do not exclude `[role="dialog"]` because the plan page itself is dialog-like.
- Settings and voice UI live under `[role="dialog"]` or `[aria-modal="true"]`; switches and carousel dots need explicit contrast checks in light and dark themes.
- Sidebar `Pinned`/`Recents` headers should not get hover pills. Keep section-header controls and `data-trailing-button` / `__menu-item-trailing-btn` icon actions transparent; include `[class*="sidebar"]` because the live sidebar may not be a `nav`/`aside`.
- Keep the sidebar trailing-button transparent rule after the generic `main :is(button, a, [role="button"]):hover` rule, otherwise the later main hover rule repaints the square.
- If `data-trailing-button` computes transparent but the hover square remains, clear the direct flex wrapper `:has(> [data-trailing-button])` and trailing-button pseudo-elements too.
- ChatGPT's live Recents/Pinned header class is `sidebar-expando-section-header` with the "o"; `sidebar-expand-section-header` does not match it.
- Do not use broad `[class*="sidebar"]` in rules that paint backgrounds. ChatGPT uses classes like `group/sidebar-expando-section-header`, and broad paint selectors create the fake hover square.
- Settings sidebar rows are dialog buttons/tabs. Keep default dialog buttons transparent and style only hover/active states, otherwise OG makes every sidebar row look selected and bubbly.

## Verification
- For visual fixes, verify computed styles on the exact live element, not just screenshots.
- Button color probes may need a short wait because ChatGPT uses transition classes; immediate computed styles can show the old color.
- Minimum checks before committing: `node --check content/content.js` and `git -c safe.directory=C:/Users/Dylan/Documents/extension diff --check`.
- Commit finished work; do not push unless Dylan asks.
