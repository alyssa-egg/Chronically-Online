import {
  dailyQuestions,
  dayKey,
  nextReset,
  rank,
  scoreAnswers,
  validAnswers,
  departments,
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
  revealed = false,
  screen = "home",
  busy = false;
let archiveTab = 0;
const progressKey = (date) => `deep-cut-${EDITION_VERSION}-${date}`;
function loadIssue() {
  day = dayKey();
  questions = dailyQuestions(day);
  key = progressKey(day);
  const stored = read(key, []);
  answers = validAnswers(stored, questions) ? stored : [];
  revealed = false;
}
function track(event) {
  const stored = read("deep-cut-activity", {});
  const counts =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? stored
      : {};
  counts[event] = (Number(counts[event]) || 0) + 1;
  save("deep-cut-activity", counts);
}
function updateStorageNote() {
  const note = document.querySelector("#storage-note");
  if (note)
    note.textContent = storageAvailable
      ? "Your receipts stay in this browser. No account needed. ♡"
      : "Browser storage is unavailable. Progress lasts for this visit.";
}
function issueLabel() {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(day));
}
function chrome(content) {
  app.innerHTML = `<div class="issue-line"><span><i class="online-dot"></i> THE DAILY FIXATION</span><span>${issueLabel()} <span class="issue-heart">♡</span> ISSUE ${day.replaceAll("-", ".")}</span></div>${content}<p id="storage-note" class="storage"></p>`;
  updateStorageNote();
  tick();
}
const bow = `<svg class="bow" viewBox="0 0 180 110" aria-hidden="true"><path d="M86 46C48-11 3 2 17 40c7 19 41 21 66 12M94 46C132-11 177 2 163 40c-7 19-41 21-66 12" fill="#f4bad6" stroke="#ad628d" stroke-width="2"/><path d="M83 54 52 100 72 93 81 106 91 58M97 54l31 46-20-7-9 13-10-48" fill="#f4bad6" stroke="#ad628d" stroke-width="2"/><ellipse cx="90" cy="50" rx="11" ry="12" fill="#eaa7c8" stroke="#ad628d" stroke-width="2"/></svg>`;
const arrow =
  '<svg class="arrow-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const windowDots =
  '<span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span>';

