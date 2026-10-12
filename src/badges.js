// Cosmetics are local keepsakes, never proof of paid access.
export function collectionStats(state) {
  const stamps = state.stamps || [], receipts = state.receipts || [], chapters = state.chapters || [];
  const daily = stamps.filter(item => ['quiz', 'ask', 'lost'].includes(item.kind));
  return {
    quizzes: stamps.filter(item => item.kind === 'quiz').length,
    mysteries: receipts.filter(item => ['ask', 'lost'].includes(item.kind)).length,
    asks: receipts.filter(item => item.kind === "ask").length,
    perfect: stamps.filter(item => item.kind === "quiz" && item.total === 10 && item.score === 10).length,
    lost: receipts.filter(item => item.kind === 'lost').length,
    firstGuess: receipts.filter(item => item.kind === 'lost' && item.guesses === 1).length,
    days: new Set(daily.map(item => item.date).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date || ''))).size,
    fandom: chapters.filter(item => item.era === 'tumblr').length,
    youtube: chapters.filter(item => item.era === 'youtube').length,
    current: chapters.filter(item => item.era === 'modern').length,
    eras: new Set(chapters.map(item => item.era).filter(era => ['tumblr', 'youtube', 'modern'].includes(era))).size,
    receipts: receipts.length,
    chapters: chapters.length,
    direction: chapters.filter(item => item.id === 'fangirl-discography').length,
  };
}
export const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
export const badgeDefinitions = [
  { id: 'you-were-there', title: 'You had to be there', era: 'Daily ritual', rarity: 'common', art: 'stamp', metric: 'quizzes', goal: 1, unit: 'quiz', requirement: 'Finish one daily quiz', description: 'Your old fan account would be so proud.' },
  { id: 'askbox-postage', title: 'Postage from a mutual', era: 'Anonymous Ask', rarity: 'common', art: 'chat', metric: 'asks', goal: 1, unit: 'Anonymous Ask', requirement: 'Solve one Anonymous Ask', description: 'An anonymous note. A very familiar reference.' },
  { id: 'perfect-report', title: 'Kept every receipt', era: 'Daily quiz', rarity: 'rare', art: 'stamp', metric: 'perfect', goal: 1, unit: 'perfect quiz', requirement: 'Score 10/10 on the main daily quiz', description: 'Your mutuals know exactly who to ask.' },
  { id: 'recovered-player', title: 'The recovered player', era: 'Lost Post', rarity: 'common', art: 'player', metric: 'lost', goal: 1, unit: 'lost post', requirement: 'Solve one Lost Post', description: 'A little cracked. Still holds every memory.' },
  { id: 'first-guess', title: 'The mutual knows', era: 'Lost Post', rarity: 'rare', art: 'folder', metric: 'firstGuess', goal: 1, unit: 'first-guess recovery', requirement: 'Solve a Lost Post on your first guess', description: 'You knew the lore before the screenshots dropped.' },
  { id: 'mystery-five', title: 'The sealed archive', era: 'Mystery files', rarity: 'rare', art: 'folder', metric: 'mysteries', goal: 5, unit: 'mystery', requirement: 'Solve five Anonymous Asks or Lost Posts', description: 'Five mysteries. One very full notes app.' },
  { id: 'certified-mutual', title: 'Certified mutual', era: 'Daily ritual', rarity: 'rare', art: 'stamp', metric: 'days', goal: 7, unit: 'day', requirement: 'Finish a daily game on seven different days', description: 'Seven little visits. Your collection stays, even if you miss a day.' },
  { id: 'dashboard-butterfly', title: 'Dashboard butterfly', era: '2010–2016', rarity: 'common', art: 'butterfly', metric: 'fandom', goal: 1, unit: 'fandom folder', requirement: 'Finish a Fandom Years folder', description: 'Former Tumblr kid. Permanent keeper of the tags.' },
  { id: 'comfort-camera', title: 'The comfort camera', era: '2017–2019', rarity: 'common', art: 'camera', metric: 'youtube', goal: 1, unit: 'YouTube folder', requirement: 'Finish a YouTube Era folder', description: 'Just one more upload before bed.' },
  { id: 'group-chat', title: 'The group-chat receipt', era: '2020–now', rarity: 'common', art: 'chat', metric: 'current', goal: 1, unit: 'current-lore folder', requirement: 'Finish a Current Lore folder', description: 'The mutuals are typing. You already know why.' },
  { id: 'era-traveller', title: 'The lost era', era: 'All three worlds', rarity: 'epic', art: 'folder', metric: 'eras', goal: 3, unit: 'era', requirement: 'Finish a folder in each of the three eras', description: 'You remember every version of the dashboard.' },
  { id: 'lore-keeper', title: 'Keeper of the lore', era: 'Lore Book', rarity: 'epic', art: 'player', metric: 'receipts', goal: 25, unit: 'receipt', requirement: 'Collect 25 correctly recovered receipts', description: 'I remember the lore so you don’t have to.' },
  { id: 'direction-filed', title: '1D lore filed', era: '2010–2016', rarity: 'rare', art: 'stamp', metric: 'direction', goal: 1, unit: 'discography folder', requirement: 'Finish the Fangirl Discography folder', description: 'The fan account that kept the album credits.' },
  { id: 'deep-archive', title: 'The archive key', era: 'Archive collection', rarity: 'legendary', art: 'folder', metric: 'chapters', goal: 8, unit: 'folder', requirement: 'Finish eight archive folders', description: 'A key to the tabs you never quite closed.' },
];
export const badgeById = id => badgeDefinitions.find(badge => badge.id === id);
export const badgeProgress = (badge, state) => Math.min(badge.goal, collectionStats(state)[badge.metric] || 0);
export function unlockBadges(state, date) {
  const owned = new Map((state.badges || []).filter(item => badgeById(item.id)).map(item => [item.id, item]));
  for (const badge of badgeDefinitions) if (badgeProgress(badge, state) >= badge.goal && !owned.has(badge.id)) owned.set(badge.id, { id: badge.id, date });
  return { ...state, badges: [...owned.values()] };
}
export function nextCollectible(state) {
  return badgeDefinitions.filter(badge => !(state.badges || []).some(item => item.id === badge.id))
    .map(badge => ({ badge, progress: badgeProgress(badge, state) }))
    .sort((a, b) => (a.badge.goal - a.progress) - (b.badge.goal - b.progress) || (b.progress / b.badge.goal) - (a.progress / a.badge.goal))[0] || null;
}
export function featuredBadge(state) {
  if (state.featuredBadge) return badgeById(state.featuredBadge);
  return (state.badges || []).map(item => badgeById(item.id)).filter(Boolean).sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])[0] || null;
}
