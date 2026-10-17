import { deepCutQuestions } from './deep-cut-questions.js';
export const DEEP_CUT_VERSION = 'v1';
export function localCalendarDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dailyDeepCut(day = localCalendarDay()) {
  const date = new Date(`${day}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(+date) || date.toISOString().slice(0, 10) !== day) throw new Error('Invalid calendar date');
  const index = Math.floor(+date / 86400000);
  const groups = ['fandom-years', 'influencer-era', 'current-lore'].map(era => deepCutQuestions.filter(q => q.era === era));
  const rotation = Array.from({ length: Math.max(...groups.map(group => group.length)) }, (_, i) => groups.map(group => group[i]).filter(Boolean)).flat();
  const original = rotation[((index % rotation.length) + rotation.length) % rotation.length];
  const shift = ((index % 4) + 4) % 4;
  const choices = original.options.map((text, i) => ({ text, correct: i === original.answer }));
  const rotated = [...choices.slice(shift), ...choices.slice(0, shift)];
  return { ...original, options: rotated.map(choice => choice.text), answer: rotated.findIndex(choice => choice.correct) };
}
export const deepCutKey = day => `fandom-files-deep-cut-${DEEP_CUT_VERSION}-${day}`;
export function deepCutState(value, question) {
  if (!value || value.questionId !== question.id || !Number.isInteger(value.hints) || value.hints < 0 || value.hints > question.hints.length || (value.choice !== null && (!Number.isInteger(value.choice) || value.choice < 0 || value.choice >= question.options.length))) return { questionId: question.id, hints: 0, choice: null };
  return { questionId: question.id, hints: value.hints, choice: value.choice };
}
export const deepCutScore = (question, state) => state.choice === question.answer ? 100 - state.hints * 20 : 0;
export function deepCutShare(day, question, state, origin) {
  return `Fandom Files · Today’s Deep Cut\n${day} · ${deepCutScore(question, state)}/100\n${state.choice === question.answer ? '🟩' : '⬛'}${'🟨'.repeat(state.hints)}\n${state.hints}/3 clues · you had to be there.\n${origin}/play/`;
}
