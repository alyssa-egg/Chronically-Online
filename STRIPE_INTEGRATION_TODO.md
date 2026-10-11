# Stripe embedded form — setup and remaining steps

This is the current source of truth for Deep Cut's payment setup. The offer remains **$5 USD once for all three eras**, with a separate 24-hour trial. Neither free daily game requires payment. This integration uses the requested **Checkout Form preview**, not a subscription or a redirect to hosted Checkout.

## Values to Replace

**Files containing environment placeholders:**

- [.env.example](.env.example)

Enter account values in Netlify's production **Functions/runtime** environment variables, or in an ignored `.env.local` for development. Do not put private keys in Git or chat.

| Field | Current example value | What to set |
|-------|-----------------------|-------------|
| `SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Your Supabase project URL. |
| `SUPABASE_ANON_KEY` | Empty | The project's legacy JWT `anon` key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Empty | Its private legacy JWT `service_role` key. |
| `STRIPE_SECRET_KEY` | Empty | Your matching Stripe test secret key, then live key when ready. |
| `STRIPE_PUBLISHABLE_KEY` | Empty | Your matching `pk_test_...` key, then `pk_live_...`. This public key is supplied to the browser by the existing config endpoint. |
| `STRIPE_PRICE_ID` | Empty | A real, active **one-time $5.00 USD** price ID from the same Stripe mode. |
| `STRIPE_WEBHOOK_SECRET` | Empty | The signing secret for the matching webhook destination. |
| `SITE_URL` | `https://YOUR_SITE.netlify.app/` | `https://deepcutt.netlify.app/`. |

**No sample Checkout Session parameters were substituted.** The existing call in [server/premium.mjs](server/premium.mjs) retains `mode: payment`, quantity `1`, and the runtime `STRIPE_PRICE_ID`. The price is validated as an active, non-recurring $5 USD price before creating a session. Do not replace that runtime reference with the sample literal `price_...` or change the mode to a subscription.

There is no Vite build and no Stripe server SDK dependency. The existing REST client is retained. Accordingly, `ui_mode` defaults to `form` under the requested version rule. If a Stripe SDK is introduced later, version **21.0.0 or newer uses `form`**; an older SDK uses `custom`. The required preview API version and account access must also support the selected mode.

## Configured Parameters

**Files containing these settings:**

- [server/premium.mjs](server/premium.mjs) — the existing Checkout Session call and REST client.
- [index.html](index.html) — Stripe.js, loaded directly from Stripe.
- [src/membership.js](src/membership.js) — Checkout Form SDK initialization, appearance, mounting, and confirmation.
- [src/app.js](src/app.js) — the existing membership panel and verified unlock flow.

| Parameter | Value |
|-----------|-------|
| `ui_mode` | `form` |
| `mode` | `payment` — existing one-time product |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `custom_embedded_web_0001` |
| `line_items[0].price` | Existing runtime `STRIPE_PRICE_ID` |
| `line_items[0].quantity` | `1` |
| `payment_method_collection` | Omitted: the task expressly limits `always` to subscription mode. |
| `client_reference_id` | Verified Supabase user ID — retained with your explicit approval. |
| `metadata.user_id` | Same verified user ID — retained with your explicit approval for fulfillment. |
| Stripe REST API version header | `2026-03-25.dahlia; custom_checkout_payment_form_preview=v1` |
| Stripe.js URL | `https://js.stripe.com/dahlia/stripe.js` |
| Browser beta flag | `custom_checkout_payment_form_1` |
| Form layout | `expanded` |

The old `success_url`, `cancel_url`, `customer_email`, and explicit card-only parameter are removed. No new endpoint, database table, authentication mechanism, webhook handler, server SDK, or dependency was added.

The configured appearance is `theme: stripe`, `labels: auto`, `inputs: spaced`, with these variables:

| Variable | Value |
|----------|-------|
| `borderRadius` | `4px` |
| `colorBackground` | `#ffffff` |
| `colorDanger` | `#df1b41` |
| `colorPrimary` | `#0570de` |
| `colorSuccess` | `#00c853` |
| `colorText` | `#30313d` |
| `fontFamily` | `default` |
| `fontSizeBase` | `16px` |
| `spacingUnit` | `4px` |

## Setup and Next Steps

