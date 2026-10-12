# Connect The Fandom Files’s $5 eras

Live site provided: **https://deepcutt.netlify.app/**.

The implemented offer is **$5 USD once for all three eras**, with one **24-hour free trial per verified email account**. The trial begins only when a player presses “Start my free 24 hours.” It lasts 24 elapsed hours across daylight saving changes. All games still reset at midnight Eastern. The main daily quiz and Anonymous Ask remain free without signing in.

Membership uses Supabase email codes and a protected database, plus Stripe-hosted checkout. The server verifies the actual $5 payment and account owner before granting access. A signed payment webhook completes the purchase even if someone closes the checkout tab. Access follows the email account between devices; quiz progress and diary streaks remain local. Clearing browser storage does not reset an account’s trial. A different email account has its own trial; there is no per-person identity check.

**Live check, October 11, 2026:** `https://deepcutt.netlify.app/api/premium?action=config` returned HTTP 200 with `configured: false`, `checkoutReady: false`, `priceCents: 500`, and `trialHours: 24`. The payment function is deployed, but provider settings are not connected. No Supabase, Stripe, or site configuration was available in this environment. Automated payment tests use mocked providers. Real email delivery, Stripe test checkout, live checkout, and production access still need the setup and test below. The UI keeps sign-in/purchase controls disabled until their required settings exist.

## 1. Use Git-connected Netlify deployment

In Netlify, open the **deepcutt** project and connect it to **alyssa-egg/Chronically-Online**, production branch **main**, if it currently uses manual uploads. Use:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node version: 22 or newer

The committed `netlify.toml` supplies build/function settings. The function handles `/api/premium`, `/api/era`, and `/api/stripe-webhook`; the dated issue files are included in its bundle. Deploy the repository so Netlify builds both the public files and the function. **Dragging only the static ZIP into Netlify Drop will not activate trials or payments.** The free games still work that way.

## 2. Create a Supabase project

1. Create a project at Supabase. Copy its project URL and the **legacy `anon` and `service_role` keys** from project settings (API/API Keys → Legacy API Keys). This implementation sends those keys as JWT bearer credentials; the newer `sb_publishable_...`/`sb_secret_...` keys are not interchangeable in this code. Keep the service-role key private.
2. Run [config/membership.sql](config/membership.sql) in its SQL editor. It creates `deep_cut_memberships` with one row per user. Browser roles cannot insert/update trials or purchases; the backend uses the service-role key.
3. Enable email sign-in. Set the Auth Site URL to `https://deepcutt.netlify.app`.
4. The working default email link can stay unchanged. The app handles both email links and optional codes. For public delivery, configure custom SMTP; use [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md) for current authentication and payment launch steps.
5. Configure a production mail sender/SMTP and appropriate sign-up/OTP rate limits. The built-in development sender may limit delivery to approved addresses and is not a public-launch email service. Check the current Supabase plan’s limits.

## 3. Create the Stripe product

1. Start in Stripe **test mode**. Create a product “The Fandom Files — all eras.”
2. Add a **one-time $5.00 USD price**. Do not select a recurring subscription or add an extra checkout fee. Copy its `price_...` ID.
3. Create a webhook destination at `https://deepcutt.netlify.app/api/stripe-webhook` for **`checkout.session.completed`**. Copy the destination’s signing secret `whsec_...`.
4. The app allows card payments, including supported card wallets, and checks the charged total is exactly $5. Keep this price ID stable for existing purchases. Price migration requires a code/data migration; changing it alone will make old receipts fail validation.

## 4. Set private server environment variables in Netlify

Open Netlify → your **deepcutt** project → **Project configuration → Environment variables**. Add these for the production deploy context, available to **Functions/runtime**, then redeploy. Enter keys there securely; do not paste them in chat or commit them to Git.

| Name | Value from your accounts |
|---|---|
| `SUPABASE_URL` | Your HTTPS Supabase project URL |
| `SUPABASE_ANON_KEY` | The project’s anon API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Its private service-role key |
| `STRIPE_SECRET_KEY` | Stripe secret API key, initially test mode |
| `STRIPE_PRICE_ID` | The one-time $5 USD price ID from the same mode |
| `STRIPE_WEBHOOK_SECRET` | The matching webhook destination signing secret |
| `SITE_URL` | `https://deepcutt.netlify.app/` |

None are put in the public build. `GET /api/premium?action=config` reports booleans, $5 pricing, and 24 trial hours without revealing keys. Supabase settings enable sign-in/trials. Stripe + price + webhook + site settings enable checkout.

For local development, copy `.env.example` to the ignored `.env.local`, enter development values securely, and run `node --env-file=.env.local server.js`. Use Stripe’s documented local webhook forwarding for test events. Keep production site settings on Netlify.

## 5. Verify before taking real payments

After the test-mode deploy:

- Open all free games while signed out. They must work.
- Sign in with an email code. Confirm the free trial does **not** begin on sign-in.
- Start the trial explicitly; check all three eras. Sign in with the same account in another browser and check it has the same end time. Repeated start requests must preserve that time.
- Test an expired-trial account and confirm it cannot fetch era questions. Use a development/test account and database fixture rather than editing a real customer’s trial.
- Complete a Stripe test checkout using its test-card instructions. The amount must be $5 once. Verify the receipt return and that all eras unlock.
- Check Stripe webhook delivery returns 200 and restores the purchase after signing in from another browser. The webhook covers buyers who close the checkout tab before returning.
- Cancel checkout and confirm no purchase is recorded. Check that an unpaid session or another account’s session cannot unlock anything.
- Refund a test payment; paid access should stop on the next server access check. An unexpired free trial remains valid until its original end.

Review Netlify function logs and Stripe webhook delivery logs for failures. The API returns generic errors to players rather than exposing provider responses or secrets. Account/purchase access depends on Supabase and Stripe being available.

When those checks pass, create the **live-mode** $5 product/price and live webhook, switch to the matching live key/price/signing secret, and redeploy. Complete a real launch verification using your provider’s recommended process. Set up your support/contact and refund policy before selling. Taxes or a future price change need corresponding billing-code work because this version enforces exactly $5 USD.
