# Deep Cut ♡

“you had to be there.” Daily fandom quizzes and a clue puzzle for Tumblr girls, band fan accounts, YouTube sleepovers, and newer creator communities. A turquoise-and-hot-pink wordmark, pastel browser windows, original bows, scrapbook notes, and homemade chimes: an old Tumblr blog meets a magazine issue. Deep Cut is a working name; trademark/domain availability has not been verified.

## Get the latest version on your Mac

Stop an existing server with **Ctrl+C**, then run:

```sh
cd ~/Projects/Chronically-Online
git pull origin main
npm start
```

Open `http://localhost:3000` in your browser. Refresh the page after pulling updates. The folder/repository is still named `Chronically-Online`; the game is now called Deep Cut.

Requires **Node.js 22 or newer**. No dependencies to install. Use `PORT=3001 npm start` if port 3000 is occupied, and open that port instead.

In the cloud workspace:

```sh
cd /workspace/Chronically-Online
npm start
```

## Daily game

Review upcoming questions, answers, and Anonymous Ask clues in [QUESTION_SCHEDULE.md](QUESTION_SCHEDULE.md). The October 11–November 9, 2026 calendar includes editable approval and niche-idea fields, with every day's exact questions in expandable sections.

- Ten questions: three **The dashboard**, three **Band girl files**, two **YouTube sleepover**, and two **The new lore**.
- All games change every day at **midnight Eastern time** (`America/New_York`). Daylight saving changes are automatic: reset is 04:00 UTC in summer and 05:00 UTC in winter. A countdown shows the time remaining. Players worldwide get the same Eastern-day selection.
- 150 questions in exclusive pools: 60 for the main quiz and 30 per era. Main and era games never share a question. No question ID repeats within any six daily issues; the pool cycles on the seventh day. This does not automatically author new content or ingest trends.
- Homepage/results switch to the new issue without reloading. A quiz or ask open over midnight switches on the next answer, guess, pass, or Next action. Yesterday's progress remains stored separately.
- Each game saves progress separately under `deep-cut-v4-MODE-YYYY-MM-DD`. Previous editions remain in storage but are not reused after the archive changed.
- Four original sound cues: question arrival, correct answer, incorrect answer, and completion. Audio starts after a user action. The sound button remembers your preference; the game works without audio support.
- Five ranks, answer explanations/review, native sharing or clipboard fallback, and a **1080 × 1350 PNG** result card.
- Three playable five-question era mini quizzes: **2010–2015: The Tumblr Years**, **2015–2019: YouTube Was Everything**, and **2020–Today: The New Lore**. Each has its own daily selection, saved progress, results, review, and share card. An All eras button lets you leave and resume later.
- Keyboard-accessible buttons, focus states, live feedback, and responsive phone/desktop layouts. The creator-name strip has been removed.

Main-game rank thresholds: Casual Lurker 0–2; Certified Mutual 3–4; Fandom Archivist 5–7; Keeper of the Lore 8–9; The Deepest Cut 10. Mini quiz ranks scale by the fraction correct (a perfect 5/5 gets The Deepest Cut).

## The Anonymous Ask + reading diary

A pinned blog post opens a daily mystery reference. Type a person, fandom, platform, or title from the clues. You have **six turns**. A wrong guess or pass uses a turn and opens a clearer clue. Empty and repeated guesses use no turn. Common aliases, spacing, capitalization, and punctuation are accepted; arbitrary misspellings are not. The answer appears when you solve it or use all six turns. Sharing shows your turns and hearts without the answer or guesses.

There are **30 original clue puzzles**, rotating without repetition for 30 Eastern days. All players receive the same puzzle for the day. Ask progress saves separately under `deep-cut-ask-v1-YYYY-MM-DD`; change `PUZZLE_VERSION` when editing a published archive.

Finish any quiz or ask, regardless of score, to stamp your **reading diary**. It tracks completed days, the current daily streak, and your best streak. Completing several games in one day earns one stamp. A streak remains available through the following day; skipping an entire day breaks it. The diary is local to this browser, with no account or cross-device syncing.

## Check the code

```sh
npm test
npm run check
```

The 25 Node tests cover exclusive six-day rotation, all 150 questions, department balance, shuffled answers, scores/ranks, Eastern resets and both DST transitions, invalid dates and saved progress, puzzle selection, aliases, guesses, turn limits, spoiler-free sharing, and diary streaks.

This version was also checked in Chromium at widths 320, 390, 768, and 1440, including the main quiz plus all three mini quizzes (25 answers total), independent progress, sound/mute, reload recovery, PNG export, clipboard sharing, Eastern midnight and both DST transitions, UTC midnight without a reset, a Tokyo browser time zone, and denied storage. The Anonymous Ask was checked for empty/duplicate guesses, passes, wins/losses, reload/resume, sharing without spoilers, Eastern midnight rollover, and a two-day diary streak. Progress works for the current visit when storage is denied or full. The built static site also passed a project-subdirectory hosting check. Safari/Firefox and real phone audio/share sheets still need device testing before public launch.

## Hosting and editing

Build a static website:

```sh
npm run build
```

The `dist/` folder contains exactly the nine public website files. It is generated and ignored by Git. Build replaces that folder, so do not store personal files there. Assets and share links work at a domain root or under a project subdirectory.

For **Netlify**: import this GitHub repository, set the build command to `npm run build`, and set the publish directory to `dist`. No application secrets or backend are required. Future pushes can then deploy automatically. Alternatively, upload the contents of `dist` using Netlify Drop. A prepared `deep-cut-site.zip` is provided in the cloud workspace; unzip it and upload the resulting website folder.

Run `npm start` on a Node-capable host if preferred. Use HTTPS for clipboard/device sharing. Publish only `dist/`, never the full repository. These instructions prepare deployment; a public hosting deployment has not been performed in this task.

Question writing is in `src/questions.js`, scheduling/departments in `src/game.js`, clue puzzles/diary logic in `src/puzzle.js`, audio in `src/sound.js`, and styles in `src/style.css`. Keep a published edition's question bank stable. Bump `EDITION_VERSION` when changing answers, ordering, or content to avoid interpreting saved answers against different questions. See [CONTENT.md](CONTENT.md) for editorial sources and [ACTION_PLAN.md](ACTION_PLAN.md) for launch and naming work.

## Limits

No accounts, payments, live feeds, public leaderboards, or server-validated scores. LocalStorage can be edited: do not use local scores for prizes. Activity counters (`deep-cut-activity`) stay on the device and are not aggregate analytics or retention measurement. An individual day's mix may not include every named artist or creator. Current creator questions start with basic public references; detailed lore needs regularly sourced editorial updates.

The logo PNG was prepared from the user’s attached image reference; the original attachment binary was not mounted in the workspace. Keep the final original logo export for any future pixel-exact replacement of `src/assets/deep-cut-logo.png`. Other graphics and sound effects are original. No copyrighted audio clips, creator photos, or fan edits are bundled. No endorsement by featured artists, creators, or platforms is implied.
