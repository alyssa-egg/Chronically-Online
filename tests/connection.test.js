import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {connectionPuzzles,connectionSchedule,connectionOverrides} from '../src/connection-content.js';
import {connectionDay,connectionReset,dailyConnection,validateConnection,validateConnectionBank,connectionState,startConnection,submitConnection,connectionOutcome,shuffleConnection,connectionHistory,connectionPersonal,connectionShare} from '../src/connection.js';
import {eraPersonalityQuizzes,quizPersonalityResult,validQuizAnswers} from '../src/quiz-library.js';
const now=Date.parse('2026-11-01T17:00:00Z');
const ids=(puzzle,category)=>puzzle.tiles.filter(tile=>tile.category===category.id).map(tile=>tile.id);
function win(puzzle){let state=startConnection(null,puzzle,now);for(const [i,category] of puzzle.categories.entries())state=submitConnection(state,puzzle,ids(puzzle,category),now+(i+1)*1000).state;return state;}
test('every curated file has four explained groups, exactly sixteen unique tiles and a valid editable schedule',()=>{
 assert.deepEqual(validateConnectionBank(),[]);assert(connectionPuzzles.length>=4);assert(connectionSchedule.length>=28);
 for(const puzzle of connectionPuzzles){assert.deepEqual(validateConnection(puzzle),[]);assert.equal(new Set(puzzle.categories.flatMap(c=>c.tiles)).size,16);}
 const copy=structuredClone(connectionPuzzles[0]);copy.categories[1].tiles[0]=copy.categories[0].tiles[0];assert(validateConnection(copy).some(error=>error.includes('duplicate')));
 assert(validateConnection({...copy,categories:[]}).length);assert(validateConnection(null).length);
});
test('date selection and initial shuffle are stable across refresh, and future overrides leave earlier dates unchanged',()=>{
 const first=dailyConnection('2026-11-01');assert.equal(first.number,1);assert.deepEqual(first,dailyConnection('2026-11-01'));assert.notEqual(first.id,dailyConnection('2026-11-02').id);
 const tiles=first.tiles.map(t=>t.id),order=shuffleConnection(tiles,first.day);assert.deepEqual(order,shuffleConnection(tiles,first.day));assert.deepEqual([...order].sort(),[...tiles].sort());assert.notDeepEqual(order,tiles);
 connectionOverrides['2026-12-10']=connectionPuzzles[2].id;try{assert.equal(dailyConnection('2026-12-10').id,connectionPuzzles[2].id);assert.deepEqual(dailyConnection('2026-11-01'),first);}finally{delete connectionOverrides['2026-12-10'];}
 assert.throws(()=>dailyConnection('2026-02-30'));
});
test('four correct sets close a file exactly once, and results are derived from guesses rather than client-supplied flags',()=>{
 const puzzle=dailyConnection('2026-11-01'),done=win(puzzle);assert.equal(connectionOutcome(done).won,true);assert.equal(connectionOutcome(done).mistakes,0);assert.equal(done.completedAt,now+4000);
 assert.deepEqual(submitConnection(done,puzzle,ids(puzzle,puzzle.categories[0]),now+9000).state,done);
 const tampered=structuredClone(done);tampered.guesses.forEach(g=>{g.correct=false;g.category='fake';});assert.deepEqual(connectionState(tampered,puzzle),done);
 assert.deepEqual(connectionState(done,dailyConnection('2026-11-02')).guesses,[]);
});
test('four distinct misses close the file; duplicate guesses and invalid selections do not consume mistakes',()=>{
 const puzzle=dailyConnection('2026-11-01');let state=startConnection(null,puzzle,now);
 const wrongs=[['tile-0','tile-1','tile-4','tile-8'],['tile-0','tile-2','tile-5','tile-9'],['tile-0','tile-3','tile-6','tile-10'],['tile-1','tile-2','tile-7','tile-11']];
 state=submitConnection(state,puzzle,wrongs[0],now+1000).state;
 const duplicate=submitConnection(state,puzzle,[...wrongs[0]].reverse(),now+2000);assert.match(duplicate.message,/already tried/);assert.equal(connectionOutcome(duplicate.state).mistakes,1);
 for(const invalid of [[],Array(4).fill('tile-0'),['bad','tile-1','tile-2','tile-3']])assert.deepEqual(submitConnection(state,puzzle,invalid).state,state);
 for(let i=1;i<4;i++)state=submitConnection(state,puzzle,wrongs[i],now+i*1000).state;
 assert.equal(connectionOutcome(state).done,true);assert.equal(connectionOutcome(state).won,false);assert.equal(connectionOutcome(state).remaining,0);
 assert.deepEqual(submitConnection(state,puzzle,ids(puzzle,puzzle.categories[0])).state,state);
});
test('solved tiles cannot be reused, corrupt saves reset, and persisted progress retains its start and mistakes',()=>{
 const puzzle=dailyConnection('2026-11-01');let state=startConnection(null,puzzle,now);state=submitConnection(state,puzzle,ids(puzzle,puzzle.categories[0]),now+1000).state;
 assert.deepEqual(connectionState(state,puzzle),state);assert.deepEqual(submitConnection(state,puzzle,ids(puzzle,puzzle.categories[0])).state,state);
 for(const corrupt of [{...state,guesses:Array(8).fill(state.guesses[0])},{...state,guesses:[null]},{...state,guesses:[{tiles:['bad'],at:now}]}])assert.equal(connectionState(corrupt,puzzle).guesses.length,0);
 assert.equal(startConnection(state,puzzle,now+99999).startedAt,now);
});
test('local calendar resets handle both DST transitions and players in different timezones',()=>{
 const script=`import {connectionDay,connectionReset} from './src/connection.js';const date=new Date(process.argv[1]);console.log(JSON.stringify({day:connectionDay(date),reset:connectionReset(date).toISOString()}));`;
 const run=(zone,date)=>JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',script,date],{cwd:new URL('../',import.meta.url),env:{...process.env,TZ:zone}}));
 assert.equal(run('America/Los_Angeles','2026-11-01T05:00:00Z').day,'2026-10-31');assert.equal(run('Asia/Tokyo','2026-11-01T05:00:00Z').day,'2026-11-01');
 assert.equal(run('America/New_York','2026-11-01T04:00:00Z').reset,'2026-11-02T05:00:00.000Z');
 assert.equal(run('America/New_York','2026-03-08T05:00:00Z').reset,'2026-03-09T04:00:00.000Z');
});
test('history uses real completed files, deduplicates dates, and keeps history when a solve streak ends',()=>{
 const records=['2026-11-01','2026-11-02','2026-11-03'].map(day=>win(dailyConnection(day)));
 assert.equal(connectionHistory([null,{},...records,records[0]],'2026-11-03').length,3);
 assert.equal(connectionHistory(records,'2026-11-01').length,1);
 const kept=connectionPersonal(records,'2026-11-04');assert.equal(kept.streak.streak,3);assert.equal(kept.wins,3);
 const missed=connectionPersonal(records,'2026-11-05');assert.equal(missed.streak.streak,0);assert.equal(missed.completed,3);assert.equal(missed.streak.best,3);
 const puzzle=dailyConnection('2026-11-04');let lost=startConnection(null,puzzle,now);
 for(const selection of [[0,1,4,8],[0,2,5,9],[0,3,6,10],[1,2,7,11]])lost=submitConnection(lost,puzzle,selection.map(i=>`tile-${i}`),now+1000).state;
 assert.equal(connectionPersonal([...records,lost],'2026-11-04').streak.streak,0);
});
test('share text uses actual result and elapsed time, without revealing categories or tile labels',()=>{
 const puzzle=dailyConnection('2026-11-01'),state=win(puzzle),share=connectionShare(puzzle,state,'https://example.test');
 assert(share.includes('Filed: 4/4'));assert(share.includes('Mistakes: 0/4'));assert(share.includes('0:04'));assert(share.includes('https://example.test/play/'));
 for(const category of puzzle.categories){assert(!share.includes(category.name));for(const tile of category.tiles)assert(!share.includes(tile));}
});
test('three era personality quizzes have eight questions, valid choices and three genuinely distinct outcomes',()=>{
 assert.equal(eraPersonalityQuizzes.length,3);
 for(const quiz of eraPersonalityQuizzes){assert.equal(quiz.questions.length,8);assert.equal(new Set(quiz.profiles.map(p=>p.description)).size,3);
  for(let choice=0;choice<3;choice++){const answers=Array(8).fill(choice);assert(validQuizAnswers(quiz,answers,true));const result=quizPersonalityResult(quiz,answers);assert.equal(result.profileId,quiz.profiles[choice].id);assert.equal(result.id,quiz.era);}
  assert.throws(()=>quizPersonalityResult(quiz,[0]));assert.equal(validQuizAnswers(quiz,Array(8),true),false);
  const tied=[1,0,1,0,1,0,2,2];assert.equal(quizPersonalityResult(quiz,tied).profileId,quiz.profiles[1].id);
 }
});
