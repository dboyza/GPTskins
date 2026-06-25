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
  color-scheme: ${theme.id === "contrast" || theme.id === "midnight" ? "dark" : "light"};
}

html[data-themegpt-theme],
html[data-themegpt-theme] body,
html[data-themegpt-theme] main {
  background: var(--themegpt-background) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] [class*="bg-token-main-surface-primary"],
html[data-themegpt-theme] [class*="bg-token-main-surface-secondary"],
html[data-themegpt-theme] [class*="bg-token-main-surface-tertiary"],
html[data-themegpt-theme] [class*="bg-token-sidebar-surface-primary"],
html[data-themegpt-theme] [class*="bg-token-sidebar-surface-secondary"],
html[data-themegpt-theme] [class*="bg-token-message-surface"],
html[data-themegpt-theme] [class*="dark:bg-"],
html[data-themegpt-theme] [data-testid*="conversation-turn"],
html[data-themegpt-theme] article {
  background-color: var(--themegpt-surface) !important;
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] nav,
html[data-themegpt-theme] aside,
html[data-themegpt-theme] [class*="sidebar"],
html[data-themegpt-theme] [data-testid="history-panel"],
html[data-themegpt-theme] [data-testid="left-sidebar"] {
  background-color: var(--themegpt-sidebar) !important;
  color: var(--themegpt-text) !important;
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
html[data-themegpt-theme] form,
html[data-themegpt-theme] [data-testid="composer"],
html[data-themegpt-theme] [class*="composer"] {
  background-color: var(--themegpt-composer) !important;
  color: var(--themegpt-text) !important;
  border-color: var(--themegpt-border) !important;
}

html[data-themegpt-theme] button,
html[data-themegpt-theme] a,
html[data-themegpt-theme] [role="button"] {
  color: var(--themegpt-text) !important;
}

html[data-themegpt-theme] button:hover,
html[data-themegpt-theme] a:hover,
html[data-themegpt-theme] [role="button"]:hover {
  background-color: var(--themegpt-surfaceStrong) !important;
}

html[data-themegpt-theme] button[aria-pressed="true"],
html[data-themegpt-theme] [aria-selected="true"],
html[data-themegpt-theme] [data-state="checked"],
html[data-themegpt-theme] [class*="bg-token-text-primary"] {
  background-color: var(--themegpt-accent) !important;
  color: var(--themegpt-accentText) !important;
}

html[data-themegpt-theme] *,
html[data-themegpt-theme] ::before,
html[data-themegpt-theme] ::after {
  border-color: var(--themegpt-border) !important;
}

html[data-themegpt-theme] p,
html[data-themegpt-theme] span,
html[data-themegpt-theme] li,
html[data-themegpt-theme] h1,
html[data-themegpt-theme] h2,
html[data-themegpt-theme] h3,
html[data-themegpt-theme] h4,
html[data-themegpt-theme] h5,
html[data-themegpt-theme] h6,
html[data-themegpt-theme] code,
html[data-themegpt-theme] pre,
html[data-themegpt-theme] label {
  color: inherit !important;
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
