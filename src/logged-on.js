import {LOGGED_ON_VERSION,loggedOnEpisodes,loggedOnRotation,loggedOnOverrides,loggedOnEndings} from './logged-on-content.js';
import {connectionDay,connectionTime} from './connection.js';
import {validDay,diaryStats} from './puzzle.js';
export {LOGGED_ON_VERSION,loggedOnEpisodes,loggedOnEndings};
export const loggedOnDay=connectionDay;
export const LOGGED_ON_HISTORY='fandom-files-logged-on-history-v1';
export const loggedOnKey=spec=>`fandom-files-logged-on-${spec.id}`;
export const loggedOnEpisode=id=>loggedOnEpisodes.find(episode=>episode.id===id);
export function dailyLoggedOn(day=loggedOnDay()){
  if(!validDay(day))throw new Error('Invalid episode date.');
  const offset=Math.round((Date.parse(day)-Date.parse('2026-11-02'))/86400000),episodeId=loggedOnOverrides[day]||loggedOnRotation[((offset%loggedOnRotation.length)+loggedOnRotation.length)%loggedOnRotation.length];
  return {version:LOGGED_ON_VERSION,id:`daily-${day}`,kind:'daily',day,episodeId};
}
export function replayLoggedOn(episodeId,nonce,kind='replay',day=loggedOnDay()){
  if(!loggedOnEpisode(episodeId)||!['replay','visit'].includes(kind)||!validDay(day)||typeof nonce!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(nonce))throw new Error('That episode link is unavailable.');
  return {version:LOGGED_ON_VERSION,id:`${kind}-${nonce}`,kind,day,episodeId};
}
export function newLoggedOn(spec){
  if(spec?.version!==LOGGED_ON_VERSION||!loggedOnEpisode(spec.episodeId)||!validDay(spec.day)||!['daily','replay','visit'].includes(spec.kind)||typeof spec.id!=='string'||!/^[a-zA-Z0-9-]{8,100}$/.test(spec.id))throw new Error('This episode is unavailable.');
  if(spec.kind==='daily'&&(spec.id!==`daily-${spec.day}`||dailyLoggedOn(spec.day).episodeId!==spec.episodeId))throw new Error('Open the current daily episode again.');
  return {spec:{...spec},events:[],node:loggedOnEpisode(spec.episodeId).start,choices:[],inspected:[],flags:[],stats:{chaos:2,lore:1,mutuals:3},started:null,completedAt:null};
}
const addFlag=(state,flag)=>{if(flag&&!state.flags.includes(flag))state.flags.push(flag);};
export function loggedOnAction(value,action,now=Date.now()){
  if(!Number.isFinite(now)||now<=0)throw new Error('Invalid episode clock.');
  const state=structuredClone(value),episode=loggedOnEpisode(state.spec.episodeId);
  if(state.completedAt)throw new Error('This ending is saved. Replay to take a different path.');
  if(state.events.length>=10)throw new Error('This episode has no more actions.');
  let event;
  if(action.type==='start'){
    if(state.started)throw new Error('You are already logged on.');
    state.started=now;event={type:'start',at:now};
  }else{
    if(!state.started)throw new Error('Log on before opening your messages.');
    if(action.type==='inspect'){
      const clue=episode.evidence.find(clue=>clue.id===action.id);
      if(!clue||state.inspected.includes(clue.id)||state.inspected.length>=episode.rabbitHoles)throw new Error('That receipt is already saved, or you have used your three rabbit holes.');
      state.inspected.push(clue.id);addFlag(state,clue.flag);state.stats.lore=Math.min(6,state.stats.lore+1);event={type:'inspect',id:clue.id,at:now};
    }else if(action.type==='choose'){
      if(action.node!==state.node)throw new Error('The chat has moved on. Read the latest messages.');
      const node=episode.nodes[state.node],choice=node.choices.find(choice=>choice.id===action.id);
      if(!choice||(choice.requires&&!state.flags.includes(choice.requires)))throw new Error('Open the matching receipt before sending that reply.');
      for(const [name,change] of Object.entries(choice.effects))state.stats[name]=Math.max(0,Math.min(6,state.stats[name]+change));
      addFlag(state,choice.flag);state.choices.push({node:state.node,id:choice.id});event={type:'choose',node:state.node,id:choice.id,at:now};state.node=choice.next;
      if(!choice.next)state.completedAt=now;
    }else throw new Error('Unknown episode action.');
  }
  state.events.push(event);return state;
}
export function restoreLoggedOn(raw,spec){
  let state=newLoggedOn(spec);
  if(JSON.stringify(raw?.spec)!==JSON.stringify(spec)||!Array.isArray(raw.events)||raw.events.length>10)return state;
  try{let at=0;for(const event of raw.events){if(!event||event.at<at)throw 0;state=loggedOnAction(state,event,event.at);at=event.at;}return state;}catch{return newLoggedOn(spec);}
}
export function loggedOnEnding(state){
  if(!state.completedAt)return null;
  const {chaos,lore,mutuals}=state.stats,has=flag=>state.flags.includes(flag);
  const id=has('decoded')&&has('private')&&has('archived')&&chaos<=2&&lore>=5?'mastermind':has('offline')&&has('helped')&&chaos<=2?'offline':chaos>=5?'main-character':lore>=5?'archivist':mutuals>=5?'glue':'lurker';
  return loggedOnEndings.find(ending=>ending.id===id);
}
export function loggedOnAftermath(state){const ending=loggedOnEnding(state);return ending?loggedOnEpisode(state.spec.episodeId).epilogues[ending.id]:null;}
export function loggedOnTranscript(state){
  const episode=loggedOnEpisode(state.spec.episodeId),messages=[...episode.nodes[episode.start].messages];
  for(const event of state.events){
    if(event.type==='inspect'){const clue=episode.evidence.find(clue=>clue.id===event.id);messages.push({by:'system',text:`you saved ${clue.label}.`},clue.reaction);}
    if(event.type==='choose'){const choice=episode.nodes[event.node].choices.find(choice=>choice.id===event.id);messages.push({by:choice.app?'system':'you',text:choice.app?'you opened your dashboard.':choice.label},...choice.reply);if(choice.next)messages.push(...episode.nodes[choice.next].messages);}
  }
  return messages;
}
export function loggedOnHistory(value){
  const found=new Map();for(const raw of Array.isArray(value)?value:[]){try{const state=restoreLoggedOn(raw,raw.spec);if(state.completedAt)found.set(state.spec.id,state);}catch{}}
  return [...found.values()].sort((a,b)=>a.completedAt-b.completedAt);
}
export function loggedOnPersonal(value,today=loggedOnDay()){
  const history=loggedOnHistory(value),daily=history.filter(s=>s.spec.kind==='daily'),endings=[...new Set(history.map(s=>loggedOnEnding(s).id))];
  const stamps=[
    {id:'before-posting',name:'lurked before posting',clue:'Sometimes the first move is opening a tab.',earned:history.some(s=>s.events.filter(e=>e.type!=='start').slice(0,2).every(e=>e.type==='inspect')&&s.inspected.length>=2)},
    {id:'three-receipts',name:'the receipts department',clue:'A full folder tells a different story.',earned:history.some(s=>s.inspected.length===3)},
    {id:'quietly-iconic',name:'quietly iconic',clue:'Somebody knows where all the tiny details went.',earned:endings.includes('mastermind')},
    {id:'touch-grass',name:'logged off, lovingly',clue:'The best ending might happen off-screen.',earned:endings.includes('offline')},
  ];
  return {history,daily,endings,stamps,streak:diaryStats(daily.map(s=>s.spec.day),today)};
}
export const loggedOnTime=state=>connectionTime(Math.max(0,Math.min(86400000,(state.completedAt||Date.now())-(state.started||Date.now()))));
export function loggedOnShare(state,origin){
  const episode=loggedOnEpisode(state.spec.episodeId),ending=loggedOnEnding(state);if(!ending)throw new Error('Find your ending first.');
  const bar=n=>'▰'.repeat(n)+'▱'.repeat(6-n);
  return `FANDOM FILES · YOU JUST LOGGED ON\n${episode.month.toUpperCase()} ${episode.year} / ${state.spec.kind==='daily'?state.spec.day:state.spec.kind.toUpperCase()}\nI left as ${ending.title}.\nchaos ${bar(state.stats.chaos)}\nlore ${bar(state.stats.lore)}\nmutual trust ${bar(state.stats.mutuals)}\nyou had to be there.\nSame episode. Who are you?\n${origin}/play/?episode=${encodeURIComponent(episode.id)}`;
}
export function validateLoggedOn(){
  const errors=[],ids=new Set();
  for(const episode of loggedOnEpisodes){
    if(ids.has(episode.id)||episode.version!==LOGGED_ON_VERSION||!episode.title||!episode.setup||!episode.resolution||!episode.nodes[episode.start]||episode.decisions!==6||episode.rabbitHoles!==3)errors.push(`Invalid episode ${episode.id}`);ids.add(episode.id);
    const evidenceIds=new Set(episode.evidence.map(e=>e.id)),flags=new Set(episode.evidence.map(e=>e.flag));
    if(evidenceIds.size!==4||episode.evidence.some(e=>!e.text||!e.label||!episode.cast[e.reaction.by]))errors.push(`Incomplete receipts ${episode.id}`);
    if(loggedOnEndings.some(ending=>typeof episode.epilogues?.[ending.id]!=='string')||new Set(Object.values(episode.epilogues||{})).size!==6)errors.push(`Incomplete endings ${episode.id}`);
    for(const [id,node] of Object.entries(episode.nodes)){
      if(!node.prompt||node.messages.some(m=>!episode.cast[m.by]||!m.text)||node.choices.length<3||new Set(node.choices.map(c=>c.id)).size!==node.choices.length)errors.push(`Invalid scene ${episode.id}/${id}`);
      for(const c of node.choices)if(!c.label||!c.tone||(c.requires&&!flags.has(c.requires))||c.reply.some(m=>!episode.cast[m.by]||!m.text)||Object.entries(c.effects).some(([name,n])=>!['lore','chaos','mutuals'].includes(name)||!Number.isInteger(n)||Math.abs(n)>2)||(c.next?episode.nodes[c.next]?.beat!==node.beat+1:node.beat!==6))errors.push(`Invalid choice ${episode.id}/${id}/${c.id}`);
    }
  }
  if(loggedOnRotation.length<7||loggedOnRotation.some(id=>!ids.has(id)))errors.push('Missing daily episodes.');
  for(const [day,id] of Object.entries(loggedOnOverrides))if(!validDay(day)||!ids.has(id))errors.push(`Invalid override ${day}`);
  return errors;
}
