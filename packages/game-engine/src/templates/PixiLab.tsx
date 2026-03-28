"use client";

/**
 * PixiJS WebGL labs — higher interaction than DOM quizzes.
 * Modes align with syllabus photos: animals→products, word unscramble, air/wind glide, rocks hard/soft.
 *
 * Engagement hooks: streak combo, particle “juice”, short rounds, variable spawns (wind),
 * immediate audio + confetti from existing engine utilities.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Application, Container, FederatedPointerEvent, Graphics, Text } from "pixi.js";
import type { PixiLabData, GameResult } from "../types";
import { buildGameResult } from "../core/scoring";
import { playCorrect, playWrong, playCollect, playTap, playStreak } from "../core/sound";
import { fireMiniBurst } from "../core/confetti";
import { StarReveal } from "../components/StarReveal";

const W = 400;
const H = 520;

export interface PixiLabProps {
  data: PixiLabData;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
  onNextGame?: () => void;
}

type Phase = "boot" | "playing" | "done";

function burstParticles(app: Application, x: number, y: number, good: boolean) {
  const n = good ? 14 : 6;
  const color = good ? 0xfff59e : 0xf87171;
  for (let i = 0; i < n; i++) {
    const g = new Graphics();
    const size = 4 + Math.random() * 6;
    g.circle(0, 0, size).fill(color);
    g.x = x;
    g.y = y;
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const sp = 2 + Math.random() * 4;
    let life = 0;
    const tick = () => {
      life += 1;
      g.x += Math.cos(a) * sp;
      g.y += Math.sin(a) * sp - life * 0.08;
      g.alpha = 1 - life / 28;
      if (life > 28) {
        app.ticker.remove(tick);
        g.destroy();
      }
    };
    app.stage.addChild(g);
    app.ticker.add(tick);
  }
}

type DragMeta = { wrap: Container; correctBinId: string; dx: number; dy: number };

/** ── Animal → product drag lab ── */
function runAnimalProduct(
  app: Application,
  data: Extract<PixiLabData, { mode: "animal_product" }>,
  onScore: (score: number, max: number, done: boolean) => void,
  accent: number,
  getCombo: () => number,
  bumpCombo: (ok: boolean) => void
) {
  const maxScore = data.creatures.length * 100 + 150;
  let score = 0;
  let drag: DragMeta | null = null;

  const root = new Container();
  app.stage.addChild(root);

  const binRects: { id: string; x: number; y: number; w: number; h: number }[] = [];
  const binW = Math.min(92, (W - 24) / data.bins.length);
  const gap = (W - binW * data.bins.length) / (data.bins.length + 1);
  data.bins.forEach((b, i) => {
    const x = gap + i * (binW + gap);
    const y = H - 100;
    const g = new Graphics();
    g.roundRect(0, 0, binW, 72, 12).fill({ color: 0xffffff, alpha: 0.92 });
    g.stroke({ width: 3, color: accent });
    g.x = x;
    g.y = y;
    const label = new Text({
      text: `${b.emoji}\n${b.label}`,
      style: { fontSize: 11, fill: 0x1e3a5f, align: "center", fontWeight: "700" as const },
    });
    label.anchor.set(0.5, 0.5);
    label.x = x + binW / 2;
    label.y = y + 36;
    root.addChild(g, label);
    binRects.push({ id: b.id, x, y, w: binW, h: 72 });
  });

  const pending = [...data.creatures].sort(() => Math.random() - 0.5);
  const active: Container[] = [];

  function tryFinish() {
    if (pending.length === 0 && active.length === 0) {
      onScore(Math.min(maxScore, score + 150), maxScore, true);
    }
  }

  function spawnNext() {
    const c = pending.pop();
    if (!c) return;
    const wrap = new Container();
    const bg = new Graphics();
    bg.roundRect(-44, -28, 88, 56, 14).fill({ color: 0xffffff, alpha: 0.95 });
    bg.stroke({ width: 2, color: 0xc4b5fd });
    const em = new Text({
      text: `${c.emoji}\n${c.label}`,
      style: { fontSize: 13, fill: 0x1e3a5f, align: "center", fontWeight: "700" as const },
    });
    em.anchor.set(0.5, 0.5);
    wrap.addChild(bg, em);
    wrap.x = 60 + Math.random() * (W - 120);
    wrap.y = 80 + Math.random() * 120;
    wrap.eventMode = "static";
    wrap.cursor = "grab";

    wrap.on("pointerdown", (e: FederatedPointerEvent) => {
      const lp = e.getLocalPosition(root);
      drag = {
        wrap,
        correctBinId: c.correctBinId,
        dx: wrap.x - lp.x,
        dy: wrap.y - lp.y,
      };
      wrap.cursor = "grabbing";
    });

    root.addChild(wrap);
    active.push(wrap);
  }

  const onMove = (e: FederatedPointerEvent) => {
    if (!drag) return;
    const lp = e.getLocalPosition(root);
    drag.wrap.x = lp.x + drag.dx;
    drag.wrap.y = lp.y + drag.dy;
  };

  const onUp = () => {
    if (!drag) return;
    const { wrap, correctBinId } = drag;
    drag = null;
    wrap.cursor = "grab";
    const cx = wrap.x;
    const cy = wrap.y;
    let hit: string | null = null;
    for (const r of binRects) {
      if (cx >= r.x && cx <= r.x + r.w && cy >= r.y - 20 && cy <= r.y + r.h + 20) {
        hit = r.id;
        break;
      }
    }
    if (hit === correctBinId) {
      bumpCombo(true);
      const mult = 1 + Math.min(4, getCombo()) * 0.08;
      const pts = Math.round(100 * mult);
      score += pts;
      playCorrect();
      burstParticles(app, cx, cy, true);
      fireMiniBurst();
      if (getCombo() >= 3) playStreak(getCombo());
      wrap.destroy();
      const idx = active.indexOf(wrap);
      if (idx >= 0) active.splice(idx, 1);
      spawnNext();
      tryFinish();
    } else if (hit) {
      bumpCombo(false);
      playWrong();
      burstParticles(app, cx, cy, false);
      wrap.x = 60 + Math.random() * (W - 120);
      wrap.y = 80 + Math.random() * 120;
    }
  };

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointermove", onMove);
  app.stage.on("pointerup", onUp);
  app.stage.on("pointerupoutside", onUp);

  for (let i = 0; i < Math.min(3, pending.length); i++) spawnNext();

  return () => {
    app.stage.off("pointermove", onMove);
    app.stage.off("pointerup", onUp);
    app.stage.off("pointerupoutside", onUp);
    root.destroy({ children: true });
  };
}

