# The Fandom Files: product and launch action plan

## 1. Positioning and naming

**Pitch:** “you had to be there. A daily deep cut in fandom lore.”

Make the niche explicit: Tumblr-era fandom, One Direction, Ariana-era pop culture, stan vocabulary, and current internet references. Invite people who missed an era as well as people who remember it. Explanations should make a wrong answer entertaining rather than embarrassing.

The Fandom Files names the obscure references the game celebrates, without locking it to one era. Backup names to research: Askbox Club, Mutuals Only, and Reblog Relay. The Fandom Files is a common phrase, so matching and similar entertainment brands deserve careful checking. None are cleared names. A “copyright-free name” cannot be guaranteed: short names are generally a trademark question, while code, illustrations, and writing involve copyright. Before buying branding or a domain, search the exact name, close spellings, app stores, social handles, web results, and trademark databases in target markets. Have a qualified professional assess conflicting marks before investing. Use a temporary working identity until clearance.

The distinct visual direction is magazine departments, serif cover headlines, a turquoise-and-hot-pink wordmark, pastel browser chrome, subtle graph paper, original ribbon bows, hearts, and scrapbook notes. Avoid copying BuzzFeed layouts, typography, logos, question text, or proprietary result language. This prototype uses CSS and SVG artwork, symbols, original quiz wording, and synthesized Web Audio chimes. No samples or artist recordings are included. Use neutral public facts; artist and platform names do not imply endorsement.

## 2. Scope for the first release

Keep one free ten-question issue each day. Four recurring departments give the product a recognizable rhythm. Ship homepage → quiz → explanations → score → share → tomorrow reminder. Keep five result tiers: Casual Lurker (0–2), Certified Mutual (3–4), Fandom Archivist (5–7), Keeper of the Lore (8–9), The Deepest Cut (10). No account requirement. Three five-question mini quizzes are playable from the homepage: The Tumblr Years (2010–2015), YouTube Was Everything (2015–2019), and The New Lore (2020–Today). They have separate daily progress, scores, and share cards. Main and mini selections use exclusive pools; measure each mode separately. The Anonymous Ask adds one daily reference guessed from six increasingly clear clues, with six turns and spoiler-free result sharing. A reading diary stamps any completed game, including losses.

The archive now contains 150 original questions, plus 30 clue puzzles. Before a public release, complete source review and playtesting, or prepare 14 manually curated issues. The current deterministic daily selector changes at midnight Eastern time, using America/New_York and automatic daylight saving adjustments and avoids question repeats within six daily issues, but the finite quiz archive cycles on the seventh day. Ask puzzles cycle after 30 days. A daily change is not the same as ten newly authored questions each day. Replace it with dated editorial issue manifests for release. Keep archival issues immutable so shared results stay comparable. Version questions and issue IDs whenever answers change.

Do not add payments, a public leaderboard, multiplayer, or user-submitted content before validating the core loop. Text-based music clues are enough. Licensed audio can come later if there is a clear benefit and budget.

## Interactive ideas that keep the blog feeling

The daily Ask now supplies the repeated-guess loop: a shared mystery, limited turns, clearer feedback, a spoiler-free result, and a reason to return tomorrow. Keep the original ask-box presentation, clues, sounds, and hearts. The diary supplies progress without turning a casual fandom game into a high-pressure ranking.

Next, test **one** of these with players:

- **Queue the lore:** order four public fandom moments from oldest to newest. Use movable scrapbook cards with keyboard-accessible move buttons and explain the chronology after submission.
- **Find your mutual:** match old usernames to creators or albums to their eras. Present it like matching saved posts to blog folders, with a small daily set.
- **Personal blog stamps:** let players choose a local blog nickname/theme and collect diary stamps. Keep sharing optional. Accounts are only needed later if people request syncing across devices.

Prioritize timeline ordering if players want a different challenge; prioritize matching if the audience wants a quick, approachable mini game. A small, well-edited daily puzzle is a better next experiment than adding a large feature list at once. Keep main/era question pools separate and rotate topics and difficulty, as well as IDs.

## 3. Editorial system

Prepare a spreadsheet with ID, department, prompt, four choices, correct answer, explanation, source URLs, source dates, era, difficulty, author, reviewer, and rights notes. Check every fact against an original source where possible; otherwise use two credible independent sources. Avoid presenting rumors, shipping theories, private information, or allegations as facts.

For dated issues, pair the main quiz and Anonymous Ask around one theme, rotating beauty, gaming, bands/fandoms, creator groups, and internet-girl references. The legacy fallback keeps its original department balance. Start with four easy, four medium, and two hard questions. Rotate fandoms so non-fans can still finish. For current memes, review weekly, timestamp the reference, and avoid “everyone is doing this” claims without evidence. Give ambiguous slang enough context for exactly one best answer.

Example tone: “Your fandom degree finally pays off.” Answer feedback should teach the reference in one sentence, not shame the player. Use harmless self-deprecating humor and avoid diagnosing players or targeting creators.

Run a weekly content review: draft 30 questions Monday; fact-check and edit Tuesday; playtest Wednesday; schedule Thursday; review performance Friday. Archive corrections and disclose meaningful errors. Retire items with disputed answers rather than silently changing already completed issues.

## 4. Four-week execution schedule

