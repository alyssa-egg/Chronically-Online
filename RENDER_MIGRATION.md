# Move Fandom Files from Netlify to Render

You can keep this repository, Sanity project, Supabase database/accounts, Stripe account and existing $5 one-time product. Render runs the existing Node server, which serves the site, Studio and APIs together. This is a **Web Service**, not a Static Site.

The committed [render.yaml](render.yaml) prepares a free web service. Render’s free hosting has usage limits and can sleep when idle, causing slow first requests. Use an always-on paid instance before relying on timely sign-in and payment webhook processing for a public paid launch. Check [Render pricing](https://render.com/pricing) for current rates and quotas; no hosting plan is unlimited. This change does not create an account, buy a plan or deploy a Render service.

## 1. Create the new service

1. Create/sign into [Render](https://dashboard.render.com/) with GitHub.
2. Choose **New → Web Service**, connect **alyssa-egg/Chronically-Online**, and select **main**. Keep the root directory blank.
3. Choose **Node** as the runtime and enter:

   | Setting | Value |
   | --- | --- |
   | Build command | `npm --prefix studio ci --no-fund --no-audit && npm run build` |
   | Start command | `npm start` |
   | Health check path | `/` |
   | `NODE_VERSION` | `24.19.0` |
   | `NODE_ENV` | `production` |

   Alternatively, **New → Blueprint** can read `render.yaml` from this repository. Render asks you to enter values marked `sync: false`; the blueprint contains no secret values. Pick the plan you intend to use before creating the service.

4. Create/deploy the service. Render assigns a URL such as `https://YOUR-SERVICE.onrender.com`; copy the actual URL from its dashboard. Do not assume the example name is available. Render supplies `PORT` automatically; do not set it yourself.

The free games and editorial pages can run before payment variables are entered. For a manual service, you can deploy with only the Node variables first to get the real URL. The blueprint lists the full membership configuration for setup; do not enter invented keys to complete it.

## 2. Move the existing environment values privately

In **Render → your service → Environment**, enter these names. Copy existing values privately from Netlify; do not paste keys into chat or GitHub.

| Name | Value |
| --- | --- |
| `SITE_URL` | Your actual new HTTPS Render URL, including the trailing slash. |
| `SUPABASE_URL` | Your existing Supabase project URL. |
| `SUPABASE_ANON_KEY` | Your existing anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Your existing private service-role key. |
| `STRIPE_SECRET_KEY` | Your existing Stripe key in the intended test/live mode. |
| `STRIPE_PUBLISHABLE_KEY` | The matching publishable key. |
| `STRIPE_PRICE_ID` | Your existing one-time USD $5 Price in that same mode. |
| `STRIPE_WEBHOOK_SECRET` | The **new Render webhook destination’s** signing secret, created below. |

Save and redeploy after changing these. The backend uses `SITE_URL` to preserve HTTPS behind Render’s proxy, send auth links to the right site, and construct payment returns. Use the exact same public domain throughout the steps below.

No Sanity editor token is required on Render. Do not add `SANITY_EDITOR_TOKEN` or any private key to browser-accessible variables.

## 3. Update the three services that know the old URL

**Supabase → Authentication → URL Configuration**

- Set **Site URL** to the new HTTPS URL.
- Add that URL to the allowed redirect URLs.
- Keep the previous redirect URL temporarily if existing email links should still be accepted. New sign-in links must return to Render. Users should request a fresh sign-in email on the new site.
- Your existing database, memberships and email/SMTP configuration remain in the same Supabase project.

**Sanity → project `rjg4g3cl` → API → CORS Origins**

- Add the new HTTPS Render origin with **Allow credentials** so your Studio login at `/admin/` works.
- Keep using dataset **production**. Articles, original logo uploads and era collages remain in that project.
- Published reader data uses the existing public read APIs; there is no content migration to perform.

**Stripe → Developers / Workbench → Webhooks**

- In the intended test/live mode, create a webhook destination at `https://YOUR-SERVICE.onrender.com/api/stripe-webhook`.
- Select `checkout.session.completed`, as in the existing integration.
- Copy **this destination’s signing secret** to Render’s `STRIPE_WEBHOOK_SECRET`. Do not reuse the old Netlify destination’s signing secret for a newly created destination.
- Keep using the matching Price and API keys. Moving hosts is not a reason to switch from test to live payments.
- Verify successful delivery on Render before disabling the old webhook destination. Disable the obsolete destination after the cutover so Stripe does not keep retrying the old site.

[STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md) remains the single source of truth for completing payment setup and test-to-live launch checks; this guide only changes the host and destination URLs.

## 4. Check before sharing the new link

- Open the homepage, `/play/`, `/archive/`, an era page and `/admin/`. Refresh direct links to verify routing.
- Confirm the daily round, clues, saved result and share action work.
- Sign into the Studio and confirm articles, image fields and your original asset uploads are available.
- Request a new player sign-in email and confirm it returns to Render and signs in.
- In Stripe test mode, verify a test purchase, return to the new site, paid access and a successful signed webhook delivery. Confirm previously purchased access can be restored by signing into the same account. Never test with a real charge without intending to make it.
- Use Render’s service logs for startup/API errors. A successful build alone does not verify email or payment behavior.

No live Render service or real payment has been tested by this repository preparation. Those checks require your new service URL and provider configuration.

## Addresses and browser saves

You cannot take a `netlify.app` subdomain to Render. Use the new `onrender.com` URL or a custom domain you own. If using a custom domain, configure it in Render, wait for HTTPS, and repeat the URL settings above with that domain. A custom domain makes later host changes easier.

Supabase accounts, paid access and Sanity articles stay in their existing services. Browser-local quiz answers, daily rounds, reading saves, receipts and collectibles are tied to the old website origin and **will not automatically transfer** to a new domain. Save/share any desired cards before leaving the old site if it remains accessible. This migration adds no data-export/import feature.

Keep the old Netlify project until the new site passes the checks. Once the migration is verified, stop its automatic builds if you want to avoid consuming more Netlify credits.