/** ── Wind glide collector ── */
function runWindGlide(
  app: Application,
  data: Extract<PixiLabData, { mode: "wind_glide" }>,
  onScore: (score: number, max: number, done: boolean) => void
) {
  const maxScore = data.targetGood * 40 + 120;
  let score = 0;
  let goodC = 0;
  let badC = 0;
  const root = new Container();
  app.stage.addChild(root);

  const kite = new Container();
  const body = new Graphics();
  body.poly([0, -18, 16, 12, -16, 12]).fill(0xf472b6);
  body.stroke({ width: 2, color: 0xffffff });
  const tail = new Graphics();
  tail.moveTo(0, 12);
  tail.lineTo(0, 38).stroke({ width: 3, color: 0xf9a8d4 });
  kite.addChild(body, tail);
  kite.x = W / 2;
  kite.y = H / 2;
  kite.eventMode = "none";
  root.addChild(kite);

  let targetX = kite.x;
  let targetY = kite.y;
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointermove", (e: FederatedPointerEvent) => {
    const lp = e.getLocalPosition(root);
    targetX = Math.max(40, Math.min(W - 40, lp.x));
    targetY = Math.max(60, Math.min(H - 140, lp.y));
  });

  const wind = new Graphics();
  root.addChild(wind);

  type Token = { g: Graphics; good: boolean; vx: number; vy: number; life: number };
  const tokens: Token[] = [];
  let windAngle = 0;
  let elapsed = 0;
  const duration = data.durationSec;

  const endState = { done: false };
  const tick = () => {
    if (endState.done) return;
    elapsed += app.ticker.deltaMS / 1000;
    windAngle += 0.04;
    wind.clear();
    wind.moveTo(W / 2, 30);
    wind.lineTo(W / 2 + Math.cos(windAngle) * 50, 30 + Math.sin(windAngle) * 16).stroke({ width: 4, color: 0x7dd3fc });

    kite.x += (targetX - kite.x) * 0.12 + Math.cos(windAngle) * 1.2;
    kite.y += (targetY - kite.y) * 0.12;

    if (Math.random() < 0.045) {
      const good = Math.random() > 0.35;
      const g = new Graphics();
      g.circle(0, 0, good ? 10 : 12).fill(good ? 0x4ade80 : 0x64748b);
      g.x = Math.random() * (W - 40) + 20;
      g.y = -20;
      const vx = Math.cos(windAngle) * 1.5 + (Math.random() - 0.5) * 0.8;
      const vy = 1.2 + Math.random() * 1.2;
      root.addChild(g);
      tokens.push({ g, good, vx, vy, life: 0 });
    }

    for (let i = tokens.length - 1; i >= 0; i--) {
      const t = tokens[i];
      t.life += app.ticker.deltaMS;
      t.g.x += t.vx;
      t.g.y += t.vy;
      const dx = t.g.x - kite.x;
      const dy = t.g.y - kite.y;
      if (dx * dx + dy * dy < 38 * 38) {
        if (t.good) {
          goodC += 1;
          score += 40;
          playCollect();
          burstParticles(app, t.g.x, t.g.y, true);
          fireMiniBurst();
        } else {
          badC += 1;
          score = Math.max(0, score - 25);
          playWrong();
          burstParticles(app, t.g.x, t.g.y, false);
        }
        t.g.destroy();
        tokens.splice(i, 1);
        continue;
      }
      if (t.g.y > H + 30) {
        t.g.destroy();
        tokens.splice(i, 1);
      }
    }

    if (elapsed >= duration) {
      endState.done = true;
      app.ticker.remove(tick);
      const bonus = goodC >= data.targetGood ? 120 : Math.round((goodC / Math.max(1, data.targetGood)) * 80);
      onScore(Math.min(maxScore, score + bonus), maxScore, true);
    }
  };
  app.ticker.add(tick);

  return () => {
    endState.done = true;
    app.ticker.remove(tick);
    root.destroy({ children: true });
  };
}

