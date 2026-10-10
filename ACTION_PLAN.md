# LoreDial: product and launch action plan

## 1. Positioning and naming

**Pitch:** “Your daily pop quiz in fandom lore. Were you there, or did you just like the post?”

Make the niche explicit: Tumblr-era fandom, One Direction, Ariana-era pop culture, stan vocabulary, and current internet references. Invite people who missed an era as well as people who remember it. Explanations should make a wrong answer entertaining rather than embarrassing.

LoreDial connects internet lore with dial-up nostalgia. Alternatives for research: Reblog Relay and Fandom Frequency. None are cleared names. A “copyright-free name” cannot be guaranteed: short names are generally a trademark question, while code, illustrations, and writing involve copyright. Before buying branding or a domain, search the exact name, close spellings, app stores, social handles, web results, and trademark databases in target markets. Have a qualified professional assess conflicting marks before investing. Use a temporary working identity until clearance.

The distinct visual direction is magazine departments, serif cover headlines, lavender browser chrome, pink graph paper, and lime stickers. Avoid copying BuzzFeed layouts, typography, logos, question text, or proprietary result language. This prototype uses CSS artwork, symbols, and original quiz wording. Use neutral public facts; artist and platform names do not imply endorsement.

## 2. Scope for the first release

Keep one free ten-question issue each day. Four recurring departments give the product a recognizable rhythm. Ship homepage → quiz → explanations → score → share → tomorrow reminder. Keep five result tiers: Has Wi-Fi (0–2), Casual Scroller (3–4), Certified Online (5–7), Lore Archivist (8–9), Internet Final Boss (10). No account requirement.

Before a public release, expand from 20 questions to at least 140 fact-checked questions or prepare 14 manually curated issues. The current seeded daily selector is suitable for demonstration, but it repeats questions and cannot guarantee every day feels fresh. Replace it with dated editorial issue manifests for release. Keep archival issues immutable so shared results stay comparable. Version questions and issue IDs whenever answers change.

Do not add payments, a public leaderboard, multiplayer, or user-submitted content before validating the core loop. Text-based music clues are enough. Licensed audio can come later if there is a clear benefit and budget.

## 3. Editorial system

Prepare a spreadsheet with ID, department, prompt, four choices, correct answer, explanation, source URLs, source dates, era, difficulty, author, reviewer, and rights notes. Check every fact against an original source where possible; otherwise use two credible independent sources. Avoid presenting rumors, shipping theories, private information, or allegations as facts.

Suggested daily balance: three archival fandom questions, three pop/stan questions, two recent language or meme questions, and two deep cuts. Start with four easy, four medium, and two hard questions. Rotate fandoms so non-fans can still finish. For current memes, review weekly, timestamp the reference, and avoid “everyone is doing this” claims without evidence. Give ambiguous slang enough context for exactly one best answer.

Example tone: “Your fandom degree finally pays off.” Answer feedback should teach the reference in one sentence, not shame the player. Use harmless self-deprecating humor and avoid diagnosing players or targeting creators.

Run a weekly content review: draft 30 questions Monday; fact-check and edit Tuesday; playtest Wednesday; schedule Thursday; review performance Friday. Archive corrections and disclose meaningful errors. Retire items with disputed answers rather than silently changing already completed issues.

## 4. Four-week execution schedule

| Week | Work | Deliverable / exit condition |
| --- | --- | --- |
| 1 | Name research, audience interviews, 40 original questions, mobile playtests | 8–12 testers can complete the prototype; document confusion and sharing friction |
| 2 | Expand content, choose hosting, test production sharing, improve accessibility | 14 curated issues; keyboard and phone checks pass; HTTPS deployment responds correctly |
| 3 | Add privacy-conscious aggregate analytics and feedback channel; invite a small beta | At least 50 invited testers; a week of measured completion and return behavior |
| 4 | Fix observed friction; prepare launch posts and editorial schedule | Reliable daily content pipeline, launch assets, documented metrics, and support owner |

Treat the schedule as a planning estimate, not a commitment to growth. A solo builder should reserve time for editorial review; content is likely the largest recurring workload.

