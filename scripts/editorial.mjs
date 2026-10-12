import { writeFile } from "node:fs/promises";
import { loadIssues } from "../server/editorial.mjs";
import { validateIssue } from "../src/issue-schema.js";
import { dayKey } from "../src/game.js";
import path from "node:path";
const root = path.resolve(new URL("../", import.meta.url).pathname);
const issues = await loadIssues(root);
const args = process.argv.slice(2);
const action = args.shift() || "review";
if (action === "approve") {
  const date = args.shift(),
    issue = issues[date];
  if (!issue) throw new Error("No draft exists for that date");
  if (date <= dayKey())
    throw new Error(
      "Published/past days are immutable. Approve a future Eastern day.",
    );
  if (issue.status === "approved")
    throw new Error(
      "This issue is already approved; do not silently change an approved issue.",
    );
  const reviewerIndex = args.indexOf("--reviewer");
  const reviewedBy = reviewerIndex >= 0 ? args[reviewerIndex + 1] : "";
  if (
    !reviewedBy ||
    reviewedBy.startsWith("--") ||
    !args.includes("--sources-reviewed")
  )
    throw new Error(
      "Use --reviewer NAME --sources-reviewed after reading the complete issue and checking sources.",
    );
  const approved = {
    ...issue,
    status: "approved",
    reviewedBy,
    approvedAt: new Date().toISOString(),
    sourcesConfirmed: true,
  };
  validateIssue(approved);
  await writeFile(
    path.join(root, "content", "issues", `${date}.json`),
    JSON.stringify(approved, null, 2) + "\n",
  );
  console.log(
    `Approved ${date}. Run content:review and build, then commit/push to schedule publication.`,
  );
} else if (!["review", "check", "tomorrow"].includes(action)) {
  throw new Error("Use review, check, approve, or tomorrow");
}
if (action === "check") {
  console.log(
    `Validated ${Object.keys(issues).length} dated issues (${Object.values(issues).filter((issue) => issue.status === "approved").length} approved).`,
  );
  process.exit(0);
}
const render = (issue) => {
  const lines = [
    `## ${issue.date} — ${issue.theme}`,
    "",
    `**Status: ${issue.status.toUpperCase()}** · Revision ${issue.revision} · Reviewer: ${issue.reviewedBy || "awaiting your review"}`,
    "",
    issue.editorNotes || "",
    "",
    "- Decision: Needs review / Keep / Replace / Rewrite",
    "- Your edits or niche references:",
    "",
  ];
  for (const [mode, name] of Object.entries({
    daily: "Main daily quiz — FREE",
    tumblr: "The Fandom Years — era membership",
    youtube: "The YouTube Era — era membership",
    modern: "Current Lore — era membership",
  })) {
    lines.push(`### ${name}`, "");
    issue.games[mode].forEach((q, index) => {
      lines.push(
        `**Q${index + 1}. ${q.question}**`,
        "",
        ...q.options.map((choice, j) => `- **${"ABCD"[j]}.** ${choice}`),
        "",
        `**Answer: ${"ABCD"[q.answer]}. ${q.options[q.answer]}**`,
        "",
        q.explanation,
        "",
        `Reference URLs for checking: ${q.sources.map((source) => `<${source}>`).join(" · ")}`,
        "",
      );
      if (q.image)
        lines.push(
          `Visual: ${q.image.src} · ${q.image.credit} · ${q.image.rights} · ${q.image.caption || ""}`,
          "",
        );
      lines.push("- Keep / Replace / Rewrite:", "- Your note:", "");
    });
  }
  const ask = issue.ask;
  lines.push(
    `### Anonymous Ask — FREE: ${ask.answer}`,
    "",
    `Theme: ${ask.theme}. Accepted answers: ${[ask.answer, ...ask.aliases].join("; ")}.`,
    "",
    ...ask.clues.map((clue, index) => `${index + 1}. ${clue}`),
    "",
    ask.explanation,
    "",
    `Reference URLs: ${ask.sources.map((source) => `<${source}>`).join(" · ")}`,
    "",
    "- Keep / Replace / Rewrite:",
    "- Your clue or answer changes:",
    "",
  );
  return lines.join("\n");
};
if (action === "tomorrow") {
  const today = dayKey();
  const tomorrow = new Date(Date.parse(today) + 86400000)
    .toISOString()
    .slice(0, 10);
  const summary = issues[tomorrow]
    ? render(issues[tomorrow])
    : `# Deep Cut day-before review\n\nNo draft has been prepared for ${tomorrow}. Prepare one before approving publication. The existing archive remains the fallback.\n`;
  if (process.env.GITHUB_STEP_SUMMARY)
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
} else {
  const updated = await loadIssues(root);
  const rows = Object.values(updated).map(
    (issue) =>
      `| ${issue.date} | ${issue.theme} | ${issue.ask.answer} | ${issue.status} |`,
  );
  const text = [
    "# Deep Cut — day-before question review ♡",
    "",
    "This replaces the earlier repeating-calendar review with dated, themed issues. Every main quiz and its Anonymous Ask share one theme. All new issues below are drafts until you approve them.",
    "",
    "Main quiz + Anonymous Ask stay free. Three era quizzes will offer one 24-hour trial per account, then $5 once for all eras. Paid access requires the configured membership backend; no payments are active from this document.",
    "",
    "## Review and publish",
    "",
    "1. Read tomorrow’s full issue below. Edit its source JSON in `content/issues/YYYY-MM-DD.json` or send changes in chat.",
    "2. Check the reference URLs and any image rights. Reference links are review destinations, not a claim that these pages were live-verified.",
    "3. Give explicit approval for the complete dated issue. To record it locally: `npm run content:approve -- YYYY-MM-DD --reviewer YOUR_NAME --sources-reviewed`.",
    "4. Run `npm run content:review` and `npm run build`, then commit/push. Only approved issues enter the public build. They appear at midnight Eastern on their date.",
    "5. An approved or already live day should stay immutable. Prepare a new dated issue for changes.",
    "",
    "A daily GitHub Actions review at 9 a.m. Eastern shows the next day’s existing draft in the workflow summary. It does not write, approve, or publish questions. Additional drafts need to be authored as the calendar grows.",
    "",
    "| Date | Main theme | Anonymous Ask | Status |",
    "|---|---|---|---|",
    ...rows,
    "",
    ...Object.values(updated).map(render),
    "",
    "See [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md) for the approval process and visual requirements. The previous v4 schedule remains in Git history; an unapproved/missing dated issue continues using that existing archive.",
    "",
  ].join("\n");
  await writeFile(path.join(root, "QUESTION_SCHEDULE.md"), text);
  console.log(
    "Updated QUESTION_SCHEDULE.md with complete dated drafts and review fields.",
  );
}
