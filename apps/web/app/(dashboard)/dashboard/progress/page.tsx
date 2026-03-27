"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { zones } from "@funberry/config";
import { getChildren, getChildProgress } from "@funberry/supabase";
import { getGamesForZone } from "@funberry/game-engine";
import type { Child } from "@funberry/supabase";
import { useRouter } from "next/navigation";

export default function ProgressPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    loadChildren();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadChildren() {
    try {
      const data = await getChildren();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChild(data[0]!.id);
        await loadProgress(data[0]!.id);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function loadProgress(childId: string) {
    setProgressLoading(true);
    try {
      const data = await getChildProgress(childId);
      setProgressData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setProgressLoading(false);
    }
  }

  function handleChildChange(childId: string) {
    setSelectedChild(childId);
    loadProgress(childId);
  }

  const selectedChildData = children.find((c) => c.id === selectedChild);
  const totalStars = selectedChildData?.total_stars ?? 0;
  const gamesCompleted = progressData.filter(
    (p) => (p as { completed?: boolean }).completed
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="text-5xl"
        >
          🍓
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-6">
      <div className="mx-auto max-w-4xl">
        {/* Nav */}
        <div className="flex items-center gap-3 mb-6">
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-white text-sm shadow-md"
            style={{ background: "linear-gradient(135deg, #ff6b9d, #e0456d)" }}
          >
            🏠 Dashboard
          </motion.a>
          <motion.a
            href="/play"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-white text-sm shadow-md"
            style={{ background: "linear-gradient(135deg, #379df9, #2180ee)" }}
          >
            🎮 Play
          </motion.a>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-sky-900 mb-6"
        >
          📊 Progress Report
        </motion.h1>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {children.map((child) => (
              <motion.button
                key={child.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChildChange(child.id)}
                className={`px-5 py-2.5 rounded-kid font-bold text-sm transition ${
                  selectedChild === child.id
                    ? "bg-sky-500 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {child.photo_url && !child.photo_url.startsWith("data:") && !child.photo_url.startsWith("http")
                  ? `${child.photo_url} ` : "🧒 "}{child.name}
              </motion.button>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: "⭐", value: totalStars, label: "Total Stars", bg: "#fffbeb", border: "#fcd34d", color: "#92400e" },
            { icon: "🎮", value: gamesCompleted, label: "Games Played", bg: "#f0fdf4", border: "#86efac", color: "#166534" },
            { icon: "🏆", value: Math.floor(totalStars / 10), label: "Achievements", bg: "#fdf2f8", border: "#f0abfc", color: "#86198f" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="rounded-kid p-5 text-center"
              style={{ background: stat.bg, border: `2px solid ${stat.border}` }}
            >
              <motion.p
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3 }}
                className="text-3xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.icon} {stat.value}
              </motion.p>
              <p className="text-sm font-semibold mt-1" style={{ color: stat.color }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Zone Progress */}
        <h2 className="font-display text-xl font-bold text-sky-900 mb-4">Zone Progress</h2>

        {progressLoading ? (
          <div className="text-center py-8">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-4xl inline-block">🍓</motion.div>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone, i) => {
              const zoneGames = getGamesForZone(zone.id);
              const totalGamesInZone = zoneGames.length;
              const zoneProgress = progressData.filter(
                (p) => {
                  const g = (p as { games?: { zone_id?: string } }).games;
                  return g?.zone_id === zone.id;
                }
              );
              const completed = zoneProgress.filter(
                (p) => (p as { completed?: boolean }).completed
              ).length;
              const starsInZone = zoneProgress.reduce(
                (sum, p) => sum + ((p as { stars_earned?: number }).stars_earned ?? 0), 0
              );
              const pct = totalGamesInZone > 0 ? Math.min(100, (completed / totalGamesInZone) * 100) : 0;

              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-kid p-4 border border-gray-200 flex items-center gap-4"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <motion.span
                    className="text-3xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.2 }}
                  >
                    {zone.emoji}
                  </motion.span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{zone.name}</p>
                    <div className="mt-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                        className="h-2.5 rounded-full"
                        style={{ background: pct === 100 ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #60a5fa, #3b82f6)" }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{completed}/{totalGamesInZone} games</p>
                  </div>
                  <div className="text-right min-w-[48px]">
                    <p className="text-sm font-bold text-amber-600">⭐ {starsInZone}</p>
                    {pct === 100 && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-xs font-bold text-green-600"
                      >
                        ✅ Done!
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {progressData.length === 0 && !progressLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-kid"
            style={{ background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", border: "2px dashed #bae6fd" }}
          >
            <p className="text-5xl mb-3">🎮</p>
            <p className="font-display font-bold text-sky-800 text-lg">No games played yet!</p>
            <p className="text-gray-500 text-sm mt-1 mb-4">Start playing to see progress here</p>
            <motion.a
              href="/play"
              whileHover={{ scale: 1.05 }}
              className="inline-block px-8 py-3 rounded-kid text-white font-bold"
              style={{ background: "linear-gradient(135deg, #379df9, #2180ee)" }}
            >
              🚀 Start Playing!
            </motion.a>
          </motion.div>
        )}
      </div>
    </main>
  );
}