function home() {
  screen = "home";
  chrome(
    `<section class="cover"><div class="cover-copy"><span class="label-sticker">a pop quiz for the lore girls ♡</span><h1>Your fandom<br>phase was<br><em>never a phase.</em></h1><p class="intro">The Tumblr years. The band obsessions. The YouTube rabbit holes. A daily test of everything that still lives rent-free in your head.</p><button class="primary" id="play">${answers.length === 10 ? "Open my report card" : answers.length ? "Back to the lore" : "Take today’s deep cut"} <span aria-hidden="true">${arrow}</span></button><p class="fine">10 questions <span>✧</span> 3-ish minutes <span>✧</span> free, always</p><div class="daily-note"><span class="tiny-heart" aria-hidden="true">♡</span><div><strong>A new little obsession, every day.</strong><p>Next issue in <span data-countdown>--:--:--</span> <span class="reset-label">· midnight UTC</span></p></div></div></div><div class="scrapbook" aria-label="A pink scrapbook of fandom memories"><span class="sparkle sparkle-one" aria-hidden="true">✧</span>${bow}<div class="tape" aria-hidden="true"></div><div class="retro-window"><div class="window-bar"><span>my_fandom_phase.exe</span>${windowDots}</div><div class="window-body"><span class="mini-label">STATUS: STILL EMOTIONALLY ATTACHED</span><div class="heart-art" aria-hidden="true">♡</div><h2>you just<br>had to be there.</h2><p>and honestly? we still are.</p><div class="tags"><span>#2013-tumblr</span><span>#1d-to-5sos</span><span>#slushy-era</span></div></div><div class="window-bottom"><span>♡ saved to the lore archive</span><span>100%</span></div></div><div class="scrap-note"><span class="note-pin" aria-hidden="true">♡</span><p>once a fan account,<br><em>always a fan account.</em></p><small>— a note from your mutual</small></div><span class="round-sticker">very niche.<br>very you.<br><b>✿</b></span><span class="sparkle sparkle-two" aria-hidden="true">✧</span></div></section><div class="ticker"><span>ONE DIRECTION</span><b>♡</b><span>5SOS</span><b>♡</b><span>TUMBLR</span><b>♡</b><span>2010s YOUTUBE</span><b>♡</b><span>SLUSHY NOOBZ</span><b>♡</b><span>VANILLA MACE</span></div><section class="archive-section" aria-labelledby="archive-title"><div class="section-heading"><div><span class="eyebrow">SOMEWHERE IN YOUR SAVED POSTS</span><h2 id="archive-title">Four folders. <em>All your eras.</em></h2></div><span class="small-scribble">we kept the receipts ↙</span></div><div class="department-tabs" role="tablist" aria-label="Explore the fandom archive">${departments.map((d, i) => `<button role="tab" id="era-${i}" aria-controls="era-panel" aria-selected="${archiveTab === i}" tabindex="${archiveTab === i ? 0 : -1}" data-tab="${i}"><span>${d.icon}</span>${d.name}<small>${d.era}</small></button>`).join("")}</div><div id="era-panel" role="tabpanel" aria-labelledby="era-${archiveTab}" tabindex="0"></div></section>`,
  );
  showArchive();
  document.querySelector("#play").onclick = () => {
    refreshDay();
    track(answers.length ? "resumes" : "starts");
    if (answers.length === 10) {
      playSound("click");
      results();
    } else {
      revealed = false;
      playSound("question");
      quiz();
    }
  };
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.onclick = () => selectTab(Number(tab.dataset.tab));
    tab.onkeydown = (event) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const index =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? 3
            : (archiveTab + (event.key === "ArrowRight" ? 1 : 3)) % 4;
      selectTab(index);
      document.querySelector(`#era-${index}`).focus();
    };
  });
}
function selectTab(index) {
  archiveTab = index;
  playSound("click");
  document.querySelectorAll("[data-tab]").forEach((tab, i) => {
    tab.setAttribute("aria-selected", String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
  });
  showArchive();
}
function showArchive() {
  const d = departments[archiveTab];
  const copy = [
    [
      "Your dashboard remembers.",
      "The gifsets. The askbox messages. The OTP you could defend in a 40-slide presentation. This folder is for the reblog-button veterans.",
      "#superwholock · #fanfic · #mutuals",
    ],
    [
      "The fan account is still in there.",
      "One Direction, 5SOS, and the lyrics you still know by heart. Your honorary fandom degree finally has a practical application.",
      "#directioners · #5sosfam · #pop-girl-lore",
    ],
    [
      "Just one more video before bed.",
      "Dan and Phil, Zoella, old channel names, tag videos, and the collabs that had the entire dashboard awake.",
      "#british-youtube · #comfort-videos · #2014",
    ],
    [
      "New tabs. Same fandom brain.",
      "Slushy Noobz, Vanilla Mace, commentary creators, and the vocabulary of your current group chat. The archive is still growing.",
      "#slushy-noobz · #vanilla-mace · #creator-lore",
    ],
  ][archiveTab];
  const panel = document.querySelector("#era-panel");
  panel.setAttribute("aria-labelledby", `era-${archiveTab}`);
  panel.innerHTML = `<span class="folder-icon" aria-hidden="true">${d.icon}</span><div><span class="eyebrow">${d.tag} · ${d.count} QUESTIONS IN THE DAILY MIX</span><h3>${copy[0]}</h3><p>${copy[1]}</p><span class="archive-tags">${copy[2]}</span></div><span class="archive-footnote">today’s quiz mixes<br>all four folders ♡</span>`;
}
function quiz() {
  screen = "quiz";
  const i = answers.length,
    q = questions[i],
    d = departments.find((d) => d.name === q.category);
  chrome(
    `<section class="quiz-window"><div class="window-bar"><span>daily_deep_cut.exe</span>${windowDots}</div><div class="quiz-body"><div class="quiz-meta"><span>${d.icon} ${escape(q.category)}</span><span>QUESTION ${i + 1} OF 10</span></div><progress value="${i}" max="10" aria-label="Quiz progress"></progress><p class="question-kicker">${escape(d.tag)} / ${escape(d.era)}</p><h1 tabindex="-1">${escape(q.question)}</h1><p class="answer-hint">Trust the part of your brain that remembers everyone’s old username.</p><div class="answers">${q.options.map((o, j) => `<button data-answer="${j}"><span class="answer-letter">${"ABCD"[j]}</span><span>${escape(o)}</span><span class="answer-mark" aria-hidden="true">♡</span></button>`).join("")}</div><div id="feedback" aria-live="polite"></div></div><div class="quiz-footer"><span>you belong here, even if you guess. ♡</span><span>${i + 1}/10</span></div></section>`,
  );
  document.querySelector("h1").focus();
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
          `<div class="feedback-copy ${correct ? "is-correct" : ""}"><strong>${correct ? "Oh, you were THERE. ♡" : "One more receipt for your archive. ♡"}</strong><p>${escape(q.explanation)}</p></div><button class="primary" id="next">${answers.length === 10 ? "Reveal my fandom rank" : "Next little obsession"} <span aria-hidden="true">→</span></button>`;
        if (answers.length === 10) track("completions");
        document.querySelector("#next").onclick = () => {
          if (dayKey() !== day) {
            refreshDay();
            return;
          }
          revealed = false;
          if (answers.length === 10) {
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
  const score = scoreAnswers(questions, answers);
  return `Deep Cut ♡ ${day}\n${answers.map((a, i) => (a === questions[i].answer ? "💗" : "🤍")).join("")}\n${score}/10 — ${rank(score)}\nMy fandom phase was never a phase.\nYour turn → ${location.origin}`;
}
function results() {
  screen = "results";
  const score = scoreAnswers(questions, answers);
  chrome(
    `<section class="results"><div class="result-card"><span class="result-sparkle" aria-hidden="true">✧</span>${bow}<span class="eyebrow">THE GROUP CHAT HAS SPOKEN</span><h1>${score >= 8 ? "You kept<br><em>every receipt.</em>" : score >= 5 ? "A little lore.<br><em>A lot of heart.</em>" : "Cute guesses.<br><em>New lore unlocked.</em>"}</h1><div class="score">${score}<span>/ 10</span></div><div class="rank-label">${rank(score)} ♡</div><div class="score-hearts" role="img" aria-label="${score} correct answers out of ten">${answers.map((a, i) => `<span class="${a === questions[i].answer ? "filled" : ""}" aria-hidden="true">${a === questions[i].answer ? "♥" : "♡"}</span>`).join("")}</div><p>You didn’t spend all those years on the dashboard for nothing.</p><span class="card-date">DEEP CUT · ${issueLabel()}</span></div><div class="result-actions"><button class="primary" id="share">Send to the group chat ${arrow}</button><button class="secondary" id="download">Save my card ↓</button></div><p id="share-status" aria-live="polite"></p><div class="daily-note result-reset"><span class="tiny-heart" aria-hidden="true">♡</span><div><strong>Same time tomorrow, mutual?</strong><p>Next issue in <span data-countdown>--:--:--</span> <span class="reset-label">· midnight UTC</span></p></div></div><details><summary>Open the receipts <span>answer review +</span></summary>${questions.map((q, i) => `<article><span class="eyebrow">${escape(q.category)}</span><h3>${i + 1}. ${escape(q.question)}</h3><p>Your answer: ${escape(q.options[answers[i]])} ${answers[i] === q.answer ? "✓" : "×"}</p><p><strong>${escape(q.options[q.answer])}</strong> — ${escape(q.explanation)}</p></article>`).join("")}</details><button id="home-button" class="text-button">Back to the archive ♡</button></section>`,
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
  const cardDay = day;
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
  const text = (value, y, size, color = "#614052", italic = false) => {
    ctx.fillStyle = color;
    ctx.font = `${italic ? "italic " : ""}${size}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.fillText(value, 540, y);
  };
  rect(0, 0, 1080, 1350, 0, "#fff0f5");
  ctx.strokeStyle = "#ecd7e4";
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
  rect(66, 78, 948, 1194, 28, "#cdbcd5");
  rect(55, 65, 948, 1194, 28, "#fffafc");
  text("deep cut ♡", 245, 112, "#98507c", true);
  text("YOUR DAILY FANDOM REPORT CARD", 345, 26);
  text(`${score}/10`, 635, 210, "#98507c");
  text(rank(score), 760, 52, "#705381", true);
  const colors = answers.map((a, i) =>
    a === questions[i].answer ? "#bc6892" : "#eadce6",
  );
  colors.forEach((color, i) => rect(255 + i * 58, 820, 42, 42, 12, color));
  text("My fandom phase", 980, 45);
  text("was never a phase.", 1040, 45, "#98507c", true);
  text(`DAILY ISSUE · ${cardDay}`, 1160, 25);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `deep-cut-${cardDay}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    track("card_downloads");
    const status = document.querySelector("#share-status");
    if (status)
      status.textContent =
        "PNG card saved! Ready for your story or group chat. ♡";
  }, "image/png");
}
function refreshDay() {
  if (dayKey() === day) return false;
  loadIssue();
  home();
  const announcement = document.createElement("p");
  announcement.className = "new-day-banner";
  announcement.setAttribute("role", "status");
  announcement.textContent =
    "A new day, a new deep cut. Today’s issue is ready! ♡";
  app.prepend(announcement);
  return true;
}
function tick() {
  // Never interrupt an in-progress response. Rollover happens on the next action.
  if (dayKey() !== day && screen !== "quiz") {
    refreshDay();
    return;
  }
  const left = Math.max(
    0,
    Math.ceil((nextReset(new Date(day)).getTime() - Date.now()) / 1000),
  );
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
loadIssue();
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
  if (event.key === key) {
    const stored = read(key, []);
    if (validAnswers(stored, questions)) {
      answers = stored;
      revealed = false;
      if (screen === "quiz") answers.length === 10 ? results() : quiz();
      else if (screen === "results") answers.length === 10 ? results() : home();
      else home();
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
