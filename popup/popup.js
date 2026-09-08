(function () {
  "use strict";

  const themeApi = globalThis.GPTskinsThemes;
  const fontFaces = document.createElement("style");
  fontFaces.textContent = themeApi.fonts.map((font) => themeApi.getFontFaceCSS(font, (path) => chrome.runtime.getURL(path))).join("\n");
  document.head.appendChild(fontFaces);
  const list = document.getElementById("theme-list");
  const fontList = document.getElementById("font-panel");
  const themePanel = document.getElementById("theme-panel");
  const search = document.getElementById("style-search");
  const count = document.getElementById("result-count");
  const emptyState = document.getElementById("empty-state");
  const selection = document.getElementById("current-selection");
  const collection = document.querySelector(".collection");
  const themeFilter = document.querySelector(".theme-filter");
  const status = document.getElementById("status");
  const styleButtons = Array.from(document.querySelectorAll("[data-style-mode]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-theme-mode]"));
  let selectedThemeId = "default";
  let selectedFontId = "default";
  let styleMode = "theme";
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

    const preview = document.createElement("span");
    preview.className = "font-preview";
    preview.textContent = "Aa";
    preview.setAttribute("aria-hidden", "true");
    preview.style.fontFamily = font.stack || "inherit";
    button.append(preview, name, description);
    button.addEventListener("click", () => selectFont(font.id));

    return button;
  }

  function updatePressedStates() {
    selection.textContent = `${themeApi.getTheme(selectedThemeId).name} / ${themeApi.getFont(selectedFontId).name}`;
    document.querySelectorAll(".theme-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeId === selectedThemeId));
    });
    document.querySelectorAll(".font-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.fontId === selectedFontId));
    });
    styleButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.styleMode === styleMode));
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
      const saveFailed = Boolean(chrome.runtime.lastError);
      sendToActiveTab(
        { type: "GPTSKINS_APPLY_THEME", themeId: selectedThemeId },
        saveFailed ? "Theme applied, but couldn't save it." : "Theme applied.",
        saveFailed ? "Couldn't save theme. Try again." : "Saved. Open ChatGPT to see this theme."
      );
    });
  }

  function selectFont(fontId) {
    selectedFontId = themeApi.getFont(fontId).id;
    updatePressedStates();

    chrome.storage.sync.set({ [themeApi.fontStorageKey]: selectedFontId }, () => {
      const saveFailed = Boolean(chrome.runtime.lastError);
      sendToActiveTab(
        { type: "GPTSKINS_APPLY_FONT", fontId: selectedFontId },
        saveFailed ? "Font applied, but couldn't save it." : "Font applied.",
        saveFailed ? "Couldn't save font. Try again." : "Saved. Open ChatGPT to see this font."
      );
    });
  }

  function isVisibleTheme(theme) {
    return themeMode === (theme.dark || theme.id === "default" ? "dark" : "light");
  }

  function renderThemes() {
    list.replaceChildren(...themeApi.themes.filter(isVisibleTheme).map(renderThemeButton));
    updatePressedStates();
    filterResults();
  }

  function renderFonts() {
    fontList.replaceChildren(...themeApi.fonts.map(renderFontButton));
    updatePressedStates();
    filterResults();
  }

  function filterResults() {
    const query = search.value.trim().toLocaleLowerCase();
    const buttons = Array.from((styleMode === "theme" ? list : fontList).children);
    let visible = 0;
    buttons.forEach((button) => {
      button.hidden = !button.textContent.toLocaleLowerCase().includes(query);
      if (!button.hidden) visible += 1;
    });
    count.textContent = `${visible} ${styleMode === "theme" ? "themes" : "fonts"}`;
    emptyState.hidden = visible !== 0;
    collection.scrollTop = 0;
  }

  search.addEventListener("input", filterResults);
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && search.value) {
      event.preventDefault();
      search.value = "";
      filterResults();
    }
  });

  function showPanel(mode) {
    styleMode = mode;
    search.value = "";
    search.placeholder = styleMode === "theme" ? "Find your theme" : "Find your font";
    search.setAttribute("aria-label", styleMode === "theme" ? "Search themes" : "Search fonts");
    themeFilter.hidden = styleMode !== "theme";
    themePanel.hidden = styleMode !== "theme";
    fontList.hidden = styleMode !== "font";
    filterResults();
    status.textContent = styleMode === "theme" ? "Pick a theme for ChatGPT." : "Pick a font for ChatGPT.";
    updatePressedStates();
  }

  styleButtons.forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.styleMode));
  });

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
    showPanel("theme");
  });
})();
