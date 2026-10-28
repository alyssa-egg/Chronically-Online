import { dayKey } from './game.js';
import { validDay, diaryStats } from './puzzle.js';
import { preparedChallenges, openCutPrompts, challengeOverrides } from './open-cut-content.js';
export const OPEN_CUT_VERSION = 'v1';
export const OPEN_CUT_HISTORY = 'fandom-files-open-cut-history-v1';
export const OPEN_CUT_TIMER = 'fandom-files-open-cut-timer-v1';
export const OPEN_CUT_ANCHOR = '2026-10-27';
export const tierPoints = {40:40,60:60,80:80,100:100,accepted:100};
export const tierNames = {40:'classic reference',60:'familiar file',80:'niche reference',100:'deep cut',accepted:'category match'};
const prompts = new Map(openCutPrompts.map(prompt => [prompt.id,prompt]));
export const normalizeOpenAnswer = value => typeof value === 'string' ? value.replaceAll('÷','divide').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'') : '';
export const validOpenAnswer = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 120 && normalizeOpenAnswer(value).length > 0 && !/[\u0000-\u001f]/.test(value);
export const openCutKey = day => `fandom-files-open-cut-${OPEN_CUT_VERSION}-${day}`;
export function dailyOpenCut(day = dayKey()) {
 if (!validDay(day)) throw new Error('Invalid challenge date');
 const index = Math.round((Date.parse(day)-Date.parse(OPEN_CUT_ANCHOR))/86400000);
 const prepared = challengeOverrides[day] || preparedChallenges[((index%preparedChallenges.length)+preparedChallenges.length)%preparedChallenges.length];
 return {...prepared,day,number:index+1,prompts:prepared.promptIds.map(id=>prompts.get(id))};
}
// Bounded edit matching fixes small spelling slips without accepting substrings or wrong categories.
export function spellingDistance(left,right){
 const rows=Array.from({length:left.length+1},()=>Array(right.length+1).fill(0));
 for(let i=0;i<=left.length;i++)rows[i][0]=i;
 for(let j=0;j<=right.length;j++)rows[0][j]=j;
 for(let i=1;i<=left.length;i++)for(let j=1;j<=right.length;j++){
  rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+(left[i-1]===right[j-1]?0:1));
  if(i>1&&j>1&&left[i-1]===right[j-2]&&left[i-2]===right[j-1])rows[i][j]=Math.min(rows[i][j],rows[i-2][j-2]+1);
 }
 return rows[left.length][right.length];
}
export function matchOpenAnswer(prompt,raw){
 if(!validOpenAnswer(raw))return null;
 const normalized=normalizeOpenAnswer(raw);
 const candidates=prompt.answers.map(answer=>({answer,aliases:[...new Set([answer.label,...answer.aliases].map(normalizeOpenAnswer))]}));
 const exact=candidates.find(item=>item.aliases.includes(normalized));if(exact)return {answer:exact.answer,kind:'exact'};
 if(!/[a-z]/.test(normalized))return null;
 const close=[];
 for(const item of candidates){let best=Infinity;for(const alias of item.aliases){const min=Math.min(alias.length,normalized.length),limit=min>=10?2:min>=5?1:0;if(!limit||Math.abs(alias.length-normalized.length)>limit)continue;const distance=spellingDistance(normalized,alias);if(distance<=limit)best=Math.min(best,distance);}
  if(Number.isFinite(best))close.push({answer:item.answer,distance:best});
 }
 close.sort((a,b)=>a.distance-b.distance);
 return close.length&&(close.length===1||close[0].distance<close[1].distance)?{answer:close[0].answer,kind:'spelling'}:null;
}
export function scoreOpenAnswer(prompt, raw) {
 const match=matchOpenAnswer(prompt,raw),accepted=match?.answer;
 if (!accepted) return {raw,accepted:false,points:0,tier:null,label:raw?'not in the archive yet':'no answer filed',deep:false,explanation:raw?'We have not matched this reference yet. It may still fit the prompt; an unlisted answer is not the same as a wrong answer.':'No answer was filed before this prompt closed.'};
 const explanation=accepted.note || `${accepted.label} fits this category. ${prompt.context}`;
 return {raw,accepted:true,answer:accepted.label,points:tierPoints[accepted.tier],tier:accepted.tier,label:tierNames[accepted.tier],deep:accepted.tier===100,match:match.kind,explanation:match.kind==='spelling'?`Spelling variation accepted as ${accepted.label}. ${explanation}`:explanation};
}
export function scoreOpenCut(challenge, answers, {allowBlank=false}={}) {
 if (!Array.isArray(answers) || answers.length!==5 || !Array.from(answers).every(answer=>validOpenAnswer(answer)||(allowBlank&&answer===''))) throw new Error('Write one answer of up to 120 characters for each prompt.');
 const parts=challenge.prompts.map((prompt,i)=>scoreOpenAnswer(prompt,answers[i]));
 return summarizeOpenParts(parts);
}
function summarizeOpenParts(parts){
 const total=parts.reduce((sum,part)=>sum+part.points,0),accepted=parts.filter(part=>part.accepted).length,deep=parts.filter(part=>part.deep).length;
 return {parts,total,accepted,deep,label:accepted===5?(deep>=3?'five for five. deep in the archives.':'five for five. every reference counted.'):deep>=3?'deep in the archives.':total>=400?'you kept every receipt.':accepted>=3?'the dashboard remembers you.':accepted?'a few very familiar files.':'new lore unlocked.'};
}
function savedOpenResult(value,answers){
 if(!value||!Array.isArray(value.parts)||value.parts.length!==5)return null;
 const parts=Array.from(value.parts);
 if(!parts.every((part,i)=>part&&part.raw===answers[i]&&typeof part.explanation==='string'&&part.explanation.length<=3000&&(part.accepted===true?Object.hasOwn(tierPoints,part.tier)&&typeof part.answer==='string'&&part.answer.length<=120&&part.points===tierPoints[part.tier]&&part.deep===(part.tier===100):part.accepted===false&&part.points===0&&part.tier===null&&part.deep===false)))return null;
 const clean=summarizeOpenParts(parts.map(part=>({...part,label:part.accepted?tierNames[part.tier]:part.raw?'not in the archive yet':'no answer filed'})));
 return clean.total===value.total&&clean.accepted===value.accepted&&clean.deep===value.deep?clean:null;
}
export function openCutResult(challenge,state){
 const saved=savedOpenResult(state.result,state.answers);
 if(!saved)return scoreOpenCut(challenge,state.answers,{allowBlank:Boolean(state.timing)});
 // Repair earlier false negatives, but never reduce previously awarded points.
 return summarizeOpenParts(saved.parts.map((part,i)=>{if(part.accepted||!part.raw)return part;const corrected=scoreOpenAnswer(challenge.prompts[i],part.raw);return corrected.accepted?{...corrected,creditedLater:true}:part;}));
}
export function openCutState(value, challenge) {
 const empty={version:OPEN_CUT_VERSION,day:challenge.day,challengeId:challenge.id,promptIds:challenge.promptIds,answers:Array(5).fill(''),step:0,completed:false};
 if (!value || value.version!==OPEN_CUT_VERSION || value.day!==challenge.day || value.challengeId!==challenge.id || JSON.stringify(value.promptIds)!==JSON.stringify(challenge.promptIds) || !Array.isArray(value.answers) || value.answers.length!==5 || !Array.from(value.answers).every(answer=>typeof answer==='string'&&answer.length<=120)) return empty;
 const timing=validTimedState(value.timing,value.completed===true,value.step);
 if (value.completed===true && (!Array.from(value.answers).every(answer=>validOpenAnswer(answer)||(timing&&answer===''))||!Number.isFinite(Date.parse(value.completedAt))||(value.result&&!savedOpenResult(value.result,value.answers)))) return empty;
 return {...empty,answers:[...value.answers],step:Number.isInteger(value.step)&&value.step>=0&&value.step<5?value.step:0,completed:value.completed===true,...(timing?{timing}:{}),...(value.completed===true?{completedAt:value.completedAt,result:openCutResult(challenge,{...value,timing})}:{})};
}
export function completeOpenCut(value, challenge, now = new Date()) {
 const state=openCutState(value,challenge);
 if (state.completed) return state;
 const answers=state.answers.map(answer=>answer.trim()),result=scoreOpenCut(challenge,answers,{allowBlank:Boolean(state.timing&&state.timing.locked.every(Boolean))});
 return {...state,answers,result,completed:true,completedAt:now.toISOString()};
}
export function openCutHistory(value, today=dayKey()) {
 const unique=new Map();
 for (const record of Array.isArray(value)?value:[]) {
  try { if (!validDay(record.day)||record.day>today) continue;const state=openCutState(record,dailyOpenCut(record.day));if(state.completed)unique.set(state.day,state); } catch { /* Ignore corrupt browser records. */ }
 }
 return [...unique.values()].sort((a,b)=>a.day.localeCompare(b.day)).slice(-366);
}
export function openCutPersonal(value,today=dayKey()) {
 const history=openCutHistory(value,today),diary=diaryStats(history.map(item=>item.day),today);
 const results=history.map(item=>openCutResult(dailyOpenCut(item.day),item));
 const stamps=[
  {id:'file-closed',label:'first file closed',goal:'Complete your first five-prompt file',earned:history.length>=1},
  {id:'deep-digger',label:'deep-cut digger',goal:'Find one curated deep cut',earned:results.some(item=>item.deep>=1)},
  {id:'five-accepted',label:'every reference filed',goal:'Match all five answers in one daily file',earned:results.some(item=>item.accepted===5)},
  {id:'week-of-files',label:'seven files kept',goal:'Complete seven different days, whenever you can',earned:history.length>=7},
 ];
 return {history,diary,stamps,best:results.length?Math.max(...results.map(item=>item.total)):0};
}
export function openCutShare(challenge, result, origin) {
 return `Fandom Files · THE DEEP CUT #${challenge.number}\n${challenge.day} · ${result.total}/500\n${result.parts.map(part=>part.deep?'💗':part.accepted?'🟪':'⬜').join('')}\n${result.accepted}/5 matched · ${result.deep} deep cuts\nThink you know the lore? #TheDeepCut\n${origin}/play/`;
}

