/**
 * WebAudio sound effects — fully synthesized, zero audio assets.
 * Supports five selectable styles, a master volume, countdown beeps and a
 * synthesized crowd (applause + whistling) for winner announcements.
 */
import type { SoundStyle } from "./wheelSettings";

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let masterVolume = 0.8;

/** 0–100 → applied to every effect. */
export function setSoundVolume(v: number) {
  masterVolume = Math.max(0, Math.min(100, v)) / 100;
}

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Call from a user gesture so iOS/Android allow later playback. */
export function unlockAudio() {
  ensureCtx();
}

function getNoise(ac: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ac.sampleRate) return noiseBuffer;
  const len = Math.floor(ac.sampleRate * 1.2);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

function blip(freq: number, duration: number, gainValue: number, type: OscillatorType, when = 0) {
  const ac = ensureCtx();
  if (!ac || masterVolume <= 0) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(gainValue * masterVolume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/* ------------------------------ Style profiles ----------------------------- */

interface StyleProfile {
  tickFreq: number;
  tickType: OscillatorType;
  tickGain: number;
  tickDur: number;
  winNotes: number[];
  winType: OscillatorType;
  winGain: number;
  noteGap: number;
  noteDur: number;
  applause: number; // 0 = none, 1 = normal, >1 bigger
}

const STYLES: Record<SoundStyle, StyleProfile> = {
  classic: {
    tickFreq: 1150, tickType: "triangle", tickGain: 0.05, tickDur: 0.045,
    winNotes: [523.25, 659.25, 783.99, 1046.5], winType: "triangle", winGain: 0.09, noteGap: 0.09, noteDur: 0.34,
    applause: 1.1,
  },
  arcade: {
    tickFreq: 880, tickType: "square", tickGain: 0.035, tickDur: 0.04,
    winNotes: [659.25, 880, 987.77, 1318.5], winType: "square", winGain: 0.05, noteGap: 0.07, noteDur: 0.16,
    applause: 0.8,
  },
  gameshow: {
    tickFreq: 520, tickType: "triangle", tickGain: 0.06, tickDur: 0.05,
    winNotes: [392, 523.25, 659.25, 783.99, 1046.5], winType: "triangle", winGain: 0.1, noteGap: 0.12, noteDur: 0.42,
    applause: 1.5,
  },
  soft: {
    tickFreq: 700, tickType: "sine", tickGain: 0.03, tickDur: 0.05,
    winNotes: [523.25, 659.25, 783.99], winType: "sine", winGain: 0.06, noteGap: 0.14, noteDur: 0.5,
    applause: 0.5,
  },
  celebration: {
    tickFreq: 1150, tickType: "triangle", tickGain: 0.05, tickDur: 0.045,
    winNotes: [523.25, 659.25, 783.99, 1046.5, 1318.5], winType: "triangle", winGain: 0.09, noteGap: 0.09, noteDur: 0.36,
    applause: 1.8,
  },
};

export const SOUND_STYLE_LABELS: { id: SoundStyle; label: string; hint: string }[] = [
  { id: "classic", label: "Classic", hint: "The familiar tick & fanfare" },
  { id: "arcade", label: "Arcade", hint: "Retro 8-bit blips" },
  { id: "gameshow", label: "Game Show", hint: "Dramatic TV-stage energy" },
  { id: "soft", label: "Soft", hint: "Gentle chimes for classrooms" },
  { id: "celebration", label: "Celebration", hint: "Maximum crowd & confetti" },
];

/* --------------------------------- Effects --------------------------------- */

export function playTickStyled(style: SoundStyle = "classic") {
  const p = STYLES[style] ?? STYLES.classic;
  blip(p.tickFreq, p.tickDur, p.tickGain, p.tickType);
}

export function playWinStyled(style: SoundStyle = "classic") {
  const p = STYLES[style] ?? STYLES.classic;
  p.winNotes.forEach((f, i) => blip(f, p.noteDur, p.winGain, p.winType, i * p.noteGap));
  blip(p.winNotes[p.winNotes.length - 1] * 1.5, p.noteDur + 0.16, p.winGain * 0.55, "sine", p.winNotes.length * p.noteGap);
}

export function playCountdownBeep(final = false, style: SoundStyle = "classic") {
  const p = STYLES[style] ?? STYLES.classic;
  blip(final ? p.tickFreq * 1.5 : p.tickFreq * 0.75, final ? 0.22 : 0.12, 0.08, p.tickType);
}

/** Short tick + fanfare preview for the settings panel. */
export function previewSoundStyle(style: SoundStyle) {
  unlockAudio();
  playTickStyled(style);
  window.setTimeout(() => playWinStyled(style), 220);
}

/* ------------------------------ Crowd applause ----------------------------- */

/**
 * Synthesized stadium crowd: a roaring bed, a big "YAY!" cheer swell,
 * ~210 individually placed hand claps with an opening burst, a handful of
 * voice-like cheer swells, and 3–4 enthusiastic finger whistles.
 */
export function playApplause(duration = 3.8, intensity = 1) {
  const ac = ensureCtx();
  if (!ac || masterVolume <= 0) return;
  const now = ac.currentTime;
  const noise = getNoise(ac);
  const k = Math.max(0.2, intensity);

  const master = ac.createGain();
  const peak = Math.min(0.85, 0.55 * k) * masterVolume;
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(peak, now + 0.12);
  master.gain.setValueAtTime(peak, now + duration * 0.5);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 20;
  comp.ratio.value = 6;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;
  master.connect(comp);
  comp.connect(ac.destination);

  const panOut = (node: AudioNode): AudioNode => {
    if (typeof ac.createStereoPanner === "function") {
      const p = ac.createStereoPanner();
      p.pan.value = Math.random() * 2 - 1;
      node.connect(p);
      return p;
    }
    return node;
  };

  /* 1 — Roaring crowd bed (kept quiet so individual claps stay distinct) */
  const bed = ac.createBufferSource();
  bed.buffer = noise;
  bed.loop = true;
  const bedFilter = ac.createBiquadFilter();
  bedFilter.type = "bandpass";
  bedFilter.frequency.value = 1700;
  bedFilter.Q.value = 0.5;
  const bedGain = ac.createGain();
  bedGain.gain.value = 0.085;
  bed.connect(bedFilter);
  bedFilter.connect(bedGain);
  bedGain.connect(master);
  bed.start(now);
  bed.stop(now + duration);

  /* 2 — The big "YAY!" cheer swell (voice-band noise that rises then settles) */
  const cheerLevel = 0.1 * Math.min(1.3, k);
  const cheer = ac.createBufferSource();
  cheer.buffer = noise;
  cheer.loop = true;
  const cheerFilter = ac.createBiquadFilter();
  cheerFilter.type = "bandpass";
  cheerFilter.Q.value = 0.9;
  cheerFilter.frequency.setValueAtTime(620, now);
  cheerFilter.frequency.linearRampToValueAtTime(1150, now + 0.45);
  cheerFilter.frequency.linearRampToValueAtTime(780, now + duration * 0.7);
  const cheerGain = ac.createGain();
  cheerGain.gain.setValueAtTime(0.0001, now);
  cheerGain.gain.exponentialRampToValueAtTime(cheerLevel, now + 0.32);
  cheerGain.gain.setValueAtTime(cheerLevel, now + duration * 0.45);
  cheerGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);
  cheer.connect(cheerFilter);
  cheerFilter.connect(cheerGain);
  cheerGain.connect(master);
  cheer.start(now);
  cheer.stop(now + duration);

  /* 3 — Individual claps: slower rate, clearer definition.
         Each clap gets a sharp attack, a short body and a longer tail,
         through a narrower high-Q band so it reads as a distinct "clap"
         instead of blending into a hiss. A gentle high-shelf "air" bus
         adds crispness without harshness. */
  const clapBus = ac.createGain();
  clapBus.gain.value = 1;
  const clapAir = ac.createBiquadFilter();
  clapAir.type = "highshelf";
  clapAir.frequency.value = 2800;
  clapAir.gain.value = 3.5;
  clapBus.connect(clapAir);
  clapAir.connect(master);

  const claps = Math.round(115 * Math.min(1.35, k));
  for (let i = 0; i < claps; i++) {
    const early = i < claps * 0.18;
    const offset = early ? Math.random() * 0.65 : 0.5 + Math.pow(Math.random(), 0.95) * duration * 0.88;
    const phase = offset / duration;
    if (!early && phase > 0.65 && Math.random() < (phase - 0.65) * 1.6) continue;
    const t = now + offset;

    const src = ac.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.7 + Math.random() * 0.7;

    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900 + Math.random() * 1500;
    filter.Q.value = 1.2 + Math.random() * 1.3;

    const g = ac.createGain();
    const clapPeak = 0.11 + Math.random() * 0.16;
    // Sharp attack → short body → longer, clearer tail
    g.gain.setValueAtTime(clapPeak, t);
    g.gain.exponentialRampToValueAtTime(clapPeak * 0.4, t + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07 + Math.random() * 0.07);

    src.connect(filter);
    filter.connect(g);
    panOut(g).connect(clapBus);
    src.start(t, Math.random() * Math.max(0.01, noise.duration - 0.2), 0.18);
  }

  /* 4 — Cheer voices: short formant-filtered "woo!" swells */
  const voices = 4 + (Math.random() < 0.5 ? 1 : 0) + (k > 1.2 ? 1 : 0);
  for (let i = 0; i < voices; i++) {
    const t0 = now + 0.15 + Math.random() * duration * 0.4;
    const hold = 0.3 + Math.random() * 0.35;
    const f0 = 260 + Math.random() * 200;

    const osc = ac.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f0 * (1.35 + Math.random() * 0.4), t0 + 0.22);
    osc.frequency.setValueAtTime(f0 * 1.4, t0 + hold);
    osc.frequency.exponentialRampToValueAtTime(f0 * 1.1, t0 + hold + 0.22);

    // Slow waver, like a real voice
    const lfo = ac.createOscillator();
    lfo.frequency.value = 5 + Math.random() * 2.5;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 7;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Voice-band formant keeps it sounding like a distant crowd, not a synth
    const formant = ac.createBiquadFilter();
    formant.type = "bandpass";
    formant.frequency.value = f0 * (2.2 + Math.random() * 1.2);
    formant.Q.value = 1.1;

    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.04, t0 + 0.09);
    g.gain.setValueAtTime(0.04, t0 + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + hold + 0.25);

    osc.connect(formant);
    formant.connect(g);
    panOut(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + hold + 0.3);
    lfo.start(t0);
    lfo.stop(t0 + hold + 0.3);
  }

  /* 5 — Enthusiastic finger whistles */
  const whistleCount = 3 + (Math.random() < 0.6 ? 1 : 0);
  for (let i = 0; i < whistleCount; i++) {
    const t0 = now + 0.25 + Math.random() * duration * 0.45;
    const hold = 0.35 + Math.random() * 0.3;
    const f0 = 1050 + Math.random() * 350;
    const f1 = 2000 + Math.random() * 750;

    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f1, t0 + 0.2);
    osc.frequency.setValueAtTime(f1, t0 + hold);
    osc.frequency.exponentialRampToValueAtTime(f1 * (Math.random() < 0.4 ? 1.12 : 0.9), t0 + hold + 0.24);

    const lfo = ac.createOscillator();
    lfo.frequency.value = 16 + Math.random() * 9;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 48;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.065, t0 + 0.06);
    g.gain.setValueAtTime(0.065, t0 + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + hold + 0.28);

    osc.connect(g);
    panOut(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + hold + 0.32);
    lfo.start(t0);
    lfo.stop(t0 + hold + 0.32);
  }
}

/** Fanfare + full crowd applause & cheering, in a given style. */
export function playCelebrationStyled(style: SoundStyle = "classic") {
  const p = STYLES[style] ?? STYLES.classic;
  playWinStyled(style);
  if (p.applause > 0) {
    playApplause(2.6 + p.applause * 1.1, p.applause);
  }
}

/* ------------------------- Backwards-compatible API ------------------------ */
/* Used by the smaller tools (dice, coins, pickers…) — classic style. */

export function playTick() {
  playTickStyled("classic");
}

export function playWin() {
  playWinStyled("classic");
}

export function playPop() {
  blip(660, 0.09, 0.06, "sine");
}

export function playCelebration() {
  playCelebrationStyled("classic");
}
