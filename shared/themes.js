(function () {
  "use strict";

  function colors({
    background,
    surface,
    surfaceStrong,
    sidebar,
    sidebarText,
    sidebarMuted,
    sidebarHover,
    text,
    mutedText,
    border,
    accent,
    accentText,
    userBubble,
    assistantBubble,
    composer,
    shadow
  }) {
    return {
      background,
      surface,
      surfaceStrong: surfaceStrong || surface,
      sidebar: sidebar || surface,
      sidebarText: sidebarText || text,
      sidebarMuted: sidebarMuted || mutedText,
      sidebarHover: sidebarHover || surfaceStrong || surface,
      text,
      mutedText,
      border,
      accent,
      accentText,
      userBubble: userBubble || surfaceStrong || surface,
      assistantBubble: assistantBubble || surface,
      composer: composer || surfaceStrong || surface,
      shadow: shadow || "rgba(0, 0, 0, 0.32)"
    };
  }

  const themes = [
    {
      id: "default",
      name: "Default",
      description: "Native look.",
      swatches: ["#000000", "#ffffff"],
      colors: {}
    },
    {
      id: "absolutely",
      name: "Absolutely",
      description: "Warm charcoal.",
      dark: true,
      swatches: ["#15130f", "#3a342c", "#d6b889"],
      colors: colors({
        background: "#15130f",
        surface: "#1d1a16",
        surfaceStrong: "#302a23",
        sidebar: "#11100d",
        text: "#f4eadb",
        mutedText: "#b9aa94",
        border: "#4b4034",
        accent: "#d6b889",
        accentText: "#17110a",
        userBubble: "#3a342c"
      })
    },
    {
      id: "ayu",
      name: "Ayu",
      description: "Golden dark.",
      dark: true,
      swatches: ["#0f1419", "#1f2430", "#ffb454"],
      colors: colors({
        background: "#0f1419",
        surface: "#14191f",
        surfaceStrong: "#1f2430",
        sidebar: "#0b1016",
        text: "#e6e1cf",
        mutedText: "#acb6bf",
        border: "#2d3640",
        accent: "#ffb454",
        accentText: "#1d1304",
        userBubble: "#243340"
      })
    },
    {
      id: "catppuccin",
      name: "Catppuccin",
      description: "Pastel mocha.",
      dark: true,
      swatches: ["#1e1e2e", "#313244", "#cba6f7"],
      colors: colors({
        background: "#1e1e2e",
        surface: "#1e1e2e",
        surfaceStrong: "#313244",
        sidebar: "#181825",
        text: "#cdd6f4",
        mutedText: "#bac2de",
        border: "#45475a",
        accent: "#cba6f7",
        accentText: "#1e132d",
        userBubble: "#45475a"
      })
    },
    {
      id: "codex",
      name: "Codex",
      description: "Blue graphite.",
      dark: true,
      swatches: ["#101014", "#1f2430", "#8ab4ff"],
      colors: colors({
        background: "#101014",
        surface: "#15171c",
        surfaceStrong: "#20242d",
        sidebar: "#0c0d11",
        text: "#f2f4f8",
        mutedText: "#a9b0bf",
        border: "#333947",
        accent: "#8ab4ff",
        accentText: "#071326",
        userBubble: "#263246"
      })
    },
    {
      id: "dracula",
      name: "Dracula",
      description: "Purple dark.",
      dark: true,
      swatches: ["#282a36", "#44475a", "#bd93f9"],
      colors: colors({
        background: "#282a36",
        surface: "#282a36",
        surfaceStrong: "#343746",
        sidebar: "#1f212b",
        text: "#f8f8f2",
        mutedText: "#c7cbe3",
        border: "#4f5268",
        accent: "#bd93f9",
        accentText: "#1b102a",
        userBubble: "#4b3675"
      })
    },
    {
      id: "everforest",
      name: "Everforest",
      description: "Muted green.",
      dark: true,
      swatches: ["#2b3339", "#323c41", "#a7c080"],
      colors: colors({
        background: "#2b3339",
        surface: "#2f383e",
        surfaceStrong: "#3a464c",
        sidebar: "#252d33",
        text: "#d3c6aa",
        mutedText: "#a7b09a",
        border: "#4f5b58",
        accent: "#a7c080",
        accentText: "#17210f",
        userBubble: "#3d4f3d"
      })
    },
    {
      id: "github",
      name: "GitHub",
      description: "Clean light.",
      swatches: ["#ffffff", "#f6f8fa", "#0969da"],
      colors: colors({
        background: "#ffffff",
        surface: "#ffffff",
        surfaceStrong: "#f6f8fa",
        sidebar: "#f6f8fa",
        sidebarText: "#24292f",
        sidebarMuted: "#57606a",
        sidebarHover: "#eaeef2",
        text: "#24292f",
        mutedText: "#57606a",
        border: "#d0d7de",
        accent: "#0969da",
        accentText: "#ffffff",
        userBubble: "#ddf4ff",
        assistantBubble: "#ffffff",
        composer: "#f6f8fa",
        shadow: "rgba(31, 35, 40, 0.18)"
      })
    },
    {
      id: "gruvbox",
      name: "Gruvbox",
      description: "Retro warm.",
      dark: true,
      swatches: ["#282828", "#3c3836", "#fabd2f"],
      colors: colors({
        background: "#282828",
        surface: "#282828",
        surfaceStrong: "#3c3836",
        sidebar: "#1d2021",
        text: "#fbf1c7",
        mutedText: "#d5c4a1",
        border: "#665c54",
        accent: "#fabd2f",
        accentText: "#1d2021",
        userBubble: "#504945"
      })
    },
    {
      id: "linear",
      name: "Linear",
      description: "Focused violet.",
      dark: true,
      swatches: ["#08090c", "#181a20", "#5e6ad2"],
      colors: colors({
        background: "#08090c",
        surface: "#101116",
        surfaceStrong: "#181a20",
        sidebar: "#090a0d",
        text: "#f7f8f8",
        mutedText: "#a2a7b4",
        border: "#2c2f38",
        accent: "#5e6ad2",
        accentText: "#ffffff",
        userBubble: "#262b55"
      })
    },
    {
      id: "lobster",
      name: "Lobster",
      description: "Deep red.",
      dark: true,
      swatches: ["#15080b", "#36151b", "#ff5f57"],
      colors: colors({
        background: "#15080b",
        surface: "#1f0d12",
        surfaceStrong: "#36151b",
        sidebar: "#100608",
        text: "#ffecef",
        mutedText: "#d3a3ab",
        border: "#5c2b33",
        accent: "#ff5f57",
        accentText: "#260507",
        userBubble: "#4a1f26"
      })
    },
    {
      id: "material",
      name: "Material",
      description: "Cyan slate.",
      dark: true,
      swatches: ["#263238", "#37474f", "#80cbc4"],
      colors: colors({
        background: "#263238",
        surface: "#263238",
        surfaceStrong: "#37474f",
        sidebar: "#1f2a30",
        text: "#eeffff",
        mutedText: "#b0bec5",
        border: "#546e7a",
        accent: "#80cbc4",
        accentText: "#062421",
        userBubble: "#2f4b50"
      })
    },
    {
      id: "matrix",
      name: "Matrix",
      description: "Terminal green.",
      dark: true,
      swatches: ["#020403", "#07140b", "#00ff41"],
      colors: colors({
        background: "#020403",
        surface: "#050a06",
        surfaceStrong: "#07140b",
        sidebar: "#010201",
        text: "#d4ffd9",
        mutedText: "#78b987",
        border: "#1d5c2c",
        accent: "#00ff41",
        accentText: "#001a06",
        userBubble: "#0d3215",
        shadow: "rgba(0, 255, 65, 0.16)"
      })
    },
    {
      id: "monokai",
      name: "Monokai",
      description: "Neon classic.",
      dark: true,
      swatches: ["#272822", "#3e3d32", "#a6e22e"],
      colors: colors({
        background: "#272822",
        surface: "#2d2e27",
        surfaceStrong: "#3e3d32",
        sidebar: "#20211c",
        text: "#f8f8f2",
        mutedText: "#cfcfc2",
        border: "#555449",
        accent: "#a6e22e",
        accentText: "#111706",
        userBubble: "#3f4d24"
      })
    },
    {
      id: "night-owl",
      name: "Night Owl",
      description: "Blue night.",
      dark: true,
      swatches: ["#011627", "#0b2942", "#82aaff"],
      colors: colors({
        background: "#011627",
        surface: "#071d30",
        surfaceStrong: "#0b2942",
        sidebar: "#00111f",
        text: "#d6deeb",
        mutedText: "#a8b6c8",
        border: "#1d3b53",
        accent: "#82aaff",
        accentText: "#001326",
        userBubble: "#153956"
      })
    },
    {
      id: "nord",
      name: "Nord",
      description: "Arctic blue.",
      dark: true,
      swatches: ["#2e3440", "#3b4252", "#88c0d0"],
      colors: colors({
        background: "#2e3440",
        surface: "#2e3440",
        surfaceStrong: "#3b4252",
        sidebar: "#242933",
        text: "#eceff4",
        mutedText: "#c2cad8",
        border: "#4c566a",
        accent: "#88c0d0",
        accentText: "#142027",
        userBubble: "#3f5669"
      })
    },
    {
      id: "notion",
      name: "Notion",
      description: "Paper light.",
      swatches: ["#ffffff", "#f7f6f3", "#2f3437"],
      colors: colors({
        background: "#ffffff",
        surface: "#ffffff",
        surfaceStrong: "#f7f6f3",
        sidebar: "#f7f6f3",
        sidebarText: "#2f3437",
        sidebarMuted: "#787774",
        sidebarHover: "#efeeeb",
        text: "#2f3437",
        mutedText: "#787774",
        border: "#dedbd6",
        accent: "#2f3437",
        accentText: "#ffffff",
        userBubble: "#efeeeb",
        assistantBubble: "#ffffff",
        composer: "#f7f6f3",
        shadow: "rgba(15, 15, 15, 0.14)"
      })
    },
    {
      id: "one",
      name: "One",
      description: "Atom dark.",
      dark: true,
      swatches: ["#282c34", "#21252b", "#61afef"],
      colors: colors({
        background: "#282c34",
        surface: "#282c34",
        surfaceStrong: "#21252b",
        sidebar: "#21252b",
        text: "#abb2bf",
        mutedText: "#8b93a1",
        border: "#3b4048",
        accent: "#61afef",
        accentText: "#0b1118",
        userBubble: "#2c313a"
      })
    },
    {
      id: "oscurange",
      name: "Oscurange",
      description: "Burnt orange.",
      dark: true,
      swatches: ["#120a04", "#2a1608", "#ff9d00"],
      colors: colors({
        background: "#120a04",
        surface: "#1d1007",
        surfaceStrong: "#2a1608",
        sidebar: "#0d0703",
        text: "#fff0dc",
        mutedText: "#d7ad7b",
        border: "#563015",
        accent: "#ff9d00",
        accentText: "#201000",
        userBubble: "#3d220d"
      })
    },
    {
      id: "raycast",
      name: "Raycast",
      description: "Red command.",
      dark: true,
      swatches: ["#1f1113", "#33191d", "#ff6363"],
      colors: colors({
        background: "#1f1113",
        surface: "#261518",
        surfaceStrong: "#33191d",
        sidebar: "#170c0e",
        text: "#fff1f1",
        mutedText: "#d8a9a9",
        border: "#593034",
        accent: "#ff6363",
        accentText: "#240606",
        userBubble: "#462126"
      })
    },
    {
      id: "rose-pine",
      name: "Rose Pine",
      description: "Soft dusk.",
      dark: true,
      swatches: ["#191724", "#26233a", "#ebbcba"],
      colors: colors({
        background: "#191724",
        surface: "#1f1d2e",
        surfaceStrong: "#26233a",
        sidebar: "#15131e",
        text: "#e0def4",
        mutedText: "#908caa",
        border: "#403d52",
        accent: "#ebbcba",
        accentText: "#21151b",
        userBubble: "#3a3048"
      })
    },
    {
      id: "sentry",
      name: "Sentry",
      description: "Purple signal.",
      dark: true,
      swatches: ["#1f1830", "#302348", "#7553ff"],
      colors: colors({
        background: "#1f1830",
        surface: "#241b36",
        surfaceStrong: "#302348",
        sidebar: "#171224",
        text: "#f5f0ff",
        mutedText: "#b9abd3",
        border: "#4a3a63",
        accent: "#7553ff",
        accentText: "#ffffff",
        userBubble: "#3a2b62"
      })
    },
    {
      id: "solarized",
      name: "Solarized",
      description: "Low-contrast teal.",
      dark: true,
      swatches: ["#002b36", "#073642", "#b58900"],
      colors: colors({
        background: "#002b36",
        surface: "#073642",
        surfaceStrong: "#0c4653",
        sidebar: "#00212a",
        text: "#eee8d5",
        mutedText: "#93a1a1",
        border: "#25545f",
        accent: "#b58900",
        accentText: "#161100",
        userBubble: "#164b4f"
      })
    },
    {
      id: "temple",
      name: "Temple",
      description: "High contrast green.",
      dark: true,
      swatches: ["#020202", "#151515", "#a3ff12"],
      colors: colors({
        background: "#020202",
        surface: "#090909",
        surfaceStrong: "#151515",
        sidebar: "#000000",
        text: "#f5ffe8",
        mutedText: "#b4c998",
        border: "#3b4d21",
        accent: "#a3ff12",
        accentText: "#081000",
        userBubble: "#1c3310",
        shadow: "rgba(163, 255, 18, 0.18)"
      })
    },
    {
      id: "tokyo-night",
      name: "Tokyo Night",
      description: "Neon night.",
      dark: true,
      swatches: ["#1a1b26", "#24283b", "#7aa2f7"],
      colors: colors({
        background: "#1a1b26",
        surface: "#1a1b26",
        surfaceStrong: "#24283b",
        sidebar: "#16161e",
        text: "#c0caf5",
        mutedText: "#a9b1d6",
        border: "#3b4261",
        accent: "#7aa2f7",
        accentText: "#101521",
        userBubble: "#283457"
      })
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Black and white.",
      dark: true,
      swatches: ["#000000", "#111111", "#ffffff"],
      colors: colors({
        background: "#000000",
        surface: "#080808",
        surfaceStrong: "#111111",
        sidebar: "#000000",
        text: "#fafafa",
        mutedText: "#a1a1a1",
        border: "#2a2a2a",
        accent: "#ffffff",
        accentText: "#000000",
        userBubble: "#1a1a1a"
      })
    },
    {
      id: "vs-code-plus",
      name: "VS Code Plus",
      description: "Editor blue.",
      dark: true,
      swatches: ["#1e1e1e", "#252526", "#007acc"],
      colors: colors({
        background: "#1e1e1e",
        surface: "#1f1f1f",
        surfaceStrong: "#252526",
        sidebar: "#181818",
        text: "#d4d4d4",
        mutedText: "#a6a6a6",
        border: "#3c3c3c",
        accent: "#007acc",
        accentText: "#ffffff",
        userBubble: "#26384a"
      })
    },
    {
      id: "xcode",
      name: "Xcode",
      description: "Mac editor light.",
      swatches: ["#ffffff", "#eef4ff", "#006ee6"],
      colors: colors({
        background: "#ffffff",
        surface: "#fbfdff",
        surfaceStrong: "#eef4ff",
        sidebar: "#f5f8fc",
        sidebarText: "#1f2937",
        sidebarMuted: "#667085",
        sidebarHover: "#e8f1ff",
        text: "#1f2937",
        mutedText: "#667085",
        border: "#c9d7eb",
        accent: "#006ee6",
        accentText: "#ffffff",
        userBubble: "#dcecff",
        assistantBubble: "#fbfdff",
        composer: "#f5f8fc",
        shadow: "rgba(31, 41, 55, 0.16)"
      })
    }
  ];

  const themeAliases = {
    contrast: "temple",
    forest: "everforest",
    midnight: "night-owl",
    og: "codex",
    "one-dark": "one",
    rose: "rose-pine",
    solar: "solarized"
  };
  const darkThemeIds = new Set(themes.filter((theme) => theme.dark).map((theme) => theme.id));

  function getTheme(id) {
    const themeId = themeAliases[id] || id;
    return themes.find((theme) => theme.id === themeId) || themes[0];
  }

  globalThis.GPTskinsThemes = {
    storageKey: "gptskins.theme",
    themes,
    darkThemeIds,
    getTheme
  };
})();
