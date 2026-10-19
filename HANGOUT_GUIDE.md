# Fandom Files: the smaller daily hangout

The homepage now focuses on **Today’s Deep Cut**, **three era entrances**, and **The Latest**. It reuses the existing site, Sanity editor, reader, saved stories and game collections.

## Add your original logo and era collages

The four images shown in chat were visible references, but their original files were not available to the coding workspace. **They have not been replaced with generated collages or an AI-redrawn logo.** The previously installed logo remains until an original is uploaded. The new era tiles explicitly show that their collages are pending; their written discoveries work now.

Once Netlify publishes this code:

1. Open **https://fandomfiles.netlify.app/admin/** and sign into your existing Sanity account.
2. Create **Original site logo**, upload your original PNG/JPG, add an accessible description, and **Publish**. Keep one published logo document.
3. Create **Era collage & discoveries**, select **the fandom years / 2010–2016**, upload your first collage, add alt text and image credit, and **Publish**.
4. Create the corresponding document for **the influencer era / 2017–2020** with your second collage, and **the current lore / 2021–now** with your third. Keep one document per era.
5. Refresh the public site. Published originals are used in the header/footer, era entrances, era pages and exported cards. No Netlify redeploy is needed for subsequent image changes.

The frontend reads original Sanity image-asset URLs without resize, crop, recoloring, AI processing or format conversion. The known blank canvas surrounding the supplied 1919×644 logo is framed in its layout viewport; the underlying file is unchanged. Era collages retain the whole image. Lore pins are separate links over the image, not edits to the collage. Adjust their percentage positions in **Clickable lore pins** if a pin should move.

The browser editor requires no new account, paid CMS, write token in frontend code, or additional Netlify secret. The public API reads published documents only. Unpublished image drafts stay off the website.

For the scrapbook icon/window system, manual Now Playing pick, era colors and earned stamp wall, see [ASSET_SYSTEM.md](ASSET_SYSTEM.md).

## The three eras

| Era | Page | Dates |
| --- | --- | --- |
| the fandom years | `/eras/fandom-years/` | 2010–2016 |
| the influencer era | `/eras/influencer-era/` | 2017–2020 |
| the current lore | `/eras/current-lore/` | 2021–now |

Each page has four short evergreen discoveries, expandable reference files, optional collage pins, sources, browser-local saves, related published articles, and links to the other eras. These are starter editorial files, not breaking news. Edit the starter text in [src/era-discoveries.js](src/era-discoveries.js), or replace an era’s discoveries in Sanity. Related article queries include the earlier `2017-2019` and `2020-now` tags so existing articles remain discoverable. Those legacy ranges are retained, not silently redated.

Readers can save discoveries and stories in **My Files**. Their previous Sideblog, receipts and collectibles remain available from My Files. These saves remain on that browser; this release does not add cross-device reading accounts.

## Today’s Deep Cut

Open `/play/` or the featured homepage activity.

- One question and four choices; one answer locks the round.
- Three optional clues, costing 20 points each. A correct answer starts at 100; a wrong answer scores 0 and still opens the explanation.
- Progress and completed answers persist in the browser, including after refresh. Closing the tab does not create another attempt.
- The new game uses the **visitor’s local calendar date** as requested in the new brief. A prepared 45-question rotation alternates the three eras and avoids a repeated question within its full 45-day cycle. Refreshing does not select a new question. The labels distinguish archive rotation from new editorial publication.
- Results can be shared without revealing the answer, with a link back to `/play/` and a link to the question’s era.
- Play remains free with no sign-in. Browser storage restrictions or deleting browser data can remove local progress; there is no server-enforced competition or shared leaderboard.

Question content is separate from the layout in [src/deep-cut-questions.js](src/deep-cut-questions.js). Each entry contains a stable ID, era ID, prompt, correct answer, three alternatives, three clues and an explanation. Append new questions deliberately; changing the bank changes the future rotation. Keep IDs and published content stable so saved rounds continue to match. The existing dated ten-question quiz approvals still use [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md); none of those drafts were approved by this change.

## The Latest and the radar

Keep using **Article → Write / Preview / Publication → Publish** in Sanity. Published articles appear newest first with their own dates. A weekly or occasional editorial drop is enough; the archive and daily game work without a new story.

To feature an artist, song or reference in the small radar section, turn on **Currently on our radar** on its article and optionally write a short **Radar note**. Only published, date-eligible articles appear there. With no curated picks, the radar section is omitted. There is no scraped trend feed or automatically generated news.

For a Group Chat question, use an article’s existing **Interactive extras → A question for the group chat**. Choices are saved in the visitor’s browser and explicitly carry **no public vote totals**. Shared voting needs a future backend; this release does not invent live community results.

## Existing games and purchases

The longer ten-question quiz, Anonymous Ask, Lost Post, reading diary, free game folders, existing paid collections, Sideblog and collectible exports remain available under **more to explore**. Their progress keys, signed-in access and $5 one-time purchase are unchanged. The original daily games still reset at midnight Eastern; Today’s Deep Cut has its separately labelled local-midnight schedule.

No new monetization infrastructure was added. An existing player’s paid game collections remain available. New public era discovery pages are free and distinct from the existing paid game collections. Payment launch instructions remain in [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md).

## Typography and deployment

Primary headings use lowercase **Helvetica Bold**, with Helvetica Neue / Arial fallbacks for devices without Helvetica. Exact cross-platform Helvetica needs an owner-supplied licensed webfont. Secondary headings, body text and interface labels use locally bundled **DM Sans**. Handwritten annotations remain intentional scrapbook accents.

GitHub commits and Netlify publishing are separate steps. The last checked live site was serving older assets: the DM Sans file returned 404. The application builds locally, but that does not prove Netlify has deployed it. In Netlify, check **Fandomfiles → Deploys** and verify the latest commit. If builds fail, use the actual deployment error to diagnose them. The committed build command installs Studio dependencies, builds `dist`, and includes server functions. Do not use a static drag-and-drop deployment for the payment backend.
