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
// GAME SOUND EFFECTS — tuned for kids aged 4–8
// ─────────────────────────────────────────────

/** Bubble pop tap — soft and satisfying */
export function playTap() {
  zzfx(0.5, 0.05, 900, 0, 0.01, 0.06, 0, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.01);
}

/** Bright ding-ding-ding — correct answer */
export function playCorrect() {
  zzfx(0.6, 0, 523, 0, 0.05, 0.25, 0, 2, 0, 0, 300, 0.04, 0, 0, 0, 0, 0, 0.8, 0.03);
  setTimeout(() => zzfx(0.5, 0, 659, 0, 0.04, 0.22, 0, 2, 0, 0, 200, 0.03, 0, 0, 0, 0, 0, 0.7, 0.02), 100);
}

/** Gentle low tuba boop — wrong answer (not scary) */
export function playWrong() {
  zzfx(0.35, 0.03, 180, 0.02, 0.06, 0.25, 0, 0.8, -8, 0, 0, 0, 0, 0.4, 0, 0, 0, 0.5, 0.1);
}

/** Sparkly ping — for each star earned */
export function playStar(pitch = 0) {
  zzfx(0.55, 0, 880 + pitch * 220, 0, 0.04, 0.45, 0, 2.5, 0, 0, 500, 0.06, 0, 0, 0, 0, 0, 0.85, 0.02);
}

/**
 * 🎉 TRIUMPHANT FANFARE — game completion
 * Plays a full ascending musical sequence: C-E-G-C5-G5-C6
 * Sounds like a proper celebration jingle.
 */
export function playComplete() {
  // Ascending arpeggio: C4 E4 G4 C5
  zzfx(0.65, 0, 262, 0, 0.07, 0.4, 0, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0.03);
  setTimeout(() => zzfx(0.65, 0, 330, 0, 0.06, 0.38, 0, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0.02), 120);
  setTimeout(() => zzfx(0.65, 0, 392, 0, 0.06, 0.36, 0, 1.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0.02), 240);
  setTimeout(() => zzfx(0.8, 0, 523, 0, 0.1, 0.6, 0, 2.2, 0, 0, 400, 0.06, 0, 0, 0, 0, 0, 0.95, 0.04), 400);
  // Final high sparkle chord
  setTimeout(() => zzfx(0.5, 0, 784, 0, 0.04, 0.5, 0, 2.5, 0, 0, 600, 0.07, 0, 0, 0, 0, 0, 0.8, 0.02), 650);
  setTimeout(() => zzfx(0.6, 0, 1046, 0, 0.04, 0.7, 0, 3, 0, 0, 900, 0.09, 0, 0, 0, 0, 0, 0.9, 0.02), 800);
}

/**
 * 🏆 EPIC VICTORY FANFARE — perfect score / 3 stars
 * A full musical celebration sequence.
 */
export function playVictory() {
  // Fanfare pattern: C4-E4-G4-C5 then G5-E5-G5-C6
  zzfx(0.7, 0, 262, 0, 0.06, 0.35, 0, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0.02);
  setTimeout(() => zzfx(0.7, 0, 330, 0, 0.06, 0.35, 0, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0.02), 100);
  setTimeout(() => zzfx(0.7, 0, 392, 0, 0.06, 0.35, 0, 1.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0.02), 200);
  setTimeout(() => zzfx(0.9, 0, 523, 0, 0.12, 0.7, 0, 2.2, 0, 0, 400, 0.07, 0, 0, 0, 0, 0, 0.95, 0.04), 350);
  // Second phrase — triumphant resolution
  setTimeout(() => zzfx(0.7, 0, 659, 0, 0.06, 0.4, 0, 2, 0, 0, 200, 0.04, 0, 0, 0, 0, 0, 0.85, 0.02), 700);
  setTimeout(() => zzfx(0.7, 0, 784, 0, 0.06, 0.4, 0, 2, 0, 0, 300, 0.04, 0, 0, 0, 0, 0, 0.85, 0.02), 830);
  setTimeout(() => zzfx(0.95, 0, 1046, 0, 0.14, 1.0, 0, 2.5, 0, 0, 800, 0.1, 0, 0, 0, 0, 0, 0.95, 0.05), 1000);
  // Sparkle tail
  setTimeout(() => zzfx(0.45, 0, 1568, 0, 0.03, 0.6, 0, 3, 0, 0, 1200, 0.1, 0, 0, 0, 0, 0, 0.7, 0.02), 1400);
}

