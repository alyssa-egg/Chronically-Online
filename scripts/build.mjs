import { mkdir, copyFile, rm, lstat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { bank } from "../src/questions.js";
import { loadIssues, publicIssueModule } from "../server/editorial.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const issues = await loadIssues(root);
const files = new Set([
  "index.html",
  "src/app.js",
  "src/game.js",
  "src/membership.js",
  "src/puzzle.js",
  "src/sound.js",
  "src/style.css",
  "src/favicon.svg",
  "src/assets/deep-cut-logo.png",
  "src/assets/case-doodle.svg",
]);
for (const issue of Object.values(issues).filter(
  (issue) => issue.status === "approved",
)) {
  for (const q of Object.values(issue.games).flat())
    if (q.image) files.add(q.image.src.slice(2));
}
for (const file of files)
  if ((await lstat(path.join(root, file))).isSymbolicLink())
    throw new Error(`Refusing to publish a symlink: ${file}`);
const existing = await lstat(output).catch((error) => {
  if (error.code !== "ENOENT") throw error;
  return null;
});
if (existing?.isSymbolicLink())
  throw new Error("Refusing to build into a symlinked dist directory");
await rm(output, { recursive: true, force: true });
for (const file of files) {
  await mkdir(path.dirname(path.join(output, file)), { recursive: true });
  await copyFile(path.join(root, file), path.join(output, file));
}
await writeFile(
  path.join(output, "src/questions.js"),
  `export const bank = ${JSON.stringify(bank.filter((q) => q.mode === "daily"))};\n`,
);
await writeFile(path.join(output, "src/issues.js"), publicIssueModule(issues));
console.log(
  `Deep Cut built in dist/ (${files.size + 2} public files; premium questions stay in the server function).`,
);
