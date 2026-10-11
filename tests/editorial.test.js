import test from "node:test";
import assert from "node:assert/strict";
import { loadIssues, publicIssues } from "../server/editorial.mjs";
import { validateIssue, validIssueDate } from "../src/issue-schema.js";
const issues = await loadIssues();
const draft = issues["2026-10-13"];
const approved = () => ({
  ...structuredClone(draft),
  status: "approved",
  reviewedBy: "Test editor",
  approvedAt: "2026-10-12T14:00:00Z",
  sourcesConfirmed: true,
});
test("six drafted days contain complete games and asks paired to the main theme", () => {
  assert.equal(Object.keys(issues).length, 6);
  for (const issue of Object.values(issues)) {
    assert.equal(issue.status, "draft");
    assert.equal(issue.ask.theme, issue.theme);
    assert.equal(Object.values(issue.games).flat().length, 25);
    validateIssue(issue);
  }
});
test("the main drafts include beauty, gaming, Emma, Enya and Wildflower without repeating a prompt", () => {
  const all = Object.values(issues).flatMap((issue) => issue.games.daily);
  assert.equal(new Set(all.map((q) => q.question)).size, 60);
  const text = JSON.stringify(all).toLowerCase();
  for (const name of [
    "Bethany",
    "Emma",
    "PewDiePie",
    "Markiplier",
    "jacksepticeye",
    "Enya",
    "Wildflower",
  ])
    assert.ok(text.includes(name.toLowerCase()), name);
});
test("drafts do not reach the public manifest; approved public issues expose only the free games", () => {
  assert.deepEqual(publicIssues(issues), {});
  const issue = approved();
  const manifest = publicIssues({ [issue.date]: issue });
  assert.deepEqual(Object.keys(manifest[issue.date].games), ["daily"]);
  assert.equal(manifest[issue.date].ask.answer, issue.ask.answer);
  assert.ok(!JSON.stringify(manifest).includes('"mode":"modern"'));
});
test("approval must precede publication in Eastern time, including the UTC date boundary", () => {
  const issue = approved();
  issue.approvedAt = "2026-10-13T03:59:59Z";
  validateIssue(issue);
  issue.approvedAt = "2026-10-13T04:00:00Z";
  assert.throws(() => validateIssue(issue), /approve before/);
  issue.approvedAt = "2026-10-12T14:00:00Z";
  issue.sourcesConfirmed = false;
  assert.throws(() => validateIssue(issue), /confirmed sources/);
});
test("content validation rejects impossible dates, uncredited images and mismatched ask themes", () => {
  assert.equal(validIssueDate("2026-02-30"), false);
  const issue = structuredClone(draft);
  issue.games.daily.find((q) => q.image).image.rights = "unknown";
  assert.throws(() => validateIssue(issue), /usage rights/);
  const other = structuredClone(draft);
  other.ask.theme = "different";
  assert.throws(() => validateIssue(other), /same theme/);
  const missing = structuredClone(draft);
  missing.games.daily[0].sources = [];
  assert.throws(() => validateIssue(missing), /source needed/);
});