function shufflePairs<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** ── Word Smart: drag letters into slots (textbook unscramble) ── */
function runWordUnscramble(
  app: Application,
  data: Extract<PixiLabData, { mode: "word_unscramble" }>,
  onScore: (score: number, max: number, done: boolean) => void,
  accent: number,
  getCombo: () => number,
  bumpCombo: (ok: boolean) => void
) {
  const maxScore = data.rounds.length * 100 + 100;
  let score = 0;
  let roundIdx = 0;
  const root = new Container();
  app.stage.addChild(root);

  type LT = {
    c: Container;
    ch: string;
    homeX: number;
    homeY: number;
    slotIndex: number | null;
  };
  type Slot = { cx: number; cy: number; tile: LT | null };
  let slots: Slot[] = [];
  let tiles: LT[] = [];
  let dragTile: LT | null = null;
  let dragDx = 0;
  let dragDy = 0;

  function dist(ax: number, ay: number, bx: number, by: number) {
    return Math.hypot(ax - bx, ay - by);
  }

  function tryCheckWord() {
    const r = data.rounds[roundIdx];
    if (!r) return;
    const word = r.word.toUpperCase().replace(/[^A-Z]/g, "");
    if (slots.some((s) => s.tile === null)) return;
    const built = slots.map((s) => s.tile!.ch).join("");
    if (built === word) {
      bumpCombo(true);
      const mult = 1 + Math.min(4, getCombo()) * 0.07;
      score += Math.round(100 * mult);
      playCorrect();
      burstParticles(app, W / 2, 300, true);
      fireMiniBurst();
      if (getCombo() >= 3) playStreak(getCombo());
      roundIdx += 1;
      if (roundIdx >= data.rounds.length) {
        onScore(Math.min(maxScore, score + 100), maxScore, true);
      } else {
        buildRound();
      }
    } else {
      bumpCombo(false);
      playWrong();
      burstParticles(app, W / 2, 300, false);
      for (const lt of tiles) {
        if (lt.slotIndex !== null) {
          const s = slots[lt.slotIndex];
          if (s) s.tile = null;
          lt.slotIndex = null;
        }
        lt.c.x = lt.homeX;
        lt.c.y = lt.homeY;
      }
    }
  }

  function buildRound() {
    root.removeChildren();
    slots = [];
    tiles = [];
    dragTile = null;

    const r = data.rounds[roundIdx];
    if (!r) {
      onScore(Math.min(maxScore, score + 80), maxScore, true);
      return;
    }
    const word = r.word.toUpperCase().replace(/[^A-Z]/g, "");
    const chars = word.split("");

    const header = new Text({
      text: `${r.emoji}  Spell the name`,
      style: { fontSize: 16, fill: 0xffffff, fontWeight: "800" as const, align: "center" },
    });
    header.anchor.set(0.5, 0);
    header.x = W / 2;
    header.y = 48;
    root.addChild(header);

    const slotW = 40;
    const slotH = 48;
    const gGap = 7;
    const rowW = chars.length * (slotW + gGap) - gGap;
    const sx0 = W / 2 - rowW / 2;
    const slotY = 308;
    slots = chars.map((_, i) => {
      const cx = sx0 + i * (slotW + gGap) + slotW / 2;
      const cy = slotY + slotH / 2;
      const g = new Graphics();
      g.roundRect(-slotW / 2, -slotH / 2, slotW, slotH, 10).fill({ color: 0xffffff, alpha: 0.2 });
      g.stroke({ width: 2, color: accent });
      g.x = cx;
      g.y = cy;
      root.addChild(g);
      return { cx, cy, tile: null as LT | null };
    });

    const bankY = 168;
    const pairs = chars.map((ch) => ({ ch }));
    const shuffled = shufflePairs(pairs);
    const step = Math.min(46, Math.floor((W - 40) / Math.max(1, shuffled.length)));
    const bankRowW = shuffled.length * step;
    const bx0 = W / 2 - bankRowW / 2 + step / 2;

    tiles = shuffled.map(({ ch }, j) => {
      const wrap = new Container();
      const bg = new Graphics();
      bg.roundRect(-22, -26, 44, 52, 12).fill({ color: 0xffffff, alpha: 0.95 });
      bg.stroke({ width: 2, color: 0xa78bfa });
      const t = new Text({
        text: ch,
        style: { fontSize: 26, fill: 0x1e3a5f, fontWeight: "900" as const },
      });
      t.anchor.set(0.5, 0.5);
      wrap.addChild(bg, t);
      const homeX = bx0 + j * step;
      const homeY = bankY;
      wrap.x = homeX;
      wrap.y = homeY;
      wrap.eventMode = "static";
      wrap.cursor = "grab";
      const lt: LT = { c: wrap, ch, homeX, homeY, slotIndex: null };

      wrap.on("pointerdown", (e: FederatedPointerEvent) => {
        e.stopPropagation();
        if (lt.slotIndex !== null) {
          const s = slots[lt.slotIndex];
          if (s) s.tile = null;
          lt.slotIndex = null;
        }
        const lp = e.getLocalPosition(root);
        dragTile = lt;
        dragDx = lt.c.x - lp.x;
        dragDy = lt.c.y - lp.y;
        lt.c.cursor = "grabbing";
      });
      root.addChild(wrap);
      return lt;
    });
  }

  const onMove = (e: FederatedPointerEvent) => {
    if (!dragTile) return;
    const lp = e.getLocalPosition(root);
    dragTile.c.x = lp.x + dragDx;
    dragTile.c.y = lp.y + dragDy;
  };

  const onUp = () => {
    if (!dragTile) return;
    const lt = dragTile;
    dragTile = null;
    lt.c.cursor = "grab";
    const cx = lt.c.x;
    const cy = lt.c.y;
    let bestSi = -1;
    let bestD = 9999;
    slots.forEach((s, si) => {
      const d = dist(cx, cy, s.cx, s.cy);
      if (d < 44 && d < bestD) {
        bestD = d;
        bestSi = si;
      }
    });
    if (bestSi >= 0) {
      const s = slots[bestSi]!;
      if (s.tile) {
        const old = s.tile;
        old.slotIndex = null;
        old.c.x = old.homeX;
        old.c.y = old.homeY;
      }
      s.tile = lt;
      lt.slotIndex = bestSi;
      lt.c.x = s.cx;
      lt.c.y = s.cy;
      playTap();
      tryCheckWord();
    } else {
      if (lt.slotIndex !== null) {
        const s = slots[lt.slotIndex];
        if (s) s.tile = null;
        lt.slotIndex = null;
      }
      lt.c.x = lt.homeX;
      lt.c.y = lt.homeY;
    }
  };

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointermove", onMove);
  app.stage.on("pointerup", onUp);
  app.stage.on("pointerupoutside", onUp);

  buildRound();

  return () => {
    app.stage.off("pointermove", onMove);
    app.stage.off("pointerup", onUp);
    app.stage.off("pointerupoutside", onUp);
    root.destroy({ children: true });
  };
}

