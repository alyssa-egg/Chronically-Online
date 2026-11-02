# Fandom Files — gameplay redesign

This describes the earlier three-round Daily File, now at `/play/?game=daily-file`. The current main story experience is documented in [LOGGED_ON_GUIDE.md](LOGGED_ON_GUIDE.md). Its existing practice modes and records remain available.

## Phase 1: implemented

The homepage and `/play/` now lead to **The Daily File**, with three genuinely different rounds:

| Mode | Interaction | Score |
| --- | --- | --- |
| Decode the Screenshot | An original recreated dashboard, profile, comment thread, group chat, playlist, music blog or search artifact. Tap covered evidence individually; type the missing name. | 100 initially; −15 per extra reveal, −10 per unsuccessful guess. Three unique guesses. An unsolved or skipped file earns 0. |
| Rewind | Move five event cards from oldest to newest. Native desktop drag, touch-handle drag, arrow controls and keyboard ↑/↓ on handles all work. Lock the timeline once; see its real years and your submitted order. | Ten relative event pairs, 8 points each; +20 for a perfect timeline. Partial credit is based on pairs, not just fixed positions. |
| The Soundtrack | One clearly named artist and a distinguishing first clue. Type one song title; optionally reveal three further clues in sequence. No audio or lyric excerpts. | Same reveal/guess rules as Decode. Title alone, common aliases and bounded spelling variations count. Artist alone does not count as a song. |

Consecutive successful rounds add +5 on the second and +10 on the third. A successful Rewind means a perfect order. The daily maximum is **315**, including 15 combo points. There is no speed penalty or deadline. The visible clock counts time on open rounds and pauses during feedback. Leaving an open round and returning still counts that elapsed time.

Every answer leads to its own score reveal, explanation, optional references, and a preview of the next interaction. There is no multiple-choice round in the new game. Skip requires a second tap to confirm. A missed guess remains visible and leaves the round open until the third guess; repeated guesses do not spend another attempt.

## Daily dates, saves and repeatability

- The same **local calendar date** selects the same three IDs everywhere, using the previously chosen local-midnight rule. Players in different time zones can therefore be on different daily files at the same instant.
- An open daily file retains its original date until you finish or reopen `/play/`. New visits/homepage previews use the new local date after midnight.
- Saves retain opened evidence, failed guesses, typed drafts, moved timeline cards, answer feedback and completed scores across reloads. Another tab’s filed actions are checked before accepting an action or saving a draft.
- The new keys begin `fandom-files-daily-file-`. Earlier game records and paid access are untouched. These are local records, not tamper-proof or cross-device results. Stored actions are replayed to recompute scores; edited score fields are not trusted.
- The starter bank contains **36 files: 12 per mechanic**. Its fixed daily rotation repeats every **12 days** unless future editorial overrides are added. Appending practice entries does not change past daily selections.

## Practice and personal records

`/play/?mode=decode`, `?mode=rewind`, and `?mode=soundtrack` offer single-round practice, with easy/medium/hard difficulty, per-mode resumable attempts, fresh-file preference and no immediate completed-file repeat within the selected difficulty. Each difficulty has at least two curated files per mode. Questions return once that pool is exhausted. Starting a new file explicitly replaces that mode’s unfinished practice.

Practice does not overwrite the daily file or award a daily streak. Daily completion builds a local completion streak; My Files and Profile show new-game history and the daily personal best separately from earlier Time Capsule scores. Results offer copied text and a downloadable/shareable PNG using the installed logo at its original proportions. Shared text and cards contain scores and round labels, not answers. A link to the daily game lets friends on the same local date play the same daily set; it is not yet a persistent rematch or friend-challenge link.

## Editing the curated bank

Edit [src/daily-file-content.js](src/daily-file-content.js). Every entry has a stable ID, mode, era, category, difficulty, question, clues, answer, explanation, scoring rules and source references. Rewind stores five event IDs and distinct original release/launch years in chronological order. Its answer order is never displayed until the round closes. No factual dates are generated randomly.

