import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyCode,
  memberStatus,
  signedIn,
  syncSessionFromStorage,
  forgetSession,
  mountCheckoutForm,
} from "../src/membership.js";
test("refreshed sign-in survives full storage and cross-tab sign-out drops its visit fallback", async () => {
  let old = JSON.stringify({
    access_token: "old-token",
    refresh_token: "old-refresh",
    expiresAt: 0,
  });
  const originalFetch = globalThis.fetch,
    originalStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: () => old,
    setItem() {
      throw new Error("Quota exceeded");
    },
    removeItem() {
      old = null;
    },
  };
  globalThis.fetch = async (address, options) => {
    const action = new URL(
      address,
      "https://deepcutt.netlify.app",
    ).searchParams.get("action");
    if (action === "auth-verify")
      return new Response(
        JSON.stringify({
          access_token: "new-token",
          refresh_token: "new-refresh",
          expires_in: 3600,
        }),
      );
    assert.equal(action, "status");
    assert.equal(options.headers.Authorization, "Bearer new-token");
    return new Response(JSON.stringify({ canPlay: false }));
  };
  try {
    await verifyCode("mutual@example.com", "123456");
    assert.equal(signedIn(), true);
    await memberStatus();
    old = null;
    syncSessionFromStorage();
    assert.equal(signedIn(), false);
  } finally {
    forgetSession();
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
  }
});

test("embedded form confirms once and delegates access to receipt verification", async () => {
  const originalStripe = globalThis.Stripe;
  const container = { isConnected: true };
  const checkoutSession = { client_secret: "cs_test_secret", session_id: "cs_test" };
  let handler, mounted, confirmations = 0, verified = 0, destroyed = 0;
  const event = { payment: "test" };
  globalThis.Stripe = (key, options) => {
    assert.equal(key, "pk_test_mock");
    assert.deepEqual(options.betas, ["custom_checkout_payment_form_1"]);
    return {
      async initCheckoutFormSdk({ clientSecret, appearance }) {
        assert.equal(await clientSecret, checkoutSession.client_secret);
        assert.equal(appearance.theme, "stripe");
        assert.equal(appearance.variables.colorPrimary, "#0570de");
        return {
          createForm(options) {
            assert.equal(options.layout, "expanded");
            return {
              mount(target) { mounted = target; },
              on(name, callback) { assert.equal(name, "confirm"); handler = callback; },
              destroy() { destroyed++; },
            };
          },
          async loadActions() {
            return { type: "success", actions: {
              async confirm({ formConfirmEvent }) {
                assert.equal(formConfirmEvent, event);
                confirmations++;
                return { type: "success" };
              },
            } };
          },
        };
      },
    };
  };
  try {
    const form = await mountCheckoutForm(container, checkoutSession, "pk_test_mock", {
      onComplete: async () => { verified++; },
      onError: (error) => { throw error; },
    });
    assert.equal(mounted, "#checkout-form");
    await Promise.all([handler(event), handler(event)]);
    assert.equal(confirmations, 1);
    assert.equal(verified, 1);
    container.isConnected = false;
    await handler(event);
    assert.equal(confirmations, 1);
    form.destroy();
    assert.equal(destroyed, 1);
  } finally { globalThis.Stripe = originalStripe; }
});

test("a failed payment stays in checkout and cannot unlock eras", async () => {
  const originalStripe = globalThis.Stripe;
  let handler, failure, verified = false;
  globalThis.Stripe = () => ({
    initCheckoutFormSdk: () => ({
      createForm: () => ({ mount() {}, on(name, callback) { handler = callback; } }),
      loadActions: async () => ({ type: "success", actions: {
        confirm: async () => ({ type: "error", error: { message: "Card declined" } }),
      } }),
    }),
  });
  try {
    await mountCheckoutForm({ isConnected: true }, { client_secret: "cs_test_secret" }, "pk_test_mock", {
      onComplete: async () => { verified = true; },
      onError: (error) => { failure = error.message; },
    });
    await handler({});
    assert.equal(failure, "Card declined");
    assert.equal(verified, false);
  } finally { globalThis.Stripe = originalStripe; }
});
