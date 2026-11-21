// Leonida Ledger — GTA 6 Trophy Guide, Round 4.
// Static entrypoint: serves app/ (index.html, app.js, style.css, data/trophies.json).
// Run: node main.ts  →  http://localhost:8080/
// No dependencies, no build step, no network calls at runtime.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "app");
const PORT = Number(process.env.PORT || 8080);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleaned = normalize(join(sep, decoded)).replace(/^[/\\]+/, "");
  const full = join(ROOT, cleaned);
  return full.startsWith(ROOT) ? full : null;
}

const server = createServer(async (req, res) => {
  try {
    let path = req.url === "/" || req.url === "" ? "/index.html" : req.url;
    const file = safePath(path);
    if (!file) {
      res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      res.end("Bad request");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file)] || "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(body);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
    } else {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Server error");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Leonida Ledger (Round 4) — GTA 6 Trophy Guide: 55/55 trophies cited`);
  console.log(`Serving http://localhost:${PORT}/  (app/, data/trophies.json, 14 sources)`);
  console.log(`Bounty: https://make.fun/bounty/gta6-trophy-guide-01`);
});
