import test from 'node:test';
import assert from 'node:assert/strict';
import { badgeDefinitions, badgeById, badgeProgress, unlockBadges, featuredBadge, nextCollectible } from '../src/badges.js';
import { sideblogState, collect } from '../src/sideblog.js';
test('collectible goals reward real saved game results, not empty or revealed mystery receipts',()=>{
 let state=sideblogState();assert.equal(unlockBadges(state,'2026-10-12').badges.length,0);
 state=collect(state,'stamps',{id:'lost-stamp',title:'The Lost Post',kind:'lost',date:'2026-10-12'});
 assert.equal(state.badges.some(b=>b.id==='recovered-player'),false);
 state=collect(state,'receipts',{id:'lost-answer',title:'A recovered reference',kind:'lost',guesses:1,date:'2026-10-12'});
 assert.equal(state.badges.some(b=>b.id==='recovered-player'),true);
 assert.equal(state.badges.some(b=>b.id==='first-guess'),true);
 state=collect(state,'receipts',{id:'lost-answer',title:'A recovered reference',kind:'lost',guesses:1,date:'2026-10-12'});
 assert.equal(state.receipts.length,1);assert.equal(state.badges.filter(b=>b.id==='first-guess').length,1);
 assert.equal(featuredBadge(state).id,'first-guess');
});
test('seven-day collectible counts different days rather than multiple games in one day, and never resets for missed days',()=>{
 let state=sideblogState();
 for(let n=0;n<7;n++)state=collect(state,'stamps',{id:'same-day-'+n,title:'Daily game',kind:n%2?'quiz':'ask',date:'2026-10-12'});
 assert.equal(badgeProgress(badgeById('certified-mutual'),state),1);
 for(const date of ['2026-10-14','2026-10-20','2026-10-22','2026-10-24','2026-10-26','2026-11-01'])state=collect(state,'stamps',{id:'day-'+date,title:'Daily quiz',kind:'quiz',date});
 assert.equal(state.badges.some(b=>b.id==='certified-mutual'),true);
 const later=unlockBadges({...state,stamps:[]},'2027-01-01');
 assert.equal(later.badges.some(b=>b.id==='certified-mutual'),true);
});
test('one free folder in each era can earn The Lost Era; repeats cannot advance a collection',()=>{
 let state=sideblogState();for(const era of ['tumblr','youtube','modern'])state=collect(state,'chapters',{id:'sample-'+era,title:'Free starter',era,date:'2026-10-12'});
 assert.equal(state.badges.some(b=>b.id==='era-traveller'),true);
 state=collect(state,'chapters',{id:'sample-tumblr',title:'Free starter',era:'tumblr',date:'2026-10-12'});
 assert.equal(state.chapters.length,3);assert.equal(state.badges.some(b=>b.id==='deep-archive'),false);
 const next=nextCollectible(state);assert.ok(next);assert.ok(next.progress<next.badge.goal);
});
test('unknown collectibles and locked featured/pinned cards are discarded; legacy sideblogs keep their receipts',()=>{
 const old=sideblogState({receipts:[{id:'r',title:'A saved memory'}],theme:'paper',featuredBadge:'deep-archive',badgePins:['deep-archive'],badges:[{id:'not-a-badge',date:'2026-10-12'}]});
 assert.equal(old.receipts.length,1);assert.equal(old.featuredBadge,null);assert.deepEqual(old.badgePins,[]);assert.deepEqual(old.badges,[]);
 assert.equal(new Set(badgeDefinitions.map(b=>b.id)).size,badgeDefinitions.length);
 let state=collect(old,'stamps',{id:'q',title:'Daily quiz',kind:'quiz',date:'2026-10-12'});
 state=sideblogState({...state,featuredBadge:'you-were-there',badgePins:['you-were-there','you-were-there','not-a-badge']});
 assert.deepEqual(state.badgePins,['you-were-there']);assert.equal(featuredBadge(state).id,'you-were-there');
});
test('reopening a legacy recovered Lost Post can earn its first-guess badge without duplicating or redating the receipt',()=>{
 const old=sideblogState({receipts:[{id:'old-post',title:'Reference',kind:'lost',date:'2026-10-11'}]});
 const migrated=collect(old,'receipts',{id:'old-post',title:'Reference',kind:'lost',guesses:1,date:'2026-10-12'});
 assert.equal(migrated.receipts.length,1);assert.equal(migrated.receipts[0].date,'2026-10-11');assert.equal(migrated.receipts[0].guesses,1);
 assert.equal(old.receipts[0].guesses,undefined);assert.ok(migrated.badges.some(b=>b.id==='first-guess'));
});
test('main quiz perfection and an Ask solve earn their own artifacts; incorrect completion alone does not',()=>{
 let state=sideblogState();state=collect(state,'stamps',{id:'q9',title:'Daily quiz',kind:'quiz',score:9,total:10,date:'2026-10-12'});
 assert.equal(state.badges.some(b=>b.id==='perfect-report'),false);
 state=collect(state,'stamps',{id:'q10',title:'Daily quiz',kind:'quiz',score:10,total:10,date:'2026-10-13'});
 assert.equal(state.badges.some(b=>b.id==='perfect-report'),true);
 state=collect(state,'stamps',{id:'ask',title:'Anonymous Ask',kind:'ask',date:'2026-10-13'});assert.equal(state.badges.some(b=>b.id==='askbox-postage'),false);
 state=collect(state,'receipts',{id:'ask',title:'Correct reference',kind:'ask',date:'2026-10-13'});assert.equal(state.badges.some(b=>b.id==='askbox-postage'),true);
});
