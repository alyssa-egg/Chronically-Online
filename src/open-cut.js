import { dayKey } from './game.js';
import { validDay, diaryStats } from './puzzle.js';
import { preparedChallenges, openCutPrompts, challengeOverrides } from './open-cut-content.js';
export const OPEN_CUT_VERSION = 'v1';
export const OPEN_CUT_HISTORY = 'fandom-files-open-cut-history-v1';
export const OPEN_CUT_TIMER = 'fandom-files-open-cut-timer-v1';
export const OPEN_CUT_ANCHOR = '2026-10-27';
export const tierPoints = {40:40,60:60,80:80,100:100,accepted:100};
export const tierNames = {40:'obvious reference',60:'familiar file',80:'niche reference',100:'deep cut',accepted:'category match'};
const prompts = new Map(openCutPrompts.map(prompt => [prompt.id,prompt]));
export const normalizeOpenAnswer = value => typeof value === 'string' ? value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'') : '';
export const validOpenAnswer = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 120 && normalizeOpenAnswer(value).length > 0 && !/[\u0000-\u001f]/.test(value);
export const openCutKey = day => `fandom-files-open-cut-${OPEN_CUT_VERSION}-${day}`;
export function dailyOpenCut(day = dayKey()) {
 if (!validDay(day)) throw new Error('Invalid challenge date');
 const index = Math.round((Date.parse(day)-Date.parse(OPEN_CUT_ANCHOR))/86400000);
 const prepared = challengeOverrides[day] || preparedChallenges[((index%preparedChallenges.length)+preparedChallenges.length)%preparedChallenges.length];
 return {...prepared,day,number:index+1,prompts:prepared.promptIds.map(id=>prompts.get(id))};
}
export function scoreOpenAnswer(prompt, raw) {
 const normalized=normalizeOpenAnswer(raw);
 const accepted=validOpenAnswer(raw) && prompt.answers.find(answer=>[answer.label,...answer.aliases].some(alias=>normalizeOpenAnswer(alias)===normalized));
 if (!accepted) return {raw,accepted:false,points:0,tier:null,label:'not in this answer list',deep:false,explanation:'We could not match this answer to the curated list. That does not prove your reference is wrong; this version only scores listed answers and aliases.'};
 return {raw,accepted:true,answer:accepted.label,points:tierPoints[accepted.tier],tier:accepted.tier,label:tierNames[accepted.tier],deep:accepted.tier===100,explanation:accepted.note || `${accepted.label} fits this category. ${prompt.context}`};
}
export function scoreOpenCut(challenge, answers) {
 if (!Array.isArray(answers) || answers.length!==5 || !Array.from(answers).every(validOpenAnswer)) throw new Error('Write one answer of up to 120 characters for each prompt.');
 const parts=challenge.prompts.map((prompt,i)=>scoreOpenAnswer(prompt,answers[i]));
 return summarizeOpenParts(parts);
}
function summarizeOpenParts(parts){
 const total=parts.reduce((sum,part)=>sum+part.points,0),accepted=parts.filter(part=>part.accepted).length,deep=parts.filter(part=>part.deep).length;
 return {parts,total,accepted,deep,label:deep>=3?'deep in the archives.':total>=400?'you kept every receipt.':accepted>=3?'the dashboard remembers you.':accepted?'a few very familiar files.':'new lore unlocked.'};
}
function savedOpenResult(value,answers){
 if(!value||!Array.isArray(value.parts)||value.parts.length!==5)return null;
 const parts=Array.from(value.parts);
 if(!parts.every((part,i)=>part&&part.raw===answers[i]&&typeof part.explanation==='string'&&part.explanation.length<=3000&&(part.accepted===true?Object.hasOwn(tierPoints,part.tier)&&typeof part.answer==='string'&&part.answer.length<=120&&part.points===tierPoints[part.tier]&&part.deep===(part.tier===100):part.accepted===false&&part.points===0&&part.tier===null&&part.deep===false)))return null;
 const clean=summarizeOpenParts(parts.map(part=>({...part,label:part.accepted?tierNames[part.tier]:'not in this answer list'})));
 return clean.total===value.total&&clean.accepted===value.accepted&&clean.deep===value.deep?clean:null;
}
export function openCutResult(challenge,state){return savedOpenResult(state.result,state.answers)||scoreOpenCut(challenge,state.answers);}
export function openCutState(value, challenge) {
 const empty={version:OPEN_CUT_VERSION,day:challenge.day,challengeId:challenge.id,promptIds:challenge.promptIds,answers:Array(5).fill(''),step:0,completed:false};
 if (!value || value.version!==OPEN_CUT_VERSION || value.day!==challenge.day || value.challengeId!==challenge.id || JSON.stringify(value.promptIds)!==JSON.stringify(challenge.promptIds) || !Array.isArray(value.answers) || value.answers.length!==5 || !Array.from(value.answers).every(answer=>typeof answer==='string'&&answer.length<=120)) return empty;
 if (value.completed===true && (!Array.from(value.answers).every(validOpenAnswer)||!Number.isFinite(Date.parse(value.completedAt))||(value.result&&!savedOpenResult(value.result,value.answers)))) return empty;
 return {...empty,answers:[...value.answers],step:Number.isInteger(value.step)&&value.step>=0&&value.step<5?value.step:0,completed:value.completed===true,...(value.completed===true?{completedAt:value.completedAt,result:savedOpenResult(value.result,value.answers)||scoreOpenCut(challenge,value.answers)}:{})};
}
export function completeOpenCut(value, challenge, now = new Date()) {
 const state=openCutState(value,challenge);
 if (state.completed) return state;
 const answers=state.answers.map(answer=>answer.trim()),result=scoreOpenCut(challenge,answers);
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
