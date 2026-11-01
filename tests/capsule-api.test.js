import test from 'node:test';import assert from 'node:assert/strict';
import {handleCapsuleRequest} from '../server/capsule.mjs';import {capsuleQuestion,capsuleResult} from '../src/capsule.js';
const user='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222',env={SUPABASE_URL:'https://test.supabase.test',SUPABASE_ANON_KEY:'anon-test',SUPABASE_SERVICE_ROLE_KEY:'private-test',CAPSULE_LEADERBOARD_ENABLED:'true'};
function harness({gateReads=false}={}){let readCount=0,releaseReads;const readGate=new Promise(resolve=>{releaseReads=resolve});const profiles=[{user_id:user,username:'real_mutual',avatar:'heart',timezone:'America/New_York',public:false}],attempts=[],calls=[];let stamp=Date.parse('2026-11-01T17:00:00Z'),nonce=0;
 const fetcher=async(url,options={})=>{url=new URL(url);calls.push({url:url.href,...options});const token=options.headers?.Authorization;
  if(url.pathname==='/auth/v1/user')return Response.json({id:token==='Bearer other'?other:user,email_confirmed_at:'2026-01-01T00:00:00Z'});
  const table=url.pathname.split('/').at(-1),rows=table==='capsule_profiles'?profiles:attempts;
  if(table==='capsule_leaderboard')return Response.json([]);
  const filters=[...url.searchParams].filter(([key,value])=>['user_id','id','mode','day','version','finished_at'].includes(key));
  const chosen=rows.filter(row=>filters.every(([key,value])=>value==='is.null'?row[key]==null:value==='not.is.null'?row[key]!=null:String(row[key])===value.slice(3)));
  if(options.method==='POST'){const body=JSON.parse(options.body);if(table==='capsule_profiles'){const old=profiles.find(p=>p.user_id===body.user_id);if(old)Object.assign(old,body);else profiles.push(body);return Response.json([body]);}rows.push(body);return Response.json([body]);}
  if(options.method==='PATCH'){const body=JSON.parse(options.body);chosen.forEach(row=>Object.assign(row,body));return Response.json(chosen);}
  const offset=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit')||chosen.length),snapshot=Response.json(chosen.slice(offset,offset+limit));if(gateReads&&table==='capsule_attempts'&&url.searchParams.has('id')){readCount++;if(readCount===2)releaseReads();await readGate;}return snapshot;
 };
 const call=async(action,body,token='owner',extra={})=>{stamp+=1000;const request=new Request('https://files.test/api/capsule/'+action,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{}),...extra.headers},...(body?{body:JSON.stringify(body)}:{})});const response=await handleCapsuleRequest(request,env,{fetch:fetcher,now:stamp,randomId:()=>`aaaaaaaa-aaaa-4aaa-8aaa-${String(++nonce).padStart(12,'0')}`});return {status:response.status,data:await response.json()};};return {call,profiles,attempts,calls};}
