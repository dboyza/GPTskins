(function () {
  "use strict";

  const themeApi = globalThis.ThemeGPTThemes;
  const styleId = "themegpt-style";
  const root = document.documentElement;

  function isDefaultTheme(theme) {
    return !theme || theme.id === "default";
  }

  function cssVariables(theme) {
    return Object.entries(theme.colors)
      .filter((entry) => entry[1])
      .map(([key, value]) => `--themegpt-${key}: ${value};`)
      .join("\n");
  }

  function removeTheme() {
    root.removeAttribute("data-themegpt-theme");
    root.removeAttribute("data-chatskin-plan-page");
    clearSurfaceTags();
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  function ensureThemeStyle(theme) {
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.documentElement.appendChild(style);
    }

    style.textContent = `
html[data-themegpt-theme] {
${cssVariables(theme)}
  --main-surface-primary: var(--themegpt-background) !important;
  --main-surface-secondary: var(--themegpt-surface) !important;
  --main-surface-tertiary: var(--themegpt-surfaceStrong) !important;
  --sidebar-surface-primary: var(--themegpt-sidebar) !important;
  --sidebar-surface-secondary: var(--themegpt-sidebarHover) !important;
  --sidebar-surface-tertiary: var(--themegpt-sidebarHover) !important;
  --message-surface: var(--themegpt-assistantBubble) !important;
  --surface-hover: var(--themegpt-surfaceStrong) !important;
  --composer-surface: var(--themegpt-composer) !important;
  --composer-surface-primary: var(--themegpt-composer) !important;
  --composer-surface-secondary: var(--themegpt-surfaceStrong) !important;
  --code-block-bg: var(--themegpt-surfaceStrong) !important;
  --code-block-header: color-mix(in srgb, var(--themegpt-surfaceStrong) 82%, var(--themegpt-background)) !important;
  --code-block-border: var(--themegpt-border) !important;
  --text-primary: var(--themegpt-text) !important;
  --text-secondary: var(--themegpt-mutedText) !important;
  --text-tertiary: var(--themegpt-mutedText) !important;
  --border-light: var(--themegpt-border) !important;
  --border-medium: var(--themegpt-border) !important;
  --border-heavy: var(--themegpt-border) !important;
  --sharp-edge-bottom-shadow: none !important;
  color-scheme: ${["contrast", "midnight", "og"].includes(theme.id) ? "dark" : "light"};
}

html[data-themegpt-theme],
html[data-themegpt-theme] body,
html[data-themegpt-theme] #root,
html[data-themegpt-theme] main,
html[data-themegpt-theme] [role="main"] {
  background: var(--themegpt-background) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [class*="bg-token-main-surface-primary"],
html[data-themegpt-theme] [class*="bg-token-main-surface-secondary"],
html[data-themegpt-theme] [class*="bg-token-main-surface-tertiary"],
html[data-themegpt-theme] [class*="bg-token-message-surface"] {
  background-color: var(--themegpt-surface) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] header[class*="bg-token-main-surface-primary"],
html[data-themegpt-theme] header[class*="dark:bg-token-bg-secondary-surface"] {
  background-color: var(--themegpt-background) !important;
}

html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"])) {
  background: linear-gradient(
    to bottom,
    transparent 0,
    var(--themegpt-background) 34%,
    var(--themegpt-background) 100%
  ) !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"]))::before,
html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"]))::after {
  background: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [class*="thread-bottom-container"]::before,
html[data-themegpt-theme] [class*="thread-bottom-container"]::after {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

html[data-themegpt-theme][data-chatskin-plan-page="true"] [class*="thread-bottom-container"],
html[data-themegpt-theme][data-chatskin-plan-page="true"] [class*="thread-bottom-container"]::before,
html[data-themegpt-theme][data-chatskin-plan-page="true"] [class*="thread-bottom-container"]::after {
  background: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"])) [class*="bg-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"])) [class*="from-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"])) [class*="to-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"])) [class*="dark:bg-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"])) [class*="dark:from-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"]:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"])) [class*="dark:to-black"] {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] nav,
html[data-themegpt-theme] aside,
html[data-themegpt-theme] [class*="bg-token-sidebar"],
html[data-themegpt-theme] [id*="sidebar"],
html[data-themegpt-theme] [data-testid="history-panel"],
html[data-themegpt-theme] [data-testid="left-sidebar"] {
  --text-primary: var(--themegpt-sidebarText) !important;
  --text-secondary: var(--themegpt-sidebarMuted) !important;
  --text-tertiary: var(--themegpt-sidebarMuted) !important;
  --surface-hover: var(--themegpt-sidebarHover) !important;
  background-color: var(--themegpt-sidebar) !important;
  color: var(--themegpt-sidebarText) !important;
}

html[data-themegpt-theme] nav :is(a, button, [role="button"], span, p, div, h1, h2, h3, h4, h5, h6),
html[data-themegpt-theme] aside :is(a, button, [role="button"], span, p, div, h1, h2, h3, h4, h5, h6),
html[data-themegpt-theme] [data-testid="history-panel"] :is(a, button, [role="button"], span, p, div, h1, h2, h3, h4, h5, h6),
html[data-themegpt-theme] [data-testid="left-sidebar"] :is(a, button, [role="button"], span, p, div, h1, h2, h3, h4, h5, h6) {
  color: inherit !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] nav .text-token-text-secondary,
html[data-themegpt-theme] nav [class*="text-token-text-secondary"],
html[data-themegpt-theme] nav [class*="text-token-text-tertiary"],
html[data-themegpt-theme] aside .text-token-text-secondary,
html[data-themegpt-theme] aside [class*="text-token-text-secondary"],
html[data-themegpt-theme] aside [class*="text-token-text-tertiary"],
html[data-themegpt-theme] [data-testid="history-panel"] [class*="text-token-text-secondary"],
html[data-themegpt-theme] [data-testid="history-panel"] [class*="text-token-text-tertiary"],
html[data-themegpt-theme] [data-testid="left-sidebar"] [class*="text-token-text-secondary"],
html[data-themegpt-theme] [data-testid="left-sidebar"] [class*="text-token-text-tertiary"] {
  color: var(--themegpt-sidebarMuted) !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] nav :is(a, button, [role="button"]):hover,
html[data-themegpt-theme] aside :is(a, button, [role="button"]):hover,
html[data-themegpt-theme] [data-testid="history-panel"] :is(a, button, [role="button"]):hover,
html[data-themegpt-theme] [data-testid="left-sidebar"] :is(a, button, [role="button"]):hover {
  background-color: var(--themegpt-sidebarHover) !important;
  color: var(--themegpt-sidebarText) !important;
}

html[data-themegpt-theme] [data-message-author-role="user"] {
  background: transparent !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role="assistant"] {
  background: transparent !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, strong, em),
html[data-themegpt-theme] [data-message-author-role] .markdown,
html[data-themegpt-theme] [data-message-author-role] [class*="text-token-text-primary"],
html[data-themegpt-theme] main [class*="text-token-text-primary"] {
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] [class*="text-token-text-secondary"],
html[data-themegpt-theme] main [class*="text-token-text-secondary"],
html[data-themegpt-theme] main [class*="text-token-text-tertiary"] {
  color: var(--themegpt-mutedText) !important;
}

html[data-themegpt-theme] [data-message-author-role] table,
html[data-themegpt-theme] [data-message-author-role] :is(thead, tbody, tr, th, td) {
  border-color: color-mix(in srgb, var(--themegpt-border) 65%, var(--themegpt-text) 35%) !important;
  color: var(--themegpt-text) !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] [data-message-author-role] table :is(th, td, span, div, p, strong) {
  color: var(--themegpt-text) !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] [data-message-author-role] :is(div, section):has(table) :is(button, svg) {
  color: var(--themegpt-mutedText) !important;
  opacity: 1 !important;
  stroke: currentColor !important;
}

html[data-themegpt-theme] [data-message-author-role] .recharts-wrapper :is(.recharts-text, .recharts-label, .recharts-cartesian-axis-tick-value, text) {
  color: var(--themegpt-mutedText) !important;
  fill: var(--themegpt-mutedText) !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] [data-message-author-role] .recharts-wrapper :is(.recharts-cartesian-grid line, .recharts-cartesian-axis-line, .recharts-cartesian-axis-tick-line) {
  opacity: 1 !important;
  stroke: color-mix(in srgb, var(--themegpt-border) 60%, var(--themegpt-text) 40%) !important;
}

html[data-themegpt-theme] textarea,
html[data-themegpt-theme] input,
html[data-themegpt-theme] [contenteditable="true"],
html[data-themegpt-theme] [data-testid="composer"] {
  background-color: var(--themegpt-composer) !important;
  color: var(--themegpt-text) !important;
  border-color: var(--themegpt-border) !important;
}

html[data-themegpt-theme] form[class*="composer"],
html[data-themegpt-theme] [class*="group/composer"] {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] form[class*="composer"] > [class*="bg-(--composer-surface-primary)"],
html[data-themegpt-theme] [class*="bg-(--composer-surface-primary)"],
html[data-themegpt-theme] [data-testid="composer"] {
  background-color: var(--themegpt-composer) !important;
  border: 1px solid var(--themegpt-border) !important;
  box-shadow: 0 10px 28px var(--themegpt-shadow) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] button[class*="composer"],
html[data-themegpt-theme] [class*="composer-btn"],
html[data-themegpt-theme] [class*="composer-submit"] {
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] textarea::placeholder,
html[data-themegpt-theme] input::placeholder {
  color: var(--themegpt-mutedText) !important;
}

html[data-themegpt-theme] main :is(button, a, [role="button"]) {
  color: inherit !important;
}

html[data-themegpt-theme] main :is(button, a, [role="button"]):hover {
  background-color: var(--themegpt-surfaceStrong) !important;
}

html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) :is([class*="sidebar-section-header"], button[aria-expanded], button[aria-controls], [role="button"][aria-expanded]),
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) :is(div, section):has(:is([class*="sidebar-section-header"], button[aria-expanded], button[aria-controls])) :is(button, [role="button"]),
html[data-themegpt-theme] [class*="group-hover/sidebar-section-header"],
html[data-themegpt-theme] [class*="group-hover/sidebar-expand-section-header"],
html[data-themegpt-theme] [class*="group-hover/sidebar-expando-section-header"],
html[data-themegpt-theme] [class*="group/sidebar-expando-section-header"],
html[data-themegpt-theme] [data-trailing-button],
html[data-themegpt-theme] [class*="menu-item-trailing-btn"],
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) :is(div, span):has(> [data-trailing-button]),
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) [class*="group-hover/sidebar-section-header"],
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) [class*="group-hover/sidebar-expando-section-header"],
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) :is(a, button, [role="button"], div, span):has(> svg:only-child) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [data-trailing-button]::before,
html[data-themegpt-theme] [data-trailing-button]::after,
html[data-themegpt-theme] [class*="menu-item-trailing-btn"]::before,
html[data-themegpt-theme] [class*="menu-item-trailing-btn"]::after {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) :is([class*="sidebar-section-header"], button[aria-expanded], button[aria-controls], [role="button"][aria-expanded]):hover,
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) :is(div, section):has(:is([class*="sidebar-section-header"], button[aria-expanded], button[aria-controls])) :is(button, [role="button"]):hover,
html[data-themegpt-theme] [class*="group-hover/sidebar-section-header"]:hover,
html[data-themegpt-theme] [class*="group-hover/sidebar-expand-section-header"]:hover,
html[data-themegpt-theme] [class*="group-hover/sidebar-expando-section-header"]:hover,
html[data-themegpt-theme] [class*="group/sidebar-expando-section-header"]:hover,
html[data-themegpt-theme] [data-trailing-button]:hover,
html[data-themegpt-theme] [class*="menu-item-trailing-btn"]:hover,
html[data-themegpt-theme] [data-trailing-button][data-state="open"],
html[data-themegpt-theme] [class*="menu-item-trailing-btn"][data-state="open"],
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) :is(div, span):has(> [data-trailing-button]):hover,
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) [class*="group-hover/sidebar-section-header"]:hover,
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) [class*="group-hover/sidebar-expando-section-header"]:hover,
html[data-themegpt-theme] :is(nav, aside, [class*="sidebar"], [data-testid="history-panel"], [data-testid="left-sidebar"]) :is(a, button, [role="button"], div, span):has(> svg:only-child):hover {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [class*="border-token"],
html[data-themegpt-theme] [class*="divide-token"] > :not([hidden]) ~ :not([hidden]),
html[data-themegpt-theme] textarea,
html[data-themegpt-theme] input,
html[data-themegpt-theme] [contenteditable="true"],
html[data-themegpt-theme] [data-testid="composer"] {
  border-color: var(--themegpt-border) !important;
}

html[data-themegpt-theme] svg {
  color: inherit !important;
  stroke: currentColor !important;
}

html[data-themegpt-theme] [role="dialog"],
html[data-themegpt-theme] [aria-modal="true"],
html[data-themegpt-theme] [class*="modal"],
html[data-themegpt-theme] [class*="popover"],
html[data-themegpt-theme] [data-radix-popper-content-wrapper] {
  --main-surface-primary: var(--themegpt-surface) !important;
  --main-surface-secondary: var(--themegpt-surfaceStrong) !important;
  --main-surface-tertiary: var(--themegpt-composer) !important;
  --text-primary: var(--themegpt-text) !important;
  --text-secondary: var(--themegpt-mutedText) !important;
  --text-tertiary: var(--themegpt-mutedText) !important;
  --surface-hover: var(--themegpt-surfaceStrong) !important;
  --border-light: var(--themegpt-border) !important;
  --border-medium: var(--themegpt-border) !important;
  --border-heavy: var(--themegpt-border) !important;
  background-color: var(--themegpt-surface) !important;
  border-color: var(--themegpt-border) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [role="dialog"],
html[data-themegpt-theme] [aria-modal="true"] {
  border: 1px solid var(--themegpt-border) !important;
  box-shadow: 0 18px 48px var(--themegpt-shadow) !important;
}

html[data-themegpt-theme] [role="dialog"] :is(h1, h2, h3, h4, h5, h6, p, span, div, label, small),
html[data-themegpt-theme] [aria-modal="true"] :is(h1, h2, h3, h4, h5, h6, p, span, div, label, small),
html[data-themegpt-theme] [role="dialog"] [class*="text-token-text-primary"],
html[data-themegpt-theme] [aria-modal="true"] [class*="text-token-text-primary"] {
  color: var(--themegpt-text) !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] [role="dialog"] [class*="text-token-text-secondary"],
html[data-themegpt-theme] [role="dialog"] [class*="text-token-text-tertiary"],
html[data-themegpt-theme] [aria-modal="true"] [class*="text-token-text-secondary"],
html[data-themegpt-theme] [aria-modal="true"] [class*="text-token-text-tertiary"],
html[data-themegpt-theme] [role="dialog"] small,
html[data-themegpt-theme] [aria-modal="true"] small {
  color: var(--themegpt-mutedText) !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] [role="dialog"] [class*="bg-token"],
html[data-themegpt-theme] [aria-modal="true"] [class*="bg-token"] {
  background-color: var(--themegpt-surface) !important;
}

html[data-themegpt-theme] [role="dialog"] :is(hr, [class*="border-token"], [class*="divide-token"] > :not([hidden]) ~ :not([hidden])),
html[data-themegpt-theme] [aria-modal="true"] :is(hr, [class*="border-token"], [class*="divide-token"] > :not([hidden]) ~ :not([hidden])) {
  border-color: var(--themegpt-border) !important;
}

html[data-themegpt-theme] [role="dialog"] :is(button, [role="button"], [role="tab"]),
html[data-themegpt-theme] [aria-modal="true"] :is(button, [role="button"], [role="tab"]) {
  background-color: transparent !important;
  border-color: transparent !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [role="dialog"] select,
html[data-themegpt-theme] [aria-modal="true"] select,
html[data-themegpt-theme] [role="menu"],
html[data-themegpt-theme] [role="listbox"] {
  background-color: var(--themegpt-composer) !important;
  border-color: var(--themegpt-border) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [role="dialog"] :is(button, [role="button"], [role="tab"]):hover,
html[data-themegpt-theme] [aria-modal="true"] :is(button, [role="button"], [role="tab"]):hover,
html[data-themegpt-theme] [role="dialog"] :is([aria-selected="true"], [data-state="active"], [data-state="checked"]),
html[data-themegpt-theme] [aria-modal="true"] :is([aria-selected="true"], [data-state="active"], [data-state="checked"]),
html[data-themegpt-theme] [role="menu"] [role="menuitem"]:hover,
html[data-themegpt-theme] [role="listbox"] [role="option"]:hover {
  background-color: var(--themegpt-surfaceStrong) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [role="dialog"] :is([aria-pressed="true"], [data-selected="true"]),
html[data-themegpt-theme] [aria-modal="true"] :is([aria-pressed="true"], [data-selected="true"]) {
  background-color: var(--themegpt-surfaceStrong) !important;
  border: 1px solid var(--themegpt-border) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [role="dialog"] [role="switch"],
html[data-themegpt-theme] [aria-modal="true"] [role="switch"] {
  background-color: var(--themegpt-composer) !important;
  border: 1px solid var(--themegpt-border) !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [role="switch"][aria-checked="true"],
html[data-themegpt-theme] button[role="switch"][aria-checked="true"] {
  background-color: color-mix(in srgb, var(--themegpt-accent) 28%, var(--themegpt-composer)) !important;
  border-color: var(--themegpt-accent) !important;
}

html[data-themegpt-theme] [role="dialog"] [role="switch"] :is(span, div),
html[data-themegpt-theme] [aria-modal="true"] [role="switch"] :is(span, div),
html[data-themegpt-theme] [role="dialog"] [role="switch"]::before,
html[data-themegpt-theme] [role="dialog"] [role="switch"]::after,
html[data-themegpt-theme] [aria-modal="true"] [role="switch"]::before,
html[data-themegpt-theme] [aria-modal="true"] [role="switch"]::after {
  background-color: var(--themegpt-surface) !important;
  border-color: var(--themegpt-border) !important;
}

html[data-themegpt-theme] [role="dialog"] :is(button, span)[class*="dot"],
html[data-themegpt-theme] [role="dialog"] :is(button, span)[aria-label*="slide" i],
html[data-themegpt-theme] [role="dialog"] :is(button, span)[aria-label*="page" i],
html[data-themegpt-theme] [aria-modal="true"] :is(button, span)[class*="dot"],
html[data-themegpt-theme] [aria-modal="true"] :is(button, span)[aria-label*="slide" i],
html[data-themegpt-theme] [aria-modal="true"] :is(button, span)[aria-label*="page" i] {
  background-color: var(--themegpt-mutedText) !important;
  border-color: transparent !important;
  color: transparent !important;
  opacity: 0.45 !important;
}

html[data-themegpt-theme] [role="dialog"] :is(button, span)[class*="dot"][aria-current="true"],
html[data-themegpt-theme] [role="dialog"] :is(button, span)[aria-label*="slide" i][aria-current="true"],
html[data-themegpt-theme] [role="dialog"] :is(button, span)[aria-label*="page" i][aria-current="true"],
html[data-themegpt-theme] [aria-modal="true"] :is(button, span)[class*="dot"][aria-current="true"],
html[data-themegpt-theme] [aria-modal="true"] :is(button, span)[aria-label*="slide" i][aria-current="true"],
html[data-themegpt-theme] [aria-modal="true"] :is(button, span)[aria-label*="page" i][aria-current="true"] {
  background-color: var(--themegpt-accent) !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] :is([role="dialog"], [aria-modal="true"]) :is(span, div, button)[class~="rounded-full"]:is([class~="h-1"][class~="w-1"], [class~="h-1.5"][class~="w-1.5"], [class~="h-2"][class~="w-2"], [class~="size-1"], [class~="size-1.5"], [class~="size-2"]) {
  background-color: var(--themegpt-mutedText) !important;
  border-color: transparent !important;
  opacity: 0.45 !important;
}

html[data-themegpt-theme] :is([role="dialog"], [aria-modal="true"]) :is(span, div, button)[class~="rounded-full"]:is([class~="bg-token-text-primary"], [class~="bg-white"], [data-active="true"], [data-state="active"]) {
  background-color: var(--themegpt-accent) !important;
  opacity: 1 !important;
}

html[data-themegpt-theme] .text-token-text-secondary,
html[data-themegpt-theme] [class*="text-token-text-secondary"],
html[data-themegpt-theme] [class*="text-token-text-tertiary"],
html[data-themegpt-theme] small {
  color: var(--themegpt-mutedText) !important;
}

html[data-themegpt-theme] pre:not(.cm-content) {
  background-color: var(--code-block-bg) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] code {
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] :not(pre) > code {
  background-color: var(--themegpt-surfaceStrong) !important;
  border: 1px solid var(--themegpt-border) !important;
  border-radius: 6px !important;
  padding: 0.1em 0.35em !important;
}

html[data-themegpt-theme] [data-message-author-role] pre:not(.cm-content),
html[data-themegpt-theme] [data-message-author-role] .markdown pre:not(.cm-content) {
  background-color: var(--code-block-bg) !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: auto !important;
}

html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> pre):not(.cm-scroller):not(:has(.cm-editor)):not(:has(> p)),
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> div > pre):not(:has(.cm-editor)):not(:has(> p)),
html[data-themegpt-theme] [data-message-author-role] :is([class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"]):has(:is(pre, code)):not(:has(.cm-editor)) {
  background-color: var(--code-block-bg) !important;
  border: 1px solid var(--code-block-border) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> pre):not(.cm-scroller):not(:has(.cm-editor)):not(:has(> p)) > :not(pre):first-child,
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> div > pre):not(:has(.cm-editor)):not(:has(> p)) > :not(:has(pre)):first-child,
html[data-themegpt-theme] [data-message-author-role] :is([class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"]):has(:is(pre, code)):not(:has(.cm-editor)) > :not(:is(pre, code)):first-child,
html[data-themegpt-theme] [data-message-author-role] :is([class*="bg-black"], [class*="bg-gray-950"], [class*="bg-token-sidebar"], [class*="bg-token-main"]):has(+ :is(pre, code)) {
  background-color: var(--code-block-header) !important;
  border-color: var(--code-block-border) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"]):has(:is(pre, code)):not(:has(.cm-editor)) :is([class*="bg-black"], [class*="bg-gray-950"], [class*="dark:bg-black"], [class*="dark:bg-gray-950"]) {
  background-color: var(--code-block-header) !important;
  background-image: none !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"]):has(:is(pre, code)):not(:has(.cm-editor)) :is([class*="border-token"], [class*="border-["], [class*="ring-"]) {
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"]):has(:is(pre, code)):not(:has(.cm-editor)) pre,
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> pre):not(.cm-scroller):not(:has(.cm-editor)):not(:has(> p)) pre,
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> div > pre):not(:has(.cm-editor)):not(:has(> p)) pre {
  background-color: var(--code-block-bg) !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  margin: 0 !important;
}

html[data-themegpt-theme] [data-message-author-role] pre,
html[data-themegpt-theme] [data-message-author-role] pre *,
html[data-themegpt-theme] [data-message-author-role] code,
html[data-themegpt-theme] [data-message-author-role] code * {
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] pre code,
html[data-themegpt-theme] [data-message-author-role] pre span,
html[data-themegpt-theme] [data-message-author-role] code span {
  background: transparent !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([data-testid*="artifact"], [data-testid*="canvas"], [class*="artifact"], [class*="canvas"]) {
  background-color: var(--themegpt-surface) !important;
  border: 1px solid var(--themegpt-border) !important;
  border-radius: 18px !important;
  box-shadow: 0 10px 28px var(--themegpt-shadow) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([data-testid*="artifact"], [data-testid*="canvas"], [class*="artifact"], [class*="canvas"]) * {
  color: var(--themegpt-text) !important;
  border-color: var(--themegpt-border) !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([data-testid*="artifact"], [data-testid*="canvas"], [class*="artifact"], [class*="canvas"]) :is(article, section, [class*="document"], [class*="preview"]) {
  background-color: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([data-testid*="artifact"], [data-testid*="canvas"], [class*="artifact"], [class*="canvas"]) :is(article, section, [class*="document"], [class*="preview"], [class*="editor"], [class*="ProseMirror"], [contenteditable="true"]) :is(div, article, section, main):is([class*="bg-"], [style*="background"]),
html[data-themegpt-theme] [data-message-author-role] :is([data-testid*="artifact"], [data-testid*="canvas"], [class*="artifact"], [class*="canvas"]) :is(article, section, [class*="document"], [class*="preview"], [class*="editor"], [class*="ProseMirror"], [contenteditable="true"]):is([class*="bg-"], [style*="background"]) {
  background-color: transparent !important;
  background-image: none !important;
}

html[data-themegpt-theme] main :is([class*="sticky"], [class*="fixed"])[class*="bottom-0"]:not(:has(:is(form[class*="composer"], [data-testid="composer"], [class*="group/composer"], [class*="composer"]))),
html[data-themegpt-theme][data-chatskin-plan-page="true"] main :is([class*="bg-black"], [class*="from-black"], [class*="to-black"], [class*="dark:bg-black"], [class*="dark:from-black"], [class*="dark:to-black"], [style*="background: black"], [style*="background-color: black"], [style*="background-color: rgb(0, 0, 0)"]) {
  background: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([class*="not-prose"], [class*="group/code"], [class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"], [class*="bg-token-main-surface-secondary"], [class*="bg-token-main-surface-tertiary"]):has(:is(pre, code)):not(:has(.cm-editor)),
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> :is(div, header) + pre):not(:has(.cm-editor)):not(:has(> p)),
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> :is(div, header) + div code):not(:has(.cm-editor)):not(:has(> p)) {
  background-color: var(--code-block-bg) !important;
  background-image: none !important;
  border: 1px solid var(--code-block-border) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([class*="not-prose"], [class*="group/code"], [class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"], [class*="bg-token-main-surface-secondary"], [class*="bg-token-main-surface-tertiary"]):has(:is(pre, code)):not(:has(.cm-editor)) > :is(div, header):first-child,
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> :is(div, header) + pre):not(:has(.cm-editor)):not(:has(> p)) > :is(div, header):first-child,
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> :is(div, header) + div code):not(:has(.cm-editor)):not(:has(> p)) > :is(div, header):first-child,
html[data-themegpt-theme] [data-message-author-role] :is([class*="not-prose"], [class*="group/code"], [class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"]):has(:is(pre, code)):not(:has(.cm-editor)) :is([class*="bg-black"], [class*="bg-gray-950"], [class*="bg-token-main"], [class*="bg-token-sidebar"], [class*="dark:bg-black"], [class*="dark:bg-gray-950"], [style*="background"]) {
  background-color: var(--code-block-header) !important;
  background-image: none !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([class*="not-prose"], [class*="group/code"], [class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"], [class*="code-block"]):has(:is(pre, code)):not(:has(.cm-editor)) :is(pre, code, [class*="overflow-y-auto"], [class*="p-4"]) {
  background-color: var(--code-block-bg) !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [data-message-author-role] :is(div, section):is([class*="rounded"], [class*="border"], [class*="bg-"], [style*="border-radius"], [style*="background"]):has(:is([aria-label*="edit" i], [data-testid*="edit" i], button[class*="edit" i])):has(:is(article, [class*="document"], [class*="preview"], [class*="ProseMirror"], [contenteditable="true"], h1, h2, h3)) {
  background-color: var(--themegpt-surface) !important;
  background-image: none !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] :is(div, section):is([class*="rounded"], [class*="border"], [class*="bg-"], [style*="border-radius"], [style*="background"]):has(:is([aria-label*="edit" i], [data-testid*="edit" i], button[class*="edit" i])):has(:is(article, [class*="document"], [class*="preview"], [class*="ProseMirror"], [contenteditable="true"], h1, h2, h3)) :is(article, section, main, div):is([class*="bg-"], [style*="background"]) {
  background-color: transparent !important;
  background-image: none !important;
}

html[data-themegpt-theme] [data-testid="writing-block-container"] {
  background-color: var(--themegpt-surface) !important;
  background-image: none !important;
  border: 1px solid color-mix(in srgb, var(--themegpt-border) 72%, var(--themegpt-text) 28%) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-testid="writing-block-container"] :is([data-testid="writing-block-header-surface"], [class*="writing-block-editor"], [class*="ProseMirror"], [contenteditable="true"]) {
  background-color: var(--themegpt-surface) !important;
  background-image: none !important;
}

html[data-themegpt-theme] [data-testid="writing-block-container"] [data-testid="writing-block-header-magic-edit-button"],
html[data-themegpt-theme] [data-testid="writing-block-container"] button[aria-label="Edit"] {
  background: var(--themegpt-surfaceStrong) !important;
  border: 1px solid color-mix(in srgb, var(--themegpt-border) 70%, var(--themegpt-text) 30%) !important;
  box-shadow: none !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-testid="writing-block-container"] [data-testid="writing-block-header-magic-edit-button"] :is(svg, span),
html[data-themegpt-theme] [data-testid="writing-block-container"] button[aria-label="Edit"] :is(svg, span) {
  color: inherit !important;
  opacity: 1 !important;
  stroke: currentColor !important;
}

html[data-themegpt-theme] [data-testid="writing-block-container"] [data-testid="writing-block-header-magic-edit-button"]:hover,
html[data-themegpt-theme] [data-testid="writing-block-container"] button[aria-label="Edit"]:hover {
  background: color-mix(in srgb, var(--themegpt-surfaceStrong) 82%, var(--themegpt-accent) 18%) !important;
}

html[data-themegpt-theme] [data-chatskin-code-block] {
  background: transparent !important;
  border: 0 !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  clip-path: inset(0 round 12px) !important;
  outline: 0 !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-chatskin-code-frame] {
  background: transparent !important;
  border: 0 !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  clip-path: inset(0 round 12px) !important;
  outline: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
}

html[data-themegpt-theme] [data-message-author-role] pre[data-chatskin-code-frame] {
  background: transparent !important;
  border: 0 !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  margin: 0 !important;
  outline: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
}

html[data-themegpt-theme] [data-chatskin-code-frame]::before,
html[data-themegpt-theme] [data-chatskin-code-frame]::after {
  background: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [data-chatskin-code-block] :is([class*="border"], [class*="ring"], [class*="shadow"]) {
  border-color: transparent !important;
  box-shadow: none !important;
  outline: 0 !important;
}

html[data-themegpt-theme] [data-chatskin-code-header] {
  background: var(--code-block-header) !important;
  background-image: none !important;
  border: 1px solid var(--code-block-border) !important;
  border-bottom: 0 !important;
  border-radius: 12px 12px 0 0 !important;
  box-shadow: none !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-chatskin-code-header] > [class*="bg-token-bg-elevated-secondary"],
html[data-themegpt-theme] [data-message-author-role] pre [class*="select-none"][class*="sticky"] > [class*="bg-token-bg-elevated-secondary"] {
  background: var(--code-block-header) !important;
  background-image: none !important;
  border-radius: 12px 12px 0 0 !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-chatskin-code-body] {
  background: var(--code-block-bg) !important;
  background-image: none !important;
  border: 1px solid var(--code-block-border) !important;
  border-top: 0 !important;
  border-radius: 0 0 12px 12px !important;
  box-shadow: none !important;
  clip-path: inset(0 round 0 0 12px 12px) !important;
  margin: 0 !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
}

html[data-themegpt-theme] [data-chatskin-code-body-shell] {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 0 12px 12px !important;
  box-shadow: none !important;
  clip-path: inset(0 round 0 0 12px 12px) !important;
  outline: 0 !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-chatskin-code-body] :is(pre, code),
html[data-themegpt-theme] [data-chatskin-code-body] code {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  white-space: pre !important;
}

html[data-themegpt-theme] [data-message-author-role] .cm-scroller {
  overflow-x: scroll !important;
  scrollbar-gutter: stable !important;
  scrollbar-color: var(--themegpt-mutedText) color-mix(in srgb, var(--code-block-bg) 78%, var(--themegpt-border)) !important;
  scrollbar-width: auto !important;
}

html[data-themegpt-theme] [data-message-author-role] .cm-editor,
html[data-themegpt-theme] [data-message-author-role] .cm-scroller,
html[data-themegpt-theme] [data-message-author-role] .cm-content {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: var(--themegpt-text) !important;
  outline: 0 !important;
}

html[data-themegpt-theme] [data-message-author-role] :is(.pe-11.pt-3, [class*="overflow-clip"], [class*="bg-token-bg-elevated-secondary"]):has(.cm-editor) {
  background-color: var(--code-block-bg) !important;
  background-image: none !important;
  border-color: var(--code-block-border) !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [data-message-author-role] .pe-11.pt-3 .cm-editor[class*="cm-"] {
  border-color: transparent !important;
  outline-color: transparent !important;
}

html[data-themegpt-theme] [data-message-author-role] .cm-scroller::-webkit-scrollbar:horizontal {
  display: block !important;
  height: 12px !important;
}

html[data-themegpt-theme] [data-message-author-role] .cm-scroller::-webkit-scrollbar-track:horizontal {
  background: color-mix(in srgb, var(--code-block-bg) 78%, var(--themegpt-border)) !important;
  border-radius: 999px !important;
}

html[data-themegpt-theme] [data-message-author-role] .cm-scroller::-webkit-scrollbar-thumb:horizontal {
  background: var(--themegpt-mutedText) !important;
  border-radius: 999px !important;
}

html[data-themegpt-theme] [data-chatskin-plan-layer] {
  background: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [data-message-author-role] pre [class*="border-token-border-light"] {
  border: 0 !important;
  box-shadow: none !important;
  outline: 0 !important;
}

html[data-themegpt-theme] [data-message-author-role] pre [class*="bg-token-bg-elevated-secondary"] {
  background: var(--code-block-bg) !important;
  background-image: none !important;
}

html[data-themegpt-theme] [data-message-author-role] pre [class*="sticky"] > [class*="bg-token-bg-elevated-secondary"],
html[data-themegpt-theme] [data-message-author-role] pre [class*="select-none"] [class*="bg-token-bg-elevated-secondary"] {
  background: var(--code-block-header) !important;
  background-image: none !important;
  border-radius: 12px 12px 0 0 !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-message-author-role] pre[class*="overflow-visible"][class*="px-0"] [class*="select-none"][class*="sticky"] {
  background: var(--code-block-header) !important;
  background-image: none !important;
  border-radius: 12px 12px 0 0 !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-message-author-role] pre[class*="overflow-visible"][class*="px-0"] [class*="border-token-border-light"][class*="rounded"],
html[data-themegpt-theme] [data-message-author-role] pre[class*="overflow-visible"][class*="px-0"] [class*="overflow-clip"][class*="rounded"] {
  background: var(--code-block-bg) !important;
  background-image: none !important;
  border-color: var(--code-block-border) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-message-author-role] pre[class*="overflow-visible"][class*="px-0"]:has([class*="border-token-border-light"][class*="rounded"]),
html[data-themegpt-theme] [data-message-author-role] pre[class*="overflow-visible"][class*="px-0"]:has([class*="overflow-clip"][class*="rounded"]) {
  background: transparent !important;
  background-image: none !important;
  border: 0 !important;
  box-shadow: none !important;
  overflow: visible !important;
}
`;
  }

  function applyTheme(themeId) {
    const theme = themeApi.getTheme(themeId);
    if (isDefaultTheme(theme)) {
      removeTheme();
      return;
    }

    root.setAttribute("data-themegpt-theme", theme.id);
    ensureThemeStyle(theme);
    schedulePageMarker();
  }

  let pageMarkerTimer = 0;

  function syncPageMarker() {
    const pageText = document.body ? document.body.innerText : "";
    const isPlanPage = pageText.includes("Choose your plan") && pageText.includes("Personal") && pageText.includes("Business");
    if (root.hasAttribute("data-themegpt-theme") && isPlanPage) {
      root.setAttribute("data-chatskin-plan-page", "true");
    } else {
      root.removeAttribute("data-chatskin-plan-page");
    }
    syncSurfaceTags(isPlanPage);
  }

  function schedulePageMarker() {
    clearTimeout(pageMarkerTimer);
    pageMarkerTimer = setTimeout(syncPageMarker, 150);
  }

  function clearSurfaceTags() {
    document
      .querySelectorAll("[data-chatskin-code-frame], [data-chatskin-code-block], [data-chatskin-code-header], [data-chatskin-code-body], [data-chatskin-code-body-shell], [data-chatskin-plan-layer]")
      .forEach((item) => {
        item.removeAttribute("data-chatskin-code-frame");
        item.removeAttribute("data-chatskin-code-block");
        item.removeAttribute("data-chatskin-code-header");
        item.removeAttribute("data-chatskin-code-body");
        item.removeAttribute("data-chatskin-code-body-shell");
        item.removeAttribute("data-chatskin-plan-layer");
      });
  }

  function syncSurfaceTags(isPlanPage) {
    if (!root.hasAttribute("data-themegpt-theme")) {
      clearSurfaceTags();
      return;
    }

    document.querySelectorAll(":is(h1, h2, h3, h4, h5, h6, p, hr)[data-chatskin-code-header]").forEach((item) => {
      item.removeAttribute("data-chatskin-code-header");
    });

    document.querySelectorAll("[data-message-author-role] pre").forEach((pre) => {
      if (pre.closest(".cm-editor, .cm-scroller")) {
        return;
      }

      const embeddedBlock = pre.firstElementChild;
      const embeddedClass = embeddedBlock ? embeddedBlock.getAttribute("class") || "" : "";
      if (embeddedBlock && /(contain-inline-size|group\/code|rounded)/.test(embeddedClass)) {
        pre.setAttribute("data-chatskin-code-frame", "true");
        embeddedBlock.setAttribute("data-chatskin-code-block", "true");

        const header = embeddedBlock.firstElementChild;
        if (header && !header.matches("h1, h2, h3, h4, h5, h6, p, hr")) {
          header.setAttribute("data-chatskin-code-header", "true");
        }

        const body = Array.from(embeddedBlock.children).find((child) => /(^|\s)(relative|overflow)/.test(child.getAttribute("class") || ""));
        if (body) {
          body.setAttribute("data-chatskin-code-body", "true");
        }
        return;
      }

      let block =
        pre.closest("[data-testid*='code'], [class*='group/code'], [class*='not-prose'], [class*='overflow-hidden'], [class*='contain-inline-size']") ||
        pre.parentElement;

      for (let candidate = pre.parentElement; candidate && !candidate.matches("[data-message-author-role]"); candidate = candidate.parentElement) {
        const first = candidate.firstElementChild;
        if (first && !first.contains(pre) && (first.querySelector("button, svg") || first.textContent.trim().length < 120)) {
          block = candidate;
          break;
        }
      }

      if (!block || block.matches("[data-message-author-role]")) {
        return;
      }

      block.setAttribute("data-chatskin-code-block", "true");

      const frame = block.parentElement;
      const frameClass = frame ? frame.getAttribute("class") || "" : "";
      if (frame && !frame.matches("[data-message-author-role]") && /(bg-|border|rounded|ring|shadow|overflow)/.test(frameClass)) {
        frame.setAttribute("data-chatskin-code-frame", "true");
      }

      pre.setAttribute("data-chatskin-code-body", "true");

      if (pre.parentElement && pre.parentElement !== block) {
        pre.parentElement.setAttribute("data-chatskin-code-body-shell", "true");
      }

      const header = pre.previousElementSibling || block.firstElementChild;
      if (header && header !== pre && !header.contains(pre) && !header.matches("h1, h2, h3, h4, h5, h6, p, hr")) {
        header.setAttribute("data-chatskin-code-header", "true");
      }
    });

    document.querySelectorAll("[data-chatskin-plan-layer]").forEach((item) => item.removeAttribute("data-chatskin-plan-layer"));
    if (!isPlanPage) {
      return;
    }

    document.querySelectorAll("body *").forEach((item) => {
      const styles = getComputedStyle(item);
      const rect = item.getBoundingClientRect();
      const isBlackLayer =
        (styles.backgroundColor === "rgb(0, 0, 0)" || styles.backgroundImage.includes("gradient")) &&
        rect.width > window.innerWidth * 0.5 &&
        rect.height > 20 &&
        rect.top > window.innerHeight * 0.45;

      if (isBlackLayer && !item.closest("button, a")) {
        item.setAttribute("data-chatskin-plan-layer", "true");
      }
    });
  }

  function loadStoredTheme() {
    chrome.storage.sync.get(themeApi.storageKey, (result) => {
      applyTheme(result[themeApi.storageKey] || "default");
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === "THEMEGPT_APPLY_THEME") {
      applyTheme(message.themeId);
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && changes[themeApi.storageKey]) {
      applyTheme(changes[themeApi.storageKey].newValue);
    }
  });

  if (document.body) {
    new MutationObserver(schedulePageMarker).observe(document.body, { childList: true, subtree: true });
  }

  loadStoredTheme();
})();