| Week | Work                                                                                | Deliverable / exit condition                                                           |
| ---- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1    | Name research, audience interviews, 40 original questions, mobile playtests         | 8–12 testers can complete the prototype; document confusion and sharing friction       |
| 2    | Expand content, choose hosting, test production sharing, improve accessibility      | 14 curated issues; keyboard and phone checks pass; HTTPS deployment responds correctly |
| 3    | Add privacy-conscious aggregate analytics and feedback channel; invite a small beta | At least 50 invited testers; a week of measured completion and return behavior         |
| 4    | Fix observed friction; prepare launch posts and editorial schedule                  | Reliable daily content pipeline, launch assets, documented metrics, and support owner  |

Treat the schedule as a planning estimate, not a commitment to growth. A solo builder should reserve time for editorial review; content is likely the largest recurring workload.

## 5. Technical release checklist

The prototype is dependency-free JavaScript with a small Node server and a tested `npm run build` static export. For a Git-connected Netlify site, use `npm run build` and publish `dist`. Static hosting supports the free games. The era trial and purchase now require the Netlify function, Supabase email/database setup, and Stripe checkout/webhook; see PREMIUM_SETUP.md. Use HTTPS for clipboard/device-sharing support. Test Chrome, Safari, and Firefox on desktop and phones, including narrow screens, zoom, keyboard-only navigation, reduced motion, and screen readers. Check the exported card in real social apps; the PNG export is implemented, but do not promise direct Instagram Stories posting without testing a supported integration.

Test new-day rollover, refresh mid-quiz, repeated clicks, blocked localStorage, sharing cancellation, clipboard denial, and completed-day reopening. The homepage and results roll over automatically; an open quiz or ask moves to the new issue on its next answer, guess, pass, or Next action after midnight Eastern, preserving yesterday’s progress separately. Add deployment smoke checks and a content validation tool before publishing larger banks.

For aggregate analytics, define `quiz_started`, `answer_submitted`, `quiz_completed`, `share_succeeded`, and `card_downloaded`, with issue ID, mode ID, and question ID where relevant. Never call a share attempt a successful share. Use an anonymous first-party identifier only if needed, minimize retention, publish a privacy notice, and review consent requirements for your markets. The current browser counters do not provide these aggregate metrics or measure next-day retention.

If adding competitive rankings, introduce server-side issue definitions, attempt validation, abuse controls, and a privacy model. LocalStorage scores are not trustworthy for competitive prizes. Add accounts only when a proven feature needs cross-device identity.

## 6. Beta measurement and decisions

Measure completion rate = completed attempts / starts. Measure next-day retention = eligible players who play on the following day / players on the starting day, with a defined anonymous measurement method. Measure share rate = successful shares / completions; track card downloads separately. Review question accuracy rates and player complaints for unclear or overly specialized content.

Initial internal decision targets: 70% completion, 15% successful share rate, and 20% next-day return among beta players. These are hypotheses, not industry benchmarks or forecasts. With small samples, show raw counts alongside percentages. If completion is low, shorten the quiz or improve question clarity; if completion is high but returns are low, improve fresh content and the daily habit. If shares are low, test result copy and card legibility before adding features.

## 7. Launch and promotion

Create original short videos using screen recordings and your own graphics: “Would your 2013 Tumblr self pass?”, “Your Directioner credentials are under review,” and “Send this to the friend who knows every receipt.” Reveal one question, invite answers, then link the daily issue. Do not reuse creator videos, songs, fan edits, or photos without appropriate permission.

Invite fandom-community moderators to review the game before posting; follow each community’s promotional rules. Start with small groups, listen to corrections, and keep a public feedback route. Publish three recurring formats per week rather than chasing every trend. Compare traffic sources and completed quizzes, not just views. No spam, unsolicited bulk messages, or fake engagement.

## 8. Era membership

Keep the main daily quiz and Anonymous Ask free. Offer all three eras for $5 USD once, after one explicit 24-hour trial per verified email account. No recurring subscription. Supabase stores access and Stripe handles checkout; signed webhooks fulfill purchases after the checkout tab closes. No payments are connected yet. Complete PREMIUM_SETUP.md, test refunds and account restoration, and set a support/refund policy before selling.

Sponsorships can fund a clearly labeled themed issue when there is measurable engaged traffic. Keep sponsor approval separate from factual answer accuracy. Offer aggregate starts, completion, and successful share counts, with the measurement definitions. Avoid intrusive ads during answers. Private party quizzes can follow if players explicitly ask for group play.

## 9. Costs and ownership

Start with low-cost static hosting, one researched domain, and free development tools. Hosting/provider pricing changes; verify actual prices before purchase. Set a spending cap before adding analytics, payments, or email tools. Assign responsibility for editorial accuracy, corrections, weekly scheduling, uptime, privacy, and customer support, even if one person owns all of them.

## Immediate next actions

1. Pull the latest GitHub changes, restart the local server, and play the main quiz, all three eras, and The Anonymous Ask on a phone and desktop.
2. Research The Fandom Files and two backup names before buying any assets.
3. Recruit 8–12 people from the intended fandom audience for observed playtests.
4. Review the nine drafted dated issues, then extend the calendar with five more sourced issues.
5. Connect the Netlify project to GitHub and deploy both `dist` and the membership function over HTTPS; test real phone audio, share sheets, and card uploads. Configure Git-connected deployment for automatic updates.
6. Add aggregate measurement and a privacy notice before public beta.
7. Use beta evidence to decide whether to shorten the game, change the content balance, or launch.
