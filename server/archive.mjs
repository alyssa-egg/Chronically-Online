import { bank } from "../src/questions.js";
const question = id => {
  const q = bank.find(item => item.id === id);
  if (!q) throw new Error(`Missing archive reference: ${id}`);
  return q;
};
const decode = (id, kind = "quote") => {
  const q = question(id);
  return { id, method: "decode", kind, title: kind === "sound" ? "The Sound File" : kind === "lost" ? "The Lost Archive" : "Finish the Lore", prompt: q.question, answer: q.options[q.answer], candidates: q.options, explanation: q.explanation };
};
const match = (id, ids) => {
  const rows = ids.map((source, i) => ({ id: `left-${i}`, clue: question(source).question }));
  const choices = ids.map((source, i) => ({ id: `right-${i}`, label: question(source).options[question(source).answer] }));
  return { id, method: "match", kind: "connection", title: "The Connection File", prompt: "Match each clue to its receipt. Use each receipt once.", rows, choices, solution: Object.fromEntries(rows.map((row, i) => [row.id, choices[i].id])), explanation: ids.map(source => question(source).explanation).join(" ") };
};
const timeline = (id, items) => ({ id, method: "timeline", kind: "timeline", title: "The Timeline File", prompt: "Recover these releases in order, earliest first.", items: items.map(([label, year], i) => ({ id: `event-${i}`, label, year })), order: items.map((_, i) => `event-${i}`), explanation: items.map(([label, year]) => `${label}: ${year}`).join(" · ") });
const entry = (id, era, title, description, free, files) => ({ id, version: "v1", era, title, description, free, files });
export const collections = [
  entry("dashboard-starter", "tumblr", "The old dashboard", "Mutuals, reblogs, fandom shorthand. Your first recovered folder.", true, [
    match("dashboard-map", ["daily-dashboard-1", "daily-dashboard-2", "daily-dashboard-7", "daily-dashboard-14"]), decode("daily-dashboard-0", "lost"), decode("daily-dashboard-13"),
  ]),
  entry("fangirl-discography", "tumblr", "The fangirl discography", "1D albums, 5SOS receipts, and the fan account that knew every credit.", false, [
    match("band-map", ["daily-band-5", "tumblr-band-7", "tumblr-band-1", "tumblr-band-2"]), timeline("one-direction-albums", [["Up All Night", 2011], ["Take Me Home", 2012], ["Midnight Memories", 2013], ["Four", 2014]]), decode("tumblr-band-8", "sound"),
  ]),
  entry("original-subscriptions", "tumblr", "Your original subscriptions", "Old usernames, creator books, and the uploads before the algorithm knew you.", false, [
    match("old-usernames", ["daily-youtube-0", "daily-youtube-3", "daily-youtube-4", "daily-youtube-5"]), decode("tumblr-youtube-2"), decode("tumblr-youtube-6", "sound"),
  ]),
  entry("youtube-starter", "youtube", "The after-school tab", "Video formats and familiar rituals. One free trip through the recommendations.", true, [
    match("video-formats", ["youtube-archive-20", "youtube-archive-21", "youtube-archive-23", "youtube-archive-24"]), decode("youtube-archive-22"), decode("youtube-archive-25", "lost"),
  ]),
  entry("creator-connections", "youtube", "The creator cinematic universe", "Dolan twins, shared channels, BuzzFeed exits, and the Vlog Squad.", false, [
    match("creator-map", ["youtube-archive-3", "youtube-archive-4", "youtube-archive-11", "youtube-archive-12"]), decode("youtube-archive-15", "lost"), decode("youtube-archive-14"),
  ]),
  entry("beauty-tabs", "youtube", "The beauty-tab rabbit hole", "The nail videos, tutorials, and creator brands your saved tabs remember.", false, [
    match("beauty-creators", ["youtube-archive-8", "youtube-archive-9", "daily-youtube-11", "modern-archive-13"]), decode("youtube-archive-10", "lost"), decode("modern-archive-12"),
  ]),
  entry("collab-circles", "youtube", "The collab circles", "Comedy channels, familiar aliases, and food-video universes.", false, [
    match("comedy-map", ["youtube-archive-18", "youtube-archive-17", "youtube-archive-19", "youtube-archive-16"]), decode("youtube-archive-26"), decode("youtube-archive-27", "lost"),
  ]),
  entry("solo-era-crossover", "youtube", "After the fan account", "The solo records and music-video references that followed you into new tabs.", false, [
    match("solo-records", ["daily-band-15", "daily-band-13", "daily-band-12", "daily-band-7"]), timeline("solo-to-youngblood", [["Mind of Mine", 2016], ["Flicker", 2017], ["Youngblood", 2018]]), decode("daily-band-11", "sound"),
  ]),
  entry("comfort-video-files", "youtube", "The comfort-video files", "Creator memoirs, conventions, and the series you kept coming back to.", false, [
    match("creator-books", ["tumblr-youtube-0", "tumblr-youtube-1", "tumblr-youtube-3", "tumblr-youtube-9"]), decode("daily-youtube-8"), decode("youtube-archive-2", "lost"),
  ]),
  entry("group-chat-starter", "modern", "Your current group chat", "Podcasts, duos, and a few references for the mutuals. A free sample.", true, [
    match("current-duos", ["daily-modern-0", "daily-modern-2", "daily-modern-3", "daily-modern-10"]), decode("modern-archive-3"), decode("daily-modern-5", "lost"),
  ]),
  entry("internet-girl-counter", "modern", "The internet-girl counter", "Pop-girl beauty brands, fancams, and fandom vocabulary.", false, [
    match("beauty-brands", ["modern-archive-12", "modern-archive-13", "modern-archive-14", "modern-archive-15"]), decode("modern-archive-17"), decode("modern-archive-18", "lost"),
  ]),
  entry("comment-section-files", "modern", "The comment-section universe", "Podcast connections and the jokes that followed creators across platforms.", false, [
    match("podcast-map", ["daily-modern-7", "modern-archive-9", "modern-archive-8", "daily-modern-4"]), decode("modern-archive-6"), decode("modern-archive-11", "lost"),
  ]),
];
export const findCollection = id => collections.find(collection => collection.id === id);
export function publicArchive() {
  return {
    catalog: collections.map(({ files, ...collection }) => ({ ...collection, fileCount: files.length })),
    samples: Object.fromEntries(collections.filter(collection => collection.free).map(collection => [collection.id, collection])),
  };
}
export const publicArchiveModule = () => {
  const { catalog, samples } = publicArchive();
  return `export const catalog = ${JSON.stringify(catalog)};\nexport const samples = ${JSON.stringify(samples)};\n`;
};
