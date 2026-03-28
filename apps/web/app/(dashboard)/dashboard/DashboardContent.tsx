"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { zones } from "@funberry/config";
import { getCurrentUser, getChildren, getFamilyPlayStats, signOut, signIn, getParent, updateParentPin, updateParentPassword } from "@funberry/supabase";
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

function AccountSettings({ parent, userEmail, onPinUpdated }: { parent: Parent | null; userEmail: string | null; onPinUpdated: (pin: string) => void }) {
  const [showSettings, setShowSettings] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyPw, setVerifyPw] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pinMsg, setPinMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [savingPin, setSavingPin] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function handleVerifyPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!userEmail || !verifyPw) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      await signIn(userEmail, verifyPw);
      setVerified(true);
      setVerifyPw("");
    } catch {
      setVerifyError("Incorrect password. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handlePinUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPinMsg(null);
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinMsg({ text: "PIN must be exactly 4 digits", ok: false });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg({ text: "PINs do not match", ok: false });
      return;
    }
    setSavingPin(true);
    try {
      await updateParentPin(newPin);
      onPinUpdated(newPin);
      setPinMsg({ text: "PIN updated successfully!", ok: true });
      setNewPin("");
      setConfirmPin("");
    } catch (err) {
      setPinMsg({ text: err instanceof Error ? err.message : "Failed to update PIN", ok: false });
    } finally {
      setSavingPin(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 6) {
      setPwMsg({ text: "Password must be at least 6 characters", ok: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ text: "Passwords do not match", ok: false });
      return;
    }
    setSavingPw(true);
    try {
      await updateParentPassword(newPassword);
      setPwMsg({ text: "Password updated successfully!", ok: true });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMsg({ text: err instanceof Error ? err.message : "Failed to update password", ok: false });
    } finally {
      setSavingPw(false);
    }
  }

  if (!showSettings) {
    return (
      <div style={{ padding: "0 24px 16px", maxWidth: 800, margin: "0 auto" }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { playTap(); setShowSettings(true); setVerified(false); setVerifyPw(""); setVerifyError(null); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 24px",
            borderRadius: 20,
            border: "2px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: 24 }}>⚙️</span>
          <span style={{ fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#374151", fontSize: 16 }}>
            Account Settings
          </span>
          <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 14 }}>
            PIN: {parent?.pin ? "••••" : "Not set"} &nbsp;→
          </span>
        </motion.button>
      </div>
    );
  }

  if (!verified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: "0 24px 20px", maxWidth: 800, margin: "0 auto" }}
      >
        <div style={{
          background: "white", borderRadius: 24, padding: "24px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "2px solid #f3f4f6",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", margin: "0 0 8px" }}>
            Verify Your Identity
          </h3>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px", fontFamily: "Nunito, sans-serif", fontWeight: 600 }}>
            Enter your account password to access settings.
          </p>
          <form onSubmit={handleVerifyPassword} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <input
              type="password"
              value={verifyPw}
              onChange={(e) => { setVerifyPw(e.target.value); setVerifyError(null); }}
              placeholder="Enter your password"
              autoFocus
              style={{
                width: "100%", maxWidth: 280, padding: "12px 16px",
                borderRadius: 14, border: verifyError ? "2px solid #ef4444" : "2px solid #e5e7eb",
                fontSize: 15, outline: "none", textAlign: "center",
              }}
            />
            {verifyError && (
              <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", margin: 0 }}>{verifyError}</p>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                type="submit"
                disabled={verifying || !verifyPw}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="kid-glass-btn kid-glass-violet rounded-xl px-7 py-2.5 text-sm"
                style={{
                  cursor: verifying || !verifyPw ? "default" : "pointer",
                  opacity: verifying || !verifyPw ? 0.5 : 1,
                }}
              >
                {verifying ? "Verifying..." : "Verify"}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setShowSettings(false); setVerifyPw(""); setVerifyError(null); }}
                className="kid-glass-btn kid-glass-muted rounded-xl px-5 py-2.5 text-sm"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "0 24px 20px",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <div style={{
        background: "white",
        borderRadius: 24,
        padding: "24px 20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "2px solid #f3f4f6",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", margin: 0 }}>
            ⚙️ Account Settings
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowSettings(false); setVerified(false); }}
            className="kid-glass-btn kid-glass-muted rounded-xl px-4 py-2 text-xs sm:text-sm"
          >
            Close
          </motion.button>
        </div>

        {/* Update PIN */}
        <form onSubmit={handlePinUpdate} style={{ marginBottom: 28 }}>
          <h4 style={{ fontSize: 16, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#374151", margin: "0 0 4px" }}>
            🔒 Update Parent PIN
          </h4>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 12px" }}>
            This PIN is used to access the parent dashboard from the play area.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="New PIN"
              style={{
                width: 130,
                padding: "10px 14px",
                borderRadius: 14,
                border: "2px solid #e5e7eb",
                fontSize: 18,
                fontWeight: 800,
                textAlign: "center",
                letterSpacing: "0.3em",
                outline: "none",
              }}
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Confirm"
              style={{
                width: 130,
                padding: "10px 14px",
                borderRadius: 14,
                border: "2px solid #e5e7eb",
                fontSize: 18,
                fontWeight: 800,
                textAlign: "center",
                letterSpacing: "0.3em",
                outline: "none",
              }}
            />
            <motion.button
              type="submit"
              disabled={savingPin}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="kid-glass-btn kid-glass-violet rounded-xl px-5 py-2.5 text-sm"
              style={{
                cursor: savingPin ? "default" : "pointer",
                opacity: savingPin ? 0.6 : 1,
              }}
            >
              {savingPin ? "Saving..." : "Update PIN"}
            </motion.button>
          </div>
          {pinMsg && (
            <p style={{ fontSize: 13, fontWeight: 700, color: pinMsg.ok ? "#16a34a" : "#ef4444", margin: 0 }}>
              {pinMsg.text}
            </p>
          )}
        </form>

        <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 24px" }} />

        {/* Update Password */}
        <form onSubmit={handlePasswordUpdate}>
          <h4 style={{ fontSize: 16, fontWeight: 800, fontFamily: "Fredoka, sans-serif", color: "#374151", margin: "0 0 4px" }}>
            🔑 Update Password
          </h4>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 12px" }}>
            Change the password used to log into your account.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              minLength={6}
              style={{
                flex: 1,
                minWidth: 150,
                padding: "10px 14px",
                borderRadius: 14,
                border: "2px solid #e5e7eb",
                fontSize: 15,
                outline: "none",
              }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm"
              minLength={6}
              style={{
                flex: 1,
                minWidth: 150,
                padding: "10px 14px",
                borderRadius: 14,
                border: "2px solid #e5e7eb",
                fontSize: 15,
                outline: "none",
              }}
            />
            <motion.button
              type="submit"
              disabled={savingPw}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="kid-glass-btn kid-glass-sunshine rounded-xl px-5 py-2.5 text-sm"
              style={{
                cursor: savingPw ? "default" : "pointer",
                opacity: savingPw ? 0.6 : 1,
              }}
            >
              {savingPw ? "Saving..." : "Update Password"}
            </motion.button>
          </div>
          {pwMsg && (
            <p style={{ fontSize: 13, fontWeight: 700, color: pwMsg.ok ? "#16a34a" : "#ef4444", margin: 0 }}>
              {pwMsg.text}
            </p>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { setParentPin } = useTimer();
  const [parent, setParent] = useState<Parent | null>(null);
  const [children, setChildrenState] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [familyStats, setFamilyStats] = useState<{
    totalSessions: number;
    uniqueGamesTouched: number;
    lastActivityAt: string | null;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserEmail(user.email ?? null);
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

  useEffect(() => {
    if (loading || children.length === 0) {
      setFamilyStats(null);
      return;
    }
    let cancelled = false;
    getFamilyPlayStats()
      .then((s) => {
        if (!cancelled) setFamilyStats(s);
      })
      .catch(() => {
        if (!cancelled) setFamilyStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, children]);

  async function handleSignOut() {
    playTap();
    await signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-100 via-white to-berry-50/40">
        <motion.div
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          className="font-display text-2xl font-black sm:text-3xl funberry-wordmark"
        >
          FunBerryKids
        </motion.div>
      </main>
    );
  }

  const freeZones = zones.filter((z) => z.isFree);
  const tier = parent?.subscription_tier ?? "free";
  const familyStars = children.reduce((s, c) => s + (c.total_stars ?? 0), 0);

  function formatLastPlay(iso: string | null): string {
    if (!iso) return "—";
    const days = (Date.now() - new Date(iso).getTime()) / 86400000;
    if (days < 1) return "Today";
    if (days < 2) return "Yesterday";
    if (days < 7) return `${Math.floor(days)}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  return (
    <>
    <main className="min-h-screen bg-gradient-to-b from-sky-100/90 via-white to-purple-50/30">
      {/* Header — colorful wordmark, no logo asset */}
      <div className="kid-header-bar sticky top-0 z-20 px-3 sm:px-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span className="funberry-wordmark shrink-0 text-base sm:text-lg">FunBerryKids</span>
            {parent && (
              <p className="min-w-0 truncate text-[10px] font-semibold leading-tight text-gray-400 sm:text-xs">
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="kid-glass-btn kid-glass-muted shrink-0 rounded-kid px-2.5 py-1 text-[10px] font-bold sm:px-3 sm:text-xs"
          >
            Sign Out
          </motion.button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-4 sm:py-5">
        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            Grown-up HQ 🫐
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Kids chase stars and worlds; you get the behind-the-scenes scoop — syllabus, skills, and where to cheer (or nudge) next.
          </p>
        </motion.section>

        {/* At-a-glance stats for Grown-up HQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {(
            [
              {
                label: "Children",
                value: String(children.length || 0),
                icon: "👶",
                color: "#ec4899",
                glass: "kid-glass-stat--children",
              },
              {
                label: "Zones open",
                value: String(tier === "free" ? freeZones.length : zones.length),
                icon: "🗺️",
                color: "#10b981",
                glass: "kid-glass-stat--zones",
              },
              {
                label: "Play sessions",
                value: familyStats ? String(familyStats.totalSessions) : "…",
                icon: "📊",
                color: "#0284c7",
                glass: "",
              },
              {
                label: "Games explored",
                value: familyStats ? String(familyStats.uniqueGamesTouched) : "…",
                icon: "🎯",
                color: "#7c3aed",
                glass: "",
              },
              {
                label: "Last activity",
                value: formatLastPlay(familyStats?.lastActivityAt ?? null),
                icon: "⏱️",
                color: "#475569",
                glass: "",
              },
              {
                label: "Family ⭐",
                value: String(familyStars),
                icon: "⭐",
                color: "#d97706",
                glass: "kid-glass-stat--stars",
              },
            ] as const
          ).map((stat, i) => {
            const inner = (
              <>
                <motion.span
                  className="inline-block text-base sm:text-lg"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.2 }}
                >
                  {stat.icon}
                </motion.span>
                <p className="mt-0.5 truncate font-display text-sm font-bold leading-none sm:text-base" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[8px] font-bold uppercase leading-tight tracking-wide text-gray-500 sm:text-[9px]">
                  {stat.label}
                </p>
              </>
            );
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12 + i * 0.05 }}
                whileHover={{ scale: 1.02, y: -1 }}
                className={`kid-glass-stat ${stat.glass} rounded-xl px-2 py-2 text-center sm:rounded-kid sm:px-2.5 sm:py-2.5`.trim()}
              >
                {inner}
              </motion.div>
            );
          })}
          <motion.a
            href="/dashboard/progress"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.02, y: -1 }}
            className="kid-glass-stat kid-glass-violet col-span-2 flex flex-col items-center justify-center rounded-xl px-2 py-2.5 text-center sm:col-span-3 lg:col-span-2 sm:rounded-kid sm:py-3"
          >
            <span className="text-lg sm:text-xl" aria-hidden>
              🧠
            </span>
            <p className="mt-0.5 font-display text-xs font-black leading-tight text-violet-950 sm:text-sm">
              Growth &amp; smarts
            </p>
            <p className="text-[8px] font-bold uppercase leading-tight text-violet-800/80 sm:text-[9px]">
              Open the full report
            </p>
          </motion.a>
        </motion.section>

        {/* Timer Setup */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-3"
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
              className="mb-4"
            >
              <div
                className="kid-glass-panel relative rounded-kid p-3 sm:p-4"
                style={{
                  background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                  borderColor: "#a7f3d0",
                }}
              >
                <button
                  onClick={() => setShowTip(false)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <p className="font-display font-bold text-leaf-700">💡 Parent Tip</p>
                <p className="mt-1 text-sm leading-snug text-gray-600">
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
          className="mb-6"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-slate-800">
              Learner profiles
            </h3>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowAddChild(true)}
              className="kid-glass-btn kid-glass-violet flex items-center gap-2 rounded-2xl px-4 py-2 text-sm"
            >
              + Add Child
            </motion.button>
          </div>

          {children.length === 0 ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAddChild(true)}
              className="kid-glass-panel cursor-pointer rounded-kid p-6 text-center"
              style={{
                background: "linear-gradient(135deg, #fdf4ff, #ede9fe)",
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: "#c4b5fd",
              }}
            >
              <span className="text-4xl block mb-2">👶</span>
              <p className="font-display font-bold text-purple-700 text-base">Add your first child</p>
              <p className="text-xs text-gray-400 mt-1 font-bold">Pick a fun character for them!</p>
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
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setEditingChild(child)}
                      className="kid-glass-btn kid-glass-muted rounded-xl px-3 py-2 text-sm"
                    >
                      ✏️
                    </motion.button>
                    <motion.a
                      href="/play"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      className="kid-glass-btn kid-glass-sky rounded-xl px-4 py-2 text-sm"
                    >
                      🎮 Play
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Start practice (child-facing play) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 text-center"
        >
          <motion.a
            href="/play"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="kid-glass-btn kid-glass-sky inline-flex items-center gap-2 rounded-kid px-6 py-3 text-sm font-bold sm:px-8 sm:py-3.5 sm:text-base"
          >
            <span>🎮</span>
            Open play mode for your child
          </motion.a>
        </motion.section>

        {/* Grown-up HQ — growth & smarts report */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <motion.a
            href="/dashboard/progress"
            whileHover={{ scale: 1.01, x: 3 }}
            whileTap={{ scale: 0.99 }}
            className="kid-glass-panel flex items-center gap-4 rounded-kid border-l-4 border-l-violet-500 p-5 sm:p-6"
          >
            <span className="text-3xl" aria-hidden>
              📋
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-slate-800">Growth &amp; smarts report</p>
              <p className="text-sm text-slate-600">
                Subject strands (EVS themes), skill profile from game types, and plain-language next steps — sourced from play sessions.
              </p>
            </div>
            <span className="shrink-0 text-slate-400 text-xl">→</span>
          </motion.a>
        </motion.section>

        {/* Upgrade CTA — shown only for free users */}
        {tier === "free" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 0 0 rgba(167,139,250,0)", "0 0 0 8px rgba(167,139,250,0.2)", "0 0 0 0 rgba(167,139,250,0)"] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="kid-glass-panel rounded-kid p-6 text-center"
              style={{
                background: "linear-gradient(135deg, #fdf4ff, #ede9fe, #e0e7ff)",
                borderColor: "#c4b5fd",
              }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl mb-3"
              >
                🚀
              </motion.div>
              <h3 className="font-display text-xl font-bold text-purple-800 mb-2">
                Unlock All {zones.length} Worlds!
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                You&apos;re on the free plan — only {freeZones.length} zone{freeZones.length !== 1 ? "s" : ""} unlocked.
                Upgrade to give your child access to all learning adventures!
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {["🧠 All zones", "♾️ Endless games", "📊 Detailed reports", "🎯 Priority support"].map((f) => (
                  <span key={f} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#a78bfa20", color: "#7c3aed" }}>
                    {f}
                  </span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="kid-glass-btn kid-glass-violet rounded-kid px-8 py-3 text-base"
                onClick={() => alert("Upgrade coming soon! Contact us for early access pricing.")}
              >
                ✨ Upgrade — Unlock Everything
              </motion.button>
            </motion.div>
          </motion.section>
        )}
      </div>
    </main>

    {/* Account Settings Section */}
    <AccountSettings parent={parent} userEmail={userEmail} onPinUpdated={(newPin) => {
      setParentPin(newPin);
      setParent(parent ? { ...parent, pin: newPin } : null);
    }} />

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

    {/* Edit Child Modal */}
    {editingChild && (
      <AddChildModal
        editChild={editingChild}
        onClose={() => setEditingChild(null)}
        onAdded={async () => {
          const kids = await getChildren();
          setChildrenState(kids);
        }}
      />
    )}
  </>
  );
}
