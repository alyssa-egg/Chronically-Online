# Your Fandom Files article editor

Open **https://fandomfiles.netlify.app/admin/**. Use **Editorial login** in the website footer, or save that address as a bookmark. Sign in with the same GitHub account you used for your Sanity project. This login is separate from players’ email sign-in for paid eras.

Your project is **rjg4g3cl**, dataset **production**. The organization ID **obysm5idb** is not the project ID. Article content lives in Sanity; the design and games live in GitHub.

## Write and publish your first article

1. Open **Article**, then **Create new document** (the plus/pencil button).
2. In **Write**, add a title, author, short excerpt, article body, and optional cover image. Add descriptive image alt text, captions, and credits. Use images you own or have permission to publish.
3. In **Publication**, choose a desk, generate the URL slug, enter a publication date/time, and add topic tags. Turn on **Feature on the cover** to prioritize the story on the homepage.
4. In **Interactive extras**, optionally add timeline moments, moodboard objects, connected articles, or a question with choices. Keep timeline moments in the intended reading order. Connected articles must also be published to appear to readers.
5. Add sources for reported facts; label memories, recollections, and opinion clearly.
6. Drafts save automatically and stay off the reader website. Use Sanity’s **Publish** button when you approve the article. Required fields must be complete. Set a future publication time if it should remain hidden until then.
7. Refresh the public website to see the story in the editorial section and its desk. Open its individual URL, `/stories/your-slug/`. No code change or Netlify redeploy is required to publish or edit articles.

Sanity’s date picker uses your browser’s timezone; check the displayed offset when scheduling. The stored time is an absolute ISO timestamp. Daily game resets remain midnight America/New_York and are independent of article publication.

To change a live article, edit it and **Publish** the revision. To remove one, use the document menu’s **Unpublish**. Visitors should refresh open pages to see changes. Keep a published slug stable so shared links continue to work. Draft edits never replace the last published revision until you publish them.

## What is available

| Desk | Use it for |
| --- | --- |
| The Lore Files | Internet history and fandom deep dives |
| The Culture Desk | Music, fashion, beauty, creators, current culture |
| The Moodboard Department | Visual references and objects with expandable stories |
| The Rabbit Hole | Stories connected to other articles, sources, songs, and playlists |
| The Group Chat | Editorial opinions, recollections, and personal reader choices |

Readers can browse desks, search article titles/excerpts/tags, explore expandable timelines and moodboard objects, follow sources and related stories, share a story URL, and save up to 200 stories to their Sideblog reading archive.

Story saves and poll choices stay in the reader’s browser. Polls are personal choices, **not shared community vote totals**. There is no reader-submission inbox, comment system, newsletter subscription, audio player, or automatic news-writing service in this release. The brief’s ideas for those remain future work. Playlist/song references open the original link rather than importing licensed audio.

The main ten-question quiz, six-turn Anonymous Ask, Lost Post, collectible cards, Lore Book, era folders, existing progress, and **$5 one-time** era purchase remain available. Sanity edits articles; daily question approvals still use [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md). No question drafts were approved during this integration. For payment launch, keep using [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md).

## Access and hosting

- Sanity project → **API → CORS Origins** must allow `https://fandomfiles.netlify.app` with **Allow credentials**. You reported adding this. Add another origin if you later change the website’s domain; include only origins you intend to use for the editor.
- If login succeeds but you cannot edit, check **Members** in the Sanity project. Your account needs an appropriate editor/administrator role. The public `/admin/` URL does not give visitors editing permission; Sanity checks their account.
- The public dataset must stay publicly readable for the article API. Drafts require authenticated access and are excluded from reader queries. Do not put private information into published articles.
- The website and Studio need no Sanity write token on Netlify. **Never add an editor token to frontend variables or code.** The securely bound cloud editor token was used only for a temporary publishing test; it is not bundled or served.
- Netlify’s committed build installs the pinned Studio dependencies and builds both the site and `/admin/`. It uses Node 24. Keep publishing `dist` with the existing server functions through Git-connected deployment.

## Local development

Requires Node **22.12+** (Node 24 recommended).

```sh
npm run studio:install
npm run build
npm start
```

The main site runs on port 3000; the built editor is at `/admin/`. To work on the editor itself, `npm --prefix studio run dev` runs its development server on port 3333. Add localhost origins to Sanity CORS with credentials only if you plan to sign into these local editors.

In the managed cloud, use `npm --cache /tmp/fandom-npm-cache --prefix studio ci --no-fund --no-audit`. Start the main service with `NODE_USE_ENV_PROXY=1 npm start` so Node fetch uses the configured HTTPS proxy and CA trust. Do not disable TLS verification.

## Implementation and validation

- [studio/sanity.config.js](studio/sanity.config.js): project, dataset, authenticated editor and published-story link.
- [studio/schemaTypes/article.js](studio/schemaTypes/article.js): writing fields and interactive extras.
- [server/articles.mjs](server/articles.mjs): read-only public Sanity query; published perspective, draft exclusion, publication-time check, no editor credential.
- [src/publication.js](src/publication.js): editorial homepage, desk search, individual story routing, saving/sharing, timelines, moodboards and personal polls.
- [src/article-content.js](src/article-content.js): escaped Portable Text rendering and constrained image/link URLs.
- [netlify.toml](netlify.toml): Studio install, build and article/editor routes.

On October 13, 2026, the real production dataset was tested by creating a temporary article draft, publishing it, reading it through the reader API, and confirming a future-dated article was hidden. All temporary test documents were deleted and deletion verified **before deployment**. The dataset contained no real articles at the time of integration; the first-issue placeholder is intentional.

The automated suite passed 69 tests, including new article query and rendering security checks. Reader browser checks cover 320, 390, 768 and 1440 pixel widths, individual URLs/reloads, saved stories and poll persistence, interactive extras, and the existing free games. Studio builds and serves its assets at `/admin/`. Your personal GitHub sign-in and first real article publication remain your final owner checks; the service-token publishing test does not establish an interactive user login.
