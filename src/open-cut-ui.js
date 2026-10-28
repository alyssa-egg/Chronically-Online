import { dayKey } from './game.js';
import { discoveryEra, eraURL } from './era-discoveries.js';
import { escapeHTML as e } from './article-content.js';
import { fileStamp, pixelIcon } from './archive-atoms.js';
import { playSound } from './sound.js';
import { drawBrand, saveCanvas } from './collectibles-export.js';
import { dailyOpenCut, openCutKey, openCutState, completeOpenCut, openCutResult, openCutShare, openCutHistory, openCutPersonal, OPEN_CUT_HISTORY, OPEN_CUT_SECONDS, startTimedOpenCut, advanceTimedOpenCut, submitTimedOpenCut, scoreOpenAnswer } from './open-cut.js';

export function createOpenCutUI({root,read,save,render,begin,home,openEra,openQuizzes,openFiles}) {
 let shownDay,clock,active=false;
 const leave=()=>{active=false;clearInterval(clock);};
 const getState=challenge=>openCutState(read(openCutKey(challenge.day),null),challenge);
 function remember(state){
  save(openCutKey(state.day),state);
  if(state.completed)save(OPEN_CUT_HISTORY,openCutHistory([...openCutHistory(read(OPEN_CUT_HISTORY,[])),state]));
 }
 function teaser(){
  const challenge=dailyOpenCut(),state=getState(challenge),result=state.completed?openCutResult(challenge,state):null;
  return `<section class="deep-cut-teaser open-cut-teaser" id="play-section" aria-labelledby="main-game-title">${fileStamp('the main daily game')}<span class="file-label">DAILY FILE ${String(challenge.number).padStart(3,'0')} / FIVE OPEN ANSWERS</span><h2 id="main-game-title">the <em>deep cut.</em></h2><p class="open-cut-tagline">The obvious answer won’t get you very far.</p><p>Five prompts. Your internet history. Find the references that go a little deeper.</p><a class="primary" href="/play/" data-main-cut>${state.completed?`open my ${result.total}/500 result`:state.answers.some(Boolean)?'continue today’s file':'open today’s file'} ${pixelIcon('arrow')}</a><span class="deep-cut-caption">${state.completed?'today’s file is closed ✓':'25 seconds each · free · no account'} · new file at midnight Eastern</span><img class="scrapbook-cursor" src="/src/assets/pixel-cursor.png" alt="" aria-hidden="true" width="30" height="40"></section>`;
 }
 function personalMarkup(){
  const today=dailyOpenCut(),state=getState(today);if(state.completed)remember(state);
  const personal=openCutPersonal(read(OPEN_CUT_HISTORY,[]));
  return `<section class="personal-files"><div class="personal-stats"><div><span>TODAY’S FILE</span><strong>${state.completed?`${openCutResult(today,state).total}/500`:'ready when you are'}</strong></div><div><span>CURRENT STREAK</span><strong>${personal.diary.streak} ${personal.diary.streak===1?'day':'days'}</strong></div><div><span>FILES CLOSED</span><strong>${personal.history.length}</strong></div><div><span>PERSONAL BEST</span><strong>${personal.history.length?`${personal.best}/500`:'your first file awaits'}</strong></div></div><p class="personal-note">Your longest streak is ${personal.diary.best} ${personal.diary.best===1?'day':'days'}. Streaks count consecutive completed Eastern dates, including yesterday if you haven’t played today. Miss a day? Your saved files and stamps stay. These records live in this browser.</p><div class="launch-stamps">${personal.stamps.map(stamp=>`<div class="launch-stamp ${stamp.earned?'is-earned':''}">${pixelIcon('stamp')}<strong>${e(stamp.label)}</strong><span>${stamp.earned?'filed ✓':e(stamp.goal)}</span></div>`).join('')}</div><h2>your closed files.</h2>${personal.history.length?`<ul class="daily-history">${personal.history.slice().reverse().map(record=>{const challenge=dailyOpenCut(record.day),result=openCutResult(challenge,record);return `<li><button class="text-button" data-daily-history="${record.day}"><span>${record.day} / FILE ${challenge.number}</span><strong>${result.total}/500</strong><span>${result.accepted}/5 matched · ${result.deep} deep cuts ↗</span></button></li>`;}).join('')}</ul>`:'<p>Finish your first Deep Cut to start a little history.</p>'}</section>`;
 }
 function bindHistory(){root.querySelectorAll('[data-daily-history]').forEach(button=>button.onclick=()=>openHistory(button.dataset.dailyHistory));}
 function openHistory(day){const challenge=dailyOpenCut(day),state=openCutHistory(read(OPEN_CUT_HISTORY,[])).find(item=>item.day===day);if(!state)return;leave();begin('opencut');shownDay=day;document.title='A Closed File — The Fandom Files';paintResult(challenge,state,true);}
 function open(navigate=true){
  leave();active=true;shownDay=dayKey();
  if(navigate&&location.pathname+location.search!=='/play/')history.pushState({},'','/play/');
  begin('opencut');document.title='The Deep Cut — The Fandom Files';
  const challenge=dailyOpenCut(shownDay),state=advanceTimedOpenCut(getState(challenge),challenge);
  if(state.completed){remember(state);paintResult(challenge,state);return;}
  if(state.timing){remember(state);paintPrompt(challenge,state);}else paintIntro(challenge,state);
 }
 function paintIntro(challenge,state){
  render(`<section class="open-cut-game"><button class="text-button" id="open-cut-home">← back to the dashboard</button><div class="open-cut-heading"><span class="file-label">THE DEEP CUT / DAILY FILE ${challenge.number} / ${challenge.day}</span><h1>five prompts.<br><em>trust your internet brain.</em></h1></div><div class="timed-start-card"><span class="file-label">25 SECONDS PER PROMPT / THE TIMER IS PART OF THE GAME</span><h2>ready to open the file?</h2><p>One answer at a time. You have 25 seconds for each prompt. Submit early, or your typed answer is filed automatically at zero. A blank scores 0.</p><p>Filed answers are locked. The timer keeps going if you refresh or leave the tab. New prompts stay hidden until it’s their turn.</p><p>Titles with their artists, common nicknames and small, unambiguous spelling slips are accepted. Valid familiar answers count too; deep cuts earn extra.</p><button class="primary" id="start-timed-cut">start today’s timed file →</button></div></section>`);
  root.querySelector('#open-cut-home').onclick=home;
  root.querySelector('#start-timed-cut').onclick=()=>{if(dayKey()!==shownDay){open(false);return;}const latest=getState(challenge);if(latest.completed){paintResult(challenge,latest);return;}const started=startTimedOpenCut(latest,challenge);remember(started);playSound('question');paintPrompt(challenge,started);};
  const heading=root.querySelector('h1');heading.tabIndex=-1;heading.focus();
 }
 function paintPrompt(challenge,state,error=''){
  clearInterval(clock);
  const step=state.step,prompt=challenge.prompts[step];
  const filed=state.answers.slice(0,step).map((raw,i)=>scoreOpenAnswer(challenge.prompts[i],raw)),points=filed.reduce((n,part)=>n+part.points,0),matched=filed.filter(part=>part.accepted).length,last=filed.at(-1);
  const feedback=last?`<div class="prompt-feedback ${last.accepted?'feedback-match':'feedback-unlisted'}" role="status"><strong>${last.accepted?`${last.deep?'deep cut found!':'that counts!'} +${last.points} points`:last.raw?'not in the archive yet · 0 points':'blank filed · 0 points'}</strong><span>${last.accepted?`Read as ${e(last.answer)}${last.match==='spelling'?' — spelling variation accepted.':'.'}`:last.raw?'That may be a valid reference; it needs an entry in the answer archive.':'On to the next little reference.'}</span></div>`:'';
  render(`<section class="open-cut-game timed-game-active"><button class="text-button" id="open-cut-home">← back to the dashboard</button><div class="open-cut-heading"><span class="file-label">THE DEEP CUT / DAILY FILE ${challenge.number} / ${challenge.day}</span><h1>the obvious answer<br><em>won’t get you very far.</em></h1><p>Every valid listed reference earns points. Deep cuts get a bonus; no live rarity statistics.</p></div><ol class="prompt-steps timed-prompt-steps" aria-label="Your five prompts">${challenge.prompts.map((item,i)=>`<li ${i===step?'aria-current="step"':''}><strong>${i+1}</strong><span>${i<step?`${filed[i].points} pts`:i===step?'playing':'sealed'}</span></li>`).join('')}</ol><div class="live-file-progress"><span>${step}/5 filed</span><strong>${points} points kept</strong><span>${matched} ${matched===1?'reference':'references'} counted</span></div><div class="open-answer-window"><div class="window-bar"><span>daily_file_${challenge.number}.txt</span><span>prompt ${step+1}/5</span></div><form id="open-answer-form">${feedback}<span class="file-label">${e(discoveryEra(prompt.era).title)} / OPEN ANSWER</span><h2 id="open-prompt-title">${e(prompt.question)}</h2><p id="mandatory-timer" class="mandatory-timer" role="timer" aria-live="off">${OPEN_CUT_SECONDS} seconds</p><p id="timer-announcement" class="sr-only" role="status"></p><label for="open-answer">Your reference<input id="open-answer" name="answer" maxlength="120" autocomplete="off" autocapitalize="none" spellcheck="false" value="${e(state.answers[step])}" placeholder="the first reference that comes to mind…" aria-describedby="open-answer-help open-answer-error"></label><p id="open-answer-help">One answer. Song + artist formats, common aliases and small spelling slips are accepted. At zero, what you’ve typed is filed and the next prompt opens.</p><p id="open-answer-error" role="alert">${e(error)}</p><div class="open-answer-actions"><button class="text-button" id="skip-timed-prompt" type="button">skip · 0 points</button><button class="primary" type="submit">${step===4?'file answer & see result':'file answer & next'} ${pixelIcon('arrow')}</button></div><details class="scoring-note"><summary>how the points work</summary><p>Valid matches earn 40 (classic), 60 (familiar), 80 (niche), or 100 (deep cut) points from curated lists. Fixed-lineup questions give 100 for any listed member. Time changes when your answer locks, not its rarity tier. Five prompts, up to 500 points.</p></details></form></div><p class="deep-cut-caption">25 seconds per prompt. Filed answers stay locked; refreshing does not restart the clock.</p></section>`);
  const field=root.querySelector('#open-answer'),errorNode=root.querySelector('#open-answer-error'),page=root.querySelector('.open-cut-game');let closing=false,announced=false;
  const sync=()=>{
   if(!page.isConnected||closing)return null;
   const latest=getState(challenge),next=advanceTimedOpenCut(latest,challenge);
   if(next.completed||next.step!==step){closing=true;remember(next);if(next.completed){playSound('finish');paintResult(challenge,next);}else{const part=scoreOpenAnswer(challenge.prompts[step],next.answers[step]);playSound(part.accepted?'correct':'question');paintPrompt(challenge,next);}return null;}
   state=next;return next;
  };
  field.oninput=()=>{if(!sync())return;state.answers[step]=field.value;remember(state);errorNode.textContent='';};
  root.querySelector('#open-cut-home').onclick=home;
  const fileAnswer=skip=>{
   if(!sync())return;
   try{const next=submitTimedOpenCut(state,challenge,field.value,Date.now(),{skip});closing=true;remember(next);const part=scoreOpenAnswer(prompt,next.answers[step]);playSound(next.completed?'finish':part.accepted?'correct':'question');next.completed?paintResult(challenge,next):paintPrompt(challenge,next);}
   catch(error){errorNode.textContent=error.message;field.focus();}
  };
  root.querySelector('#open-answer-form').onsubmit=event=>{event.preventDefault();if(!closing)fileAnswer(false);};
  root.querySelector('#skip-timed-prompt').onclick=()=>fileAnswer(true);
  const update=()=>{const current=sync();if(!current)return;const seconds=Math.max(0,Math.ceil((current.timing.deadline-Date.now())/1000)),timer=root.querySelector('#mandatory-timer');if(timer){timer.textContent=`${seconds} ${seconds===1?'second':'seconds'} · auto-files at zero`;timer.classList.toggle('timer-last-seconds',seconds<=5);}if(seconds<=5&&!announced){announced=true;root.querySelector('#timer-announcement').textContent='Five seconds left. Your answer will be filed automatically.';}};
  update();if(!closing)clock=setInterval(update,200);
  if(!closing){root.querySelector('.open-answer-window').scrollIntoView({block:'start',behavior:'instant'});field.setAttribute('aria-label',`${prompt.question} Your reference`);field.focus();}
 }
 function paintResult(challenge,state,archived=false){
  active=false;clearInterval(clock);const result=openCutResult(challenge,state);
  render(`<section class="open-cut-results"><button class="text-button" id="result-back">← ${archived?'back to my files':'back to the dashboard'}</button><div class="daily-result-card"><span class="file-label">FANDOM FILES · THE DEEP CUT / FILE ${challenge.number}</span><h1>today’s file<br><em>is closed.</em></h1><p class="closed-file-date">${challenge.day}${archived?' / FROM MY FILES':''}</p><div class="open-cut-score">${result.total}<span>/500</span></div><p class="result-personal-label">${e(result.label)}</p>${result.accepted===5?'<p class="all-answers-counted">♥ Every one of your five references counts.</p>':''}<div class="five-part-score" role="img" aria-label="${result.parts.map((part,i)=>`Prompt ${i+1}: ${part.points} points`).join('; ')}">${result.parts.map((part,i)=>`<div class="score-part ${part.deep?'is-deep':part.accepted?'is-matched':'is-unmatched'}"><span>${i+1}</span><strong>${part.points}</strong><small>${part.deep?'deep cut':part.accepted?'counts':'not listed'}</small></div>`).join('')}</div><p class="result-counts">5 prompts filed · ${result.accepted} ${result.accepted===1?'reference':'references'} counted · ${result.deep} deep cuts found</p><span class="file-label">YOU HAD TO BE THERE.</span></div><div class="open-result-actions"><button class="primary" id="copy-open-result">copy my result ${pixelIcon('arrow')}</button>${navigator.share?'<button class="secondary" id="share-open-result">share result ↗</button>':''}<button class="secondary" id="download-open-result">save result image ↓</button></div><p id="open-result-status" role="status">${result.parts.some(part=>part.creditedLater)?'Extra credit added: previously unlisted answers are now recognised. Your earlier earned points were kept.':''}</p><details class="answer-explanations"><summary>open today’s answer explanations</summary>${challenge.prompts.map((prompt,i)=>{const part=result.parts[i];return `<article><span class="file-label">${part.accepted?'✓ THIS COUNTS':'NOT YET FILED'} / PROMPT ${i+1} / ${part.points} POINTS / ${e(part.label)}</span><h2>${e(prompt.question)}</h2><p class="submitted-reference">Your answer: <strong>${e(state.answers[i]||"No answer filed")}</strong></p><p>${e(part.explanation)}</p>${part.accepted?'':`<p>A few listed answers: ${prompt.answers.slice(0,3).map(answer=>e(answer.label)).join(' · ')}.</p>`}<a href="${eraURL(prompt.era)}" data-open-result-era="${prompt.era}">open ${e(discoveryEra(prompt.era).title)} ↗</a></article>`;}).join('')}</details><div class="return-tomorrow"><h2>same dashboard, new file.</h2><p>A new challenge opens at midnight Eastern. Your closed file stays here; missing a day never removes a result.</p><button class="secondary" id="result-quizzes">try an era quiz ↗</button><button class="text-button" id="result-my-files">my files & stamps ♡</button></div></section>`);
  root.querySelector('#result-back').onclick=archived?openFiles:home;
  root.querySelector('#result-quizzes').onclick=()=>openQuizzes();root.querySelector('#result-my-files').onclick=openFiles;
  root.querySelectorAll('[data-open-result-era]').forEach(link=>link.onclick=event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();openEra(link.dataset.openResultEra);});
  const text=openCutShare(challenge,result,location.origin),status=root.querySelector('#open-result-status');
  const fallback=()=>{status.innerHTML='<label>Copy your result<textarea readonly rows="6"></textarea></label>';status.querySelector('textarea').value=text;status.querySelector('textarea').select();};
  root.querySelector('#copy-open-result').onclick=async()=>{try{await navigator.clipboard.writeText(text);if(status.isConnected)status.textContent='Copied. Send it to your mutuals. ♡';}catch{if(status.isConnected)fallback();}};
  const share=root.querySelector('#share-open-result');if(share)share.onclick=async()=>{try{await navigator.share({title:'Fandom Files · The Deep Cut',text});}catch(error){if(error.name!=='AbortError'&&status.isConnected)fallback();}};
  root.querySelector('#download-open-result').onclick=async event=>{const button=event.currentTarget;button.disabled=true;try{await exportOpenResult(challenge,result);if(status.isConnected)status.textContent='Your result card is ready. ♡';}catch(error){if(status.isConnected)status.textContent=error.name==='AbortError'?'Sharing cancelled. Your result is still saved.':'The image could not export. You can screenshot the card or copy your result.';}finally{if(button.isConnected)button.disabled=false;}};
  const heading=root.querySelector('h1');heading.tabIndex=-1;heading.focus();
 }
 function refresh(){if(active&&shownDay!==dayKey()){const state=getState(dailyOpenCut(shownDay));if(!state.timing)open(false);}}
 return {open,leave,refresh,teaser,personalMarkup,bindHistory};
}
async function exportOpenResult(challenge,result){
 await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#F8F4EC';ctx.fillRect(0,0,1080,1350);ctx.strokeStyle='#0B0B0F';ctx.lineWidth=3;ctx.strokeRect(35,35,1010,1280);
 await drawBrand(ctx,75,75,860);
 const text=(value,x,y,size,bold=false)=>{ctx.fillStyle='#0B0B0F';ctx.font=`${bold?'700':'400'} ${size}px ${bold?'Helvetica, Arial':'"DM Sans", sans-serif'}`;ctx.fillText(value,x,y);};
 text(`THE DEEP CUT / FILE ${challenge.number}`,75,290,26,true);text(challenge.day,75,340,25);
 text('today’s file',75,455,72,true);text('is closed.',75,535,72,true);
 text(`${result.total}/500`,75,710,126,true);
 result.parts.forEach((part,i)=>{const x=75+i*188;ctx.fillStyle=part.deep?'#FF5BC8':part.accepted?'#C8B6FF':'#e0dcd8';ctx.fillRect(x,790,168,155);text(String(part.points),x+25,865,45,true);text(`PROMPT ${i+1}`,x+22,915,17);});
 text(`${result.accepted}/5 matched · ${result.deep} deep cuts`,75,1030,32,true);text('The obvious answer won’t get you very far.',75,1105,29);text('YOU HAD TO BE THERE. #TheDeepCut',75,1185,25,true);text(location.host,75,1250,24);
 await saveCanvas(canvas,`fandom-files-deep-cut-${challenge.day}.png`,'My Deep Cut result');
}
