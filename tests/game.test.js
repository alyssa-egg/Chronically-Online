import test from "node:test";
import assert from "node:assert/strict";
import {
  dailyQuestions,
  dayKey,
  nextReset,
  rank,
  scoreAnswers,
  bank,
  departments,
  validAnswers,
  modes,
  getMode,
} from "../src/game.js";

test("daily issue is deterministic, unique, and balanced across the four departments", () => {
  const issue = dailyQuestions("2026-10-10");
  assert.deepEqual(issue, dailyQuestions("2026-10-10"));
  assert.equal(issue.length, 10);
  assert.equal(new Set(issue.map((q) => q.id)).size, 10);
  for (const d of departments)
    assert.equal(issue.filter((q) => q.category === d.name).length, d.count);
});
test("questions never repeat on adjacent days, including year and leap-day boundaries", () => {
  for (const start of [
    "2026-10-10",
    "2026-12-25",
    "2028-02-25",
    "1969-12-25",
  ]) {
    let previous = new Set();
    for (let offset = 0; offset < 40; offset++) {
      const day = new Date(Date.parse(start) + offset * 86400000)
        .toISOString()
        .slice(0, 10);
      const current = dailyQuestions(day).map((q) => q.id);
      assert.equal(current.filter((id) => previous.has(id)).length, 0, day);
      previous = new Set(current);
    }
  }
});
test("selection covers the full archive within twelve days", () => {
  const ids = new Set();
  for (let i = 0; i < 12; i++)
    dailyQuestions(
      new Date(Date.parse("2026-10-10") + i * 86400000)
        .toISOString()
        .slice(0, 10),
    ).forEach((q) => ids.add(q.id));
  assert.equal(ids.size, bank.length);
});
test("answer shuffling preserves the correct text and varies answer positions", () => {
  const positions = new Set();
  for (let i = 0; i < 30; i++)
    for (const q of dailyQuestions(
      new Date(Date.parse("2026-10-10") + i * 86400000)
        .toISOString()
        .slice(0, 10),
    )) {
      assert.equal(q.options[q.answer], bank[q.id].options[bank[q.id].answer]);
      positions.add(q.answer);
    }
  assert.equal(positions.size, 4);
});
test("scoring handles perfect, incorrect, and partial answers", () => {
  const q = dailyQuestions("2026-10-10");
  assert.equal(
    scoreAnswers(
      q,
      q.map((x) => x.answer),
    ),
    10,
  );
  assert.equal(
    scoreAnswers(
      q,
      q.map((x) => (x.answer + 1) % 4),
    ),
    0,
  );
  assert.equal(scoreAnswers(q, [q[0].answer]), 1);
});
test("all ranks have explicit correct boundaries", () => {
  assert.deepEqual(
    Array.from({ length: 11 }, (_, score) => rank(score)),
    [
      "Casual Lurker",
      "Casual Lurker",
      "Casual Lurker",
      "Certified Mutual",
      "Certified Mutual",
      "Fandom Archivist",
      "Fandom Archivist",
      "Fandom Archivist",
      "Keeper of the Lore",
      "Keeper of the Lore",
      "The Deepest Cut",
    ],
  );
});
test("Eastern calendar date is independent of the player's time zone", () => {
  assert.equal(dayKey(new Date("2026-10-10T23:30:00-04:00")), "2026-10-10");
  assert.equal(dayKey(new Date("2026-10-11T03:59:59.999Z")), "2026-10-10");
  assert.equal(dayKey(new Date("2026-10-11T04:00:00Z")), "2026-10-11");
  assert.equal(dayKey(new Date("2026-01-15T04:59:59Z")), "2026-01-14");
  assert.equal(dayKey(new Date("2026-10-11T13:00:00+09:00")), "2026-10-11");
});
test("Eastern reset follows standard time, daylight time, leap days and year boundaries", () => {
  for (const [input, expected] of [
    ["2026-10-10T12:00:00Z", "2026-10-11T04:00:00.000Z"],
    ["2026-01-14T12:00:00Z", "2026-01-15T05:00:00.000Z"],
    ["2026-12-31T23:59:59Z", "2027-01-01T05:00:00.000Z"],
    ["2028-02-28T12:00:00Z", "2028-02-29T05:00:00.000Z"],
    ["2026-10-11T03:59:59.999Z", "2026-10-11T04:00:00.000Z"],
    ["2026-10-11T04:00:00Z", "2026-10-12T04:00:00.000Z"],
  ])
    assert.equal(nextReset(new Date(input)).toISOString(), expected);
});
test("spring and fall reset days last 23 and 25 hours instead of using a fixed offset", () => {
  const spring = new Date("2026-03-08T05:00:00Z");
  const fall = new Date("2026-11-01T04:00:00Z");
  assert.equal((nextReset(spring) - spring) / 3600000, 23);
  assert.equal((nextReset(fall) - fall) / 3600000, 25);
  assert.equal(
    nextReset(new Date("2026-11-01T05:30:00Z")).toISOString(),
    "2026-11-02T05:00:00.000Z",
  );
  assert.equal(
    nextReset(new Date("2026-11-01T06:30:00Z")).toISOString(),
    "2026-11-02T05:00:00.000Z",
  );
});
test("malformed saved progress is rejected instead of generating broken results", () => {
  const q = dailyQuestions("2026-10-10");
  for (const value of [
    null,
    {},
    "abc",
    [-1],
    [4],
    [0.5],
    [null],
    Array(2),
    Array(11).fill(0),
  ])
    assert.equal(validAnswers(value, q), false);
  for (const value of [[], [0, 1, 2, 3], Array(10).fill(0)])
    assert.equal(validAnswers(value, q), true);
});
test("invalid issue dates are rejected", () => {
  for (const day of ["", "tomorrow", "2026-02-30", "2026-13-01", "2026-1-1"])
    assert.throws(() => dailyQuestions(day));
});
test("all questions have four distinct options and a valid correct answer", () => {
  assert.equal(bank.length, 48);
  for (const q of bank) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options[q.answer]);
    assert.ok(q.explanation);
  }
});