test('configuration is honest without credentials; no private keys appear in public responses',async()=>{
 const response=await handleCapsuleRequest(new Request('https://files.test/api/capsule/config'),{});assert.deepEqual(await response.json(),{authReady:false,ready:false,bankSize:60});
 const h=harness(),ready=await h.call('config',null,null);assert(ready.data.ready);assert(!JSON.stringify(ready.data).includes('private-test'));
 const disabled=await handleCapsuleRequest(new Request('https://files.test/api/capsule/leaderboard?period=daily&day=2026-11-01'),{});assert.equal(disabled.status,503);
});
test('server clocks, stored hints and correct answers determine scores; clients cannot reset an active clock or overwrite a filed answer',async()=>{
 const h=harness();let result=await h.call('start',{mode:'daily',score:999,records:[]});assert.equal(result.status,200);let run=result.data;const firstStart=run.state.currentStarted;
 const reset=await h.call('next',{attemptId:run.attemptId,step:0});assert.equal(reset.data.state.currentStarted,firstStart);
 run=(await h.call('hint',{attemptId:run.attemptId,step:0,hints:0})).data;assert.equal(run.state.hints,1);
 run=(await h.call('answer',{attemptId:run.attemptId,step:0,answer:capsuleQuestion(run.state.questionIds[0]).answer,score:100,elapsedMs:0,hints:0})).data;assert.equal(run.state.records[0].hints,1);assert(run.state.records[0].elapsedMs>=3000);assert(run.state.records[0].score<20);
 const duplicate=await h.call('answer',{attemptId:run.attemptId,step:0,answer:'wrong'});assert.equal(duplicate.data.state.records.length,1);assert.equal(duplicate.data.state.records[0].answer,run.state.records[0].answer);
 for(let i=1;i<5;i++){run=(await h.call('next',{attemptId:run.attemptId,step:i})).data;run=(await h.call('answer',{attemptId:run.attemptId,step:i,answer:capsuleQuestion(run.state.questionIds[i]).answer})).data;}
 assert(run.state.completedAt);assert.equal(h.attempts[0].score,capsuleResult(run.state).score);assert(h.attempts[0].score<100);assert.equal((await h.call('start',{mode:'daily'})).data.attemptId,run.attemptId);
});
test('records require authentication and ownership; cross-origin writes and invalid payloads fail',async()=>{
 const h=harness();assert.equal((await h.call('start',{mode:'daily'},null)).status,401);assert.equal((await h.call('start',{mode:'daily'},'owner',{headers:{Origin:'https://evil.test'}})).status,403);
 const run=(await h.call('start',{mode:'daily'})).data;h.profiles.push({user_id:other,timezone:'America/New_York'});
 assert.equal((await h.call('answer',{attemptId:run.attemptId,step:0,answer:'2010'},'other')).status,404);
 assert.equal((await h.call('profile',{username:'<script>',avatar:'folder',public:true,timezone:'UTC'})).status,400);
 assert.equal((await h.call('answer',{attemptId:run.attemptId,step:0,answer:'x'.repeat(121)})).status,400);
 const board=await h.call('leaderboard?period=daily&day=2026-11-01',null,null);assert.equal(board.status,200);assert.deepEqual(board.data.rows,[]);
});
test('shared profiles are opt-in and returns contain only the authenticated player’s history',async()=>{
 const h=harness();const saved=await h.call('profile',{username:'my_mutual',avatar:'music',public:true,timezone:'Europe/London'});assert.equal(saved.data.profile.public,true);assert.equal(h.profiles[0].user_id,user);
 const profile=await h.call('profile');assert.equal(profile.data.profile.username,'my_mutual');assert.deepEqual(profile.data.history,[]);
 assert(h.calls.every(c=>!c.url.includes('private-test')));
});

test('verified history is paginated without dropping older records and Infinite boards use the shared aggregate',async()=>{
 const h=harness();for(let i=0;i<501;i++)h.attempts.push({id:`old-${i}`,user_id:user,finished_at:'2026-10-01T00:00:00Z',state:{id:`old-${i}`}});
 const first=await h.call('profile');assert.equal(first.data.history.length,500);assert.equal(first.data.nextOffset,500);
 const second=await h.call('profile?offset=500');assert.equal(second.data.history.length,1);assert.equal(second.data.nextOffset,null);
 assert.equal((await h.call('profile?offset=-1')).status,400);
 const board=await h.call('leaderboard?period=infinite&day=2026-11-01',null,null);assert.equal(board.status,200);assert(h.calls.some(call=>call.url.includes('capsule_leaderboard')&&JSON.parse(call.body).board_period==='infinite'));
});

test('concurrent verified actions cannot overwrite one another or remove a stored hint cost',async()=>{
 const h=harness({gateReads:true}),run=(await h.call('start',{mode:'daily'})).data;
 const responses=await Promise.all([h.call('hint',{attemptId:run.attemptId,step:0,hints:0}),h.call('answer',{attemptId:run.attemptId,step:0,answer:capsuleQuestion(run.state.questionIds[0]).answer})]);
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal(h.attempts[0].version,1);assert(h.attempts[0].state.records.length<=1);
});

test('verified daily selection follows a travelling device timezone while the server derives the date',async()=>{
 const h=harness();const run=await h.call('start',{mode:'daily',timezone:'Asia/Tokyo',day:'2099-01-01'});assert.equal(run.data.state.day,'2026-11-02');
 assert.equal((await h.call('start',{mode:'daily',timezone:'not-a-timezone'})).status,400);
});
