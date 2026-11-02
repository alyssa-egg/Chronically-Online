import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyFileBank,fileModes,validateDailyFiles,dailyFile,practiceFile,newDailyFile,restoreDailyFile,fileAction,filePotential,fileMatches,moveTimeline,timelineScore,dailyFileResult,dailyFilePersonal,dailyFileHistory,dailyFileShare} from '../src/daily-file.js';
const day='2026-11-02',start=1793638800000;
function solve(state,now){const q=dailyFileBank.find(q=>q.id===state.spec.ids[state.step]);return fileAction(state,q.mode==='rewind'?{type:'lock',order:q.answer}:{type:'guess',answer:q.answer},now);}
function complete(spec,at=start){let state=fileAction(newDailyFile(spec),{type:'start'},at);for(let i=0;i<spec.ids.length;i++){state=solve(state,at+5000+i*10000);if(!state.completedAt)state=fileAction(state,{type:'next'},at+10000+i*10000);}return state;}
test('curated files have sources, unambiguous timelines and enough variety at each difficulty',()=>{
  assert.deepEqual(validateDailyFiles(),[]);assert(dailyFileBank.length>=36);
  for(const q of dailyFileBank)if(q.mode!=='rewind'){assert(fileMatches(q,q.answer));for(const alias of q.aliases)assert(fileMatches(q,alias),alias);assert.equal(fileMatches(q,'unrelated answer'),null);}
});
test('daily selection is stable, ordered by mode, changes next day and uses the full 12-day starter bank',()=>{
  const seen=new Set();let previous;
  for(let i=0;i<120;i++){
    const date=new Date(Date.parse(day)+i*86400000).toISOString().slice(0,10),spec=dailyFile(date);
    assert.deepEqual(spec,dailyFile(date));assert.deepEqual(spec.ids.map(id=>dailyFileBank.find(q=>q.id===id).mode),fileModes.map(m=>m.id));
    if(previous)assert(spec.ids.every((id,n)=>id!==previous.ids[n]));previous=spec;spec.ids.forEach(id=>seen.add(id));
  }
  assert.equal(seen.size,36);assert.throws(()=>dailyFile('2026-02-30'));
  assert.throws(()=>newDailyFile({...dailyFile(day),ids:[...dailyFile(day).ids].reverse()}));
});
test('decode opens individual clues, charges each reveal once and keeps its clock and guess',()=>{
  let state=fileAction(newDailyFile(dailyFile(day)),{type:'start'},start);state.round.draft='my thought';
  state=fileAction(state,{type:'reveal',index:3},start+1000);assert.deepEqual(state.round.reveals,[3]);assert.equal(state.round.draft,'my thought');assert.equal(state.started,start);assert.equal(filePotential(state),85);
  assert.throws(()=>fileAction(state,{type:'reveal',index:3},start+2000));assert.throws(()=>fileAction(state,{type:'reveal',index:0},start+2000));
  state=solve(state,start+5000);assert.equal(state.records[0].score,85);assert.equal(state.records[0].elapsed,5000);
});
test('three unique guesses, meaningful wrong-guess costs and a correct final guess',()=>{
  let state=fileAction(newDailyFile(dailyFile(day)),{type:'start'},start);
  state=fileAction(state,{type:'guess',answer:'not this'},start+1000);assert.equal(filePotential(state),90);assert.equal(state.awaiting,false);
  assert.throws(()=>fileAction(state,{type:'guess',answer:'Not-this!'},start+2000),/tried/);
  state=fileAction(state,{type:'guess',answer:'not that'},start+3000);state=solve(state,start+4000);
  assert.equal(state.records[0].score,80);assert.equal(state.records[0].guesses.length,3);assert(state.records[0].correct);
  assert.throws(()=>fileAction(state,{type:'guess',answer:'anything'},start+5000));
});
test('three wrong guesses close the file without granting points; skips cannot build combos',()=>{
  let state=fileAction(newDailyFile(dailyFile(day)),{type:'start'},start);
  for(let i=0;i<3;i++)state=fileAction(state,{type:'guess',answer:'wrong '+i},start+1000+i);
  assert(state.awaiting);assert.equal(state.records[0].score,0);state=fileAction(state,{type:'next'},start+10000);state=fileAction(state,{type:'skip'},start+11000);state=fileAction(state,{type:'next'},start+12000);state=solve(state,start+14000);
  assert.equal(state.records[2].bonus,0);assert.equal(dailyFileResult(state).score,100);
});
test('soundtrack only permits progressive reveals and tolerates spelling without accepting artist-only guesses',()=>{
  const q=dailyFileBank.find(q=>q.id==='track-pain'),spec={...practiceFile('soundtrack',{seed:'sound',day}),ids:[q.id]};
  let state=fileAction(newDailyFile(spec),{type:'start'},start);
  assert.throws(()=>fileAction(state,{type:'reveal',index:2},start+100));
  for(let index=1;index<=3;index++)state=fileAction(state,{type:'reveal',index},start+index*100);
  assert.equal(filePotential(state),55);assert.equal(fileMatches(q,'paon'),'spelling');assert.equal(fileMatches(q,'PinkPantheress'),null);assert.equal(fileMatches(q,'suffering'),null);
  state=fileAction(state,{type:'guess',answer:'paon'},start+1000);assert.equal(state.records[0].score,55);assert.equal(state.records[0].match,'spelling');
});
test('timeline scoring rewards all ten relative pairs, exact ordering and valid five-card input',()=>{
  for(const q of dailyFileBank.filter(q=>q.mode==='rewind')){
    assert.deepEqual(timelineScore(q,q.answer),{pairs:10,correct:true,base:100});assert.deepEqual(timelineScore(q,[...q.answer].reverse()),{pairs:0,correct:false,base:0});
    const almost=[...q.answer];[almost[0],almost[1]]=[almost[1],almost[0]];assert.deepEqual(timelineScore(q,almost),{pairs:9,correct:false,base:72});
    assert.throws(()=>timelineScore(q,[...q.answer.slice(0,4),q.answer[0]]));
  }
});
test('timeline starts shuffled, supports moves and cannot be submitted twice',()=>{
  let state=fileAction(newDailyFile(dailyFile(day)),{type:'start'},start);state=solve(state,start+1000);state=fileAction(state,{type:'next'},start+2000);
  const q=dailyFileBank.find(q=>q.id===state.spec.ids[1]),order=[...state.round.order];assert.notDeepEqual(order,q.answer);
  state=moveTimeline(state,0,4);assert.equal(state.round.order[4],order[0]);assert.deepEqual(new Set(state.round.order),new Set(order));assert.deepEqual(moveTimeline(state,-1,4),state);
  state=fileAction(state,{type:'lock',order:q.answer},start+3000);assert.equal(state.records[1].score,105);assert.throws(()=>fileAction(state,{type:'lock',order:q.answer},start+4000));
});
test('three successful rounds earn genuine combo points; feedback time does not count',()=>{
  let state=fileAction(newDailyFile(dailyFile(day)),{type:'start'},start);state=solve(state,start+1000);state=fileAction(state,{type:'next'},start+60000);state=solve(state,start+62000);state=fileAction(state,{type:'next'},start+180000);state=solve(state,start+183000);
  assert.deepEqual(state.records.map(r=>r.score),[100,105,110]);assert.deepEqual(dailyFileResult(state),{score:315,base:300,bonus:15,time:6000,correct:3,max:315});assert(state.completedAt);assert.throws(()=>fileAction(state,{type:'next'},start+190000));
});
test('a partially correct rewind gets pair points, ends the combo, and retains the submitted order',()=>{
  let state=fileAction(newDailyFile(dailyFile(day)),{type:'start'},start);state=solve(state,start+1000);state=fileAction(state,{type:'next'},start+2000);const q=dailyFileBank.find(q=>q.id===state.spec.ids[1]),order=[...q.answer];[order[0],order[1]]=[order[1],order[0]];
  state=fileAction(state,{type:'lock',order},start+3000);assert.equal(state.records[1].score,72);assert.deepEqual(state.records[1].order,order);state=fileAction(state,{type:'next'},start+4000);state=solve(state,start+5000);assert.equal(state.records[2].bonus,0);
});
test('resume replays actions, preserves drafts/moved cards and recomputes records instead of trusting score fields',()=>{
  const spec=dailyFile(day);let state=fileAction(newDailyFile(spec),{type:'start'},start);state.round.draft='unfinished';state=fileAction(state,{type:'reveal',index:2},start+1000);
  assert.deepEqual(restoreDailyFile(JSON.parse(JSON.stringify(state)),spec),state);state=solve(state,start+2000);state=fileAction(state,{type:'next'},start+3000);state=moveTimeline(state,0,3);assert.deepEqual(restoreDailyFile(state,spec),state);
  const forged=structuredClone(state);forged.records[0].score=999999;assert.equal(restoreDailyFile(forged,spec).records[0].score,85);
  const invalid=structuredClone(state);invalid.events.push({type:'lock',order:['bad'],at:start+4000});assert.equal(restoreDailyFile(invalid,spec).events.length,0);assert.equal(restoreDailyFile(state,dailyFile('2026-11-03')).events.length,0);
});
test('practice difficulty and recent-file avoidance work in each mode; practice never replaces daily records',()=>{
  for(const mode of fileModes)for(const difficulty of [1,2,3]){
    const first=practiceFile(mode.id,{difficulty,day,seed:'first'}),next=practiceFile(mode.id,{difficulty,day,seed:'second',seen:first.ids,last:first.ids[0]});assert.notEqual(first.ids[0],next.ids[0]);assert.equal(dailyFileBank.find(q=>q.id===next.ids[0]).difficulty,difficulty);assert.equal(dailyFileResult(complete(first)).score,100);
  }
  const daily=complete(dailyFile(day)),practice=complete(practiceFile('decode',{day,seed:'new'}));const personal=dailyFilePersonal([daily,practice],day);assert.equal(personal.best,315);assert.equal(personal.daily.length,1);assert.equal(personal.history.length,2);
});
test('completion streaks count local daily dates, retain history and reject malformed saves',()=>{
  const yesterday=complete(dailyFile('2026-11-01')),today=complete(dailyFile(day),start+86400000),history=[yesterday,today,today,null,{spec:{},events:[]}];const personal=dailyFilePersonal(history,day);assert.equal(personal.streak.streak,2);assert.equal(personal.daily.length,2);assert.equal(dailyFileHistory(history).length,2);
});
test('share text contains scores and a playable link without exposing any answers or invented ranking',()=>{
  const state=complete(dailyFile(day)),text=dailyFileShare(state,'https://example.com');assert(text.includes('315/315'));assert(text.includes('https://example.com/play/'));for(const id of state.spec.ids){const q=dailyFileBank.find(q=>q.id===id);if(q.mode!=='rewind')assert(!text.includes(q.answer));}assert(!/global|rank|percentile/i.test(text));
});
