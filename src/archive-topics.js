export const archiveTopics = [
  { id: "fandom-years", title: "The Fandom Years", label: "FAN ACCOUNTS / FIRST OBSESSIONS", description: "The dashboard, the group chat, and the fandom phase that was never a phase.", icon: "♡", number: "01" },
  { id: "music-lore", title: "Music Lore", label: "BURNED CDS / POP GIRL INTERNET", description: "Songs, scenes, stan accounts, and the stories hiding in your playlists.", icon: "◉", number: "02" },
  { id: "creator-culture", title: "Creator Culture", label: "COMFORT VIDEOS / CAMERA ROLLS", description: "YouTube sleepovers, creator worlds, and the people who raised our feeds.", icon: "▣", number: "03" },
  { id: "style-files", title: "Style Files", label: "MOODBOARDS / BEAUTY / FASHION", description: "Bedroom walls, beauty rituals, and outfits saved to a very specific folder.", icon: "✳", number: "04" },
  { id: "internet-mysteries", title: "Internet Mysteries", label: "LOST POSTS / DEEP CUTS", description: "Forgotten references, strange little connections, and one more rabbit hole.", icon: "↖", number: "05" },
];
export const archiveEras = [{ id: "2010-2016", title: "2010–2016 / Fandom Years" }, { id: "2017-2020", title: "2017–2020 / Influencer Era" }, { id: "2021-now", title: "2021–now / Current Lore" }, { id: "2017-2019", title: "2017–2019 / Earlier YouTube-era tag" }, { id: "2020-now", title: "2020–now / Earlier current-lore tag" }];
export function topicFor(article) {
  if (archiveTopics.some(topic => topic.id === article?.archiveCategory)) return article.archiveCategory;
  return ({ culture: "music-lore", moodboard: "style-files", "rabbit-hole": "internet-mysteries", "group-chat": "creator-culture" })[article?.category] || "fandom-years";
}
export const archiveURL = (category = "") => `/archive/${category ? `?category=${encodeURIComponent(category)}` : ""}`;
