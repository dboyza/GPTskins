"use strict";

const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const port = Number(process.env.GPTSKINS_TEST_PORT || 8766);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ttf": "font/ttf" };

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/__health") {
      response.writeHead(200, { "Content-Type": "text/plain", "Cache-Control": "no-store" });
      return response.end("GPTskins test server");
    }
    const file = path.resolve(root, `.${pathname === "/" ? "/tests/fixtures/theme-surfaces.html" : pathname}`);
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative) || relative.split(path.sep).some((part) => part.startsWith(".")) || !/^(tests|content|shared|popup|icons|fonts)[/\\]/.test(relative)) {
      response.writeHead(403);
      return response.end("Forbidden");
    }
    const content = await fs.readFile(file);
    response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
server.listen(port, "127.0.0.1", () => console.log(`GPTskins fixtures: http://127.0.0.1:${port}`));
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.close(() => process.exit(0)));
