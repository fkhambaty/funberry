"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { zones, getZoneById } from "@funberry/config";
import {
  getGamesForZone,
  getZoneTheme,
  PictureQuiz,
  DragSort,
  MemoryMatch,
  SequenceBuilder,
  SpotDifference,
  OddOneOut,
  TrueFalse,
  ColorActivity,
  WordPictureLink,
  InteractiveStory,
  BubblePopAdventure,
  StarCatcher,
  GameShell,
  playTap,
  RankProvider,
} from "@funberry/game-engine";
import type { GameConfig, GameResult } from "@funberry/game-engine";
import { getChildren, getChildBestProgress, saveProgress, verifyParentPin, getChildRank } from "@funberry/supabase";
import type { Child } from "@funberry/supabase";
import { LeaderboardModal } from "../../components/Leaderboard";
import { FunBerryLogo } from "../../components/FunBerryLogo";

type ViewMode = "who" | "zones" | "games" | "playing";

/** Kid-facing copy: web records each completed round to Supabase for stars + parent coaching reports. */
const KID_SAVED_PROGRESS_WHO =
  "Your stars save when you play. Grown-ups have their own screen to cheer you on!";
const KID_SAVED_PROGRESS_ZONES =
  "Finishing games saves your stars and scores for next time — parents see friendly summaries on their dashboard.";
const KID_SAVED_PROGRESS_GAMES =
  "Each game saves your stars and score when you finish a round — keep playing to level up!";
const KID_SAVED_PROGRESS_INGAME =
  "Finish a round to save your stars & score to your player profile.";

const GAME_ICONS: Record<string, string> = {
  picture_quiz: "❓",
  drag_sort: "🎯",
  memory_match: "🃏",
  sequence_builder: "📋",
  spot_difference: "🔍",
  odd_one_out: "🔍",
  true_false: "🤔",
  color_activity: "🎨",
  word_picture_link: "🔗",
  interactive_story: "📖",
  bubble_pop: "🫧",
  star_catcher: "⭐",
};

const GAME_LABELS: Record<string, string> = {
  picture_quiz: "Picture Quiz",
  drag_sort: "Drag & Sort",
  memory_match: "Memory Match",
  sequence_builder: "Order It",
  spot_difference: "Spot Difference",
  odd_one_out: "Odd One Out",
  true_false: "True or False",
  color_activity: "Color Fun",
  word_picture_link: "Word Match",
  interactive_story: "Story Time",
  bubble_pop: "🫧 ADVENTURE",
  star_catcher: "⭐ ADVENTURE",
};

function ChildCard({ child, onSelect }: { child: Child; onSelect: () => void }) {
  const photoUrl = child.photo_url;
  const isImage = photoUrl?.startsWith("data:") || photoUrl?.startsWith("http");

  return (
    <motion.button
      whileHover={{ scale: 1.06, y: -6 }}
      whileTap={{ scale: 0.94 }}
      onClick={onSelect}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "24px 20px",
        borderRadius: 28,
        border: "3px solid rgba(255,255,255,0.6)",
        background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
        cursor: "pointer",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        minWidth: 130,
      }}
    >
      {/* Avatar */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid #a78bfa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isImage ? "transparent" : "linear-gradient(135deg, #fdf4ff, #ede9fe)",
          fontSize: 42,
          boxShadow: "0 4px 16px rgba(167,139,250,0.4)",
        }}
      >
        {isImage
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={photoUrl!} alt={child.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : (photoUrl || "🧒")}
      </motion.div>
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontSize: 18,
          fontWeight: 900,
          fontFamily: "Fredoka, sans-serif",
          color: "#1c498c",
          margin: "0 0 2px",
        }}>
          {child.name}
        </p>
        <p style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#9ca3af",
          fontFamily: "Nunito, sans-serif",
          margin: 0,
        }}>
          Age {child.age} • ⭐ {child.total_stars ?? 0}
        </p>
      </div>
    </motion.button>
  );
}

