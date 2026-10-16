// Minimal static file server for index.html and node_modules.
// Usage: node serve.mjs [port]   (default port 8080)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.argv[2] ?? process.env.PORT ?? 8080);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".map": "application/json; charset=utf-8",
  ".tar.gz": "application/gzip",
  ".data": "application/octet-stream",
};

function contentType(file) {
  if (file.endsWith(".tar.gz")) return types[".tar.gz"];
  return types[extname(file)] ?? "application/octet-stream";
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, "http://localhost");
    const rel = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
    const file = normalize(join(root, rel));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": contentType(file),
      "Cache-Control": "no-cache",
    });
    res.end(body);
  } catch (err) {
    res.writeHead(err.code === "ENOENT" || err.code === "EISDIR" ? 404 : 500).end("Not found");
  }
}).listen(port, () => {
  console.log(`pglite-visualizer running at http://localhost:${port}`);
});