/** 🃏 Card flip whoosh */
export function playFlip() {
  zzfx(0.25, 0.1, 320, 0, 0.01, 0.1, 3, 0.5, 45, 0, 0, 0, 0, 1.2, 0, 0, 0, 0.35, 0.01);
}

/** 🔒 Satisfying click-lock on matched pair */
export function playMatch() {
  zzfx(0.5, 0, 1050, 0, 0.02, 0.18, 0, 2.2, 0, 0, 400, 0.03, 0, 0, 0, 0, 0, 0.7, 0.02);
  setTimeout(() => zzfx(0.4, 0, 1320, 0, 0.02, 0.15, 0, 2.5, 0, 0, 300, 0.02, 0, 0, 0, 0, 0, 0.6, 0.01), 80);
}

/** 🎯 Soft thud on item drop into bucket */
export function playDrop() {
  zzfx(0.4, 0.04, 140, 0.01, 0.04, 0.12, 0, 0.5, -6, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.45, 0.06);
}

/** 🔥 Escalating pitch for consecutive correct answers */
export function playStreak(count: number) {
  const freq = 440 + Math.min(count, 10) * 90;
  zzfx(0.5, 0, freq, 0, 0.04, 0.25, 0, 2.2, 0, 0, 280, 0.03, 0, 0, 0, 0, 0, 0.75, 0.02);
}

/** 📖 Page turn swoosh for stories */
export function playPageTurn() {
  zzfx(0.18, 0.1, 110, 0, 0.04, 0.14, 3, 0.3, 32, 0, 0, 0, 0, 1.6, 0, 0, 0, 0.22, 0.02);
}

/** 🎨 Paint splash for color activity */
export function playPaint() {
  zzfx(0.38, 0.18, 270, 0.01, 0.06, 0.18, 3, 1.1, 0, 0, 0, 0, 0, 2.2, 0, 0, 0, 0.45, 0.06);
}

/** ✨ Sparkle glitter effect */
export function playSparkle() {
  zzfx(0.38, 0.08, 1600, 0, 0.02, 0.25, 0, 2.5, 0, 0, 700, 0.06, 0, 0, 0, 0, 0.02, 0.55, 0.02);
}

/** 🫧 Bubble pop for BubblePop game */
export function playBubblePop() {
  zzfx(0.5, 0.02, 700, 0, 0.01, 0.12, 0, 1.5, -20, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.6, 0.02);
}

/** ⭐ Collect / catch item sound */
export function playCollect() {
  zzfx(0.55, 0, 660, 0, 0.03, 0.2, 0, 2, 0, 0, 250, 0.04, 0, 0, 0, 0, 0, 0.8, 0.02);
  setTimeout(() => zzfx(0.45, 0, 880, 0, 0.02, 0.18, 0, 2.5, 0, 0, 200, 0.03, 0, 0, 0, 0, 0, 0.7, 0.01), 90);
}

/** 💥 Wrong item / miss sound */
export function playMiss() {
  zzfx(0.4, 0.08, 200, 0.01, 0.04, 0.22, 0, 0.6, -12, 0, 0, 0, 0, 0.6, 0, 0, 0, 0.5, 0.08);
}

/** 🕹️ Jump sound for platform games */
export function playJump() {
  zzfx(0.4, 0.04, 300, 0, 0.05, 0.3, 0, 1.2, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.03);
}

/** ⏰ Tick for timer countdown warning */
export function playTick() {
  zzfx(0.3, 0, 1200, 0, 0.005, 0.04, 0, 1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.005);
}
