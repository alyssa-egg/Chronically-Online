// Keep this edition's bank stable. Publish editorial changes under a new version.
export const EDITION_VERSION = "v4";
import { bank as archive } from "./questions.js";
import { approvedIssues } from "./issues.js";
export const TIME_ZONE = "America/New_York";
export const getIssue = (day) => approvedIssues[day] || null;
export const issueVersion = (day) =>
  getIssue(day)
    ? `${getIssue(day).id}-r${getIssue(day).revision}`
    : EDITION_VERSION;
export function shuffleQuestions(picks, day) {
  const rand = random(
    [...day].reduce(
      (seed, char) => (Math.imul(seed, 31) + char.charCodeAt(0)) | 0,
      0,
    ),
  );
  return picks.map((q) => {
    const choices = shuffle(
      q.options.map((text, index) => ({ text, correct: index === q.answer })),
      rand,
    );
    return {
      ...q,
      category: q.category || departments[q.department].name,
      options: choices.map((choice) => choice.text),
      answer: choices.findIndex((choice) => choice.correct),
    };
  });
}
export const eras = [
  {
    id: "tumblr",
    name: "The Fandom Years",
    years: "2010–2016",
    mechanic: "Finish the Lore",
    count: 5,
    icon: "♡",
    description:
      "One Direction, 5SOS, fanfiction, early YouTube, and the dashboard that raised you.",
    short: "Your old dashboard remembers.",
  },
  {
    id: "youtube",
    name: "The YouTube Era",
    years: "2017–2019",
    mechanic: "Connect the Dots",
    count: 5,
    icon: "▷",
    description:
      "Creator collabs, tag videos, conventions, and the comfort uploads you watched after school.",
    short: "Just one more video before bed.",
  },
  {
    id: "modern",
    name: "Current Lore",
    years: "2020–now",
    mechanic: "Decode the Feed",
    count: 5,
    icon: "✿",
    description:
      "Slushy Noobz, Vanilla Mace, newer creator communities, and the inside jokes still being written.",
    short: "New tabs. Same fandom brain.",
  },
];
export const modes = [
  {
    id: "daily",
    name: "The daily fandom file",
    count: 10,
    short: "A little bit of every era.",
  },
  ...eras,
];
export function getMode(id = "daily") {
  const mode = modes.find((mode) => mode.id === id);
  if (!mode) throw new Error("Unknown game mode");
  return mode;
}
export const departments = [
  {
    name: "The dashboard",
    count: 3,
    era: "2010–2015",
    icon: "♡",
    description: "Reblog chains, gifsets & your very first OTP.",
    tag: "Tumblr years",
  },
  {
    name: "Band girl files",
    count: 3,
    era: "2011–2016",
    icon: "★",
    description: "1D, 5SOS & the fan account you never deleted.",
    tag: "Fandom forever",
  },
  {
    name: "YouTube sleepover",
    count: 2,
    era: "2010–2019",
    icon: "▷",
    description: "British YouTube, collabs & comfort-video lore.",
    tag: "You had to be there",
  },
  {
    name: "The new lore",
    count: 2,
    era: "2020–now",
    icon: "✿",
    description: "Slushy Noobz, Vanilla Mace & your current tabs.",
    tag: "Still in the group chat",
  },
];
export const bank = archive.map((q) => ({
  ...q,
  category: departments[q.department].name,
}));
const easternDate = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export function dayKey(date = new Date()) {
  const parts = Object.fromEntries(
    easternDate.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function nextReset(date = new Date()) {
  const currentDay = dayKey(date);
  let before = date.getTime(),
    after = before + 27 * 3600000;
  // Find the first millisecond of the next Eastern day, including 23/25-hour DST days.
  while (after - before > 1) {
    const middle = Math.floor((before + after) / 2);
    if (dayKey(new Date(middle)) === currentDay) before = middle;
    else after = middle;
  }
  return new Date(after);
}
function random(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(items, rand) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function dailyQuestions(day, mode = "daily") {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !Number.isFinite(Date.parse(day)) ||
    new Date(day).toISOString().slice(0, 10) !== day
  )
    throw new Error("Invalid issue date");
  const dayNumber = Math.floor(Date.parse(day) / 86400000);
  const rand = random(
    [...day].reduce((s, c) => (Math.imul(s, 31) + c.charCodeAt(0)) | 0, 0),
  );
  const gameMode = getMode(mode);
  const curated = getIssue(day)?.games?.[mode];
  if (curated) return shuffleQuestions(curated, day);
  const pools =
    mode === "daily"
      ? departments.map((dept, index) => ({
          items: bank.filter(
            (q) => q.mode === "daily" && q.department === index,
          ),
          count: dept.count,
          seed: 12013 + index,
        }))
      : [
          {
            items: bank.filter((q) => q.mode === mode),
            count: gameMode.count,
            seed: 62013 + modes.indexOf(gameMode),
          },
        ];
  const picks = pools.flatMap(({ items, count, seed }) => {
    const pool = shuffle(items, random(seed));
    return Array.from(
      { length: count },
      (_, i) =>
        pool[
          (((dayNumber * count + i) % pool.length) + pool.length) % pool.length
        ],
    );
  });
  return picks.map((q) => {
    const choices = shuffle(
      q.options.map((text, index) => ({ text, correct: index === q.answer })),
      rand,
    );
    return {
      ...q,
      options: choices.map((c) => c.text),
      answer: choices.findIndex((c) => c.correct),
    };
  });
}
export function validAnswers(value, questions) {
  return (
    Array.isArray(value) &&
    value.length <= questions.length &&
    Array.from(value).every(
      (a, i) =>
        Number.isInteger(a) && a >= 0 && a < questions[i].options.length,
    )
  );
}
export function rank(score, total = 10) {
  return [
    "Casual Lurker",
    "Certified Mutual",
    "Fandom Archivist",
    "Keeper of the Lore",
    "The Deepest Cut",
  ][Math.min(4, Math.floor(((score / total) * 10) / 2.5))];
}
export function scoreAnswers(questions, answers) {
  return questions.reduce(
    (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
    0,
  );
}
