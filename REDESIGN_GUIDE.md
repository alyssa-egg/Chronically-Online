# Fandom Files · The Internet Archive redesign

The redesign updates the existing vanilla JavaScript / Node / Netlify project. The existing Sanity editor remains at **https://fandomfiles.netlify.app/admin/** with project **rjg4g3cl**, dataset **production**. No replacement site, framework migration, new payment flow, or new runtime dependency was introduced.

## The magazine cover

- A hot-pink-and-black masthead, pixel-heart signature, compact desktop navigation, and a keyboard/touch mobile menu.
- The **YOU HAD TO BE THERE.** cover, with original camera, burned-CD, MP3-player, browser-window, ticket and photo-strip illustrations. These are coded graphics rather than celebrity photographs or borrowed stock images.
- A looping culture ticker with a pause/resume control, paused keyboard interaction, and static presentation for reduced motion.
- **Latest Files / Freshly Uncovered** uses real published Sanity articles. The leading story, secondary image treatment, and compact third file give the feed different compositions. An empty archive gets a first-issue placeholder; no invented articles, dates, or authors were published.
- Five clickable folder designs: **The Fandom Years**, **Music Lore**, **Creator Culture**, **Style Files**, and **Internet Mysteries**.
- A free game room with the Daily Quiz and Anonymous Ask in equal-sized panels, the Lost Post, saved activity, collectible goals, the Sideblog, and the reading diary. The classic paid era games remain in their own drawer with clear free-folder/trial/$5-once copy.
- Paper cream reading surfaces, small mint/lilac accents, black text, pixel shadows, original cursor/stars, and licensed handwriting served as a compressed WOFF font. Body and control text remains readable; illustrations have no fake interactive controls.

## The searchable cabinet

**https://fandomfiles.netlify.app/archive/** supports category, era and editorial-format filters, featured/recent ordering, and text search across title, subtitle, excerpt, tags and article body. Search runs in Sanity against published articles rather than a decorative local list. Pages contain 24 matching results; **Open more files** continues through the archive, including articles beyond the first page. Direct links retain filters across reloads. Existing `/?desk=...` routes still work.

The new **Archive folder** and optional **Internet era** fields live alongside the original editorial-format field; they do not rename or delete existing categories. Old articles without an archive folder retain a desk-based default:

| Existing editorial desk | Default subject folder |
| --- | --- |
| The Lore Files | The Fandom Years |
| The Culture Desk | Music Lore |
| The Moodboard Department | Style Files |
| The Rabbit Hole | Internet Mysteries |
| The Group Chat | Creator Culture |

Set an explicit archive folder when another subject fits better. No existing article data was migrated or overwritten. Missing era fields appear in “Every era”; the owner can add an era in the editor.

## Write, preview and publish

Read [BLOG_GUIDE.md](BLOG_GUIDE.md), or:

1. Sign in at `/admin/` with the Sanity account connected to your project.
2. Create/edit an **Article**. Fill in the original writing fields, plus an optional subtitle, archive folder, and era.
3. Add **Editorial side note** blocks in the body for highlighted annotations. Quotes, images/captions, sources, timelines, moodboard objects, related articles, and personal polls remain available.
4. Switch to the document’s **Preview** tab. It renders the current editor document with the same article template as the public reader. The draft stays in your authenticated Studio; the public API still returns only published, due articles. Preview has no payment actions or reader storage writes, and voting/sharing/saving controls are disabled or hidden.
5. Publish when you approve the story. Refresh the website to see it; no Netlify redeploy is required for article changes.

The preview shows the current body and interactive extras. Reference links to related articles use published, resolved article data on the public page; draft reference IDs are not invented into story cards. Sanity account authentication and project roles still control editing. No write token is bundled or added to Netlify for article reads.

## Preserved behavior and limitations

The following remain intact: ten-question quiz, six-turn Ask, four-clue/three-guess Lost Post, all twelve era folders/36 files, three free sample folders, classic five-question remixes, hints/reveals/scoring, original sound and mute, share/download actions, fourteen badges and their unlock rules, Lore Book, receipt/stamp/chapter collection, themes/pins, local reading diary, Eastern midnight/DST resets, and existing browser progress/storage keys.

The report card, Sideblog PNG and collectible PNG now use the new masthead/pixel-heart and palette. Earned Sideblog themes remain selectable; their personalized colors are retained. The default paper theme receives the new cream/black treatment.

Authentication, Supabase tables, Stripe API/session parameters, account-link fields, receipt/refund checks, signed webhook, and the explicit one-time 24-hour trial are unchanged. Membership is **$5 USD once**, not a subscription. The live configuration was still in **Stripe test mode** before the redesign. Payment launch remains documented only in [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md); these tests do not establish a real successful charge.

Story saves, polls, game progress, Sideblog data and diary remain browser-local. Paid access alone follows the verified email account between devices. Polls have no shared vote totals. No newsletter/social links, reader-submission service or public comments were invented. No dated question drafts were approved or changed. The production Sanity article dataset had no published stories during validation, so the owner’s first article and interactive Studio sign-in remain owner checks.

## Source and checks

- [src/cover.js](src/cover.js), [src/design-symbols.js](src/design-symbols.js): reusable original cover and signature objects.
- [src/redesign.css](src/redesign.css): palette, typography, responsive layout, movement and component presentation, layered on the existing game styles.
- [src/archive-topics.js](src/archive-topics.js): shared subject/era metadata used by the reader, server and Sanity schema.
- [server/articles.mjs](server/articles.mjs): read-only Sanity queries with bound filters, publication/draft guards, counts and pagination.
- [src/publication.js](src/publication.js): archive/reader routing, real filters, saved stories and personal choices.
- [src/article-layout.js](src/article-layout.js): shared reader/editor-preview template, with optional elements only when data exists.
- [studio/ArticlePreview.js](studio/ArticlePreview.js): authenticated draft preview in a sandboxed frame without scripts.
- [src/assets/fonts/CAVEAT-OFL.txt](src/assets/fonts/CAVEAT-OFL.txt): Caveat’s SIL Open Font License; existing Outfit licensing is retained.

Run `npm run check`, `npm test`, `npm run content:check`, and `npm run build` from the checkout. Netlify still installs Studio’s frozen dependencies and publishes `dist` with the existing functions. `/stories/slug/`, `/archive/` and `/admin/` have compatible rewrites. Secrets, draft game files and paid file payloads remain outside the public static build.

Validation includes the automated suite, real read-only Sanity list/filter queries, reader checks at 320/390/768/1440 pixels, archive pagination and search/empty states, direct links/reloads, mobile navigation/Escape, reduced motion and ticker pause, Sideblog persistence, restored legacy quiz progress, badge/diary progression, all three PNG exports and membership disabled without provider keys. Browser article fixtures are test-only; none are included in the public website or published to Sanity.

The subsequent October 14 logo update uses a transparent asset prepared from the supplied pink `fand♥m` / black `files` reference. The pixel heart sits inside the wordmark in place of the “o”; the extra trailing heart and outlined type are removed. Header, footer and all three PNG exporters share this asset, with a light backing for the earned midnight export theme. Layout checks passed at 320/390/768/1440 pixels and all three PNG exports completed.
