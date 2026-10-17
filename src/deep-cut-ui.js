import { escapeHTML as e } from './article-content.js';
import { discoveryEra, eraURL } from './era-discoveries.js';
import { dailyDeepCut, localCalendarDay, deepCutKey, deepCutState, deepCutScore, deepCutShare } from './deep-cut.js';
import { playSound } from './sound.js';
export function createDeepCutUI({ root, begin, render, read, save, home, openEra }) {
  let shownDay = null;
  const stateFor = (day, question) => deepCutState(read(deepCutKey(day), null), question);
  function teaser() {
    const day = localCalendarDay(), question = dailyDeepCut(day), state = stateFor(day, question);
    return `<section class="deep-cut-teaser" id="play-section" aria-labelledby="deep-cut-teaser-title"><span class="file-label">A LITTLE DAILY RITUAL / ${e(day)}</span><h2 id="deep-cut-teaser-title">today’s <em>deep cut.</em></h2><p>One question. Three optional clues. A little piece of your internet history.</p><a class="primary" href="/play/" data-deep-cut>${state.choice === null ? 'play today’s deep cut' : 'open my result'} ↗</a><span class="deep-cut-caption">Free · no account · resets at your local midnight</span></section>`;
  }
  function open(navigate = true, focus = true) {
    if (navigate && location.pathname !== '/play/') history.pushState({}, '', '/play/');
    shownDay = localCalendarDay();
    const question = dailyDeepCut(shownDay), state = stateFor(shownDay, question), era = discoveryEra(question.era), answered = state.choice !== null;
    begin('deepcut'); document.title = 'Today’s Deep Cut — Fandom Files';
    render(`<section class="deep-cut-game" aria-labelledby="deep-cut-title"><button class="text-button" id="deep-cut-home">← back to the dashboard</button><div class="deep-cut-window"><div class="window-bar"><span>today’s deep cut / ${e(shownDay)}</span><span aria-hidden="true">− □ ×</span></div><div class="deep-cut-content"><span class="file-label">ONE QUESTION / ${e(era.title)} / EVERGREEN LORE</span><h1 id="deep-cut-title">${e(question.question)}</h1><p>One answer locks your round. Clues cost 20 points each.</p><div class="deep-cut-clues">${question.hints.slice(0, state.hints).map((hint, i) => `<p><span>clue ${i + 1}</span> ${e(hint)}</p>`).join('')}<button class="text-button" id="deep-cut-hint" ${answered || state.hints >= 3 ? 'disabled' : ''}>${state.hints >= 3 ? 'all three clues are open' : `open clue ${state.hints + 1} · −20 points`}</button></div><div class="answers" role="group" aria-label="Choose one answer">${question.options.map((option, i) => `<button data-deep-choice="${i}" ${answered ? 'disabled' : ''} class="${answered && i === question.answer ? 'deep-answer-correct' : answered && i === state.choice ? 'deep-answer-wrong' : ''}"><span class="answer-letter">${'ABCD'[i]}</span><span>${e(option)}</span>${answered && (i === question.answer || i === state.choice) ? `<span>${i === question.answer ? '✓ correct' : '× your guess'}</span>` : ''}</button>`).join('')}</div>${answered ? `<div class="deep-cut-result" role="status"><span class="deep-cut-score">${deepCutScore(question, state)}<small>/100</small></span><h2>${state.choice === question.answer ? 'you kept the receipt.' : 'a new piece of lore, filed.'}</h2><p><strong>${e(question.options[question.answer])}</strong> — ${e(question.explanation)}</p><p>${state.hints}/3 clues used. Come back after your local midnight for the next question.</p><button class="primary" id="deep-cut-share">send to the group chat ↗</button><p id="deep-cut-share-status" role="status"></p><a href="${eraURL(era.id)}" data-deep-era="${era.id}">go deeper: ${e(era.title)} →</a></div>` : '<p class="deep-cut-caption" role="status">Your round is saved in this browser. You can leave and come back.</p>'}</div></div><p class="deep-cut-caption">This daily question rotates from our prepared archive. Editorial stories carry their own publication dates.</p></section>`);
    root.querySelector('#deep-cut-home').onclick = home;
    if (focus) { const heading = root.querySelector('h1'); heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    const current = () => { if (localCalendarDay() !== shownDay) { open(false); return false; } return true; };
    root.querySelector('#deep-cut-hint').onclick = () => { if (!current()) return; const latest = stateFor(shownDay, question); if (latest.choice !== null || latest.hints >= 3) return; save(deepCutKey(shownDay), { ...latest, hints: latest.hints + 1 }); playSound('question'); open(false, false); root.querySelector('#deep-cut-hint').focus({ preventScroll: true }); };
    root.querySelectorAll('[data-deep-choice]').forEach(button => button.onclick = () => {
      if (!current()) return;
      const latest = stateFor(shownDay, question); if (latest.choice !== null) { open(false, false); return; }
      const choice = Number(button.dataset.deepChoice); save(deepCutKey(shownDay), { ...latest, choice }); playSound(choice === question.answer ? 'finish' : 'incorrect'); open(false, false);
      const result = root.querySelector('.deep-cut-result'); result.tabIndex = -1; result.focus({ preventScroll: true }); result.scrollIntoView({ block: 'nearest' });
    });
    const eraLink = root.querySelector('[data-deep-era]'); if (eraLink) eraLink.onclick = event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); openEra(era.id); };
    const share = root.querySelector('#deep-cut-share'); if (share) share.onclick = async () => {
      const status = root.querySelector('#deep-cut-share-status'), text = deepCutShare(shownDay, question, state, location.origin);
      try { if (navigator.share) await navigator.share({ title: 'Today’s Deep Cut', text }); else { await navigator.clipboard.writeText(text); status.textContent = 'copied. send it to your mutuals. <3'; } }
      catch (error) { if (error.name !== 'AbortError') { status.innerHTML = '<label>copy your result<textarea readonly></textarea></label>'; status.querySelector('textarea').value = text; } }
    };
  }
  function refresh() { if (shownDay !== localCalendarDay()) open(false); }
  return { teaser, open, refresh };
}
