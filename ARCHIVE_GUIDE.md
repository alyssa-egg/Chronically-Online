# The living fandom archive

## What is playable

- **The Lost Post:** a third free daily game. Four original text artifacts form a visual moodboard; identify the reference in three guesses, recover the story, and follow a related archive folder. Existing published references rotate for 30 days without repetition, independently of Anonymous Ask. These are recreated clue cards, not screenshots of real historical posts.
- **Your Sideblog:** collect receipts for correct answers, completion stamps for finished games, and chapters for finished folders. Rename your blog, pick an unlocked theme, choose up to three stickers, pin six receipts, and export a PNG. This is a browser-local scrapbook; your email restores paid access, not your scrapbook. Keep an exported copy before clearing browser data.
- **Era collections:** 12 folders / 36 files. Fandom Years has 3 folders, YouTube has 6, Current Lore has 3. Each folder contains 3 files: matching, ordering releases, or decoding a written reference. Read the explanation after solving or revealing, then continue. Correctly solved files earn receipts; completing a folder, including revealed files, earns a chapter/theme.
- **Free samples:** one permanently free folder per era, no account needed. Other folders and classic daily five-question remixes use the existing explicit 24-hour account trial or **$5 once for all eras**. Main Daily Quiz and Anonymous Ask remain free. Paid file payloads stay on the server and use the same receipt/refund checks as existing premium quizzes.
- **Daily reset:** Quiz, Ask, Lost Post, and classic remixes refresh at midnight America/New_York, including daylight saving. Finite archive folders stay recovered and can resume between visits.

## Content and expansion

The first folders remix already-published references from the existing question bank. Era headings describe the cultural world; some crossover files include an earlier reference’s origin or a later legacy brand, with its context retained in the explanation. [ARCHIVE_REVIEW.md](ARCHIVE_REVIEW.md) lists every starter file and answer for editing. [CONTENT_ARCHIVE.md](CONTENT_ARCHIVE.md) preserves your complete wider topic brief, including Emma, gaming, beauty, SoundCloud, KATSEYE, PinkPantheress, and internet-girl culture. These new topics are not automatically approved for a daily issue.

[QUESTION_SCHEDULE.md](QUESTION_SCHEDULE.md) remains the dated daily review calendar. New ideas become drafts with source links. Quiz and Anonymous Ask share a dated issue theme. Lost Post currently uses its separate stable reference archive; theme-coordinated Lost Post editing is a future expansion, not an automatic publication feature. [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md) explains approval the day before. No automatic reminder email is sent; the existing GitHub review workflow creates a summary you can open.

## Files and operation

- Server definitions: [server/archive.mjs](server/archive.mjs). Increment a folder’s version when editing published files, so saved submissions do not apply to new questions.
- Public catalog generator exposes folder descriptions and the three free samples only. [scripts/build.mjs](scripts/build.mjs) generates its browser module; the source placeholder is intentional.
- Protected route: `GET /api/archive?id=collection-id`, using the existing Supabase session and trial/Stripe receipt checks. No new database tables or environment variables are needed.
- Gameplay: [src/archive-ui.js](src/archive-ui.js), [src/collection.js](src/collection.js), [src/lost-post.js](src/lost-post.js).
- Local collections, cosmetics and export: [src/sideblog.js](src/sideblog.js), [src/sideblog-export.js](src/sideblog-export.js).
- Existing payments: [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md) stays the single source of truth for Stripe setup and test payments. This release adds no charge or price change.

## Original concept supplied for this build

The following is preserved as a design brief. Suggestions are not all shipped: shared/community boards, licensed image/audio archives, account-synced scrapbook data, and every topic expansion remain future work. The $4.99 suggestion is superseded by your confirmed $5 price.

get what you mean. You don't want to build BuzzFeed with a Tumblr theme. You want something that feels like it was made by the girls who actually lived through the fandoms — the fan accounts, the lore, the edits, the mutuals, the inside jokes that make absolutely no sense to anyone outside the community.
I think your distinctive angle should be: internet culture as something you collect, decode, and participate in — not just read about.
Your three eras, daily quiz, Anonymous Ask, and $4.99 archive already give you the foundation. I'd make the experience feel like opening a mysterious old internet account that has been preserved just for you.
The concept: a living fandom archive
Instead of organizing everything like a media website, organize it like you're uncovering the remains of the internet.
1. Give the Moodboard Mystery a mechanic that belongs to Deep Cut
Moodboards already exist across fandom communities, and daily pop-culture puzzles are an established format. 

Tumgag
+2


 So I wouldn't rely on the moodboard aesthetic alone to distinguish your game.
I'd create a signature mode called The Lost Post.
DEEP CUT ARCHIVE / FILE 001

