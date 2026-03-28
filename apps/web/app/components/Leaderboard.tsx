"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLeaderboard } from "@funberry/supabase";
import type { LeaderboardEntry } from "@funberry/supabase";

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#fbbf24", "#94a3b8", "#cd7f32"];
const RANK_BG = [
  "linear-gradient(135deg, #fef3c7, #fde68a)",
  "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
  "linear-gradient(135deg, #fef3c7, #fed7aa)",
];

interface LeaderboardProps {
  highlightChildId?: string;
  compact?: boolean;
  onClose?: () => void;
}

export function Leaderboard({ highlightChildId, compact = false, onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(compact ? 10 : 50);
      setEntries(data);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }, [compact]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ fontSize: 36, display: "inline-block" }}
        >
          🏆
        </motion.div>
        <p style={{ color: "#9ca3af", fontFamily: "Nunito, sans-serif", fontWeight: 700, marginTop: 12 }}>
          Loading stars...
        </p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
        <p style={{ color: "#6b7280", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 16 }}>
          No stars earned yet! Play games to get on the board.
        </p>
      </div>
    );
  }

  const maxStars = entries[0]?.total_stars ?? 1;

  return (
    <div>
      {/* Header */}
      {!compact && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ fontSize: 44, marginBottom: 4 }}
          >
            🏆
          </motion.div>
          <h2 style={{
            fontFamily: "Fredoka, sans-serif", fontSize: 24, fontWeight: 900,
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: 0,
          }}>
            Star Champions
          </h2>
          <p style={{ color: "#9ca3af", fontFamily: "Nunito, sans-serif", fontWeight: 600, fontSize: 13, margin: "4px 0 0" }}>
            Earn more stars to climb the ranks!
          </p>
        </div>
      )}

      {/* Podium for top 3 (non-compact) */}
      {!compact && entries.length >= 3 && (
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "flex-end",
          gap: 8, marginBottom: 20, padding: "0 12px",
        }}>
          {[1, 0, 2].map((podiumIdx) => {
            const e = entries[podiumIdx];
            if (!e) return null;
            const isFirst = podiumIdx === 0;
            const heights = [100, 130, 80];
            const isMe = e.child_id === highlightChildId;
            return (
              <motion.div
                key={e.child_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: podiumIdx * 0.15, duration: 0.4, ease: "easeOut" }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  flex: 1, maxWidth: 110,
                }}
              >
                <motion.div
                  animate={isFirst ? { scale: [1, 1.05, 1] } : {}}
                  transition={isFirst ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                  style={{
                    width: isFirst ? 56 : 48, height: isFirst ? 56 : 48,
                    borderRadius: "50%",
                    background: isMe
                      ? "linear-gradient(135deg, #818cf8, #6366f1)"
                      : "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isFirst ? 28 : 24,
                    border: `3px solid ${RANK_COLORS[podiumIdx]}`,
                    boxShadow: isFirst ? `0 4px 16px ${RANK_COLORS[0]}55` : "0 2px 8px rgba(0,0,0,0.08)",
                    marginBottom: 6,
                  }}
                >
                  {e.photo_url || "🧒"}
                </motion.div>
                <span style={{
                  fontSize: 12, fontWeight: 800, fontFamily: "Fredoka, sans-serif",
                  color: isMe ? "#4f46e5" : "#374151",
                  textAlign: "center", lineHeight: 1.2,
                  maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {e.child_name}
                </span>
                <div style={{
                  background: RANK_BG[podiumIdx],
                  borderRadius: "12px 12px 0 0",
                  width: "100%", height: heights[podiumIdx],
                  marginTop: 6,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "flex-start", paddingTop: 10,
                }}>
                  <span style={{ fontSize: 28 }}>{MEDALS[podiumIdx]}</span>
                  <span style={{
                    fontSize: 16, fontWeight: 900, fontFamily: "Fredoka, sans-serif",
                    color: "#92400e", marginTop: 2,
                  }}>
                    {e.total_stars}
                  </span>
                  <span style={{ fontSize: 10, color: "#a16207", fontWeight: 700 }}>stars</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 8 }}>
        {entries.map((e, i) => {
          if (!compact && i < 3) return null;
          const isMe = e.child_id === highlightChildId;
          const barPct = maxStars > 0 ? (e.total_stars / maxStars) * 100 : 0;

          return (
            <motion.div
              key={e.child_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (compact ? i : i - 3) * 0.04, duration: 0.25 }}
              style={{
                display: "flex", alignItems: "center", gap: compact ? 8 : 12,
                padding: compact ? "6px 10px" : "10px 14px",
                borderRadius: 16,
                background: isMe
                  ? "linear-gradient(135deg, #eef2ff, #e0e7ff)"
                  : i % 2 === 0 ? "#ffffff" : "#fafafa",
                border: isMe ? "2px solid #a5b4fc" : "1px solid #f3f4f6",
                boxShadow: isMe ? "0 2px 10px rgba(99,102,241,0.15)" : "none",
              }}
            >
              {/* Rank */}
              <div style={{
                width: compact ? 28 : 36, height: compact ? 28 : 36,
                borderRadius: "50%",
                background: i < 3 ? RANK_BG[i] : "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: compact ? 14 : 16, fontWeight: 900,
                fontFamily: "Fredoka, sans-serif",
                color: i < 3 ? "#92400e" : "#6b7280",
                flexShrink: 0,
              }}>
                {i < 3 ? MEDALS[i] : e.rank}
              </div>

              {/* Avatar */}
              <div style={{
                width: compact ? 30 : 38, height: compact ? 30 : 38,
                borderRadius: "50%",
                background: isMe ? "linear-gradient(135deg, #818cf8, #6366f1)" : "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: compact ? 16 : 20, flexShrink: 0,
                border: isMe ? "2px solid #6366f1" : "2px solid #e5e7eb",
              }}>
                {e.photo_url || "🧒"}
              </div>

              {/* Name + bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: compact ? 13 : 14, fontWeight: 800,
                    fontFamily: "Fredoka, sans-serif",
                    color: isMe ? "#4338ca" : "#1f2937",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {e.child_name}
                  </span>
                  {isMe && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: "#6366f1",
                      background: "#e0e7ff", borderRadius: 6, padding: "1px 6px",
                    }}>
                      YOU
                    </span>
                  )}
                </div>
                {!compact && (
                  <div style={{
                    height: 6, borderRadius: 3, background: "#f3f4f6",
                    marginTop: 4, overflow: "hidden",
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                      style={{
                        height: "100%", borderRadius: 3,
                        background: isMe
                          ? "linear-gradient(90deg, #818cf8, #6366f1)"
                          : "linear-gradient(90deg, #fbbf24, #f59e0b)",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Stars */}
              <div style={{
                display: "flex", alignItems: "center", gap: 3, flexShrink: 0,
              }}>
                <span style={{ fontSize: compact ? 14 : 16 }}>⭐</span>
                <span style={{
                  fontSize: compact ? 14 : 16, fontWeight: 900,
                  fontFamily: "Fredoka, sans-serif",
                  color: "#f59e0b",
                }}>
                  {e.total_stars}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {onClose && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className="kid-glass-btn kid-glass-violet rounded-kid px-8 py-2.5 text-sm"
          >
            Back to Games
          </motion.button>
        </div>
      )}
    </div>
  );
}

/** Modal wrapper for the leaderboard */
export function LeaderboardModal({
  open,
  onClose,
  highlightChildId,
}: {
  open: boolean;
  onClose: () => void;
  highlightChildId?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="kid-glass-panel"
            style={{
              borderRadius: 28, padding: "24px 20px",
              maxWidth: 460, width: "100%", maxHeight: "85vh",
              overflowY: "auto", background: "rgba(255,255,255,0.92)",
            }}
          >
            <Leaderboard highlightChildId={highlightChildId} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
