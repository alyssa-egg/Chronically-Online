# Deep Cut ♡

“Your fandom phase was never a phase.” A cute daily fandom quiz for Tumblr girls, band fan accounts, YouTube sleepovers, and newer creator communities. Pink gingham, lilac browser windows, original bows, scrapbook notes, and homemade chimes. Deep Cut is a working name; trademark/domain availability has not been verified.

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

- Ten questions: three **The dashboard**, three **Band girl files**, two **YouTube sleepover**, and two **The new lore**.
- A shared selection changes every day at **midnight UTC**. A countdown shows the time remaining. This is a fixed global reset, not midnight in each player's time zone.
- No repeated question IDs on consecutive days. The 48-question bank eventually cycles; this does not automatically author new content or ingest trends.
- Homepage/results switch to the new issue without reloading. A quiz open over midnight switches on the next answer or Next action. Yesterday's progress remains stored separately.
- Daily progress and completion are saved in this browser under `deep-cut-v2-YYYY-MM-DD`. Previous LoreDial answers are kept in storage but not used, because the questions changed.
- Four original sound cues: question arrival, correct answer, incorrect answer, and completion. Audio starts after a user action. The sound button remembers your preference; the game works without audio support.
- Five ranks, answer explanations/review, native sharing or clipboard fallback, and a **1080 × 1350 PNG** result card.
- Keyboard-accessible era tabs, focus states, live feedback, and responsive phone/desktop layouts. Tabs introduce the daily mix rather than selecting a separate quiz.

Rank thresholds: Casual Lurker 0–2; Certified Mutual 3–4; Fandom Archivist 5–7; Keeper of the Lore 8–9; The Deepest Cut 10.

## Check the code

```sh
npm test
npm run check
```

The tests cover daily selection, department balance, consecutive-day repeats, the full archive, shuffled correct answers, scores/ranks, UTC resets, invalid dates, and corrupt saved progress.

The redesign was also checked in Chromium at widths 320, 390, 768, and 1440, including all ten answers, sound/mute, reload recovery, PNG export, clipboard sharing, midnight rollover, year rollover, and denied browser storage. Safari/Firefox and real phone audio/share sheets still need device testing before public launch.

## Hosting and editing

Run `npm start` on a Node-capable host, or serve `index.html` and `src/` on a static host. Use HTTPS for clipboard and device sharing. Never expose the whole repository through a static server. Source paths currently assume the site is at the domain root; use a root-domain host or adjust paths before deploying under a subdirectory.

Questions and departments are in `src/game.js`; audio is in `src/sound.js`; styles are in `src/style.css`. Keep a published edition's question bank stable. Bump `EDITION_VERSION` when changing answers, ordering, or content to avoid interpreting saved answers against different questions. See [CONTENT.md](CONTENT.md) for editorial sources and [ACTION_PLAN.md](ACTION_PLAN.md) for launch and naming work.

## Limits

No accounts, payments, live feeds, public leaderboards, or server-validated scores. LocalStorage can be edited: do not use local scores for prizes. Activity counters (`deep-cut-activity`) stay on the device and are not aggregate analytics or retention measurement. An individual day's mix may not include every named artist or creator. Current creator questions start with basic public references; detailed lore needs regularly sourced editorial updates.

Graphics and sounds are original. No copyrighted audio clips, creator photos, or fan edits are bundled. No endorsement by featured artists, creators, or platforms is implied.
