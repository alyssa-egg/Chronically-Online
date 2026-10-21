import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMemoriesRequest, allowMemorySubmission } from '../server/memories.mjs';
const url = 'https://example.test/api/memories';
const body = { eraId: 'fandom-years', displayName: 'a mutual', memory: 'Making my first fan account after school.' };
const post = (value = body, headers = {}) => new Request(url, { method: 'POST', headers: { origin: 'https://example.test', 'content-type': 'application/json', ...headers }, body: JSON.stringify(value) });
const env = { SANITY_EDITOR_TOKEN: 'private-test-editor-key' };

test('memory reads select only published documents and public fields, use bound filters, and never send the editor key', async () => {
  let called;
  const result = await handleMemoriesRequest(new Request(url+'?era=current-lore&offset=20'), env, { fetcher: async (target, options) => { called={target,options}; return Response.json({result:[{id:'approved',eraId:'current-lore',displayName:'mutual',memory:'A shared memory.',submittedAt:'2026-10-20T12:00:00Z',privateField:'never send this'}]}); } });
  assert.equal(result.status,200);
  assert.equal(called.target.searchParams.get('perspective'),'published');
  assert.match(called.target.searchParams.get('query'), /!\(_id in path\("drafts\.\*\*"\)\)/);
  assert.equal(called.target.searchParams.get('$era'),'"current-lore"');
  assert.equal(called.target.searchParams.get('$start'),'20');
  assert.equal(called.target.searchParams.get('$end'),'41');
  assert.equal(called.options.headers,undefined);
  const data=await result.json();assert.equal(data.submissionsEnabled,true);
  assert.equal(data.memories[0].id,'approved');
  assert(!JSON.stringify(data).includes('private'));assert(!JSON.stringify(data).includes(env.SANITY_EDITOR_TOKEN));
});

test('anonymous submissions always create private review drafts; client IDs, status and timestamps cannot publish a memory', async () => {
  let called;
  const result=await handleMemoriesRequest(post({...body,_id:'published',_type:'siteIdentity',approved:true,submittedAt:'1900-01-01',status:'published'}),env,{allowSubmission:()=>true,fetcher:async(target,options)=>{called={target,options};return Response.json({results:[]});}});
  assert.equal(result.status,201);
  assert.equal(called.target,'https://rjg4g3cl.api.sanity.io/v2025-02-19/data/mutate/production');
  const doc=JSON.parse(called.options.body).mutations[0].create;
  assert.match(doc._id,/^drafts\.era-memory-[a-f0-9-]+$/);assert.equal(doc._type,'eraMemory');
  assert.equal(doc.eraId,body.eraId);assert.equal(doc.memory,body.memory);assert.equal(doc.approved,undefined);assert.equal(doc.status,undefined);
  assert.notEqual(doc.submittedAt,'1900-01-01');
  assert.equal(called.options.headers.Authorization,'Bearer '+env.SANITY_EDITOR_TOKEN);
  const text=await result.text();assert.match(text,/after we review and publish/);assert(!text.includes(doc._id));assert(!text.includes(env.SANITY_EDITOR_TOKEN));
});

test('the inbox rejects invalid bodies, honeypots, cross-origin posts, unsupported methods and oversized requests before writing', async () => {
  const never=async()=>assert.fail('Invalid request reached the CMS');
  for(const value of [null,[],{}, {...body,eraId:'unknown'}, {...body,memory:'short'}, {...body,memory:'x'.repeat(601)}, {...body,displayName:'x'.repeat(41)}, {...body,website:'bot.example'}, {...body,memory:'hello\u0000 world'}]){
    assert.equal((await handleMemoriesRequest(post(value),env,{fetcher:never})).status,400);
  }
  assert.equal((await handleMemoriesRequest(post(body,{origin:'https://other.test'}),env,{fetcher:never})).status,403);
  assert.equal((await handleMemoriesRequest(post(body,{'sec-fetch-site':'cross-site'}),env,{fetcher:never})).status,403);
  assert.equal((await handleMemoriesRequest(post(body,{'content-type':'text/plain'}),env,{fetcher:never})).status,415);
  assert.equal((await handleMemoriesRequest(new Request(url,{method:'DELETE'}),env,{fetcher:never})).status,405);
  assert.equal((await handleMemoriesRequest(post({...body,memory:'x'.repeat(5000)}),env,{fetcher:never})).status,413);
  assert.equal((await handleMemoriesRequest(new Request(url,{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:'{bad'}),env,{fetcher:never})).status,400);
  for(const query of ['era=%22%5D','offset=-1','offset=1.5','offset=Infinity','offset=1001']) assert.equal((await handleMemoriesRequest(new Request(url+'?'+query),env,{fetcher:never})).status,400);
});

test('memory pagination, missing-token readiness and failure responses remain honest and private',async()=>{
  const result=await handleMemoriesRequest(new Request(url),{},{fetcher:async()=>Response.json({result:Array.from({length:21},(_,i)=>({id:String(i)}))})});
  const data=await result.json();assert.equal(data.memories.length,20);assert.equal(data.hasMore,true);assert.equal(data.submissionsEnabled,false);
  assert.equal((await handleMemoriesRequest(post(),{},{fetcher:()=>assert.fail()})).status,503);
  const limited=await handleMemoriesRequest(post(),env,{allowSubmission:()=>false,fetcher:()=>assert.fail()});
  assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'60');
  for(const request of [new Request(url),post()]){
    const error=await handleMemoriesRequest(request,env,{allowSubmission:()=>true,fetcher:()=>{throw new Error('private provider detail '+env.SANITY_EDITOR_TOKEN);}});
    assert.equal(error.status,503);assert.doesNotMatch(await error.text(),/private provider detail|private-test-editor-key/);
  }
});

test('per-instance throttling separates clients and releases a client after one minute',()=>{
  const prefix='test-'+crypto.randomUUID(),now=Date.now();
  assert.equal(allowMemorySubmission(prefix,now),true);
  assert.equal(allowMemorySubmission(prefix,now+1000),false);
  assert.equal(allowMemorySubmission(prefix+'-other',now+1000),true);
  assert.equal(allowMemorySubmission(prefix,now+60000),true);
});
