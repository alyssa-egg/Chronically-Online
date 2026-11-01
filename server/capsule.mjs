import {randomUUID} from 'node:crypto';
import {dailyCapsule,infiniteCapsule,capsuleFilters,capsuleQuestions,newCapsule,capsuleState,beginCapsule,hintCapsule,answerCapsule,capsuleResult} from '../src/capsule.js';
import {validDay} from '../src/puzzle.js';
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
class CapsuleError extends Error{constructor(status,message){super(message);this.status=status;}}
const localDay=(now,zone)=>{const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now)).map(p=>[p.type,p.value]));return `${parts.year}-${parts.month}-${parts.day}`;};
export async function handleCapsuleRequest(request,env=process.env,{fetch:fetcher=fetch,now=Date.now(),randomId=randomUUID}={}){
 const url=new URL(request.url),action=url.pathname.slice('/api/capsule/'.length);
 const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 try{
  if(!['GET','POST'].includes(request.method))throw new CapsuleError(405,'Use GET or POST.');
  if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)throw new CapsuleError(403,'Open this from Fandom Files.');
  const authReady=Boolean(env.SUPABASE_URL&&env.SUPABASE_ANON_KEY&&env.SUPABASE_SERVICE_ROLE_KEY),enabled=authReady&&env.CAPSULE_LEADERBOARD_ENABLED==='true';
  const base=authReady?new URL(env.SUPABASE_URL):null;
  if(base&&(base.protocol!=='https:'||base.username||base.password))throw new CapsuleError(503,'The shared archive needs configuration.');
  const provider=async(path,{method='GET',body,token,prefer}={})=>{
   const response=await fetcher(new URL(path,base),{method,headers:{apikey:token?env.SUPABASE_ANON_KEY:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${token||env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});
   if(!response.ok){if(token&&[401,403].includes(response.status))throw new CapsuleError(401,'Sign in again to keep shared records.');if(response.status===409)throw new CapsuleError(409,'This record already exists. Refresh to open your saved file, or choose another username.');throw new CapsuleError(503,'The shared archive needs its database setup or is temporarily unavailable.');}
   return response.status===204?null:response.json();
  };
  if(action==='config'){
   if(request.method!=='GET')throw new CapsuleError(405,'Use GET.');
   let ready=false;if(enabled){try{await provider('/rest/v1/capsule_profiles?select=user_id&limit=0');await provider('/rest/v1/capsule_attempts?select=id&limit=0');await provider('/rest/v1/rpc/capsule_leaderboard',{method:'POST',body:{board_period:'daily',for_day:'1970-01-01',friend_names:[]}});ready=true;}catch{}}
   return json({authReady,ready,bankSize:capsuleQuestions.length});
  }
  if(!enabled)throw new CapsuleError(503,'Shared leaderboards are not connected yet. Local capsules and friend links are ready.');
  if(action==='leaderboard'){
   if(request.method!=='GET')throw new CapsuleError(405,'Use GET.');
   const period=url.searchParams.get('period')||'daily',day=url.searchParams.get('day'),friends=(url.searchParams.get('friends')||'').split(',').filter(Boolean);
   if(!['daily','weekly','all-time','friends','infinite'].includes(period)||!validDay(day)||friends.length>10||friends.some(name=>!/^[a-z0-9_]{3,20}$/.test(name)))throw new CapsuleError(400,'Choose a valid board and date.');
   const rows=await provider('/rest/v1/rpc/capsule_leaderboard',{method:'POST',body:{board_period:period,for_day:day,friend_names:friends}});
   return json({rows:Array.isArray(rows)?rows:[],period,day});
  }
  const token=request.headers.get('authorization')?.match(/^Bearer (.{1,8192})$/)?.[1];if(!token)throw new CapsuleError(401,'Sign in for shared records.');
  const user=await provider('/auth/v1/user',{token});if(!uuid(user?.id)||!user.email_confirmed_at)throw new CapsuleError(401,'Confirm your email to keep shared records.');
  const owner=encodeURIComponent(user.id);
  if(action==='profile'&&request.method==='GET'){
   const offset=Number(url.searchParams.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0||offset>1000000)throw new CapsuleError(400,'Invalid history page.');
   const profiles=await provider(`/rest/v1/capsule_profiles?user_id=eq.${owner}&select=username,avatar,timezone,public`);
   const records=await provider(`/rest/v1/capsule_attempts?user_id=eq.${owner}&finished_at=not.is.null&select=id,state&order=finished_at.desc&limit=500&offset=${offset}`);
   return json({profile:profiles[0]||null,history:records.map(r=>({...r.state,remoteId:r.id})),nextOffset:records.length===500?offset+500:null});
  }
  if(request.method!=='POST')throw new CapsuleError(405,'Use POST for this action.');
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new CapsuleError(415,'Use JSON.');
  const raw=await request.text();if(new TextEncoder().encode(raw).length>4096)throw new CapsuleError(413,'Request is too large.');
  let body;try{body=JSON.parse(raw);}catch{throw new CapsuleError(400,'Invalid JSON.');}
  if(!body||typeof body!=='object'||Array.isArray(body))throw new CapsuleError(400,'Invalid request.');
  if(action==='profile'){
   const username=typeof body.username==='string'?body.username.trim().toLowerCase():'';
   if(!/^[a-z0-9_]{3,20}$/.test(username)||!['folder','heart','music','star'].includes(body.avatar)||typeof body.public!=='boolean'||typeof body.timezone!=='string'||body.timezone.length>80)throw new CapsuleError(400,'Use a 3–20 character username, letters/numbers/underscores, and a valid icon.');
   try{localDay(now,body.timezone);}catch{throw new CapsuleError(400,'Choose a valid timezone.');}
   const rows=await provider('/rest/v1/capsule_profiles?on_conflict=user_id',{method:'POST',body:{user_id:user.id,username,avatar:body.avatar,timezone:body.timezone,public:body.public},prefer:'resolution=merge-duplicates,return=representation'});
   return json({profile:{username:rows[0].username,avatar:rows[0].avatar,timezone:rows[0].timezone,public:rows[0].public}});
  }
  const profiles=await provider(`/rest/v1/capsule_profiles?user_id=eq.${owner}&select=timezone`);let zone=profiles[0]?.timezone;
  if(!zone)throw new CapsuleError(400,'Save your shared profile before starting a verified capsule.');
  if(action==='start'&&body.timezone!==undefined){if(typeof body.timezone!=='string'||body.timezone.length>80)throw new CapsuleError(400,'Choose a valid timezone.');try{localDay(now,body.timezone);}catch{throw new CapsuleError(400,'Choose a valid timezone.');}zone=body.timezone;}
  const day=localDay(now,zone);
  const expose=row=>({attemptId:row.id,revision:row.version,state:row.state});
  if(action==='start'){
   if(!['daily','infinite'].includes(body.mode)||!capsuleFilters.some(f=>f[0]===(body.filter||'mixed')))throw new CapsuleError(400,'Choose a valid capsule mode and folder.');
   const existing=await provider(`/rest/v1/capsule_attempts?user_id=eq.${owner}&mode=eq.${body.mode}${body.mode==='daily'?`&day=eq.${day}`:'&finished_at=is.null'}&select=*&limit=1`);
   if(existing.length)return json(expose(existing[0]));
   const previous=body.mode==='infinite'?await provider(`/rest/v1/capsule_attempts?user_id=eq.${owner}&mode=eq.infinite&finished_at=not.is.null&select=question_ids&order=finished_at.desc&limit=200`):[];
   const id=randomId(),spec=body.mode==='daily'?dailyCapsule(day):infiniteCapsule({filter:body.filter||'mixed',seen:previous.flatMap(r=>r.question_ids),last:previous[0]?.question_ids||[],round:previous.length,seed:id,day});
   const state=beginCapsule(newCapsule(spec),spec,now);
   const rows=await provider('/rest/v1/capsule_attempts',{method:'POST',body:{id,user_id:user.id,mode:body.mode,day,filter:spec.filter,question_ids:spec.questionIds,state,version:0,started_at:new Date(now).toISOString()},prefer:'return=representation'});
   return json(expose(rows[0]));
  }
  if(!uuid(body.attemptId)||!Number.isInteger(body.step)||body.step<0||body.step>5)throw new CapsuleError(400,'Invalid capsule reference.');
  const rows=await provider(`/rest/v1/capsule_attempts?id=eq.${body.attemptId}&user_id=eq.${owner}&select=*&limit=1`),row=rows[0];
  if(!row)throw new CapsuleError(404,'That capsule is not yours or was not found.');
  const spec={...row.state,questionIds:row.question_ids},state=capsuleState(row.state,spec);
  if(action==='resume')return json(expose({...row,state}));
  if(!['hint','answer','next'].includes(action))throw new CapsuleError(404,'Unknown capsule action.');
  if(state.completedAt||state.records.length!==body.step)return json(expose({...row,state}));
  let next;
  if(action==='hint'){if(body.hints!==state.hints)return json(expose({...row,state}));next=hintCapsule(state,spec);}
  else if(action==='next'){if(!state.awaitingNext)return json(expose({...row,state}));next=beginCapsule(state,spec,now);}
  else{if(typeof body.answer!=='string'||body.answer.length>120||/[\u0000-\u001f]/.test(body.answer))throw new CapsuleError(400,'Use an answer of up to 120 characters.');next=answerCapsule(state,spec,body.answer,now);}
  const result=next.completedAt?capsuleResult(next):null;
  const changed=await provider(`/rest/v1/capsule_attempts?id=eq.${row.id}&user_id=eq.${owner}&version=eq.${row.version}`,{method:'PATCH',body:{state:next,version:row.version+1,...(result?{finished_at:new Date(now).toISOString(),score:result.score,correct:result.correct,elapsed_ms:result.time,strongest:result.strongest}:{})},prefer:'return=representation'});
  if(!changed.length)throw new CapsuleError(409,'Another tab updated this capsule. Reopen it to continue.');
  return json(expose(changed[0]));
 }catch(error){return json({error:error instanceof CapsuleError?error.message:'The shared capsule could not be updated.'},error instanceof CapsuleError?error.status:error.message?.startsWith('Choose')?400:503);}
}
