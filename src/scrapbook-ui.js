import { escapeHTML as e, safeLink } from './article-content.js';
import { originalImageURL, publishedEraAssets } from './site-identity.js';
import { archiveWindow, fileStamp, pixelIcon } from './archive-atoms.js';
import { SCRAPBOOK_KEY, scrapbookState, scrapbookProgress, scrapbookStamps, rememberDiscovery, rememberRound } from './scrapbook.js';
import { localCalendarDay, dailyDeepCut, deepCutKey, deepCutState } from './deep-cut.js';
function nowPlaying(pick) {
  const href = safeLink(pick?.link), ready = typeof pick?.song === 'string' && typeof pick?.artist === 'string' && pick.song.trim() && pick.artist.trim() && href;
  const cover = ready && originalImageURL(pick.coverImage);
  return archiveWindow('now_playing.exe', `<div class="music-pick"><div class="music-pick-art">${cover ? `<img src="${e(cover)}" alt="${e(pick.coverImage.alt || `${pick.song} artwork`)}" loading="lazy">` : pixelIcon('music')}</div><div><span class="file-label">NOW PLAYING IN THE ARCHIVE</span><h3>${ready ? e(pick.song) : 'between songs.'}</h3><p>${ready ? e(pick.artist) : 'A little room for the next obsession.'}</p></div></div>${ready ? `${pick.note ? `<p class="music-pick-note">${e(pick.note)}</p>` : ''}<a class="music-pick-link" href="${e(href)}" target="_blank" rel="noopener noreferrer">${pixelIcon('music')} listen on the original service ${pixelIcon('arrow')}</a><span class="music-pick-disclosure">an editor’s pick · opens a music link · no autoplay</span>` : '<span class="music-pick-disclosure">a song, a memory, a whole era. the next pick is still being filed.</span>'}`, 'now-playing-window');
}
export function createScrapbookUI({ root, read, save }) {
  const state = () => scrapbookState(read(SCRAPBOOK_KEY, {}));
  const write = next => { const before = state(); if (JSON.stringify(before) !== JSON.stringify(next)) save(SCRAPBOOK_KEY, next); };
  const recordDiscovery = (era, id) => write(rememberDiscovery(state(), era, id));
  const recordRound = (day, result) => write(rememberRound(state(), day, result));
  function syncToday() { const day = localCalendarDay(), question = dailyDeepCut(day), result = deepCutState(read(deepCutKey(day), null), question); if (result.choice !== null) recordRound(day, result); }
  function wall() {
    syncToday(); const progress = scrapbookProgress(state()), owned = state().earned;
    return `<section class="stamp-wall" aria-labelledby="stamp-wall-title"><div class="stamp-wall-heading"><div><span class="file-label">MY LITTLE STAMP WALL</span><h2 id="stamp-wall-title">proof you pulled<br><em>on a thread.</em></h2></div>${fileStamp(`${scrapbookStamps.filter(stamp => owned.includes(stamp.id) || progress[stamp.metric] >= stamp.target).length}/4 filed`)}</div><div class="scrapbook-stamps">${scrapbookStamps.map(stamp => {
      const earned = owned.includes(stamp.id) || progress[stamp.metric] >= stamp.target;
      return `<div class="scrapbook-stamp ${earned ? 'stamp-earned' : 'stamp-unearned'}">${pixelIcon(stamp.icon)}<strong>${e(stamp.label)}</strong><span>${earned ? 'filed ✓' : `${Math.min(stamp.target, progress[stamp.metric])}/${stamp.target}`}</span><small>${e(stamp.goal)}</small></div>`;
    }).join('')}</div><p class="stamp-wall-note">Earned from your plays and discoveries in this browser. Your original collectibles stay in My Files.</p></section>`;
  }
  function homeMarkup() { return `<div class="scrapbook-home-row"><section id="now-playing" aria-label="An editor’s music pick">${nowPlaying(null)}</section>${wall()}</div>`; }
  function statusMarkup() {
    syncToday(); const progress = scrapbookProgress(state()), owned = state().earned, saves = read('fandom-files-saved-discoveries-v1', []), stories = read('fandom-files-saved-stories-v1', []), saved = (Array.isArray(saves) ? saves.length : 0) + (Array.isArray(stories) ? stories.length : 0);
    return `<aside class="archive-status" aria-label="Your archive status"><span>${pixelIcon('folder')} ${progress.discoveries} ${progress.discoveries === 1 ? 'discovery' : 'discoveries'} opened</span><span>${pixelIcon('bookmark')} ${saved} ${saved === 1 ? 'file' : 'files'} saved</span><span>${pixelIcon('stamp')} ${scrapbookStamps.filter(stamp => owned.includes(stamp.id) || progress[stamp.metric] >= stamp.target).length}/4 stamps filed</span><span>your own little corner of the internet.</span></aside>`;
  }
  async function mountHome() {
    const target = root.querySelector('#now-playing'); if (!target) return;
    try { const data = await publishedEraAssets(); if (target.isConnected) target.innerHTML = nowPlaying(data.nowPlaying); } catch { /* The empty listening shelf remains readable. */ }
  }
  return { recordDiscovery, recordRound, homeMarkup, statusMarkup, mountHome };
}
