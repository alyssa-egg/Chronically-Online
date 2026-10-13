import test from "node:test";
import assert from "node:assert/strict";
import { handleArticleRequest } from "../server/articles.mjs";
import { renderBody, imageURL, safeLink, storySlug, storyURL } from "../src/article-content.js";

test("article reads use the public published perspective with publication-time and draft guards", async () => {
  const now = new Date("2026-10-13T20:00:00Z");
  let call;
  const response = await handleArticleRequest(new Request("https://fandomfiles.netlify.app/api/articles"), { now, fetcher: async (url, options) => {
    call = { url, options };
    return Response.json({ result: [{ title: "A real story", slug: "a-real-story" }] });
  } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).articles.length, 1);
  assert.equal(call.url.hostname, "rjg4g3cl.api.sanity.io");
  assert.equal(call.url.searchParams.get("perspective"), "published");
  assert.match(call.url.searchParams.get("query"), /!\(_id in path\("drafts\.\*\*"\)\)/);
  assert.match(call.url.searchParams.get("query"), /publishedAt <= \$now/);
  assert.equal(JSON.parse(call.url.searchParams.get("$now")), now.toISOString());
  assert.equal(call.options.headers, undefined, "the reader endpoint must never send an editor token");
});
test("story lookup binds a slug parameter and applies the same guards to related stories", async () => {
  let endpoint;
  const response = await handleArticleRequest(new Request("https://fandomfiles.netlify.app/api/articles?slug=tumblr-years"), { fetcher: async url => { endpoint = url; return Response.json({ result: { title: "Tumblr Years" } }); } });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(endpoint.searchParams.get("$slug")), "tumblr-years");
  assert.match(endpoint.searchParams.get("query"), /relatedStories/);
  assert.match(endpoint.searchParams.get("query"), /body, timeline, moodboard, poll, sources/);
});
test("unpublished and invalid stories fail without leaking drafts or provider errors", async () => {
  const missing = await handleArticleRequest(new Request("https://example.test/api/articles?slug=missing"), { fetcher: async () => Response.json({ result: null }) });
  assert.equal(missing.status, 404);
  let fetched = false;
  const invalid = await handleArticleRequest(new Request("https://example.test/api/articles?slug=%22%5D%7C*"), { fetcher: async () => { fetched = true; } });
  assert.equal(invalid.status, 400); assert.equal(fetched, false);
  const down = await handleArticleRequest(new Request("https://example.test/api/articles"), { fetcher: async () => { throw new Error("private-token-and-internal-details"); } });
  assert.equal(down.status, 503); assert.doesNotMatch(await down.text(), /private-token/);
});
test("the public article endpoint is read-only", async () => {
  const result = await handleArticleRequest(new Request("https://example.test/api/articles", { method: "POST", body: "{}" }));
  assert.equal(result.status, 405);
});
test("article text and link annotations cannot inject HTML or script URLs", () => {
  const blocks = [{ _type: "block", style: "script", children: [{ _type: "span", text: '<img src=x onerror="alert(1)">', marks: ["bad", "strong"] }], markDefs: [{ _key: "bad", href: "javascript:alert(1)" }] }];
  const html = renderBody(blocks);
  assert.match(html, /&lt;img/); assert.doesNotMatch(html, /<img|<script|javascript:|<a /);
  assert.match(html, /<p><strong>/);
  assert.equal(safeLink("data:text/html,hello"), null);
  assert.equal(safeLink("https://user:secret@example.com"), null);
  assert.equal(safeLink("https://example.com/source"), "https://example.com/source");
});
test("portable text supports headings, lists, sources and closes lists around paragraphs", () => {
  const block = (text, extra = {}) => ({ _type: "block", children: [{ _type: "span", text }], ...extra });
  assert.equal(renderBody([block("One", { listItem: "bullet" }), block("Two", { listItem: "bullet" }), block("Context", { style: "h2" }), block("Three", { listItem: "number" })]), "<ul><li>One</li><li>Two</li></ul><h2>Context</h2><ol><li>Three</li></ol>");
});
test("only Sanity image references from the configured project can generate image URLs", () => {
  assert.equal(imageURL({ asset: { _ref: "https://evil.example/tracker" } }), null);
  assert.equal(imageURL({ asset: { _ref: "image-abc123-800x600-png" } }, 600), "https://cdn.sanity.io/images/rjg4g3cl/production/abc123-800x600.png?w=600&fit=max&auto=format");
  assert.equal(imageURL({ asset: { _ref: 'image-x-1x1-png" onerror="alert(1)' } }), null);
});
test("story routes accept clean slugs and reject path traversal", () => {
  assert.equal(storySlug("/stories/the-tumblr-years/"), "the-tumblr-years");
  assert.equal(storySlug("/stories/../../server/"), null);
  assert.equal(storySlug("/stories/not valid/"), null);
  assert.equal(storyURL("the-tumblr-years"), "/stories/the-tumblr-years/");
});
