const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4176);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = path.join(root, safePath);

  if (urlPath === "/" || urlPath === "") {
    filePath = path.join(root, "index.html");
  }

  fs.stat(filePath, (err, stat) => {
    if (err) return send(res, 404, "Not found");
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) return send(res, 404, "Not found");
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Cache-Control": "no-store"
      });
      res.end(data);
    });
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Ice Fire DApp running at http://127.0.0.1:${port}`);
});
