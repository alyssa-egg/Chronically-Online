import {dailyFileBank,fileModes,DAILY_FILE_VERSION,dailyFileRotation,dailyFileOverrides} from './daily-file-content.js';
import {connectionDay,connectionReset,shuffleConnection,connectionTime} from './connection.js';
import {validDay,diaryStats} from './puzzle.js';
import {matchOpenAnswer,normalizeOpenAnswer,validOpenAnswer} from './open-cut.js';
export {dailyFileBank,fileModes,DAILY_FILE_VERSION};
export const fileDay=connectionDay,fileReset=connectionReset;
export const FILE_HISTORY='fandom-files-daily-file-history-v1';
export const FILE_PRACTICE='fandom-files-daily-file-practice-v1';
export const fileKey=day=>`fandom-files-daily-file-v1-${day}`;
export const fileQuestion=id=>dailyFileBank.find(q=>q.id===id);
export function validateDailyFiles(){
  const errors=[],ids=new Set();
  for(const q of dailyFileBank){
    if(!q.id||ids.has(q.id))errors.push(`Duplicate file: ${q.id}`);ids.add(q.id);
    if(!fileModes.some(m=>m.id===q.mode)||!['fandom-years','influencer-era','current-lore'].includes(q.era)||!q.category||![1,2,3].includes(q.difficulty)||!q.question||!q.explanation||q.scoring?.max!==100)errors.push(`Incomplete file: ${q.id}`);
    if(!q.sources?.length||q.sources.some(s=>!/^https:\/\/[^\s]+$/.test(s)))errors.push(`Missing source: ${q.id}`);
    if(q.mode==='rewind'){
      if(q.events?.length!==5||new Set(q.events.map(e=>e.id)).size!==5||q.events.some((e,i)=>!e.label||!Number.isInteger(e.year)||(i>0&&e.year<=q.events[i-1].year))||JSON.stringify(q.answer)!==JSON.stringify(q.events.map(e=>e.id))||q.scoring.pairPoints!==8||q.scoring.perfectBonus!==20)errors.push(`Ambiguous timeline: ${q.id}`);
    }else if(typeof q.answer!=='string'||!q.answer||!Array.isArray(q.aliases)||q.clues?.length!==4||new Set(q.clues).size!==4||q.clues.some(c=>!c.trim())||q.scoring.guesses!==3||q.scoring.revealCost!==15||q.scoring.wrongGuessCost!==10)errors.push(`Incomplete clues: ${q.id}`);
  }
  for(const m of fileModes){if(dailyFileBank.filter(q=>q.mode===m.id).length<12)errors.push(`Add at least 12 ${m.id} files.`);for(const level of [1,2,3])if(dailyFileBank.filter(q=>q.mode===m.id&&q.difficulty===level).length<2)errors.push(`Add two ${m.id} files at level ${level}.`);if(!dailyFileRotation[m.id]?.length||dailyFileRotation[m.id].some(id=>fileQuestion(id)?.mode!==m.id))errors.push(`Invalid ${m.id} rotation.`);}
  for(const [day,ids] of Object.entries(dailyFileOverrides))if(!validDay(day)||!Array.isArray(ids)||ids.length!==3||ids.some((id,i)=>fileQuestion(id)?.mode!==fileModes[i].id))errors.push(`Invalid override: ${day}`);
  return errors;
}
export function dailyFile(day=fileDay()){
  if(!validDay(day))throw new Error('Invalid date.');
  const offset=Math.round((Date.parse(day)-Date.parse('2026-11-02'))/86400000);
  const ids=dailyFileOverrides[day]||fileModes.map((m,i)=>{const pool=dailyFileRotation[m.id];return pool[((offset+i*3)%pool.length+pool.length)%pool.length];});
  return {version:DAILY_FILE_VERSION,id:`daily-file-${day}`,day,kind:'daily',ids:[...ids]};
}
export function practiceFile(mode,{seen=[],last='',difficulty=1,seed=String(Date.now()),day=fileDay()}={}){
  if(!fileModes.some(m=>m.id===mode)||![1,2,3].includes(difficulty))throw new Error('Choose an available practice mode and difficulty.');
  const pool=shuffleConnection(dailyFileBank.filter(q=>q.mode===mode&&q.difficulty===difficulty),seed).sort((a,b)=>(a.id===last?1:0)-(b.id===last?1:0)||(seen.includes(a.id)?1:0)-(seen.includes(b.id)?1:0));
  return {version:DAILY_FILE_VERSION,id:`practice-${seed}`,day,kind:'practice',ids:[pool[0].id]};
}
function validateSpec(spec){
  if(spec?.version!==DAILY_FILE_VERSION||!['daily','practice'].includes(spec.kind)||!validDay(spec.day)||typeof spec.id!=='string'||spec.id.length>180||!Array.isArray(spec.ids)||spec.ids.length!==(spec.kind==='daily'?3:1)||spec.ids.some(id=>!fileQuestion(id)))throw new Error('This file is unavailable.');
  if(spec.kind==='daily'&&JSON.stringify(spec)!==JSON.stringify(dailyFile(spec.day)))throw new Error('This daily file changed. Open today’s file again.');
}
function orderFor(spec,q){
  if(q.mode!=='rewind')return [];
  let order=shuffleConnection(q.answer,`${spec.id}-${q.id}`);
  if(order.every((id,i)=>id===q.answer[i]))order=[...order.slice(1),order[0]];
  return order;
}
function freshRound(spec,index){const q=fileQuestion(spec.ids[index]);return {reveals:[],guesses:[],order:orderFor(spec,q),draft:''};}
export function newDailyFile(spec){validateSpec(spec);return {spec,events:[],step:0,round:freshRound(spec,0),records:[],started:null,awaiting:false,completedAt:null};}
export function fileMatches(q,answer){
  if(!validOpenAnswer(answer)||q.mode==='rewind')return null;
  const match=matchOpenAnswer({answers:[{label:q.answer,aliases:q.aliases,artist:q.artist?[q.artist]:[]}]},answer);
  return match?match.kind:null;
}
const validOrder=(q,order)=>Array.isArray(order)&&order.length===5&&new Set(order).size===5&&order.every(id=>q.answer.includes(id));
export function timelineScore(q,order){
  if(!validOrder(q,order))throw new Error('Keep all five events on the timeline.');
  let pairs=0;
  for(let i=0;i<4;i++)for(let j=i+1;j<5;j++)if(order.indexOf(q.answer[i])<order.indexOf(q.answer[j]))pairs++;
  return {pairs,correct:pairs===10,base:pairs*q.scoring.pairPoints+(pairs===10?q.scoring.perfectBonus:0)};
}
export const filePotential=state=>{
  const q=fileQuestion(state.spec.ids[state.step]);
  return q&&q.mode!=='rewind'?Math.max(0,q.scoring.max-state.round.reveals.length*q.scoring.revealCost-state.round.guesses.length*q.scoring.wrongGuessCost):100;
};
export function fileAction(value,action,now=Date.now()){
  if(!Number.isFinite(now)||now<=0)throw new Error('Invalid clock.');
  const state=structuredClone(value),q=fileQuestion(state.spec.ids[state.step]);
  if(state.completedAt)throw new Error('This file is already saved. Try practice for another round.');
  if(state.events.length>=100)throw new Error('Reopen this file to continue.');
  const event={...action,at:now};let finish=null;
  if(action.type==='start'){
    if(state.started||state.awaiting)throw new Error('This round is already open.');
    state.started=now;
  }else if(action.type==='next'){
    if(!state.awaiting)throw new Error('Finish this round first.');
    state.step++;state.round=freshRound(state.spec,state.step);state.started=now;state.awaiting=false;
  }else{
    if(!state.started||state.awaiting)throw new Error('Open the round first.');
    if(action.type==='reveal'){
      if(q.mode==='rewind'||!Number.isInteger(action.index)||action.index<1||action.index>3||state.round.reveals.includes(action.index)||(q.mode==='soundtrack'&&action.index!==state.round.reveals.length+1))throw new Error('That clue is unavailable.');
      state.round.reveals.push(action.index);
    }else if(action.type==='guess'){
      if(q.mode==='rewind'||!validOpenAnswer(action.answer))throw new Error('Enter one name or song title, up to 120 characters.');
      if(state.round.guesses.some(g=>normalizeOpenAnswer(g.answer)===normalizeOpenAnswer(action.answer)))throw new Error('You tried that one. Try another answer or uncover a clue.');
      const match=fileMatches(q,action.answer),base=filePotential(state),guess={answer:action.answer.trim(),match};
      state.round.guesses.push(guess);state.round.draft='';
      if(match||state.round.guesses.length===q.scoring.guesses)finish={correct:Boolean(match),base:match?base:0,match,answer:guess.answer};
    }else if(action.type==='lock'){
      if(q.mode!=='rewind')throw new Error('This file uses a typed answer.');
      finish={...timelineScore(q,action.order),order:[...action.order],answer:''};
    }else if(action.type==='skip')finish={correct:false,base:0,skipped:true,answer:''};
    else throw new Error('Unknown game action.');
  }
  if(finish){
    const previous=state.records.at(-1)?.combo||0,combo=finish.correct?previous+1:0,bonus=combo>1?Math.min(10,(combo-1)*5):0;
    state.records.push({...finish,id:q.id,reveals:[...state.round.reveals],guesses:[...state.round.guesses],combo,bonus,score:finish.base+bonus,elapsed:Math.min(86400000,Math.max(0,now-state.started)),at:now});
    state.started=null;state.awaiting=true;
    if(state.records.length===state.spec.ids.length)state.completedAt=now;
  }
  state.events.push(event);return state;
}
export function restoreDailyFile(raw,spec){
  let state=newDailyFile(spec);
  if(JSON.stringify(raw?.spec)!==JSON.stringify(spec)||!Array.isArray(raw?.events)||raw.events.length>100)return state;
  try{
    let at=0;for(const event of raw.events){if(!event||event.at<at)throw 0;state=fileAction(state,event,event.at);at=event.at;}
    if(!state.awaiting){
      const q=fileQuestion(spec.ids[state.step]);
      if(q.mode==='rewind'&&validOrder(q,raw.round?.order))state.round.order=[...raw.round.order];
      if(typeof raw.round?.draft==='string'&&raw.round.draft.length<=120)state.round.draft=raw.round.draft;
    }
    return state;
  }catch{return newDailyFile(spec);}
}
export function moveTimeline(state,from,to){
  const q=fileQuestion(state.spec.ids[state.step]);
  if(q?.mode!=='rewind'||!state.started||state.awaiting||![from,to].every(i=>Number.isInteger(i)&&i>=0&&i<5))return state;
  const next=structuredClone(state),[id]=next.round.order.splice(from,1);next.round.order.splice(to,0,id);return next;
}
export function dailyFileResult(state){
  return {score:state.records.reduce((n,r)=>n+r.score,0),base:state.records.reduce((n,r)=>n+r.base,0),bonus:state.records.reduce((n,r)=>n+r.bonus,0),time:state.records.reduce((n,r)=>n+r.elapsed,0),correct:state.records.filter(r=>r.correct).length,max:state.spec.kind==='daily'?315:100};
}
export function dailyFileHistory(value){
  const map=new Map();for(const raw of Array.isArray(value)?value:[]){try{const state=restoreDailyFile(raw,raw.spec);if(state.completedAt)map.set(state.spec.id,state);}catch{}}
  return [...map.values()].sort((a,b)=>a.completedAt-b.completedAt);
}
export function dailyFilePersonal(value,today=fileDay()){
  const history=dailyFileHistory(value),daily=history.filter(s=>s.spec.kind==='daily'),streak=diaryStats(daily.map(s=>s.spec.day),today);
  return {history,daily,streak,best:daily.reduce((n,s)=>Math.max(n,dailyFileResult(s).score),0)};
}
export function dailyFileShare(state,origin){
  const r=dailyFileResult(state);
  return `FANDOM FILES · ${state.spec.kind==='daily'?'DAILY FILE '+state.spec.day:'PRACTICE FILE'}\n${r.score}/${r.max} · ${connectionTime(r.time)}\n${state.records.map(p=>`${fileModes.find(m=>m.id===fileQuestion(p.id).mode).icon} ${p.base}/100${p.bonus?` +${p.bonus} combo`:''}`).join('\n')}\nyou had to be there.\n${origin}/play/`;
}
