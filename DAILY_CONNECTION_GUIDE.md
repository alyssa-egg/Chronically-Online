# Fandom Files · The Daily Connection

The new homepage leads with **The Daily Connection**: sixteen tiles, four specific connections and four allowed mix-ups. Navigation is **HOME · DAILY GAME · THE ARCHIVE · QUIZZES · ABOUT**. My Files is a secondary header/footer link. There is no article feed or daily publishing requirement.

## Assets and existing structure

This remains the existing vanilla JavaScript site, Node server, Netlify functions and Sanity Studio. No framework or package was added. The root build/start commands, Render configuration, authentication and existing payment integration are preserved.

- Installed logo: [src/assets/fandom-files-heart-logo.png](src/assets/fandom-files-heart-logo.png). The file is unchanged. It now displays its full canvas with its natural proportions, rather than using the previous cropped SVG viewport. Published original-logo uploads from Sanity still override it, also in full. No logo was generated, recolored or edited.
- Collages: [fandom years](src/assets/eras/fandom-years.jpg), [influencer era](src/assets/eras/influencer-era.jpg), [current lore](src/assets/eras/current-lore.jpg). All three files are unchanged. Existing Sanity collage updates and discovery pins remain available, including the corrected PinkPantheress pin to the left of KATSEYE.
- Headings: lowercase Helvetica Bold, with the existing Helvetica Neue/Arial system fallbacks. Secondary text: bundled [DM Sans](src/assets/fonts/dm-sans-variable.woff). No cursive font was introduced.
- Visual direction: paper and ink, the existing pink accent, washed denim, rose, folder tan and sage. Game categories have four distinct treatments and written difficulty labels. The brand image is never restyled to match a category color.

## Play and daily dates

`/play/` opens The Daily Connection. Select four tiles, then **file these four**. Correct groups become solved rows. Incorrect sets use one of four mix-ups. A repeated incorrect set is recognised without another penalty. Shuffle keeps the current selection; clear removes it. Solved tiles cannot be reused.

Four solved groups win. Four mix-ups close the file and reveal the remaining categories. Both outcomes are final for that date in the current browser. Results include actual connections filed, mix-ups, elapsed time, spoiler-free emoji/text sharing, a PNG card, and time until the next file. Category notes explain each answer and link to original references.

As explicitly chosen for this relaunch, **the new puzzle resets at each player’s local midnight**. The same calendar date maps to the same puzzle and initial tile arrangement for everyone. Different time zones can be on different calendar dates at the same instant. Next reset is constructed from the next local calendar date, including 23/25-hour daylight-saving days. The file number starts at **#001 on November 1, 2026**.

Elapsed time starts on the first tile interaction and includes time away from the page; there is no time limit. Refreshing preserves the start, solved groups and mistakes. If local midnight arrives while playing, the next date’s file opens and the earlier unfinished progress stays stored. This replaces the timed Deep Cut as the signature game; the earlier Deep Cut retains its own mandatory timer in extras.

Local storage keys are `fandom-files-connection-v1-YYYY-MM-DD` and `fandom-files-connection-history-v1`. History keeps up to 366 completed dates. Solve streaks count consecutive local dates with all four groups solved, including yesterday if today has not been solved. Missed/unsolved days end the current streak; history and longest streak stay. Device storage can be cleared or edited and is not a public competition record. The existing visit-only fallback applies when storage is blocked.

## Puzzle content and the first 28 slots

Edit **[src/connection-puzzles.json](src/connection-puzzles.json)**. This is the authoritative JSON data file, imported by the small adapter [src/connection-content.js](src/connection-content.js). Native JSON modules are used by the existing modern-browser/Node 24 stack.

There are **seven fully written sample puzzles**, not 28 completed puzzles. The schedule has **28 editable slots**. The first seven are set; later `null` slots deliberately use the seven-file rotation. The first repeat is **November 8, 2026** unless more puzzles are approved and scheduled. It is not an automatically generated content service. Write and review more before launch if you want 28 distinct days.

