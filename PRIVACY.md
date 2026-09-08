# GPTskins privacy policy

Last updated: September 8, 2026.

GPTskins changes the appearance of ChatGPT using built-in themes and fonts.
The extension has no developer-operated backend, analytics, advertising, or external font service.

## Information handled on your device

GPTskins inspects the structure, computed styles, and text of pages on `chatgpt.com` and `chat.openai.com` to identify surfaces that need theming.
This can include conversation text, visible account labels, and text in editing surfaces because these are part of the page.
It uses this information locally to recognize interface elements and apply colors and typography.
It does not save page text, send it to the developer or another service, or use it to profile you.

The extension reads the current ChatGPT page URL to respond to navigation and recognize special pages.
When you choose a style, the popup checks the active tab's URL, when available, to decide whether to apply it immediately to ChatGPT.
URLs are not saved or transmitted by GPTskins.
The extension does not request access to your browsing history, cookies, microphone, camera, or files.

## Saved preferences and browser sync

GPTskins saves two identifiers in Chrome's `storage.sync`: your selected theme (`gptskins.theme`) and font (`gptskins.font`).
These preferences remain until replaced or removed through Chrome.
If browser sync is enabled, Chrome can synchronize these settings through Google's browser sync service to your other signed-in browsers.
The developer does not receive them.
Chrome's handling of synchronized information is governed by [Google's privacy policy](https://policies.google.com/privacy) and your browser settings.
See [Chrome's storage documentation](https://developer.chrome.com/docs/extensions/reference/api/storage/) for sync behavior.

Searches within the picker are used only to filter its list and are not saved.
All theme definitions, scripts, and coding-font files are included in the extension.

## Sharing and limited use

GPTskins does not sell user information or share it for advertising, credit decisions, or unrelated purposes.
The extension does not transmit conversation content, page URLs, or usage events to the developer or third parties.
Browser synchronization of style preferences is the only synchronization requested by GPTskins.
Its use of information obtained through Chrome APIs complies with the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data), including the Limited Use requirements, and is limited to providing its appearance customization features.

ChatGPT itself continues to process information under its own policies, independently of GPTskins.
This policy covers the extension, not ChatGPT, Chrome, or GitHub.

## Your controls and contact

Choose Default for both Theme and Font to replace your saved selections with the default identifiers and restore the native appearance.
Disable or uninstall GPTskins to stop its access to ChatGPT pages.
Use Chrome's sync controls to manage synchronized browser data.

For privacy questions, contact the maintainer through the [GPTskins issue tracker](https://github.com/dboyza/GPTskins/issues).
GitHub issues are public, so do not include private conversations or personal information.
Any information you choose to submit there is handled by GitHub and is separate from the extension's operation.
