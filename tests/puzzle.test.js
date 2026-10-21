import test from "node:test";
import assert from "node:assert/strict";
import {
  puzzles,
  dailyPuzzle,
  normalizeGuess,
  matches,
  validGuesses,
  submitGuess,
  puzzleStatus,
  puzzleShare,
  diaryStats,
} from "../src/puzzle.js";

test("30 original references each have six clues and unique answers", () => {
  assert.equal(puzzles.length, 30);
  assert.equal(new Set(puzzles.map((p) => normalizeGuess(p.answer))).size, 30);
  for (const puzzle of puzzles) {
    assert.equal(puzzle.clues.length, 6);
    assert.equal(new Set(puzzle.clues).size, 6);
    for (const alias of [puzzle.answer, ...puzzle.aliases])
      assert.ok(matches(puzzle, alias));
  }
});
test("daily puzzles are deterministic and don't repeat for 30 days", () => {
  const ids = [];
  for (let i = 0; i < 30; i++) {
    const day = new Date(Date.parse("2026-10-10") + i * 86400000)
      .toISOString()
      .slice(0, 10);
    const puzzle = dailyPuzzle(day);
    assert.deepEqual(puzzle, dailyPuzzle(day));
    ids.push(puzzle.id);
  }
  assert.equal(new Set(ids).size, 30);
  for (const day of ["", "2026-02-30", "2026-1-1", null, {}])
    assert.throws(() => dailyPuzzle(day));
  assert.ok(dailyPuzzle("1969-12-31"));
});
test("aliases accept case, spacing, punctuation, and accents", () => {
  const puzzle = puzzles.find((p) => p.answer === "One Direction");
  assert.ok(matches(puzzle, "  ONE direction! "));
  assert.ok(matches(puzzle, "1d"));
  assert.equal(normalizeGuess("Dán & Phil!"), "danphil");
  assert.equal(matches(puzzle, null), false);
  assert.equal(matches(puzzle, "One"), false);
});
test("misses and passes consume turns; a correct answer completes the ask", () => {
  const puzzle = puzzles[0];
  const first = submitGuess(puzzle, [], "Wrong reference");
  const second = submitGuess(puzzle, first, null);
  const won = submitGuess(puzzle, second, puzzle.answer);
  assert.deepEqual(first, ["Wrong reference"]);
  assert.equal(puzzleStatus(puzzle, second), "playing");
  assert.equal(puzzleStatus(puzzle, won), "won");
  assert.ok(validGuesses(won, puzzle));
  assert.throws(() => submitGuess(puzzle, won, "Again"));
});
test("six used turns end the ask; a correct final turn still wins", () => {
  const puzzle = puzzles[0];
  let guesses = [];
  for (let i = 0; i < 6; i++) guesses = submitGuess(puzzle, guesses, null);
  assert.equal(puzzleStatus(puzzle, guesses), "lost");
  assert.throws(() => submitGuess(puzzle, guesses, puzzle.answer));
  assert.equal(
    puzzleStatus(
      puzzle,
      submitGuess(puzzle, guesses.slice(0, 5), puzzle.answer),
    ),
    "won",
  );
});
test("empty or duplicate guesses do not consume a turn, and malformed saves are rejected", () => {
  const puzzle = puzzles[0],
    guesses = ["one direction"];
  for (const value of ["", "  ", "♡", "x".repeat(81), "ONE direction!!"])
    assert.throws(() => submitGuess(puzzle, guesses, value));
  assert.equal(guesses.length, 1);
  for (const value of [
    null,
    {},
    "abc",
    [undefined],
    Array(2),
    [""],
    ["x", "X"],
    Array(7).fill(null),
    [puzzle.answer, null],
    ["x".repeat(81)],
  ])
    assert.equal(validGuesses(value, puzzle), false);
  assert.equal(validGuesses([null, "wrong", puzzle.answer], puzzle), true);
});
test("shared puzzle results show turns and Eastern day without revealing guesses or answer", () => {
  const puzzle = puzzles[0];
  const text = puzzleShare(
    puzzle,
    [null, "secret wrong guess", puzzle.answer],
    "2026-10-10",
    "https://example.com/play/",
  );
  assert.match(text, /3\/6 🤍🩶💗/);
  assert.match(text, /Deep Cut/);
  assert.ok(!text.includes("Anonymous Ask"));
  assert.match(text, /https:\/\/example.com\/play\//);
  assert.match(text, /2026-10-10/);
  assert.ok(!text.includes("Eastern edition"));
  assert.ok(!text.includes(puzzle.answer));
  assert.ok(!text.includes("secret wrong guess"));
  assert.match(
    puzzleShare(
      puzzle,
      Array(6).fill(null),
      "2026-10-10",
      "https://example.com",
    ),
    /X\/6/,
  );
});
test("reading diary counts completed days once, with current and best streaks", () => {
  const stats = diaryStats(
    ["2026-10-08", "2026-10-09", "2026-10-09", "2026-10-10"],
    "2026-10-10",
  );
  assert.equal(stats.total, 3);
  assert.equal(stats.streak, 3);
  assert.equal(stats.best, 3);
  assert.equal(stats.completedToday, true);
  assert.equal(diaryStats(stats.days, "2026-10-11").streak, 3);
  assert.equal(diaryStats(stats.days, "2026-10-12").streak, 0);
  assert.equal(
    diaryStats([...stats.days, "2026-10-12"], "2026-10-12").streak,
    1,
  );
});
test("diary date arithmetic survives DST, leap days, year changes and corrupt storage", () => {
  for (const dates of [
    ["2026-03-07", "2026-03-08", "2026-03-09"],
    ["2026-10-31", "2026-11-01", "2026-11-02"],
    ["2028-02-28", "2028-02-29", "2028-03-01"],
    ["2026-12-30", "2026-12-31", "2027-01-01"],
  ])
    assert.equal(diaryStats(dates, dates[2]).streak, 3);
  assert.equal(
    diaryStats(
      [null, {}, "invalid", "2026-02-30", "2027-01-01", "2026-10-10"],
      "2026-10-10",
    ).total,
    1,
  );
  assert.equal(diaryStats({}, "2026-10-10").streak, 0);
});
