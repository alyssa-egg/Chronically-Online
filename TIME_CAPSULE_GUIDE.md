# Fandom Files · The Time Capsule

The signature game is now **The Time Capsule**. It reuses the existing vanilla JavaScript site, Node server, Netlify functions, local fonts, image assets, sound preference, archive worlds, quizzes and Supabase account setup. No package or framework was added. The earlier games and saved progress remain in the quiz extras and the earlier My Files page.

## What players can use immediately

- `/play/`: one daily five-round capsule: **Name That Era → The Soundtrack → Before or After? → The Album / Artist File → The Deep Cut**. Every local date maps deterministically to the same five IDs and order. Each round gives immediate answer notes, an explanation, source reference and points. Reading feedback pauses active answering time, including the fifth round before the final score.
- `/infinite/`: five-question sets from a curated bank, with all nine filters: Mixed Bag, 2010–2016, 2017–2020, 2020–now, Music, Internet Culture, Fandoms, Fashion & Beauty, Creator Culture. Every folder has at least ten questions. Recent and unseen questions take priority; difficulty targets rise every two completed sets. The bank is finite, so questions eventually return. Personal high scores and consecutive correct-answer streaks come from completed records.
- `/challenge/?c=…`: **Send a Challenge** creates a link containing the exact five question IDs, their order, bank version, nickname and shared score/time. A recipient plays the same set and sees a comparison. Higher score wins; equal scores use active answering time. The link works on another device without accounts.
- `/profile/`: nickname/icon, friend usernames, daily/longest completion streak, completed capsules, total points, personal bests, strongest file, seven-day performance, saved results and earned archive stamps. All local records remain on the current browser/origin.
- `/archive/` and the three existing era pages: original collages and discoveries, themed Time Capsule sets, unique questions discovered, answer accuracy, three discovery chapters and a chapter stamp. The existing personality quizzes and knowledge quizzes remain available.
- `/leaderboard/`: a real shared board when configured, or an explicit **not connected** state. There are no seeded players, fabricated scores, global counts or fake friend records.

The header leads with Daily Game, Infinite Archive, Era Worlds, Leaderboard and Profile. The homepage retains “YOU HAD TO BE THERE.” and the installed logo, with Time Capsule and Infinite Archive as the main invitations. The three personality quizzes remain secondary experiences.

## Branding and preserved functionality

The installed logo file is [src/assets/fandom-files-heart-logo.png](src/assets/fandom-files-heart-logo.png). The three originals remain at [fandom-years.jpg](src/assets/eras/fandom-years.jpg), [influencer-era.jpg](src/assets/eras/influencer-era.jpg) and [current-lore.jpg](src/assets/eras/current-lore.jpg). **No image file was changed or generated.** Existing full-canvas logo rendering and original-image CMS overrides are preserved. The PinkPantheress discovery pin remains to the left of KATSEYE.

Headlines remain lowercase Helvetica Bold with existing system fallbacks; secondary copy uses bundled DM Sans. No handwriting font, celebrity recording, song clip or licensed audio was added. Sound cues reuse the original synthesised UI sounds and existing Sound toggle. Reduced-motion preferences disable cosmetic score counting and stamp animations.

The Daily Connection remains at `/play/?game=connection`. The five-prompt Deep Cut remains at `/play/?game=open-cut`; Quick Cut, Name That Reference, ten-question quiz, Lost Post, Sideblog, collectibles, original purchases, Memories moderation and `/admin/` remain accessible. Existing Stripe parameters and payment behavior are unchanged.

## Scoring, clocks and dates

Each round is worth **20 points**, for a maximum of **100**:

- Incorrect or skipped answer: **0**.
- Correct answer: **16 knowledge points**.
- Each opened hint subtracts **2**, up to the question’s two available hints.
- Using no hints adds **2 mastery points**.
- Speed adds **0–2**. Easy questions allow 10 seconds for +2, Medium 15, Hard 20, Expert 25. Up to three times that threshold earns +1. Slower correct answers still count, with no time limit.

Thus a correct no-hint answer earns 18–20. A correct answer with two hints earns 12–14. Difficulty changes the speed allowance, not factual correctness. A fast wrong answer earns nothing. The first Soundtrack clue is free; revealing clues two and three counts as hints.

Rank thresholds: 95+ Chronically Online Legend; 85+ Internet Historian; 70+ Certified Lore Detective; 50+ Tumblr Veteran; 25+ Casual Scroller; otherwise Internet Newbie. Ranks and best categories are calculated from actual answers, not selected randomly. Ties for strongest file use a stable category order.

