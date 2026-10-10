export const bank = [
 ['Tumblr archaeology','What did Tumblr users call a combination of Supernatural, Doctor Who, and Sherlock fandoms?',['SuperWhoLock','Wholocknatural','SuperDoctor','The Big Three'],0,'SuperWhoLock was the crossover fandom shorthand of early-2010s Tumblr.'],
 ['Tumblr archaeology','Which Tumblr feature sends a post onto your own blog?',['Repost','Reblog','Retweet','Repin'],1,'Reblogging, often with added commentary, powered Tumblr fandom conversations.'],
 ['Tumblr archaeology','A fanfic tagged “AU” takes place in…',['An alternate universe','An anonymous upload','An audio update','An artist union'],0,'Alternate universe: familiar characters, a different setting or premise. Coffee shop, anyone?'],
 ['Tumblr archaeology','On a fandom blog, an “OTP” is…',['One true pairing','Original Tumblr post','Online trending picture','Official tour playlist'],0,'One true pairing: the fictional or fandom pairing someone is especially invested in.'],
 ['Stan studies','Which show brought the members of One Direction together in 2010?',['The Voice UK','The X Factor UK','Britain’s Got Talent','American Idol'],1,'The group formed on the 2010 series of The X Factor UK.'],
 ['Stan studies','Ariana Grande played Cat Valentine on which show first?',['Victorious','iCarly','Hannah Montana','Good Luck Charlie'],0,'Cat Valentine debuted on Victorious, before Sam & Cat.'],
 ['Stan studies','“No control” became a fan-led single campaign for which band?',['5 Seconds of Summer','One Direction','The Vamps','Big Time Rush'],1,'Directioners organized a 2015 campaign around “No Control,” an album track from Four.'],
 ['Stan studies','In stan vocabulary, your “bias” usually means…',['Your favorite member','Your blocked list','A leaked demo','Your oldest account'],0,'The term is especially common in K-pop fandom for a favorite member.'],
 ['Stan studies','Ariana’s “thank u, next” video references which film among its homages?',['Mean Girls','Twilight','The Hunger Games','Clueless'],0,'Mean Girls appears alongside references to Bring It On, 13 Going on 30, and Legally Blonde.'],
 ['Stan studies','One Direction’s debut album was called…',['Take Me Home','Midnight Memories','Up All Night','Four'],2,'Up All Night was released in 2011.'],
 ['Feed literacy','A “ratio” on social media generally suggests…',['A post got more negative engagement than support','A perfectly square photo','A scheduled post','A private account'],0,'Usage varies, but the joke is that replies or a reply’s likes outnumber the original post’s support.'],
 ['Feed literacy','“Delulu” is internet shorthand for…',['Delusional','Deluxe','Deleted user','Delayed upload'],0,'Often used jokingly about unrealistic hopes, including fandom fantasies.'],
 ['Feed literacy','A “fancam” originally centers on…',['A performer filmed by a fan','A webcam filter','A movie trailer','A brand livestream'],0,'Fan-shot performance videos helped popularize fancams, particularly in K-pop.'],
 ['Feed literacy','Someone says a song “understood the assignment.” They mean…',['It delivered exactly the right vibe','It plagiarized homework','It was removed from streaming','It came with a worksheet'],0,'It’s praise for delivering what the moment called for.'],
 ['Feed literacy','“Brainrot” as online slang describes…',['An obsessive or absurd internet fixation','A browser virus','A broken monitor','A deleted playlist'],0,'It’s slang, not a medical diagnosis, for content or obsessions that take over your feed and thoughts.'],
 ['Deep-cut desk','Which platform was famous for six-second looping videos?',['Vine','Tumblr','Periscope','Musical.ly'],0,'Vine made the six-second loop its signature format.'],
 ['Deep-cut desk','“Is this a pigeon?” comes from a screenshot of…',['An anime character pointing at a butterfly','A nature documentary','A cooking show','A bird identification app'],0,'The meme uses a frame from The Brave Fighter of Sun Fighbird.'],
 ['Deep-cut desk','“All your base are belong to us” originated in…',['A video game translation','A Tumblr fanfic','A Vine caption','A pop song'],0,'The phrase comes from the English translation of the game Zero Wing.'],
 ['Deep-cut desk','“Loss” became a recognizable visual meme from…',['A webcomic strip','A music video','A reality TV reunion','A browser error'],0,'The original strip was published in the webcomic Ctrl+Alt+Del in 2008.'],
 ['Deep-cut desk','“Rickrolling” tricks someone into opening…',['Never Gonna Give You Up','A fake login page','A cat livestream','A deleted tweet'],0,'The bait-and-switch links to Rick Astley’s “Never Gonna Give You Up.”']
].map((q,id)=>({id,category:q[0],question:q[1],options:q[2],answer:q[3],explanation:q[4]}));
export const dayKey = (date = new Date()) => date.toISOString().slice(0,10);
function random(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15,1|seed); t ^= t + Math.imul(t ^ t >>> 7,61|t); return ((t ^ t >>> 14) >>> 0)/4294967296; }; }
export function dailyQuestions(day) {
 const rand = random([...day].reduce((s,c)=> Math.imul(s,31)+c.charCodeAt(0)|0,0));
 const shuffle = a => { for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; };
 return [...new Set(bank.map(q=>q.category))].flatMap((cat,i)=>shuffle(bank.filter(q=>q.category===cat)).slice(0,i<2?3:2)).map(q=>{
  const choices=shuffle(q.options.map((text,index)=>({text,correct:index===q.answer})));
  return {...q,options:choices.map(c=>c.text),answer:choices.findIndex(c=>c.correct)};
 });
}
export function rank(score){return ['Has Wi-Fi','Casual Scroller','Certified Online','Lore Archivist','Internet Final Boss'][Math.min(4,Math.floor(score/2.5))];}
export function scoreAnswers(questions,answers){return questions.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);}
