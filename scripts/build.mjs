import { execFileSync } from "node:child_process";
import { publicArchiveModule } from "../server/archive.mjs";
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
  "src/publication.js",
  "src/archive-topics.js",
  "src/cover.js",
  "src/design-symbols.js",
  "src/article-layout.js",
  "src/redesign.css",
  "src/article-content.js",
  "src/archive-ui.js",
  "src/badges.js",
  "src/collectibles-ui.js",
  "src/collectibles-export.js",

  "src/collection.js",
  "src/sideblog.js",
  "src/sideblog-export.js",
  "src/lost-post.js",
  "src/game.js",
  "src/membership.js",
  "src/puzzle.js",
  "src/sound.js",
  "src/style.css",
  "src/favicon.svg",
  "src/assets/fandom-files-logo.png",
  "src/assets/fandom-files-heart-logo.png",
  "src/assets/case-doodle.svg",
  "src/assets/ask-moustache.png",
  "src/assets/pixel-cursor.png",
  "src/assets/collectibles/butterfly.svg",
  "src/assets/collectibles/camera.svg",
  "src/assets/collectibles/player.svg",
  "src/assets/collectibles/folder.svg",
  "src/assets/collectibles/stamp.svg",
  "src/assets/collectibles/chat.svg",
  "src/assets/collectibles/cursor.svg",

  "src/assets/fonts/outfit-variable.ttf",
  "src/assets/fonts/OFL.txt",
  "src/assets/fonts/caveat-variable.woff",
  "src/assets/fonts/CAVEAT-OFL.txt",
  "src/assets/fonts/dm-sans-variable.woff",
  "src/assets/fonts/DM-SANS-OFL.txt",
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
await writeFile(path.join(output, "src/archive-catalog.js"), publicArchiveModule());
console.log(
  `The Fandom Files built in dist/ (${files.size + 3} public files; premium questions stay in the server function).`,
);

execFileSync("npm", ["--prefix", "studio", "run", "build"], { cwd: root, stdio: "inherit", env: { ...process.env, SANITY_STUDIO_TELEMETRY_ENABLED: "false" } });
