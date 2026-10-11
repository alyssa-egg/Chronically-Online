import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyCode,
  memberStatus,
  signedIn,
  syncSessionFromStorage,
  forgetSession,
  mountCheckoutForm,
  hasEmailLink,
  finishEmailLink,
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

test("email link sign-in clears URL credentials and validates the account before storing a session", async () => {
  const originalFetch = globalThis.fetch,
    originalStorage = globalThis.localStorage,
    originalHistory = globalThis.history;
  let stored = null, cleanUrl;
  globalThis.localStorage = {
    getItem: () => stored,
    setItem: (key, value) => { stored = value; },
    removeItem: () => { stored = null; },
  };
  globalThis.history = { state: null, replaceState: (state, title, url) => { cleanUrl = url; } };
  globalThis.fetch = async (address, options) => {
    assert.equal(new URL(address, "https://deepcutt.netlify.app").searchParams.get("action"), "status");
    assert.equal(options.headers.Authorization, "Bearer verified-link-token");
    assert.equal(stored, null);
    assert.equal(new URL(cleanUrl).hash, "#chapter=tumblr");
    return new Response(JSON.stringify({ email: "mutual@example.com", purchased: false, trialStarted: false }));
  };
  try {
    forgetSession();
    const url = new URL("https://deepcutt.netlify.app/?source=email#access_token=verified-link-token&refresh_token=verified-refresh&expires_in=3600&type=signup&chapter=tumblr");
    assert.equal(hasEmailLink(url), true);
    const member = await finishEmailLink(url);
    assert.equal(member.trialStarted, false);
    assert.equal(signedIn(), true);
    assert.equal(JSON.parse(stored).email, "mutual@example.com");
    assert.equal(JSON.parse(stored).refresh_token, "verified-refresh");
    assert.equal(new URL(cleanUrl).searchParams.get("source"), "email");
    assert.equal(new URL(cleanUrl).hash.includes("token"), false);
    const anchor = new URL("https://deepcutt.netlify.app/#era-tumblr");
    assert.equal(hasEmailLink(anchor), false);
    assert.equal(await finishEmailLink(anchor), null);
  } finally {
    forgetSession();
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
    globalThis.history = originalHistory;
  }
});

test("expired, incomplete and rejected email links never create a signed-in session", async () => {
  const originalFetch = globalThis.fetch,
    originalStorage = globalThis.localStorage,
    originalHistory = globalThis.history;
  let stored = null, cleanUrl, requests = 0;
  globalThis.localStorage = {
    getItem: () => stored,
    setItem: (key, value) => { stored = value; },
    removeItem: () => { stored = null; },
  };
  globalThis.history = { state: null, replaceState: (state, title, url) => { cleanUrl = url; } };
  globalThis.fetch = async () => {
    requests++;
    return new Response(JSON.stringify({ error: "Sign in again to open your eras." }), { status: 401 });
  };
  try {
    forgetSession();
    for (const fragment of [
      "error=access_denied&error_code=otp_expired&error_description=Expired+email+link",
      "access_token=untrusted&expires_in=3600",
      "access_token=untrusted&refresh_token=refresh&expires_in=-1",
      "access_token=untrusted&refresh_token=refresh&expires_in=invalid",
    ]) {
      await assert.rejects(finishEmailLink(new URL("https://deepcutt.netlify.app/#" + fragment)), /expired or is invalid/);
      assert.equal(new URL(cleanUrl).hash, "");
      assert.equal(signedIn(), false);
      assert.equal(stored, null);
    }
    assert.equal(requests, 0);
    await assert.rejects(finishEmailLink(new URL("https://deepcutt.netlify.app/#access_token=untrusted&refresh_token=refresh&expires_in=3600")), /Sign in again/);
    assert.equal(requests, 1);
    assert.equal(stored, null);
    assert.equal(signedIn(), false);
    assert.equal(new URL(cleanUrl).hash, "");
  } finally {
    forgetSession();
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
    globalThis.history = originalHistory;
  }
});

test("embedded form confirms once and delegates access to receipt verification", async () => {
  const originalStripe = globalThis.Stripe,
    originalLocation = globalThis.location;
  globalThis.location = new URL("https://deepcutt.netlify.app/?old=value#private-fragment");
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
              async confirm({ formConfirmEvent, returnUrl }) {
                assert.equal(formConfirmEvent, event);
                assert.equal(returnUrl, "https://deepcutt.netlify.app/?era_purchase=success&session_id=cs_test");
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
  } finally {
    globalThis.Stripe = originalStripe;
    globalThis.location = originalLocation;
  }
});

test("a failed payment stays in checkout and cannot unlock eras", async () => {
  const originalStripe = globalThis.Stripe,
    originalLocation = globalThis.location;
  globalThis.location = new URL("https://deepcutt.netlify.app/");
  let handler, failure, verified = false;
  globalThis.Stripe = () => ({
    initCheckoutFormSdk: () => ({
      createForm: () => ({ mount() {}, on(name, callback) { handler = callback; } }),
      loadActions: async () => ({ type: "success", actions: {
        confirm: async ({ returnUrl }) => {
          assert.equal(new URL(returnUrl).searchParams.get("session_id"), "cs_test");
          return { type: "error", error: { message: "Card declined" } };
        },
      } }),
    }),
  });
  try {
    await mountCheckoutForm({ isConnected: true }, { client_secret: "cs_test_secret", session_id: "cs_test" }, "pk_test_mock", {
      onComplete: async () => { verified = true; },
      onError: (error) => { failure = error.message; },
    });
    await handler({});
    assert.equal(failure, "Card declined");
    assert.equal(verified, false);
  } finally {
    globalThis.Stripe = originalStripe;
    globalThis.location = originalLocation;
  }
});
