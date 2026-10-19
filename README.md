# The Fandom Files

The smaller daily hangout is documented in [HANGOUT_GUIDE.md](HANGOUT_GUIDE.md): Today’s Deep Cut, three eras, curated stories, original image uploads and saved files.

“you had to be there.” An interactive internet-culture publication in hot pink, archive black, and paper cream: music, fandom, fashion, creators, and internet memory. Read the lore, explore timelines and moodboards, and keep stories in your Sideblog. The daily games and collectible archive remain part of the dashboard.

## Hosting without Netlify

[RENDER_MIGRATION.md](RENDER_MIGRATION.md) covers moving this existing Node app to Render, including the free-service limits, environment variables, sign-in URLs, Sanity CORS and Stripe webhook cutover. [render.yaml](render.yaml) provides the service configuration.

## Run it on your Mac

Stop an existing server with **Ctrl+C**, then:

```sh
cd ~/Projects/Chronically-Online
git pull origin main
npm run studio:install
npm run build
npm start
```

Open `http://localhost:3000`. Requires Node.js **22.12+** (Node 24 recommended). Sanity Studio dependencies are installed separately in `studio/`; the game server has no runtime dependencies. If that port is occupied, use `PORT=3001 npm start`. The repository/folder remains `Chronically-Online`; the website is The Fandom Files. In the cloud, use `/workspace/Chronically-Online`.

## Write articles without editing code

Open **https://fandomfiles.netlify.app/admin/** and sign in with your Sanity GitHub account. [BLOG_GUIDE.md](BLOG_GUIDE.md) walks through writing, images, interactive extras, scheduling, publishing and access. The homepage features Today’s Deep Cut, three era entrances and curated editorial stories. The full editorial search retains its five subject folders. Search the full published archive by category, era, format, tags and article text. The editor includes a draft Preview tab. Article updates appear after refreshing the site, without redeployment. Drafts remain hidden. Saved stories and personal poll choices are browser-local.

[EDITORIAL_PUBLICATION_BRIEF.md](EDITORIAL_PUBLICATION_BRIEF.md) preserves the supplied magazine concept and future ideas. This release includes the article dashboard and interactive reader experience; shared community submissions/vote totals and a newsletter remain future work.

## Play

The homepage features the Daily Quiz and Anonymous Ask in equally sized blog-window cards, with separate buttons and saved progress. Both are free main games. The Ask has a transparent moustache sticker prepared from your attached reference; it also appears inside the inbox game.

- **Main daily quiz:** ten questions, always free; explanations, ranks, answer review, sharing, and downloadable PNG report cards.
- **Anonymous Ask:** one mystery reference, six increasingly helpful clues. Type a guess or pass. Empty/repeated guesses use no turns. Always free.
- **The Lost Post:** four clues, three guesses, one recovered reference. Always free.
- **Your Sideblog:** collect correct-answer receipts and completion stamps, unlock themes, pin a moodboard, and export a PNG. Saved in this browser.
- **Three eras:** The Fandom Years (2010–2016), The YouTube Era (2017–2019), Current Lore (2020–now). Twelve interactive folders / 36 files, with one free sample folder per era. Classic five-question daily remixes remain available. One explicit **24-hour trial per email account**, then **$5 once for all three eras**. No subscription.
- Daily games and classic remixes refresh at **midnight Eastern**, automatically accounting for daylight saving. Worldwide players see the same day’s questions. The trial itself lasts 24 elapsed hours from activation.
- Progress, sound preference, and reading-diary streaks save in this browser. The game still works for the current visit when storage is unavailable. Purchase/trial access follows a verified email account between devices; progress does not sync.
- The magazine/scrapbook aesthetic and “YOU HAD TO BE THERE.” cover remain. “Eastern edition” is removed; reset explanations still describe the actual timing.

Email/trials/payments require the configured backend. Until it is connected, the era dialog shows coming-soon messaging and disables unavailable actions. Main and Ask remain playable without accounts or provider keys.

## Review questions before they go live

Read [QUESTION_SCHEDULE.md](QUESTION_SCHEDULE.md) for **ten dated draft issues, October 11–20, 2026**, with every answer and Ask clue. Themes cover beauty YouTube, gaming, internet-girl moodboards, Emma, Enya/Drew, Vine/TikTok, KATSEYE/global pop girls, PinkPantheress/bedroom pop, and the original fangirl group chat. Each main quiz and Ask share a theme. All ten drafts await editorial/source review; they are not approved or live.

[EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md) explains JSON edits, pictures with credits, approval, and GitHub Actions’ **9 a.m. Eastern day-before review**. The workflow displays existing drafts; it does not author or approve them. I can draft/edit when you bring ideas into chat. Additional dates need new issues.

```sh
npm run content:check
npm run content:review
npm run content:tomorrow
```

