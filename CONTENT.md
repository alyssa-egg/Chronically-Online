# Deep Cut editorial archive

The v2 archive has 48 original multiple-choice prompts, twelve per department. IDs are stable zero-based indexes in `src/game.js`. The daily game selects 3/3/2/2 questions. The selection cycles through a finite bank, not a live trend feed.

## Source checklist for review

These are reference destinations for an editor, not a claim that every linked page was fetched and checked in this task. Direct YouTube requests from the cloud machine returned a proxy 403, so recent creator details need an independent live source review before public launch. The prompts deliberately avoid private relationships, unverified drama, allegations, or fabricated quotes.

| IDs              | Topic                                             | Reference destinations / review route                                                                                                                                                               |
| ---------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–11             | Tumblr and fanfiction terminology                 | [Tumblr Help](https://help.tumblr.com/), [Fanlore](https://fanlore.org/) entries for SuperWhoLock, alternate universe, OTP, headcanon, slow burn, and blorbo                                        |
| 12–14, 18, 20–21 | One Direction formation, albums, and fan campaign | [One Direction](https://www.onedirectionmusic.com/), album liner notes/official release listings; contemporaneous reporting for the 2015 No Control campaign                                        |
| 15–17, 19        | 5SOS lineup, origins, and releases                | [5SOS official site](https://5sos.com/), official album/single credits                                                                                                                              |
| 22–23            | Ariana Grande's acting and music video            | Victorious official credits and Ariana Grande's official “thank u, next” music video                                                                                                                |
| 24–29, 34–35     | British YouTube names and fandom                  | Creator-owned channels: AmazingPhil, Daniel Howell, DanAndPhilGAMES, Zoella, ThatcherJoe, PointlessBlog, Louise Pentland; Fanlore for fandom terminology                                            |
| 30               | Troye Sivan release                               | [Troye Sivan official site](https://www.troyesivan.com/), Blue Neighbourhood official release/credits                                                                                               |
| 31–33            | Tags, conventions, collabs                        | Archived creator tag/collab videos; [VidCon official site](https://www.vidcon.com/)                                                                                                                 |
| 36–38            | Slushy Noobz / Out of Character / Vanilla Mace    | Creator-owned Slushy Noobz and Vanilla Mace channels; Out of Character official podcast listing. Vanilla Mace's first prompt is a handle recognition item; add deeper lore after live verification. |
| 39–42            | Creator podcasts and communities                  | Official Anything Goes, Very Really Good, Danny Gonzalez, and Good Mythical Morning channels/listings                                                                                               |
| 43–47            | Creator-community language                        | Contextual dictionary definitions and public usage; wording distinguishes slang from literal fact                                                                                                   |

## Updating the archive

1. Write an original prompt with one best answer, three plausible distractors, and a short explanation.
2. Record direct source URLs, the relevant public statement/release, date checked, reviewer, era, and difficulty. Prefer creator-owned sources for current facts.
3. Avoid rumors, shipping theories presented as reality, private information, and unsupported claims about what is currently viral.
4. Have a second person play and review the item. Check that the explanation answers the question precisely.
5. Maintain at least twice the daily count in each department so adjacent-day questions can stay disjoint. Keep banks at twelve questions per department for the current rotation, or rerun `npm test` and update coverage assumptions when expanding.
6. Preserve a live edition's order and content. Publish substantive edits with a new `EDITION_VERSION`; do not reuse old stored answers for changed questions.
7. Grow toward 140+ reviewed questions or dated immutable issue manifests before a broad launch. Keep a weekly editorial slot for newer creator references.

Naming note: Deep Cut, Askbox Club, Mutuals Only, and Reblog Relay are unverified candidates. Being different from Chronically Online does not establish trademark clearance. Do exact and similar-name searches in the intended markets before investing in a permanent identity.
