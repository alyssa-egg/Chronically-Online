import { puzzles, validDay } from "./puzzle.js";
import { normalizeReference } from "./collection.js";
export const LOST_VERSION = "v1";
export function lostPost(day) {
  if (!validDay(day)) throw new Error("Invalid issue date");
  const number = Math.floor(Date.parse(day + "T12:00:00Z") / 86400000);
  const reference = puzzles[((number + 11) % puzzles.length + puzzles.length) % puzzles.length];
  const fandom = new Set(["Tumblr", "One Direction", "5 Seconds of Summer", "Dan and Phil", "Vine", "Wattpad", "Archive of Our Own", "Zoella", "Troye Sivan", "The X Factor", "Victorious", "Ariana Grande", "Phil Lester", "Dan Howell", "Tyler Oakley", "Girl Online", "Take Me Home", "SuperWhoLock"]);
  const current = new Set(["Kurtis Conner", "Danny Gonzalez", "Drew Gooden", "Brittany Broski", "Slushy Noobz"]);
  const era = fandom.has(reference.answer) ? "tumblr" : current.has(reference.answer) ? "modern" : "youtube";
  return { id: `lost-${LOST_VERSION}-${day}`, day, title: reference.answer, answer: reference.answer, aliases: reference.aliases, era, clues: [0, 1, 3, 4].map((index, i) => ({ label: ["a saved caption", "a forgotten tag", "a torn receipt", "a mutual's note"][i], text: reference.clues[index], icon: ["♡", "#", "▤", "↖"][i] })), explanation: reference.clues.slice(2).join(" ") };
}
export function validLostGuesses(post, value) {
  if (!Array.isArray(value) || value.length > 3 || value.some(guess => guess !== null && (typeof guess !== "string" || !guess.trim() || guess.length > 100))) return [];
  const used = value.filter(guess => guess !== null).map(normalizeReference);
  if (new Set(used).size !== used.length) return [];
  const winner = value.findIndex(guess => guess !== null && [post.answer, ...post.aliases].some(answer => normalizeReference(answer) === normalizeReference(guess)));
  return winner >= 0 && winner !== value.length - 1 ? [] : value;
}
export const lostWon = (post, guesses) => guesses.some(guess => guess !== null && [post.answer, ...post.aliases].some(answer => normalizeReference(answer) === normalizeReference(guess)));
