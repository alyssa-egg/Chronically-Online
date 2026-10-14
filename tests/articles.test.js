import test from "node:test";
import assert from "node:assert/strict";
import { handleArticleRequest } from "../server/articles.mjs";
import { renderBody, imageURL, safeLink, storySlug, storyURL } from "../src/article-content.js";
import { articleLayout } from "../src/article-layout.js";

test("article reads use the public published perspective with publication-time and draft guards", async () => {
  const now = new Date("2026-10-13T20:00:00Z");
  let call;
  const response = await handleArticleRequest(new Request("https://fandomfiles.netlify.app/api/articles"), { now, fetcher: async (url, options) => {
    call = { url, options };
    return Response.json({ result: { articles: [{ title: "A real story", slug: "a-real-story" }], total: 1 } });
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
test("archive filtering searches real article text with bound parameters and paginates beyond the first page", async () => {
  let endpoint;
  const result = await handleArticleRequest(new Request("https://example.test/api/articles?category=style-files&era=2017-2019&q=Emma%20beauty&sort=recent&page=1"), { fetcher: async url => { endpoint = url; return Response.json({ result: { articles: [{ title: "A file on page two" }], total: 49 } }); } });
  assert.equal(result.status, 200);
  assert.equal((await result.json()).nextPage, 2);
  assert.equal(JSON.parse(endpoint.searchParams.get("$category")), "style-files");
  assert.equal(JSON.parse(endpoint.searchParams.get("$era")), "2017-2019");
  assert.deepEqual(JSON.parse(endpoint.searchParams.get("$search")), ["*Emma*", "*beauty*"]);
  assert.match(endpoint.searchParams.get("query"), /pt::text\(body\) match \$search/);
  assert.match(endpoint.searchParams.get("query"), /\[24\.\.\.48\]/);
  assert.match(endpoint.searchParams.get("query"), /count\(/);
  assert.doesNotMatch(endpoint.searchParams.get("query"), /Emma|beauty/);
});
test("invalid archive filters are rejected before contacting the CMS", async () => {
  for (const query of ["category=unknown", "era=all-time", "desk=unknown", "page=-1", "page=1.5", "page=Infinity", "q=" + "x".repeat(101)]) {
    const result = await handleArticleRequest(new Request("https://example.test/api/articles?" + query), { fetcher: async () => { assert.fail("Invalid input reached Sanity"); } });
    assert.equal(result.status, 400);
  }
});
test("the article template omits absent optional content, shows annotations, and disables preview actions", () => {
  const article = { title: "A real file", category: "lore", body: [{ _type: "annotation", title: "A note from the archive", text: '<script>alert("no")</script>' }] };
  const html = articleLayout(article);
  assert.match(html, /story-annotation/); assert.doesNotMatch(html, /<script|story-timeline|story-moodboard|story-poll|story-author|story-subtitle/);
  const preview = articleLayout({ ...article, subtitle: "A second line", poll: { question: "Remember this?", options: ["Yes", "No"] } }, { preview: true });
  assert.match(preview, /EDITOR PREVIEW \/ UNPUBLISHED CHANGES/);
  assert.match(preview, /story-subtitle/); assert.match(preview, /disabled data-poll-choice/);
  assert.match(preview, /story-actions" hidden/);
});
