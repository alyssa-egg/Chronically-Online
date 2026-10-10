// Original synthesized UI sounds. No recordings or third-party samples.
let context;
let enabled = true;
export const soundEnabled = () => enabled;
export const setSoundEnabled = (value) => {
  enabled = Boolean(value);
};
const melodies = {
  question: [523.25, 659.25],
  correct: [659.25, 783.99, 1046.5],
  incorrect: [392, 349.23],
  finish: [523.25, 659.25, 783.99, 1046.5],
  click: [880],
};
export function playSound(kind = "click") {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context ??= new AudioContext();
    const play = () => {
      if (!enabled) return;
      (melodies[kind] || melodies.click).forEach((frequency, i) => {
        const start = context.currentTime + i * 0.09;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.045, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.17);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      });
    };
    if (context.state === "suspended")
      context
        .resume()
        .then(play)
        .catch(() => {});
    else if (context.state === "running") play();
  } catch {
    /* Audio support never blocks play. */
  }
}
