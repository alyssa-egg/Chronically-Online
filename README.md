# Deep Cut ♡

“you had to be there.” A cute daily fandom quiz for Tumblr girls, band fan accounts, YouTube sleepovers, and newer creator communities. A turquoise-and-hot-pink wordmark, pastel browser windows, original bows, scrapbook notes, and homemade chimes: an old Tumblr blog meets a magazine issue. Deep Cut is a working name; trademark/domain availability has not been verified.

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
- All games change every day at **midnight Eastern time** (`America/New_York`). Daylight saving changes are automatic: reset is 04:00 UTC in summer and 05:00 UTC in winter. A countdown shows the time remaining. Players worldwide get the same Eastern-day selection.
- No repeated question IDs on consecutive days. The 48-question bank eventually cycles; this does not automatically author new content or ingest trends.
- Homepage/results switch to the new issue without reloading. A quiz open over midnight switches on the next answer or Next action. Yesterday's progress remains stored separately.
- Each game saves progress separately under `deep-cut-v3-MODE-YYYY-MM-DD`. Previous editions remain in storage but are not reused after the reset policy and game modes changed.
- Four original sound cues: question arrival, correct answer, incorrect answer, and completion. Audio starts after a user action. The sound button remembers your preference; the game works without audio support.
- Five ranks, answer explanations/review, native sharing or clipboard fallback, and a **1080 × 1350 PNG** result card.
- Three playable five-question era mini quizzes: **2010–2015: The Tumblr Years**, **2015–2019: YouTube Was Everything**, and **2020–Today: The New Lore**. Each has its own daily selection, saved progress, results, review, and share card. An All eras button lets you leave and resume later.
- Keyboard-accessible buttons, focus states, live feedback, and responsive phone/desktop layouts. The creator-name strip has been removed.

Main-game rank thresholds: Casual Lurker 0–2; Certified Mutual 3–4; Fandom Archivist 5–7; Keeper of the Lore 8–9; The Deepest Cut 10. Mini quiz ranks scale by the fraction correct (a perfect 5/5 gets The Deepest Cut).

## Check the code

```sh
npm test
npm run check
```

The tests cover daily selection, department balance, consecutive-day repeats, the full archive, shuffled correct answers, scores/ranks, Eastern resets and both DST transitions, invalid dates, era eligibility, mini quiz rotation, and corrupt saved progress.

The redesign was also checked in Chromium at widths 320, 390, 768, and 1440, including the main quiz plus all three mini quizzes (25 answers total), independent progress, sound/mute, reload recovery, PNG export, clipboard sharing, Eastern midnight and both DST transitions, UTC midnight without a reset, a Tokyo browser time zone, and denied storage. The built static site also passed a project-subdirectory hosting check. Safari/Firefox and real phone audio/share sheets still need device testing before public launch.

## Hosting and editing

Build a static website:

```sh
npm run build
```

The `dist/` folder contains exactly the seven public website files. It is generated and ignored by Git. Build replaces that folder, so do not store personal files there. Assets and share links work at a domain root or under a project subdirectory.

For **Netlify**: import this GitHub repository, set the build command to `npm run build`, and set the publish directory to `dist`. No application secrets or backend are required. Future pushes can then deploy automatically. Alternatively, upload the contents of `dist` using Netlify Drop. A prepared `deep-cut-site.zip` is provided in the cloud workspace; unzip it and upload the resulting website folder.

Run `npm start` on a Node-capable host if preferred. Use HTTPS for clipboard/device sharing. Publish only `dist/`, never the full repository. These instructions prepare deployment; a public hosting deployment has not been performed in this task.

Questions and departments are in `src/game.js`; audio is in `src/sound.js`; styles are in `src/style.css`. Keep a published edition's question bank stable. Bump `EDITION_VERSION` when changing answers, ordering, or content to avoid interpreting saved answers against different questions. See [CONTENT.md](CONTENT.md) for editorial sources and [ACTION_PLAN.md](ACTION_PLAN.md) for launch and naming work.

## Limits

No accounts, payments, live feeds, public leaderboards, or server-validated scores. LocalStorage can be edited: do not use local scores for prizes. Activity counters (`deep-cut-activity`) stay on the device and are not aggregate analytics or retention measurement. An individual day's mix may not include every named artist or creator. Current creator questions start with basic public references; detailed lore needs regularly sourced editorial updates.

The logo PNG was prepared from the user’s attached image reference; the original attachment binary was not mounted in the workspace. Keep the final original logo export for any future pixel-exact replacement of `src/assets/deep-cut-logo.png`. Other graphics and sound effects are original. No copyrighted audio clips, creator photos, or fan edits are bundled. No endorsement by featured artists, creators, or platforms is implied.
