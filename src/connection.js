import {connectionPuzzles,connectionSchedule,connectionOverrides,CONNECTION_ANCHOR} from './connection-content.js';
import {validDay,diaryStats} from './puzzle.js';
export const CONNECTION_HISTORY='fandom-files-connection-history-v1';
export const connectionKey=day=>`fandom-files-connection-v1-${day}`;
export const connectionDay=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const connectionReset=(date=new Date())=>new Date(date.getFullYear(),date.getMonth(),date.getDate()+1);
export const difficulties=['Easy','Medium','Hard','Expert'];
export function validateConnection(puzzle){
 const errors=[];
 if(!puzzle||typeof puzzle.id!=='string'||!/^[-a-z0-9]+$/.test(puzzle.id))errors.push('A stable puzzle ID is required.');
 for(const field of ['theme','era','difficulty'])if(typeof puzzle?.[field]!=='string'||!puzzle[field].trim())errors.push(`Missing ${field}.`);
 if(!Array.isArray(puzzle?.categories)||puzzle.categories.length!==4)return [...errors,'Exactly four categories required.'];
 const tiles=new Set(),ids=new Set();
 for(const [i,category] of puzzle.categories.entries()){
  if(!category.id||ids.has(category.id))errors.push('Category IDs must be unique.');ids.add(category.id);
  if(category.difficulty!==difficulties[i])errors.push('Use Easy, Medium, Hard, Expert in order.');
  if(!category.name?.trim()||!category.explanation?.trim())errors.push('Each category needs a name and explanation.');
  if(!Array.isArray(category.tiles)||category.tiles.length!==4){errors.push('Each category needs four tiles.');continue;}
  for(const tile of category.tiles){const text=typeof tile==='string'?tile.normalize('NFKC').trim().toLowerCase():'';if(!text||text.length>50||tiles.has(text))errors.push(`Invalid or duplicate tile: ${tile}`);tiles.add(text);}
 }
 return errors;
}
export function validateConnectionBank(){
 const errors=[],ids=new Set();
 for(const puzzle of connectionPuzzles){errors.push(...validateConnection(puzzle).map(error=>`${puzzle.id}: ${error}`));if(ids.has(puzzle.id))errors.push('Duplicate puzzle ID');ids.add(puzzle.id);}
 if(connectionSchedule.length<28)errors.push('Prepare at least 28 schedule slots.');
 for(const id of connectionSchedule)if(id!==null&&!ids.has(id))errors.push(`Unknown scheduled ID: ${id}`);
 for(const [day,id] of Object.entries(connectionOverrides))if(!validDay(day)||!ids.has(id))errors.push(`Invalid dated override: ${day}`);
 return errors;
}
export function dailyConnection(day=connectionDay()){
 if(!validDay(day))throw new Error('Invalid puzzle date');
 const offset=Math.round((Date.parse(day)-Date.parse(CONNECTION_ANCHOR))/86400000),cycle=((offset%connectionSchedule.length)+connectionSchedule.length)%connectionSchedule.length;
 const fallback=connectionPuzzles[((offset%connectionPuzzles.length)+connectionPuzzles.length)%connectionPuzzles.length];
 const id=connectionOverrides[day]||connectionSchedule[cycle]||fallback.id,puzzle=connectionPuzzles.find(item=>item.id===id);
 if(!puzzle||validateConnection(puzzle).length)throw new Error('This puzzle is not ready.');
 return {...puzzle,day,number:offset+1,tiles:puzzle.categories.flatMap((category,index)=>category.tiles.map((label,i)=>({id:`tile-${index*4+i}`,label,category:category.id})))};
}
export function shuffleConnection(ids,seed){
 let n=2166136261;for(const char of seed)n=Math.imul(n^char.charCodeAt(0),16777619)>>>0;
 const result=[...ids];for(let i=result.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;
}
const same=(a,b)=>a.length===b.length&&a.every(value=>b.includes(value));
export function connectionState(value,puzzle){
 const empty={version:1,day:puzzle.day,puzzleId:puzzle.id,guesses:[],startedAt:null,completedAt:null};
 if(value?.version!==1||value.day!==puzzle.day||value.puzzleId!==puzzle.id||!Array.isArray(value.guesses)||value.guesses.length>7)return empty;
 let state=empty;
 for(const entry of value.guesses){
  const ids=entry?.tiles,at=entry?.at;
  if(!Array.isArray(ids)||ids.length!==4||new Set(ids).size!==4||!ids.every(id=>puzzle.tiles.some(tile=>tile.id===id))||!Number.isFinite(at)||at<=0||state.completedAt||state.guesses.some(guess=>same(guess.tiles,ids)))return empty;
  const solved=new Set(state.guesses.filter(g=>g.correct).flatMap(g=>g.tiles));if(ids.some(id=>solved.has(id)))return empty;
  const correct=puzzle.categories.find(category=>same(ids,puzzle.tiles.filter(tile=>tile.category===category.id).map(tile=>tile.id)));
  state={...state,startedAt:state.startedAt||at,guesses:[...state.guesses,{tiles:[...ids],at,correct:Boolean(correct),category:correct?.id||null}]};
  const outcome=connectionOutcome(state);if(outcome.done)state.completedAt=at;
 }
 // Durations use a saved start only if it predates the first guess.
 if(Number.isFinite(value.startedAt)&&value.startedAt>0&&(!state.startedAt||value.startedAt<=state.startedAt))state.startedAt=value.startedAt;
 return state;
}
export function connectionOutcome(state){const solved=state.guesses.filter(item=>item.correct).map(item=>item.category),mistakes=state.guesses.filter(item=>!item.correct).length;return {solved,mistakes,remaining:Math.max(0,4-mistakes),won:solved.length===4,done:solved.length===4||mistakes>=4};}
export function startConnection(value,puzzle,now=Date.now()){const state=connectionState(value,puzzle);return state.startedAt?state:{...state,startedAt:now};}
export function submitConnection(value,puzzle,selection,now=Date.now()){
 const state=connectionState(value,puzzle),outcome=connectionOutcome(state);
 if(outcome.done)return {state,message:'This file is already closed.'};
 if(!Array.isArray(selection)||selection.length!==4||new Set(selection).size!==4||!selection.every(id=>puzzle.tiles.some(tile=>tile.id===id&&!outcome.solved.includes(tile.category))))return {state,message:'Select four different unfiled tiles.'};
 if(state.guesses.some(guess=>same(guess.tiles,selection)))return {state,message:'You already tried those four. No extra mistake used.'};
 const next=connectionState({...state,guesses:[...state.guesses,{tiles:selection,at:Math.max(now,state.guesses.at(-1)?.at||state.startedAt||now)}]},puzzle),last=next.guesses.at(-1);
 return {state:next,correct:last.correct,message:last.correct?'Connection filed. You kept the receipt.':'These four don’t share a file. Try a different connection.'};
}
export function connectionHistory(value,today=connectionDay()){
 const days=new Map();for(const item of Array.isArray(value)?value:[]){try{if(!validDay(item?.day)||item.day>today)continue;const state=connectionState(item,dailyConnection(item.day));if(connectionOutcome(state).done)days.set(state.day,state);}catch{}}
 return [...days.values()].sort((a,b)=>a.day.localeCompare(b.day)).slice(-366);
}
export function connectionPersonal(value,today=connectionDay()){
 const history=connectionHistory(value,today),wins=history.filter(state=>connectionOutcome(state).won);
 const streak=diaryStats(wins.map(state=>state.day),today);
 if(history.some(state=>state.day===today&&!connectionOutcome(state).won))streak.streak=0;
 return {history,wins:wins.length,streak,completed:history.length};
}
export const connectionTime=ms=>`${Math.floor(Math.max(0,ms)/60000)}:${String(Math.floor(Math.max(0,ms)/1000)%60).padStart(2,'0')}`;
export function connectionShare(puzzle,state,origin){const result=connectionOutcome(state),squares=['🌸','🧊','📦','🌿'];return `FANDOM FILES\nTHE DAILY CONNECTION #${String(puzzle.number).padStart(3,'0')}\n${puzzle.day}\n${state.guesses.map(guess=>guess.tiles.map(id=>squares[puzzle.categories.findIndex(c=>c.id===puzzle.tiles.find(t=>t.id===id).category)]).join('')).join('\n')}\nFiled: ${result.solved.length}/4 · Mistakes: ${result.mistakes}/4\nTime: ${connectionTime(state.completedAt-state.startedAt)}\nFILE CLOSED. SEE YOU TOMORROW.\n${origin}/play/?game=connection`;}
