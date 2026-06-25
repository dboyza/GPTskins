(function () {
  "use strict";

  const themes = [
    {
      id: "default",
      name: "Default",
      description: "Native look.",
      swatches: ["#ffffff", "#f4f4f5", "#10a37f"],
      colors: {
        background: "",
        surface: "",
        surfaceStrong: "",
        sidebar: "",
        sidebarText: "",
        sidebarMuted: "",
        sidebarHover: "",
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
      id: "og",
      name: "OG",
      description: "Classic charcoal.",
      swatches: ["#212121", "#171717", "#303030"],
      colors: {
        background: "#212121",
        surface: "#212121",
        surfaceStrong: "#303030",
        sidebar: "#171717",
        sidebarText: "#f7f7f7",
        sidebarMuted: "#b4b4b4",
        sidebarHover: "#2f2f2f",
        text: "#f7f7f7",
        mutedText: "#b4b4b4",
        border: "#444444",
        accent: "#8ab4f8",
        accentText: "#ffffff",
        userBubble: "#303030",
        assistantBubble: "#212121",
        composer: "#303030",
        shadow: "rgba(0, 0, 0, 0.32)"
      }
    },
    {
      id: "midnight",
      name: "Midnight",
      description: "Teal dark.",
      swatches: ["#0b1020", "#151b2e", "#38d6b3"],
      colors: {
        background: "#0b1020",
        surface: "#111827",
        surfaceStrong: "#151b2e",
        sidebar: "#070b14",
        sidebarText: "#edf4ff",
        sidebarMuted: "#a9b6cc",
        sidebarHover: "#111827",
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
      id: "one-dark",
      name: "One Dark",
      description: "Atom dark.",
      swatches: ["#282c34", "#21252b", "#61afef"],
      colors: {
        background: "#282c34",
        surface: "#282c34",
        surfaceStrong: "#21252b",
        sidebar: "#21252b",
        sidebarText: "#abb2bf",
        sidebarMuted: "#7f8794",
        sidebarHover: "#2c313a",
        text: "#abb2bf",
        mutedText: "#8b93a1",
        border: "#3b4048",
        accent: "#61afef",
        accentText: "#0b1118",
        userBubble: "#2c313a",
        assistantBubble: "#282c34",
        composer: "#21252b",
        shadow: "rgba(0, 0, 0, 0.32)"
      }
    },
    {
      id: "dracula",
      name: "Dracula",
      description: "Purple dark.",
      swatches: ["#282a36", "#44475a", "#bd93f9"],
      colors: {
        background: "#282a36",
        surface: "#282a36",
        surfaceStrong: "#343746",
        sidebar: "#1f212b",
        sidebarText: "#f8f8f2",
        sidebarMuted: "#b7bdd8",
        sidebarHover: "#343746",
        text: "#f8f8f2",
        mutedText: "#c7cbe3",
        border: "#4f5268",
        accent: "#bd93f9",
        accentText: "#1b102a",
        userBubble: "#4b3675",
        assistantBubble: "#282a36",
        composer: "#343746",
        shadow: "rgba(0, 0, 0, 0.34)"
      }
    },
    {
      id: "catppuccin",
      name: "Catppuccin",
      description: "Pastel mocha.",
      swatches: ["#1e1e2e", "#313244", "#cba6f7"],
      colors: {
        background: "#1e1e2e",
        surface: "#1e1e2e",
        surfaceStrong: "#313244",
        sidebar: "#181825",
        sidebarText: "#cdd6f4",
        sidebarMuted: "#a6adc8",
        sidebarHover: "#313244",
        text: "#cdd6f4",
        mutedText: "#bac2de",
        border: "#45475a",
        accent: "#cba6f7",
        accentText: "#1e132d",
        userBubble: "#45475a",
        assistantBubble: "#1e1e2e",
        composer: "#313244",
        shadow: "rgba(0, 0, 0, 0.34)"
      }
    },
    {
      id: "tokyo-night",
      name: "Tokyo Night",
      description: "Neon night.",
      swatches: ["#1a1b26", "#24283b", "#7aa2f7"],
      colors: {
        background: "#1a1b26",
        surface: "#1a1b26",
        surfaceStrong: "#24283b",
        sidebar: "#16161e",
        sidebarText: "#c0caf5",
        sidebarMuted: "#9aa5ce",
        sidebarHover: "#24283b",
        text: "#c0caf5",
        mutedText: "#a9b1d6",
        border: "#3b4261",
        accent: "#7aa2f7",
        accentText: "#101521",
        userBubble: "#283457",
        assistantBubble: "#1a1b26",
        composer: "#24283b",
        shadow: "rgba(0, 0, 0, 0.36)"
      }
    },
    {
      id: "nord",
      name: "Nord",
      description: "Arctic blue.",
      swatches: ["#2e3440", "#3b4252", "#88c0d0"],
      colors: {
        background: "#2e3440",
        surface: "#2e3440",
        surfaceStrong: "#3b4252",
        sidebar: "#242933",
        sidebarText: "#eceff4",
        sidebarMuted: "#b7c0cf",
        sidebarHover: "#3b4252",
        text: "#eceff4",
        mutedText: "#c2cad8",
        border: "#4c566a",
        accent: "#88c0d0",
        accentText: "#142027",
        userBubble: "#3f5669",
        assistantBubble: "#2e3440",
        composer: "#3b4252",
        shadow: "rgba(0, 0, 0, 0.32)"
      }
    },
    {
      id: "gruvbox",
      name: "Gruvbox",
      description: "Retro warm.",
      swatches: ["#282828", "#3c3836", "#fabd2f"],
      colors: {
        background: "#282828",
        surface: "#282828",
        surfaceStrong: "#3c3836",
        sidebar: "#1d2021",
        sidebarText: "#fbf1c7",
        sidebarMuted: "#d5c4a1",
        sidebarHover: "#3c3836",
        text: "#fbf1c7",
        mutedText: "#d5c4a1",
        border: "#665c54",
        accent: "#fabd2f",
        accentText: "#1d2021",
        userBubble: "#504945",
        assistantBubble: "#282828",
        composer: "#3c3836",
        shadow: "rgba(0, 0, 0, 0.34)"
      }
    },
    {
      id: "forest",
      name: "Forest",
      description: "Soft green.",
      swatches: ["#10251d", "#f4f0df", "#3f8f63"],
      colors: {
        background: "#f4f0df",
        surface: "#fffaf0",
        surfaceStrong: "#e7dfc6",
        sidebar: "#10251d",
        sidebarText: "#f7fff7",
        sidebarMuted: "#b8cbbf",
        sidebarHover: "#1a3529",
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
      description: "Warm light.",
      swatches: ["#fff6df", "#f2c14e", "#243447"],
      colors: {
        background: "#fff6df",
        surface: "#fffdf7",
        surfaceStrong: "#f7e3aa",
        sidebar: "#243447",
        sidebarText: "#fff8e8",
        sidebarMuted: "#d4c7a7",
        sidebarHover: "#314258",
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
      description: "Rose plum.",
      swatches: ["#fff1f5", "#8a2c58", "#f47ca5"],
      colors: {
        background: "#fff1f5",
        surface: "#fffafd",
        surfaceStrong: "#f8d5e2",
        sidebar: "#301525",
        sidebarText: "#fff2f7",
        sidebarMuted: "#d3aabb",
        sidebarHover: "#462035",
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
      description: "Max contrast.",
      swatches: ["#000000", "#ffffff", "#ffe600"],
      colors: {
        background: "#000000",
        surface: "#0d0d0d",
        surfaceStrong: "#1a1a1a",
        sidebar: "#000000",
        sidebarText: "#ffffff",
        sidebarMuted: "#dddddd",
        sidebarHover: "#1a1a1a",
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

  globalThis.GPTskinsThemes = {
    storageKey: "gptskins.theme",
    themes,
    getTheme
  };
})();
