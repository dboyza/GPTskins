# Chrome Web Store artwork

Rebuild with `npm run store:graphics` after installing the development dependencies and Playwright Chromium.
The renderer uses `icons/logo.svg`, `graphics.html`, and the production popup HTML, CSS, JavaScript, and bundled fonts.
It makes no external requests.

| File | Dimensions | Use |
| --- | --- | --- |
| `icon-128.png` | 128 × 128 | Store icon, with 96 × 96 artwork and transparent 16px padding |
| `promo-440x280.png` | 440 × 280 | Required small promotional tile |
| `screenshot-themes-1280x800.png` | 1280 × 800 | Theme picker screenshot |
| `screenshot-fonts-1280x800.png` | 1280 × 800 | Font picker screenshot |

The generator also copies the padded icon to `icons/icon-128.png`, which is referenced by the packaged manifest.
Smaller toolbar icons keep their existing sizes.

The screenshots combine actual production popup captures with editorial captions and illustrative palette or type samples.
Chrome storage and tab APIs are mocked with sample preferences during capture; these are not screenshots of a signed-in ChatGPT session.
No private account details or conversations are used.
These assets demonstrate the picker, rather than certifying coverage of the current ChatGPT website.

Review each PNG at full size and half size after regeneration.
Check the current [Chrome Web Store image requirements](https://developer.chrome.com/docs/webstore/images) before uploading.
