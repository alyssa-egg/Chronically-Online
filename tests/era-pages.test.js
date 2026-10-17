import test from 'node:test';
import assert from 'node:assert/strict';
import { handleEraPagesRequest } from '../server/era-pages.mjs';
import { originalImageURL, logoPlacement } from '../src/site-identity.js';
import { handleArticleRequest } from '../server/articles.mjs';

test('era images and identity are read-only, published CMS data without an editor credential', async () => {
  let call;
  const r = await handleEraPagesRequest(new Request('https://example.test/api/era-pages'), { fetcher: async (url, options) => { call = { url, options }; return Response.json({ result: { eras: [], identity: null } }); } });
  assert.equal(r.status, 200); assert.equal(call.url.searchParams.get('perspective'), 'published');
  assert.match(call.url.searchParams.get('query'), /!\(_id in path\("drafts\.\*\*"\)\)/); assert.equal(call.options.headers, undefined);
  const write = await handleEraPagesRequest(new Request('https://example.test/api/era-pages', { method: 'POST' }), { fetcher: () => assert.fail('write reached CMS') }); assert.equal(write.status, 405);
});
test('a CMS failure does not leak private provider errors', async () => {
  const response = await handleEraPagesRequest(new Request('https://example.test/api/era-pages'), { fetcher: () => { throw new Error('private editor detail'); } });
  assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /private editor/);
});
test('original image URLs preserve the source asset with no image processing or arbitrary hosts', () => {
  assert.equal(originalImageURL({ asset: { _ref: 'image-abc123-1919x644-jpg' } }), 'https://cdn.sanity.io/images/rjg4g3cl/production/abc123-1919x644.jpg');
  assert.equal(originalImageURL({ asset: { _ref: 'https://evil.example/logo.png' } }), null);
  assert.equal(originalImageURL({ asset: { _ref: 'image-x-1x1-png" onerror="x' } }), null);
  assert.equal(logoPlacement({ asset: { _ref: 'image-abc123-1919x644-jpg' } }).naturalWidth, 1919);
});
test('new era filters include earlier article tags and radar only uses explicitly curated published articles', async () => {
  let call;
  const response = await handleArticleRequest(new Request('https://example.test/api/articles?era=2017-2020&radar=1'), { fetcher: async url => { call = url; return Response.json({ result: { articles: [], total: 0 } }); } });
  assert.equal(response.status, 200); assert.deepEqual(JSON.parse(call.searchParams.get('$eras')), ['2017-2020', '2017-2019']);
  assert.match(call.searchParams.get('query'), /onRadar == true/); assert.match(call.searchParams.get('query'), /era in \$eras/);
});
