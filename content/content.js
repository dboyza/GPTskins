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

html[data-themegpt-theme] [class*="thread-bottom-container"],
html[data-themegpt-theme] [class*="sticky"][class*="bottom-0"] {
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
html[data-themegpt-theme] [class*="thread-bottom-container"]::after,
html[data-themegpt-theme] [class*="sticky"][class*="bottom-0"]::before,
html[data-themegpt-theme] [class*="sticky"][class*="bottom-0"]::after {
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
html[data-themegpt-theme] [class*="group/composer"],
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

html[data-themegpt-theme] .text-token-text-secondary,
html[data-themegpt-theme] [class*="text-token-text-secondary"],
html[data-themegpt-theme] [class*="text-token-text-tertiary"],
html[data-themegpt-theme] small {
  color: var(--themegpt-mutedText) !important;
}

html[data-themegpt-theme] pre,
html[data-themegpt-theme] code {
  background-color: var(--code-block-bg) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role] pre,
html[data-themegpt-theme] [data-message-author-role] .markdown pre,
html[data-themegpt-theme] [data-message-author-role] div:has(> pre) {
  background-color: var(--code-block-bg) !important;
  border: 1px solid var(--code-block-border) !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 24px var(--themegpt-shadow) !important;
  overflow: hidden !important;
}

html[data-themegpt-theme] [data-message-author-role] div:has(> pre) > pre {
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
