import { arrowIcon } from "./design-symbols.js";
import { desks, escapeHTML as e, storyURL, storySlug } from "./article-content.js";
import { archiveTopics, archiveEras, archiveURL } from "./archive-topics.js";
import { storyCard as card, articleLayout } from "./article-layout.js";
export function createPublicationUI({ root, render, begin, read, save, home }) {
  let articles = null, loading = null, visit = 0;
  const savedKey = "fandom-files-saved-stories-v1";
  const saved = () => { const value = read(savedKey, []); return Array.isArray(value) ? value.filter(item => item && typeof item.slug === "string" && typeof item.title === "string") : []; };
  async function fetchJSON(url) {
    const response = await fetch(url);
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "This file could not load.");
    return json;
  }
  async function list() {
    if (articles) return articles;
    if (!loading) loading = fetchJSON("/api/articles?sort=recent").then(json => { articles = json.articles; return articles; }).finally(() => { loading = null; });
    return loading;
  }
  function links() {
    root.querySelectorAll("[data-story]").forEach(link => link.onclick = event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); openStory(link.dataset.story);
    });
    root.querySelectorAll("[data-desk]").forEach(button => button.onclick = () => openDesk(button.dataset.desk));
  }
  function focusHeading() { const heading = root.querySelector("h1"); if (heading) { heading.tabIndex = -1; heading.focus(); } }
  function show(screen, html) { begin(screen); render(html); links(); focusHeading(); }
  function push(url) { if (location.pathname + location.search !== url) history.pushState({}, "", url); }
  const deskButtons = () => `<div class="desk-tabs" aria-label="Browse the editorial desks">${desks.map(desk => `<button class="pill" data-desk="${desk.id}">${desk.name}</button>`).join("")}</div>`;
  async function mountHome() {
    const target = root.querySelector("#editorial-home");
    if (!target) return;
    try {
      const stories = await list();
      if (!target.isConnected) return;
      target.innerHTML = `<div class="section-heading"><div><span class="file-label">LATEST FILES / FRESHLY UNCOVERED</span><h2>THE LATEST <em>OBSESSIONS.</em></h2><p>The stories behind the screenshots. The lore behind the culture.</p></div><button class="text-button" data-desk="all">All the files ${arrowIcon}</button></div>${deskButtons()}${stories.length ? `<div class="editorial-cover-grid">${stories.slice(0, 3).map((story, index) => card(story, index === 0)).join("")}</div>` : `<div class="editorial-empty"><span class="empty-file-stamp" aria-hidden="true">FILE UNDER: COMING SOON</span><span class="file-label">THE FIRST FILES ARE STILL ON THE DESK</span><h3>GOOD LORE TAKES<br><em>A LITTLE DIGGING.</em></h3><p>The editorial archive is waiting for its first published story. Until then, there’s a quiz to take, an ask to decode, and a lost post with your name on it.</p><a class="pill" href="#play-section">Visit the games ↓</a></div>`}`;
      links();
    } catch {
      if (target.isConnected) { target.innerHTML = `<p class="editorial-notice" role="status">The editorial files couldn’t load. Your games are ready below. <button class="text-button" id="retry-editorial">Try again ↻</button></p>`; root.querySelector("#retry-editorial").onclick = mountHome; }
    }
  }
  function backButton() { root.querySelector("#publication-home").onclick = home; }
  function openDesk(id = "all", navigate = true) {
    if (navigate) push(id === "all" ? "/?desk=all" : `/?desk=${encodeURIComponent(id)}`);
    return openArchive({ desk: desks.some(desk => desk.id === id) ? id : "", sort: "recent" }, false);
  }
  async function openArchive(initial = {}, navigate = true) {
    const currentVisit = ++visit;
    let filters = { category: initial.category || "", era: initial.era || "", q: initial.q || "", desk: initial.desk || "", sort: initial.sort || "featured" };
    if (navigate) push(archiveURL(filters.category));
    document.title = "The Archive — Fandom Files";
    const topic = archiveTopics.find(item => item.id === filters.category);
    show("editorial", `<section class="editorial-page cabinet-page"><button class="text-button" id="publication-home">← Back to the cover</button><div class="cabinet-heading"><span class="file-label">FANDOM FILES / SEARCHABLE INTERNET HISTORY</span><h1 id="cabinet-title">${topic ? e(topic.title) : "THE <em>ARCHIVE.</em>"}</h1><p>Open an obsession. Pull at a thread. See where it takes you.</p><span class="cabinet-scribble" aria-hidden="true">your new rabbit hole <span class="note-arrow">${arrowIcon}</span></span></div><div class="cabinet-filters"><form id="archive-search-form"><label for="story-search">SEARCH THE FILES<input id="story-search" type="search" maxlength="100" value="${e(filters.q)}" placeholder="an artist, an era, a very specific reference…"></label><button class="secondary" type="submit">SEARCH ${arrowIcon}</button></form><div class="cabinet-tabs" aria-label="Filter by archive folder"><button class="pill" data-category="">ALL FILES</button>${archiveTopics.map(item => `<button class="pill" data-category="${item.id}">${e(item.title)}</button>`).join("")}</div><div class="cabinet-selects"><label>ERA<select id="archive-era"><option value="">Every era</option>${archiveEras.map(era => `<option value="${era.id}">${e(era.title)}</option>`).join("")}</select></label><label>ORDER<select id="archive-sort"><option value="featured">Featured files first</option><option value="recent">Freshly uncovered</option></select></label><label>EDITORIAL FORMAT<select id="archive-desk"><option value="">Every desk</option>${desks.map(desk => `<option value="${desk.id}">${e(desk.name)}</option>`).join("")}</select></label><button class="text-button" id="archive-clear">CLEAR FILTERS ×</button></div></div><p id="story-count" role="status">Opening the cabinet…</p><div class="story-grid cabinet-files" id="story-list"></div><button class="secondary" id="archive-more" hidden>OPEN MORE FILES ↓</button></section>`);
    backButton();
    const search = root.querySelector('#story-search'), count = root.querySelector('#story-count'), grid = root.querySelector('#story-list'), more = root.querySelector('#archive-more');
    let requestNumber = 0, nextPage = null, debounce;
    const update = async (append = false) => {
      const requestId = ++requestNumber;
      const selectedTopic = archiveTopics.find(item => item.id === filters.category);
      root.querySelector('#cabinet-title').innerHTML = selectedTopic ? e(selectedTopic.title) : 'THE <em>ARCHIVE.</em>';
      document.title = `${selectedTopic?.title || 'The Archive'} — Fandom Files`;
      const params = new URLSearchParams(Object.entries(filters).filter(([,value]) => value));
      if (location.pathname.startsWith('/archive')) history.replaceState({}, '', '/archive/' + (params.size ? '?' + params : ''));
      if (append && nextPage !== null) params.set('page', String(nextPage));
      root.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === filters.category)));
      root.querySelector('#archive-era').value = filters.era; root.querySelector('#archive-sort').value = filters.sort; root.querySelector('#archive-desk').value = filters.desk;
      more.disabled = true; count.textContent = 'Retrieving your files…';
      try {
        const result = await fetchJSON('/api/articles?' + params);
        if (currentVisit !== visit || requestId !== requestNumber || !grid.isConnected) return;
        grid.innerHTML = (append ? grid.innerHTML : '') + result.articles.map(story => card(story)).join('');
        if (!grid.children.length) grid.innerHTML = `<div class="editorial-empty"><span class="file-label">NO FILES IN THIS DRAWER</span><h2>${filters.q || filters.category || filters.era ? 'A little too niche? <em>Try another thread.</em>' : 'The first files are <em>coming soon.</em>'}</h2><p>${filters.q || filters.category || filters.era ? 'Change a filter or clear the search to open the rest of the archive.' : 'Published stories will appear here. The game room is open now.'}</p></div>`;
        count.textContent = `${result.total ?? result.articles.length} ${(result.total ?? result.articles.length) === 1 ? 'file' : 'files'} found`;
        nextPage = result.nextPage ?? null; more.hidden = nextPage === null; more.disabled = false; links();
      } catch { if (currentVisit === visit && requestId === requestNumber) { count.textContent = 'The cabinet couldn’t load. Press Search to try again; the game room is still open.'; more.hidden = true; } }
    };
    root.querySelector('#archive-search-form').onsubmit = event => { event.preventDefault(); clearTimeout(debounce); filters.q = search.value.trim(); update(); };
    search.oninput = () => { clearTimeout(debounce); debounce = setTimeout(() => { if (!search.isConnected) return; filters.q = search.value.trim(); update(); }, 250); };
    root.querySelectorAll('[data-category]').forEach(button => button.onclick = () => { filters.category = button.dataset.category; update(); });
    for (const [id, field] of [['archive-era','era'],['archive-sort','sort'],['archive-desk','desk']]) root.querySelector('#'+id).onchange = event => { filters[field] = event.target.value; update(); };
    root.querySelector('#archive-clear').onclick = () => { clearTimeout(debounce); filters = { category: '', era: '', q: '', desk: '', sort: 'featured' }; search.value = ''; update(); };
    more.onclick = () => update(true); update();
  }
  async function openStory(slug, navigate = true) {
    const currentVisit = ++visit;
    if (navigate) push(storyURL(slug));
    show("story", `<section class="story-reading"><button class="text-button" id="publication-home">← Back to the dashboard</button><p role="status">Opening this little piece of internet history…</p></section>`); backButton();
    try {
      const { article } = await fetchJSON(`/api/articles?slug=${encodeURIComponent(slug)}`);
      if (currentVisit !== visit || !root.querySelector(".story-reading")) return;
      document.title = `${article.title} — The Fandom Files`;
      show("story", articleLayout(article));
      const choices = Array.isArray(article.poll?.options) ? article.poll.options.slice(0, 6) : [];
      const poll = article.poll?.question && choices.length >= 2;
      backButton();
      const saveButton = root.querySelector("#save-story");
      const updateSave = () => { const isSaved = saved().some(item => item.slug === slug); saveButton.textContent = isSaved ? "Saved to my Sideblog ♥" : "Save to my Sideblog ♡"; saveButton.setAttribute("aria-pressed", String(isSaved)); };
      updateSave(); saveButton.onclick = () => {
        const existing = saved(), wasSaved = existing.some(item => item.slug === slug);
        save(savedKey, wasSaved ? existing.filter(item => item.slug !== slug) : [...existing, { slug, title: article.title, excerpt: article.excerpt, category: article.category, author: article.author, publishedAt: article.publishedAt, coverImage: article.coverImage }].slice(-200));
        updateSave(); root.querySelector("#story-action-status").textContent = wasSaved ? "Removed from your saved stories." : "Filed in your saved stories in this browser. ♡";
      };
      root.querySelector("#share-story").onclick = async () => {
        const url = new URL(storyURL(slug), location.origin).href;
        try { if (navigator.share) await navigator.share({ title: article.title, url }); else { await navigator.clipboard.writeText(url); root.querySelector("#story-action-status").textContent = "Story link copied. ♡"; } }
        catch (error) { if (error.name !== "AbortError") root.querySelector("#story-action-status").textContent = `Share this link: ${url}`; }
      };
      root.querySelector("#story-sideblog").onclick = openSaved;
      if (poll) {
        const pollKey = `fandom-files-story-poll-${article._id}`;
        const updatePoll = () => { const value = read(pollKey, null); root.querySelectorAll("[data-poll-choice]").forEach(button => button.setAttribute("aria-pressed", String(choices[Number(button.dataset.pollChoice)] === value))); root.querySelector("#story-poll-status").textContent = typeof value === "string" && choices.includes(value) ? `Your take: ${value}. Saved in this browser; no public vote totals.` : "Your choice stays in this browser. No public vote totals."; };
        root.querySelectorAll("[data-poll-choice]").forEach(button => button.onclick = () => { save(pollKey, choices[Number(button.dataset.pollChoice)]); updatePoll(); }); updatePoll();
      }
    } catch (error) { if (currentVisit === visit) { show("story", `<section class="story-reading"><button class="text-button" id="publication-home">← Back to the dashboard</button><h1>This file is <em>still tucked away.</em></h1><p role="status">${e(error.message)}</p><button class="secondary" data-desk="all">Browse the published files →</button></section>`); backButton(); } }
  }
  function openSaved() {
    ++visit; push("/?desk=saved");
    document.title = "My Saved Stories — The Fandom Files";
    const stories = saved().reverse();
    show("editorial", `<section class="editorial-page"><button class="text-button" id="publication-home">← Back to the dashboard</button><span class="eyebrow">MY SIDEBLOG / KEEP IT</span><h1>my saved <em>stories.</em></h1><p>Your personal reading archive stays in this browser. ${stories.length}/200 files kept.</p><div class="story-grid">${stories.map(story => `<div>${card(story)}<button class="text-button" data-remove-story="${e(story.slug)}">Unsave ${e(story.title)} ×</button></div>`).join("") || `<div class="editorial-empty"><h2>A little room for your next obsession.</h2><p>Open a story and tap “Save to my Sideblog” to keep it here.</p><button class="secondary" data-desk="all">Find a file to keep →</button></div>`}</div></section>`);
    backButton(); root.querySelectorAll("[data-remove-story]").forEach(button => button.onclick = () => { save(savedKey, saved().filter(item => item.slug !== button.dataset.removeStory)); openSaved(); });
  }
  function route() {
    const slug = storySlug(location.pathname), desk = new URL(location.href).searchParams.get("desk");
    if (slug) { openStory(slug, false); return true; }
    if (/^\/archive\/?$/.test(location.pathname)) { openArchive(Object.fromEntries(new URL(location.href).searchParams), false); return true; }
    if (desk === "saved") { openSaved(); return true; }
    if (desk) { openDesk(desk, false); return true; }
    return false;
  }
  function leave() { ++visit; document.title = "The Fandom Files — music, fandom & internet memory"; }
  return { mountHome, openArchive, openDesk, openStory, openSaved, route, leave };
}