function PinGateModal({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRefs = [
    useCallback((el: HTMLInputElement | null) => { if (el) el.focus(); }, []),
    useCallback(() => {}, []),
    useCallback(() => {}, []),
    useCallback(() => {}, []),
  ];

  async function checkPin(allDigits: string[]) {
    const pin = allDigits.join("");
    if (pin.length !== 4) return;
    setChecking(true);
    try {
      const valid = await verifyParentPin(pin);
      if (valid) {
        onSuccess();
      } else {
        setError(true);
        setDigits(["", "", "", ""]);
        setTimeout(() => {
          const firstInput = document.querySelector<HTMLInputElement>("[data-pin-idx='0']");
          firstInput?.focus();
        }, 100);
      }
    } catch {
      setError(true);
      setDigits(["", "", "", ""]);
    } finally {
      setChecking(false);
    }
  }

  function handleDigitChange(idx: number, value: string) {
    const d = value.replace(/\D/g, "").slice(-1);
    setError(false);
    const next = [...digits];
    next[idx] = d;
    setDigits(next);

    if (d && idx < 3) {
      const nextInput = document.querySelector<HTMLInputElement>(`[data-pin-idx='${idx + 1}']`);
      nextInput?.focus();
    }
    if (d && idx === 3) {
      checkPin(next);
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      const prevInput = document.querySelector<HTMLInputElement>(`[data-pin-idx='${idx - 1}']`);
      prevInput?.focus();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="kid-glass-panel"
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 28,
          padding: "32px 28px",
          maxWidth: 360,
          width: "90%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
        <h3 style={{
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "Fredoka, sans-serif",
          color: "#1c498c",
          margin: "0 0 4px",
        }}>
          Enter Parent PIN
        </h3>
        <p style={{
          fontSize: 14,
          color: "#6b7280",
          fontFamily: "Nunito, sans-serif",
          fontWeight: 600,
          margin: "0 0 24px",
        }}>
          Enter your 4-digit PIN to access the parent dashboard.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={i === 0 ? inputRefs[0] : undefined}
              data-pin-idx={i}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={checking}
              style={{
                width: 56,
                height: 64,
                textAlign: "center",
                fontSize: 28,
                fontWeight: 900,
                fontFamily: "Fredoka, sans-serif",
                borderRadius: 16,
                border: `3px solid ${error ? "#f43f5e" : d ? "#6366f1" : "#e5e7eb"}`,
                background: error ? "#fff1f2" : "#f9fafb",
                outline: "none",
                transition: "border-color 0.2s, background 0.2s",
                caretColor: "#6366f1",
              }}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 14, color: "#ef4444", fontWeight: 700, margin: "0 0 12px" }}
          >
            Wrong PIN — try again
          </motion.p>
        )}

        {checking && (
          <p style={{ fontSize: 14, color: "#6366f1", fontWeight: 700, margin: "0 0 12px" }}>
            Verifying...
          </p>
        )}

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="kid-glass-btn kid-glass-muted mt-2 rounded-kid px-8 py-3 text-sm"
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function PlayContent() {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("who");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [completedGames, setCompletedGames] = useState<Record<string, number>>({});
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [childRank, setChildRank] = useState<{ rank: number; total: number } | null>(null);

  // Load children on mount
  useEffect(() => {
    getChildren()
      .then((kids) => {
        setChildren(kids);
        // If exactly one child, auto-select them
        if (kids.length === 1) {
          setSelectedChild(kids[0]);
          setView("zones");
        }
      })
      .catch(() => {});
  }, []);

  // Load DB progress when a child is selected
  const loadProgress = useCallback(async (childId: string) => {
    setLoadingProgress(true);
    try {
      const best = await getChildBestProgress(childId);
      setCompletedGames(best);
    } catch {
      setCompletedGames({});
    } finally {
      setLoadingProgress(false);
    }
  }, []);

  const zoneGames = useMemo(
    () => (selectedZone ? getGamesForZone(selectedZone) : []),
    [selectedZone]
  );

  const theme = useMemo(
    () => getZoneTheme(selectedZone ?? ""),
    [selectedZone]
  );

  function handleSelectChild(child: Child) {
    playTap();
    setSelectedChild(child);
    loadProgress(child.id);
    setView("zones");
  }

  function handleZoneClick(zoneId: string) {
    playTap();
    setSelectedZone(zoneId);
    setView("games");
  }

  function handleGameClick(game: GameConfig) {
    playTap();
    setSelectedGame(game);
    setView("playing");
  }

  /**
   * Every game template calls this when a round ends. We persist to `progress` (stars, score, time, attempts)
   * so parent dashboards and coaching reports stay in sync. Mobile app placeholder does not call this yet.
   */
  async function handleGameComplete(result: GameResult) {
    if (selectedGame) {
      setCompletedGames((prev) => ({
        ...prev,
        [selectedGame.id]: Math.max(prev[selectedGame.id] ?? 0, result.starsEarned),
      }));

      if (selectedChild) {
        try {
          await saveProgress(
            selectedChild.id,
            selectedGame.id,
            result.starsEarned,
            result.score,
            result.timeSpent,
          );
          const updatedKids = await getChildren();
          setChildren(updatedKids);
          const refreshed = updatedKids.find((c) => c.id === selectedChild.id);
          if (refreshed) setSelectedChild(refreshed);

          const rank = await getChildRank(selectedChild.id);
          setChildRank(rank);
        } catch {
          // Non-fatal
        }
      }
    }
  }

  function handleNextGame() {
    playTap();
    setView("games");
    setSelectedGame(null);
  }

  function renderGame() {
    if (!selectedGame) return null;
    const { data } = selectedGame;
    const accent = theme.accentColor;

    switch (data.type) {
      case "picture_quiz":
        return <PictureQuiz data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "drag_sort":
        return <DragSort data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "memory_match":
        return <MemoryMatch data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "sequence_builder":
        return <SequenceBuilder data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "spot_difference":
        return <SpotDifference data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "odd_one_out":
        return <OddOneOut data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "true_false":
        return <TrueFalse data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "color_activity":
        return <ColorActivity data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "word_picture_link":
        return <WordPictureLink data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "interactive_story":
        return <InteractiveStory data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "bubble_pop":
        return <BubblePopAdventure data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      case "star_catcher":
        return <StarCatcher data={data} onComplete={handleGameComplete} accentColor={accent} onNextGame={handleNextGame} />;
      default:
        return (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🚧</p>
            <p style={{ color: "#6b7280", fontWeight: 600 }}>This game type is coming soon!</p>
          </div>
        );
    }
  }

  /* ── Who's Playing? ── */
  if (view === "who") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white p-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.06, x: -3 }}
              className="kid-glass-btn kid-glass-berry flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm"
            >
              🏠 Dashboard
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => { playTap(); setShowLeaderboard(true); }}
              className="kid-glass-btn kid-glass-sunshine flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm"
            >
              🏆 Star Champions
            </motion.button>
          </div>

          <LeaderboardModal
            open={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
            highlightChildId={selectedChild?.id}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="text-6xl mb-4"
            >
              🎮
            </motion.div>
            <h1 className="font-display text-4xl font-bold text-sky-900 mb-2">
              Who&apos;s Playing?
            </h1>
            <p className="text-gray-500 text-lg">
              Tap your name to start! ⬇️
            </p>
            {children.length > 0 && (
              <p className="mx-auto mt-3 max-w-md rounded-2xl bg-white/70 px-3 py-2 text-center text-xs font-semibold leading-snug text-sky-800/90 shadow-sm">
                {KID_SAVED_PROGRESS_WHO}
              </p>
            )}
          </motion.div>

          {children.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center rounded-kid p-10 glass-card"
            >
              <p className="text-5xl mb-4">👶</p>
              <p className="font-display font-bold text-gray-700 text-xl mb-2">No children added yet!</p>
              <p className="text-gray-500 text-sm mb-6">Add a child profile from the dashboard first.</p>
              <motion.a
                href="/dashboard"
                whileHover={{ scale: 1.05 }}
                className="kid-glass-btn kid-glass-violet inline-block rounded-2xl px-8 py-3"
              >
                Go to Dashboard
              </motion.a>
            </motion.div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {children.map((child, i) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 250, damping: 18 }}
                >
                  <ChildCard child={child} onSelect={() => handleSelectChild(child)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  /* ── Zone Selection ── */
  if (view === "zones") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50 px-4 py-4 sm:px-5 sm:py-5">
        {/* Parent Gate Modal */}
        <AnimatePresence>
          {showParentGate && (
            <PinGateModal
              onSuccess={() => { setShowParentGate(false); router.push("/dashboard"); }}
              onCancel={() => setShowParentGate(false)}
            />
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex min-w-0 items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.06, x: -3 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { playTap(); setView("who"); }}
                className="kid-glass-btn kid-glass-berry flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm"
              >
                🏠 Switch
              </motion.button>
              {selectedChild && (
                <div
                  className="flex min-w-0 max-w-[40vw] items-center gap-1.5 truncate rounded-xl px-2.5 py-1.5 text-xs font-bold sm:max-w-none sm:gap-2 sm:px-3 sm:text-sm"
                  style={{ background: "rgba(255,255,255,0.85)", color: "#6b7280" }}
                >
                  <span className="shrink-0 text-base sm:text-lg">{selectedChild.photo_url || "🧒"}</span>
                  <span className="truncate">{selectedChild.name}</span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { playTap(); setShowLeaderboard(true); }}
                className="kid-glass-btn kid-glass-sunshine flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm font-black tabular-nums"
                title="Your stars — tap for Star Champions"
                type="button"
                aria-label={`You have ${selectedChild?.total_stars ?? 0} stars. Open Star Champions.`}
              >
                <span className="text-base leading-none" aria-hidden>⭐</span>
                {selectedChild?.total_stars ?? 0}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { playTap(); setShowParentGate(true); }}
                className="kid-glass-btn kid-glass-violet flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold sm:text-sm"
                type="button"
              >
                🔒 Parent
              </motion.button>
            </div>
          </div>

          {/* Leaderboard Modal */}
          <LeaderboardModal
            open={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
            highlightChildId={selectedChild?.id}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="mb-1 text-5xl sm:text-6xl"
            >
              🗺️
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-sky-900 sm:text-4xl">
              {selectedChild ? `${selectedChild.name}'s World!` : "Choose a Zone!"}
            </h1>
            <p className="mt-1 text-base text-gray-500">Pick a world and go! 🚀</p>
          </motion.div>

          {loadingProgress ? (
            <div className="text-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="inline-block rounded-full p-3 kid-glass-btn border-0"><FunBerryLogo size="md" /></motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {zones.map((zone, i) => {
                const zt = getZoneTheme(zone.id);
                const zoneGamesData = getGamesForZone(zone.id);
                const zoneBestStars = zoneGamesData.reduce((sum, g) => sum + (completedGames[g.id] ?? 0), 0);
                const zoneMaxStars = zoneGamesData.length * 3;
                return (
                  <motion.button
                    key={zone.id}
                    initial={{ opacity: 0, y: 25, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 18 }}
                    whileHover={{ scale: 1.08, y: -6 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleZoneClick(zone.id)}
                    className="kid-glass-panel rounded-kid p-4 text-center transition-shadow sm:p-5"
                    style={{
                      background: zt.bgGradient,
                      borderWidth: 3,
                      borderStyle: "solid",
                      borderColor: zone.isFree ? "#a7f3d0" : "rgba(0,0,0,0.06)",
                    }}
                  >
                    <motion.span
                      className="text-4xl block mb-2"
                      animate={{ rotate: [0, -6, 0], scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 3.5, delay: i * 0.25, ease: "easeInOut" }}
                    >
                      {zone.emoji}
                    </motion.span>
                    <span className="font-display font-bold text-sm text-gray-800 block leading-tight">
                      {zone.name}
                    </span>
                    {zone.isFree && (
                      <span className="text-[10px] font-bold text-leaf-700 bg-leaf-100 px-2 py-0.5 rounded-full mt-1 inline-block">FREE</span>
                    )}
                    {zoneBestStars > 0 && (
                      <p className="text-[10px] font-bold text-amber-600 mt-1">
                        ⭐ {zoneBestStars}/{zoneMaxStars}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
          <p className="mx-auto mt-4 max-w-lg px-2 text-center text-[10px] font-semibold leading-snug text-slate-500 sm:text-xs">
            {KID_SAVED_PROGRESS_ZONES}
          </p>
        </div>
      </main>
    );
  }

  /* ── Game List ── */
  if (view === "games" && selectedZone) {
    const zone = getZoneById(selectedZone);
    const adventureGames = zoneGames.filter((g) => g.type === "bubble_pop" || g.type === "star_catcher");
    const classicGames = zoneGames.filter((g) => g.type !== "bubble_pop" && g.type !== "star_catcher");

    return (
      <main className="min-h-screen px-4 py-4 sm:px-5 sm:py-5" style={{ background: theme.bgGradient }}>
        {/* Parent Gate Modal */}
        <AnimatePresence>
          {showParentGate && (
            <PinGateModal
              onSuccess={() => { setShowParentGate(false); router.push("/dashboard"); }}
              onCancel={() => setShowParentGate(false)}
            />
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-2xl">
          {/* Back navigation */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.06, x: -3 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { playTap(); setView("zones"); setSelectedZone(null); }}
                className="kid-glass-btn kid-glass-berry flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm"
              >
                🗺️ Zones
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { playTap(); setView("who"); }}
                className="kid-glass-btn kid-glass-muted flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm"
              >
                👥 Switch
              </motion.button>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { playTap(); setShowLeaderboard(true); }}
                className="kid-glass-btn kid-glass-sunshine flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm font-black tabular-nums"
                title="Your stars — tap for Star Champions"
                type="button"
                aria-label={`You have ${selectedChild?.total_stars ?? 0} stars. Open Star Champions.`}
              >
                <span className="text-base leading-none" aria-hidden>⭐</span>
                {selectedChild?.total_stars ?? 0}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { playTap(); setShowParentGate(true); }}
                className="kid-glass-btn kid-glass-violet flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold sm:text-sm"
                type="button"
              >
                🔒 Parent
              </motion.button>
            </div>
          </div>

          {/* Leaderboard Modal */}
          <LeaderboardModal
            open={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
            highlightChildId={selectedChild?.id}
          />

          {/* Zone header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-5 rounded-kid p-4 text-center sm:p-6"
          >
            <motion.span
              className="mb-1 block text-5xl sm:text-6xl"
              animate={{ y: [0, -10, 0], rotate: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {zone?.emoji}
            </motion.span>
            <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: theme.accentColor }}>
              {zone?.name}
            </h2>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">{zone?.description}</p>
            <p className="mx-auto mt-2 max-w-md text-center text-[10px] font-semibold leading-snug text-slate-500 sm:text-xs">
              {KID_SAVED_PROGRESS_GAMES}
            </p>
          </motion.div>

          {/* Adventure Games */}
          {adventureGames.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">🕹️</span>
                <h3 className="font-display text-lg font-black" style={{
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  ADVENTURE GAMES
                </h3>
                <span className="text-xs font-bold text-white bg-purple-500 px-2 py-0.5 rounded-full">NEW!</span>
              </div>
              <div className="space-y-2">
                {adventureGames.map((game, i) => {
                  const stars = completedGames[game.id] ?? 0;
                  return (
                    <motion.button
                      key={game.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, type: "spring", stiffness: 200, damping: 18 }}
                      whileHover={{ scale: 1.03, x: 5 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleGameClick(game)}
                      className="kid-glass-panel flex w-full items-center gap-3 rounded-kid p-4 text-left sm:gap-4 sm:p-5"
                      style={{
                        background: "linear-gradient(135deg, #fdf4ff, #fae8ff)",
                        borderWidth: 3,
                        borderStyle: "solid",
                        borderColor: "#e9d5ff",
                      }}
                    >
                      <motion.span
                        className="text-4xl"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3, ease: "easeInOut" }}
                      >
                        {GAME_ICONS[game.type] ?? "🎮"}
                      </motion.span>
                      <div className="flex-1">
                        <p className="font-black text-purple-900 font-display text-base">{game.title}</p>
                        <p className="text-xs text-purple-400 mt-0.5 font-bold">{GAME_LABELS[game.type]}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <span key={s} className={`text-lg ${s <= stars ? "" : "grayscale opacity-20"}`}>⭐</span>
                          ))}
                        </div>
                        {stars === 0 && <span className="text-[10px] font-bold text-purple-400">PLAY!</span>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Classic Games */}
          {classicGames.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">🧩</span>
                <h3 className="font-display text-base font-bold" style={{ color: theme.accentColor }}>
                  Classic Games ({classicGames.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {classicGames.map((game, i) => {
                  const stars = completedGames[game.id] ?? 0;
                  return (
                    <motion.button
                      key={game.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 18 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGameClick(game)}
                      className="kid-glass-panel w-full flex items-center gap-4 rounded-kid p-4 text-left"
                      style={{ borderLeft: `4px solid ${theme.accentColor}` }}
                    >
                      <motion.span
                        className="text-3xl"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.18 }}
                      >
                        {GAME_ICONS[game.type] ?? "🎮"}
                      </motion.span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 font-display">{game.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{GAME_LABELS[game.type]}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <span key={s} className={`text-base ${s <= stars ? "" : "grayscale opacity-25"}`}>⭐</span>
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  /* ── Playing a Game ── */
  return (
    <RankProvider rankInfo={childRank}>
      <GameShell
        theme={theme}
        title={selectedGame?.title ?? ""}
        subtitle={selectedGame ? GAME_LABELS[selectedGame.type] : undefined}
        lifetimeStars={selectedChild ? (selectedChild.total_stars ?? 0) : undefined}
        progressSavesHint={KID_SAVED_PROGRESS_INGAME}
        onClose={() => { playTap(); setView("games"); setSelectedGame(null); }}
        onNextGame={handleNextGame}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGame?.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {renderGame()}
          </motion.div>
        </AnimatePresence>
      </GameShell>
    </RankProvider>
  );
}
