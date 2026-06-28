(function () {
  "use strict";

  const themeApi = globalThis.GPTskinsThemes;
  const list = document.getElementById("theme-list");
  const status = document.getElementById("status");
  let selectedThemeId = "default";

  function renderThemeButton(theme) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-button";
    button.dataset.themeId = theme.id;
    button.setAttribute("aria-pressed", String(theme.id === selectedThemeId));

    const swatches = document.createElement("span");
    swatches.className = "swatches";
    swatches.setAttribute("aria-hidden", "true");

    theme.swatches.forEach((color) => {
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.backgroundColor = color;
      swatches.appendChild(swatch);
    });

    const copy = document.createElement("span");
    copy.className = "theme-copy";

    const name = document.createElement("span");
    name.className = "theme-name";
    name.textContent = theme.name;

    const description = document.createElement("span");
    description.className = "theme-description";
    description.textContent = theme.description;

    copy.append(name, description);
    button.append(swatches, copy);
    button.addEventListener("click", () => selectTheme(theme.id));

    return button;
  }

  function updatePressedStates() {
    document.querySelectorAll(".theme-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeId === selectedThemeId));
    });
  }

  function sendThemeToActiveTab(themeId) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id || !tab.url || !/^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab.url)) {
        status.textContent = "Saved. Open ChatGPT to see this theme.";
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: "GPTSKINS_APPLY_THEME", themeId }, () => {
        if (chrome.runtime.lastError) {
          status.textContent = "Saved. Refresh ChatGPT if it was already open.";
          return;
        }

        status.textContent = "Theme applied.";
      });
    });
  }

  function selectTheme(themeId) {
    selectedThemeId = themeApi.getTheme(themeId).id;
    updatePressedStates();

    chrome.storage.sync.set({ [themeApi.storageKey]: selectedThemeId }, () => {
      sendThemeToActiveTab(selectedThemeId);
    });
  }

  function renderThemes() {
    list.replaceChildren(...themeApi.themes.map(renderThemeButton));
  }

  chrome.storage.sync.get(themeApi.storageKey, (result) => {
    selectedThemeId = themeApi.getTheme(result[themeApi.storageKey] || "default").id;
    renderThemes();
    status.textContent = "Pick a theme for ChatGPT.";
  });
})();