The active clock starts when the round opens. It includes time away from that question but excludes the feedback screen. Reloading retains the question start and used hints. A started capsule can finish across local midnight on its original date. A fresh daily capsule uses the new local date. Daily streaks count **completion**, even when answers are incorrect; missing a date ends the current streak while records and longest streak remain.

Dates reset at **each player’s local midnight**, as chosen for this relaunch. The same calendar date selects the same daily capsule, but visitors in different time zones can be on different dates simultaneously. Local calendar arithmetic handles DST rather than adding 24 hours. Capsule #001 is November 1, 2026. Older games keep their earlier date rules.

## Question editing

Edit [src/capsule-content.js](src/capsule-content.js). The initial bank has **60 authored questions**, twelve per round type, using stable IDs, eras, category tags, difficulty, text/choice format, a question, answer/aliases, options, clues, hints, explanation and source/verification URLs. The bank deliberately uses written clues and established facts rather than generated viral moments or audio.

Source links are verification references, often official artist, product or platform pages; they are not a claim that an automated checker proved each fact. Review new dates, tracklists, launch names and ambiguous answers against reliable sources before releasing them. Avoid changing a released ID to a different question: friend links, records and leaderboard attempts refer to that ID.

Text answers accept listed aliases, spacing/case/punctuation/accent differences and bounded spelling slips. Numeric-only answers must match exactly. A correct title with the wrong artist is not accepted as the same song. Add reasonable title/artist abbreviations to `aliases`; do not indiscriminately accept every song for a specific-song clue.

`validateCapsuleBank()` in [src/capsule.js](src/capsule.js) checks IDs, round types, category coverage, eras, difficulty, answer options, source references and clue shapes. The build fails on structural validation errors. It cannot establish factual accuracy by itself.

The daily selector uses one of each round type. With twelve questions per type, the starter daily cycle repeats after **12 days**, beginning again November 13, 2026 unless you expand the schedule. This is not an automatically replenishing trivia service. Add approved future question IDs through `capsuleOverrides` for a dated five-ID set, in the five round-type order. Keep existing IDs and dates stable.

Infinite Archive chooses only from this bank. It avoids the previous set when the selected folder has enough questions, works through unseen material, then cycles. Difficulty rises within the available content; it does not manufacture harder facts. Era chapter progress counts 5 questions, 10 questions, then every available question in that world; accuracy uses all attempted era answers.

## Achievements

- **First File:** finish a daily capsule.
- **Seven Days Online:** reach seven consecutive daily completions.
- **Tumblr Veteran:** at least 90% accuracy in a full Fandom Years set; with five questions this means five correct.
- **Music Head:** all five correct in a music set.
- **Deep Cut Detective:** complete a set of five Expert questions.
- **No Hints Needed:** complete a daily capsule without opening hints.
- **Perfect Archive:** score 100 on a daily capsule.

Achievements are derived from retained completed records. Nothing is awarded for fake population rankings or claimed global rarity.

## Shared accounts and leaderboards: what still needs configuration

The existing project already has Supabase email sign-in for memberships. This implementation reuses it. **Supabase credentials were not available in the coding workspace, so the migration has not been applied and no live shared game records were created here.** Provider behavior was tested using a mocked Supabase API; that is not a live database test.

To connect real community records on your host:

1. Open your **existing Supabase project → SQL Editor → New query**. Paste and run [config/capsule.sql](config/capsule.sql). It creates two new game tables and the leaderboard function. It does not alter membership/purchase tables.
2. In **Render → your service → Environment**, retain the existing server-only `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SITE_URL`. Add **`CAPSULE_LEADERBOARD_ENABLED=true`** only after the SQL succeeds. On Netlify, use the equivalent environment settings. Never paste secret values into chat or browser code.
3. Deploy the latest GitHub commit. Visit `/profile/`, sign in by email, choose a unique lowercase username/icon, and save the shared profile. Existing email link/code templates are supported. Supabase Site URL and redirect allowlist must match the actual live site origin, as in the earlier account setup.
4. Check **Record new rounds on the server** before opening a new daily or Infinite Archive set. Public visibility is separate: check **Show my verified daily scores…** if you want your username/icon and records on the public boards. A completed local result cannot be retroactively uploaded as verified.
5. Finish a server-recorded set, then test `/leaderboard/`. Daily/Friends show that date’s daily scores. Weekly sums seven local-date daily scores; All-time sums completed daily scores. Infinite shows each player’s best verified Infinite Archive score (different sets are explicitly disclosed). Equal daily totals use active time. The leaderboard includes completed counts, longest/active completion streaks and strongest file.
6. On another device, sign into Profile to sync completed verified records. They are paginated from the server and daily completions populate the new device’s saved daily keys. Enable server recording on that device to resume a verified unfinished daily through the server’s unique daily attempt. Local anonymous history does not automatically become cross-device history.
7. Test turning public visibility off; the public boards should no longer show that profile. Keep purchases/sign-in restoration available through the earlier My Files page.

