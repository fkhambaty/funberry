"use client";

import { useState, useEffect } from "react";
import { zones } from "@funberry/config";
import { getChildren, getChildProgress } from "@funberry/supabase";
import type { Child } from "@funberry/supabase";

export default function ProgressPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      const data = await getChildren();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChild(data[0].id);
        loadProgress(data[0].id);
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  }

  async function loadProgress(childId: string) {
    try {
      const data = await getChildProgress(childId);
      setProgressData(data);
    } catch (err) {
      console.error(err);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-bounce">🍓</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-6">
      <div className="mx-auto max-w-4xl">
        <a
          href="/dashboard"
          className="text-sky-600 font-bold mb-4 inline-block hover:underline"
        >
          ← Back to Dashboard
        </a>

        <h1 className="font-display text-3xl font-bold text-sky-900 mb-6">
          📊 Progress Report
        </h1>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="flex gap-3 mb-6">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => handleChildChange(child.id)}
                className={`px-4 py-2 rounded-kid font-bold text-sm transition ${
                  selectedChild === child.id
                    ? "bg-sky-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-sunshine-50 rounded-kid p-6 text-center border border-sunshine-200">
            <p className="text-3xl font-bold text-sunshine-700">⭐ {totalStars}</p>
            <p className="text-sm text-sunshine-600 font-semibold mt-1">
              Total Stars
            </p>
          </div>
          <div className="bg-leaf-50 rounded-kid p-6 text-center border border-leaf-200">
            <p className="text-3xl font-bold text-leaf-700">🎮 {gamesCompleted}</p>
            <p className="text-sm text-leaf-600 font-semibold mt-1">
              Games Played
            </p>
          </div>
          <div className="bg-berry-50 rounded-kid p-6 text-center border border-berry-200">
            <p className="text-3xl font-bold text-berry-700">
              🏆 {Math.floor(totalStars / 10)}
            </p>
            <p className="text-sm text-berry-600 font-semibold mt-1">
              Achievements
            </p>
          </div>
        </div>

        {/* Zone Progress */}
        <h2 className="font-display text-xl font-bold text-sky-900 mb-4">
          Zone Progress
        </h2>
        <div className="space-y-3">
          {zones.map((zone) => {
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
              (sum, p) => sum + ((p as { stars_earned?: number }).stars_earned ?? 0),
              0
            );

            return (
              <div
                key={zone.id}
                className="bg-white rounded-kid p-4 border border-gray-200 flex items-center gap-4"
              >
                <span className="text-3xl">{zone.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{zone.name}</p>
                  <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-sky-400 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (completed / 4) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-600">
                    ⭐ {starsInZone}
                  </p>
                  <p className="text-xs text-gray-400">
                    {completed} games
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
