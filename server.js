import http from "node:http";
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
};
const publicFiles = new Set([
  "/index.html",
  "/src/app.js",
  "/src/game.js",
  "/src/questions.js",
  "/src/issues.js",
  "/src/membership.js",
  "/src/puzzle.js",
  "/src/sound.js",
  "/src/style.css",
  "/src/favicon.svg",
  "/src/assets/deep-cut-logo.png",
  "/src/assets/case-doodle.svg",
]);
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(
        req.url,
        "http://" + (req.headers.host || "localhost"),
      );
      const pathname = decodeURIComponent(url.pathname);
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
      const name = pathname === "/" ? "/index.html" : pathname;
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
      res.end("Deep Cut could not load this issue.");
    }
  })
  .listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
    console.log("Deep Cut listening on port " + (process.env.PORT || 3000)),
  );
