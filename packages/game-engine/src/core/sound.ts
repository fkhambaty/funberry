"use client";

// ZzFX - Zuper Zmall Zound Zynth - Micro Edition (MIT License, Frank Force)
// Inlined to avoid npm dependency (~30 lines). Generates procedural audio via WebAudio.
const zzfxV = 0.35;

function zzfx(
  volume = 1, randomness = 0.05, frequency = 220, attack = 0, sustain = 0,
  release = 0.1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0,
  pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0,
  bitCrush = 0, delay = 0, sustainVolume = 1, decayVolume = 1, tremolo = 0,
): number[] {
  if (typeof window === "undefined") return [];
  const ctx = getAudioCtx();
  if (!ctx || _muted) return [];

  const PI2 = Math.PI * 2;
  const sampleRate = ctx.sampleRate;
  let startSlide = slide *= 500 * PI2 / sampleRate / sampleRate;
  let startFrequency = frequency *= (1 + randomness * 2 * Math.random() - randomness) * PI2 / sampleRate;
  const b: number[] = [];
  let t = 0, tm = 0, i = 0, j = 1, r = 0, c = 0, s = 0, f: number, length: number;

  attack = attack * sampleRate + 9;
  sustain = sustain * sampleRate;
  release = release * sampleRate;
  delay = delay * sampleRate;
  deltaSlide *= 500 * PI2 / sampleRate ** 3;
  pitchJump *= PI2 / sampleRate;
  pitchJumpTime *= sampleRate;
  repeatTime = repeatTime * sampleRate | 0;
  volume *= zzfxV;

  for (length = attack + sustain + release + delay | 0; i < length; b[i++] = s) {
    if (!(++c % (bitCrush * 100 | 0))) {
      s = shape ? shape > 1 ? shape > 2 ? shape > 3 ?
        Math.sin((t % PI2) ** 3) :
        Math.max(Math.min(Math.tan(t), 1), -1) :
        1 - (2 * t / PI2 % 2 + 2) % 2 :
        1 - 4 * Math.abs(Math.round(t / PI2) - t / PI2) :
        Math.sin(t);

      s = (repeatTime ? 1 - tremolo + tremolo * Math.sin(PI2 * i / repeatTime) : 1) *
        (s > 0 ? 1 : -1) * Math.abs(s) ** shapeCurve *
        volume * (i < attack ? i / attack :
          i < attack + sustain ? 1 - (i - attack - sustain) / release * (1 - sustainVolume) :
            i < length - delay ? sustainVolume : i < length ? (length - i) / delay * sustainVolume : 0);

      if (delay) {
        s = s / 2 + (delay > i ? 0 : (i < length - delay ? 1 : (length - i) / delay) * b[i - delay | 0] / 2);
      }
    }

    f = (frequency += slide += deltaSlide) * Math.cos(modulation * tm++);
    t += f - f * noise * (1 - (Math.sin(i) + 1) * 1e9 % 2);

    if (j && ++j > pitchJumpTime) {
      frequency += pitchJump;
      startFrequency += pitchJump;
      j = 0;
    }

    if (repeatTime && !(++r % repeatTime)) {
      frequency = startFrequency;
      slide = startSlide;
      j = j || 1;
    }
  }

  const buffer = ctx.createBuffer(1, b.length, sampleRate);
  buffer.getChannelData(0).set(b);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  return b;
}

let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext)();
    } catch {
      return null;
    }
  }
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

let _muted = false;

export function isMuted(): boolean {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("funberry_muted");
    if (stored !== null) _muted = stored === "true";
  }
  return _muted;
}

export function setMuted(m: boolean): void {
  _muted = m;
  if (typeof window !== "undefined") {
    localStorage.setItem("funberry_muted", String(m));
  }
}

export function toggleMute(): boolean {
  setMuted(!_muted);
  return _muted;
}

// ─────────────────────────────────────────────
// GAME SOUND EFFECTS — soft, musical, kid-friendly
// Piano/flute/guitar tones: gentle attack, warm sustain
// ─────────────────────────────────────────────

