"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { brand, zones } from "@funberry/config";
import { getCurrentUser, getChildren, signOut, getParent } from "@funberry/supabase";
import { getZoneTheme } from "@funberry/game-engine";
import type { Child, Parent } from "@funberry/supabase";
import { TimerSetup } from "../../components/TimerSetup";
import { useTimer } from "../../components/TimerProvider";
import { playTap } from "@funberry/game-engine";
import { AddChildModal } from "../../components/AddChildModal";

function ChildAvatar({ child }: { child: Child }) {
  // photo_url is stored in DB — can be a base64 data URL (selfie) or emoji (cartoon face)
  const photoUrl = child.photo_url;
  const isImage = photoUrl?.startsWith("data:") || photoUrl?.startsWith("http");

  return (
    <div style={{
      width: 52, height: 52, borderRadius: "50%",
      overflow: "hidden", border: "3px solid #a78bfa",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: isImage ? "transparent" : "#fdf4ff",
      fontSize: isImage ? undefined : 28,
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(167,139,250,0.3)",
    }}>
      {isImage
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={photoUrl!} alt={child.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (photoUrl || "🧒")}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { setParentPin } = useTimer();
  const [parent, setParent] = useState<Parent | null>(null);
  const [children, setChildrenState] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTip, setShowTip] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }
        const p = await getParent();
        if (p) {
          setParent(p);
          if (p.pin) setParentPin(p.pin);
        }
        const kids = await getChildren();
        setChildrenState(kids);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router, setParentPin]);

  async function handleSignOut() {
    playTap();
    await signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="text-5xl"
        >
          🍓
        </motion.div>
      </main>
    );
  }

  const freeZones = zones.filter((z) => z.isFree);
  const tier = parent?.subscription_tier ?? "free";
  const totalStars = children.reduce((sum, c) => sum + (c.total_stars ?? 0), 0);

  return (
    <>
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      {/* Header */}
      <div className="glass-card sticky top-0 z-20 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-3xl"
            >
              🍓
            </motion.span>
            <div>
              <h1 className="font-display text-xl font-bold text-sky-900">
                {brand.name}
              </h1>
              {parent && (
                <p className="text-xs text-gray-400">
                  {parent.name} &middot;{" "}
                  <span
                    className="font-bold uppercase"
                    style={{ color: tier === "free" ? "#6b7280" : "#10b981" }}
                  >
                    {tier === "lifetime" ? "Lifetime ✨" : tier}
                  </span>
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="rounded-kid bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
          >
            Sign Out
          </motion.button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="font-display text-3xl font-bold text-sky-900">
            Welcome back! 👋
          </h2>
          <p className="mt-2 text-gray-500">
            Ready for some learning fun today?
          </p>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 grid grid-cols-3 gap-4"
        >
          {[
            { label: "Total Stars", value: totalStars, icon: "⭐", color: "#fbbf24", bg: "#fffbeb" },
            { label: "Children", value: children.length || "0", icon: "👶", color: "#ec4899", bg: "#fdf2f8" },
            { label: "Zones Open", value: tier === "free" ? freeZones.length : zones.length, icon: "🗺️", color: "#10b981", bg: "#ecfdf5" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ scale: 1.04, y: -3 }}
              className="rounded-kid p-5 text-center"
              style={{ backgroundColor: stat.bg, border: `1px solid ${stat.color}20` }}
            >
              <motion.span
                className="text-3xl inline-block"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3 }}
              >
                {stat.icon}
              </motion.span>
              <p className="mt-2 font-display text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs font-bold text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Timer Setup */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <TimerSetup />
        </motion.section>

        {/* Quick Tip */}
        <AnimatePresence>
          {showTip && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="mb-10"
            >
              <div
                className="rounded-kid p-5 relative"
                style={{
                  background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                  border: "1px solid #a7f3d0",
                }}
              >
                <button
                  onClick={() => setShowTip(false)}
                  className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <p className="font-display font-bold text-leaf-700">💡 Parent Tip</p>
                <p className="text-sm text-gray-600 mt-1">
                  Set a play timer before handing the device to your child. The app will automatically
                  lock when time is up, and only your 4-digit PIN can unlock it.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Children profiles section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-sky-900">
              👶 Kid Profiles
            </h3>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowAddChild(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
              }}
            >
              + Add Child
            </motion.button>
          </div>

          {children.length === 0 ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAddChild(true)}
              className="rounded-kid p-6 text-center cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #fdf4ff, #ede9fe)",
                border: "2px dashed #c4b5fd",
              }}
            >
              <span className="text-4xl block mb-2">👶</span>
              <p className="font-display font-bold text-purple-700 text-base">Add your first child</p>
              <p className="text-xs text-gray-400 mt-1 font-bold">They can pick a selfie or cartoon face!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {children.map((child, i) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 rounded-kid p-4 glass-card"
                >
                  <ChildAvatar child={child} />
                  <div className="flex-1">
                    <p className="font-display font-bold text-gray-800">{child.name}</p>
                    <p className="text-xs text-gray-400 font-bold">Age {child.age} • ⭐ {child.total_stars ?? 0} stars</p>
                  </div>
                  <motion.a
                    href="/play"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #379df9, #2180ee)" }}
                  >
                    🎮 Play
                  </motion.a>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Play Button */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 text-center"
        >
          <motion.a
            href="/play"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 rounded-kid px-12 py-6 text-xl font-bold text-white shadow-kid-lg"
            style={{
              background: "linear-gradient(135deg, #379df9, #2180ee)",
              boxShadow: "0 10px 35px rgba(55,157,249,0.35)",
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🎮
            </motion.span>
            Start Playing
          </motion.a>
        </motion.section>

        {/* Quick Zone Access */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h3 className="font-display text-lg font-bold text-sky-900 mb-4">
            Quick Access — Free Zones
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {freeZones.map((zone, i) => {
              const zt = getZoneTheme(zone.id);
              return (
                <motion.a
                  key={zone.id}
                  href="/play"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                  whileHover={{ scale: 1.06, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-kid p-6 text-center"
                  style={{
                    background: zt.bgGradient,
                    border: "2px solid #a7f3d0",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <motion.span
                    className="text-4xl inline-block"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3 }}
                  >
                    {zone.emoji}
                  </motion.span>
                  <p className="mt-2 font-display font-bold text-sm text-gray-700">
                    {zone.name}
                  </p>
                  <span className="text-[10px] font-bold text-leaf-700 bg-leaf-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                    FREE
                  </span>
                </motion.a>
              );
            })}
          </div>
        </motion.section>

        {/* Progress & Reports Link */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <motion.a
            href="/dashboard/progress"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 rounded-kid p-6 glass-card"
            style={{ borderLeft: "4px solid #a855f7" }}
          >
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              📊
            </motion.span>
            <div>
              <p className="font-display font-bold text-gray-800">View Progress Reports</p>
              <p className="text-sm text-gray-500">See how your child is learning across all zones</p>
            </div>
            <span className="ml-auto text-gray-400 text-xl">→</span>
          </motion.a>
        </motion.section>
      </div>
    </main>

    {/* Add Child Modal */}
    {showAddChild && (
      <AddChildModal
        onClose={() => setShowAddChild(false)}
        onAdded={async () => {
          const kids = await getChildren();
          setChildrenState(kids);
        }}
      />
    )}
  </>
  );
}
