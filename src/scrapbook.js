import { dailyDeepCut, deepCutState } from './deep-cut.js';
import { discoveryEra } from './era-discoveries.js';
export const SCRAPBOOK_KEY = 'fandom-files-scrapbook-v1';
const validId = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export function scrapbookState(value = {}) {
  const discoveries = new Map(), rounds = new Map();
  for (const item of Array.isArray(value?.discoveries) ? value.discoveries : []) {
    if (!item || !discoveryEra(item.era) || !validId(item.id)) continue;
    discoveries.set(`${item.era}:${item.id}`, { era: item.era, id: item.id });
  }
  for (const item of Array.isArray(value?.rounds) ? value.rounds : []) {
    try {
      const question = dailyDeepCut(item.day), state = deepCutState(item, question);
      if (state.choice === null) continue;
      rounds.set(item.day, { day: item.day, ...state });
    } catch { /* Ignore corrupt/stale local records. */ }
  }
  return { discoveries: [...discoveries.values()].slice(-300), rounds: [...rounds.values()].slice(-366), earned: [...new Set((Array.isArray(value?.earned) ? value.earned : []).filter(id => scrapbookStamps.some(stamp => stamp.id === id)))] };
}
export function rememberDiscovery(value, era, id) {
  const state = scrapbookState(value);
  if (!discoveryEra(era) || !validId(id) || state.discoveries.some(item => item.era === era && item.id === id)) return unlockScrapbookStamps(state);
  return unlockScrapbookStamps({ ...state, discoveries: [...state.discoveries, { era, id }] });
}
export function rememberRound(value, day, result) {
  return unlockScrapbookStamps({ ...scrapbookState(value), rounds: [...scrapbookState(value).rounds.filter(item => item.day !== day), { ...result, day }] });
}
export const scrapbookStamps = [
  { id: 'first-deep-cut', label: 'deep cut detective', icon: 'search', goal: 'Finish one Today’s Deep Cut', metric: 'rounds', target: 1 },
  { id: 'no-clues', label: 'kept the receipt', icon: 'stamp', goal: 'Answer a Deep Cut correctly without clues', metric: 'perfect', target: 1 },
  { id: 'five-files', label: 'dashboard digger', icon: 'folder', goal: 'Open five different lore discoveries', metric: 'discoveries', target: 5 },
  { id: 'three-eras', label: 'era traveller', icon: 'heart', goal: 'Open a discovery in all three eras', metric: 'eras', target: 3 },
];
export function scrapbookProgress(value) {
  const state = scrapbookState(value);
  return { rounds: state.rounds.length, perfect: state.rounds.filter(item => { const q = dailyDeepCut(item.day); return item.choice === q.answer && item.hints === 0; }).length, discoveries: state.discoveries.length, eras: new Set(state.discoveries.map(item => item.era)).size };
}

export function unlockScrapbookStamps(value) {
  const state = scrapbookState(value), progress = scrapbookProgress(state);
  state.earned = [...new Set([...state.earned, ...scrapbookStamps.filter(stamp => progress[stamp.metric] >= stamp.target).map(stamp => stamp.id)])];
  return state;
}
