# Fandom Files: the smaller daily hangout

The public site focuses on **Today’s Deep Cut**, **three era entrances**, and the original games under **more to explore**. The editorial homepage section, The Latest, article search, related stories, and music widget have been removed from the public navigation and pages.

**My Files** holds saved era discoveries and the four-stamp wall, with access to the original Sideblog and collectible cards. Existing articles and their local saved-story records have not been deleted; the public site no longer opens editorial stories. Old article links return to the dashboard.

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

## Today’s Deep Cut

Open `/play/` or the featured homepage activity.

- One question and four choices; one answer locks the round.
- Three optional clues, costing 20 points each. A correct answer starts at 100; a wrong answer scores 0 and still opens the explanation.
- Progress and completed answers persist in the browser, including after refresh. Closing the tab does not create another attempt.
- The new game uses the **visitor’s local calendar date** as requested in the new brief. A prepared 45-question rotation alternates the three eras and avoids a repeated question within its full 45-day cycle. Refreshing does not select a new question. The labels distinguish archive rotation from new editorial publication.
- Results can be shared without revealing the answer, with a link back to `/play/` and a link to the question’s era.
- Play remains free with no sign-in. Browser storage restrictions or deleting browser data can remove local progress; there is no server-enforced competition or shared leaderboard.

Question content is separate from the layout in [src/deep-cut-questions.js](src/deep-cut-questions.js). Each entry contains a stable ID, era ID, prompt, correct answer, three alternatives, three clues and an explanation. Append new questions deliberately; changing the bank changes the future rotation. Keep IDs and published content stable so saved rounds continue to match. The existing dated ten-question quiz approvals still use [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md); none of those drafts were approved by this change.

## Site editor

Open `/admin/` to manage **Era collage & discoveries** and **Original site logo**. Those published assets still appear on the game and era pages. Existing Article and Now Playing documents remain in Sanity for preservation, but are not displayed by the public game interface. The Studio title is now **The Fandom Files · Studio**.

## Existing games and purchases

The longer ten-question quiz, Anonymous Ask, Lost Post, reading diary, free game folders, existing paid collections, Sideblog and collectible exports remain available under **more to explore**. Their progress keys, signed-in access and $5 one-time purchase are unchanged. The original daily games still reset at midnight Eastern; Today’s Deep Cut has its separately labelled local-midnight schedule.

No new monetization infrastructure was added. An existing player’s paid game collections remain available. New public era discovery pages are free and distinct from the existing paid game collections. Payment launch instructions remain in [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md).

## Typography and deployment

Primary headings use lowercase **Helvetica Bold**, with Helvetica Neue / Arial fallbacks for devices without Helvetica. Exact cross-platform Helvetica needs an owner-supplied licensed webfont. Secondary headings, body text and interface labels use locally bundled **DM Sans**. Annotation labels and notes also use DM Sans; the handwriting font has been retired.

GitHub commits and Render deployment are separate steps. In Render, deploy the latest `main` commit. Keep the build command `npm --prefix studio ci --no-fund --no-audit && npm run build` and start command `npm start`. A local build does not establish a live deployment. See [RENDER_MIGRATION.md](RENDER_MIGRATION.md) for hosting, the free Render address, and domain-dependent sign-in/payment settings.