test("era mini quizzes have five unique, eligible questions and preserve correct answers", () => {
  for (const mode of modes.slice(1)) {
    const issue = dailyQuestions("2026-10-10", mode.id);
    assert.equal(issue.length, 5);
    assert.equal(new Set(issue.map((q) => q.id)).size, 5);
    assert.deepEqual(issue, dailyQuestions("2026-10-10", mode.id));
    for (const q of issue) {
      assert.equal(q.options[q.answer], bank[q.id].options[bank[q.id].answer]);
      if (mode.id === "tumblr")
        assert.ok(q.id < 36 && ![19, 23].includes(q.id));
      if (mode.id === "youtube")
        assert.ok((q.id >= 24 && q.id < 36) || q.id === 23);
      if (mode.id === "modern") assert.ok(q.id >= 36);
    }
  }
});
test("mini quizzes refresh without repeating yesterday's questions", () => {
  for (const mode of modes.slice(1)) {
    let previous = new Set();
    for (let i = 0; i < 40; i++) {
      const day = new Date(Date.parse("2026-12-20") + i * 86400000)
        .toISOString()
        .slice(0, 10);
      const ids = dailyQuestions(day, mode.id).map((q) => q.id);
      assert.equal(
        ids.filter((id) => previous.has(id)).length,
        0,
        mode.id + day,
      );
      previous = new Set(ids);
    }
  }
});
test("mini quiz ranks use the proportion correct and reject unknown modes", () => {
  assert.equal(rank(5, 5), rank(10, 10));
  assert.equal(rank(4, 5), rank(8, 10));
  assert.equal(getMode("modern").count, 5);
  assert.throws(() => dailyQuestions("2026-10-10", "unknown"));
  assert.throws(() => getMode("unknown"));
});
