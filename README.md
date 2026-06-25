# ThemeGPT

ThemeGPT is a dependency-free Manifest V3 browser extension that applies built-in themes to ChatGPT.

## Features

- Popup-only theme picker.
- Built-in themes: Default, Midnight, Forest, Solar, Rose, and High Contrast.
- Saved selection with `chrome.storage.sync`.
- Automatic theme loading on `chatgpt.com` and `chat.openai.com`.
- No backend, login, external API, or build step.

## Load in Chrome or Edge

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this folder: `C:\Users\Dylan\Documents\extension`.
5. Open ChatGPT, click the ThemeGPT toolbar icon, and pick a theme.

## Project Layout

- `manifest.json` defines the Manifest V3 extension.
- `shared/themes.js` contains the built-in theme definitions.
- `content/content.js` applies the selected theme on ChatGPT pages.
- `popup/` contains the extension popup UI.
- `icons/` contains generated extension icons.
