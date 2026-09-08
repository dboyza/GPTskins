"use strict";

const base = require("@playwright/test");

// Local browser suites must not silently call external services or ignore script crashes.
const test = base.test.extend({
  diagnostics: [async ({ page, context }, use, testInfo) => {
    const errors = [];
    const unexpectedRequests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (["127.0.0.1", "localhost"].includes(url.hostname)) return route.continue();
      unexpectedRequests.push(`${url.protocol}//${url.hostname}`);
      return route.abort("blockedbyclient");
    });
    await use();
    if (errors.length || unexpectedRequests.length) {
      await testInfo.attach("browser-errors", { body: JSON.stringify({ errors, unexpectedRequests }, null, 2), contentType: "application/json" });
    }
    base.expect(errors, "Unexpected browser script errors").toEqual([]);
    base.expect(unexpectedRequests, "Unexpected external network requests").toEqual([]);
  }, { auto: true }]
});

module.exports = { test, expect: base.expect };
