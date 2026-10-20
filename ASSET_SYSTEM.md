# The Fandom Files scrapbook asset system

The homepage keeps Today’s Deep Cut and the three era entrances visible first. Stories, the music pick, personal status and stamps are in the collapsed **around the archive** section; the original games remain under **more to explore**. Open either section when you want it. Editorial/widget reads mount when their section is first opened.

The site now shares a small pixel-icon library, retro window frames, paper/tape accents, lore popup windows, era palettes, a curated music widget and a four-stamp wall. This refines the existing site; the logo, article editor, original games and Render deployment configuration stay in place.

## Asset inventory and where new images go

| Asset | Current location / workflow |
| --- | --- |
| Active local wordmark | `src/assets/fandom-files-heart-logo.png`. This is the earlier prepared reference version, **not the exact original upload**. Publish your original via **Original site logo** in Sanity to replace it across header, footer and cards. No AI regeneration is used by this asset system. |
| Three original collages | Original files were not available in the coding workspace. In Sanity, publish one **Era collage & discoveries** document for each era. Upload the originals to its **Collage** field; they are never replaced with generated collages. |
| Pixel icons | [src/archive-atoms.js](src/archive-atoms.js): coded stars, hearts, folders, music notes, bookmarks, arrows, cameras, stamps, mail, search and close controls. Same square pixel language; no icon pack dependency. |
| Existing cursor / ask sticker | `src/assets/pixel-cursor.png`, `src/assets/ask-moustache.png`; retained for the existing game and Sideblog screens. |
| Existing collectible artwork | `src/assets/collectibles/*.svg`; retained for the original fourteen-card collection. |
| Small favicon | `src/favicon.svg`; existing black/pink pixel-heart mark retained. |
| Main headline type | System Helvetica Bold, lowercase, with Helvetica Neue / Arial fallbacks. No unlicensed Helvetica font is distributed. |
| Secondary type | `src/assets/fonts/dm-sans-variable.woff`, bundled with `DM-SANS-OFL.txt`. |
| Annotations and small notes | DM Sans, matching the secondary type. The earlier Caveat handwriting font is retired and is no longer served or bundled. |
| Retired brand artwork | `deep-cut-logo.png` and `fandom-files-logo.png` stay in the source for compatibility/history; they are not new logo replacements. |

Original Sanity images use direct asset URLs without AI processing, filters, recoloring, or format conversion. Layout frames and overlaid pins are separate UI. The supplied logo’s blank canvas is framed for placement without changing its file. Use images you own or have permission to publish, and add alt text and credits in the editor. This release does not scrape Pinterest or download album artwork automatically.

Uploaded Sanity assets require **no Git commit or redeploy** after the editor and site have been deployed. The existing [HANGOUT_GUIDE.md](HANGOUT_GUIDE.md) gives the logo/three-collage upload steps. If adding a new bundled asset in code, register its public path in both `server.js` and `scripts/build.mjs`; the public-file allowlist intentionally prevents arbitrary repository files being served.

## Reusable components

[src/archive-atoms.js](src/archive-atoms.js) supplies:

- `pixelIcon(name)`: a fixed SVG icon, decorative and hidden from assistive technology. Put the action’s real name on its button/link.
- `fileStamp(label)`: small printable stamp labels.
- `archiveWindow(title, content)`: a shared retro title bar and content frame. The extra window glyphs are decoration; they are not fake controls.
- `archiveFileCard(...)`: expandable file entries with shared numbering, headings and folder icon.
- `createFileWindow()`: a native modal dialog for collage discoveries, with a real close button, Escape support, keyboard focus containment and focus return.

Component title/label fields are escaped. The `content` / `body` arguments accept trusted internal HTML only; render all CMS text through `escapeHTML` before passing it. Source links use `safeLink` and image references use `originalImageURL`.

[src/redesign.css](src/redesign.css) holds the shared pixel sizes, tape, printed-paper edges, windows, stamps and era variables. Decoration is limited to a few repeated elements. The site does not add fake visitor counters, random glitter assets, autoplaying sound, or another navigation system.

## Era colors and discoveries