| Local date | Puzzle ID | Theme |
| --- | --- | --- |
| Nov 1, 2026 | `opening-the-files` | 1D albums, 5SOS members, Pure Heroine, old channel handles |
| Nov 2, 2026 | `music-and-margins` | KATSEYE, PinkPantheress, Instagram filters, AO3 ratings |
| Nov 3, 2026 | `tabs-still-open` | Beauty brands, Sister Squad, Brat, Tumblr theme code |
| Nov 4, 2026 | `saved-to-ipod` | 1989, camera apps, 5SOS’s debut, School Nights |
| Nov 5, 2026 | `new-tabs-old-habits` | BLACKPINK, Fancy That, Minecraft materials, gaming channels |
| Nov 6, 2026 | `camera-roll-2019` | Fine Line, Naked palettes, British YouTube, AO3 categories |
| Nov 7, 2026 | `the-old-fan-account` | 1D members, TV fandoms, Born to Die, The 1975 EPs |

Each `puzzles` entry has a stable `id`, `theme`, `era`, `difficulty`, and four categories. Each category has its own stable `id`, `name`, `difficulty`, exactly four `tiles`, an `explanation`, and a `source` URL. Categories are stored in Easy, Medium, Hard, Expert order. Category difficulty is editorial judgment, not measured player statistics.

To add a new day:

1. Add a complete puzzle to `puzzles`. Choose a new unique ID and four specific, defensible connections. Keep tile labels short enough for mobile.
2. Put its ID into the desired `schedule` slot (slot 0 is Nov 1), or add an explicit future date to `overrides`, e.g. `"2026-11-08": "your-real-puzzle-id"`. Use an ID you actually added; don't paste that example as a live value.
3. Keep released puzzle IDs, tile/group order and already-played schedule entries stable so browser saves stay associated with their original solution. Schedule substantial changes as new future files.
4. Run `npm test` and `npm run build`. The build fails if structural content validation fails.
5. Review the board itself. Validation checks sixteen unique tiles, four groups of four, metadata, difficulty order, schedule references and duplicates. **It cannot prove semantic uniqueness**. Check that none of the other twelve tiles also reasonably fits a group and that no alternative four-set is equally defensible.

The initial seven sets were reviewed against their stated connections. Explanations describe the exact album, lineup, platform feature or other relation rather than a subjective moodboard. They remain editable editorial content.

## Three era personality quizzes

Edit **[src/era-personality.js](src/era-personality.js)**. Each era has an eight-question multiple-choice quiz and three distinct outcomes:

- `/quizzes/fandom-personality/`: gifset romantic, fan-account historian, thirty-tab daydreamer.
- `/quizzes/influencer-personality/`: comfort-video regular, camera-roll curator, playlist rabbit hole.
- `/quizzes/current-personality/`: pop-folder archivist, group-chat lore scout, digital moodboard maker.

Choices save as you go. Results contain descriptions, a matching era link and text/native sharing. The most-selected profile wins; a tie favors the first choice if it is tied, then stable profile order. There are no right answers. All three quizzes are free, untimed and repeatable.

The older six knowledge quizzes and general personality quiz remain under **more quizzes & original games**. The five-prompt Deep Cut is at `/play/?game=open-cut`; Name That Reference, Quick Cut, ten-question quiz, Lost Post, collectibles, Sideblog, purchases and moderated Memories keep their stored progress and existing access paths. Article/news reader sections remain absent. Studio remains available for original images, discoveries and the Memories review queue.

## Build, verify and deploy

```sh
npm test
npm run check
npm --prefix studio ci --no-fund --no-audit
npm run build
npm start
```

Render keeps the same build and start commands. After the commit reaches GitHub `main`, deploy the latest commit in Render, wait for **Live**, then refresh the actual site. The Netlify build/redirect setup is retained. New modules and JSON content are included in both host allowlists and the public build.

Verify `/`, `/play/`, `/archive/`, all three `/eras/.../` pages, the three quiz detail URLs, `/my-files/` and `/admin/` on your actual host. A Git push alone is not proof that Render has deployed it. Account/payment provider settings are separate; this change does not make a charge, switch Stripe live mode, change the free Render URL or transfer browser-local records between domains.
