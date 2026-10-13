import { desks, escapeHTML as e, safeLink, imageURL, renderImage, renderBody, storyURL, storySlug } from "./article-content.js";
const deskName = id => desks.find(desk => desk.id === id)?.name || "The Lore Files";
const date = value => Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(new Date(value)) : "";
const card = (article, large = false) => `<article class="story-card ${large ? "story-feature" : ""}"><a href="${storyURL(article.slug)}" data-story="${e(article.slug)}">${renderImage(article.coverImage, "story-card-image", large ? 1200 : 600) || `<div class="story-placeholder" aria-hidden="true"><span>file under:</span><strong>${e(deskName(article.category))}</strong><span>♡ &nbsp; you had to be there.</span></div>`}<div class="story-card-copy"><span class="eyebrow">${e(deskName(article.category))} / ${date(article.publishedAt)}</span><h2>${e(article.title)}</h2><p>${e(article.excerpt)}</p><span class="story-byline">${e(article.author)} <span>Open the file ↗</span></span></div></a></article>`;
export function createPublicationUI({ root, render, begin, read, save, home }) {
  let articles = null, loading = null, loadError = false, visit = 0;
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
    if (!loading) loading = fetchJSON("/api/articles").then(json => { articles = json.articles; loadError = false; return articles; }).catch(error => { loadError = true; throw error; }).finally(() => { loading = null; });
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
      target.innerHTML = `<div class="section-heading"><div><span class="eyebrow">THE EDITORIAL FILES / READ. EXPLORE. KEEP.</span><h2>notes from <em>the dashboard.</em></h2><p>Music, fandom, internet history, and the little things that connect them.</p></div><button class="text-button" data-desk="all">All the files ↗</button></div>${deskButtons()}${stories.length ? `<div class="editorial-cover-grid">${stories.slice(0, 3).map((story, index) => card(story, index === 0)).join("")}</div>` : `<div class="editorial-empty"><span class="eyebrow">THE FIRST ISSUE IS ON ITS WAY</span><h3>Every obsession has <em>a little history.</em></h3><p>This is where our stories will live. In the meantime, recover a reference, open an ask, or start your own little archive.</p><a class="pill" href="#play-section">Visit the games ↓</a></div>`}`;
      links();
    } catch {
      if (target.isConnected) { target.innerHTML = `<p class="editorial-notice" role="status">The editorial files couldn’t load. Your games are ready below. <button class="text-button" id="retry-editorial">Try again ↻</button></p>`; root.querySelector("#retry-editorial").onclick = mountHome; }
    }
  }
  function backButton() { root.querySelector("#publication-home").onclick = home; }
  async function openDesk(id = "all", navigate = true) {
    const currentVisit = ++visit;
    if (navigate) push(id === "all" ? "/?desk=all" : `/?desk=${encodeURIComponent(id)}`);
    const desk = desks.find(item => item.id === id);
    document.title = `${desk?.name || "The Editorial Files"} — The Fandom Files`;
    show("editorial", `<section class="editorial-page"><button class="text-button" id="publication-home">← Back to the dashboard</button><span class="eyebrow">MUSIC. FANDOM. INTERNET MEMORY.</span><h1>${e(desk?.name || "the editorial files.")}</h1><p>${e(desk?.description || "Follow your current obsession into an older internet era.")}</p>${deskButtons()}<div class="editorial-search"><label for="story-search">Find a rabbit hole<input id="story-search" type="search" maxlength="100" placeholder="an artist, era, creator, or aesthetic…"></label></div><p id="story-count" role="status">Opening the files…</p><div class="story-grid" id="story-list"></div></section>`);
    backButton();
    try {
      const stories = await list();
      if (currentVisit !== visit || !root.querySelector("#story-list")) return;
      const filter = () => {
        const term = root.querySelector("#story-search").value.toLowerCase().trim();
        const matching = stories.filter(story => (!desk || story.category === id) && `${story.title} ${story.excerpt} ${(story.tags || []).join(" ")}`.toLowerCase().includes(term));
        root.querySelector("#story-count").textContent = `${matching.length} ${matching.length === 1 ? "file" : "files"} found`;
        root.querySelector("#story-list").innerHTML = matching.map(story => card(story)).join("") || `<div class="editorial-empty"><h2>${stories.length ? "A quiet corner of the archive." : "The first files are coming soon."}</h2><p>${stories.length ? "Try another desk or search." : "Published stories will appear here. The daily games are open now."}</p></div>`;
        links();
      };
      root.querySelector("#story-search").oninput = filter; filter();
    } catch { if (currentVisit === visit) root.querySelector("#story-count").textContent = "The files couldn’t load. Please try again shortly."; }
  }
  const referenceLink = (url, title) => safeLink(url) ? `<a href="${e(safeLink(url))}" target="_blank" rel="noopener noreferrer">${e(title)} ↗</a>` : "";
  async function openStory(slug, navigate = true) {
    const currentVisit = ++visit;
    if (navigate) push(storyURL(slug));
    show("story", `<section class="story-reading"><button class="text-button" id="publication-home">← Back to the dashboard</button><p role="status">Opening this little piece of internet history…</p></section>`); backButton();
    try {
      const { article } = await fetchJSON(`/api/articles?slug=${encodeURIComponent(slug)}`);
      if (currentVisit !== visit || !root.querySelector(".story-reading")) return;
      document.title = `${article.title} — The Fandom Files`;
      const timeline = article.timeline?.length ? `<section class="story-extras"><span class="eyebrow">EXPLORE IT / THE TIMELINE</span><h2>How we <em>got here.</em></h2><div class="story-timeline">${article.timeline.map(moment => `<details><summary><span>${e(moment.date)}</span><strong>${e(moment.title)}</strong></summary><p>${e(moment.description)}</p>${referenceLink(moment.source, "Open the source")}</details>`).join("")}</div></section>` : "";
      const moodboard = article.moodboard?.length ? `<section class="story-extras"><span class="eyebrow">THE MOODBOARD DEPARTMENT</span><h2>Little objects. <em>A whole era.</em></h2><p>Tap an object to open its story.</p><div class="story-moodboard">${article.moodboard.map(item => `<details><summary>${imageURL(item.image, 500) ? `<img class="moodboard-object" src="${e(imageURL(item.image, 500))}" alt="${e(item.image.alt)}" loading="lazy">` : ""}${e(item.title)} <span>+</span></summary><div>${item.image?.caption || item.image?.credit ? `<p class="moodboard-credit">${e(item.image.caption)} ${e(item.image.credit)}</p>` : ""}<p>${e(item.description)}</p>${referenceLink(item.link, "Follow the reference")}</div></details>`).join("")}</div></section>` : "";
      const choices = Array.isArray(article.poll?.options) ? article.poll.options.slice(0, 6) : [];
      const poll = article.poll?.question && choices.length >= 2 ? `<section class="story-extras story-poll"><span class="eyebrow">THE GROUP CHAT / YOUR PERSONAL TAKE</span><h2>${e(article.poll.question)}</h2><div>${choices.map((choice, index) => `<button class="secondary" data-poll-choice="${index}" aria-pressed="false">${e(choice)}</button>`).join("")}</div><p id="story-poll-status" role="status">Your choice stays in this browser. This isn’t a public vote count.</p></section>` : "";
      show("story", `<article class="story-reading"><button class="text-button" id="publication-home">← Back to the dashboard</button><header class="story-heading"><span class="eyebrow">${e(deskName(article.category))} / ${date(article.publishedAt)}</span><h1>${e(article.title)}</h1><p class="story-deck">${e(article.excerpt)}</p><p class="story-author">By ${e(article.author)}</p><div class="story-actions"><button class="secondary" id="save-story">Save to my Sideblog ♡</button><button class="pill" id="share-story">Send to the group chat ↗</button></div><p id="story-action-status" role="status"></p></header>${renderImage(article.coverImage, "story-cover", 1400)}<div class="story-body">${renderBody(article.body)}</div>${timeline}${moodboard}${poll}${article.sources?.length ? `<aside class="story-sources"><h2>Sources & little footnotes</h2><ul>${article.sources.map(source => `<li>${referenceLink(source.url, source.title) || e(source.title)}${source.note ? `<p>${e(source.note)}</p>` : ""}</li>`).join("")}</ul></aside>` : ""}<div class="story-tags">${(article.tags || []).map(tag => `<span>#${e(tag)}</span>`).join("")}</div><section class="story-extras"><span class="eyebrow">THE RABBIT HOLE / GO DEEPER</span><h2>Where to <em>next?</em></h2>${article.related?.length ? `<div class="story-grid">${article.related.map(story => card(story)).join("")}</div>` : `<p>Keep following the little connections.</p><button class="secondary" data-desk="${e(article.category || "all")}">More from ${e(deskName(article.category))} ↗</button>`}</section><p class="story-colophon">Filed with love for the group chat. ♡ <button class="text-button" id="story-sideblog">Open my saved stories →</button></p></article>`);
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
    if (desk === "saved") { openSaved(); return true; }
    if (desk) { openDesk(desk, false); return true; }
    return false;
  }
  function leave() { ++visit; document.title = "The Fandom Files — music, fandom & internet memory"; }
  return { mountHome, openDesk, openStory, openSaved, route, leave };
}