| Era | Main accent | Supporting materials |
| --- | --- | --- |
| The Fandom Years · 2010–2016 | Pink | Lavender, black, pale scrapbook paper |
| The Influencer Era · 2017–2020 | Acid green | Silver, black, hot pink elsewhere in the shared identity |
| The Current Lore · 2021–now | Cherry red | Cream and electric lilac |

All three keep the same navigation and page structure. Their tile, file header, discovery numbers, popup windows and pin accents use the same era tokens.

To add lore without changing layouts:

1. Open your era document in **`/admin/`**.
2. In **Clickable lore pins**, add a stable lowercase/hyphen ID, title, short category and text. Add an optional date/era label, an original image with alt text/credit, and a source link.
3. Set X and Y percentages for the pin position over the full collage.
4. Publish and refresh the public page.

Leave the discoveries array empty to retain the starter entries from [src/era-discoveries.js](src/era-discoveries.js). Opened inline entries and collage-pin popup entries both count as discoveries. Reopening a file does not add another discovery. Popup save buttons and inline save buttons use the existing My Files list. Direct links to `#discovery-your-id` still open the inline entry.

## Now Playing: a manual editorial pick

In **`/admin/`**, create **Now Playing · editor’s music pick**:

1. Enter the **Song title**, **Artist**, and a link to the original music service or artist page.
2. Optionally upload an image with alt text/credit, and write a short personal note.
3. **Publish**, then refresh the homepage. Keep one published pick; the most recently updated published document is used if there are several.

The widget opens your selected external link. It **does not stream audio**, connect a Spotify account, show a fabricated playback timer, or claim to track what anyone is listening to. No extra API keys are needed. With no valid published pick, it shows an honest “between songs” state. Unpublish the document to remove the pick.

The existing curated **Currently on our radar** article fields are unchanged. Both features depend on your publication choices; neither is scraped or automatically written.

## Stamp wall and truthful archive status

The small homepage wall awards four cosmetic stamps:

| Stamp | Earned by |
| --- | --- |
| deep cut detective | Completing one Today’s Deep Cut, including an incorrect answer |
| kept the receipt | A correct Deep Cut without clues |
| dashboard digger | Opening five different lore discoveries |
| era traveller | Opening at least one discovery in each era |

[src/scrapbook.js](src/scrapbook.js) records and validates the underlying activity. Repeated opens and repeated visits to a completed result do not increase counts. Known earned stamps remain filed when you miss a day. Existing Deep Cut results can earn their corresponding stamps when reopened or loaded on the homepage.

The status strip displays local opened-discovery, saved-file and earned-stamp counts. These are **personal browser data**, not visitor counts, public totals or account entitlements. They live under `fandom-files-scrapbook-v1`; no existing progress keys were renamed. The original fourteen collectible cards and Sideblog are unchanged and remain accessible through My Files. There are no new accounts, payments, public profiles, comments or server-side achievements.

As with existing browser saves, changing website origins from Netlify to Render will not automatically transfer this data. See [RENDER_MIGRATION.md](RENDER_MIGRATION.md). Sanity articles/assets, Supabase memberships and Stripe products stay in their existing services.

## Verification and publication

Run `npm run check`, `npm test`, and `npm run build`. Studio schema validation runs from `studio/` with `npm exec -- sanity schema validate --level error`. Browser checks exercise original-image rendering, curator-link safety, stamp goals/persistence, mobile layouts, keyboard opening, Escape, focus return, saved files and the original daily quiz.

The code must be deployed on Render before the new editor fields and widgets appear publicly. No Render service URL has yet been supplied in this conversation; a local build and GitHub push do not establish a live deployment. No original-image source files or real curated song were published by these code changes.

## Use the modern collage

On your deployed site, open **`/admin/` → Era collage & discoveries**. Open the document for **the current lore / 2021–now**, or create one and select that era if it does not exist yet. Upload the supplied modern collage in **Collage**, enter descriptive alt text such as “Collage of 2020s music, artists, creators and internet references,” add an appropriate credit, and **Publish**. Refresh the homepage and `/eras/current-lore/` to see the same full original image in both places. This is an image-content update and does not require another code change or redeploy after the editor version is live.

Handwriting was removed from the current interface at the owner’s request. Main headings retain lowercase Helvetica Bold; secondary text, annotation labels, music notes and footer text use DM Sans.
