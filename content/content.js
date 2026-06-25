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
  --composer-surface: var(--themegpt-composer) !important;
  --text-primary: var(--themegpt-text) !important;
  --text-secondary: var(--themegpt-mutedText) !important;
  --text-tertiary: var(--themegpt-mutedText) !important;
  --border-light: var(--themegpt-border) !important;
  --border-medium: var(--themegpt-border) !important;
  --border-heavy: var(--themegpt-border) !important;
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

html[data-themegpt-theme] nav,
html[data-themegpt-theme] aside,
html[data-themegpt-theme] [class*="sidebar"],
html[data-themegpt-theme] [data-testid="history-panel"],
html[data-themegpt-theme] [data-testid="left-sidebar"] {
  background-color: var(--themegpt-sidebar) !important;
  color: var(--themegpt-sidebarText) !important;
}

html[data-themegpt-theme] nav :is(a, button, [role="button"], span, p, div),
html[data-themegpt-theme] aside :is(a, button, [role="button"], span, p, div),
html[data-themegpt-theme] [data-testid="history-panel"] :is(a, button, [role="button"], span, p, div),
html[data-themegpt-theme] [data-testid="left-sidebar"] :is(a, button, [role="button"], span, p, div) {
  color: inherit !important;
}

html[data-themegpt-theme] nav .text-token-text-secondary,
html[data-themegpt-theme] nav [class*="text-token-text-secondary"],
html[data-themegpt-theme] aside .text-token-text-secondary,
html[data-themegpt-theme] aside [class*="text-token-text-secondary"],
html[data-themegpt-theme] [data-testid="history-panel"] [class*="text-token-text-secondary"],
html[data-themegpt-theme] [data-testid="left-sidebar"] [class*="text-token-text-secondary"] {
  color: var(--themegpt-sidebarMuted) !important;
}

html[data-themegpt-theme] nav :is(a, button, [role="button"]):hover,
html[data-themegpt-theme] aside :is(a, button, [role="button"]):hover,
html[data-themegpt-theme] [data-testid="history-panel"] :is(a, button, [role="button"]):hover,
html[data-themegpt-theme] [data-testid="left-sidebar"] :is(a, button, [role="button"]):hover {
  background-color: var(--themegpt-sidebarHover) !important;
  color: var(--themegpt-sidebarText) !important;
}

html[data-themegpt-theme] [data-message-author-role="user"],
html[data-themegpt-theme] [data-message-author-role="user"] > div {
  background-color: var(--themegpt-userBubble) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [data-message-author-role="assistant"],
html[data-themegpt-theme] [data-message-author-role="assistant"] > div {
  background-color: var(--themegpt-assistantBubble) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] textarea,
html[data-themegpt-theme] input,
html[data-themegpt-theme] [contenteditable="true"],
html[data-themegpt-theme] [data-testid="composer"],
html[data-themegpt-theme] [class*="composer"] {
  background-color: var(--themegpt-composer) !important;
  color: var(--themegpt-text) !important;
  border-color: var(--themegpt-border) !important;
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
  background-color: var(--themegpt-surfaceStrong) !important;
}

html[data-themegpt-theme] [class*="shadow"],
html[data-themegpt-theme] [class*="drop-shadow"] {
  box-shadow: 0 10px 30px var(--themegpt-shadow) !important;
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
