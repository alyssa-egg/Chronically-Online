import test from 'node:test';
import assert from 'node:assert/strict';
import { collections, publicArchive, publicArchiveModule } from '../server/archive.mjs';
import { recoverFile, validCollectionProgress, fileAnswer } from '../src/collection.js';
import { lostPost, lostWon, validLostGuesses } from '../src/lost-post.js';
import { dailyPuzzle } from '../src/puzzle.js';
import { sideblogState, collect, pinnedReceipts, stickers } from '../src/sideblog.js';
test('archive catalog publishes only three free folders; premium files stay server-side',()=>{
 const {catalog,samples}=publicArchive();
 assert.equal(catalog.length,12);assert.equal(Object.keys(samples).length,3);
 assert.equal(new Set(catalog.map(c=>c.id)).size,12);
 for(const c of catalog) { assert.equal(c.fileCount,3);assert.equal(c.files,undefined); }
 for(const c of collections.filter(c=>!c.free)) {
  assert.equal(samples[c.id],undefined);
  for(const file of c.files) assert.ok(!publicArchiveModule().includes(JSON.stringify(file)),file.id);
 }
 assert.equal(catalog.filter(c=>c.era==='youtube').length,6);
});
test('matching, timeline and decode files validate real submissions and reject altered progress',()=>{
 const methods=new Set();
 for(const c of collections) {
  const progress=[];
  for(const file of c.files) {
   methods.add(file.method);
   const answer=file.method==='decode'?file.answer:file.method==='timeline'?file.order:file.solution;
   assert.equal(recoverFile(file,answer),true,file.id);
   assert.equal(recoverFile(file,null),false);
   assert.ok(!recoverFile(file,'wrong-reference'));
   assert.ok(fileAnswer(file));
   progress.push({id:file.id,submission:answer});
  }
  assert.deepEqual(validCollectionProgress(c,progress),progress);
  const altered=structuredClone(progress);altered[0].submission='wrong-reference';
  assert.deepEqual(validCollectionProgress(c,altered),[]);
  altered[0]={id:c.files[0].id,submission:null};
  assert.deepEqual(validCollectionProgress(c,altered),altered);
  altered[0].id='another-file';assert.deepEqual(validCollectionProgress(c,altered),[]);
 }
 assert.deepEqual([...methods].sort(),['decode','match','timeline']);
 const timeline=collections.flatMap(c=>c.files).find(f=>f.method==='timeline');
 assert.equal(recoverFile(timeline,[...timeline.order].reverse()),false);
 const match=collections[0].files[0];assert.equal(recoverFile(match,{...match.solution,extra:'right-0'}),false);
});
test('Lost Post rotates 30 stable references and stays different from the same-day Anonymous Ask',()=>{
 const answers=[];
 for(let n=0;n<30;n++) {
  const day=new Date(Date.UTC(2026,9,12+n)).toISOString().slice(0,10),post=lostPost(day);
  assert.equal(post.clues.length,4);assert.notEqual(post.answer,dailyPuzzle(day).answer);
  answers.push(post.answer);
  assert.equal(lostWon(post,[post.answer.toUpperCase()]),true);
  assert.deepEqual(validLostGuesses(post,['wrong',post.answer]),['wrong',post.answer]);
  assert.deepEqual(validLostGuesses(post,[post.answer,'after-winning']),[]);
  assert.deepEqual(validLostGuesses(post,['wrong','WRONG']),[]);
  assert.deepEqual(validLostGuesses(post,[null,null,null]),[null,null,null]);
  assert.deepEqual(validLostGuesses(post,['a','b','c','d']),[]);
 }
 assert.equal(new Set(answers).size,30);
 assert.equal(lostPost('2026-10-12').answer,lostPost('2026-11-11').answer);
});
test('sideblog deduplicates rewards, enforces cosmetic unlocks and filters invalid pins',()=>{
 let state=sideblogState({theme:'midnight',pins:['missing'],decorations:['bow','disc','unknown']});
 assert.equal(state.theme,'paper');assert.deepEqual(state.pins,[]);assert.deepEqual(state.decorations,[]);
 state=collect(state,'receipts',{id:'receipt-1',title:'Recovered lore',kind:'lost'});
 state=collect(state,'receipts',{id:'receipt-1',title:'Recovered lore',kind:'lost'});
 assert.equal(state.receipts.length,1);
 assert.equal(stickers.find(s=>s.id==='disc').unlocked(state),true);
 state=collect(state,'chapters',{id:'chapter-1',title:'The old dashboard',era:'tumblr'});
 state=sideblogState({...state,theme:'fandom',pins:['receipt-1','missing'],decorations:['disc','heart']});
 assert.equal(state.theme,'fandom');assert.equal(pinnedReceipts(state)[0].id,'receipt-1');
 assert.deepEqual(state.pins,['receipt-1']);
 assert.equal(sideblogState({...state,name:'a'.repeat(100)}).name.length,36);
});
