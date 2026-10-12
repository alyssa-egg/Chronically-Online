# Launch The Fandom Files

The site is already public at **https://deepcutt.netlify.app/**. The code has the new brand; the Netlify address and GitHub repository name remain unchanged so existing sign-in links, purchases, and browser saves continue working.

**Observed October 12, 2026:** Netlify reports sign-in configuration and Checkout configuration present, $5 USD once, and a Stripe **test publishable key**. Those readiness flags confirm variables exist, not a successful payment or email delivery to the public. Live charging has not been enabled by this build.

## Launch in two stages

1. **Free soft launch:** share the current URL with a small group to play Daily Quiz, Anonymous Ask, Lost Post, and the free sample folder in each era. No account is needed for these. Ask people to try phones, sharing, and the Sideblog. Badges, progress, and the Lore Book are saved in their browser; signing in restores paid access, not those local collections.
2. **Paid launch:** finish the actual email/payment checks in [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md), switch to matching live Stripe keys/price/webhook, redeploy, and verify one real $5 purchase, restoration in another browser, and webhook delivery. Announce paid access after those checks pass.

## What to prepare before announcing paid access

- **Email sign-in for strangers.** Earlier setup used Supabase’s built-in sender. Confirm a custom SMTP sender now: the built-in sender limits recipients to project-team addresses and is unsuitable for public signup. Netlify does not supply SMTP. Use an email provider such as Resend or Brevo, then configure its SMTP credentials in Supabase. Test with an address that is not on your Supabase team. Detailed steps are in the payment checklist.
- **A working test purchase.** Complete it in the real browser iframe, verify all three premium eras open, check the webhook, and sign in again elsewhere. Configuration flags and mock tests cannot replace this check.
- **Stripe live account activation.** Finish Stripe’s requested business/identity/bank setup, then use its live product price and keys. Rename the product display name to “The Fandom Files — all eras”; keep the existing matching price ID if already live. A name change does not require changing a Price or creating a subscription.
- **Public customer information.** Choose a support email and publish your privacy, access, and refund terms before accepting money. Describe the $5 one-time purchase, the trial, and local browser storage plainly. Decide and state your refund policy; no automatic refund promise is added by the app.
- **Reviewed launch content.** Review future dated questions in [QUESTION_SCHEDULE.md](QUESTION_SCHEDULE.md). Explicitly approve complete future issues after checking sources. Existing drafts do not auto-publish. The GitHub day-before workflow creates a review summary; it does not email you or write/approve questions.

## Optional: a Fandom Files web address

You can launch with the current Netlify URL. A custom domain can come later.

If you buy one, add it in **Netlify → your project → Domain management → Add a domain**, apply the DNS records Netlify shows, and wait for HTTPS. Set your primary domain there. Then update **Netlify `SITE_URL`**, **Supabase Auth Site URL and allowed redirect URLs**, and **Stripe’s live webhook destination** to the same HTTPS domain, and redeploy. Keep the old domain redirecting to the new one. Test a fresh sign-in link and purchase return on the new domain.

Browser-local collections do not automatically move to a different domain. Players should save/share their scrapbook PNG before moving; their email-linked paid access can be restored on the new domain. Do not change domains midway through a test purchase. A sending-email domain can be different from your Netlify hosting address.

If you instead change the Netlify project’s generated subdomain, first check availability in Netlify; apply the same URL updates above. This build does not reserve a name or change your hosting settings.

## Suggested first launch session

Invite a few testers to the free games, review their feedback, finish one test purchase with a fresh account, then complete live-mode setup. Keep the launch small until email sign-in and paid restoration are confirmed. Monitor **Stripe → Webhooks/destinations → event deliveries** and **Netlify → Logs → Functions** for failures.

For every Stripe value, test card, webhook, or go-live step, use [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md) as the single source of truth.
