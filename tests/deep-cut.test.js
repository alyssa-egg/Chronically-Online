import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyDeepCut, localCalendarDay, deepCutState, deepCutScore, deepCutShare } from '../src/deep-cut.js';
import { deepCutQuestions } from '../src/deep-cut-questions.js';
import { discoveryEras } from '../src/era-discoveries.js';

test('the daily question uses the local calendar and stays the same throughout a date', () => {
  const date = new Date(2026, 9, 17, 23, 59, 59);
  assert.equal(localCalendarDay(date), '2026-10-17');
  assert.deepEqual(dailyDeepCut(localCalendarDay(date)), dailyDeepCut('2026-10-17'));
  assert.notEqual(dailyDeepCut('2026-10-17').id, dailyDeepCut('2026-10-18').id);
  for (const invalid of ['2026-02-30', 'not-a-day', '2026-2-3']) assert.throws(() => dailyDeepCut(invalid));
});
test('a full question rotation has no repeats, alternates eras and preserves correct answers after choice rotation', () => {
  const ids = new Set(), eras = new Set(discoveryEras.map(era => era.id));
  let previousEra;
  for (let i = 0; i < deepCutQuestions.length; i++) {
    const day = new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10), q = dailyDeepCut(day);
    assert(!ids.has(q.id)); ids.add(q.id); assert(eras.has(q.era)); assert.notEqual(q.era, previousEra); previousEra = q.era;
    const original = deepCutQuestions.find(item => item.id === q.id);
    assert.equal(q.options[q.answer], original.options[original.answer]);
    assert.equal(new Set(q.options).size, 4); assert.equal(q.hints.length, 3);
  }
  assert.equal(ids.size, 45);
});
test('daily progress rejects malformed, stale and out-of-range browser records', () => {
  const q = dailyDeepCut('2026-10-17');
  const clean = { questionId: q.id, hints: 0, choice: null };
  for (const value of [null, {}, { ...clean, questionId: 'different' }, { ...clean, hints: 4 }, { ...clean, hints: -1 }, { ...clean, choice: 4 }, { ...clean, choice: 1.5 }]) assert.deepEqual(deepCutState(value, q), clean);
  const complete = { ...clean, hints: 2, choice: q.answer }; assert.deepEqual(deepCutState(complete, q), complete);
});
test('clue penalties, wrong answers and share results do not expose the solution', () => {
  const day = '2026-10-17', q = dailyDeepCut(day);
  assert.equal(deepCutScore(q, { choice: q.answer, hints: 0 }), 100);
  assert.equal(deepCutScore(q, { choice: q.answer, hints: 3 }), 40);
  assert.equal(deepCutScore(q, { choice: (q.answer + 1) % 4, hints: 0 }), 0);
  const share = deepCutShare(day, q, { choice: q.answer, hints: 2 }, 'https://example.test');
  assert.match(share, /60\/100/); assert.match(share, /2\/3 clues/); assert.match(share, /https:\/\/example.test\/play\//);
  assert(!share.includes(q.options[q.answer]));
});
