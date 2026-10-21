import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyPuzzle } from '../src/puzzle.js';
import { dailyDeepCut } from '../src/deep-cut.js';
import { rememberDiscovery, rememberRound, rememberPuzzle, scrapbookProgress, scrapbookState } from '../src/scrapbook.js';
import { archiveWindow, archiveFileCard, fileStamp, pixelIcon } from '../src/archive-atoms.js';

test('only completed, valid daily rounds earn a stamp; a perfect no-clue answer has a separate stamp', () => {
  const day='2026-10-19', q=dailyDeepCut(day), value={questionId:q.id,hints:0,choice:null};
  assert.deepEqual(rememberRound({},day,value).earned,[]);
  const wrong=rememberRound({},day,{...value,choice:(q.answer+1)%4});
  assert.deepEqual(wrong.earned,['first-deep-cut']);
  const hinted=rememberRound({},day,{...value,choice:q.answer,hints:1});
  assert.deepEqual(hinted.earned,['first-deep-cut']);
  const perfect=rememberRound({},day,{...value,choice:q.answer});
  assert.deepEqual(perfect.earned,['first-deep-cut','no-clues']);
  assert.equal(rememberRound(perfect,day,{...value,choice:q.answer}).rounds.length,1);
});
test('discovery stamps require different opened files and actual exploration of all three eras', () => {
  let state=rememberDiscovery({},'fandom-years','reblog');
  state=rememberDiscovery(state,'fandom-years','reblog');assert.equal(state.discoveries.length,1);
  state=rememberDiscovery(state,'fandom-years','bethany');
  state=rememberDiscovery(state,'influencer-era','emma');
  assert(!state.earned.includes('three-eras'));
  state=rememberDiscovery(state,'current-lore','katseye');
  assert(state.earned.includes('three-eras'));assert(!state.earned.includes('five-files'));
  state=rememberDiscovery(state,'current-lore','brat');
  assert(state.earned.includes('five-files'));assert.equal(scrapbookProgress(state).discoveries,5);
});
test('corrupt progress cannot fabricate completion counts, while previously earned known stamps persist', () => {
  const state=scrapbookState({discoveries:[null,{era:'unknown',id:'fake'},{era:'fandom-years',id:'<script>'}],rounds:[null,{day:'2026-02-31',choice:1},{day:'2026-10-19',questionId:'unknown',hints:0,choice:0}],earned:['first-deep-cut','unknown','first-deep-cut']});
  assert.deepEqual(state.discoveries,[]);assert.deepEqual(state.rounds,[]);assert.deepEqual(state.earned,['first-deep-cut']);
  assert.equal(scrapbookProgress(state).rounds,0);
});
test('reusable window labels and file headings escape content; pixel icons cannot inject arbitrary SVG', () => {
  const html=archiveWindow('<script>title</script>','<p>trusted internal markup</p>');
  assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);
  const file=archiveFileCard({id:'clean',number:1,title:'<img onerror=x>',kind:'<script>',body:'<p>internal</p>'});
  assert.doesNotMatch(file,/<img|<script>/);assert.match(file,/&lt;img/);
  assert.doesNotMatch(fileStamp('<script>'),/<script>/);assert.doesNotMatch(pixelIcon('" onload="bad'),/onload/);
});

test('the renamed clue game awards stamps only for valid finished guesses and keeps existing earned stamps', () => {
  const day = '2026-10-21', puzzle = dailyPuzzle(day);
  for (const guesses of [[], ['a wrong reference'], [puzzle.answer, 'another guess'], [null, null, null, null, null, null, null]]) {
    assert.deepEqual(rememberPuzzle({}, day, guesses).earned, []);
  }
  assert.deepEqual(rememberPuzzle({}, 'invalid', [puzzle.answer]).earned, []);
  const lost = rememberPuzzle({}, day, Array(6).fill(null));
  assert.deepEqual(lost.earned, ['first-deep-cut']);
  const later = rememberPuzzle({}, day, [null, puzzle.answer]);
  assert.deepEqual(later.earned, ['first-deep-cut']);
  const first = rememberPuzzle({ earned: ['three-eras'] }, day, [puzzle.answer]);
  assert.deepEqual(first.earned, ['three-eras', 'first-deep-cut', 'no-clues']);
  assert.deepEqual(rememberPuzzle(first, day, [puzzle.answer]), first);
});
