# Era Memories: publish the tab and open the inbox

## Deploy the latest website

1. Open [Render](https://dashboard.render.com/) and choose your existing Fandom Files **Web Service**.
2. Choose **Manual Deploy → Deploy latest commit**. The deployment must use this repository’s `main` branch.
3. Wait for **Live**, then open your website and refresh it. **Memories** appears in the header and footer, at `/memories/`. Each era page links to its own filtered wall.

If the build fails with `sanity: not found`, keep the root directory blank and set **Build Command** to `npm --prefix studio ci --no-fund --no-audit && npm run build`, **Start Command** to `npm start`, and `NODE_VERSION` to `24.19.0`. Redeploy. A failed deployment does not update the public website.

## One private token for reader submissions

The game and published memory wall work without a token. Accepting new memories requires one **server-only** Sanity API token, so visitors can send a private review draft without accessing the Studio or publishing directly.

1. Open [Sanity Manage](https://www.sanity.io/manage), choose project **`rjg4g3cl`**, and open **API → Tokens → Add API token**.
2. Name it **Fandom Files memory inbox** and choose the **Editor** role. Create the token and copy it privately.
3. In **Render → your service → Environment → Add Environment Variable**, enter the name **`SANITY_EDITOR_TOKEN`** and paste the token into its value. Save and redeploy.
4. Ensure Render’s existing **`SITE_URL`** matches your actual public HTTPS address. The inbox accepts same-origin JSON submissions.
5. Once the service says **Live**, refresh **Memories**. The **send my memory** button becomes available if the token is configured and the published wall loads.

Do not put the token in GitHub, chat, HTML, browser code, or a `VITE_` / `SANITY_STUDIO_` variable. The coding environment’s token does not automatically transfer to Render. A configured token can still fail if it belongs to another project or lacks write permission; Render logs and Sanity token settings are the places to diagnose that. The public API returns no token or draft IDs.

## Review and approve

1. Open **your website URL + `/admin/`** and sign into Sanity.
2. Choose **Era memories · review & publish**. Incoming reader memories are **drafts**. Review the memory, era, and public nickname; remove private details and unwanted content before publishing.
3. Click **Publish** to approve a memory. It appears publicly when readers refresh the wall or select **refresh memories**. No code redeploy is needed.
4. Delete unwanted drafts. To remove an already public memory, use **Unpublish**; the next refresh removes it from the public list. Editing a published memory creates a new draft; the previous approved version stays public until you republish or unpublish it.

Readers see approved memories only. A new submission receives a review confirmation and is **not** immediately inserted into the public wall. Nobody is emailed automatically, and there is no notification service to configure; check the Studio review list yourself.

## What readers can do

- Browse all eras or filter to the fandom years, the influencer era, or the current lore.
- Send a 10–600 character memory with an optional nickname (up to 40 characters); blank nicknames become **anonymous mutual**.
- Read 20 approved memories at a time, then load more. Pagination stops after 1,020 records in one filtered browsing session.
- Keep using Deep Cut, the three era pages, My Files, and the existing paid collections. Memories are free and require no player account.

Memories are shared in Sanity and can be read across devices, unlike browser-local game saves. Nicknames are unverified. Only text is accepted: no uploads, rich HTML, links rendered as links, replies, likes, or fabricated activity totals. IP addresses are not saved in Sanity. The current anti-spam controls are a hidden bot field, small request/text limits, same-origin checks, and a one-minute **best-effort, per-instance client-address cooldown**. Forwarded/shared addresses and service restarts can affect that cooldown; it is not a distributed rate limit. Review remains the publication gate. If spam grows, add host-level rate limiting or a bot challenge before expanding submissions.

## Implementation and checks

- [server/memories.mjs](server/memories.mjs): published-only reader query and draft-only submission endpoint.
- [src/memories-ui.js](src/memories-ui.js): wall, era filters, pagination, form, review confirmation, and failure states.
- [studio/schemaTypes/eraMemory.js](studio/schemaTypes/eraMemory.js): owner’s review form.
- `/api/memories` is wired to the existing Node service and Netlify function; `/memories/` refreshes directly on both hosts.
- [tests/memories.test.js](tests/memories.test.js): draft-only writes, public/private field separation, bound filtering, validation, readiness, throttling, and provider failures.

The real Sanity connection was checked by creating a temporary private review draft, confirming that an authenticated owner could read it and an unauthenticated public query could not, then deleting it and verifying removal. Nothing was published. Public approval display and browser interactions are checked with fixtures; no reader memory or fake public seed content was added. A real submission from your **Render** website still needs the token and deployment steps above.
