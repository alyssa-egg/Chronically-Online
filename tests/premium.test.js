import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  handlePremiumRequest,
  TRIAL_MS,
  trialActive,
  receiptIsValid,
  validStripeSignature,
} from "../server/premium.mjs";
import { dayKey } from "../src/game.js";
import { loadIssues } from "../server/editorial.mjs";
const userId = "b1418831-77f5-4a8c-9436-3363d0de8499";
const env = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_ANON_KEY: "anon-test",
  SUPABASE_SERVICE_ROLE_KEY: "service-test",
  STRIPE_SECRET_KEY: "sk_test_mock",
  STRIPE_PUBLISHABLE_KEY: "pk_test_mock",
  STRIPE_PRICE_ID: "price_test_5",
  STRIPE_WEBHOOK_SECRET: "whsec_test",
  SITE_URL: "https://deep-cut.example",
};
const current = Date.parse("2026-10-13T15:00:00Z");
const day = dayKey(new Date(current));
const receipt = () => ({
  id: "cs_test_owned",
  client_reference_id: userId,
  metadata: { user_id: userId },
  mode: "payment",
  status: "complete",
  payment_status: "paid",
  currency: "usd",
  amount_total: 500,
  line_items: {
    data: [
      {
        quantity: 1,
        price: { id: env.STRIPE_PRICE_ID, unit_amount: 500, currency: "usd" },
      },
    ],
  },
  payment_intent: {
    latest_charge: { paid: true, refunded: false, amount_refunded: 0 },
  },
});
function harness({
  member = null,
  payment = receipt(),
  price = { active: true, unit_amount: 500, currency: "usd" },
  now = current,
  issues = {},
} = {}) {
  let row = member && structuredClone(member);
  const calls = [];
  const fetcher = async (address, options = {}) => {
    const url = new URL(address);
    calls.push({ url: url.href, ...options });
    const out = (body) => new Response(JSON.stringify(body), { status: 200 });
    if (url.pathname === "/auth/v1/user")
      return options.headers.Authorization === "Bearer valid-token"
        ? out({
            id: userId,
            email: "mutual@example.com",
            email_confirmed_at: "2026-10-01T00:00:00Z",
          })
        : new Response("{}", { status: 401 });
    if (url.pathname === "/auth/v1/otp") return out({});
    if (["/auth/v1/verify", "/auth/v1/token"].includes(url.pathname))
      return out({
        access_token: "valid-token",
        refresh_token: "refresh-token",
        expires_in: 3600,
        user: { email: "mutual@example.com" },
      });
    if (url.pathname === "/auth/v1/logout")
      return new Response(null, { status: 204 });
    if (url.pathname === "/rest/v1/deep_cut_memberships") {
      assert.equal(options.headers.apikey, env.SUPABASE_SERVICE_ROLE_KEY);
      if (options.method === "POST") {
        const incoming = JSON.parse(options.body);
        if (!row || options.headers.Prefer.includes("merge-duplicates"))
          row = { ...row, ...incoming };
        return out([row]);
      }
      return out(row ? [row] : []);
    }
    if (url.pathname.startsWith("/v1/prices/")) return out(price);
    if (url.pathname === "/v1/checkout/sessions")
      return out({
        id: "cs_test_new",
        client_secret: "cs_test_new_secret_mock",
      });
    if (url.pathname.startsWith("/v1/checkout/sessions/")) return out(payment);
    throw new Error("Unexpected provider call: " + url.pathname);
  };
  const call = async (
    action,
    {
      body,
      token = "valid-token",
      path = "premium",
      extraHeaders = {},
      query = "",
      environment = env,
      clock = now,
    } = {},
  ) => {
    const url = `https://deep-cut.example/api/${path}?${path === "premium" ? "action=" + action : query}`;
    const response = await handlePremiumRequest(
      new Request(url, {
        method: body !== undefined ? "POST" : "GET",
        headers: {
          ...(token ? { Authorization: "Bearer " + token } : {}),
          ...extraHeaders,
        },
        ...(body !== undefined
          ? { body: typeof body === "string" ? body : JSON.stringify(body) }
          : {}),
      }),
      environment,
      { fetch: fetcher, now: clock, issues },
    );
    return { status: response.status, data: await response.json() };
  };
  return {
    call,
    calls,
    get row() {
      return row;
    },
    payment,
  };
}
const miniQuery = () => `mode=tumblr&date=${day}`;
test("membership configuration reveals readiness without exposing credentials", async () => {
  const h = harness();
  const off = await h.call("config", { environment: {}, token: null });
  assert.equal(off.data.configured, false);
  assert.equal(off.data.priceCents, 500);
  assert.equal(off.data.trialHours, 24);
  const on = await h.call("config");
  assert.equal(on.data.checkoutReady, true);
  assert.equal(on.data.publishableKey, env.STRIPE_PUBLISHABLE_KEY);
  assert.ok(!JSON.stringify(on).includes("sk_test"));
  const noHook = await h.call("config", {
    environment: { ...env, STRIPE_WEBHOOK_SECRET: "" },
  });
  assert.equal(noHook.data.checkoutReady, false);
  const noPublicKey = await h.call("config", {
    environment: { ...env, STRIPE_PUBLISHABLE_KEY: "" },
  });
  assert.equal(noPublicKey.data.checkoutReady, false);
});
test("protected era requests reject missing, forged and expired credentials", async () => {
  const h = harness();
  for (const token of [null, "forged-token"])
    assert.equal(
      (await h.call("", { path: "era", query: miniQuery(), token })).status,
      401,
    );
  assert.equal((await h.call("status", { environment: {} })).status, 503);
  assert.equal(h.row, null);
});
test("a free trial starts only explicitly and cannot be restarted after 24 hours", async () => {
  const h = harness();
  assert.equal((await h.call("status")).data.trialStarted, false);
  assert.equal(h.row, null);
  const started = await h.call("start-trial", { body: {} });
  assert.equal(started.data.canPlay, true);
  const first = h.row.trial_started_at;
  const again = await h.call("start-trial", {
    body: {},
    clock: current + TRIAL_MS + 1,
  });
  assert.equal(h.row.trial_started_at, first);
  assert.equal(again.data.canPlay, false);
  assert.equal(
    (
      await h.call("", {
        path: "era",
        query: `mode=tumblr&date=${dayKey(new Date(current + TRIAL_MS + 1))}`,
        clock: current + TRIAL_MS + 1,
      })
    ).status,
    402,
  );
});
test("trial expiration is 24 elapsed hours across daylight saving changes", () => {
  const first = "2026-11-01T04:30:00Z",
    start = Date.parse(first);
  assert.equal(trialActive(first, start + TRIAL_MS - 1), true);
  assert.equal(trialActive(first, start + TRIAL_MS), false);
  assert.equal(trialActive(first, start - 1), false);
  assert.equal(trialActive("invalid", start), false);
});
test("all three eras are served during a trial; future and past dates are rejected", async () => {
  const h = harness({
    member: {
      user_id: userId,
      trial_started_at: new Date(current).toISOString(),
    },
  });
  for (const mode of ["tumblr", "youtube", "modern"]) {
    const r = await h.call("", {
      path: "era",
      query: `mode=${mode}&date=${day}`,
    });
    assert.equal(r.status, 200);
    assert.equal(r.data.questions.length, 5);
    assert.equal(r.data.mode, mode);
  }
  assert.equal(
    (await h.call("", { path: "era", query: "mode=tumblr&date=2026-10-14" }))
      .status,
    400,
  );
  assert.equal(
    (await h.call("", { path: "era", query: "mode=tumblr&date=2026-10-12" }))
      .status,
    400,
  );
});
test("approved dated premium games are served instead of the archive, while drafts fall back", async () => {
  const issues = await loadIssues();
  const issue = structuredClone(issues[day]);
  issue.status = "approved";
  const h = harness({
    member: {
      user_id: userId,
      trial_started_at: new Date(current).toISOString(),
    },
    issues: { [day]: issue },
  });
  const result = await h.call("", { path: "era", query: miniQuery() });
  assert.equal(result.data.theme, issue.theme);
  assert.equal(result.data.version, `${issue.id}-r1`);
  assert.deepEqual(
    new Set(result.data.questions.map((q) => q.id)),
    new Set(issue.games.tumblr.map((q) => q.id)),
  );
});
test("checkout uses exactly a one-time $5 price and the verified account", async () => {
  const h = harness();
  const created = await h.call("checkout", { body: {} });
  assert.equal(created.status, 200);
  assert.deepEqual(created.data, {
    client_secret: "cs_test_new_secret_mock",
    session_id: "cs_test_new",
  });
  const c = h.calls.find(
    (c) => new URL(c.url).pathname === "/v1/checkout/sessions",
  );
  const body = new URLSearchParams(c.body);
  assert.equal(body.get("mode"), "payment");
  assert.equal(body.get("client_reference_id"), userId);
  assert.equal(body.get("line_items[0][price]"), env.STRIPE_PRICE_ID);
  assert.equal(body.get("line_items[0][quantity]"), "1");
  assert.equal(body.get("metadata[user_id]"), userId);
  assert.equal(body.get("ui_mode"), "form");
  assert.equal(body.get("billing_address_collection"), "auto");
  assert.equal(body.get("phone_number_collection[enabled]"), "false");
  assert.equal(body.get("automatic_tax[enabled]"), "false");
  assert.equal(body.get("submit_type"), "auto");
  assert.equal(body.get("integration_identifier"), "custom_embedded_web_0001");
  for (const field of ["success_url", "cancel_url", "customer_email", "payment_method_types[0]", "payment_method_collection"])
    assert.equal(body.has(field), false);
  assert.equal(c.headers["Stripe-Version"], "2026-03-25.dahlia; custom_checkout_payment_form_preview=v1");
  for (const invalid of [
    { active: true, unit_amount: 600, currency: "usd" },
    { active: true, unit_amount: 500, currency: "eur" },
    {
      active: true,
      unit_amount: 500,
      currency: "usd",
      recurring: { interval: "month" },
    },
  ])
    assert.equal(
      (await harness({ price: invalid }).call("checkout", { body: {} })).status,
      503,
    );
});
test("tampered, unpaid, refunded or someone else's receipt never grants access", async () => {
  const variations = [
    (p) => (p.client_reference_id = "someone-else"),
    (p) => (p.metadata.user_id = "someone-else"),
    (p) => (p.payment_status = "unpaid"),
    (p) => (p.amount_total = 0),
    (p) => (p.currency = "eur"),
    (p) => (p.mode = "subscription"),
    (p) => (p.line_items.data[0].price.id = "price_other"),
    (p) => (p.payment_intent.latest_charge.amount_refunded = 500),
  ];
  for (const modify of variations) {
    const payment = receipt();
    modify(payment);
    assert.equal(receiptIsValid(payment, userId, env.STRIPE_PRICE_ID), false);
    const h = harness({ payment });
    assert.equal(
      (await h.call("verify", { body: { session_id: "cs_test_owned" } }))
        .status,
      403,
    );
    assert.equal(h.row, null);
  }
});
test("verified payment unlocks all eras and refund checks revoke paid access", async () => {
  const member = {
    user_id: userId,
    trial_started_at: new Date(current - TRIAL_MS - 1).toISOString(),
  };
  const h = harness({ member });
  const r = await h.call("verify", { body: { session_id: "cs_test_owned" } });
  assert.equal(r.data.purchased, true);
  assert.equal(h.row.trial_started_at, member.trial_started_at);
  assert.equal((await h.call("status")).data.canPlay, true);
  h.payment.payment_intent.latest_charge.refunded = true;
  h.payment.payment_intent.latest_charge.amount_refunded = 500;
  assert.equal((await h.call("status")).data.purchased, false);
  assert.equal(
    (await h.call("", { path: "era", query: miniQuery() })).status,
    402,
  );
});
function signedEvent(event, now = current) {
  const raw = JSON.stringify(event),
    stamp = Math.floor(now / 1000);
  const sig = createHmac("sha256", env.STRIPE_WEBHOOK_SECRET)
    .update(`${stamp}.${raw}`)
    .digest("hex");
  return { raw, header: `t=${stamp},v1=${sig}` };
}
test("webhooks verify raw-body signatures and reject old or altered messages", () => {
  const e = signedEvent({ type: "checkout.session.completed" });
  assert.equal(
    validStripeSignature(e.raw, e.header, env.STRIPE_WEBHOOK_SECRET, current),
    true,
  );
  assert.equal(
    validStripeSignature(
      e.raw + " ",
      e.header,
      env.STRIPE_WEBHOOK_SECRET,
      current,
    ),
    false,
  );
  assert.equal(validStripeSignature(e.raw, e.header, "wrong", current), false);
  assert.equal(
    validStripeSignature(
      e.raw,
      e.header,
      env.STRIPE_WEBHOOK_SECRET,
      current + 301000,
    ),
    false,
  );
});
test("webhook fulfillment survives a closed checkout tab and is idempotent", async () => {
  const h = harness();
  const e = signedEvent({
    type: "checkout.session.completed",
    data: { object: { id: "cs_test_owned" } },
  });
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await h.call("", {
          path: "stripe-webhook",
          token: null,
          body: e.raw,
          extraHeaders: { "stripe-signature": e.header },
        })
      ).status,
      200,
    );
  assert.equal(h.row.stripe_session_id, "cs_test_owned");
  assert.equal((await h.call("status")).data.purchased, true);
  const invalid = harness();
  assert.equal(
    (
      await invalid.call("", {
        path: "stripe-webhook",
        token: null,
        body: e.raw,
        extraHeaders: { "stripe-signature": "invalid" },
      })
    ).status,
    400,
  );
  assert.equal(invalid.row, null);
});
test("API refuses cross-origin mutations and oversized input", async () => {
  const h = harness();
  assert.equal(
    (
      await h.call("start-trial", {
        body: {},
        extraHeaders: { Origin: "https://other.example" },
      })
    ).status,
    403,
  );
  assert.equal(
    (await h.call("start-trial", { body: "x".repeat(5000) })).status,
    413,
  );
  assert.equal(h.row, null);
});
