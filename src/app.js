import {
  dailyQuestions,
  dayKey,
  nextReset,
  rank,
  scoreAnswers,
  validAnswers,
  departments,
  eras,
  getMode,
  getIssue,
  issueVersion,
} from "./game.js";
import {
  signedIn,
  membershipConfig,
  sendCode,
  verifyCode,
  hasEmailLink,
  finishEmailLink,
  memberStatus,
  startTrial,
  startCheckout,
  mountCheckoutForm,
  verifyPurchase,
  eraQuestions,
  signOut,
  syncSessionFromStorage,
} from "./membership.js";
import { playSound, setSoundEnabled, soundEnabled } from "./sound.js";
import {
  dailyPuzzle,
  validGuesses,
  submitGuess,
  puzzleStatus,
  matches,
  puzzleShare,
  diaryStats,
  PUZZLE_VERSION,
  MAX_TURNS,
} from "./puzzle.js";

import { createOpenCutUI } from "./open-cut-ui.js";
import { createQuizLibraryUI } from "./quiz-library-ui.js";
import { OPEN_CUT_HISTORY } from "./open-cut.js";
import { createMemoriesUI } from "./memories-ui.js";
import { createArchiveUI } from "./archive-ui.js";
import { createScrapbookUI } from "./scrapbook-ui.js";
import { fileStamp, pixelIcon } from "./archive-atoms.js";
import { createDeepCutUI } from "./deep-cut-ui.js";
import { createEraDiscoveryUI } from "./era-discovery-ui.js";
import { mountOriginalLogo } from "./site-identity.js";
import { drawBrand } from "./collectibles-export.js";
let booting = true;

const app = document.querySelector("#app");
document.querySelector(".skip-link").onclick = event => { event.preventDefault(); app.focus(); app.scrollIntoView(); };
let storageAvailable = true;
const visitStorage = new Map();
const read = (key, fallback) => {
  if (visitStorage.has(key)) return visitStorage.get(key);
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    storageAvailable = false;
    return visitStorage.get(key) ?? fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    storageAvailable = false;
    visitStorage.set(key, value);
    updateStorageNote();
  }
};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let day,
  questions,
  key,
  answers,
  resetAt,
  mode,
  revealed = false,
  screen = "home",
  busy = false;
const progressKey = (id, date, version = issueVersion(date)) =>
  `deep-cut-${version}-${id}-${date}`;
const askKey = (date) =>
  `deep-cut-ask-${getIssue(date) ? issueVersion(date) : PUZZLE_VERSION}-${date}`;
let activeAsk, guesses;
let membership = null,
  membershipSettings = null,
  openingEra = false;
let purchaseReference = new URL(location.href).searchParams.get("session_id");
const canPlayEras = () =>
  membership?.purchased ||
  (membership?.trialActive && Date.parse(membership.trialEndsAt) > Date.now());
function savedGuesses(date, puzzle = dailyPuzzle(date)) {
  const stored = read(askKey(date), []);
  return validGuesses(stored, puzzle) ? stored : [];
}
function diary() {
  return diaryStats(read("deep-cut-diary", []), day);
}
function finishDay() {
  const journal = diary();
  if (!journal.completedToday) save("deep-cut-diary", [...journal.days, day]);
}
function savedAnswers(
  id,
  date,
  selection = id === "daily"
    ? dailyQuestions(date, id)
    : Array.from({ length: getMode(id).count }, () => ({
        options: [0, 1, 2, 3],
      })),
) {
  const stored = read(progressKey(id, date), []);
  return validAnswers(stored, selection) ? stored : [];
}
function loadIssue(id = "daily", suppliedQuestions, version) {
  mode = getMode(id);
  day = dayKey();
  resetAt = nextReset();
  questions = suppliedQuestions || dailyQuestions(day, id);
  key = progressKey(id, day, version || issueVersion(day));
  const stored = read(key, []);
  answers = validAnswers(stored, questions) ? stored : [];
  revealed = false;
}
function track(event, modeId = mode.id) {
  const stored = read("deep-cut-activity", {});
  const counts =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? stored
      : {};
  const name = `${modeId}_${event}`;
  counts[name] = (Number(counts[name]) || 0) + 1;
  save("deep-cut-activity", counts);
}
function updateStorageNote() {
  const note = document.querySelector("#storage-note");
  if (note)
    note.textContent = storageAvailable
      ? "Your saved files and game progress stay in this browser. Free activities need no account. <3"
      : "Browser storage is unavailable. Progress lasts for this visit.";
}
function issueLabel() {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(day + "T12:00:00Z"));
}
function chrome(content) {
  if (screen !== "opencut") openCut.leave();
  if (screen !== "memories") memories.leave();
  if (screen !== "era") eraDiscovery.leave();
  if (!["opencut", "quizlibrary", "era", "memories", "myfiles", "deepcut", "puzzle", "puzzle-results"].includes(screen)) {
    document.title = "The Fandom Files — daily fandom games & internet eras";
    if (!booting && (location.pathname.startsWith("/stories/") || location.pathname.startsWith("/archive") || location.pathname.startsWith("/eras/") || location.pathname.startsWith("/play") || location.pathname.startsWith("/memories") || location.pathname.startsWith("/quizzes") || location.pathname.startsWith("/my-files") || new URL(location.href).searchParams.has("desk"))) history.pushState({}, "", "/");
  }
  app.dataset.mode = mode.id;
  app.innerHTML = `<div class="issue-line"><span><i class="online-dot"></i> THE FANDOM FILES / INTERNET MEMORY</span><span>${issueLabel()} <span class="issue-heart">♡</span></span></div>${content}<p id="storage-note" class="storage"></p>`;
  updateStorageNote();
  tick();
}
const arrow =
  '<svg class="arrow-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const windowDots =
  '<span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
const bow =
  '<svg class="bow" viewBox="0 0 180 110" aria-hidden="true"><path d="M86 46C48-11 3 2 17 40c7 19 41 21 66 12M94 46C132-11 177 2 163 40c-7 19-41 21-66 12" fill="#f7bee3" stroke="#c46eac" stroke-width="2"/><path d="M83 54 52 100 72 93 81 106 91 58M97 54l31 46-20-7-9 13-10-48" fill="#f7bee3" stroke="#c46eac" stroke-width="2"/><ellipse cx="90" cy="50" rx="11" ry="12" fill="#ed99d1" stroke="#c46eac" stroke-width="2"/></svg>';
