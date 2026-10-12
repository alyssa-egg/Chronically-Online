import { badgeDefinitions, badgeById, badgeProgress, rarityOrder, featuredBadge } from './badges.js';
import { exportBadge } from './collectibles-export.js';
import { playSound } from './sound.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function badgeCard(badge, owned, progress = 0, compact = false) {
  return `<article class="artifact-card rarity-${badge.rarity} ${owned ? 'artifact-owned' : 'artifact-locked'} ${compact ? 'artifact-compact' : ''}"><div class="artifact-topline"><span>${escape(badge.era)}</span><span>${badge.rarity}</span></div><div class="artifact-art"><img src="./src/assets/collectibles/${badge.art}.svg" alt="" width="160" height="160" aria-hidden="true"><span class="artifact-serial">FF / ${String(badgeDefinitions.indexOf(badge) + 1).padStart(3, '0')}</span>${owned ? '<span class="artifact-sparkle" aria-hidden="true">✧</span>' : '<span class="artifact-lock" aria-hidden="true">?</span>'}</div><div class="artifact-caption"><h3>${owned ? escape(badge.title) : '??? / sealed artifact'}</h3><p>${escape(owned ? badge.description : badge.requirement)}</p>${owned ? `<small>FILED ${escape(owned.date || 'IN YOUR ARCHIVE')}</small><button class="text-button" data-view-badge="${badge.id}" aria-label="Open ${escape(badge.title)}">Open collectible →</button>` : `<progress value="${progress}" max="${badge.goal}" aria-label="${escape(badge.requirement)}"></progress><small>${progress}/${badge.goal} · ${escape(badge.requirement)}</small>`}</div></article>`;
}
export function badgeShelf(state) {
  return `<section class="collectible-shelf" aria-labelledby="collectible-title"><div class="section-heading"><div><span class="eyebrow">YOUR COLLECTIBLE INTERNET ARTIFACTS</span><h2 id="collectible-title">kept every <em>little thing.</em></h2><p>${state.badges.length}/${badgeDefinitions.length} collected. Start with a stamp from the free games. Your finds stay, even if you miss a day.</p></div><button class="secondary" id="open-lore-book">Read my Lore Book →</button></div><div class="artifact-grid">${badgeDefinitions.map(badge => badgeCard(badge, state.badges.find(item => item.id === badge.id), badgeProgress(badge, state))).join('')}</div></section>`;
}
export function featuredArtifacts(state) {
  const badge = featuredBadge(state);
  return `<section class="featured-find" aria-label="Your featured collectible">${badge ? `<span class="eyebrow">MY FEATURED FIND / KEEPING THIS ONE</span>${badgeCard(badge, state.badges.find(item => item.id === badge.id), 0, true)}` : '<span class="eyebrow">YOUR FEATURED FIND</span><p>The first little artifact is waiting for you. Finish a game to start collecting. ♡</p>'}</section><div class="pinned-artifacts" aria-label="Your pinned collectibles">${state.badgePins.filter(id => id !== badge?.id).map(id => { const item = badgeById(id); return `<button data-view-badge="${id}" aria-label="Open ${escape(item.title)}"><img src="./src/assets/collectibles/${item.art}.svg" alt="" width="70" height="70"><span>${escape(item.title)}</span></button>`; }).join('')}</div>`;
}
export function createCollectiblesUI({ root, state, write, openSideblog }) {
  let pending = [], timer;
  const dialog = document.createElement('dialog');
  dialog.id = 'collectible-dialog'; dialog.setAttribute('aria-labelledby', 'collectible-dialog-title');
  document.body.append(dialog);
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-view-badge]');
    if (button && root.contains(button)) openBadge(button.dataset.viewBadge);
  });
  function openBadge(id, celebration = false, additional = 0) {
    const badge = badgeById(id), owned = state().badges.find(item => item.id === id);
    if (!badge || !owned) return;
    dialog.innerHTML = `<button class="pill collectible-close">Close ×</button><span class="eyebrow">${celebration ? 'A NEW LITTLE PIECE OF YOUR HISTORY' : 'FROM YOUR COLLECTION'}</span><h2 id="collectible-dialog-title">${celebration ? 'oh, you kept the receipt.' : escape(badge.title)}</h2><div class="${celebration ? 'artifact-flip' : ''}">${badgeCard(badge, owned)}</div>${additional ? `<p>+ ${additional} more ${additional === 1 ? 'collectible is' : 'collectibles are'} waiting in your Sideblog.</p>` : ''}<div class="collectible-actions"><button class="primary" id="feature-collectible">Pin to my Sideblog ♡</button><button class="secondary" id="toggle-collectible-pin">${state().badgePins.includes(id) ? "Remove from pinned finds" : "Add to pinned finds"}</button><button class="secondary" id="share-collectible">Save / share this card →</button><button class="text-button" id="visit-collection">See my collection →</button></div><p id="collectible-status" role="status"></p>`;
    dialog.querySelector('.collectible-close').onclick = () => dialog.close();
    dialog.querySelector('[data-view-badge]').remove();
    dialog.querySelector('#feature-collectible').onclick = () => {
      const next = state(); next.featuredBadge = id;
      next.badgePins = [id, ...next.badgePins.filter(item => item !== id)].slice(0, 3);
      write(next); dialog.close(); openSideblog();
    };
    dialog.querySelector('#toggle-collectible-pin').onclick = () => {
      const next = state();
      if (next.badgePins.includes(id)) next.badgePins = next.badgePins.filter(item => item !== id);
      else if (next.badgePins.length < 3) next.badgePins.push(id);
      else { dialog.querySelector('#collectible-status').textContent = 'Three finds fit on your Sideblog. Unpin one before adding another.'; return; }
      write(next); dialog.close(); openSideblog();
    };
    dialog.querySelector('#visit-collection').onclick = () => { dialog.close(); openSideblog(); };
    dialog.querySelector('#share-collectible').onclick = async event => {
      const button = event.currentTarget; button.disabled = true;
      try { await exportBadge(badge, owned.date); dialog.querySelector('#collectible-status').textContent = 'Ready for your mutuals. No puzzle answers on this card. ♡'; }
      catch(error) { if(error.name !== 'AbortError') dialog.querySelector('#collectible-status').textContent = 'Could not save your card. Please try again.'; }
      finally { button.disabled = false; }
    };
    if (!dialog.open) dialog.showModal();
    if (celebration) playSound('unlock');
  }
  function flush() {
    if (!pending.length || document.querySelector('dialog[open]')) return;
    const ids = [...new Set(pending)].sort((a,b) => rarityOrder[badgeById(b).rarity] - rarityOrder[badgeById(a).rarity]);
    pending = []; openBadge(ids[0], true, ids.length - 1);
  }
  document.addEventListener('close', () => { if(pending.length) setTimeout(flush, 100); }, true);
  const notify = ids => { if(!ids.length) return; pending.push(...ids); clearTimeout(timer); timer = setTimeout(flush, 480); };
  return { notify, openBadge };
}
