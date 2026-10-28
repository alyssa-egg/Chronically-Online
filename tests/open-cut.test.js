import test from 'node:test';
import assert from 'node:assert/strict';
import {openCutTopics,openCutPrompts,preparedChallenges,challengeOverrides} from '../src/open-cut-content.js';
import {dayKey,nextReset} from '../src/game.js';
import {dailyOpenCut,normalizeOpenAnswer,validOpenAnswer,scoreOpenAnswer,scoreOpenCut,openCutState,completeOpenCut,openCutHistory,openCutPersonal,openCutShare,tierPoints,openCutResult,startTimedOpenCut,advanceTimedOpenCut,submitTimedOpenCut,matchOpenAnswer} from '../src/open-cut.js';
import {launchQuizzes,knowledgeQuizzes,personalityQuiz,eraProfiles,knowledgeResult,personalityResult,validQuizAnswers} from '../src/quiz-library.js';

test('28 complete daily files contain 140 distinct prompts, balanced eras, valid curated tiers and unambiguous normalized aliases',()=>{
 assert(openCutTopics.length>=35);assert(openCutPrompts.length>=140);assert(preparedChallenges.length>=28);
 assert.equal(new Set(openCutPrompts.map(item=>item.id)).size,openCutPrompts.length);assert.equal(new Set(openCutPrompts.map(item=>item.question)).size,openCutPrompts.length);
 assert.equal(new Set(preparedChallenges.flatMap(item=>item.promptIds)).size,preparedChallenges.length*5);
 for(const prompt of openCutPrompts){
  assert(prompt.answers.length>=2);assert(prompt.context);assert.equal(Math.max(...prompt.answers.map(item=>tierPoints[item.tier])),100);
  const aliases=new Map();
  for(const answer of prompt.answers){assert(tierPoints[answer.tier]);assert(validOpenAnswer(answer.label));for(const alias of [answer.label,...answer.aliases]){const key=normalizeOpenAnswer(alias);assert(key);if(aliases.has(key))assert.equal(aliases.get(key),answer.label,`${prompt.id}: ambiguous alias ${alias}`);aliases.set(key,answer.label);}}
 }
 for(let day=0;day<28;day++){const date=new Date(Date.UTC(2026,9,27+day)).toISOString().slice(0,10),challenge=dailyOpenCut(date);assert.equal(challenge.number,day+1);assert.equal(challenge.prompts.length,5);assert.equal(new Set(challenge.prompts.map(item=>item.era)).size,3);assert.deepEqual(challenge,dailyOpenCut(date));}
 assert.equal(dailyOpenCut('2026-11-24').id,dailyOpenCut('2026-10-27').id);
 for(const invalid of ['2026-02-30','2026-1-1',null,'bad'])assert.throws(()=>dailyOpenCut(invalid));
});
test('scores use curated tiers, aliases and normalization; no fuzzy invented matches or popularity percentages',()=>{
 assert.equal(normalizeOpenAnswer('  Fjällräven Kånken! '),'fjallravenkanken');
 for(const prompt of openCutPrompts){for(const answer of prompt.answers){for(const alias of [answer.label,...answer.aliases]){const result=scoreOpenAnswer(prompt,'  '+alias.toUpperCase()+'!  ');assert(result.accepted,`${prompt.id}: ${alias}`);assert.equal(result.points,tierPoints[answer.tier]);assert.equal(result.deep,answer.tier===100);}}assert.equal(scoreOpenAnswer(prompt,'not a reference in this curated archive').points,0);}
 const lineup=openCutPrompts.find(item=>item.topic==='katseye-members');assert.equal(scoreOpenAnswer(lineup,'Sophia').points,100);assert.equal(scoreOpenAnswer(lineup,'Sophia').deep,false);
 const daily=dailyOpenCut('2026-10-27'),maxAnswers=daily.prompts.map(prompt=>prompt.answers.find(answer=>tierPoints[answer.tier]===100).label);
 assert.equal(scoreOpenCut(daily,maxAnswers).total,500);assert.equal(scoreOpenCut(daily,maxAnswers).accepted,5);
 assert.equal(scoreOpenCut(daily,Array(5).fill('unlisted reference')).total,0);
 for(const input of [[],Array(5),Array(5).fill(''),Array(5).fill('  '),Array(5).fill('a'.repeat(121)),Array(5).fill('hello\nthere')])assert.throws(()=>scoreOpenCut(daily,input));
});
test('completion cannot double-submit or inflate a result, preserves answers on resume, and rejects stale or malformed saves',()=>{
 const challenge=dailyOpenCut('2026-10-27'),draft=openCutState(null,challenge);draft.answers=challenge.prompts.map(prompt=>prompt.answers[0].label);draft.step=4;
 const result=completeOpenCut(draft,challenge,new Date('2026-10-27T18:00:00Z'));
 assert(result.completed);assert.deepEqual(completeOpenCut(result,challenge,new Date('2026-10-27T19:00:00Z')),result);
 assert.deepEqual(openCutState(result,challenge),result);assert.deepEqual(openCutState({...result,challengeId:'wrong'},challenge).answers,Array(5).fill(''));
 assert(!openCutState({...result,answers:Array(5)},challenge).completed);assert(!openCutState({...result,completedAt:'bad'},challenge).completed);
 assert(!openCutState(result,dailyOpenCut('2026-10-28')).completed);
});
test('history deduplicates days, validates saved scores, keeps milestones after a missed day and ignores invalid or future entries',()=>{
 const records=Array.from({length:7},(_,i)=>{const date=new Date(Date.UTC(2026,9,27+i)).toISOString().slice(0,10),challenge=dailyOpenCut(date);return completeOpenCut({...openCutState(null,challenge),answers:challenge.prompts.map(prompt=>prompt.answers.find(answer=>tierPoints[answer.tier]===100).label)},challenge,new Date(date+'T18:00:00Z'));});
 const history=openCutHistory([null,{},...records,records[0],{...records[0],day:'2026-02-30'}],'2026-11-02');assert.equal(history.length,7);
 assert.equal(openCutHistory(records,'2026-10-28').length,2);
 const personal=openCutPersonal(history,'2026-11-04');assert.equal(personal.diary.streak,0);assert.equal(personal.history.length,7);assert.equal(personal.best,500);assert(personal.stamps.every(item=>item.earned));
 const consecutive=openCutPersonal(history,'2026-11-03');assert.equal(consecutive.diary.streak,7);
});
test('daily dates and reset boundaries are shared in Eastern time across daylight-saving and calendar transitions',()=>{
 assert.equal(dayKey(new Date('2026-10-28T03:59:59Z')),'2026-10-27');assert.equal(dayKey(new Date('2026-10-28T04:00:00Z')),'2026-10-28');
 assert.equal(nextReset(new Date('2026-11-01T04:00:00Z')).toISOString(),'2026-11-02T05:00:00.000Z');
 assert.equal(dailyOpenCut(dayKey(new Date('2026-10-27T10:00:00Z'))).id,dailyOpenCut(dayKey(new Date('2026-10-27T22:00:00Z'))).id);
});
test('share results contain actual points and five segments without submitted answers or the accepted answer key',()=>{
 const challenge=dailyOpenCut('2026-10-27'),answers=challenge.prompts.map(prompt=>prompt.answers[0].label),result=scoreOpenCut(challenge,answers),text=openCutShare(challenge,result,'https://example.test');
 assert(text.includes(`${result.total}/500`));assert.match(text,/#TheDeepCut/);assert.match(text,/https:\/\/example.test\/play\//);
 for(const answer of answers)assert(!text.includes(answer));assert.equal(result.parts.length,5);
});
test('every era has two real knowledge quizzes, correct options remain valid after rotation, and incomplete/sparse answers fail',()=>{
 assert(knowledgeQuizzes.length>=6);assert(launchQuizzes.length>=7);
 for(const era of ['fandom-years','influencer-era','current-lore'])assert(knowledgeQuizzes.filter(quiz=>quiz.era===era).length>=2);
 const positions=new Set();for(const quiz of knowledgeQuizzes){assert.equal(quiz.questions.length,5);const answers=quiz.questions.map(q=>{assert(q.explanation);assert.equal(new Set(q.options).size,4);positions.add(q.answer);return q.answer;});assert.deepEqual(knowledgeResult(quiz,answers),{score:5,total:5});assert.equal(validQuizAnswers(quiz,Array(5),true),false);assert.throws(()=>knowledgeResult(quiz,[]));}
 assert(positions.size>=3);
});
test('personality quiz has meaningful distinct profiles and a stable tie-break rather than random results',()=>{
 assert.equal(personalityQuiz.questions.length,6);assert.equal(new Set(eraProfiles.map(profile=>profile.description)).size,3);
 for(let i=0;i<3;i++)assert.equal(personalityResult(Array(6).fill(i)).id,eraProfiles[i].id);
 const tie=[1,0,2,1,0,2];assert.equal(personalityResult(tie).id,'influencer-era');assert.deepEqual(personalityResult(tie),personalityResult(tie));
 assert.throws(()=>personalityResult([0,1]));assert.throws(()=>personalityResult(Array(6)));
});

test('completed result snapshots survive a later alias or tier edit; corrupt snapshots cannot inflate a score',()=>{
 const challenge=dailyOpenCut('2026-10-27'),draft=openCutState(null,challenge);draft.answers=challenge.prompts.map(prompt=>' '+prompt.answers[0].label+' ');
 const done=completeOpenCut(draft,challenge,new Date('2026-10-27T18:00:00Z')),original=openCutResult(challenge,done);
 assert.equal(openCutState(done,challenge).completed,true);
 const answer=challenge.prompts[0].answers[0],tier=answer.tier;
 try{answer.tier=100;assert.deepEqual(openCutResult(challenge,done),original);assert.deepEqual(openCutResult(challenge,openCutState(done,challenge)),original);}finally{answer.tier=tier;}
 assert.equal(openCutState({...done,result:{...done.result,total:999}},challenge).completed,false);
});

test('future dated overrides bind real five-prompt files without shifting the prepared first-month schedule',()=>{
 const ids=new Set(openCutPrompts.map(prompt=>prompt.id));
 for(const [date,file] of Object.entries(challengeOverrides)){assert.match(date,/^\d{4}-\d{2}-\d{2}$/);assert.equal(new Date(date).toISOString().slice(0,10),date);assert(file.id);assert.equal(file.promptIds.length,5);assert.equal(new Set(file.promptIds).size,5);for(const id of file.promptIds)assert(ids.has(id));}
 const before=dailyOpenCut('2026-10-27');
 challengeOverrides['2026-11-24']={id:'test-future-file',title:'temporary test',promptIds:openCutPrompts.slice(-5).map(prompt=>prompt.id)};
 try{assert.equal(dailyOpenCut('2026-11-24').id,'test-future-file');assert.deepEqual(dailyOpenCut('2026-10-27'),before);}finally{delete challengeOverrides['2026-11-24'];}
});

test('the actual rejected examples now match, including song artist wording and a member/group spelling slip',()=>{
 const challenge=dailyOpenCut('2026-10-27');
 for(const answer of ['she looks so perfect','She Looks So Perfect by 5SOS','5 Seconds of Summer - She Looks So Perfect'])assert.equal(scoreOpenAnswer(challenge.prompts[0],answer).answer,'She Looks So Perfect');
 assert.equal(scoreOpenAnswer(challenge.prompts[1],'david dobrik').answer,'David Dobrik');
 const sophia=scoreOpenAnswer(challenge.prompts[2],'sofia from katsye');assert.equal(sophia.answer,'Sophia');assert.equal(sophia.points,100);assert.equal(sophia.match,'spelling');
 const result=scoreOpenCut(challenge,['she looks so perfect','david dobrik','sofia from katsye','Four','Hydro Flask']);assert.equal(result.total,300);assert.equal(result.accepted,5);assert.match(result.label,/five for five/);
 assert.equal(scoreOpenAnswer(challenge.prompts[0],'Espresso by Sabrina Carpenter').accepted,false);
 assert.equal(scoreOpenAnswer(challenge.prompts[2],'David Dobrik').accepted,false);
 const ambiguous={answers:[{label:'Zoe Sugg',aliases:[]},{label:'Zoey Sugg',aliases:[]}]};assert.equal(matchOpenAnswer(ambiguous,'Zoee Sugg'),null);
});
test('existing saved false negatives get credit automatically without replaying or reducing earned points',()=>{
 const challenge=dailyOpenCut('2026-10-27'),answers=['she looks so perfect','david dobrik','sofia from katsye','Four','Hydro Flask'];
 const correct=scoreOpenCut(challenge,answers),parts=correct.parts.map((part,i)=>i<3?{raw:answers[i],accepted:false,points:0,tier:null,label:'unmatched',deep:false,explanation:'The previous small list did not match this.'}:part);
 const old={...openCutState(null,challenge),answers,completed:true,completedAt:'2026-10-27T18:00:00Z',result:{parts,total:120,accepted:2,deep:0,label:'a few very familiar files.'}};
 const fixed=openCutState(old,challenge);assert(fixed.completed);assert.equal(fixed.result.total,300);assert.equal(fixed.result.accepted,5);assert.equal(fixed.result.parts.filter(part=>part.creditedLater).length,3);assert.equal(fixed.result.parts[3].points,80);assert.equal(fixed.result.parts[4].points,40);
 assert.equal(openCutHistory([fixed,fixed],'2026-10-27').length,1);
});
test('mandatory timing saves typed answers at expiry, locks prompts and preserves deadlines across a reload',()=>{
 const challenge=dailyOpenCut('2026-10-27'),now=Date.parse('2026-10-27T18:00:00Z');let state=startTimedOpenCut(null,challenge,now);
 assert.equal(state.timing.deadline,now+25000);state.answers[0]='She Looks So Perfect';
 const resumed=openCutState(state,challenge);assert.equal(resumed.timing.deadline,now+25000);
 state=advanceTimedOpenCut(resumed,challenge,now+25000);assert.equal(state.step,1);assert.equal(state.answers[0],'She Looks So Perfect');assert.equal(state.timing.locked[0],true);assert.equal(state.timing.expired[0],true);assert.equal(state.timing.deadline,now+50000);
 const late=submitTimedOpenCut(resumed,challenge,'a late different answer',now+26000);assert.equal(late.answers[0],'She Looks So Perfect');assert.equal(late.step,1);
 assert.equal(startTimedOpenCut(state,challenge,now+27000).timing.deadline,now+50000);
});
test('manual filing starts the next 25-second clock and absence catches up to a real completed result with zero for blanks',()=>{
 const challenge=dailyOpenCut('2026-10-27'),now=Date.parse('2026-10-27T18:00:00Z');
 let state=startTimedOpenCut(null,challenge,now);assert.throws(()=>submitTimedOpenCut(state,challenge,'',now+1000));
 state=submitTimedOpenCut(state,challenge,'She Looks So Perfect',now+1000);assert.equal(state.step,1);assert.equal(state.timing.deadline,now+26000);
 const done=advanceTimedOpenCut(state,challenge,now+101000);assert.equal(done.completed,true);assert.equal(done.result.total,40);assert.equal(done.result.accepted,1);assert.equal(done.answers.filter(Boolean).length,1);assert.deepEqual(done.timing.locked,Array(5).fill(true));assert.equal(done.timing.deadline,null);
 assert(openCutState(done,challenge).completed);assert.deepEqual(advanceTimedOpenCut(done,challenge,now+200000),done);
 const blank=submitTimedOpenCut(startTimedOpenCut(null,challenge,now),challenge,'',now+1000,{skip:true});assert.equal(blank.step,1);assert.equal(blank.answers[0],'');
});