const eraArtwork = {
  tumblr:
    '<div class="era-photo"><span>dear dashboard,</span><strong>it was never<br>just a phase.</strong><small>#reblog if you remember</small></div><span class="art-heart" aria-hidden="true">♡</span>',
  youtube:
    '<div class="video-mini"><div><span>comfort_video.mp4</span><span>×</span></div><svg aria-hidden="true" viewBox="0 0 60 60"><path d="M23 14 46 30 23 46Z"/></svg><span class="video-timeline"></span></div><span class="video-caption">just one more video...</span>',
  modern:
    '<div class="notification-note"><span>the group chat</span><strong>new lore just dropped.</strong><small>3 mutuals are typing...</small></div><span class="new-tag">NEW POST!</span>',
};
function eraCard(era) {
  const count = era.id === "youtube" ? 6 : 3;
  return `<article class="era-card ${era.id}" id="era-${era.id}"><div class="era-art" aria-hidden="true">${eraArtwork[era.id]}</div><div class="era-copy"><span class="era-years">${era.years} <b class="premium-tag">ONE FREE FOLDER</b></span><h3>${era.name}</h3><p>${era.description}</p><div class="era-meta"><span>${count} collections · ${era.mechanic}</span></div><button class="secondary" data-archive="${era.id}">Explore this era ${arrow}</button></div></article>`;
}
const askSticker =
  '<img class="ask-moustache" src="./src/assets/ask-moustache.png" alt="" width="1672" height="941" aria-hidden="true">';
