import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { validateIssue } from "../src/issue-schema.js";
export async function loadIssues(root = process.cwd()) {
  const folder = path.join(root, "content", "issues");
  const names = await readdir(folder);
  const issues = {};
  for (const name of names
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort()) {
    const issue = validateIssue(
      JSON.parse(await readFile(path.join(folder, name), "utf8")),
    );
    if (issue.date + ".json" !== name)
      throw new Error(`Issue date does not match filename: ${name}`);
    issues[issue.date] = issue;
  }
  return issues;
}
export function publicIssues(issues) {
  return Object.fromEntries(
    Object.entries(issues)
      .filter(([, issue]) => issue.status === "approved")
      .map(([date, issue]) => [
        date,
        {
          id: issue.id,
          date,
          revision: issue.revision,
          theme: issue.theme,
          games: { daily: issue.games.daily },
          ask: issue.ask,
        },
      ]),
  );
}
export function publicIssueModule(issues) {
  return `export const approvedIssues = ${JSON.stringify(publicIssues(issues))};\n`;
}
