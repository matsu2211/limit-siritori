/**
 * Web Audio API synthesizer for clean sound effects without external audio assets.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function isSoundMuted(): boolean {
  return isMuted;
}

/**
 * Cheerful success chime (ding-dong!)
 */
export function playSuccessSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'triangle';

  // Chime frequencies (C6 -> G6)
  osc1.frequency.setValueAtTime(1046.5, now);
  osc1.frequency.setValueAtTime(1567.98, now + 0.12);

  osc2.frequency.setValueAtTime(523.25, now);
  osc2.frequency.setValueAtTime(783.99, now + 0.12);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.45);
  osc2.stop(now + 0.45);
}

/**
 * Soft invalid / warning buzz
 */
export function playErrorSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(160, now + 0.25);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Timer tick for countdown
 */
export function playTickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Game over melody
 */
export function playGameOverSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [440, 392, 349, 311];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.18;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.18, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.25);
  });
}
