# GPTskins

GPTskins is a dependency-free Manifest V3 browser extension that adds 12 built-in themes to ChatGPT.

Bring back the classic **OG ChatGPT** look with the charcoal gray interface, or switch into popular editor-inspired themes like One Dark, Dracula, and Tokyo Night.

## Preview

<table>
  <tr>
    <td><strong>OG</strong><br><img src="docs/screenshots/og-theme.png" width="1000" alt="GPTskins OG ChatGPT theme preview"></td>
    <td><strong>Midnight</strong><br><img src="docs/screenshots/midnight-theme.png" width="1000" alt="GPTskins Midnight theme preview"></td>
  </tr>
  <tr>
    <td><strong>One Dark</strong><br><img src="docs/screenshots/one-dark-theme.png" width="1000" alt="GPTskins One Dark theme preview"></td>
    <td><strong>Dracula</strong><br><img src="docs/screenshots/dracula-theme.png" width="1000" alt="GPTskins Dracula theme preview"></td>
  </tr>
</table>

## Features

- Popup-only theme picker.
- Adds 12 custom themes while preserving ChatGPT's Default look.
- Includes the **OG ChatGPT charcoal theme** for the classic gray ChatGPT feel.
- Built-in themes: Default, OG, Midnight, One Dark, Dracula, Catppuccin, Tokyo Night, Nord, Gruvbox, Forest, Solar, Rose, and High Contrast.
- Saved selection with `chrome.storage.sync`.
- Automatic theme loading on `chatgpt.com` and `chat.openai.com`.
- No backend, login, external API, or build step.

## Available Themes

- OG
- Midnight
- One Dark
- Dracula
- Catppuccin
- Tokyo Night
- Nord
- Gruvbox
- Forest
- Solar
- Rose
- High Contrast

## Load in Chrome or Edge

1. Clone or download the extension to a folder on your computer.

   ```
   git clone https://github.com/dboyza/GPTskins.git
   ```

   You can also use GitHub's **Code** > **Download ZIP** option and unzip it anywhere you like.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the folder you cloned or unzipped.
6. Open ChatGPT, click the GPTskins toolbar icon, and pick a theme.

## Project Layout

- `manifest.json` defines the Manifest V3 extension.
- `shared/themes.js` contains the built-in theme definitions.
- `content/content.js` applies the selected theme on ChatGPT pages.
- `popup/` contains the extension popup UI.
- `icons/` contains generated extension icons.