THE LOST POST
Somewhere on the old internet, this post existed. Can you figure out what it was about?









































Four clues. One piece of fandom history.

5 Seconds of Summer

One Direction

Tumblr fashion era

Early YouTube

Recover the post
The important part is what happens after the guess. The player doesn't just see a green checkmark. They recover a little piece of lore: why the reference matters, what era it belongs to, and what other fandom moments connect to it.
You could build the experience around three actions:
- Decode it: Solve the moodboard using visual and textual clues.
- Recover it: Reveal the context and the cultural reference.
- Go deeper: Follow a related clue into a fandom archive.
That last step makes your website feel like an interactive rabbit hole instead of a pop-culture article site.
2. Make every player leave a little piece of themselves behind
This is the creative feature I think fits your audience best: Your Sideblog.
Instead of a generic profile with an avatar and statistics, every player gradually builds a personal digital scrapbook from the things they discover.







lemon8-app.com


As players solve games, they collect:
- Receipts: Little cards for the references they've correctly identified.
- Stamps: Achievements for completing an era or solving a difficult mystery.
- Moodboards: Visual collections representing their favorite fandoms and internet eras.
- Blog themes: Custom backgrounds, stickers, borders, and decorative elements earned through play.
The twist is that their Sideblog becomes a visual representation of their internet history. Two players could complete the same games but end up with completely different-looking pages.
And they can share a screenshot of their creation with friends. That's much more personal than sharing a score alone.
3. Make the three eras feel like different worlds
Your existing structure is strong. I'd give each era its own kind of discovery:









The Fandom Years
Finish the Lore
Recover lost posts, complete iconic lyrics, recognize fan edits, and uncover the context behind legendary fandom moments.











The YouTube Era
Connect the Dots
Reconstruct creator friend groups, match clues to old videos, and connect internet moments in chronological order.











Current Lore
Chronically Online
Decode current creator communities, identify inside jokes, and solve visual mysteries based on the lore people are talking about now.



The same core game mechanics can appear in every era, but the clues, visual language, and cultural references change. That makes the archive feel curated rather than like three folders of multiple-choice questions.
4. Give the $4.99 archive a creative reward
I'd connect your paid archive to Sideblog in a way that feels meaningful.
Every completed collection adds a chapter to the player's personal archive. Finishing The 5SOS Timeline, for example, could unlock a themed set of decorations, a completion stamp, and a special moodboard template.
The purchase then gives players three things:
- Full access to all three era archives.
- More mysteries and interactive challenges to complete.
- More opportunities to build and customize their Sideblog through gameplay.
I'd keep the daily quiz and Anonymous Ask free, and let everyone try a Moodboard Mystery before deciding whether to buy.
5. The bigger brand idea
Your website shouldn't feel like a magazine that happens to have games. It should feel like a digital clubhouse for people who remember the internet's lore.
The magazine-like elements can still exist through your writing, graphics, and curated collections. But the primary experience is interactive: players solve, discover, collect, customize, and share.
I can't promise that no one has built a similar combination before, but the strongest direction to develop is this specific combination of fandom puzzles, recovered internet lore, and a personalized Sideblog.
If I were prioritizing your next build, I'd do just three things:
1. Keep your Daily Quiz and Anonymous Ask as your free daily rituals.
2. Develop The Lost Post into your signature visual puzzle.
3. Build Sideblog as the creative reward that grows with every game played.
That's a clearer identity than adding more quizzes. It's a game that lets fan girls demonstrate what they know and create something that feels like theirs.

## Collectible artifact cards and Lore Book

The Fandom Files now has fourteen collectible cards with original pixel-style SVG artwork, locked silhouettes and visible goals. The Sideblog can feature one favorite find and pin up to three cards. New unlocks reveal with a brief animation and optional original chime, with reduced motion respected. Export an individual spoiler-free badge card or your entire scrapbook. Existing local progress is migrated into eligible collectibles without resetting receipts or chapters; missing a day does not remove earned cards. The seven-day badge requires seven different completion days, not a consecutive streak.

The Lore Book turns correct-answer receipts into searchable pages, with era filters, the recovered explanation, and links to related collected pages or an era folder. It lives in the same browser as the Sideblog. A separate Redacted File game remains an experiment; the Lore Book is the selected priority from your brief. [COLLECTIBLES_BRIEF.md](COLLECTIBLES_BRIEF.md) lists what shipped. [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) covers public release, with the Stripe checklist as the source of truth for payment steps.

The website is **The Fandom Files**. The hosting URL, repository name, `deep-cut-*` local keys and `deep_cut_memberships` table retain their internal names to preserve continuity. The logo was prepared from your supplied wordmark reference; keep the original upload for an exact source-asset replacement later. No account or saved-purchase migration is required for this display-name change.
