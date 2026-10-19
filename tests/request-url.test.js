import test from "node:test";
import assert from "node:assert/strict";
import { publicRequestURL } from "../server/request-url.mjs";
import { handlePremiumRequest } from "../server/premium.mjs";

test("Node hosting preserves the configured HTTPS origin behind a TLS proxy", async () => {
  const site = "https://fandom-files-example.onrender.com/";
  const url = publicRequestURL("/api/premium?action=config", "fandom-files-example.onrender.com", site);
  assert.equal(url.origin, new URL(site).origin);
  const response = await handlePremiumRequest(new Request(url, { headers: { origin: new URL(site).origin } }), {});
  assert.equal(response.status, 200);
});

test("a different origin remains rejected on the new host", async () => {
  const url = publicRequestURL("/api/premium?action=config", "fandom-files-example.onrender.com", "https://fandom-files-example.onrender.com/");
  const response = await handlePremiumRequest(new Request(url, { headers: { origin: "https://another.example" } }), {});
  assert.equal(response.status, 403);
});

test("a mismatched or malformed site URL never changes the incoming host", () => {
  assert.equal(publicRequestURL("/api/premium", "localhost:3000", "https://example.com").origin, "http://localhost:3000");
  assert.equal(publicRequestURL("/", "localhost:3000", "invalid").origin, "http://localhost:3000");
  assert.equal(publicRequestURL("/", "localhost:3000").origin, "http://localhost:3000");
});

test("absolute and protocol-relative request targets cannot bypass the origin check", () => {
  for (const path of ["//other.example/api/premium", "https://other.example/api/premium"])
    assert.throws(() => publicRequestURL(path, "fandom-files-example.onrender.com", "https://fandom-files-example.onrender.com/"));
});
