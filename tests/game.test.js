import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyQuestions,dayKey,rank,scoreAnswers,bank} from '../src/game.js';
test('daily issue is deterministic with ten unique questions and all departments',()=>{const a=dailyQuestions('2026-10-10');assert.deepEqual(a,dailyQuestions('2026-10-10'));assert.equal(a.length,10);assert.equal(new Set(a.map(q=>q.id)).size,10);assert.equal(new Set(a.map(q=>q.category)).size,4);assert.notDeepEqual(a,dailyQuestions('2026-10-11'));});
test('shuffling preserves correct answer text',()=>{for(const q of dailyQuestions('2026-10-10'))assert.equal(q.options[q.answer],bank[q.id].options[bank[q.id].answer]);});
test('scoring handles perfect, wrong, and partial answers',()=>{const q=dailyQuestions('2026-10-10');assert.equal(scoreAnswers(q,q.map(x=>x.answer)),10);assert.equal(scoreAnswers(q,q.map(x=>(x.answer+1)%4)),0);assert.equal(scoreAnswers(q,[q[0].answer]),1);});
test('rank boundaries and UTC day rollover',()=>{assert.deepEqual([0,3,5,8,10].map(rank),['Has Wi-Fi','Casual Scroller','Certified Online','Lore Archivist','Internet Final Boss']);assert.equal(dayKey(new Date('2026-10-10T23:30:00-04:00')),'2026-10-11');});
