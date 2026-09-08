# Release GPTskins

The release kit is local until a maintainer uploads it to the Chrome Web Store.
Account registration, the registration fee, account verification, and final submission are handled by the publisher.

## Build and verify

Use Node.js 22 or newer and install the development tools:

```sh
npm ci
npx playwright install chromium
npm run store:graphics
npm run test:full
npm run package
npm run test:release
```

Run these commands sequentially so Playwright runs do not clear each other's artifacts.
The release package is `artifacts/gptskins-1.0.0.zip` for manifest version 1.0.0.
The ZIP must contain `manifest.json` at its root, the runtime scripts and popup, icons, and bundled fonts with their license notices.
Development dependencies, test fixtures, private captures, and documentation do not belong in the uploaded extension.

The release test rebuilds the ZIP, compares its contents byte for byte with the release inputs, and loads its extracted files with an unchanged manifest.
It checks the packaged popup, theme/font application, persistence, and bundled font loading in a disposable browser profile.
The packager also writes a matching `.zip.sha256` file; retain both artifacts and do not edit the verified ZIP before upload.
Automated fixtures do not certify the current upstream ChatGPT site.
Also run the manual checks in [the live audit guide](live-audit.md) against the extracted extension, covering themes, fonts, dialogs, composer, sidebar, code, tables, and plan controls available to your account.
Record unavailable surfaces as coverage gaps.

Inspect the generated assets in `docs/store/` before uploading:

- `icon-128.png`: a padded 128×128 store icon.
- `promo-440x280.png`: a 440×280 promotional image.
- `screenshot-themes-1280x800.png` and `screenshot-fonts-1280x800.png`: production picker captures with captions and palette/font illustrations, without private account content.

The editable sources are `docs/store/graphics.html` and `scripts/store-graphics.js`; regenerate the images after relevant UI changes.
Chrome specifies its accepted dimensions and formats in [Supplying Images](https://developer.chrome.com/docs/webstore/images).

## Upload the first release

1. Review [the listing copy](store-listing.md), permission explanations, and [privacy policy](../PRIVACY.md) against the final package.
2. Commit the verified source and store assets locally.
3. Publish the policy when ready and confirm its public URL opens without authentication.
   A local file or an unpushed GitHub path is insufficient.
4. In the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole), choose **Add new item** and upload the tested ZIP.
5. Fill in Store Listing, Privacy practices, Distribution, and any requested reviewer instructions using `store-listing.md`.
6. Review the preview, graphics, links, permissions, and privacy certifications, then submit for review when ready.
   Choose deferred publishing if you want to control the launch after approval.

Follow Google's [publishing guide](https://developer.chrome.com/docs/webstore/publish) for the current dashboard flow.
Uploading or submitting is a separate publisher action; the local scripts do neither.

## Future updates

Increase `manifest.json` and `package.json` to the same new version, then run `npm install --package-lock-only` to update the lockfile through npm.
For example, a first bug-fix release can use `1.0.1`.
Do not manually edit generated changelogs.
Repeat the tests, graphics review, packaging, and exact-package verification above.
Review permissions and privacy disclosures whenever behavior changes.

Commit the release source, retain the verified ZIP and its checksum with your release records, and upload it through **Upload New Package** on the existing store item's Package tab.
Each package update needs a greater version and a new review; see [Google's update guide](https://developer.chrome.com/docs/webstore/update).
Do not create a new store item for routine updates.
