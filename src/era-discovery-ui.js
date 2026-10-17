import { discoveryEras, discoveryEra, eraURL } from './era-discoveries.js';
import { escapeHTML as e, safeLink } from './article-content.js';
import { storyCard } from './article-layout.js';
import { originalImageURL, publishedEraAssets } from './site-identity.js';
const image = (era, large = false) => originalImageURL(era.collage) ? `<img src="${e(originalImageURL(era.collage))}" alt="${e(era.collage.alt || `${era.title} collage`)}" ${large ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` : `<div class="era-image-pending"><span>file ${era.number}</span><strong>${e(era.title)}</strong><span>the collage is still being filed.</span></div>`;
function mergeEra(era, data) {
  const doc = data?.eras?.find(item => item.eraId === era.id);
  if (!doc) return era;
  const discoveries = Array.isArray(doc.discoveries) && doc.discoveries.length ? doc.discoveries.filter(item => item && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) && typeof item.title === 'string' && typeof item.text === 'string').slice(0, 12) : era.discoveries;
  return { ...era, collage: doc.collage, description: doc.introduction || era.description, discoveries: discoveries.length ? discoveries : era.discoveries };
}
export const eraEntrances = (data = null) => `<div class="era-entrances">${discoveryEras.map(era => mergeEra(era, data)).map(era => `<a class="era-entrance era-entrance-${era.id}" href="${eraURL(era.id)}" data-discovery-era="${era.id}"><div class="era-entrance-image">${image(era)}</div><div class="era-entrance-copy"><span class="file-label">${era.number} / ${e(era.years)}</span><h3>${e(era.title)}</h3><p>${e(era.description)}</p><span class="folder-open">open this era <span aria-hidden="true">↗</span></span></div></a>`).join('')}</div>`;
export function createEraDiscoveryUI({ root, begin, render, home, read, save, openArticles, openDeepCut }) {
  let visit = 0;
  const key = 'fandom-files-saved-discoveries-v1';
  const saved = () => { const value = read(key, []); return Array.isArray(value) ? value.filter(item => item && discoveryEra(item.era) && typeof item.id === 'string' && typeof item.title === 'string') : []; };
  function bind(scope = root) {
    scope.querySelectorAll('[data-discovery-era]').forEach(link => link.onclick = event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); openEra(link.dataset.discoveryEra, true, new URL(link.href).hash); });
  }
  async function mountHome() {
    const target = root.querySelector('#era-home-entrances'); if (!target) return;
    target.innerHTML = eraEntrances(); bind(target);
    try { const data = await publishedEraAssets(); if (target.isConnected) { target.innerHTML = eraEntrances(data); bind(target); } } catch { /* Evergreen text remains available. */ }
  }
  function show(html, title) {
    begin('editorial'); document.title = `${title} — Fandom Files`; render(html); bind();
    const heading = root.querySelector('h1'); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function openIndex(navigate = true) {
    ++visit; if (navigate && location.pathname + location.search !== '/archive/') history.pushState({}, '', '/archive/');
    show(`<section class="era-index"><button class="text-button" id="era-home">← back to the dashboard</button><span class="file-label">THE ARCHIVE / THREE VERY ONLINE LIVES</span><h1>choose your <em>internet era.</em></h1><p>A few references become a whole rabbit hole. Start with the era that raised your feed.</p><div id="era-home-entrances"></div><div class="era-index-footnote"><h2>looking for something specific?</h2><p>Find a published story by artist, aesthetic, subject, or era.</p><button class="secondary" id="all-written-files">search all the files ↗</button></div></section>`, 'The Archive');
    root.querySelector('#era-home').onclick = home; root.querySelector('#all-written-files').onclick = () => openArticles({ sort: 'recent' }); mountHome();
  }
  async function openEra(id, navigate = true, fragment = location.hash) {
    const original = discoveryEra(id); if (!original) return openIndex(navigate);
    const currentVisit = ++visit;
    if (navigate && location.pathname !== eraURL(id)) history.pushState({}, '', eraURL(id) + fragment);
    show(`<section class="era-discovery-page"><h1>${e(original.title)}</h1><p role="status">Opening this era’s collage and discoveries…</p></section>`, original.title);
    function paint(era) {
      if (currentVisit !== visit) return;
      const collage = originalImageURL(era.collage), pins = era.discoveries.map((item, i) => ({ ...item, index: i + 1 }));
      show(`<section class="era-discovery-page"><button class="text-button" id="era-back">← all three eras</button><div class="era-introduction"><span class="file-label">FILE ${era.number} / ${e(era.years)} / EVERGREEN ARCHIVE</span><h1>${e(era.title)}</h1><p>${e(era.description)}</p></div><div class="era-interactive-collage">${image(era, true)}${collage ? pins.filter(item => Number.isFinite(item.x) && Number.isFinite(item.y)).map(item => `<a class="era-lore-pin" href="#discovery-${e(item.id)}" data-lore-pin="${e(item.id)}" style="left:${Math.max(3, Math.min(97, item.x))}%;top:${Math.max(3, Math.min(97, item.y))}%" aria-label="Open ${e(item.title)}">${item.index}</a>`).join('') : ''}</div>${era.collage?.credit ? `<p class="image-credit">${e(era.collage.credit)}</p>` : ''}<div class="era-discoveries-heading"><h2>pull on a little thread.</h2><p>${collage ? 'Tap a numbered pin or open a file below.' : 'Open a file below. The written lore works while the collage is being added.'}</p></div><div class="era-discoveries">${pins.map(item => `<details id="discovery-${e(item.id)}"><summary><span class="discovery-number">${item.index}</span><span><small>${e(item.kind || 'from the archive')}</small><strong>${e(item.title)}</strong></span><span aria-hidden="true">+</span></summary><div class="discovery-copy"><p>${e(item.text)}</p>${safeLink(item.source) ? `<a href="${e(safeLink(item.source))}" target="_blank" rel="noopener noreferrer">follow the reference ↗</a>` : ''}<button class="text-button" data-save-discovery="${e(item.id)}">save this file ♡</button><p class="save-discovery-status" role="status"></p></div></details>`).join('')}</div><div class="era-connected"><h2>one tab leads to another.</h2><p>Different eras, familiar fandom habits.</p>${discoveryEras.filter(item => item.id !== id).map(item => `<a class="pill" href="${eraURL(item.id)}" data-discovery-era="${item.id}">${e(item.title)} →</a>`).join('')}<a class="pill" href="/play/" id="era-deep-cut">today’s deep cut ↗</a></div><section class="era-related" aria-label="Published stories from this era"><h2>more from this era.</h2><div id="era-related-stories"><p role="status">Opening the published files…</p></div><button class="text-button" id="era-written-files">search the editorial archive ↗</button></section></section>`, era.title);
      root.querySelector('#era-back').onclick = () => openIndex(); root.querySelector('#era-written-files').onclick = () => openArticles({ era: era.articleEra, sort: 'recent' });
      root.querySelector('#era-deep-cut').onclick = event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); openDeepCut(); };
      root.querySelectorAll('[data-lore-pin]').forEach(pin => pin.onclick = event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); const detail = root.querySelector(`#discovery-${pin.dataset.lorePin}`); if (detail) { detail.open = true; detail.scrollIntoView({ block: 'center', behavior: 'auto' }); detail.querySelector('summary').focus({ preventScroll: true }); } });
      root.querySelectorAll('[data-save-discovery]').forEach(button => {
        const update = () => { const kept = saved().some(item => item.era === id && item.id === button.dataset.saveDiscovery); button.textContent = kept ? 'saved in my files ♥' : 'save this file ♡'; button.setAttribute('aria-pressed', String(kept)); };
        update(); button.onclick = () => { const item = era.discoveries.find(item => item.id === button.dataset.saveDiscovery), before = saved(), kept = before.some(value => value.era === id && value.id === item.id); save(key, kept ? before.filter(value => value.era !== id || value.id !== item.id) : [...before, { id: item.id, era: id, title: item.title }].slice(-200)); update(); button.nextElementSibling.textContent = kept ? 'Removed from your saved files.' : 'Saved in this browser. Find it in My Files.'; };
      });
      if (/^#discovery-[a-z0-9-]+$/.test(fragment)) { const kept = root.querySelector(fragment); if (kept) { kept.open = true; kept.scrollIntoView({ block: 'center' }); } }
      const related = root.querySelector('#era-related-stories');
      fetch('/api/articles?era=' + encodeURIComponent(era.articleEra) + '&sort=recent').then(async response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => {
        if (!related.isConnected || currentVisit !== visit) return;
        related.innerHTML = data.articles?.length ? `<div class="story-grid">${data.articles.slice(0, 3).map(story => storyCard(story)).join('')}</div>` : '<p>No editorial stories have been filed in this era yet. The discoveries above stay open.</p>';
      }).catch(() => { if (related.isConnected) related.innerHTML = '<p>The editorial files could not load. The discoveries above stay open.</p>'; });
    }
    // Wait briefly for the original image metadata; render text immediately on CMS failure.
    let data = null; try { data = await publishedEraAssets(); } catch { /* No fabricated image replacement. */ }
    if (currentVisit === visit) paint(mergeEra(original, data));
  }
  function savedMarkup() {
    const items = saved().reverse();
    return items.length ? `<section class="saved-discoveries"><h2>little files you kept.</h2><p>Saved in this browser.</p><ul>${items.map(item => `<li><a href="${eraURL(item.era)}#discovery-${e(item.id)}" data-discovery-era="${item.era}">${e(item.title)}</a> <span>${e(discoveryEra(item.era).title)}</span></li>`).join('')}</ul></section>` : '';
  }
  return { mountHome, openIndex, openEra, bind, savedMarkup, leave: () => { ++visit; } };
}
