import test from 'node:test';
import assert from 'node:assert/strict';
import {loggedOnEpisodes,loggedOnEndings,validateLoggedOn,dailyLoggedOn,replayLoggedOn,newLoggedOn,restoreLoggedOn,loggedOnAction,loggedOnEnding,loggedOnAftermath,loggedOnTranscript,loggedOnHistory,loggedOnPersonal,loggedOnShare,loggedOnKey} from '../src/logged-on.js';
const day='2026-11-02',now=1793638800000;
const paths={
  mastermind:['dashboard','quiet-tab','use-original','connect-details','lurk','archive'],
  offline:['group-chat','gentle','ask-source','keep-private','help-bee','logoff'],
  'main-character':['broadcast','commit','take-side','double-down','one-more-post','victory'],
  archivist:['dashboard','quiet-tab','ask-source','post-receipt','lurk','archive'],
  glue:['group-chat','gentle','meme','deescalate','help-bee','archive'],
  lurker:['dashboard','new-tab','take-side','deescalate','lurk','archive'],
};
function run(id,ending='lurker',spec=replayLoggedOn(id,'test-run-'+ending,'replay',day)){
  let state=loggedOnAction(newLoggedOn(spec),{type:'start'},now);
  if(ending==='mastermind')for(const [i,id]of ['original','timestamp'].entries())state=loggedOnAction(state,{type:'inspect',id},now+100+i);
  for(const [i,id]of paths[ending].entries())state=loggedOnAction(state,{type:'choose',node:state.node,id},now+1000+i*1000);
  return state;
}
test('daily stories have a validated six-decision branch graph, original cast and bounded evidence',()=>{
  assert.deepEqual(validateLoggedOn(),[]);assert.equal(loggedOnEpisodes.length,7);
  for(const episode of loggedOnEpisodes){assert(Object.keys(episode.nodes).length>=6);assert.equal(episode.evidence.length,4);assert.deepEqual(Object.keys(episode.cast),['mara','jo','bee']);}
});
test('daily episodes stay the same on refresh and rotate across seven fixed authored stories',()=>{
  const seen=new Set();let previous;
  for(let i=0;i<35;i++){const date=new Date(Date.parse(day)+i*86400000).toISOString().slice(0,10),spec=dailyLoggedOn(date);assert.deepEqual(spec,dailyLoggedOn(date));if(previous)assert.notEqual(spec.episodeId,previous.episodeId);previous=spec;seen.add(spec.episodeId);}
  assert.equal(seen.size,7);assert.throws(()=>dailyLoggedOn('2026-02-30'));assert.throws(()=>newLoggedOn({...dailyLoggedOn(day),episodeId:'theme-emergency'}));
});
test('every ending is reachable in every episode and all six choices contribute to the outcome',()=>{
  for(const episode of loggedOnEpisodes)for(const ending of loggedOnEndings){const state=run(episode.id,ending.id);assert.equal(state.choices.length,6);assert(state.completedAt);assert.equal(loggedOnEnding(state).id,ending.id,`${episode.id}/${ending.id}`);assert(Object.values(state.stats).every(n=>n>=0&&n<=6));assert.equal(state.node,null);assert.equal(loggedOnAftermath(state),episode.epilogues[ending.id]);}
});
test('the opening choices enter genuinely different scenes and create distinct transcripts',()=>{
  const base=loggedOnAction(newLoggedOn(dailyLoggedOn(day)),{type:'start'},now);
  const quiet=loggedOnAction(base,{type:'choose',node:'ping',id:'dashboard'},now+1),loud=loggedOnAction(base,{type:'choose',node:'ping',id:'broadcast'},now+1);
  assert.equal(quiet.node,'dashboard-route');assert.equal(loud.node,'loud-route');assert.notEqual(quiet.stats.chaos,loud.stats.chaos);assert.notDeepEqual(loggedOnTranscript(quiet),loggedOnTranscript(loud));
  assert.throws(()=>loggedOnAction(loud,{type:'choose',node:'ping',id:'dashboard'},now+2),/moved on/);
});
test('three selected rabbit holes save receipts, unlock flags and cannot be spent twice or before logging on',()=>{
  let state=newLoggedOn(dailyLoggedOn(day));assert.throws(()=>loggedOnAction(state,{type:'inspect',id:'original'},now));state=loggedOnAction(state,{type:'start'},now);
  for(const [i,id]of ['original','timestamp','draft'].entries())state=loggedOnAction(state,{type:'inspect',id},now+i+1);
  assert.equal(state.inspected.length,3);assert.equal(state.stats.lore,4);assert(state.flags.includes('original'));assert(state.flags.includes('metadata'));
  assert.throws(()=>loggedOnAction(state,{type:'inspect',id:'draft'},now+4));assert.throws(()=>loggedOnAction(state,{type:'inspect',id:'group-note'},now+4));
});
test('gated replies need the specific recovered evidence, not a fabricated high meter',()=>{
  let state=loggedOnAction(newLoggedOn(dailyLoggedOn(day)),{type:'start'},now);state=loggedOnAction(state,{type:'choose',node:state.node,id:'dashboard'},now+1);state=loggedOnAction(state,{type:'choose',node:state.node,id:'quiet-tab'},now+2);
  assert.throws(()=>loggedOnAction({...state,stats:{chaos:0,lore:6,mutuals:6}},{type:'choose',node:'receipt',id:'use-original'},now+3));
  state=loggedOnAction(state,{type:'inspect',id:'original'},now+3);state=loggedOnAction(state,{type:'choose',node:'receipt',id:'use-original'},now+4);assert.equal(state.node,'paper-trail');assert(loggedOnTranscript(state).some(m=>m.text.includes('scheduled')));
});
test('saved actions restore the exact route and ignore fabricated meters, flags and ending fields',()=>{
  const done=run('the-cropped-clip','mastermind');assert.deepEqual(restoreLoggedOn(JSON.parse(JSON.stringify(done)),done.spec),done);
  const forged=structuredClone(done);forged.stats.chaos=6;forged.flags=[];forged.node='ping';forged.ending='main-character';assert.equal(loggedOnEnding(restoreLoggedOn(forged,done.spec)).id,'mastermind');
  const broken=structuredClone(done);broken.events[2].id='nonexistent';assert.equal(restoreLoggedOn(broken,done.spec).events.length,0);assert.equal(restoreLoggedOn({...done,events:Array(11).fill({})},done.spec).events.length,0);
  assert.throws(()=>loggedOnAction(done,{type:'inspect',id:'draft'},now+99999));
});
test('replays and episode visits have their own keys and cannot replace a first daily ending or streak',()=>{
  const spec=dailyLoggedOn(day),daily=run(spec.episodeId,'glue',spec),replay=run(spec.episodeId,'main-character'),visit=run(spec.episodeId,'offline',replayLoggedOn(spec.episodeId,'visitor-one','visit',day));
  assert.notEqual(loggedOnKey(daily.spec),loggedOnKey(replay.spec));assert.notEqual(loggedOnKey(replay.spec),loggedOnKey(visit.spec));
  const personal=loggedOnPersonal([daily,replay,visit],day);assert.equal(personal.daily.length,1);assert.equal(personal.streak.streak,1);assert.equal(personal.endings.length,3);assert.equal(loggedOnEnding(personal.daily[0]).id,'glue');
});
test('completed-day streaks and secret stamps come from actual actions and endings',()=>{
  const today=run(dailyLoggedOn(day).episodeId,'mastermind',dailyLoggedOn(day)),yesterday=run(dailyLoggedOn('2026-11-01').episodeId,'offline',dailyLoggedOn('2026-11-01'));
  const personal=loggedOnPersonal([today,yesterday,null,{},today],day);assert.equal(personal.daily.length,2);assert.equal(personal.streak.streak,2);assert(personal.stamps.find(s=>s.id==='quietly-iconic').earned);assert(personal.stamps.find(s=>s.id==='before-posting').earned);assert(personal.stamps.find(s=>s.id==='touch-grass').earned);assert(!personal.stamps.find(s=>s.id==='three-receipts').earned);
  assert.equal(loggedOnHistory('corrupt').length,0);
});
test('share links target the exact enduring episode, label replay and contain no invented ranking or plot resolution',()=>{
  const state=run('the-cropped-clip','main-character'),share=loggedOnShare(state,'https://example.com');assert(share.includes('REPLAY'));assert(share.includes('the accidental main character'));assert(share.includes('/play/?episode=the-cropped-clip'));assert(!share.includes(loggedOnEpisodes[0].resolution));assert(!/rank|percentile|players voted/i.test(share));assert.throws(()=>loggedOnShare(newLoggedOn(dailyLoggedOn(day)),'https://example.com'));
});
test('all ungated routes end after six choices without dead ends, impossible stats or unanswered quiz checks',()=>{
  const base=loggedOnAction(newLoggedOn(dailyLoggedOn(day)),{type:'start'},now);let endings=0;
  function walk(state){if(state.completedAt){assert.equal(state.choices.length,6);assert(loggedOnEnding(state));endings++;return;}const episode=loggedOnEpisodes.find(e=>e.id===state.spec.episodeId);for(const choice of episode.nodes[state.node].choices.filter(c=>!c.requires))walk(loggedOnAction(state,{type:'choose',node:state.node,id:choice.id},now+state.choices.length+1));}
  walk(base);assert(endings>=500);
});