## 5. Technical release checklist

The prototype is dependency-free JavaScript with a small Node server. A static host is also suitable because no application backend is needed yet. Use HTTPS for clipboard/device-sharing support. Test Chrome, Safari, and Firefox on desktop and phones, including narrow screens, zoom, keyboard-only navigation, reduced motion, and screen readers. Check the exported card in real social apps; add a PNG export before promising one-click Instagram Stories uploads.

Test new-day rollover, refresh mid-quiz, repeated clicks, blocked localStorage, sharing cancellation, clipboard denial, and completed-day reopening. The current daily issue is chosen at load; decide whether to retain that issue during a session crossing midnight. Add deployment smoke checks and a content validation tool before publishing larger banks.

For aggregate analytics, define `quiz_started`, `answer_submitted`, `quiz_completed`, `share_succeeded`, and `card_downloaded`, with issue ID and question ID where relevant. Never call a share attempt a successful share. Use an anonymous first-party identifier only if needed, minimize retention, publish a privacy notice, and review consent requirements for your markets. The current browser counters do not provide these aggregate metrics or measure next-day retention.

If adding competitive rankings, introduce server-side issue definitions, attempt validation, abuse controls, and a privacy model. LocalStorage scores are not trustworthy for competitive prizes. Add accounts only when a proven feature needs cross-device identity.

## 6. Beta measurement and decisions

Measure completion rate = completed attempts / starts. Measure next-day retention = eligible players who play on the following day / players on the starting day, with a defined anonymous measurement method. Measure share rate = successful shares / completions; track card downloads separately. Review question accuracy rates and player complaints for unclear or overly specialized content.

Initial internal decision targets: 70% completion, 15% successful share rate, and 20% next-day return among beta players. These are hypotheses, not industry benchmarks or forecasts. With small samples, show raw counts alongside percentages. If completion is low, shorten the quiz or improve question clarity; if completion is high but returns are low, improve fresh content and the daily habit. If shares are low, test result copy and card legibility before adding features.

## 7. Launch and promotion

Create original short videos using screen recordings and your own graphics: “Would your 2013 Tumblr self pass?”, “Your Directioner credentials are under review,” and “Send this to the friend who knows every receipt.” Reveal one question, invite answers, then link the daily issue. Do not reuse creator videos, songs, fan edits, or photos without appropriate permission.

Invite fandom-community moderators to review the game before posting; follow each community’s promotional rules. Start with small groups, listen to corrections, and keep a public feedback route. Publish three recurring formats per week rather than chasing every trend. Compare traffic sources and completed quizzes, not just views. No spam, unsolicited bulk messages, or fake engagement.

## 8. Monetization after retention

Keep daily play free. First test one optional themed pack at $3 after beta players demonstrate return behavior and request more content. Show what the pack contains before checkout. Use a reputable payment provider; calculate fees, refunds, tax obligations, and support effort before pricing. 1,000 sales at $3 is $3,000 gross, not profit or a prediction.

Sponsorships can fund a clearly labeled themed issue when there is measurable engaged traffic. Keep sponsor approval separate from factual answer accuracy. Offer aggregate starts, completion, and successful share counts, with the measurement definitions. Avoid intrusive ads during answers. Private party quizzes can follow if players explicitly ask for group play.

## 9. Costs and ownership

Start with low-cost static hosting, one researched domain, and free development tools. Hosting/provider pricing changes; verify actual prices before purchase. Set a spending cap before adding analytics, payments, or email tools. Assign responsibility for editorial accuracy, corrections, weekly scheduling, uptime, privacy, and customer support, even if one person owns all of them.

## Immediate next actions

1. Run the prototype and play it on a phone and desktop.
2. Research LoreDial and two backup names before buying any assets.
3. Recruit 8–12 people from the intended fandom audience for observed playtests.
4. Write and fact-check the first 14 curated daily issues.
5. Choose a host and deploy over HTTPS; test actual sharing and card uploads.
6. Add aggregate measurement and a privacy notice before public beta.
7. Use beta evidence to decide whether to shorten the game, change the content balance, or launch.
