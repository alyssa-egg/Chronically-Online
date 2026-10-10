import { mkdir, copyFile, rm, lstat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const existing = await lstat(output).catch((error) => {
  if (error.code !== "ENOENT") throw error;
  return null;
});
if (existing?.isSymbolicLink())
  throw new Error("Refusing to build into a symlinked dist directory");
await rm(output, { recursive: true, force: true });
const files = [
  "index.html",
  "src/app.js",
  "src/game.js",
  "src/sound.js",
  "src/style.css",
  "src/favicon.svg",
  "src/assets/deep-cut-logo.png",
];
for (const file of files) {
  await mkdir(path.dirname(path.join(output, file)), { recursive: true });
  await copyFile(path.join(root, file), path.join(output, file));
}
console.log("Deep Cut static website built in dist/ (7 public files).");