The config endpoint checks that the new tables are accessible before the UI offers shared play. Missing tables/keys/flag or a provider failure leaves local play usable and public boards honestly unavailable. Setup does not switch Stripe live mode, make a charge, change the Render hostname or deploy through the Render dashboard automatically.

### Security and trust boundaries

[server/capsule.mjs](server/capsule.mjs) verifies Supabase access tokens against `/auth/v1/user` and requires confirmed email. Private rows are filtered by the verified user ID, never a supplied account ID. Both tables have RLS enabled and browser roles have no direct read/write access. The service-role key is used only on the server.

Verified attempts are created by the server. The server chooses valid question IDs, stores question start/hints/answers, uses its own clock, recalculates score, and writes completion totals. It ignores client-provided scores, elapsed times and claimed hint counts. A unique daily index prevents starting another verified daily on the same user/date. One open verified Infinite Archive set is resumed rather than reset. Version-checked updates prevent concurrent tabs overwriting a filed answer. Timezones are validated; new verified sets use the current device’s IANA timezone (falling back to the saved profile timezone for older API callers), and the server derives the date from its own clock. Changing timezone for travel is supported, not a claim of cheat-proof competitive identity.

Public leaderboards read a limited aggregate through a server-only SQL function and include only opted-in profiles. Email addresses and private answer histories are not exposed. Friend username filters apply to actual public records. Provider errors, cross-origin writes, invalid methods, invalid input and oversized bodies are rejected. No public endpoint accepts a finished local score upload.

This is server-validated recreational competition, not an anti-cheat guarantee: the public question bank can be inspected, and people can look up answers. Signed-in participants may also choose not to appear publicly.

**Friend links remain a separate local feature:** their score/nickname is self-reported and editable in principle. The UI and comparison cards label that limitation. A unique link preserves the same set/order/bank version for a fair question comparison; it is not a signed verification of the sender’s score. The recipient’s comparison uses real local performance. A version mismatch or invalid link produces a recoverable message, never a different random set.

## Records and storage

New keys use `fandom-files-capsule-*`; earlier game, membership, image and collectible keys are unchanged. Local history deduplicates completed IDs and recalculates scores from valid records. It does not silently discard old daily files when players use Infinite Archive. As with any local-storage app, browser quota or blocked storage can limit persistence; the existing visit-only fallback explains this in the UI. Shared completed records are fetched in 500-record pages and remain separate from anonymous local records until sign-in sync.

## Build and launch check

```sh
npm test
npm run check
npm --prefix studio ci --no-fund --no-audit
npm run build
npm start
```

The existing Render/Netlify build/start configuration is preserved. New modules, stylesheet and API routing are included in the public/server allowlists. After deploying, verify home → daily → all five answers/feedback → results → copy/image/challenge link → friend comparison; then an Infinite Archive set, all category filters, Profile, Leaderboard, the three era pages, quizzes, earlier games and `/admin/`.

Run the SQL and a real signed-in end-to-end provider test before advertising public leaderboards. The code push, local tests and production build do not establish that the hosted database has been configured.

## Clearer round flow

The question and answer feedback share the same round heading, five-step progress strip and score bar. Each round states the answer format in plain language. Soundtrack questions name the artist, start with a distinguishing song detail, use a **Song title** field, and show how many of the three clues are open. Optional help buttons display the real first-hint cost (4 points, including the lost no-hint bonus), then 2 points for the next hint. Saved input/selected choices survive hint reveals; revealing a clue retains the original question clock.

Feedback labels the correct answer and previews the next round by name. The next question only starts when the player continues. Prompts and selected hints have been clarified; question IDs, accepted answers, daily order, score rules and existing saved records are retained. Existing text/artist aliases and spelling tolerance still apply. No logo, image, account or payment behavior changed.