function quizPost() {
  return `<section class="daily-game quiz-post" id="daily-quiz" aria-labelledby="quiz-title"><div class="window-bar"><span>fandomfiles.blog / pop-quiz</span>${windowDots}</div><div class="daily-game-art quiz-art" aria-hidden="true">${bow}<span class="quiz-art-note">your fandom phase<br><em>was never a phase.</em></span><span class="quiz-art-tag">♡ you remember. we remember.</span></div><div class="daily-game-copy"><span class="eyebrow">DAILY GAME 01 / TEN LITTLE FANDOM FILES</span><h2 id="quiz-title">The <em>Daily Quiz.</em></h2><p>Ten questions for your fandom brain. Pick your answers, collect the receipts, and find your rank.</p><button class="primary" id="play">${answers.length === mode.count ? "Open my report card" : answers.length ? "Back to the daily quiz" : "Open today’s quiz"} ${arrow}</button><span class="game-status">${answers.length === mode.count ? "today’s quiz is filed ✓" : answers.length ? `${answers.length}/10 answers saved` : "10 questions · 3-ish minutes · free, always"}</span></div></section>`;
}
function readingDiary() {
  const journal = diary();
  return `<aside class="diary-strip" aria-label="Your reading diary"><span class="diary-strip-heart" aria-hidden="true">${journal.completedToday ? "♥" : "♡"}</span><div><span class="eyebrow">MY LITTLE READING DIARY</span><p><strong>${journal.streak} ${journal.streak === 1 ? "day" : "days"} in a row</strong> · ${journal.total} ${journal.total === 1 ? "day" : "days"} filed · best streak ${journal.best}</p></div><p class="diary-strip-note">${journal.completedToday ? "Today’s page is stamped. See you tomorrow!" : "Finish a daily game to stamp today’s page."}<br>A wrong answer still counts. ♡</p></aside>`;
}
function home() {
  eraDiscovery.leave(); loadIssue("daily"); screen = "home";
  chrome(`<section class="hangout-cover"><div class="hangout-intro"><span class="file-label">FANDOM FILES / YOUR DAILY INTERNET-CULTURE GAME</span><h1>you had<br>to be <em>there.</em></h1><p>For the songs, screenshots, first fan accounts, and references that became your whole personality.</p><span class="hangout-note">your old dashboard called. ${pixelIcon("heart")}</span></div>${openCut.teaser()}</section><section class="era-home"><div class="section-heading"><div><span class="file-label">THREE ERAS / A WHOLE INTERNET TO REMEMBER</span><h2>where did your<br><em>internet start?</em></h2><p>Open an original collage, try an era quiz, and pull on a little thread.</p></div><button class="text-button" id="home-all-eras">all three eras ↗</button></div><div id="era-home-entrances"></div></section><section class="launch-home-footer"><div><span class="file-label">PLAY WHENEVER</span><h2>one more little <em>obsession.</em></h2><p>Six era quizzes and a personality file. No timer, no account, no daily limit.</p></div><a class="secondary" href="/quizzes/" id="home-quizzes">open the quiz folders ↗</a><a class="text-button" href="/my-files/" id="home-files">my scores & stamps ♡</a></section>`);
  eraDiscovery.mountHome();
  rootLink('[data-main-cut]',()=>openCut.open());
  document.querySelector('#home-all-eras').onclick=()=>eraDiscovery.openIndex();
  rootLink('#home-quizzes',()=>quizLibrary.open());rootLink('#home-files',()=>openMyFiles());
}
function rootLink(selector,action){const link=app.querySelector(selector);if(link)link.onclick=event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();action();};}
function legacyGames(){
  loadIssue("daily");screen="legacy";
  chrome(`<section class="legacy-games-page"><button class="text-button" id="legacy-back">← back to the quiz folders</button><span class="file-label">YOUR ORIGINAL GAME FILES</span><h1>still keeping <em>the receipts.</em></h1><p>Your older games and collected progress stay here. The new five-prompt Deep Cut is free on the homepage.</p><div class="daily-games">${quizPost()}${deepCut.teaser()}</div><p><button class="secondary" id="legacy-reference">name that reference · six clues →</button></p>${archiveUI.homeExtras()}${readingDiary()}<section class="archive-section"><div class="section-heading"><div><span class="file-label">YOUR EXISTING GAME COLLECTIONS</span><h2>your eras. <em>every receipt.</em></h2><p>Existing free folders and paid access remain available here.</p></div></div><div class="era-grid">${eras.map(eraCard).join("")}</div></section></section>`);
  document.querySelector('#legacy-back').onclick=()=>quizLibrary.open();
  document.querySelector('#legacy-reference').onclick=()=>startPuzzle();
  document.querySelector('#play').onclick=()=>startGame('daily');
  rootLink('[data-quick-cut]',()=>deepCut.open());archiveUI.bindHome();
}
function openLegacy(id){
 if(id==='name-that-reference')startPuzzle();
 else if(id==='quick-cut')deepCut.open();
 else if(id==='daily-quiz')startGame('daily');
 else if(id==='lost-post')archiveUI.openLost();
 else legacyGames();
}
function startPuzzle(navigate = true) {
  eraDiscovery.leave();
  if (navigate && location.pathname + location.search !== "/play/?game=name-that-reference") history.pushState({}, "", "/play/?game=name-that-reference");
  loadIssue("daily");
  activeAsk = dailyPuzzle(day);
  guesses = savedGuesses(day, activeAsk);
  if (puzzleStatus(activeAsk, guesses) !== "playing") finishDay();
  track(guesses.length ? "resumes" : "starts", "ask");
  playSound("question");
  renderPuzzle();
}
function renderPuzzle() {
  const status = puzzleStatus(activeAsk, guesses),
    finished = status !== "playing",
    visibleClues = Math.min(MAX_TURNS, guesses.length + (finished ? 0 : 1));
  if (finished) {
    scrapbook.recordPuzzle(day, guesses);
    archiveUI.stamp({ id: `ask:${askKey(day)}`, title: "Name That Reference", kind: "ask" });
    if (status === "won") archiveUI.receipt({ id: `ask:${askKey(day)}`, title: activeAsk.answer, explanation: activeAsk.explanation, kind: "ask" });
  }
  screen = finished ? "puzzle-results" : "puzzle";
  document.title = "Name That Reference — The Fandom Files";
  chrome(
    `<section class="quiz-window ask-window"><div class="window-bar"><span>fandomfiles.blog / inbox (1)</span>${windowDots}</div><div class="quiz-body"><div class="ask-game-heading"><span class="eyebrow">NAME THAT REFERENCE / SIX CLUES, ONE REFERENCE</span>${askSticker}</div><h1>${finished ? (status === "won" ? "You knew the <em>reference.</em>" : "A new receipt for <em>your archive.</em>") : "name that <em>reference.</em>"}</h1><p class="ask-rules">Guess the person, fandom, platform, or title. Each miss or pass opens one clue and uses one of your six turns.</p><ol class="clue-notes">${activeAsk.clues
      .slice(0, visibleClues)
      .map(
        (clue, index) =>
          `<li><span>CLUE ${index + 1}</span><p>${escape(clue)}</p></li>`,
      )
      .join(
        "",
      )}</ol><ol class="ask-turns" aria-label="Six puzzle turns">${Array.from(
      { length: MAX_TURNS },
      (_, index) => {
        const played = index < guesses.length,
          won = played && matches(activeAsk, guesses[index]);
        return `<li class="${played ? (won ? "turn-won" : "turn-used") : ""}" aria-label="Turn ${index + 1}: ${played ? (won ? "correct" : guesses[index] === null ? "passed" : "incorrect") : "unused"}"><span aria-hidden="true">${played ? (won ? "♥" : guesses[index] === null ? "↷" : "×") : index + 1}</span></li>`;
      },
    ).join(
      "",
    )}</ol>${guesses.length && !finished ? `<p class="ask-feedback" id="ask-feedback" role="status">${guesses.at(-1) === null ? "A little more context for your archive." : "Not that reference. Keep digging."} Clue ${visibleClues} is open. ♡</p>` : `<p id="ask-feedback" class="ask-feedback"></p>`}${finished ? `<div class="ask-reveal" role="status"><span class="eyebrow">${status === "won" ? `FILED IN ${guesses.length}/6 TURNS` : "FILED / 6 TURNS"}</span><h2>${escape(activeAsk.answer)}</h2><p>${escape(activeAsk.explanation)}</p><p class="diary-receipt">Today's reading diary is stamped. ${diary().streak} ${diary().streak === 1 ? "day" : "days"} in a row. ♡</p></div><button id="share-ask" class="primary">Send to the group chat ${arrow}</button><p id="share-status" aria-live="polite"></p><p class="ask-small">Your shared result keeps the answer secret. Next reference in <span data-countdown>--:--:--</span>.</p>` : `<form id="guess-form" class="guess-form"><label for="guess-input">Your best guess <span>${MAX_TURNS - guesses.length} ${MAX_TURNS - guesses.length === 1 ? "turn" : "turns"} left</span></label><div class="guess-controls"><input id="guess-input" type="text" maxlength="80" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="name that reference..." aria-describedby="ask-feedback guess-error"><button class="primary" type="submit">Send guess ♡</button></div><p id="guess-error" role="status"></p><button id="pass-clue" class="text-button" type="button">${guesses.length === 5 ? "Pass my final turn & reveal" : "Pass this turn & open a clue"} ↷</button></form>`}${guesses.length ? `<details class="guess-history"><summary>My guesses <span>${guesses.length}/6 turns</span></summary><ol>${guesses.map((guess, index) => `<li>${index + 1}. ${guess === null ? "Passed for another clue" : escape(guess)} <span>${matches(activeAsk, guess) ? "✓" : "♡"}</span></li>`).join("")}</ol></details>` : ""}</div><div class="quiz-footer"><button class="text-button" id="ask-home">← Back to the blog</button><span>you had to be there. ♡</span></div></section>`,
  );
  document.querySelector("#ask-home").onclick = home;
  if (finished) {
    const heading = document.querySelector(".ask-window h1");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    document.querySelector("#share-ask").onclick = () =>
      shareResult(
        puzzleShare(
          activeAsk,
          guesses,
          day,
          new URL("/play/?game=name-that-reference", location.origin).href,
        ),
        "ask",
      );
  } else {
    document.querySelector("#guess-form").onsubmit = (event) => {
      event.preventDefault();
      sendGuess(document.querySelector("#guess-input").value);
    };
    document.querySelector("#pass-clue").onclick = () => sendGuess(null);
    document.querySelector("#guess-input").focus({ preventScroll: true });
  }
}
function sendGuess(guess) {
  if (dayKey() !== day) {
    refreshDay();
    return;
  }
  try {
    guesses = submitGuess(activeAsk, guesses, guess);
  } catch (error) {
    document.querySelector("#guess-error").textContent = error.message;
    document.querySelector("#guess-input").focus({ preventScroll: true });
    return;
  }
  save(askKey(day), guesses);
  const status = puzzleStatus(activeAsk, guesses);
  if (status !== "playing") {
    finishDay();
    track("completions", "ask");
  }
  playSound(
    status === "won" ? "finish" : guess === null ? "question" : "incorrect",
  );
  renderPuzzle();
}
async function shareResult(text, modeId = mode.id) {
  if (busy) return;
  busy = true;
  const status = document.querySelector("#share-status");
  try {
    if (navigator.share) {
      await navigator.share({ title: "My The Fandom Files result", text });
      track("shares", modeId);
      status.textContent = "Sent with love. ♡";
    } else {
      await navigator.clipboard.writeText(text);
      track("shares", modeId);
      status.textContent = "Copied! Paste your result into the group chat. ♡";
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      status.innerHTML =
        "<label>Copy your result:<textarea readonly></textarea></label>";
      status.querySelector("textarea").value = text;
    }
  } finally {
    busy = false;
  }
}
async function startGame(id) {
  if (openingEra) return;
  if (id !== "daily") {
    if (!signedIn() || !canPlayEras()) {
      showMembership(id);
      return;
    }
    openingEra = true;
    const expectedDay = dayKey();
    try {
      const issue = await eraQuestions(id, expectedDay);
      if (issue.date !== dayKey()) {
        home();
        return;
      }
      if (
        !Array.isArray(issue.questions) ||
        issue.questions.length !== getMode(id).count
      )
        throw new Error("That era is temporarily unavailable.");
      loadIssue(id, issue.questions, issue.version);
    } catch (error) {
      showMembership(id, error.message);
      return;
    } finally {
      openingEra = false;
    }
  } else loadIssue(id);
  track(answers.length ? "resumes" : "starts");
  if (answers.length === mode.count) {
    playSound("click");
    results();
  } else {
    playSound("question");
    quiz();
  }
}
function questionImage(image) {
  return image
    ? `<figure class="question-picture"><img src="${escape(image.src)}" alt="${escape(image.alt)}"><figcaption>${escape(image.caption || "")} <span>Image: ${escape(image.credit)}</span></figcaption></figure>`
    : "";
}