/** ── Rock hard / soft tap ── */
function runRockTap(
  app: Application,
  data: Extract<PixiLabData, { mode: "rock_tap" }>,
  onScore: (score: number, max: number, done: boolean) => void,
  accent: number
) {
  const maxScore = data.rounds.length * 100;
  let score = 0;
  let idx = 0;
  const root = new Container();
  app.stage.addChild(root);

  const center = new Container();
  root.addChild(center);

  const btnH = new Graphics();
  btnH.roundRect(0, 0, 140, 64, 16).fill(0x34d399);
  const tH = new Text({ text: "Hard (H)", style: { fontSize: 18, fill: 0xffffff, fontWeight: "800" as const } });
  tH.anchor.set(0.5);
  tH.position.set(70, 32);
  const cH = new Container();
  cH.position.set(40, H - 120);
  cH.eventMode = "static";
  cH.cursor = "pointer";
  cH.addChild(btnH, tH);

  const btnS = new Graphics();
  btnS.roundRect(0, 0, 140, 64, 16).fill(0x60a5fa);
  const tS = new Text({ text: "Soft (S)", style: { fontSize: 18, fill: 0xffffff, fontWeight: "800" as const } });
  tS.anchor.set(0.5);
  tS.position.set(70, 32);
  const cS = new Container();
  cS.position.set(W - 180, H - 120);
  cS.eventMode = "static";
  cS.cursor = "pointer";
  cS.addChild(btnS, tS);

  root.addChild(cH, cS);

  function showRound() {
    center.removeChildren();
    const r = data.rounds[idx];
    if (!r) {
      onScore(Math.min(maxScore, score), maxScore, true);
      return;
    }
    const card = new Graphics();
    card.roundRect(-140, -70, 280, 140, 20).fill({ color: 0xffffff, alpha: 0.95 });
    card.stroke({ width: 3, color: accent });
    const em = new Text({
      text: `${r.emoji}\n${r.label}`,
      style: { fontSize: 22, fill: 0x1e3a5f, align: "center", fontWeight: "800" as const },
    });
    em.anchor.set(0.5);
    em.y = -8;
    center.addChild(card, em);
    center.x = W / 2;
    center.y = H / 2 - 40;
  }

  const answer = (choice: "H" | "S") => {
    const r = data.rounds[idx];
    if (!r) return;
    if (choice === r.answer) {
      score += 100;
      playCorrect();
      burstParticles(app, W / 2, H / 2 - 40, true);
      fireMiniBurst();
    } else {
      playWrong();
      burstParticles(app, W / 2, H / 2 - 40, false);
    }
    idx += 1;
    playTap();
    showRound();
  };

  cH.on("pointerdown", () => answer("H"));
  cS.on("pointerdown", () => answer("S"));

  showRound();

  return () => {
    root.destroy({ children: true });
  };
}

