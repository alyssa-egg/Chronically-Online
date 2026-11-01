import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {capsuleQuestions,capsuleRounds,validateCapsuleBank,dailyCapsule,infiniteCapsule,capsuleFilters,filterCapsuleQuestions,newCapsule,capsuleState,beginCapsule,hintCapsule,answerCapsule,capsuleScore,capsuleResult,capsuleHistory,capsulePersonal,capsuleMatch,capsuleQuestion,makeCapsuleChallenge,readCapsuleChallenge,compareCapsuleChallenge,capsuleEraProgress,capsuleRank} from '../src/capsule.js';
const day='2026-11-01',now=Date.parse(day+'T17:00:00Z');
const complete=(spec,options={})=>{let state=beginCapsule(null,spec,now);for(let i=0;i<5;i++){state=answerCapsule(state,spec,options.wrong?(capsuleQuestion(spec.questionIds[i]).format==='choice'?capsuleQuestion(spec.questionIds[i]).options.find(a=>a!==capsuleQuestion(spec.questionIds[i]).answer):'unlisted answer'):capsuleQuestion(spec.questionIds[i]).answer,now+(i+1)*1000);if(i<4)state=beginCapsule(state,spec,now+(i+1)*1000);}return state;};
test('sixty curated questions validate, cover five daily formats and all requested filters',()=>{
 assert.equal(capsuleQuestions.length,60);assert.deepEqual(validateCapsuleBank(),[]);assert.equal(new Set(capsuleQuestions.map(q=>q.id)).size,60);
 for(const round of capsuleRounds)assert(capsuleQuestions.filter(q=>q.round===round.id).length>=12);
 for(const [filter]of capsuleFilters)assert(filterCapsuleQuestions(filter).length>=5);
 for(const q of capsuleQuestions){assert(q.sources.length);assert(capsuleMatch(q,q.answer));for(const alias of q.aliases)assert(capsuleMatch(q,alias),`${q.id}: ${alias}`);}
});
test('daily order is stable across refresh, with every round type in sequence and a twelve-day content rotation',()=>{
 const spec=dailyCapsule(day);assert.deepEqual(spec,dailyCapsule(day));assert.deepEqual(spec.questionIds.map(id=>capsuleQuestion(id).round),['era','soundtrack','before','file','deep']);
 const days=Array.from({length:12},(_,i)=>dailyCapsule(new Date(Date.parse(day)+i*86400000).toISOString().slice(0,10)));
 for(let slot=0;slot<5;slot++)assert.equal(new Set(days.map(d=>d.questionIds[slot])).size,12);
 assert.throws(()=>dailyCapsule('2026-02-30'));
});
test('correctness leads the score; hints cost points and harder questions have a larger speed window',()=>{
 for(const q of capsuleQuestions){assert.equal(capsuleScore(q,q.answer,0,1000).score,20);assert.equal(capsuleScore(q,q.answer,0,100000).score,18);assert.equal(capsuleScore(q,'not correct',0,0).score,0);for(let h=0;h<=q.hints.length;h++){const s=capsuleScore(q,q.answer,h,100000);assert(s.score>=12&&s.score<=20);}}
 const easy=capsuleQuestions.find(q=>q.difficulty===1),expert=capsuleQuestions.find(q=>q.difficulty===4);assert.equal(capsuleScore(easy,easy.answer,0,22000).speed,1);assert.equal(capsuleScore(expert,expert.answer,0,22000).speed,2);
 assert.equal(capsuleMatch(capsuleQuestion('sound-pain'),'paon'),true);assert(capsuleMatch(capsuleQuestion('sound-pain'),'the song Pain by PinkPantheress'));assert(capsuleMatch(capsuleQuestion('sound-pain'),'PinkPantheress - Pain (Official Audio)'));assert(capsuleMatch(capsuleQuestion('sound-boys-liar'),'boys a liar part two by PinkPantheress'));assert.equal(capsuleMatch(capsuleQuestion('sound-pain'),'Pain by Taylor Swift'),false);assert.equal(capsuleMatch(capsuleQuestion('sound-505'),'506'),false);
});
test('feedback pauses the clock, hints and drafts survive reload, and completion is idempotent',()=>{
 const spec=dailyCapsule(day);let state=beginCapsule(null,spec,now);state={...state,draft:'my reference'};state=hintCapsule(state,spec);assert.equal(capsuleState(state,spec).hints,1);assert.equal(capsuleState(state,spec).draft,'my reference');
 state=answerCapsule(state,spec,capsuleQuestion(spec.questionIds[0]).answer,now+5000);assert(state.awaitingNext);assert.equal(state.currentStarted,null);assert.deepEqual(answerCapsule(state,spec,'wrong',now+6000),state);
 state=beginCapsule(state,spec,now+60000);assert.equal(state.currentStarted,now+60000);state=answerCapsule(state,spec,capsuleQuestion(spec.questionIds[1]).answer,now+61000);assert.equal(state.records[1].elapsedMs,1000);
 const done=complete(spec);assert.equal(capsuleResult(done).score,100);assert.equal(capsuleResult(done).correct,5);assert.deepEqual(answerCapsule(done,spec,'wrong',now+999999),done);
 const bad=structuredClone(done);bad.records[0].score=999;bad.records[0].correct=false;assert.equal(capsuleResult(capsuleState(bad,spec)).score,100);assert.equal(capsuleState({...done,records:[null]},spec).records.length,0);
});
test('infinite sets are curated, filtered, progressively harder and do not repeat the last set when enough content exists',()=>{
 for(const [filter]of capsuleFilters){const first=infiniteCapsule({filter,seed:'first',day}),second=infiniteCapsule({filter,seed:'second',day,seen:first.questionIds,last:first.questionIds,round:1});assert.equal(new Set(first.questionIds).size,5);assert(first.questionIds.every(id=>filterCapsuleQuestions(filter).some(q=>q.id===id)));assert(second.questionIds.every(id=>!first.questionIds.includes(id)),filter);}
 const warm=infiniteCapsule({seed:'warm',round:0,day}),hard=infiniteCapsule({seed:'hard',round:8,day});assert(warm.questionIds.reduce((n,id)=>n+capsuleQuestion(id).difficulty,0)<hard.questionIds.reduce((n,id)=>n+capsuleQuestion(id).difficulty,0));assert(hard.questionIds.every(id=>capsuleQuestion(id).difficulty===4));
});
test('daily completion, personal records, milestones and era progress come from real completed rounds',()=>{
 const history=Array.from({length:7},(_,i)=>complete(dailyCapsule(new Date(Date.parse(day)+i*86400000).toISOString().slice(0,10))));const stats=capsulePersonal([...history,history[0]],'2026-11-07');assert.equal(stats.daily.length,7);assert.equal(stats.streak.streak,7);assert.equal(stats.points,700);assert.equal(stats.best,100);assert(stats.badges.find(b=>b.id==='first-file').earned);assert(stats.badges.find(b=>b.id==='seven-days').earned);assert(stats.badges.find(b=>b.id==='perfect').earned);
 const missed=capsulePersonal(history,'2026-11-09');assert.equal(missed.streak.streak,0);assert.equal(missed.streak.best,7);assert.equal(missed.total,7);assert.equal(capsuleHistory([null,{},...history],day).length,1);
 const loss=complete(dailyCapsule('2026-11-08'),{wrong:true});assert.equal(capsulePersonal([...history,loss],'2026-11-08').streak.streak,8);assert.equal(capsuleRank(100),'Chronically Online Legend');assert.equal(capsuleRank(0),'Internet Newbie');
 const eraSpec=infiniteCapsule({filter:'fandom-years',seed:'era',day}),done=complete(eraSpec),progress=capsuleEraProgress([done],'fandom-years');assert.equal(progress.seen,5);assert.equal(progress.accuracy,100);assert.equal(progress.chapters,1);
});
test('friend links preserve the exact five IDs, have deterministic comparisons, and reject invalid versions or forged shapes',()=>{
 const state=complete(dailyCapsule(day)),token=makeCapsuleChallenge(state,'mutual ♥','test-nonce-123'),challenge=readCapsuleChallenge(token);assert.deepEqual(challenge.ids,state.questionIds);assert.equal(challenge.name,'mutual ♥');assert.equal(challenge.score,100);assert.equal(compareCapsuleChallenge({score:99,time:1},challenge),'friend');assert.equal(compareCapsuleChallenge({score:100,time:challenge.time-1},challenge),'you');assert.equal(compareCapsuleChallenge({score:100,time:challenge.time},challenge),'tie');
 assert.equal(readCapsuleChallenge('not valid!'),null);assert.equal(readCapsuleChallenge('a'.repeat(3001)),null);const wrong={...challenge,bank:'future-version'};assert.equal(readCapsuleChallenge(Buffer.from(JSON.stringify(wrong)).toString('base64url')),null);
 assert.throws(()=>makeCapsuleChallenge(newCapsule(dailyCapsule(day)),'hi','test-nonce-123'));
});
test('capsule dates follow each player’s local calendar across DST, without changing older Eastern games',()=>{
 const script=`import{capsuleDay,capsuleReset}from'./src/capsule.js';const d=new Date(process.argv[1]);console.log(JSON.stringify([capsuleDay(d),capsuleReset(d).toISOString()]));`;
 const run=(TZ,date)=>JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',script,date],{cwd:new URL('../',import.meta.url),env:{...process.env,TZ}}));
 assert.deepEqual(run('America/New_York','2026-11-01T04:00:00Z'),['2026-11-01','2026-11-02T05:00:00.000Z']);assert.equal(run('America/Los_Angeles','2026-11-01T05:00:00Z')[0],'2026-10-31');assert.equal(run('Asia/Tokyo','2026-11-01T05:00:00Z')[0],'2026-11-01');
});

