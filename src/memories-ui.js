import { discoveryEras, discoveryEra } from './era-discoveries.js';
import { escapeHTML as e } from './article-content.js';
import { pixelIcon } from './archive-atoms.js';

export function createMemoriesUI({ root, begin, render, home }) {
  let visit = 0, controller;
  const leave = () => { ++visit; controller?.abort(); };
  function open(era = '', navigate = true) {
    leave();
    let selected = discoveryEra(era) ? era : '', offset = 0, loading = false, enabled = false, sending = false, listRequest = 0;
    const current = visit;
    const address = () => '/memories/' + (selected ? `?era=${encodeURIComponent(selected)}` : '');
    if (navigate && location.pathname + location.search !== address()) history.pushState({}, '', address());
    begin('memories'); document.title = 'Era Memories — The Fandom Files';
    render(`<section class="memories-page"><button class="text-button" id="memories-home">← back to the dashboard</button><span class="file-label">THE MEMORIES TAB / YOU HAD TO BE THERE</span><h1>we remember <em>that too.</em></h1><p class="memories-intro">The first fan account. The video you watched after school. The song that takes you straight back. Leave a little piece of your internet history.</p><div class="memory-filters" role="group" aria-label="Filter memories by era"><button class="pill" data-memory-filter="">all eras</button>${discoveryEras.map(item => `<button class="pill" data-memory-filter="${item.id}">${e(item.title)} <span>${e(item.years)}</span></button>`).join('')}</div><div class="memories-layout"><section class="memory-wall" aria-labelledby="memory-wall-title"><div class="memory-wall-heading"><h2 id="memory-wall-title">a mutual memory.</h2><button class="text-button" id="refresh-memories">refresh memories ↻</button></div><p id="memories-status" role="status">Opening the memory wall…</p><div id="memory-list" class="memory-list" aria-busy="true"></div><button class="secondary" id="more-memories" hidden>more memories ↓</button></section><aside class="memory-inbox"><div class="window-bar"><span>fandomfiles.blog / leave-a-memory</span>${pixelIcon('mail')}</div><form id="memory-form"><h2>leave a little <em>memory.</em></h2><p>Your memory and nickname will be public after we review and publish them. Keep private details out; share your own memories kindly.</p><label for="memory-era">Your era<select id="memory-era" name="eraId" required>${discoveryEras.map(item => `<option value="${item.id}">${e(item.title)} / ${e(item.years)}</option>`).join('')}</select></label><label for="memory-name">Nickname <span>(optional)</span><input id="memory-name" name="displayName" maxlength="40" autocomplete="off" placeholder="anonymous mutual"></label><label for="memory-text">What do you remember?<textarea id="memory-text" name="memory" minlength="10" maxlength="600" rows="6" required aria-describedby="memory-count" placeholder="I still remember…"></textarea></label><span id="memory-count" class="memory-count">0/600 characters · at least 10</span><div class="memory-honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabindex="-1" autocomplete="off"></label></div><button class="primary" id="send-memory" disabled>send my memory ${pixelIcon('arrow')}</button><p id="memory-submit-status" role="status"></p></form></aside></div></section>`);
    const page = root.querySelector('.memories-page'), list = page.querySelector('#memory-list'), status = page.querySelector('#memories-status'), more = page.querySelector('#more-memories'), form = page.querySelector('#memory-form'), submit = page.querySelector('#send-memory'), submitStatus = page.querySelector('#memory-submit-status');
    const alive = () => current === visit && page.isConnected;
    const count = () => { page.querySelector('#memory-count').textContent = `${form.elements.memory.value.length}/600 characters · at least 10`; };
    const updateFilters = () => page.querySelectorAll('[data-memory-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.memoryFilter === selected)));
    function card(item) {
      const era = discoveryEra(item.eraId);
      if (!era || typeof item.memory !== 'string') return '';
      return `<article class="memory-note" data-era="${era.id}"><span class="file-label">${e(era.title)} / ${e(era.years)}</span><p>${e(item.memory)}</p><span class="memory-byline">filed by ${e(item.displayName || 'anonymous mutual')}</span></article>`;
    }
    async function load(append = false) {
      controller?.abort(); controller = new AbortController();
      const request = ++listRequest;
      loading = true; more.disabled = true; list.setAttribute('aria-busy', 'true');
      status.textContent = 'Opening the memory wall…';
      const nextOffset = append ? offset + 20 : 0;
      try {
        const response = await fetch(`/api/memories?era=${encodeURIComponent(selected)}&offset=${nextOffset}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!Array.isArray(data.memories)) throw new Error();
        if (!alive() || request !== listRequest) return;
        offset = nextOffset; enabled = data.submissionsEnabled === true; submit.disabled = !enabled || sending;
        if (!enabled && !sending) submitStatus.textContent = 'The memory inbox is opening soon. You can still read published memories.';
        else if (submitStatus.textContent.startsWith('The memory inbox is opening soon.')) submitStatus.textContent = '';
        const html = data.memories.map(card).join('');
        if (append) list.insertAdjacentHTML('beforeend', html); else list.innerHTML = html;
        status.textContent = list.children.length ? 'Memories shared by readers and published after review.' : 'No published memories here yet. Yours could be the first little receipt.';
        more.hidden = !data.hasMore;
      } catch (error) {
        if (alive() && request === listRequest && error.name !== 'AbortError') status.textContent = 'The memory wall could not load. Try “refresh memories” in a moment.';
      } finally {
        if (alive() && request === listRequest) { loading = false; more.disabled = false; list.setAttribute('aria-busy', 'false'); }
      }
    }
    page.querySelector('#memories-home').onclick = home;
    page.querySelectorAll('[data-memory-filter]').forEach(button => button.onclick = () => {
      selected = button.dataset.memoryFilter;
      if (location.pathname + location.search !== address()) history.pushState({}, '', address());
      updateFilters(); if (selected) form.elements.eraId.value = selected;
      list.innerHTML = ''; more.hidden = true; load();
    });
    if (selected) form.elements.eraId.value = selected;
    form.elements.memory.addEventListener('input', count);
    page.querySelector('#refresh-memories').onclick = () => load();
    more.onclick = () => { if (!loading) load(true); };
    form.onsubmit = async event => {
      event.preventDefault();
      if (sending || !enabled || !form.reportValidity()) return;
      sending = true; submit.disabled = true; submitStatus.textContent = 'Sending your memory…';
      const body = Object.fromEntries(new FormData(form));
      form.querySelectorAll('input, textarea, select').forEach(input => input.disabled = true);
      try {
        const response = await fetch('/api/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await response.json();
        if (!alive()) return;
        if (!response.ok) throw new Error(data.error || 'Your memory could not be sent. Please try again.');
        form.reset(); if (selected) form.elements.eraId.value = selected; count();
        submitStatus.textContent = data.message || 'Memory sent! It will appear after we review and publish it.';
      } catch (error) { if (alive()) submitStatus.textContent = error.message || 'Your memory could not be sent. Please try again.'; }
      finally { if (alive()) { sending = false; submit.disabled = !enabled; form.querySelectorAll('input, textarea, select').forEach(input => input.disabled = false); } }
    };
    updateFilters(); load();
    const heading = page.querySelector('h1'); heading.tabIndex = -1; heading.focus({ preventScroll: true });
  }
  return { open, leave };
}
