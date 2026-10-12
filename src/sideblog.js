import { badgeById, unlockBadges } from "./badges.js";
export const themes = [
  { id: "paper", name: "Old dashboard", requirement: "Your starter theme", unlocked: () => true },
  { id: "fandom", name: "Pastel fan account", requirement: "Finish a Fandom Years collection", unlocked: state => state.chapters.some(chapter => chapter.era === "tumblr") },
  { id: "video", name: "Comfort-video violet", requirement: "Finish a YouTube collection", unlocked: state => state.chapters.some(chapter => chapter.era === "youtube") },
  { id: "current", name: "New-lore turquoise", requirement: "Finish a Current Lore collection", unlocked: state => state.chapters.some(chapter => chapter.era === "modern") },
  { id: "midnight", name: "Midnight mutual", requirement: "Finish eight archive collections", unlocked: state => state.chapters.length >= 8 },
];
export const stickers = [
  { id: "heart", label: "♡", name: "Mutual heart", unlocked: () => true },
  { id: "cursor", label: "↖", name: "Pixel cursor", unlocked: () => true },
  { id: "bow", label: "୨୧", name: "Fan-account bow", unlocked: state => state.stamps.some(stamp => stamp.kind === "quiz") },
  { id: "ask", label: "( •̀ᴗ•́ )", name: "Askbox sticker", unlocked: state => state.stamps.some(stamp => stamp.kind === "ask") },
  { id: "disc", label: "◉", name: "Recovered disc", unlocked: state => state.receipts.some(receipt => receipt.kind === "lost") },
  { id: "star", label: "✧", name: "Archive star", unlocked: state => state.chapters.length > 0 },
];
export function sideblogState(value = {}) {
  const records = name => Array.isArray(value?.[name]) ? value[name].filter(item => item && typeof item.id === "string" && typeof item.title === "string").slice(-2000) : [];
  const state = { name: typeof value?.name === "string" ? value.name.slice(0, 36) : "my little sideblog", theme: value?.theme || "paper", receipts: records("receipts"), stamps: records("stamps"), chapters: records("chapters"), pins: Array.isArray(value?.pins) ? value.pins.filter(id => typeof id === "string").slice(0, 6) : [], decorations: Array.isArray(value?.decorations) ? value.decorations.slice(0, 3) : ["heart", "cursor"] };
  state.badges = Array.isArray(value?.badges) ? [...new Map(value.badges.filter(item => item && badgeById(item.id)).map(item => [item.id, { id: item.id, date: typeof item.date === "string" ? item.date : "" }])).values()] : [];
  state.featuredBadge = state.badges.some(item => item.id === value?.featuredBadge) ? value.featuredBadge : null;
  state.badgePins = Array.isArray(value?.badgePins) ? [...new Set(value.badgePins)].filter(id => state.badges.some(item => item.id === id)).slice(0, 3) : [];
  if (!themes.some(theme => theme.id === state.theme && theme.unlocked(state))) state.theme = "paper";
  state.decorations = state.decorations.filter(id => stickers.some(sticker => sticker.id === id && sticker.unlocked(state)));
  state.pins = state.pins.filter(id => state.receipts.some(receipt => receipt.id === id));
  return state;
}
export function collect(state, type, record) {
  const next = sideblogState(state);
  if (!["receipts", "stamps", "chapters"].includes(type)) throw new Error("Unknown scrapbook item");
  if (!next[type].some(item => item.id === record.id)) next[type].push({ ...record });
  else if (type === "receipts" && record.kind === "lost" && Number.isInteger(record.guesses) && record.guesses >= 1 && record.guesses <= 3)
    next.receipts = next.receipts.map(item => item.id === record.id && item.guesses === undefined ? { ...item, guesses: record.guesses } : item);
  else if (type === "stamps" && record.kind === "quiz" && Number.isInteger(record.score) && record.total === 10 && record.score >= 0 && record.score <= 10)
    next.stamps = next.stamps.map(item => item.id === record.id && item.score === undefined ? { ...item, score: record.score, total: record.total } : item);
  return sideblogState(unlockBadges(next, record.date || ""));
}
export const pinnedReceipts = state => state.pins.length ? state.pins.map(id => state.receipts.find(receipt => receipt.id === id)).filter(Boolean) : state.receipts.slice(-6).reverse();
