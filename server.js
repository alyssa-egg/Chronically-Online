import { publicArchiveModule } from "./server/archive.mjs";
import http from "node:http";
import { handleArticleRequest } from "./server/articles.mjs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { bank } from "./src/questions.js";
import { loadIssues, publicIssueModule } from "./server/editorial.mjs";
import { handlePremiumRequest } from "./server/premium.mjs";
const root = path.resolve(fileURLToPath(new URL("./", import.meta.url)));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};
const publicFiles = new Set([
  "/index.html",
  "/src/app.js",
  "/src/publication.js",
  "/src/article-content.js",
  "/src/archive-ui.js",
  "/src/badges.js",
  "/src/collectibles-ui.js",
  "/src/collectibles-export.js",

  "/src/collection.js",
  "/src/sideblog.js",
  "/src/sideblog-export.js",
  "/src/lost-post.js",
  "/src/archive-catalog.js",
  "/src/game.js",
  "/src/questions.js",
  "/src/issues.js",
  "/src/membership.js",
  "/src/puzzle.js",
  "/src/sound.js",
  "/src/style.css",
  "/src/favicon.svg",
  "/src/assets/fandom-files-logo.png",
  "/src/assets/case-doodle.svg",
  "/src/assets/ask-moustache.png",
  "/src/assets/pixel-cursor.png",
  "/src/assets/collectibles/butterfly.svg",
  "/src/assets/collectibles/camera.svg",
  "/src/assets/collectibles/player.svg",
  "/src/assets/collectibles/folder.svg",
  "/src/assets/collectibles/stamp.svg",
  "/src/assets/collectibles/chat.svg",
  "/src/assets/collectibles/cursor.svg",

  "/src/assets/fonts/outfit-variable.ttf",
  "/src/assets/fonts/OFL.txt",
]);
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(
        req.url,
        "http://" + (req.headers.host || "localhost"),
      );
      const pathname = decodeURIComponent(url.pathname);
      if (pathname === "/api/articles") {
        const result = await handleArticleRequest(new Request(url, { method: req.method }));
        res.writeHead(result.status, Object.fromEntries(result.headers));
        return res.end(Buffer.from(await result.arrayBuffer()));
      }
      if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        const adminRoot = path.resolve(root, "dist/admin");
        const relative = pathname.slice(7);
        const adminFile = relative && path.extname(relative) ? path.resolve(adminRoot, relative) : path.join(adminRoot, "index.html");
        if (!adminFile.startsWith(adminRoot + path.sep)) { res.writeHead(404); return res.end("Not found"); }
        try {
          const data = await readFile(adminFile);
          res.writeHead(200, { "Content-Type": types[path.extname(adminFile)] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
          return res.end(data);
        } catch { res.writeHead(404); return res.end("Build the editorial dashboard first: npm run build"); }
      }
      if (pathname.startsWith("/api/")) {
        const chunks = [];
        let size = 0;
        const limit = pathname === "/api/stripe-webhook" ? 131072 : 4096;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > limit) {
            res.writeHead(413, {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            });
            res.end(JSON.stringify({ error: "Request is too large." }));
            return;
          }
          chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);
        const request = new Request(url, {
          method: req.method,
          headers: req.headers,
          ...(["GET", "HEAD"].includes(req.method) ? {} : { body }),
        });
        const result = await handlePremiumRequest(request, process.env, {
          issues: await loadIssues(root),
        });
        res.writeHead(result.status, Object.fromEntries(result.headers));
        return res.end(Buffer.from(await result.arrayBuffer()));
      }
      const name = pathname === "/" || /^\/stories\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(pathname) ? "/index.html" : pathname;
      const issues = await loadIssues(root);
      const images = Object.values(issues)
        .filter((issue) => issue.status === "approved")
        .flatMap((issue) =>
          Object.values(issue.games)
            .flat()
            .filter((q) => q.image)
            .map((q) => q.image.src.slice(1)),
        );
      if (!publicFiles.has(name) && !images.includes(name)) {
        res.writeHead(404);
        return res.end("Not found");
      }
      const file = path.resolve(root, "." + name);
      if (!file.startsWith(root + path.sep)) {
        res.writeHead(404);
        return res.end("Not found");
      }
      const data =
        name === "/src/questions.js"
          ? `export const bank = ${JSON.stringify(bank.filter((q) => q.mode === "daily"))};\n`
          : name === "/src/archive-catalog.js"
            ? publicArchiveModule()
          : name === "/src/issues.js"
            ? publicIssueModule(issues)
            : await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)],
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    } catch (error) {
      res.writeHead(500);
      res.end("The Fandom Files could not load this issue.");
    }
  })
  .listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
    console.log("The Fandom Files listening on port " + (process.env.PORT || 3000)),
  );
