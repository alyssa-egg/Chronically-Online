import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyCode,
  memberStatus,
  signedIn,
  syncSessionFromStorage,
  forgetSession,
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
