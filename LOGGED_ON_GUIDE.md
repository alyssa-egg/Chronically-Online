# Fandom Files — You Just Logged On

## The chosen direction

Fandom Files’ signature experience is now a **short daily internet simulator**, told through a fictional group chat. “The Internet Time Machine” supplies the era; **You Just Logged On** is the player-facing name. Players make six decisions, investigate a few receipts, and leave with an online alter ego.

The return loop is: the same daily situation → different choices → a personal ending card → friends comparing who they became → replaying for another ending → tomorrow’s situation. Mara, Jo and Bee recur across episodes so the cast, filenames and little disasters can become familiar inside jokes. This release concentrates on that one loop. Earlier games remain available as extras.

## What is playable

- Six decisions per run, with real branching scenes and replies. The first choice leads to three different scenes; later decisions take a paper-trail route or a rumor route. Opening the dashboard as an action opens that actual in-game app.
- A desktop with **group chat**, **dashboard**, and a **receipts folder**. The chat retains the selected path’s messages and your replies.
- Four original fictional artifacts per episode. Investigate any three. Actual recovered evidence unlocks specific replies; a high meter alone cannot unlock them. Reopening a saved receipt costs nothing.
- Three bounded **vibe meters**: chaos, lore and mutual trust. They describe the story you made; there is no correctness grade, public rank or best possible score.
- Six reachable endings in every episode, including two secret endings. Each has a different authored “morning after” message from a fictional mutual, reflecting your role in that episode. The collection records endings actually found on completed runs. Four secret stamps come from actual actions, not fabricated rarity or global statistics.
- Daily local-midnight rotation, saved mid-story progress, a first daily ending, a genuine completion streak, and replay/visit saves separated from the daily file.
- Copied ending text with an enduring exact-episode link, plus a PNG ending card using the installed logo at its original proportions.
- Responsive controls, keyboard-operated app tabs, announced evidence reveals, optional original synthesized sounds and reduced-motion support.

All characters, posts, chats, incidents, channel names and situations are fictional. Real music/creator references establish the era’s atmosphere, not purported real quotes or scandals. Nothing a player chooses posts to a real account. The game has no live participants, public votes or story leaderboards.

## Starter season

| Episode ID | Setting | Situation |
| --- | --- | --- |
| `the-cropped-clip` | September 2014 | A fan page’s cropped sleeve becomes a whole investigation. |
| `theme-emergency` | November 2012 | A sideblog seems to disappear just before the fan project launches. |
| `edit-credit` | July 2016 | Two exports of one collaborative fan edit acquire two competing stories. |
| `the-missing-upload` | August 2018 | A fictional coffee vlog’s blank slot creates a breakfast emergency. |
| `midnight-somewhere` | October 2020 | A listening-party screenshot loses its time-zone label. |
| `the-wrong-queue` | June 2024 | A fictional concert presale turns out to involve a tote bag. |
| `soft-launch` | February 2025 | A fan-page theme preview becomes an imaginary collaboration. |

There are **seven authored episodes**, with a fixed **seven-day starter rotation**. This is not an unlimited stream of fresh stories; the season repeats until more reviewed episodes are scheduled. The atmosphere changes by era, while the cast and the underlying six-decision format stay familiar.

## Daily, replay and friend links

The previously selected **each player’s local midnight** rule is retained. Players on the same local calendar date receive the same episode. An open run retains its original date; an unopened intro and homepage refresh after midnight. Revisiting `/play/` after midnight opens the new day’s file.

The first normal completion of a daily file is kept. **Replay for another ending** creates a separate save and leaves that daily result/streak alone. My Files and Profile show the new story collection separately from the earlier game scores. All new story progress is browser-local and can be lost if browser storage is cleared; it is not authenticated or tamper-proof.

