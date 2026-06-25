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

html[data-themegpt-theme] [class*="thread-bottom-container"] {
  background: linear-gradient(
    to bottom,
    transparent 0,
    var(--themegpt-background) 34%,
    var(--themegpt-background) 100%
  ) !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [class*="thread-bottom-container"]::before,
html[data-themegpt-theme] [class*="thread-bottom-container"]::after {
  background: transparent !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] [class*="thread-bottom-container"] [class*="bg-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"] [class*="from-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"] [class*="to-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"] [class*="dark:bg-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"] [class*="dark:from-black"],
html[data-themegpt-theme] [class*="thread-bottom-container"] [class*="dark:to-black"] {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

html[data-themegpt-theme] nav,
html[data-themegpt-theme] aside,
html[data-themegpt-theme] [class*="sidebar"],
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

html[data-themegpt-theme] [role="dialog"] :is(button, [role="button"], [role="tab"], select),
html[data-themegpt-theme] [aria-modal="true"] :is(button, [role="button"], [role="tab"], select),
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

html[data-themegpt-theme] pre {
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

html[data-themegpt-theme] [data-message-author-role] pre,
html[data-themegpt-theme] [data-message-author-role] .markdown pre {
  background-color: var(--code-block-bg) !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: auto !important;
}

html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> pre):not(:has(> p)),
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> div > pre):not(:has(> p)),
html[data-themegpt-theme] [data-message-author-role] :is([class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"]):has(pre) {
  background-color: var(--code-block-bg) !important;
  border: 1px solid var(--code-block-border) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> pre):not(:has(> p)) > :not(pre):first-child,
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> div > pre):not(:has(> p)) > :not(:has(pre)):first-child,
html[data-themegpt-theme] [data-message-author-role] :is([class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"]):has(pre) > :not(pre):first-child,
html[data-themegpt-theme] [data-message-author-role] :is([class*="bg-black"], [class*="bg-gray-950"], [class*="bg-token-sidebar"], [class*="bg-token-main"]):has(+ pre) {
  background-color: color-mix(in srgb, var(--themegpt-surfaceStrong) 82%, var(--themegpt-background)) !important;
  border-color: var(--code-block-border) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] :is([class*="overflow-hidden"], [class*="contain-inline-size"], [data-testid*="code"]):has(pre) pre,
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> pre):not(:has(> p)) pre,
html[data-themegpt-theme] [data-message-author-role] .markdown :is(div, section):has(> div > pre):not(:has(> p)) pre {
  border-radius: 0 !important;
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

  loadStoredTheme();
})();