function parseAccentHex(hex: string): number {
  const h = hex.replace("#", "").trim();
  if (h.length === 6) return parseInt(h, 16) || 0x6366f1;
  if (h.length === 3)
    return parseInt(h[0] + h[0] + h[1] + h[1] + h[2] + h[2], 16) || 0x6366f1;
  return 0x6366f1;
}

export function PixiLab({ data, onComplete, accentColor = "#6366f1", onNextGame }: PixiLabProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  /** Dedupes onComplete (e.g. React Strict Mode) — value is last reported result key. */
  const reportedRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>("boot");
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const [hud, setHud] = useState({ score: 0, max: 100 });
  const [final, setFinal] = useState<GameResult | null>(null);
  const startTime = useRef<number>(0);
  const [labKey, setLabKey] = useState(0);

  const bumpCombo = useCallback((ok: boolean) => {
    if (ok) {
      comboRef.current += 1;
      setCombo(comboRef.current);
    } else {
      comboRef.current = 0;
      setCombo(0);
    }
  }, []);

  const getCombo = useCallback(() => comboRef.current, []);

  const onScoreUpdate = useCallback((score: number, max: number, done: boolean) => {
    setHud({ score, max });
    if (done) {
      const spent = Math.max(1, (Date.now() - startTime.current) / 1000);
      const result = buildGameResult(score, max, spent);
      setFinal(result);
      setPhase("done");
    }
  }, []);

  useEffect(() => {
    if (!final) return;
    const key = `${final.score}-${final.maxScore}-${final.starsEarned}-${final.timeSpent}`;
    if (reportedRef.current === key) return;
    reportedRef.current = key;
    onComplete(final);
  }, [final, onComplete]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let destroyed = false;
    const accentNum = parseAccentHex(accentColor);

    (async () => {
      const app = new Application();
      await app.init({
        width: W,
        height: H,
        backgroundAlpha: 0,
        antialias: true,
        resolution: typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1,
        autoDensity: true,
        preference: "webgl",
      });
      if (destroyed) {
        app.destroy(true);
        return;
      }
      appRef.current = app;
      host.appendChild(app.canvas);
      app.canvas.style.width = "100%";
      app.canvas.style.height = "auto";
      app.canvas.style.maxWidth = "420px";
      app.canvas.style.borderRadius = "16px";
      app.canvas.style.touchAction = "none";

      startTime.current = Date.now();
      setPhase("playing");

      if (data.mode === "animal_product") {
        cleanupRef.current = runAnimalProduct(app, data, onScoreUpdate, accentNum, getCombo, bumpCombo);
      } else if (data.mode === "wind_glide") {
        cleanupRef.current = runWindGlide(app, data, onScoreUpdate);
      } else if (data.mode === "word_unscramble") {
        cleanupRef.current = runWordUnscramble(app, data, onScoreUpdate, accentNum, getCombo, bumpCombo);
      } else {
        cleanupRef.current = runRockTap(app, data, onScoreUpdate, accentNum);
      }
    })();

    return () => {
      destroyed = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      appRef.current?.destroy(true);
      appRef.current = null;
    };
  }, [data, accentColor, onScoreUpdate, getCombo, bumpCombo, labKey]);

  const handlePlayAgain = useCallback(() => {
    playTap();
    reportedRef.current = null;
    setFinal(null);
    setPhase("boot");
    setHud({ score: 0, max: 100 });
    comboRef.current = 0;
    setCombo(0);
    setLabKey((k) => k + 1);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <p className="mb-2 text-center text-sm font-bold text-white/90 drop-shadow-md">{data.instruction}</p>
      <div ref={hostRef} className="relative flex min-h-[200px] justify-center rounded-2xl bg-white/10 p-1 shadow-inner ring-2 ring-white/30" />
      {phase === "playing" && combo >= 2 && (
        <div
          className="pointer-events-none absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-sm font-black text-amber-950 shadow-lg animate-pulse"
          key={combo}
        >
          🔥 {combo}x streak — bigger points!
        </div>
      )}
      <div className="mt-2 flex justify-between px-2 text-xs font-bold text-white/80">
        <span>Score {hud.score}</span>
        <span>Goal ~{hud.max}</span>
      </div>

      {phase === "done" && final && (
        <StarReveal
          starsEarned={final.starsEarned}
          score={final.score}
          maxScore={final.maxScore}
          accentColor={accentColor}
          onPlayAgain={handlePlayAgain}
          onNextGame={onNextGame}
        />
      )}
    </div>
  );
}
