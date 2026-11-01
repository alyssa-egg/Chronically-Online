import {capsuleQuestions,capsuleRounds,CAPSULE_BANK_VERSION} from './capsule-content.js';
import {connectionDay,connectionReset,shuffleConnection,connectionTime} from './connection.js';
import {validDay,diaryStats} from './puzzle.js';
import {normalizeOpenAnswer,matchOpenAnswer} from './open-cut.js';
export {capsuleQuestions,capsuleRounds,CAPSULE_BANK_VERSION};
export const capsuleDay=connectionDay,capsuleReset=connectionReset;
export const CAPSULE_HISTORY='fandom-files-capsule-history-v1',CAPSULE_PROFILE='fandom-files-capsule-profile-v1';
export const capsuleDailyKey=day=>`fandom-files-capsule-daily-v1-${day}`;
export const capsuleFilters=[['mixed','mixed bag'],['fandom-years','2010–2016'],['influencer-era','2017–2020'],['current-lore','2020–now'],['music','music'],['internet','internet culture'],['fandoms','fandoms'],['fashion','fashion & beauty'],['creators','creator culture']];
export const capsuleQuestion=id=>capsuleQuestions.find(q=>q.id===id);
export const filterCapsuleQuestions=filter=>capsuleQuestions.filter(q=>filter==='mixed'||q.era===filter||q.categories.includes(filter));
export function validateCapsuleBank(){
 const errors=[],ids=new Set();
 for(const q of capsuleQuestions){
  if(!q.id||ids.has(q.id))errors.push(`Duplicate/missing ID: ${q.id}`);ids.add(q.id);
  if(!capsuleRounds.some(r=>r.id===q.round)||!['fandom-years','influencer-era','current-lore'].includes(q.era)||!q.categories?.length||q.categories.some(c=>!capsuleFilters.some(f=>f[0]===c)))errors.push(`Invalid category: ${q.id}`);
  if(!Number.isInteger(q.difficulty)||q.difficulty<1||q.difficulty>4||!['text','choice'].includes(q.format)||!q.question?.trim()||!q.answer?.trim()||!q.explanation?.trim())errors.push(`Incomplete question: ${q.id}`);
  if(!Array.isArray(q.hints)||q.hints.length>2||q.hints.some(h=>typeof h!=='string'||!h.trim())||!Array.isArray(q.clues))errors.push(`Invalid clues: ${q.id}`);
  if(q.format==='choice'&&(!Array.isArray(q.options)||![2,4].includes(q.options.length)||new Set(q.options.map(normalizeOpenAnswer)).size!==q.options.length||!q.options.includes(q.answer)))errors.push(`Invalid options: ${q.id}`);
  if(q.round==='soundtrack'&&q.clues.length!==3)errors.push(`Soundtrack needs 3 progressive clues: ${q.id}`);
  if(q.round==='era'&&q.clues.length<4)errors.push(`Era needs 4 clues: ${q.id}`);
  if(!Array.isArray(q.sources)||!q.sources.length||q.sources.some(s=>!/^https:\/\/[^\s]+$/.test(s)))errors.push(`Missing verification reference: ${q.id}`);
 }
 for(const round of capsuleRounds)if(capsuleQuestions.filter(q=>q.round===round.id).length<5)errors.push(`Not enough ${round.name} questions`);
 for(const [filter]of capsuleFilters)if(filterCapsuleQuestions(filter).length<5)errors.push(`Not enough questions for ${filter}`);
 return errors;
}
export const CAPSULE_ANCHOR='2026-11-01';
export const capsuleOverrides={};
export function dailyCapsule(day=capsuleDay()){
 if(!validDay(day))throw new Error('Invalid capsule date.');
 const offset=Math.round((Date.parse(day)-Date.parse(CAPSULE_ANCHOR))/86400000);
 const ids=capsuleOverrides[day]||capsuleRounds.map((round,i)=>{const pool=capsuleQuestions.filter(q=>q.round===round.id);return pool[((offset+i*3)%pool.length+pool.length)%pool.length].id;});
 return {id:`daily-${day}`,day,mode:'daily',filter:'mixed',number:offset+1,questionIds:ids};
}
export function infiniteCapsule({filter='mixed',seen=[],last=[],round=0,seed=String(Date.now()),day=capsuleDay()}={}){
 if(!capsuleFilters.some(f=>f[0]===filter))throw new Error('Unknown archive folder.');
 const pool=filterCapsuleQuestions(filter),target=Math.min(4,1+Math.floor(round/2)),shuffled=shuffleConnection(pool,seed);
 const ranked=shuffled.sort((a,b)=>(last.includes(a.id)?1:0)-(last.includes(b.id)?1:0)||(seen.includes(a.id)?1:0)-(seen.includes(b.id)?1:0)||Math.abs(a.difficulty-target)-Math.abs(b.difficulty-target));
 return {id:`infinite-${seed}`,day,mode:'infinite',filter,level:target,questionIds:ranked.slice(0,5).map(q=>q.id)};
}
export function capsuleMatch(q,raw){
 if(typeof raw!=='string'||raw.length>120||!raw.trim()||/[\u0000-\u001f]/.test(raw))return false;
 const value=normalizeOpenAnswer(raw),answers=[q.answer,...q.aliases].map(normalizeOpenAnswer);
 if(answers.includes(value))return true;
 if(q.format!=='text'||!/[a-z]/.test(value)||q.options.some(o=>normalizeOpenAnswer(o)===value))return false;
 return Boolean(matchOpenAnswer({answers:[{label:q.answer,aliases:q.aliases}]},raw));
}
export function capsuleScore(q,answer,hints=0,elapsedMs=0){
 const correct=capsuleMatch(q,answer),fast=[0,10000,15000,20000,25000][q.difficulty],slow=fast*3;
 const speed=correct?(elapsedMs<=fast?2:elapsedMs<=slow?1:0):0;
 return {correct,score:correct?16-Math.min(2,hints)*2+(hints===0?2:0)+speed:0,speed,hints,elapsedMs};
}
export function newCapsule(spec){
 if(!spec||!validDay(spec.day)||!['daily','infinite','challenge'].includes(spec.mode)||typeof spec.id!=='string'||spec.id.length>150||!Array.isArray(spec.questionIds)||spec.questionIds.length!==5||new Set(spec.questionIds).size!==5||spec.questionIds.some(id=>!capsuleQuestion(id)))throw new Error('This capsule is not available.');
 return {version:1,bank:CAPSULE_BANK_VERSION,id:spec.id,day:spec.day,mode:spec.mode,filter:spec.filter||'mixed',questionIds:[...spec.questionIds],records:[],hints:0,currentStarted:null,completedAt:null,awaitingNext:false,draft:''};
}
export function capsuleState(value,spec){
 const empty=newCapsule(spec);
 if(value?.version!==1||value.bank!==CAPSULE_BANK_VERSION||value.id!==empty.id||value.day!==empty.day||JSON.stringify(value.questionIds)!==JSON.stringify(empty.questionIds)||!Array.isArray(value.records)||value.records.length>5)return empty;
 const records=[];
 for(const [i,r] of value.records.entries()){
  const q=capsuleQuestion(empty.questionIds[i]);
  if(!r||r.questionId!==q.id||typeof r.answer!=='string'||r.answer.length>120||!Number.isInteger(r.hints)||r.hints<0||r.hints>q.hints.length||!Number.isFinite(r.elapsedMs)||r.elapsedMs<0||r.elapsedMs>86400000||!Number.isFinite(r.at)||r.at<=0)return empty;
  records.push({questionId:q.id,answer:r.answer,...capsuleScore(q,r.answer,r.hints,r.elapsedMs),at:r.at});
 }
 const done=records.length===5,current=capsuleQuestion(empty.questionIds[records.length]);
 return {...empty,records,hints:done?0:Number.isInteger(value.hints)&&value.hints>=0&&value.hints<=current.hints.length?value.hints:0,currentStarted:!done&&Number.isFinite(value.currentStarted)&&value.currentStarted>0?value.currentStarted:null,completedAt:done?records[4].at:null,awaitingNext:!done&&records.length>0&&value.awaitingNext===true,draft:typeof value.draft==='string'&&value.draft.length<=120?value.draft:''};
}
export function beginCapsule(value,spec,now=Date.now()){
 const state=capsuleState(value,spec);if(state.completedAt||state.currentStarted)return state;
 return {...state,currentStarted:now,awaitingNext:false};
}
export function hintCapsule(value,spec){const state=capsuleState(value,spec),q=capsuleQuestion(state.questionIds[state.records.length]);if(state.completedAt||state.awaitingNext||!state.currentStarted||state.hints>=q.hints.length)return state;return {...state,hints:state.hints+1};}
export function answerCapsule(value,spec,answer,now=Date.now()){
 const state=capsuleState(value,spec);if(state.completedAt||state.awaitingNext)return state;
 if(!state.currentStarted)throw new Error('Open this round first.');
 if(typeof answer!=='string'||answer.length>120||/[\u0000-\u001f]/.test(answer))throw new Error('Use an answer of up to 120 characters.');
 const q=capsuleQuestion(state.questionIds[state.records.length]);
 if(q.format==='choice'&&answer!==''&&!q.options.includes(answer))throw new Error('Choose one of the listed answers.');
 const record={questionId:q.id,answer:answer.trim(),...capsuleScore(q,answer.trim(),state.hints,Math.min(86400000,Math.max(0,now-state.currentStarted))),at:now};
 const records=[...state.records,record];return {...state,records,hints:0,currentStarted:null,draft:'',awaitingNext:records.length<5,completedAt:records.length===5?now:null};
}
export const capsuleRank=score=>score>=95?'Chronically Online Legend':score>=85?'Internet Historian':score>=70?'Certified Lore Detective':score>=50?'Tumblr Veteran':score>=25?'Casual Scroller':'Internet Newbie';
export function capsuleResult(state){
 const score=state.records.reduce((n,r)=>n+r.score,0),correct=state.records.filter(r=>r.correct).length,time=state.records.reduce((n,r)=>n+r.elapsedMs,0),hints=state.records.reduce((n,r)=>n+r.hints,0);
 const counts=capsuleRounds.map(round=>({id:round.id,name:round.name,score:state.records.filter(r=>capsuleQuestion(r.questionId).round===round.id).reduce((n,r)=>n+r.score,0)})).sort((a,b)=>b.score-a.score);
 return {score,correct,time,hints,rank:capsuleRank(score),strongest:counts[0]?.score?counts[0].name:'your next discovery'};
}
export function capsuleHistory(value,today=capsuleDay(),{includeFuture=false}={}){
 const rows=new Map();for(const item of Array.isArray(value)?value:[]){try{if(!validDay(item?.day)||(!includeFuture&&item.day>today))continue;const state=capsuleState(item,item);if(state.completedAt)rows.set(state.id,state);}catch{}}
 return [...rows.values()].sort((a,b)=>a.completedAt-b.completedAt);
}
export function capsulePersonal(value,today=capsuleDay()){
 const history=capsuleHistory(value,today,{includeFuture:true}),daily=history.filter(r=>r.mode==='daily'),results=history.map(capsuleResult),streak=diaryStats(daily.map(r=>r.day),today);
 let combo=0,bestCombo=0;for(const record of history.flatMap(r=>r.records)){combo=record.correct?combo+1:0;bestCombo=Math.max(bestCombo,combo);}
 const tally=capsuleRounds.map(round=>({name:round.name,id:round.id,correct:history.flatMap(r=>r.records).filter(r=>r.correct&&capsuleQuestion(r.questionId).round===round.id).length})).sort((a,b)=>b.correct-a.correct);
 const badges=[
 ['first-file','first file','Complete your first daily capsule.',daily.length>0],
 ['seven-days','seven days online','Reach a seven-day completion streak.',streak.best>=7],
 ['tumblr-veteran','tumblr veteran','Complete a Fandom Years set at 90% accuracy or better.',history.some(r=>r.questionIds.every(id=>capsuleQuestion(id).era==='fandom-years')&&capsuleResult(r).correct===5)],
 ['music-head','music head','Answer every question in a music set correctly.',history.some(r=>r.questionIds.every(id=>capsuleQuestion(id).categories.includes('music'))&&capsuleResult(r).correct===5)],
 ['deep-detective','deep cut detective','Complete a five-question set containing only Expert questions.',history.some(r=>r.questionIds.every(id=>capsuleQuestion(id).difficulty===4))],
 ['no-hints','no hints needed','Finish a daily capsule without opening a hint.',daily.some(r=>capsuleResult(r).hints===0)],
 ['perfect','perfect archive','Score 100 on a daily capsule.',daily.some(r=>capsuleResult(r).score===100)]
 ].map(([id,name,goal,earned])=>({id,name,goal,earned}));
 return {history,daily,streak,badges,total:history.length,points:results.reduce((n,r)=>n+r.score,0),best:results.length?Math.max(...results.map(r=>r.score)):0,dailyBest:daily.length?Math.max(...daily.map(r=>capsuleResult(r).score)):0,infiniteBest:history.filter(r=>r.mode==='infinite').reduce((n,r)=>Math.max(n,capsuleResult(r).score),0),combo,bestCombo,strongest:tally[0]?.correct?tally[0].name:'still being discovered'};
}
export function capsuleEraProgress(value,era){
 const history=capsuleHistory(value),records=history.flatMap(r=>r.records).filter(r=>capsuleQuestion(r.questionId).era===era),seen=new Set(records.map(r=>r.questionId)),available=capsuleQuestions.filter(q=>q.era===era).length;
 return {seen:seen.size,available,answers:records.length,correct:records.filter(r=>r.correct).length,accuracy:records.length?Math.round(records.filter(r=>r.correct).length/records.length*100):0,chapters:[Math.min(5,available),Math.min(10,available),available].filter(target=>seen.size>=target).length};
}
export function capsuleShare(state,origin){const r=capsuleResult(state);return `FANDOM FILES · THE TIME CAPSULE\n${state.mode==='daily'?state.day:state.mode==='infinite'?'THE INFINITE ARCHIVE':'FRIEND CHALLENGE'}\n${r.score}/100 · ${r.correct}/5 correct\nTime: ${connectionTime(r.time)}\n${state.records.map(r=>r.correct?'💿':'⬜').join('')}\n${r.rank}\nyou had to be there.\n${origin}/play/`;}
export function makeCapsuleChallenge(state,nickname,nonce){
 if(!state.completedAt)throw new Error('Finish this capsule first.');const result=capsuleResult(state);
 const data={v:1,bank:CAPSULE_BANK_VERSION,id:nonce,ids:state.questionIds,name:(nickname||'a mutual').slice(0,24),score:result.score,correct:result.correct,time:result.time};
 const json=JSON.stringify(data);return btoa(unescape(encodeURIComponent(json))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
}
export function readCapsuleChallenge(token){
 try{if(typeof token!=='string'||token.length>3000||!/^[A-Za-z0-9_-]+$/.test(token))throw 0;const p=JSON.parse(decodeURIComponent(escape(atob(token.replaceAll('-','+').replaceAll('_','/')))));if(p.v!==1||p.bank!==CAPSULE_BANK_VERSION||typeof p.id!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(p.id)||typeof p.name!=='string'||p.name.length>24||!Number.isInteger(p.score)||p.score<0||p.score>100||!Number.isInteger(p.correct)||p.correct<0||p.correct>5||!Number.isFinite(p.time)||p.time<0||p.time>432000000)throw 0;newCapsule({id:p.id,mode:'challenge',day:capsuleDay(),questionIds:p.ids});return p;}catch{return null;}
}
export function compareCapsuleChallenge(result,opponent){if(result.score!==opponent.score)return result.score>opponent.score?'you':'friend';if(result.time!==opponent.time)return result.time<opponent.time?'you':'friend';return 'tie';}