async function showMembership(eraId = null, message = "", afterUnlock = null) {
  const dialog = document.querySelector("#membership");
  let email = "",
    codeSent = false,
    checkoutSession = null,
    checkoutForm = null,
    checkoutAttempt = 0;
  const clearCheckout = () => {
    checkoutAttempt += 1;
    checkoutForm?.destroy();
    checkoutForm = null;
    checkoutSession = null;
  };
  dialog.addEventListener("close", clearCheckout, { once: true });
  if (!dialog.open) dialog.showModal();
  dialog.innerHTML = '<p role="status">Opening your little era archive…</p>';
  try {
    membershipSettings = await membershipConfig();
    if (signedIn()) membership = await memberStatus();
  } catch (error) {
    message = error.message;
  }
  const render = () => {
    const loggedIn = signedIn(),
      access = canPlayEras();
    if (checkoutSession) {
      const session = checkoutSession,
        attempt = ++checkoutAttempt;
      dialog.innerHTML = `<button class="pill membership-close" aria-label="Close era checkout">Close ×</button><span class="eyebrow">YOUR LITTLE ERA ARCHIVE</span><h2>Your eras.<br><em>Yours to keep.</em></h2><p class="membership-price">$5 once <span>· all three eras · no subscription</span></p>${membershipSettings?.publishableKey?.startsWith("pk_test_") ? '<p class="membership-note payment-test-note">Payment testing · no real charges. Use Stripe test cards only.</p>' : ""}<p id="checkout-status" role="status">Opening your secure payment form…</p><div id="checkout-form"></div><button class="text-button" id="checkout-back">← Back to my eras</button>`;
      const container = dialog.querySelector("#checkout-form"),
        status = dialog.querySelector("#checkout-status");
      dialog.querySelector(".membership-close").onclick = () => dialog.close();
      dialog.querySelector("#checkout-back").onclick = () => {
        clearCheckout();
        render();
      };
      const reportError = (error) => {
        if (attempt === checkoutAttempt && dialog.open)
          status.textContent =
            error.message || "Checkout could not load. Please try again.";
      };
      mountCheckoutForm(container, session, membershipSettings?.publishableKey, {
        onComplete: async () => {
          const verified = await verifyPurchase(session.session_id);
          if (attempt !== checkoutAttempt || !dialog.open) return;
          membership = verified;
          clearCheckout();
          message = "Your eras are unlocked. ♡";
          render();
          if (screen === "home") home();
        },
        onError: reportError,
      })
        .then((form) => {
          if (attempt !== checkoutAttempt || !dialog.open) {
            form?.destroy();
            return;
          }
          checkoutForm = form;
          status.textContent =
            "Your payment is $5 once. Your eras unlock after confirmation.";
        })
        .catch(reportError);
      return;
    }
    dialog.innerHTML = `<button class="pill membership-close" aria-label="Close era membership">Close ×</button><span class="eyebrow">A LITTLE MORE OF YOUR INTERNET HISTORY</span><h2>Your eras.<br><em>All the receipts.</em></h2><p class="membership-price">$5 once <span>· all three eras · no subscription</span></p><p>Your first 24 hours of era play are free. Start when you’re ready. Deep Cut and the daily quiz are always free.</p><p id="membership-status" role="status">${escape(message)}</p>${loggedIn ? `<p class="membership-email">Signed in as ${escape(membership?.email || "your account")}</p>${membership?.purchased ? '<div class="membership-note">All three eras are yours. ♡</div>' : membership?.trialActive && access ? `<div class="membership-note">Your free era day ends ${escape(new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" }).format(new Date(membership.trialEndsAt)))}.</div>` : membership?.trialStarted ? '<div class="membership-note">Your free era day is filed. Unlock the full archive for $5 once.</div>' : '<button class="primary" id="start-era-trial">Start my free 24 hours ♡</button>'}${access ? `<button class="primary" id="play-member-era">${eraId ? "Play this era" : "Browse my eras"} ${arrow}</button>` : ""}${!membership?.purchased ? `<button class="secondary" id="buy-eras" ${membershipSettings?.checkoutReady ? "" : "disabled"}>Unlock all eras · $5 once ${arrow}</button>${!membershipSettings?.checkoutReady ? '<p class="ask-small">Purchases are coming soon. No payment is collected here yet.</p>' : ""}` : ""}<button class="text-button" id="sign-out-eras">Sign out</button>` : `<p class="ask-small">Sign in with an email link or code so your trial and purchase follow you between devices. No password needed.</p><form id="era-signin"><label for="era-email">Your email</label><input id="era-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="you@example.com" maxlength="254" required value="${escape(email)}" ${membershipSettings?.configured ? "" : "disabled"}>${codeSent ? '<label for="era-code">Code from your email (if included)</label><input id="era-code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" maxlength="8" required>' : ""}<button class="primary" ${membershipSettings?.configured ? "" : "disabled"}>${codeSent ? "Use email code" : "Send sign-in email"} ♡</button></form>${!membershipSettings?.configured ? '<p class="membership-note">Era membership is coming soon. Your free daily games are ready now.</p>' : ""}${codeSent ? '<button class="text-button" id="resend-era-code">Send another sign-in email</button>' : ""}`}`;
    dialog.querySelector(".membership-close").onclick = () => dialog.close();
    const work = async (action) => {
      dialog
        .querySelectorAll("button,input")
        .forEach((control) => (control.disabled = true));
      try {
        await action();
      } catch (error) {
        message = error.message;
      }
      if (dialog.open) render();
      if (screen === "home") home();
    };
    if (!loggedIn) {
      dialog.querySelector("#era-signin").onsubmit = (event) => {
        event.preventDefault();
        email = dialog.querySelector("#era-email").value.trim();
        const code = dialog.querySelector("#era-code")?.value.trim();
        work(async () => {
          if (codeSent) {
            membership = await verifyCode(email, code);
            if (purchaseReference) {
              membership = await verifyPurchase(purchaseReference);
              clearPurchaseReference();
            }
            message = membership?.purchased
              ? "Your eras are unlocked. ♡"
              : "You’re signed in. Your free day starts when you choose. ♡";
          } else {
            await sendCode(email);
            codeSent = true;
            message =
              "Check your inbox. Open the sign-in link, or enter a code if your email includes one.";
          }
        });
      };
      dialog.querySelector(codeSent ? "#era-code" : "#era-email")?.focus();
      const resend = dialog.querySelector("#resend-era-code");
      if (resend)
        resend.onclick = () =>
          work(async () => {
            await sendCode(email);
            message = "A new sign-in email is on its way.";
          });
    } else {
      const trial = dialog.querySelector("#start-era-trial");
      if (trial)
        trial.onclick = () =>
          work(async () => {
            membership = await startTrial();
            message = "Your 24-hour era day is open. ♡";
          });
      const buy = dialog.querySelector("#buy-eras");
      if (buy)
        buy.onclick = () =>
          work(async () => {
            const checkout = await startCheckout();
            if (checkout.alreadyPurchased) {
              membership = await memberStatus();
              message = "Your eras are already unlocked. ♡";
            } else checkoutSession = checkout;
          });
      const play = dialog.querySelector("#play-member-era");
      if (play)
        play.onclick = () => {
          dialog.close();
          if (afterUnlock) afterUnlock();
          else if (eraId) archiveUI.openEra(eraId);
          else home();
        };
      dialog.querySelector("#sign-out-eras").onclick = () =>
        work(async () => {
          await signOut();
          membership = null;
          message = "Signed out. Your purchase stays with your email account.";
        });
    }
  };
  render();
}
function clearPurchaseReference() {
  purchaseReference = null;
  const url = new URL(location.href);
  url.searchParams.delete("session_id");
  url.searchParams.delete("era_purchase");
  history.replaceState(null, "", url);
}
async function resumeMembership() {
  const fromEmail = hasEmailLink();
  try {
    const linkedMember = await finishEmailLink();
    membershipSettings = await membershipConfig();
    if (signedIn()) {
      membership = linkedMember || (await memberStatus());
      if (purchaseReference) {
        membership = await verifyPurchase(purchaseReference);
        clearPurchaseReference();
        showMembership(null, "All three eras are unlocked. ♡");
      } else if (fromEmail)
        showMembership(
          null,
          membership.purchased
            ? "Your eras are unlocked. ♡"
            : "You’re signed in. Your free day starts when you choose. ♡",
        );
      if (screen === "home") home();
    } else if (purchaseReference)
      showMembership(
        null,
        "Sign in with the email used for your purchase to unlock your eras.",
      );
    else if (
      new URL(location.href).searchParams.get("era_purchase") === "cancelled"
    ) {
      clearPurchaseReference();
      showMembership(null, "Checkout closed. No era purchase was completed.");
    }
  } catch (error) {
    if (purchaseReference || fromEmail) showMembership(null, error.message);
  }
}
function quiz() {
  screen = "quiz";
  const i = answers.length,
    q = questions[i],
    dept =
      departments[q.department] ||
      departments.find((d) => d.name === q.category) ||
      departments[2];
  chrome(
    `<section class="quiz-window"><div class="window-bar"><span>${escape(mode.name)} / today’s issue</span>${windowDots}</div><div class="quiz-body"><div class="quiz-meta"><span>${dept.icon} ${escape(q.category)}</span><span>QUESTION ${i + 1} OF ${mode.count}</span></div><progress value="${i}" max="${mode.count}" aria-label="Quiz progress"></progress><p class="question-kicker">${mode.id === "daily" ? escape(getIssue(day)?.theme || dept.tag) : escape(mode.years) + " / era mini quiz"}</p><h1 tabindex="-1">${escape(q.question)}</h1>${questionImage(q.image)}<p class="answer-hint">Trust the part of your brain that remembers everyone’s old username.</p><div class="answers">${q.options.map((o, j) => `<button data-answer="${j}"><span class="answer-letter">${"ABCD"[j]}</span><span>${escape(o)}</span><span class="answer-mark" aria-hidden="true">♡</span></button>`).join("")}</div><div id="feedback" aria-live="polite"></div></div><div class="quiz-footer"><button class="text-button" id="all-eras">← All eras</button><span>you belong here, even if you guess. ♡</span><span>${i + 1}/${mode.count}</span></div></section>`,
  );
  document.querySelector("h1").focus();
  document.querySelector("#all-eras").onclick = home;
  document.querySelectorAll("[data-answer]").forEach(
    (button) =>
      (button.onclick = () => {
        if (dayKey() !== day) {
          refreshDay();
          return;
        }
        if (revealed) return;
        revealed = true;
        const choice = Number(button.dataset.answer),
          correct = choice === q.answer;
        if (correct) archiveUI.receipt({ id: `quiz:${key}:${q.id}`, title: q.options[q.answer], explanation: q.explanation, era: mode.id === "daily" ? q.department < 2 ? "tumblr" : q.department === 2 ? "youtube" : "modern" : mode.id, question: q.question, kind: "quiz" });
        answers.push(choice);
        save(key, answers);
        playSound(correct ? "correct" : "incorrect");
        document.querySelectorAll("[data-answer]").forEach((b) => {
          b.disabled = true;
          const n = Number(b.dataset.answer);
          if (n === q.answer) {
            b.classList.add("correct");
            b.querySelector(".answer-mark").textContent = "✓";
          } else if (n === choice) {
            b.classList.add("wrong");
            b.querySelector(".answer-mark").textContent = "×";
          }
        });
        document.querySelector("#feedback").innerHTML =
          `<div class="feedback-copy ${correct ? "is-correct" : ""}"><strong>${correct ? "Oh, you were THERE. ♡" : "One more receipt for your archive. ♡"}</strong><p>${escape(q.explanation)}</p></div><button class="primary" id="next">${answers.length === mode.count ? "Reveal my fandom rank" : "Next little obsession"} <span aria-hidden="true">→</span></button>`;
        if (answers.length === mode.count) {
          track("completions");
          finishDay();
        }
        document.querySelector("#next").onclick = () => {
          if (dayKey() !== day) {
            refreshDay();
            return;
          }
          revealed = false;
          if (answers.length === mode.count) {
            playSound("finish");
            results();
          } else {
            playSound("question");
            quiz();
          }
        };
      }),
  );
}
function shareText() {
  const score = scoreAnswers(questions, answers),
    link =
      new URL("./", location.href).href +
      (mode.id === "daily" ? "" : `#era-${mode.id}`);
  return `The Fandom Files <3 · ${mode.name}\n${day}\n${answers.map((a, i) => (a === questions[i].answer ? "💗" : "🤍")).join("")}\n${score}/${mode.count} — ${rank(score, mode.count)}\nyou had to be there.\nYour turn → ${link}`;
}
function results() {
  archiveUI.stamp({ id: `quiz:${key}`, title: mode.name, kind: "quiz", score: scoreAnswers(questions, answers), total: mode.count });
  screen = "results";
  finishDay();
  const score = scoreAnswers(questions, answers),
    ratio = score / mode.count;
  chrome(
    `<section class="results"><div class="result-card"><span class="result-sparkle" aria-hidden="true">✧</span>${bow}<span class="eyebrow">${mode.id === "daily" ? "THE DAILY REPORT CARD" : escape(mode.name).toUpperCase() + " / MINI QUIZ"}</span><h1>${ratio >= 0.8 ? "You kept<br><em>every receipt.</em>" : ratio >= 0.5 ? "A little lore.<br><em>A lot of heart.</em>" : "Cute guesses.<br><em>New lore unlocked.</em>"}</h1><div class="score">${score}<span>/ ${mode.count}</span></div><div class="rank-label">${rank(score, mode.count)} ♡</div><div class="score-hearts" role="img" aria-label="${score} correct answers out of ${mode.count}">${answers.map((a, i) => `<span class="${a === questions[i].answer ? "filled" : ""}" aria-hidden="true">${a === questions[i].answer ? "♥" : "♡"}</span>`).join("")}</div><p>you had to be there. <span>and clearly, a part of you was.</span></p><span class="card-date">FANDOM FILES · ${issueLabel()}</span></div><div class="result-actions"><button class="primary" id="share">Send to the group chat ${arrow}</button><button class="secondary" id="download">Save my card ↓</button></div><p id="share-status" aria-live="polite"></p><p class="diary-receipt">Today’s reading diary is stamped. ♡</p><button id="result-ask" class="text-button">Play today’s Deep Cut →</button><div class="daily-note result-reset"><span class="tiny-heart" aria-hidden="true">♡</span><div><strong>Same time tomorrow, mutual?</strong><p>Next issue in <span data-countdown>--:--:--</span> <span class="reset-label">· midnight Eastern</span></p></div></div><details><summary>Open the receipts <span>answer review +</span></summary>${questions.map((q, i) => `<article><span class="eyebrow">${escape(q.category)}</span><h3>${i + 1}. ${escape(q.question)}</h3><p>Your answer: ${escape(q.options[answers[i]])} ${answers[i] === q.answer ? "✓" : "×"}</p><p><strong>${escape(q.options[q.answer])}</strong> — ${escape(q.explanation)}</p></article>`).join("")}</details><button id="home-button" class="text-button">Back to all eras ♡</button></section>`,
  );
  document.querySelector("#home-button").onclick = home;
  document.querySelector("#result-ask").onclick = () => openCut.open();
  document.querySelector("#share").onclick = () => shareResult(shareText());
  document.querySelector("#download").onclick = () => downloadCard(score);
}
async function downloadCard(score) {
  const cardDay = day,
    cardMode = mode,
    cardAnswers = [...answers],
    cardQuestions = questions;
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    document.querySelector("#share-status").textContent =
      "Your browser cannot export images. Try sharing your score instead.";
    return;
  }
  const rect = (x, y, w, h, radius, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  };
  const text = (value, y, size, color = "#0B0B0F", italic = false) => {
    ctx.fillStyle = color;
    ctx.font = `700 ${size}px ${size >= 100 ? 'Helvetica, "Helvetica Neue", Arial' : '"DM Sans"'}, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(value, 540, y);
  };
  rect(0, 0, 1080, 1350, 0, "#F8F4EC");
  ctx.strokeStyle = "#c9c2bc";
  ctx.lineWidth = 1;
  for (let x = 0; x < 1080; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1350);
    ctx.stroke();
  }
  for (let y = 0; y < 1350; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1080, y);
    ctx.stroke();
  }
  rect(66, 78, 948, 1194, 28, "#0B0B0F");
  rect(55, 65, 948, 1194, 28, "#fffaf3");
  await drawBrand(ctx, 140, 150, 800);
  text(cardMode.name.toUpperCase(), 385, 28);
  text(`${score}/${cardMode.count}`, 660, 205, "#0B0B0F");
  text(rank(score, cardMode.count), 785, 52, "#0B0B0F", true);
  const length = cardAnswers.length,
    start = 540 - ((length - 1) * 58 + 42) / 2;
  cardAnswers.forEach((a, i) =>
    rect(
      start + i * 58,
      835,
      42,
      42,
      12,
      a === cardQuestions[i].answer ? "#FF5BC8" : "#C8B6FF",
    ),
  );
  text("you had to be there.", 1030, 56, "#0B0B0F", true);
  text(`FANDOM FILES · ${cardDay}`, 1160, 23);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `fandom-files-${cardMode.id}-${cardDay}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    track("card_downloads", cardMode.id);
    const status = document.querySelector("#share-status");
    if (status)
      status.textContent =
        "PNG card saved! Ready for your story or group chat. ♡";
  }, "image/png");
}
function refreshDay() {
  if (dayKey() === day) return false;
  home();
  const announcement = document.createElement("p");
  announcement.className = "new-day-banner";
  announcement.setAttribute("role", "status");
  announcement.textContent =
    "A new day, a new fandom file. Today’s games are ready! ♡";
  app.prepend(announcement);
  return true;
}
function tick() {
  if (dayKey() !== day && ["puzzle", "puzzle-results"].includes(screen)) { startPuzzle(false); return; }
  if (dayKey() !== day && !["quiz", "puzzle", "archive-file", "sideblog", "lore-book", "lore-page", "opencut", "quizlibrary", "era", "memories", "myfiles", "deepcut"].includes(screen)) {
    refreshDay();
    return;
  }
  const left = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
  const clock = [
    Math.floor(left / 3600),
    Math.floor((left % 3600) / 60),
    left % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    el.textContent = left ? clock : "new issue ready";
  });
}
function updateSoundButton() {
  const button = document.querySelector("#sound-button");
  button.setAttribute("aria-pressed", String(soundEnabled()));
  button.textContent = soundEnabled() ? "Sound on ♪" : "Sound off ♡";
}
const archiveUI = createArchiveUI({
  root: app, read, save, home, render: chrome,
  begin: next => { loadIssue("daily"); screen = next; },
  getScreen: () => screen, canPlay: canPlayEras, membership: showMembership,
  finishDay, startGame, startPuzzle, share: shareResult,
  dailyProgress: () => ({ quiz: savedAnswers("daily", day).length, ask: savedGuesses(day).length, askFinished: puzzleStatus(dailyPuzzle(day), savedGuesses(day)) !== "playing" }),
});
const memories = createMemoriesUI({ root: app, render: chrome, begin: next => { eraDiscovery.leave(); loadIssue("daily"); screen = next; }, home });
const openCut = createOpenCutUI({ root:app,read,save,render:chrome,begin:next=>{eraDiscovery.leave();loadIssue("daily");screen=next;},home,openEra:id=>eraDiscovery.openEra(id),openQuizzes:()=>quizLibrary.open(),openFiles:()=>openMyFiles() });
const quizLibrary = createQuizLibraryUI({root:app,read,save,render:chrome,begin:next=>{eraDiscovery.leave();loadIssue("daily");screen=next;},home,openEra:id=>eraDiscovery.openEra(id),openDaily:()=>openCut.open(),openLegacy});
const scrapbook = createScrapbookUI({ root: app, read, save });
const eraDiscovery = createEraDiscoveryUI({ root: app, render: chrome, begin: next => { loadIssue("daily"); screen = next; }, home, read, save, openDeepCut: () => openCut.open(), eraQuizMarkup:id=>quizLibrary.eraMarkup(id),bindQuizzes:()=>quizLibrary.bind(), recordDiscovery: scrapbook.recordDiscovery });
const deepCut = createDeepCutUI({ root: app, render: chrome, begin: next => { eraDiscovery.leave(); loadIssue("daily"); screen = next; }, home, read, save, openEra: id => eraDiscovery.openEra(id), recordRound: scrapbook.recordRound });
function openMyFiles(navigate = true) {
 eraDiscovery.leave();loadIssue("daily");screen="myfiles";
 if(navigate&&location.pathname+location.search!=="/my-files/")history.pushState({},"","/my-files/");
 document.title="My Files — The Fandom Files";
 chrome(`<section class="my-files-page"><button class="text-button" id="files-home">← back to the dashboard</button><span class="file-label">MY FILES / KEPT IN THIS BROWSER</span><h1>your little <em>internet history.</em></h1>${openCut.personalMarkup()}${quizLibrary.savedMarkup()}${eraDiscovery.savedMarkup()}<details class="legacy-game-folder"><summary>my original collections & community +</summary>${scrapbook.wall()}<p><button class="secondary" data-original-sideblog>my Sideblog & collectibles ↗</button><button class="text-button" data-member-account>restore my existing purchases</button><a class="text-button" href="/memories/" data-files-memories>era memories ↗</a></p></details></section>`);
 document.querySelector('#files-home').onclick=home;openCut.bindHistory();quizLibrary.bind();eraDiscovery.bind();rootLink('[data-files-memories]',()=>memories.open());
 app.querySelector('[data-member-account]').onclick=()=>showMembership();
 const heading=app.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});
}
function routeSite() {
  if (/^\/my-files\/?$/.test(location.pathname)) { openMyFiles(false); return true; }
  if (/^\/quizzes\/?$/.test(location.pathname)) { quizLibrary.open(new URL(location.href).searchParams.get("era"), false); return true; }
  const launchQuiz=location.pathname.match(/^\/quizzes\/([a-z0-9-]+)\/?$/);if(launchQuiz){quizLibrary.openQuiz(launchQuiz[1],false);return true;}
  if (/^\/memories\/?$/.test(location.pathname)) { memories.open(new URL(location.href).searchParams.get("era"), false); return true; }
  if (/^\/play\/?$/.test(location.pathname)) {
    if (new URL(location.href).searchParams.get("game") === "quick-cut") deepCut.open(false);
    else if (new URL(location.href).searchParams.get("game") === "name-that-reference") startPuzzle(false);
    else openCut.open(false);
    return true;
  }
  const era = location.pathname.match(/^\/eras\/([a-z0-9-]+)\/?$/);
  if (era) { eraDiscovery.openEra(era[1], false); return true; }
  if (/^\/archive\/?$/.test(location.pathname)) { eraDiscovery.openIndex(false); return true; }
  if (new URL(location.href).searchParams.get("desk") === "saved") { openMyFiles(false); return true; }
  if (location.pathname.startsWith("/stories/") || new URL(location.href).searchParams.has("desk")) history.replaceState({}, "", "/");
  return false;
}
document.querySelector("#archive-button").onclick = () => eraDiscovery.openIndex();
const siteHeader = document.querySelector('.site-header'), navToggle = document.querySelector('#nav-toggle');
function closeNavigation() { siteHeader.classList.remove('nav-open'); navToggle.setAttribute('aria-expanded', 'false'); }
navToggle.onclick = () => { const open = siteHeader.classList.toggle('nav-open'); navToggle.setAttribute('aria-expanded', String(open)); };
document.querySelector('#main-navigation').addEventListener('click', closeNavigation);
siteHeader.addEventListener('keydown', event => { if (event.key === 'Escape') { closeNavigation(); navToggle.focus(); } });
document.querySelectorAll('[data-site-home]').forEach(link => link.onclick = event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); home(); window.scrollTo({ top: 0 }); closeNavigation(); });
document.querySelectorAll('[data-site-play]').forEach(link => link.onclick = event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); openCut.open(); closeNavigation(); });
document.querySelectorAll('[data-open-quizzes]').forEach(link => link.onclick=event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();quizLibrary.open();closeNavigation();});
document.querySelectorAll('[data-open-memories]').forEach(link => link.onclick = event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); memories.open(); closeNavigation(); });
document.querySelectorAll('[data-open-archive]').forEach(link => link.onclick = event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); eraDiscovery.openIndex(); });
document.querySelector("#sideblog-button").onclick = () => openMyFiles();
app.addEventListener("click", event => { if (event.target.closest("[data-era-memories]")) { const link = event.target.closest("[data-era-memories]"); if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); memories.open(link.dataset.eraMemories); } if (event.target.closest("[data-saved-discoveries]")) openMyFiles(); if (event.target.closest("[data-original-sideblog]")) archiveUI.openSideblog(); });
setSoundEnabled(read("deep-cut-sound", true) !== false);
updateSoundButton();
home();
booting = false;
routeSite();
mountOriginalLogo();
window.addEventListener("popstate", () => { if (!routeSite()) home(); });
resumeMembership();
window.addEventListener("hashchange", () => {
  if (hasEmailLink()) resumeMembership();
});
document.querySelector("#membership-button")?.addEventListener("click",()=>showMembership());
setInterval(() => { tick(); if (screen === "deepcut") deepCut.refresh(); if(screen==="opencut")openCut.refresh(); }, 1000);
window.addEventListener("focus", () => {
  if (!["quiz", "puzzle", "archive-file", "sideblog", "lore-book", "lore-page", "opencut", "quizlibrary", "era", "memories", "myfiles", "deepcut"].includes(screen)) refreshDay();
  tick();
});
window.addEventListener("storage", (event) => {
  if(screen==="opencut"&&event.key?.startsWith("fandom-files-open-cut-v1-"))openCut.open(false);
  if(screen==="home"&&(event.key?.startsWith("fandom-files-open-cut-")||event.key===OPEN_CUT_HISTORY)){home();return;}
  if (screen === "deepcut" && event.key?.startsWith("fandom-files-deep-cut-")) deepCut.open(false, false);
  if (event.key === "deep-cut-auth") {
    syncSessionFromStorage();
    membership = null;
    resumeMembership();
    if (screen === "home") home();
  }
  if (event.key === "deep-cut-sound") {
    setSoundEnabled(read("deep-cut-sound", true) !== false);
    updateSoundButton();
  }
  if (
    screen === "home" &&
    (event.key?.startsWith(`deep-cut-${issueVersion(day)}-`) ||
      event.key?.startsWith(
        `deep-cut-ask-${getIssue(day) ? issueVersion(day) : PUZZLE_VERSION}-`,
      ) ||
      event.key === "deep-cut-diary")
  ) {
    home();
    return;
  }
  if (
    ["puzzle", "puzzle-results"].includes(screen) &&
    event.key === askKey(day)
  ) {
    guesses = savedGuesses(day, activeAsk);
    if (puzzleStatus(activeAsk, guesses) !== "playing") finishDay();
    renderPuzzle();
    return;
  }
  if (event.key === key) {
    const stored = read(key, []);
    if (validAnswers(stored, questions)) {
      answers = stored;
      revealed = false;
      if (screen === "quiz") answers.length === mode.count ? results() : quiz();
      else if (screen === "results")
        answers.length === mode.count ? results() : home();
    }
  }
});
document.querySelector("#sound-button").onclick = () => {
  setSoundEnabled(!soundEnabled());
  save("deep-cut-sound", soundEnabled());
  updateSoundButton();
  playSound("click");
};
document.querySelector("#about-button").onclick = () =>
  document.querySelector("#about").showModal();
document.querySelector("#close-about").onclick = () =>
  document.querySelector("#about").close();