1. Confirm each date/fact against its reference. Use original release/launch years and distinguish reissues, original album versions and later remixes. Keep each clue specific enough for a single intended answer.
2. For typed files, add common aliases and plausible spelling/name forms. Avoid aliases for an artist alone when the target is a song. All four clues must describe the same answer.
3. For Decode, select one of the seven original `layout` values. Its visible text is game artwork, not a verbatim real post or a screenshot from a platform. Never paste actual users’ posts into the bank.
4. Append new entries with new IDs. Preserve released IDs, answers and scoring semantics so existing saves remain interpretable. The `dailyFileRotation` lists are a published fixed schedule: do not reorder them to add content.
5. To schedule a reviewed future daily, add a **future date only** to `dailyFileOverrides`, e.g. `'2026-12-01': ['decode-new-id','rewind-new-id','track-new-id']`. Order must be Decode, Rewind, Soundtrack. Never replace a day players have already started.
6. Run `npm test`, `npm run check`, and `npm run build`. Build validates bank completeness, unique IDs, timeline ordering, rotations and source-reference fields. Schema checks do not prove that a reference supports a fact; editorial review still matters.

This phase provides a code-editable bank. A CMS question editor or approval dashboard for these three modes is not implemented yet; the existing Sanity image/editorial dashboard remains available.

## Preserved functionality

The installed logo and all three era collage files are unchanged. Headings retain lowercase Helvetica Bold; secondary text uses bundled DM Sans. No image generation, new font package or third-party screenshot/audio is introduced. The original era archives, memories, quizzes, purchases, sign-in and admin dashboard remain.

The earlier five-round Time Capsule now has an explicit route: `/play/?game=capsule`. Its daily progress keys, scoring and server API remain intact. Its shares point to that route. The older Infinite Archive remains at `/infinite/`; it is labelled as the earlier archive, not the new three-life mode. Earlier game buttons remain in Quizzes → more quizzes & original games. Existing friend-challenge links at `/challenge/` continue to use the older five-round bank.

The existing shared leaderboard at `/leaderboard/` is labelled as **earlier Time Capsule** scores. It is not a ranking for the new game. New-game results honestly state that shared rankings are not connected. The existing Supabase code/tables cannot safely score the new mechanics without a separate versioned integration. No production schema, payment setting, environment key or webhook was changed by this phase.

## Remaining phases from the brief

| Phase | Next work |
| --- | --- |
| 2 | Build the new Endless Archive with three lives, mixed mechanics, increasing run difficulty, combo/life rules, longest runs and a game-over/rematch flow. Expand the starter bank beyond its 12-day cycle. Practice and basic local records already work. |
| 3 | Extend the existing authenticated Supabase architecture with versioned server-created Daily File attempts and server-side scoring for reveals, guesses and timelines. Then add durable exact-set friend links, verified comparisons and opt-in new-game leaderboards. Requires provider configuration and a real hosted account/game test; local scores cannot be promoted to verified scores. |
| 4 | Expand era-specific discoveries, achievements and collectibles around the new mechanics, plus more original artifacts and curated content. |

## Code and validation

- [src/daily-file-content.js](src/daily-file-content.js): curated records, fixed rotation and future date overrides.
- [src/daily-file.js](src/daily-file.js): deterministic selection, bounded guessing, ordering, scoring, action replay, personal records and share text.
- [src/daily-file-ui.js](src/daily-file-ui.js): three interactions, touch/keyboard controls, feedback, home/practice/results and PNG export.
- [src/daily-file.css](src/daily-file.css): scoped layout, mobile styles, original artifact skins, transitions and reduced-motion support.
- [tests/daily-file.test.js](tests/daily-file.test.js): bank/date consistency, action boundaries, score calculations, combos, draft/order restoration, invalid saves, practice and daily isolation.

Both public-file allowlists and the existing build syntax checks include the new files. The Render and Netlify build/start configuration is preserved. Run locally with `npm start`; production build remains `npm --prefix studio ci --no-fund --no-audit && npm run build`.
