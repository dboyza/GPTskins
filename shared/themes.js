(function () {
  "use strict";

  const themes = [
    {
      id: "default",
      name: "Default",
      description: "ChatGPT's native look.",
      swatches: ["#ffffff", "#f4f4f5", "#10a37f"],
      colors: {
        background: "",
        surface: "",
        surfaceStrong: "",
        sidebar: "",
        text: "",
        mutedText: "",
        border: "",
        accent: "",
        accentText: "",
        userBubble: "",
        assistantBubble: "",
        composer: "",
        shadow: ""
      }
    },
    {
      id: "midnight",
      name: "Midnight",
      description: "Deep neutral dark with electric teal accents.",
      swatches: ["#0b1020", "#151b2e", "#38d6b3"],
      colors: {
        background: "#0b1020",
        surface: "#111827",
        surfaceStrong: "#151b2e",
        sidebar: "#070b14",
        text: "#edf4ff",
        mutedText: "#a9b6cc",
        border: "#263247",
        accent: "#38d6b3",
        accentText: "#04110e",
        userBubble: "#12392f",
        assistantBubble: "#151b2e",
        composer: "#101726",
        shadow: "rgba(0, 0, 0, 0.35)"
      }
    },
    {
      id: "forest",
      name: "Forest",
      description: "Soft greens with warm paper surfaces.",
      swatches: ["#10251d", "#f4f0df", "#3f8f63"],
      colors: {
        background: "#f4f0df",
        surface: "#fffaf0",
        surfaceStrong: "#e7dfc6",
        sidebar: "#10251d",
        text: "#18231d",
        mutedText: "#58685e",
        border: "#c9c0a6",
        accent: "#3f8f63",
        accentText: "#ffffff",
        userBubble: "#dcebd9",
        assistantBubble: "#fffaf0",
        composer: "#fffdf6",
        shadow: "rgba(31, 43, 34, 0.18)"
      }
    },
    {
      id: "solar",
      name: "Solar",
      description: "Warm light workspace with amber highlights.",
      swatches: ["#fff6df", "#f2c14e", "#243447"],
      colors: {
        background: "#fff6df",
        surface: "#fffdf7",
        surfaceStrong: "#f7e3aa",
        sidebar: "#243447",
        text: "#271f14",
        mutedText: "#6f604c",
        border: "#e0c783",
        accent: "#d89519",
        accentText: "#1d1405",
        userBubble: "#f8e7b6",
        assistantBubble: "#fffdf7",
        composer: "#fffaf0",
        shadow: "rgba(96, 70, 15, 0.2)"
      }
    },
    {
      id: "rose",
      name: "Rose",
      description: "Calm rose and plum tones.",
      swatches: ["#fff1f5", "#8a2c58", "#f47ca5"],
      colors: {
        background: "#fff1f5",
        surface: "#fffafd",
        surfaceStrong: "#f8d5e2",
        sidebar: "#301525",
        text: "#2b1420",
        mutedText: "#725568",
        border: "#e9b7ca",
        accent: "#c94679",
        accentText: "#ffffff",
        userBubble: "#f8d5e2",
        assistantBubble: "#fffafd",
        composer: "#fff8fb",
        shadow: "rgba(94, 25, 58, 0.18)"
      }
    },
    {
      id: "contrast",
      name: "High Contrast",
      description: "Black, white, and yellow for maximum separation.",
      swatches: ["#000000", "#ffffff", "#ffe600"],
      colors: {
        background: "#000000",
        surface: "#0d0d0d",
        surfaceStrong: "#1a1a1a",
        sidebar: "#000000",
        text: "#ffffff",
        mutedText: "#dddddd",
        border: "#ffffff",
        accent: "#ffe600",
        accentText: "#000000",
        userBubble: "#252500",
        assistantBubble: "#0d0d0d",
        composer: "#111111",
        shadow: "rgba(255, 255, 255, 0.2)"
      }
    }
  ];

  const themeMap = themes.reduce((items, theme) => {
    items[theme.id] = theme;
    return items;
  }, {});

  function getTheme(id) {
    return themeMap[id] || themeMap.default;
  }

  globalThis.ThemeGPTThemes = {
    storageKey: "themegpt.theme",
    themes,
    getTheme
  };
})();