Sharing text produces `/play/?episode=the-cropped-clip` (or another episode ID). A friend can open the exact same authored episode on a later date, without guessing a daily date or receiving a claimed score in the URL. Episode visits and replays are labelled and do not count as a daily completion. Reopening a visited episode resumes that visitor’s own save; the replay button starts a fresh route. This supports informal ending comparisons, not verified competitive results.

## Editing and adding episodes

[src/logged-on-content.js](src/logged-on-content.js) is the code-editable story bank. The existing Sanity dashboard still manages its earlier content/images; it does not edit these stories yet.

Each episode supplies a year, month, era, title, setup, original chat copy, evidence texts/reactions and a resolution. The shared scene builder defines the branching graph. Choices have stable IDs, reply text, a tone, bounded meter changes, an optional evidence requirement, flags and the next scene. No AI generation or external API supplies live story content.

1. Write an original, clearly fictional situation. Use benign fandom/music references as atmosphere. Avoid invented claims about real creators, private individuals or actual fan accounts.
2. Make each choice produce a fitting reaction or consequence. Keep messages short enough for the phone chat. The original, timestamp, draft and pinned note should genuinely clarify the situation.
3. Preserve released episode/choice IDs and their meaning so saved action histories remain interpretable. Each route must reach an ending after six decisions. Evidence must never be necessary merely to finish.
4. Append a new episode with a new ID. Keep the published `loggedOnRotation` order unchanged; it selects past dailies too.
5. Schedule new episodes in `loggedOnOverrides` **for future dates only**, for example `'2026-12-01': 'new-episode-id'`. Do not replace a date people have already started. Review each future episode’s choices, character voices, receipts and all endings before scheduling it.
6. Run `npm test`, `npm run check` and `npm run build`. The bank validator checks scene structure, requirements, bounded effects and the daily schedule. Tests exercise all six endings across every starter episode and enumerate all ungated routes of the starting episode.

Endings and their conditions live in [src/logged-on.js](src/logged-on.js). **Mastermind** needs a private route, connected metadata, archived receipts, high lore and low chaos. **Offline legend** needs helping Bee and logging off with low chaos. The other four follow chaos, lore, mutual trust or a quieter mixed path. These are story roles, not moral grades.

## Preserved site and deployment

The installed logo image and the three era collage files are unchanged. Main display headings keep lowercase Helvetica Bold; secondary text/headings use DM Sans. No image generation, replacement logo, licensed song clip or copied platform screenshot was introduced. Original era archives, Memories, quizzes, purchases, sign-in, admin and earlier saves remain available.

| Route | Experience |
| --- | --- |
| `/play/` | Daily You Just Logged On episode |
| `/play/?episode=EPISODE_ID` | Exact authored episode, independently saved visit/replay |
| `/play/?game=daily-file` | Earlier three-round Decode/Rewind/Soundtrack daily |
| `/play/?mode=decode` / `rewind` / `soundtrack` | Earlier single-mode practice |
| `/play/?game=capsule` | Earlier five-round Time Capsule |
| `/infinite/`, `/challenge/`, `/leaderboard/` | Earlier Time Capsule systems; not simulator records |
| `/profile/`, `/my-files/` | New story collection plus earlier personal records |

No payment logic, keys, webhook, deployment command or production database schema changed. The new files are on the Node and static-build public allowlists. No dependency was added. The existing optional Supabase game integration still serves the earlier Time Capsule; it does not sync story progress or story rankings.

New files: `src/logged-on-content.js`, `src/logged-on.js`, `src/logged-on-ui.js`, `src/logged-on.css`, and `tests/logged-on.test.js`. Reusable setup and hosting commands are unchanged.

## What to focus on next

Play the first week with a small group and ask which replies they wanted, which characters they remember, and which ending they actually shared. Strengthen the writing and expand the authored season around those reactions. A longer story calendar and an editor-facing approval screen would support a sustained daily release. Exact-episode sharing already works; account syncing or communal voting would require a versioned backend integration and real provider testing before being advertised.
