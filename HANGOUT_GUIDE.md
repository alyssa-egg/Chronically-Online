# Fandom Files: the smaller daily hangout

The public site focuses on **Today’s Deep Cut** (the renamed Anonymous Ask), **three era entrances**, and the original games under **more to explore**. The editorial homepage section, The Latest, article search, related stories, and music widget have been removed from the public navigation and pages.

**My Files** holds saved era discoveries and the four-stamp wall, with access to the original Sideblog and collectible cards. Existing articles and their local saved-story records have not been deleted; the public site no longer opens editorial stories. Old article links return to the dashboard.

## Era memories

**Memories** in the header/footer opens `/memories/`. Readers filter by era and send a 10–600 character memory with an optional nickname. Each era discovery page also links to its own memory wall. Submissions arrive as private Sanity drafts; **Publish** is your approval step. See [MEMORIES_GUIDE.md](MEMORIES_GUIDE.md) to open the inbox on Render and review submissions.

## Add your original logo and era collages

The four images shown in chat were visible references, but their original files were not available to the coding workspace. **They have not been replaced with generated collages or an AI-redrawn logo.** The previously installed logo remains until an original is uploaded. The new era tiles explicitly show that their collages are pending; their written discoveries work now.

Once Render deploys this code:

1. Open **your current Render URL followed by `/admin/`** and sign into your existing Sanity account.
2. Create **Original site logo**, upload your original PNG/JPG, add an accessible description, and **Publish**. Keep one published logo document.
3. Create **Era collage & discoveries**, select **the fandom years / 2010–2016**, upload your first collage, add alt text and image credit, and **Publish**.
4. Create the corresponding document for **the influencer era / 2017–2020** with your second collage, and **the current lore / 2021–now** with your third. Keep one document per era.
5. Refresh the public site. Published originals are used in the header/footer, era entrances, era pages and exported cards. No Render redeploy is needed for subsequent image changes.

The frontend reads original Sanity image-asset URLs without resize, crop, recoloring, AI processing or format conversion. The known blank canvas surrounding the supplied 1919×644 logo is framed in its layout viewport; the underlying file is unchanged. Era collages retain the whole image. Lore pins are separate links over the image, not edits to the collage. Adjust their percentage positions in **Clickable lore pins** if a pin should move.

The browser editor requires no new account, paid CMS, write token in frontend code, or additional hosting secret. The public API reads published documents only. Unpublished image drafts stay off the website.

For the scrapbook icon/window system, manual Now Playing pick, era colors and earned stamp wall, see [ASSET_SYSTEM.md](ASSET_SYSTEM.md).

## The three eras

| Era | Page | Dates |
| --- | --- | --- |
| the fandom years | `/eras/fandom-years/` | 2010–2016 |
| the influencer era | `/eras/influencer-era/` | 2017–2020 |
| the current lore | `/eras/current-lore/` | 2021–now |

Each page has four short evergreen discoveries, expandable reference files, optional collage pins, sources, browser-local saves, and links to the other eras. These are evergreen reference files. Edit the starter text in [src/era-discoveries.js](src/era-discoveries.js), or replace an era’s discoveries in Sanity.

Readers can save discoveries in **My Files**. Their previous Sideblog, receipts and collectibles remain available from My Files. These saves remain on that browser; this release does not add cross-device reading accounts.

## Today’s Deep Cut: the main clue game

The former Anonymous Ask is now **Deep Cut**, featured above the eras on the homepage. `/play/`, header/footer Play links, game-room shortcuts and era-page Deep Cut links all open this same six-clue game.

- Type the person, fandom, platform, or title hiding behind the clues.
- Six turns. Each incorrect guess or pass uses a turn and reveals the next clue. Empty and repeated guesses do not use a turn.
- A correct guess or the sixth used turn ends the round. The explanation and a spoiler-free share result follow.
- One daily reference for everyone, resetting at **midnight America/New_York**, including daylight-saving changes. The fallback archive has 30 clue sets, avoiding repeats for its full 30-day cycle. Approved dated issues can supply a themed puzzle.
- The original `deep-cut-ask-*` progress keys, aliases, reading diary, receipts, and collectible identifiers are preserved. This is a name and placement change, not a new attempt for existing players.
- Completing the puzzle earns the Deep Cut detective stamp; solving on the first clue can also earn kept the receipt. Previously earned stamps remain.
- It is free with no account required. Browser-local progress can be lost if browser data is cleared.

Edit the fallback clue sets in [src/puzzle.js](src/puzzle.js). Follow its versioning rule when changing published clues. Dated issues and day-before review still use [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md); no drafts were approved by this change.

## Quick Cut: the bonus multiple-choice game

The previous four-choice Deep Cut is preserved as **Quick Cut** under **more to explore**, at `/play/?game=quick-cut`. Its 45-question, three-era rotation, three optional hints (20 points each), local-midnight reset, result sharing and `fandom-files-deep-cut-*` saved progress remain intact. Question content is in [src/deep-cut-questions.js](src/deep-cut-questions.js). Keep IDs and published bank content stable so saved rounds keep matching. Correct answers without hints can still earn kept the receipt.

## Site editor

Open `/admin/` to manage **Era collage & discoveries** and **Original site logo**. Those published assets still appear on the game and era pages. Existing Article and Now Playing documents remain in Sanity for preservation, but are not displayed by the public game interface. The Studio title is now **The Fandom Files · Studio**.

## Existing games and purchases

The longer ten-question quiz, bonus Quick Cut, Lost Post, reading diary, free game folders, existing paid collections, Sideblog and collectible exports remain available under **more to explore**. Their progress keys, signed-in access and $5 one-time purchase are unchanged. Deep Cut, the quiz, and Lost Post reset at midnight Eastern; Quick Cut has its separately labelled local-midnight schedule.

No new monetization infrastructure was added. An existing player’s paid game collections remain available. New public era discovery pages are free and distinct from the existing paid game collections. Payment launch instructions remain in [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md).

## Typography and deployment

Primary headings use lowercase **Helvetica Bold**, with Helvetica Neue / Arial fallbacks for devices without Helvetica. Exact cross-platform Helvetica needs an owner-supplied licensed webfont. Secondary headings, body text and interface labels use locally bundled **DM Sans**. Annotation labels and notes also use DM Sans; the handwriting font has been retired.

GitHub commits and Render deployment are separate steps. In Render, deploy the latest `main` commit. Keep the build command `npm --prefix studio ci --no-fund --no-audit && npm run build` and start command `npm start`. A local build does not establish a live deployment. See [RENDER_MIGRATION.md](RENDER_MIGRATION.md) for hosting, the free Render address, and domain-dependent sign-in/payment settings.