test('heavy Infinite Archive play does not discard a daily completion, personal best or lifetime points',()=>{
 const daily=complete(dailyCapsule(day));const extras=Array.from({length:510},(_,i)=>complete({...infiniteCapsule({seed:'history-'+i,day}),id:'history-'+i}));
 const stats=capsulePersonal([daily,...extras],day);assert.equal(stats.total,511);assert.equal(stats.daily.length,1);assert.equal(stats.points,51100);assert.equal(stats.streak.streak,1);
});

test('timezone travel never deletes a previously completed future-labelled local date',()=>{
 const record=complete(dailyCapsule('2026-11-02'));
 assert.equal(capsuleHistory([record],'2026-11-01').length,0);
 const kept=capsuleHistory([record],'2026-11-01',{includeFuture:true});assert.equal(kept.length,1);
 assert.equal(capsulePersonal(kept,'2026-11-01').total,1);assert.equal(capsulePersonal(kept,'2026-11-02').streak.streak,1);
});

test('each era can finish all three chapters, including folders with fewer than fifteen questions',()=>{
 for(const era of ['fandom-years','influencer-era','current-lore']){const pool=filterCapsuleQuestions(era),records=[];
  for(let i=0;i<pool.length;i+=5){const ids=pool.slice(i,i+5).map(q=>q.id);for(const q of pool){if(ids.length===5)break;if(!ids.includes(q.id))ids.push(q.id);}records.push(complete({id:`world-${era}-${i}`,day,mode:'infinite',filter:era,questionIds:ids}));}
  const progress=capsuleEraProgress(records,era);assert.equal(progress.seen,pool.length);assert.equal(progress.chapters,3);assert.equal(progress.accuracy,100);
 }
});
