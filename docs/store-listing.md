# Chrome Web Store listing

Prepared for GPTskins 1.0.0.
Review the final uploaded manifest and current dashboard labels before submitting.

## Name and short description

**Name:** GPTskins

**Short description:** Give ChatGPT a new look with 34 built-in themes and 7 font choices, including bundled coding fonts.

## Full description

Give ChatGPT a look that feels like yours.
GPTskins brings editor-inspired colors and carefully sized typography to the ChatGPT website.

- Choose from 34 dark and light themes, including Catppuccin, Nord, Rose Pine, Tokyo Night, and GitHub Dark.
- Search themes by name and preview their palettes before choosing.
- Pick from 7 font choices, including bundled JetBrains Mono, Fira Code, and Space Mono.
- Mix a theme with any font, or reset either choice independently to Default.
- Keep your choices across visits using Chrome's synchronized extension storage.

Open ChatGPT, click the GPTskins toolbar icon, and choose a theme or font.
Changes apply immediately to supported ChatGPT pages.

GPTskins locally inspects page structure, styles, text, and the current URL to apply its visual changes.
Page text can include conversation content, but GPTskins does not save or transmit it.
Only your theme and font identifiers are saved using Chrome sync storage, which may synchronize them through Google if browser sync is enabled.
There is no developer backend, analytics, advertising, or external font request.

Works on chatgpt.com and chat.openai.com.
ChatGPT website updates can change compatibility; please report visual issues through the project's support link.
GPTskins is an independent project and is not affiliated with or endorsed by OpenAI.

## Single purpose

Customize the appearance of the ChatGPT website with user-selected built-in color themes and fonts.

## Permission justifications

| Permission | Dashboard justification |
| --- | --- |
| `storage` | Save and restore the selected theme and font identifiers using Chrome sync storage so the user's appearance choices persist across visits and supported synced browsers. |
| `https://chatgpt.com/*` | Apply themes and fonts to ChatGPT pages and inspect their local DOM, styles, text, and URL to recognize interface surfaces and navigation; also identify a supported active tab for immediate style updates. |
| `https://chat.openai.com/*` | Provide the same appearance customization on the legacy ChatGPT host when a page is served there. |

**Remote code:** No.
All executable code and coding-font files are packaged with the extension.
There are no remote script loaders or external font services.

## Privacy dashboard preparation

Use [PRIVACY.md](../PRIVACY.md) as the privacy policy.
The intended public URL is `https://github.com/dboyza/GPTskins/blob/master/PRIVACY.md`.
This URL is not ready merely because the file exists locally: publish the commit and verify the page opens while signed out before entering it in the dashboard.

Google requires disclosure even for local processing, and the dashboard declarations must agree with the code and policy.
Do not equate “nothing sent to our servers” with “no user data handled.”
See the [User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) and [privacy field instructions](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

The following is a mapping for reviewing the dashboard's actual definitions, not a claim that every checkbox is already settled:

| Information handled | Disclosure to carry into dashboard review |
| --- | --- |
| Website content | Local DOM and text inspection can include conversations and editing surfaces; no retention or transmission. |
| Web browsing activity | Current supported page and active-tab URL inspection for navigation and application; no browsing-history collection, retention, or transmission. |
| Preferences | Theme and font identifiers saved to Chrome sync storage, potentially synchronized through Google. |
| Sensitive text within a page | Conversation text can contain personal or sensitive information; GPTskins does not extract such categories into records, but the local text access must remain disclosed. |

Select the applicable data categories using the definitions shown in the dashboard and include the local-only processing explanation wherever available.
If the dashboard's collection wording leaves this distinction unclear, ask Chrome Web Store support before certifying a declaration that contradicts the policy.
The code supports certifications that data is not sold, used for unrelated purposes, or used for creditworthiness or lending decisions.

## Links and reviewer instructions

- Homepage: https://github.com/dboyza/GPTskins
- Support: https://github.com/dboyza/GPTskins/issues
- Category: choose the closest available appearance or customization category for an extension, not a Chrome browser theme.
- Language: English.

For review, open ChatGPT using a reviewer-owned account if the site requires sign-in, then open the GPTskins toolbar popup.
Select a dark theme, a light theme, and a coding font; refresh to check persistence.
Select Default independently in each tab to restore native colors and typography.
GPTskins itself requires no account, subscription, or API key.