export const OPEN_CUT_SECONDS=25;
function validTimedState(value,completed,step){
 if(!value||value.version!==1||!Number.isFinite(value.startedAt)||value.startedAt<=0||!Array.isArray(value.locked)||value.locked.length!==5||!Array.from(value.locked).every(x=>typeof x==='boolean')||!Array.isArray(value.expired)||value.expired.length!==5||!Array.from(value.expired).every((x,i)=>typeof x==='boolean'&&(!x||value.locked[i]===true)))return null;
 if(completed){if(!value.locked.every(Boolean)||value.deadline!==null)return null;}
 else if(!Number.isInteger(step)||step<0||step>4||!value.locked.every((locked,i)=>locked===(i<step))||!Number.isFinite(value.deadline)||value.deadline<=0)return null;
 return {...value,locked:[...value.locked],expired:[...value.expired]};
}
export function startTimedOpenCut(value,challenge,now=Date.now()){
 const state=openCutState(value,challenge);if(state.completed||state.timing)return advanceTimedOpenCut(state,challenge,now);
 return {...state,step:0,timing:{version:1,startedAt:now,deadline:now+OPEN_CUT_SECONDS*1000,locked:Array(5).fill(false),expired:Array(5).fill(false)}};
}
function fileTimedPrompt(state,challenge,raw,expired,at){
 const step=state.step;
 const next={...state,answers:[...state.answers],timing:{...state.timing,locked:[...state.timing.locked],expired:[...state.timing.expired]}};
 next.answers[step]=validOpenAnswer(raw)?raw.trim():'';next.timing.locked[step]=true;next.timing.expired[step]=expired;
 if(step===4){next.timing.deadline=null;next.completed=true;next.completedAt=new Date(at).toISOString();next.result=scoreOpenCut(challenge,next.answers,{allowBlank:true});return next;}
 next.step=step+1;next.timing.deadline=at+OPEN_CUT_SECONDS*1000;return next;
}
export function advanceTimedOpenCut(value,challenge,now=Date.now()){
 let state=openCutState(value,challenge);
 while(!state.completed&&state.timing&&state.timing.deadline<=now){const deadline=state.timing.deadline;state=fileTimedPrompt(state,challenge,state.answers[state.step],true,deadline);}
 return state;
}
export function submitTimedOpenCut(value,challenge,raw,now=Date.now(),{skip=false}={}){
 const before=openCutState(value,challenge),state=advanceTimedOpenCut(before,challenge,now);
 if(state.completed||state.step!==before.step)return state;
 if(!state.timing)throw new Error('Start the timed file first.');
 if(!validOpenAnswer(raw)&&!skip)throw new Error('Type a reference, or choose skip.');
 return fileTimedPrompt(state,challenge,skip?'':raw,false,now);
}