1. **Confirm Checkout Form preview access with Stripe.** This task requires the Dahlia preview API version and beta flag above. Account access and the real preview SDK have not been verified. If Stripe rejects a preview parameter or initialization, check its preview availability and version with Stripe before enabling real purchases.
2. **Create/configure Supabase.** Run [config/membership.sql](config/membership.sql) in the SQL editor. Enable email sign-in, set the Auth Site URL to `https://deepcutt.netlify.app`, and include `{{ .Token }}` in the Magic Link email template so players can type the emailed code. Configure production SMTP and delivery limits. This code uses legacy JWT keys, not interchangeable `sb_publishable_...`/`sb_secret_...` keys.
3. **Create the Stripe test product and price.** Create “Deep Cut — all eras” with one $5.00 USD price, billed once. Copy the price ID into `STRIPE_PRICE_ID`. Keep the price ID consistent with stored receipts; replacing it later requires a receipt/price migration.
4. **Create a test webhook destination** at `https://deepcutt.netlify.app/api/stripe-webhook` for `checkout.session.completed`, and set its signing secret. The existing handler verifies the signature and retrieves the paid receipt before granting access.
5. **Use immediate-payment methods for this implementation.** Payment methods are now controlled by Stripe settings because the old explicit card filter was removed as requested. Enable only methods that complete payment immediately until delayed-payment fulfillment is implemented. The existing handler does not process `checkout.session.async_payment_succeeded`.
6. **Add the environment values above to Netlify, then redeploy.** Keep the Git-connected build: `npm run build`, publish `dist`, functions `netlify/functions`, Node 22+. No dependency installation beyond the existing project setup is required. Static Netlify Drop uploads do not deploy the payment function. The browser receives only the publishable key; server keys stay private.
7. **Check readiness.** `GET /api/premium?action=config` should report `configured: true` and `checkoutReady: true`, with the correct public `publishableKey`. Until the provider settings exist, sign-in/purchase controls stay disabled and the free games remain available.
8. **Complete the test checklist below before live payments.** Then use matching live-mode keys, live $5 price, and live webhook secret, redeploy, and verify live fulfillment using Stripe's recommended launch process.

For local development, copy `.env.example` to `.env.local`, fill it privately, and run `node --env-file=.env.local server.js`. Keep `SITE_URL` a valid HTTPS site URL as required by the existing backend. Use Stripe's local webhook forwarding for test events. The script is always loaded from Stripe, never bundled or self-hosted.

### How the integration works

1. A verified email account opens **My eras** and selects **Unlock all eras · $5 once**.
2. The existing authenticated `POST /api/premium?action=checkout` validates the actual price and creates a session. It returns JSON containing `client_secret` and `session_id`, with no redirect. The ID is used for server receipt verification; the secret is passed to Stripe's form SDK and is not logged or persisted by the app.
3. The membership panel mounts Stripe's hosted iframe inside `#checkout-form`, with the specified appearance. Its confirm event invokes the SDK's loaded confirmation actions.
4. After confirmation, the browser asks the existing verify action to check the session. Only a complete, paid, unrefunded $5 receipt linked to that authenticated account unlocks the eras. A client-side success message alone never grants access.
5. The signed webhook saves the same session ID in the existing membership row even if the player closes the form. Signing in on another device restores access from the server. Closing/backing out of the form does not record a purchase. Refund checks revoke paid access on subsequent requests; an unexpired trial remains valid until its original end.

### Project changes

The only new repository file is this checklist. Existing files changed: [.env.example](.env.example), [server/premium.mjs](server/premium.mjs), [index.html](index.html), [src/membership.js](src/membership.js), [src/app.js](src/app.js), and [src/style.css](src/style.css). Existing payment/client tests were updated to cover the new flow. Authentication, database structure, price validation, webhook verification, and entitlement checks remain in their existing locations.

### Test checklist

- Run `npm run check`, `npm test`, and `npm run build`. Automated tests use provider/SDK mocks; they do not establish that Stripe's preview is enabled for your account.
- In **Stripe test mode**, sign in and open the embedded form on desktop and mobile. Check $5 once, readable layout, and the configured appearance.
- Use `4242 4242 4242 4242`, any future expiry, and any three-digit CVC for a successful test card. Use `4000 0000 0000 9995` for a decline and `4000 0025 0000 3155` for authentication, following Stripe's current testing guidance. Never use test cards in live mode.
- A success must unlock all three eras after server verification and restore them in another signed-in browser. A decline, abandoned form, unpaid session, or another account's receipt must not unlock them. Check authentication-required cards complete successfully in the iframe.
- Check `checkout.session.completed` webhook deliveries return 200, including when the player closes the form. Verify refunds revoke purchased access and repeated webhook delivery does not create a second entitlement.
- Confirm free games and the existing trial still work. Review Stripe webhook deliveries and Netlify function logs for failures without recording client secrets or private keys.

**Verification limit:** The cloud network returned HTTP 403 when fetching the Dahlia Stripe.js URL. No real Stripe/Supabase account credentials were available, so real iframe behavior, email delivery, test payments, and preview account access remain unverified until these steps are completed.

Resources: [Stripe support](https://support.stripe.com), [Stripe MCP documentation](https://docs.stripe.com/mcp), [API key practices](https://docs.stripe.com/keys-best-practices), and [test cards](https://docs.stripe.com/testing).
