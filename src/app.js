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
  EDITION_VERSION,
} from "./game.js";
import { playSound, setSoundEnabled, soundEnabled } from "./sound.js";

const app = document.querySelector("#app");
let storageAvailable = true;
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    storageAvailable = false;
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    storageAvailable = false;
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
const progressKey = (id, date) => `deep-cut-${EDITION_VERSION}-${id}-${date}`;
function savedAnswers(id, date, selection = dailyQuestions(date, id)) {
  const stored = read(progressKey(id, date), []);
  return validAnswers(stored, selection) ? stored : [];
}
function loadIssue(id = "daily") {
  mode = getMode(id);
  day = dayKey();
  resetAt = nextReset();
  questions = dailyQuestions(day, id);
  key = progressKey(id, day);
  answers = savedAnswers(id, day, questions);
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
      ? "Your receipts stay in this browser. No account needed. <3"
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
  app.dataset.mode = mode.id;
  app.innerHTML = `<div class="issue-line"><span><i class="online-dot"></i> THE DAILY FIXATION</span><span>${issueLabel()} <span class="issue-heart">♡</span> EASTERN EDITION</span></div>${content}<p id="storage-note" class="storage"></p>`;
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
  const saved = savedAnswers(era.id, day),
    completed = saved.length === era.count;
  const action = completed
    ? "Open my era score"
    : saved.length
      ? "Continue this era"
      : "Play this era";
  const accessibleAction = `${completed ? "Results for" : saved.length ? "Continue" : "Play"} ${era.name}`;
  return `<article class="era-card ${era.id}" id="era-${era.id}"><div class="era-art" aria-hidden="true">${eraArtwork[era.id]}</div><div class="era-copy"><span class="era-years">${era.years}</span><h3>${era.name}</h3><p>${era.description}</p><div class="era-meta"><span>5 questions · 1-ish minute</span><span>${completed ? "filed ✓" : saved.length ? `${saved.length}/5 saved` : "daily mini quiz"}</span></div><button class="secondary" data-mode="${era.id}" aria-label="${accessibleAction}">${action} ${arrow}</button></div></article>`;
}
function home() {
  loadIssue("daily");
  screen = "home";
  chrome(
    `<section class="cover"><div class="cover-copy"><span class="label-sticker">the daily fandom pop quiz <span>♡</span></span><h1>you had to<br><em>be there.</em></h1><p class="cover-subtitle">And a part of you still is.</p><p class="intro">For the fan accounts, the late-night rabbit holes, and everything that still lives rent-free in your head. Ten questions. All your eras. One fresh issue a day.</p><button class="primary" id="play">${answers.length === mode.count ? "Open my report card" : answers.length ? "Back to the daily quiz" : "Take today’s deep cut"} ${arrow}</button><p class="fine">10 questions <span>✧</span> 3-ish minutes <span>✧</span> free, always</p><div class="daily-note"><span class="tiny-heart" aria-hidden="true">♡</span><div><strong>A new little obsession, every day.</strong><p>Next issue in <span data-countdown>--:--:--</span> <span class="reset-label">· midnight Eastern</span></p></div></div></div><div class="scrapbook" aria-label="A scrapbook inspired by an old Tumblr blog"><span class="sparkle sparkle-one" aria-hidden="true">✧</span>${bow}<div class="tape" aria-hidden="true"></div><div class="retro-window"><div class="window-bar"><span>deepcut.blog / saved posts</span>${windowDots}</div><div class="window-body"><span class="mini-label">A LOVE LETTER TO YOUR OLD DASHBOARD</span><div class="heart-art" aria-hidden="true">&lt;3</div><h2>your fandom phase<br>was never a phase.</h2><p>some things belong in the archive.<br>this is one of them.</p></div><div class="window-bottom"><span>♡ the lore is forever</span><span>since your first reblog</span></div></div><div class="scrap-note"><span class="note-pin" aria-hidden="true">♡</span><p>once a fan account,<br><em>always a fan account.</em></p><small>— a note from your mutual</small></div><span class="round-sticker">you remember.<br>we remember.<br><b>✿</b></span><span class="sparkle sparkle-two" aria-hidden="true">✧</span></div></section><section class="archive-section" aria-labelledby="archive-title"><div class="section-heading"><div><span class="eyebrow">THE ARCHIVE / DAILY MINI QUIZZES</span><h2 id="archive-title">Choose your <em>internet era.</em></h2><p>Pick a chapter. Five questions, one little trip down the dashboard.</p></div><span class="small-scribble">pick your personal canon ↙</span></div><div class="era-grid">${eras.map(eraCard).join("")}</div><p class="archive-note">The main daily quiz mixes every era. These mini quizzes have their own scores and refresh at midnight Eastern, too. ♡</p></section>`,
  );
  document.querySelector("#play").onclick = () => startGame("daily");
  document
    .querySelectorAll("button[data-mode]")
    .forEach(
      (button) => (button.onclick = () => startGame(button.dataset.mode)),
    );
}
function startGame(id) {
  loadIssue(id);
  track(answers.length ? "resumes" : "starts");
  if (answers.length === mode.count) {
    playSound("click");
    results();
  } else {
    playSound("question");
    quiz();
  }
}
function quiz() {
  screen = "quiz";
  const i = answers.length,
    q = questions[i],
    dept = departments.find((d) => d.name === q.category);
  chrome(
    `<section class="quiz-window"><div class="window-bar"><span>${escape(mode.name)} / Eastern edition</span>${windowDots}</div><div class="quiz-body"><div class="quiz-meta"><span>${dept.icon} ${escape(q.category)}</span><span>QUESTION ${i + 1} OF ${mode.count}</span></div><progress value="${i}" max="${mode.count}" aria-label="Quiz progress"></progress><p class="question-kicker">${mode.id === "daily" ? escape(dept.tag) : escape(mode.years) + " / era mini quiz"}</p><h1 tabindex="-1">${escape(q.question)}</h1><p class="answer-hint">Trust the part of your brain that remembers everyone’s old username.</p><div class="answers">${q.options.map((o, j) => `<button data-answer="${j}"><span class="answer-letter">${"ABCD"[j]}</span><span>${escape(o)}</span><span class="answer-mark" aria-hidden="true">♡</span></button>`).join("")}</div><div id="feedback" aria-live="polite"></div></div><div class="quiz-footer"><button class="text-button" id="all-eras">← All eras</button><span>you belong here, even if you guess. ♡</span><span>${i + 1}/${mode.count}</span></div></section>`,
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
        if (answers.length === mode.count) track("completions");
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
  return `Deep Cut <3 · ${mode.name}\n${day} · Eastern edition\n${answers.map((a, i) => (a === questions[i].answer ? "💗" : "🤍")).join("")}\n${score}/${mode.count} — ${rank(score, mode.count)}\nyou had to be there.\nYour turn → ${link}`;
}
function results() {
  screen = "results";
  const score = scoreAnswers(questions, answers),
    ratio = score / mode.count;
  chrome(
    `<section class="results"><div class="result-card"><span class="result-sparkle" aria-hidden="true">✧</span>${bow}<span class="eyebrow">${mode.id === "daily" ? "THE DAILY REPORT CARD" : escape(mode.name).toUpperCase() + " / MINI QUIZ"}</span><h1>${ratio >= 0.8 ? "You kept<br><em>every receipt.</em>" : ratio >= 0.5 ? "A little lore.<br><em>A lot of heart.</em>" : "Cute guesses.<br><em>New lore unlocked.</em>"}</h1><div class="score">${score}<span>/ ${mode.count}</span></div><div class="rank-label">${rank(score, mode.count)} ♡</div><div class="score-hearts" role="img" aria-label="${score} correct answers out of ${mode.count}">${answers.map((a, i) => `<span class="${a === questions[i].answer ? "filled" : ""}" aria-hidden="true">${a === questions[i].answer ? "♥" : "♡"}</span>`).join("")}</div><p>you had to be there. <span>and clearly, a part of you was.</span></p><span class="card-date">DEEP CUT · ${issueLabel()} · EASTERN EDITION</span></div><div class="result-actions"><button class="primary" id="share">Send to the group chat ${arrow}</button><button class="secondary" id="download">Save my card ↓</button></div><p id="share-status" aria-live="polite"></p><div class="daily-note result-reset"><span class="tiny-heart" aria-hidden="true">♡</span><div><strong>Same time tomorrow, mutual?</strong><p>Next issue in <span data-countdown>--:--:--</span> <span class="reset-label">· midnight Eastern</span></p></div></div><details><summary>Open the receipts <span>answer review +</span></summary>${questions.map((q, i) => `<article><span class="eyebrow">${escape(q.category)}</span><h3>${i + 1}. ${escape(q.question)}</h3><p>Your answer: ${escape(q.options[answers[i]])} ${answers[i] === q.answer ? "✓" : "×"}</p><p><strong>${escape(q.options[q.answer])}</strong> — ${escape(q.explanation)}</p></article>`).join("")}</details><button id="home-button" class="text-button">Back to all eras ♡</button></section>`,
  );
  document.querySelector("#home-button").onclick = home;
  document.querySelector("#share").onclick = async () => {
    if (busy) return;
    busy = true;
    const text = shareText(),
      status = document.querySelector("#share-status");
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Deep Cut score", text });
        track("shares");
        status.textContent = "Sent with love. ♡";
      } else {
        await navigator.clipboard.writeText(text);
        track("shares");
        status.textContent =
          "Copied! Paste your receipts into the group chat. ♡";
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
  };
  document.querySelector("#download").onclick = () => downloadCard(score);
}
function downloadCard(score) {
  const cardDay = day,
    cardMode = mode,
    cardAnswers = [...answers],
    cardQuestions = questions;
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
  const text = (value, y, size, color = "#3c4650", italic = false) => {
    ctx.fillStyle = color;
    ctx.font = `${italic ? "italic " : ""}${size}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.fillText(value, 540, y);
  };
  rect(0, 0, 1080, 1350, 0, "#effbfc");
  ctx.strokeStyle = "#d5eef0";
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
  rect(66, 78, 948, 1194, 28, "#cde9ec");
  rect(55, 65, 948, 1194, 28, "#fffafd");
  const logo = document.querySelector(".logo img");
  if (logo?.complete && logo.naturalWidth)
    ctx.drawImage(logo, 140, 65, 800, 307);
  else text("deep cut <3", 260, 95, "#147980");
  text(cardMode.name.toUpperCase(), 385, 28);
  text(`${score}/${cardMode.count}`, 660, 205, "#ba347e");
  text(rank(score, cardMode.count), 785, 52, "#147980", true);
  const length = cardAnswers.length,
    start = 540 - ((length - 1) * 58 + 42) / 2;
  cardAnswers.forEach((a, i) =>
    rect(
      start + i * 58,
      835,
      42,
      42,
      12,
      a === cardQuestions[i].answer ? "#ec87c3" : "#e6e5ee",
    ),
  );
  text("you had to be there.", 1030, 56, "#ba347e", true);
  text(`${cardDay} · MIDNIGHT EASTERN RESET`, 1160, 23);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `deep-cut-${cardMode.id}-${cardDay}.png`;
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
    "A new Eastern day, a new deep cut. Today’s quizzes are ready! ♡";
  app.prepend(announcement);
  return true;
}
function tick() {
  if (dayKey() !== day && screen !== "quiz") {
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
setSoundEnabled(read("deep-cut-sound", true) !== false);
updateSoundButton();
home();
setInterval(tick, 1000);
window.addEventListener("focus", () => {
  if (screen !== "quiz") refreshDay();
  tick();
});
window.addEventListener("storage", (event) => {
  if (event.key === "deep-cut-sound") {
    setSoundEnabled(read("deep-cut-sound", true) !== false);
    updateSoundButton();
  }
  if (
    screen === "home" &&
    event.key?.startsWith(`deep-cut-${EDITION_VERSION}-`)
  ) {
    home();
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
