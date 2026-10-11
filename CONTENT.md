# Deep Cut editorial archive

New dated drafts are in `content/issues/`, reviewed in [QUESTION_SCHEDULE.md](QUESTION_SCHEDULE.md). The October 11–19 drafts broaden beauty YouTube, Emma Chamberlain, gamer creators, Enya/Drew, Wildflower and internet-girl culture, followed by KATSEYE, PinkPantheress and classic fangirl pop. Main questions and Anonymous Ask share a theme. Only explicitly approved issues publish; see [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md). Draft sources still need checking because external source requests returned proxy 403. Optional local images require alt text, credits and appropriate usage rights.

The archive below is the fallback for missing or unapproved dated issues. Premium era pools remain server-side in the website build.

The v4 archive contains **150 original multiple-choice prompts** in `src/questions.js`. Each has a stable group/index ID, four choices, one best answer, and an explanation. Scheduling is in `src/game.js`; saved progress is versioned. The Eastern calendar day (`America/New_York`) selects the same questions for everyone.

| Exclusive pool         | Questions | Daily selection | ID prefixes                                            |
| ---------------------- | --------: | --------------: | ------------------------------------------------------ |
| Main quiz: dashboard   |        18 |               3 | `daily-dashboard-`                                     |
| Main quiz: band files  |        18 |               3 | `daily-band-`                                          |
| Main quiz: YouTube     |        12 |               2 | `daily-youtube-`                                       |
| Main quiz: new lore    |        12 |               2 | `daily-modern-`                                        |
| The Tumblr Years       |        30 |               5 | `tumblr-dashboard-`, `tumblr-band-`, `tumblr-youtube-` |
| YouTube Was Everything |        30 |               5 | `youtube-archive-`                                     |
| The New Lore           |        30 |               5 | `modern-archive-`                                      |

A fixed shuffled order supplies sequential daily blocks. The pools are exclusive, and no question repeats within any six-day window, including a cycle boundary. All 150 are covered across all four modes in six days. The seventh day cycles back to earlier questions, with newly shuffled answer positions. New wording is not authored automatically; a long-term daily product needs ongoing editorial work. Related artists/topics can appear in different modes even though the prompts and facts differ.

`src/puzzle.js` contains **30 original Anonymous Ask puzzles**, each with six clues, one reference answer, and common accepted aliases. The date selects a reference without repeating for 30 days. A wrong guess or pass consumes a turn; empty and duplicate guesses do not. Revise `PUZZLE_VERSION` when changing a published clue archive. The last clue intentionally makes the answer accessible; a six-turn solve still counts.

## Source checklist for review

These are reference destinations for an editor, not a claim that every linked page was fetched and checked in this task. Direct YouTube requests from the cloud machine returned a proxy 403 during the earlier setup. Recent creator details need an independent live source review before public launch. The prompts avoid private relationships, unverified drama, allegations, and fabricated quotes.

| Topics                                                    | Review route                                                                                                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tumblr, fanfiction terminology, SuperWhoLock, conventions | [Tumblr Help](https://help.tumblr.com/), [Fanlore](https://fanlore.org/); archived contemporary reporting for DashCon and the shoelace joke                                           |
| TV fandoms, characters, actors                            | Official BBC/CW/Nickelodeon cast and episode credits; distinguish fandom pairing names from claims about real relationships                                                           |
| One Direction, 5SOS, solo releases, Ariana Grande         | [One Direction](https://www.onedirectionmusic.com/), [5SOS](https://5sos.com/), official release/track listings, album liner notes, music videos, contemporary tour reporting         |
| British YouTube identities, books, tours, collaborations  | Creator-owned channels and archived videos; publisher book catalogs and official tour listings                                                                                        |
| YouTube series, makeup videos, formats, conventions       | Original creator uploads; official BuzzFeed/Smosh channels; [VidCon](https://www.vidcon.com/) event history                                                                           |
| Slushy Noobz, Out of Character, Emergency Intercom        | Creator-owned channels and official podcast listings; keep older facts explicitly dated                                                                                               |
| Podcasts, fan community names, creator brands             | Creator-owned websites/channels and official podcast/brand listings: Broski Report, Very Really Good, Anything Goes, Two Idiot Girls, Holo Taco, r.e.m. beauty, Rare Beauty, rhode    |
| Community vocabulary                                      | Contextual dictionary definitions and public usage; slang questions describe usual meaning rather than asserting one universal definition                                             |
| Anonymous Ask clues                                       | Review every clue against creator-owned biographies, release listings, book catalogs, platform histories, and the sources above; check accepted aliases against likely player answers |

Vanilla Mace remains part of the intended New Lore editorial direction. The former handle-recognition question was removed because it effectively gave away its own answer. Add specific, deeper references only after checking the original public uploads; this build does not invent that lore.

## Updating the archive

1. Write an original prompt with one best answer, three plausible distractors, and a short explanation. Mix releases, public moments, usernames, platform history, and fandom vocabulary rather than repeated versions of the same fact.
2. Record direct source URLs, the relevant public statement/release, date checked, reviewer, era, and difficulty. Prefer creator-owned sources for current facts.
3. Avoid rumors, shipping theories presented as reality, private information, and unsupported claims about what is currently viral.
4. Have a second person play and review the item. Check explanation precision, distractors, difficulty, and near-duplicate facts. For asks, test likely aliases and clue progression.
5. Keep each pool at a multiple of its daily count and at least six times that count to retain the six-day promise. Current pools are exactly six times their daily counts. Update coverage tests and advertised cycle length when expanding.
6. Preserve a live edition's IDs/order/content. Publish substantive edits with a new version; do not reuse old saved attempts for changed questions or clues.
7. Maintain a weekly editorial slot for newer references. Longer-term, dated immutable issue manifests allow deliberate variety and truly new daily content.

Naming note: Deep Cut remains a working name. Being different from Chronically Online does not establish trademark availability; exact and similar-name research remains part of launch preparation.
