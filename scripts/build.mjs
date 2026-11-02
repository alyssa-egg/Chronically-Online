import { validateLoggedOn } from '../src/logged-on.js';
import { validateDailyFiles } from '../src/daily-file.js';
import { validateCapsuleBank } from '../src/capsule.js';
import { execFileSync } from "node:child_process";
import { publicArchiveModule } from "../server/archive.mjs";
import { validateConnectionBank } from "../src/connection.js";
import { mkdir, copyFile, rm, lstat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { bank } from "../src/questions.js";
import { loadIssues, publicIssueModule } from "../server/editorial.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const connectionErrors=validateConnectionBank();
if(connectionErrors.length)throw new Error(`Invalid Daily Connection content:\n${connectionErrors.join('\n')}`);
const capsuleErrors=validateCapsuleBank();if(capsuleErrors.length)throw new Error(capsuleErrors.join('\n'));
const fileErrors=validateDailyFiles();if(fileErrors.length)throw new Error(fileErrors.join('\n'));
const storyErrors=validateLoggedOn();if(storyErrors.length)throw new Error(storyErrors.join('\n'));
const issues = await loadIssues(root);
const files = new Set([
  "index.html",
  "src/app.js",
  "src/open-cut-content.js",
  "src/open-cut-extra-answers.js",
  "src/open-cut.js",
  "src/connection-content.js",
  "src/connection-puzzles.json",
  "src/connection.js",
  "src/capsule-content.js",
  "src/capsule.js",
  "src/daily-file-content.js",
  "src/daily-file.js",
  "src/logged-on-content.js",
  "src/logged-on.js",
  "src/logged-on-ui.js",
  "src/logged-on.css",
  "src/daily-file-ui.js",
  "src/daily-file.css",
  "src/capsule-ui.js",
  "src/capsule-api.js",
  "src/capsule.css",
  "src/connection-ui.js",
  "src/connection.css",
  "src/era-personality.js",
  "src/open-cut-ui.js",
  "src/quiz-library.js",
  "src/quiz-library-ui.js",
  "src/assets/eras/fandom-years.jpg",
  "src/assets/eras/influencer-era.jpg",
  "src/assets/eras/current-lore.jpg",
  "src/memories-ui.js",
  "src/deep-cut-questions.js",
  "src/deep-cut.js",
  "src/deep-cut-ui.js",
  "src/era-discoveries.js",
  "src/era-discovery-ui.js",
  "src/site-identity.js",
  "src/archive-atoms.js",
  "src/scrapbook.js",
  "src/scrapbook-ui.js",
  "src/redesign.css",
  "src/launch.css",
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