/** 🎹 Piano-style tap — gentle warm pluck */
export function playTap() {
  zzfx(0.3, 0.02, 523, 0.01, 0.04, 0.18, 0, 1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.05);
}

/** 🎵 Three-note piano chime — correct answer */
export function playCorrect() {
  zzfx(0.35, 0, 330, 0.01, 0.06, 0.35, 0, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0.06);
  setTimeout(() => zzfx(0.3, 0, 415, 0.01, 0.06, 0.4, 0, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.65, 0.06), 130);
  setTimeout(() => zzfx(0.25, 0, 523, 0.01, 0.05, 0.5, 0, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.07), 260);
}

/** 🎺 Gentle descending tones — wrong answer, soft not scary */
export function playWrong() {
  zzfx(0.22, 0.01, 330, 0.02, 0.08, 0.3, 0, 0.9, -4, 0, 0, 0, 0, 0, 0, 0, 0, 0.4, 0.08);
  setTimeout(() => zzfx(0.18, 0.01, 262, 0.02, 0.06, 0.25, 0, 0.9, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0.35, 0.07), 150);
}

/** 🌟 Bright flute sparkle — star earned */
export function playStar(pitch = 0) {
  zzfx(0.3, 0, 784 + pitch * 196, 0.02, 0.06, 0.55, 0, 2.0, 0, 0, 400, 0.05, 0, 0, 0, 0, 0, 0.65, 0.06);
}

/**
 * 🎹 PIANO CELEBRATION FANFARE — game completion
 * Ascending C major arpeggio, warm piano sound.
 */
export function playComplete() {
  zzfx(0.4, 0, 262, 0.01, 0.07, 0.45, 0, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0.06);
  setTimeout(() => zzfx(0.38, 0, 330, 0.01, 0.07, 0.45, 0, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.78, 0.06), 140);
  setTimeout(() => zzfx(0.36, 0, 392, 0.01, 0.07, 0.45, 0, 1.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.76, 0.06), 280);
  setTimeout(() => zzfx(0.45, 0, 523, 0.01, 0.1, 0.65, 0, 1.9, 0, 0, 350, 0.05, 0, 0, 0, 0, 0, 0.85, 0.06), 440);
  setTimeout(() => zzfx(0.25, 0, 784, 0.02, 0.04, 0.5, 0, 2.2, 0, 0, 500, 0.06, 0, 0, 0, 0, 0, 0.6, 0.05), 700);
  setTimeout(() => zzfx(0.3, 0, 1047, 0.01, 0.04, 0.6, 0, 2.5, 0, 0, 800, 0.08, 0, 0, 0, 0, 0, 0.7, 0.05), 850);
}

/**
 * 🏆 GRAND PIANO VICTORY — perfect score / 3 stars
 */
export function playVictory() {
  zzfx(0.4, 0, 262, 0.01, 0.06, 0.4, 0, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0.06);
  setTimeout(() => zzfx(0.4, 0, 330, 0.01, 0.06, 0.4, 0, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0.06), 110);
  setTimeout(() => zzfx(0.4, 0, 392, 0.01, 0.06, 0.4, 0, 1.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0.06), 220);
  setTimeout(() => zzfx(0.5, 0, 523, 0.02, 0.12, 0.7, 0, 2.0, 0, 0, 380, 0.06, 0, 0, 0, 0, 0, 0.9, 0.06), 360);
  setTimeout(() => zzfx(0.38, 0, 659, 0.03, 0.08, 0.45, 0, 1.8, 0, 0, 180, 0.04, 0, 0, 0, 0, 0, 0.78, 0.05), 720);
  setTimeout(() => zzfx(0.38, 0, 784, 0.03, 0.08, 0.45, 0, 1.9, 0, 0, 260, 0.04, 0, 0, 0, 0, 0, 0.78, 0.05), 870);
  setTimeout(() => zzfx(0.5, 0, 1047, 0.03, 0.14, 0.9, 0, 2.2, 0, 0, 700, 0.09, 0, 0, 0, 0, 0, 0.9, 0.06), 1050);
  setTimeout(() => zzfx(0.28, 0, 1568, 0.01, 0.03, 0.55, 0, 2.8, 0, 0, 1100, 0.09, 0, 0, 0, 0, 0, 0.6, 0.05), 1450);
}

