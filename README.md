# Deep Cut ♡

“you had to be there.” A daily internet-culture quiz and Anonymous Ask, styled like an old Tumblr blog meets a magazine. Beauty YouTube, gaming rabbit holes, fan accounts, and the group chat—in turquoise, hot pink, scrapbook notes, and original chimes.

## Run it on your Mac

Stop an existing server with **Ctrl+C**, then:

```sh
cd ~/Projects/Chronically-Online
git pull origin main
npm start
```

Open `http://localhost:3000`. Requires Node.js **22+**, with no dependencies to install. If that port is occupied, use `PORT=3001 npm start`. The repository/folder remains `Chronically-Online`; the website is Deep Cut. In the cloud, use `/workspace/Chronically-Online`.

## Play

The homepage features the Daily Quiz and Anonymous Ask in equally sized blog-window cards, with separate buttons and saved progress. Both are free main games. The Ask has a transparent moustache sticker prepared from your attached reference; it also appears inside the inbox game.

- **Main daily quiz:** ten questions, always free; explanations, ranks, answer review, sharing, and downloadable PNG report cards.
- **Anonymous Ask:** one mystery reference, six increasingly helpful clues. Type a guess or pass. Empty/repeated guesses use no turns. Always free.
- **The Lost Post:** four clues, three guesses, one recovered reference. Always free.
- **Your Sideblog:** collect correct-answer receipts and completion stamps, unlock themes, pin a moodboard, and export a PNG. Saved in this browser.
- **Three eras:** The Fandom Years (2010–2016), The YouTube Era (2017–2019), Current Lore (2020–now). Twelve interactive folders / 36 files, with one free sample folder per era. Classic five-question daily remixes remain available. One explicit **24-hour trial per email account**, then **$5 once for all three eras**. No subscription.
- Daily games and classic remixes refresh at **midnight Eastern**, automatically accounting for daylight saving. Worldwide players see the same day’s questions. The trial itself lasts 24 elapsed hours from activation.
- Progress, sound preference, and reading-diary streaks save in this browser. The game still works for the current visit when storage is unavailable. Purchase/trial access follows a verified email account between devices; progress does not sync.
- The blog aesthetic and “you had to be there.” copy remain. “Eastern edition” is removed; reset explanations still describe the actual timing.

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

Site provided: **https://deepcutt.netlify.app/**. Connect that Netlify project to this GitHub repository’s `main` branch for automatic deployments. The committed settings use `npm run build`, publish `dist`, and bundle `netlify/functions`. See [PREMIUM_SETUP.md](PREMIUM_SETUP.md) for the Supabase database/email setup, Stripe’s one-time $5 price/webhook, and private Netlify variables.

The public build has 13 files, plus any additional approved local image assets. It includes only the legacy free question pool and approved free issue content. Premium questions are returned by the API after checking trial/payment access. Drafts, credentials, and backend source are excluded from `dist`. Build replaces the generated folder; keep personal files elsewhere.

A static upload/Netlify Drop serves the free games, but **does not deploy the membership function**. Use Git-connected deployment for trials/payments. Publishing only `dist` to other static hosts also needs a compatible backend to offer eras. A Node host can run `npm start` with the same private environment settings. Use HTTPS for real checkout and device sharing.

No provider credentials were available during implementation, and the Netlify URL could not be fetched because the cloud egress proxy returned 403. Local/backend checks are documented below; a production deploy and real provider checks are still required.

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

See [CONTENT.md](CONTENT.md) for writing/source checks and [ACTION_PLAN.md](ACTION_PLAN.md) for launch work. Deep Cut remains a working name; trademark/domain availability has not been verified. The logo and Ask sticker were prepared from your supplied image references; retain the originals for future exact replacements. Other bundled illustrations and sounds are original.

Scores are browser-local, with no server-validated leaderboard or aggregate analytics. The GitHub review files contain future answers; a public repository makes them public. The game controls paid gameplay access rather than hiding facts in a public repository.

See [ARCHIVE_GUIDE.md](ARCHIVE_GUIDE.md) for the new game flow and [CONTENT_ARCHIVE.md](CONTENT_ARCHIVE.md) for your full topic brief. New daily question material remains draft until owner approval.
