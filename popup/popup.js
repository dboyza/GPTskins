(function () {
  "use strict";

  const themeApi = globalThis.GPTskinsThemes;
  const list = document.getElementById("theme-list");
  const fontList = document.getElementById("font-list");
  const status = document.getElementById("status");
  const filterButtons = Array.from(document.querySelectorAll("[data-theme-mode]"));
  let selectedThemeId = "default";
  let selectedFontId = "default";
  let themeMode = "dark";

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

  function renderFontButton(font) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "font-button";
    button.dataset.fontId = font.id;
    button.setAttribute("aria-pressed", String(font.id === selectedFontId));

    const name = document.createElement("span");
    name.className = "font-name";
    name.textContent = font.name;

    const description = document.createElement("span");
    description.className = "font-description";
    description.textContent = font.description;

    button.append(name, description);
    button.addEventListener("click", () => selectFont(font.id));

    return button;
  }

  function updatePressedStates() {
    document.querySelectorAll(".theme-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeId === selectedThemeId));
    });
    document.querySelectorAll(".font-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.fontId === selectedFontId));
    });
    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeMode === themeMode));
    });
  }

  function sendToActiveTab(message, appliedText, savedText) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id || !tab.url || !/^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab.url)) {
        status.textContent = savedText;
        return;
      }

      chrome.tabs.sendMessage(tab.id, message, () => {
        if (chrome.runtime.lastError) {
          status.textContent = "Saved. Refresh ChatGPT if it was already open.";
          return;
        }

        status.textContent = appliedText;
      });
    });
  }

  function selectTheme(themeId) {
    selectedThemeId = themeApi.getTheme(themeId).id;
    updatePressedStates();

    chrome.storage.sync.set({ [themeApi.storageKey]: selectedThemeId }, () => {
      sendToActiveTab({ type: "GPTSKINS_APPLY_THEME", themeId: selectedThemeId }, "Theme applied.", "Saved. Open ChatGPT to see this theme.");
    });
  }

  function selectFont(fontId) {
    selectedFontId = themeApi.getFont(fontId).id;
    updatePressedStates();

    chrome.storage.sync.set({ [themeApi.fontStorageKey]: selectedFontId }, () => {
      sendToActiveTab({ type: "GPTSKINS_APPLY_FONT", fontId: selectedFontId }, "Font applied.", "Saved. Open ChatGPT to see this font.");
    });
  }

  function isVisibleTheme(theme) {
    return themeMode === (theme.dark || theme.id === "default" ? "dark" : "light");
  }

  function renderThemes() {
    list.replaceChildren(...themeApi.themes.filter(isVisibleTheme).map(renderThemeButton));
    updatePressedStates();
  }

  function renderFonts() {
    fontList.replaceChildren(...themeApi.fonts.map(renderFontButton));
    updatePressedStates();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      themeMode = button.dataset.themeMode;
      renderThemes();
    });
  });

  chrome.storage.sync.get([themeApi.storageKey, themeApi.fontStorageKey], (result) => {
    selectedThemeId = themeApi.getTheme(result[themeApi.storageKey] || "default").id;
    selectedFontId = themeApi.getFont(result[themeApi.fontStorageKey] || "default").id;
    themeMode = selectedThemeId !== "default" && !themeApi.darkThemeIds.has(selectedThemeId) ? "light" : "dark";
    renderThemes();
    renderFonts();
    status.textContent = "Pick a theme or font for ChatGPT.";
  });
})();
