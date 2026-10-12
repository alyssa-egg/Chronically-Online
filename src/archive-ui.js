import { catalog, samples } from "./archive-catalog.js";
import { recoverFile, fileAnswer, validCollectionProgress, normalizeReference } from "./collection.js";
import { sideblogState, collect, pinnedReceipts, themes, stickers } from "./sideblog.js";
import { lostPost, lostWon, validLostGuesses } from "./lost-post.js";
import { dayKey, eras } from "./game.js";
import { archiveCollection, signedIn } from "./membership.js";
import { playSound } from "./sound.js";
import { exportSideblog } from "./sideblog-export.js";
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const cursorImage = '<img class="mini-pixel-cursor" src="./src/assets/pixel-cursor.png" alt="" aria-hidden="true" width="67" height="90">';
const stickerMarkup = sticker => sticker.id === "cursor" ? cursorImage : escape(sticker.label);
const blogKey = "deep-cut-sideblog-v1";
export function createArchiveUI(config) {
  const { root, read, save, home, render, begin, getScreen, canPlay, membership, finishDay } = config;
  let activeCollection, progress = [], order = [], currentPost, lostGuesses = [];
  const state = () => sideblogState(read(blogKey, {}));
  const award = (type, record) => save(blogKey, collect(state(), type, record));
  const show = (screen, content) => {
    begin(screen); render(content);
    const heading = root.querySelector("h1");
    if (heading) { heading.tabIndex = -1; heading.focus(); }
  };
  const back = () => home();
  const bindBack = () => root.querySelectorAll("[data-blog-home]").forEach(button => button.onclick = back);
  const collectionKey = collection => `deep-cut-collection-${collection.version}-${collection.id}`;
  const completed = collection => read(collectionKey(collection), []).length === collection.fileCount;
  const receipt = record => award("receipts", { ...record, date: dayKey() });
  const stamp = record => award("stamps", { ...record, date: dayKey() });
  function homeExtras() {
    const scrapbook = state(), post = lostPost(dayKey());
    return `<section class="lost-teaser" aria-labelledby="lost-home-title"><div class="window-bar"><span>deepcut.archive / lost-post-${post.day}</span><span>♡</span></div><div class="lost-teaser-body"><div class="lost-preview" aria-hidden="true"><span class="scrap scrap-caption">♡<small>a saved caption</small></span><span class="scrap scrap-tag">#<small>a forgotten tag</small></span><span class="scrap scrap-receipt">▤<small>a torn receipt</small></span><span class="scrap scrap-mutual">${cursorImage}<small>a mutual's note</small></span></div><div><span class="eyebrow">YOUR DAILY RECOVERY MISSION / FREE</span><h2 id="lost-home-title">the <em>lost post.</em></h2><p>Four clues. One piece of fandom history. Decode the reference, recover its story, and keep the receipt.</p><button class="primary" id="open-lost">Recover today’s post →</button><p class="ask-small">3 guesses · a fresh file at midnight Eastern</p></div></div></section><aside class="sideblog-teaser"><span class="sideblog-icon" aria-hidden="true">♡</span><div><span class="eyebrow">YOUR SIDEBLOG</span><p>${scrapbook.receipts.length ? `${scrapbook.receipts.length} receipts, ${scrapbook.stamps.length} stamps. A little archive that looks like you.` : "Your little digital scrapbook starts with your first recovered receipt."}</p></div><button class="secondary" id="open-sideblog">Open my sideblog →</button></aside>`;
  }
  function bindHome() {
    root.querySelector("#open-lost").onclick = openLost;
    root.querySelector("#open-sideblog").onclick = openSideblog;
    root.querySelectorAll("[data-archive]").forEach(button => button.onclick = () => openEra(button.dataset.archive));
  }
  function openEra(id) {
    const era = eras.find(item => item.id === id);
    if (!era) return;
    const folders = catalog.filter(item => item.era === id);
    show("archive", `<section class="archive-world world-${id}"><button class="text-button" data-blog-home>← Back to the blog</button><span class="eyebrow">${escape(era.years)} / ${escape(era.mechanic)}</span><h1>${escape(era.name)}</h1><p class="intro">${escape(era.description)} Start with the free folder, then follow the connections.</p><div class="collection-grid">${folders.map(collection => `<article class="collection-card"><span class="folder-icon" aria-hidden="true">${era.icon}</span><span class="eyebrow">${collection.free ? "FREE SAMPLE" : "ERA MEMBERSHIP"} / ${collection.fileCount} FILES</span><h2>${escape(collection.title)}</h2><p>${escape(collection.description)}</p><p class="collection-reward">✧ Finish to add a chapter and unlock your ${id === "tumblr" ? "pastel fan-account" : id === "youtube" ? "comfort-video" : "new-lore"} theme.</p><button class="${collection.free ? "primary" : "secondary"}" data-collection="${collection.id}">${completed(collection) ? "Reopen my recovered folder" : collection.free || canPlay() ? "Open this folder" : "Unlock the full archive · $5 once"} →</button></article>`).join("")}</div><div class="archive-remix"><p>Your archive collections stay recovered. Your classic five-question remix still refreshes daily.</p><button class="secondary" id="classic-remix">Play today’s 5-question remix →</button></div></section>`);
    bindBack(); bindCollections(); root.querySelector("#classic-remix").onclick = () => config.startGame(id);
  }
  function bindCollections() { root.querySelectorAll("[data-collection]").forEach(button => button.onclick = () => openCollection(button.dataset.collection)); }
  async function openCollection(id) {
    const summary = catalog.find(item => item.id === id);
    if (!summary) return;
    if (!summary.free && (!signedIn() || !canPlay())) { membership(summary.era, "This folder is part of your era archive. Try 24 hours free, or unlock all eras for $5 once.", () => openCollection(id)); return; }
    show("archive-loading", `<section class="quiz-window"><div class="quiz-body"><p role="status">Finding your recovered folder…</p><button class="text-button" data-blog-home>← Back to the blog</button></div></section>`); bindBack();
    try {
      const collection = summary.free ? samples[id] : (await archiveCollection(id)).collection;
      if (getScreen() !== "archive-loading") return;
      if (!collection || !Array.isArray(collection.files) || collection.files.length !== summary.fileCount) throw new Error("This folder is temporarily unavailable.");
      activeCollection = collection;
      progress = validCollectionProgress(collection, read(collectionKey(collection), []));
      order = []; playSound("question"); renderFile();
    } catch (error) { if (getScreen() === "archive-loading") membership(summary.era, error.message, () => openCollection(id)); }
  }
  function renderFile(revealed = false) {
    const collection = activeCollection, index = revealed ? progress.length - 1 : progress.length;
    if (index >= collection.files.length) { renderCollectionResult(); return; }
    const file = collection.files[index];
    if (file.method === "timeline" && !order.length) order = file.items.map(item => item.id).reverse();
    const recovered = revealed && recoverFile(file, progress[index].submission);
    const controls = file.method === "match" ? `<div class="connection-rows">${file.rows.map(row => `<label><span>${escape(row.clue)}</span><select name="${row.id}" required><option value="">Choose its connection…</option>${[...file.choices].reverse().map(choice => `<option value="${choice.id}">${escape(choice.label)}</option>`).join("")}</select></label>`).join("")}</div>` : file.method === "timeline" ? `<ol class="timeline-order">${order.map((id, position) => `<li><span>${position + 1}</span><strong>${escape(file.items.find(item => item.id === id).label)}</strong><div><button type="button" data-move="${position}" data-direction="-1" aria-label="Move ${escape(file.items.find(item => item.id === id).label)} earlier" ${position === 0 ? "disabled" : ""}>↑</button><button type="button" data-move="${position}" data-direction="1" aria-label="Move ${escape(file.items.find(item => item.id === id).label)} later" ${position === order.length - 1 ? "disabled" : ""}>↓</button></div></li>`).join("")}</ol>` : `<label for="file-guess">Name that reference</label><input id="file-guess" name="guess" maxlength="120" autocomplete="off" placeholder="the part your brain remembers…" required><div class="candidate-tags" aria-label="Possible references">${file.candidates.map(candidate => `<button type="button" data-candidate="${escape(candidate)}">${escape(candidate)}</button>`).join("")}</div>`;
    show("archive-file", `<section class="quiz-window collection-window"><div class="window-bar"><span>deepcut.archive / ${escape(collection.title)}</span><span>file ${index + 1}/${collection.files.length}</span></div><div class="quiz-body"><span class="eyebrow">${escape(file.title)}</span><h1>${escape(file.prompt)}</h1>${revealed ? `<div class="recovered-file"><span class="eyebrow">${recovered ? "RECEIPT RECOVERED ♡" : "A NEW REFERENCE FOR NEXT TIME"}</span><h2>${escape(fileAnswer(file))}</h2><p>${escape(file.explanation)}</p></div><button class="primary" id="file-next">${progress.length === collection.files.length ? "File my collection" : "Follow the next clue"} →</button>` : `<form id="archive-answer" class="archive-answer">${controls}<p id="archive-feedback" role="status"></p><button class="primary" type="submit">Recover this file →</button><button class="text-button" type="button" id="skip-file">Show me the lore & move on</button></form>`}</div><div class="quiz-footer"><button class="text-button" id="back-era">← Back to this era</button><span>solve. recover. keep the receipt.</span></div></section>`);
    root.querySelector("#back-era").onclick = () => openEra(collection.era);
    if (revealed) { root.querySelector("#file-next").onclick = () => { order = []; renderFile(); }; return; }
    root.querySelectorAll("[data-candidate]").forEach(button => button.onclick = () => { root.querySelector("#file-guess").value = button.dataset.candidate; root.querySelector("#file-guess").focus(); });
    root.querySelectorAll("[data-move]").forEach(button => button.onclick = () => { const from = Number(button.dataset.move), to = from + Number(button.dataset.direction); [order[from], order[to]] = [order[to], order[from]]; renderFile(); root.querySelector(`[data-move="${to}"][data-direction="${button.dataset.direction}"]`)?.focus({ preventScroll: true }); });
    const submit = submission => {
      const good = recoverFile(file, submission);
      if (submission !== null && !good) { root.querySelector("#archive-feedback").textContent = "Those receipts don’t quite connect yet. Keep digging, or reveal the lore."; playSound("incorrect"); return; }
      progress.push({ id: file.id, submission }); save(collectionKey(collection), progress);
      if (good) receipt({ id: `collection:${collection.id}:${file.id}`, title: file.method === "decode" ? file.answer : `${collection.title} / ${file.title}`, explanation: file.explanation, era: collection.era, kind: "archive" });
      playSound(good ? "correct" : "question"); renderFile(true);
    };
    root.querySelector("#archive-answer").onsubmit = event => { event.preventDefault(); const data = new FormData(event.currentTarget); submit(file.method === "match" ? Object.fromEntries(data) : file.method === "timeline" ? [...order] : data.get("guess")); };
    root.querySelector("#skip-file").onclick = () => submit(null);
  }
  function renderCollectionResult() {
    const collection = activeCollection, score = progress.filter((entry, index) => recoverFile(collection.files[index], entry.submission)).length;
    award("chapters", { id: collection.id, title: collection.title, era: collection.era });
    stamp({ id: `collection:${collection.id}`, title: collection.title, kind: "archive" });
    show("archive-results", `<section class="collection-result"><span class="eyebrow">A NEW CHAPTER IN YOUR SIDEBLOG</span><h1>your folder,<br><em>recovered.</em></h1><p>${score}/${collection.files.length} files solved. ${escape(collection.title)} is now part of your internet history.</p><p>✧ A collection stamp and your era’s blog theme are unlocked.</p><button class="primary" id="collection-sideblog">Style my sideblog →</button><button class="secondary" id="collection-era">Go deeper in this era →</button><button class="text-button" data-blog-home>← Back to the blog</button></section>`);
    bindBack(); root.querySelector("#collection-sideblog").onclick = openSideblog; root.querySelector("#collection-era").onclick = () => openEra(collection.era); playSound("finish");
  }
  function openLost() {
    begin("lost-post");
    currentPost = lostPost(dayKey()); lostGuesses = validLostGuesses(currentPost, read(currentPost.id, [])); renderLost();
  }
  function renderLost() {
    const post = currentPost, won = lostWon(post, lostGuesses), finished = won || lostGuesses.length === 3;
    if (finished) { stamp({ id: post.id, title: "The Lost Post", kind: "lost" }); if (won) receipt({ id: post.id, title: post.answer, explanation: post.explanation, era: post.era, kind: "lost" }); finishDay(); }
    const deeper = catalog.find(item => item.era === post.era && !item.free);
    show(finished ? "lost-results" : "lost-post", `<section class="lost-page"><div class="window-bar"><span>DEEP CUT ARCHIVE / ${post.day}</span><span>♡</span></div><div class="lost-page-body"><span class="eyebrow">FOUR CLUES. ONE PIECE OF FANDOM HISTORY.</span><h1>the <em>lost post.</em></h1><p>A reference slipped out of the archive. Piece its story together from these four clues.</p><div class="lost-moodboard">${post.clues.map((clue, index) => `<article class="clue-scrap clue-${index}"><span aria-hidden="true">${index === 3 ? cursorImage : clue.icon}</span><small>${clue.label}</small><p>${escape(clue.text)}</p></article>`).join("")}</div>${finished ? `<div class="lost-recovered"><span class="eyebrow">${won ? "POST RECOVERED / RECEIPT COLLECTED" : "THE ARCHIVE HAS ONE MORE STORY"}</span><h2>${escape(post.answer)}</h2><p>${escape(post.explanation)}</p><span class="pill">${escape(eras.find(era => era.id === post.era).name)}</span></div><div class="lost-actions"><button class="primary" id="lost-sideblog">Open my sideblog →</button><button class="secondary" data-collection="${deeper.id}">Go deeper: ${escape(deeper.title)} →</button><button class="secondary" id="share-lost">Share my recovery →</button></div><p id="share-status" role="status"></p>` : `<form id="lost-answer" class="archive-answer"><label for="lost-guess">Your recovered reference <span>${3 - lostGuesses.length} guesses left</span></label><input id="lost-guess" maxlength="100" autocomplete="off" placeholder="a creator, fandom, platform, or title…" required><p id="lost-feedback" role="status">${lostGuesses.length ? "Not that reference. Look for the connection between all four clues." : ""}</p><button class="primary">Recover the post →</button><button class="text-button" id="lost-reveal" type="button">Reveal this post & its story</button></form>`}<button class="text-button" data-blog-home>← Back to the blog</button></div></section>`);
    bindBack();
    if (finished) { bindCollections(); root.querySelector("#lost-sideblog").onclick = openSideblog; root.querySelector("#share-lost").onclick = () => config.share(`Deep Cut / The Lost Post\n${post.day}\n${lostGuesses.map(guess => guess !== null && lostWon(post, [guess]) ? "♡" : "×").join(" ")}\n${won ? "Recovered" : "A new reference for my archive"}\n${new URL("./", location.href).href}`, "lost"); return; }
    const submit = reveal => {
      if (dayKey() !== post.day) { openLost(); return; }
      const guess = root.querySelector("#lost-guess").value.trim();
      if (!reveal && (!guess || lostGuesses.some(old => normalizeReference(old) === normalizeReference(guess)))) { root.querySelector("#lost-feedback").textContent = "Try a new reference."; return; }
      lostGuesses = reveal ? [...lostGuesses, ...Array(3 - lostGuesses.length).fill(null)] : [...lostGuesses, guess];
      save(post.id, lostGuesses); playSound(lostWon(post, lostGuesses) ? "finish" : "incorrect"); renderLost();
    };
    root.querySelector("#lost-answer").onsubmit = event => { event.preventDefault(); submit(false); };
    root.querySelector("#lost-reveal").onclick = () => submit(true);
  }
  const preview = scrapbook => `<div class="sideblog-paper skin-${scrapbook.theme}"><div class="sideblog-browser"><span>deepcut.blog / your-sideblog</span><span>♡ · ×</span></div><div class="sideblog-paper-body"><span class="eyebrow">YOU HAD TO BE THERE.</span><h2>${escape(scrapbook.name || "my little sideblog")}</h2><div class="blog-stickers" aria-label="Your stickers">${scrapbook.decorations.map(id => `<span>${stickerMarkup(stickers.find(sticker => sticker.id === id))}</span>`).join("")}</div><div class="pinned-grid">${pinnedReceipts(scrapbook).map(item => `<article><span class="eyebrow">RECOVERED RECEIPT</span><h3>${escape(item.title)}</h3><p>${escape(item.explanation)}</p></article>`).join("") || `<div class="empty-scrap"><span>♡</span><p>Your future lore goes here.<br>Solve a game to collect your first receipt.</p></div>`}</div><div class="blog-stamps">${scrapbook.stamps.slice(-6).map(item => `<span>✧ ${escape(item.title)}</span>`).join("")}</div><p class="sideblog-signoff">a little archive of a very online life. ♡</p></div></div>`;
  function openSideblog() {
    const scrapbook = state();
    show("sideblog", `<section class="sideblog-page"><button class="text-button" data-blog-home>← Back to the blog</button><span class="eyebrow">COLLECT. CUSTOMIZE. KEEP YOUR LITTLE HISTORY.</span><h1>your <em>sideblog.</em></h1><p>${scrapbook.receipts.length} receipts · ${scrapbook.stamps.length} stamps · ${scrapbook.chapters.length} chapters. Saved in this browser.</p><div class="sideblog-layout"><div id="sideblog-preview">${preview(scrapbook)}</div><aside class="sideblog-editor"><label for="blog-name">Name your sideblog</label><input id="blog-name" maxlength="36" value="${escape(scrapbook.name)}"><h2>Your blog theme</h2><div class="theme-options">${themes.map(theme => `<button data-theme="${theme.id}" class="theme-${theme.id}" ${theme.unlocked(scrapbook) ? "" : "disabled"} aria-pressed="${scrapbook.theme === theme.id}"><strong>${theme.name}</strong><small>${theme.unlocked(scrapbook) ? "Unlocked ♡" : theme.requirement}</small></button>`).join("")}</div><h2>Your stickers</h2><p>Choose up to three.</p><div class="sticker-options">${stickers.map(sticker => `<button data-sticker="${sticker.id}" aria-label="${sticker.name}" aria-pressed="${scrapbook.decorations.includes(sticker.id)}" ${sticker.unlocked(scrapbook) ? "" : "disabled"}>${stickerMarkup(sticker)}</button>`).join("")}</div><button class="primary" id="export-sideblog">Save / share my sideblog →</button><p id="sideblog-status" role="status"></p></aside></div><section class="receipt-shelf"><h2>Your collected receipts</h2><p>Your newest six appear until you choose pins. Pin up to six to make your own moodboard; the rest stay in your collection.</p><div class="receipt-grid">${scrapbook.receipts.slice(-48).reverse().map(item => `<label><input type="checkbox" data-pin="${escape(item.id)}" ${scrapbook.pins.includes(item.id) ? "checked" : ""}><strong>${escape(item.title)}</strong><span>${escape(item.explanation)}</span></label>`).join("") || `<p>Start with The Lost Post, a free archive folder, or today’s quiz.</p>`}</div><h2>Your archive chapters</h2><p>${scrapbook.chapters.map(chapter => escape(chapter.title)).join(" · ") || "Your first recovered folder will appear here."}</p></section></section>`);
    bindBack();
    const update = next => { save(blogKey, sideblogState(next)); root.querySelector("#sideblog-preview").innerHTML = preview(state()); };
    root.querySelector("#blog-name").oninput = event => update({ ...state(), name: event.target.value });
    root.querySelectorAll("[data-theme]").forEach(button => button.onclick = () => { update({ ...state(), theme: button.dataset.theme }); root.querySelectorAll("[data-theme]").forEach(item => item.setAttribute("aria-pressed", String(item === button))); });
    root.querySelectorAll("[data-sticker]").forEach(button => button.onclick = () => { const next = state(), id = button.dataset.sticker; next.decorations = next.decorations.includes(id) ? next.decorations.filter(item => item !== id) : [...next.decorations, id].slice(-3); update(next); root.querySelectorAll("[data-sticker]").forEach(item => item.setAttribute("aria-pressed", String(state().decorations.includes(item.dataset.sticker)))); });
    root.querySelectorAll("[data-pin]").forEach(input => input.onchange = () => { const next = state(); if (input.checked && next.pins.length >= 6) { input.checked = false; root.querySelector("#sideblog-status").textContent = "Six receipts fit on your moodboard. Unpin one to make room."; return; } next.pins = input.checked ? [...next.pins, input.dataset.pin] : next.pins.filter(id => id !== input.dataset.pin); update(next); });
    root.querySelector("#export-sideblog").onclick = async event => { const button = event.currentTarget; button.disabled = true; try { await exportSideblog(state()); if (root.querySelector("#sideblog-status")) root.querySelector("#sideblog-status").textContent = "Your sideblog is ready for the group chat. ♡"; } catch (error) { if (error.name !== "AbortError" && root.querySelector("#sideblog-status")) root.querySelector("#sideblog-status").textContent = error.message; } finally { button.disabled = false; } };
  }
  return { homeExtras, bindHome, openSideblog, openEra, openLost, receipt, stamp };
}