/** 🪗 Gentle card flip — soft whoosh */
export function playFlip() {
  zzfx(0.18, 0.06, 280, 0, 0.02, 0.12, 3, 0.4, 30, 0, 0, 0, 0, 0.8, 0, 0, 0, 0.28, 0.02);
}

/** 🎵 Warm piano two-note match sound */
export function playMatch() {
  zzfx(0.35, 0, 523, 0.01, 0.04, 0.3, 0, 1.8, 0, 0, 350, 0.03, 0, 0, 0, 0, 0, 0.65, 0.05);
  setTimeout(() => zzfx(0.3, 0, 659, 0.01, 0.04, 0.32, 0, 2.0, 0, 0, 280, 0.03, 0, 0, 0, 0, 0, 0.6, 0.05), 90);
}

/** 🎯 Soft plop — item drop into bucket */
export function playDrop() {
  zzfx(0.28, 0.02, 220, 0.02, 0.05, 0.18, 0, 0.6, -4, 0, 0, 0, 0, 0.15, 0, 0, 0, 0.38, 0.07);
}

/** 🎶 Rising musical notes — streak */
export function playStreak(count: number) {
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
  const note = notes[Math.min(count - 2, notes.length - 1)] ?? 1047;
  zzfx(0.32, 0, note, 0.01, 0.05, 0.3, 0, 1.8, 0, 0, 240, 0.03, 0, 0, 0, 0, 0, 0.62, 0.05);
}

/** 📖 Soft page turn for stories */
export function playPageTurn() {
  zzfx(0.14, 0.06, 120, 0, 0.04, 0.12, 3, 0.25, 24, 0, 0, 0, 0, 1.0, 0, 0, 0, 0.18, 0.02);
}

/** 🎨 Soft paint splash — color activity */
export function playPaint() {
  zzfx(0.26, 0.08, 330, 0.01, 0.06, 0.2, 0, 1.0, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0.38, 0.06);
}

/** ✨ Flute sparkle effect */
export function playSparkle() {
  zzfx(0.26, 0.04, 1320, 0.01, 0.02, 0.3, 0, 2.2, 0, 0, 600, 0.05, 0, 0, 0, 0, 0, 0.45, 0.04);
}

/** 🫧 Light bubble pop for BubblePop game */
export function playBubblePop() {
  zzfx(0.3, 0.01, 660, 0, 0.01, 0.1, 0, 1.4, -14, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.5, 0.02);
}

/** ⭐ Collect / catch item — bright piano notes */
export function playCollect() {
  zzfx(0.35, 0, 659, 0.01, 0.04, 0.28, 0, 1.8, 0, 0, 220, 0.04, 0, 0, 0, 0, 0, 0.68, 0.04);
  setTimeout(() => zzfx(0.28, 0, 880, 0.01, 0.03, 0.25, 0, 2.0, 0, 0, 180, 0.03, 0, 0, 0, 0, 0, 0.6, 0.04), 95);
}

/** 💨 Soft miss — gentle descend, not punishing */
export function playMiss() {
  zzfx(0.25, 0.04, 262, 0.02, 0.05, 0.22, 0, 0.7, -8, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.38, 0.07);
}

/** 🕹️ Bouncy jump — light piano bounce */
export function playJump() {
  zzfx(0.28, 0.02, 392, 0, 0.04, 0.22, 0, 1.1, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.04);
}

/** ⏰ Gentle tick — timer warning */
export function playTick() {
  zzfx(0.2, 0, 880, 0, 0.004, 0.04, 0, 1.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.38, 0.005);
}