Only approved issues are packaged for publication on their date. Unapproved/missing days use the previous archive: 150 questions in exclusive main/era pools, repeating after six days, plus 30 asks. Fallback main/Ask themes are not coordinated. Published content should stay immutable; saved attempts are keyed by the dated issue revision or legacy edition version.

## Deploy to your Netlify website

Current site: **https://fandomfiles.netlify.app/**. Connect that Netlify project to this GitHub repository’s `main` branch for automatic deployments. The committed settings install Studio dependencies, run `npm run build`, publish `dist` including `/admin/`, and bundle `netlify/functions`. See [PREMIUM_SETUP.md](PREMIUM_SETUP.md) for the Supabase database/email setup, Stripe’s one-time $5 price/webhook, and private Netlify variables.

The public build includes explicitly listed game/reader modules, generated free content, and compiled Sanity Studio assets, plus approved local image assets. It includes only the legacy free question pool and approved free issue content. Premium questions are returned by the API after checking trial/payment access. Drafts, credentials, and backend source are excluded from `dist`. Build replaces the generated folder; keep personal files elsewhere.

A static upload/Netlify Drop serves the free games, but **does not deploy the membership function**. Use Git-connected deployment for trials/payments. Publishing only `dist` to other static hosts also needs a compatible backend to offer eras. A Node host can run `npm start` with the same private environment settings. Use HTTPS for real checkout and device sharing.

The Sanity production dataset connection and a temporary draft/publish/read/delete cycle were verified October 13, 2026. Public article reads do not require editor credentials. Owner login and the first real story remain owner checks. Payment tests use mocks and do not establish successful real Stripe charges.

## Verify changes

```sh
npm test
npm run check
npm run content:check
npm run build
```

Node tests cover the archive, scores/ranks, Eastern midnight and DST, puzzles/aliases/streaks, dated content validation, draft exclusion, approval timing, authenticated era access, non-resettable trials, exact $5 checkout, receipt ownership/refunds, and signed webhook fulfillment. Payment/provider tests use mocks; they do not establish that real Stripe or Supabase accounts are connected.

Browser checks cover free play, disabled membership without configuration, mocked sign-in/trial/purchase restoration, all three era quizzes, saved progress, approved themed questions and Ask, a credited image, and layouts at 320/390/768/1440 pixels. Real email, Stripe test/live checkout, Safari/Firefox, and phone audio/share sheets need launch checks.

## Where to edit

Dated content: `content/issues/`. Review/publication: `scripts/editorial.mjs`, `src/issue-schema.js`, `server/editorial.mjs`. Browser: `src/app.js`, `src/style.css`, `src/game.js`, `src/puzzle.js`, `src/sound.js`. Auth/checkout/access: `src/membership.js`, `server/premium.mjs`, `netlify/functions/api.mjs`. Database: `config/membership.sql`.

See [CONTENT.md](CONTENT.md) for writing/source checks and [ACTION_PLAN.md](ACTION_PLAN.md) for launch work. The logo and Ask sticker were prepared from your supplied image references; retain the originals for future exact replacements. Other bundled illustrations and sounds are original.

Scores are browser-local, with no server-validated leaderboard or aggregate analytics. The GitHub review files contain future answers; a public repository makes them public. The game controls paid gameplay access rather than hiding facts in a public repository.

See [ARCHIVE_GUIDE.md](ARCHIVE_GUIDE.md) for the new game flow and [CONTENT_ARCHIVE.md](CONTENT_ARCHIVE.md) for your full topic brief. New daily question material remains draft until owner approval.

## Collectible files and public launch

The Sideblog includes fourteen artifact cards, locked goals, a featured collectible and pinned finds. New unlocks reveal with a short animation and an optional original chime; reduced motion and sound off are respected. The Lore Book organizes correct-answer receipts with search, era filters, and related pages. Badges stay earned when you miss a day, and legacy progress is retained under the existing internal storage keys. [COLLECTIBLES_BRIEF.md](COLLECTIBLES_BRIEF.md) records the supplied ideas and what shipped.

Start with [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md). The current URL is `https://fandomfiles.netlify.app/`; existing internal account/progress identifiers and the $5 one-time price are retained. [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md) is the payment launch checklist, including public SMTP and test-to-live steps. Real payment success has not been verified in this cloud environment.

## Magazine cover redesign

[REDESIGN_GUIDE.md](REDESIGN_GUIDE.md) covers the October 14 cover, original camera/CD/player collage, pink-and-black masthead, accessible culture ticker, searchable archive, author preview, and refreshed share cards. [REDESIGN_BRIEF.md](REDESIGN_BRIEF.md) preserves the request. No game data, progress keys, auth tables, payment provider settings, or purchase/trial rules were changed. The Caveat handwriting font is bundled under its SIL Open Font License alongside the existing Outfit font.
