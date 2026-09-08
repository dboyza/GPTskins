"use strict";

// The browser boundary is mocked. Both suites execute the real extension scripts.
async function installChromeMock(page, options = {}) {
  await page.addInitScript((config) => {
    const key = "gptskins-test-storage";
    const saved = sessionStorage.getItem(key);
    let values = saved ? JSON.parse(saved) : { ...config.stored };
    const listeners = { message: [], storage: [] };
    const calls = { writes: [], queries: [], messages: [], reads: [] };
    const runtime = { getURL: (path) => new URL(`/${path}`, location.origin).href, onMessage: { addListener: (listener) => listeners.message.push(listener) } };
    function callbackWithError(callback, error, value) {
      queueMicrotask(() => {
        if (error) runtime.lastError = { message: error };
        try { callback(value); } finally { delete runtime.lastError; }
      });
    }
    globalThis.chrome = {
      runtime,
      storage: {
        sync: {
          get(keys, callback) {
            calls.reads.push({ keys, bodyExists: Boolean(document.body) });
            const result = Object.fromEntries(keys.filter((name) => name in values).map((name) => [name, values[name]]));
            callbackWithError(callback, config.getError, result);
          },
          set(update, callback) {
            calls.writes.push(update);
            if (!config.setError) {
              Object.assign(values, update);
              sessionStorage.setItem(key, JSON.stringify(values));
            }
            callbackWithError(callback, config.setError);
          }
        },
        onChanged: { addListener: (listener) => listeners.storage.push(listener) }
      },
      tabs: {
        query(query, callback) {
          calls.queries.push(query);
          callbackWithError(callback, config.queryError, config.tabs ?? [{ id: 17, url: "https://chatgpt.com/" }]);
        },
        sendMessage(id, message, callback) {
          calls.messages.push({ id, message });
          callbackWithError(callback, config.sendError, { ok: true });
        }
      }
    };
    globalThis.GPTskinsTestChrome = {
      calls,
      stored: () => ({ ...values }),
      message(message) {
        const responses = [];
        listeners.message.forEach((listener) => listener(message, {}, (response) => responses.push(response)));
        return responses;
      },
      change(changes, namespace = "sync") {
        listeners.storage.forEach((listener) => listener(changes, namespace));
      }
    };
  }, options);
}

module.exports = { installChromeMock };
