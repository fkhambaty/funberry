"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { brand, zones } from "@funberry/config";
import { getCurrentUser, getChildren, signOut, signIn, getParent, updateParentPin, updateParentPassword } from "@funberry/supabase";
import type { Child, Parent } from "@funberry/supabase";
import { Leaderboard } from "../../components/Leaderboard";
import { getZoneTheme } from "@funberry/game-engine";
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
      <div style={{ padding: "0 24px 24px", maxWidth: 800, margin: "0 auto" }}>
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
        style={{ padding: "0 24px 32px", maxWidth: 800, margin: "0 auto" }}
      >
        <div style={{
          background: "white", borderRadius: 24, padding: "32px 24px",
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
                style={{
                  padding: "10px 28px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "white", fontSize: 14, fontWeight: 800,
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
                style={{
                  padding: "10px 20px", borderRadius: 14, border: "none",
                  background: "#f3f4f6", color: "#6b7280", fontSize: 14, fontWeight: 800, cursor: "pointer",
                }}
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
        padding: "0 24px 32px",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <div style={{
        background: "white",
        borderRadius: 24,
        padding: "28px 24px",
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
            style={{
              padding: "8px 16px",
              borderRadius: 14,
              border: "none",
              background: "#f3f4f6",
              color: "#6b7280",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
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
              style={{
                padding: "10px 20px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "white",
                fontSize: 14,
                fontWeight: 800,
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
              style={{
                padding: "10px 20px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "white",
                fontSize: 14,
                fontWeight: 800,
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
        >
          <Image src="/logo.png" alt="Loading" width={80} height={48} />
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
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Image src="/logo.png" alt="FunBerry Kids" width={48} height={28} />
            </motion.div>
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
                      className="px-3 py-2 rounded-xl text-sm font-bold"
                      style={{ background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)", color: "#6b7280" }}
                    >
                      ✏️
                    </motion.button>
                    <motion.a
                      href="/play"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #379df9, #2180ee)" }}
                    >
                      🎮 Play
                    </motion.a>
                  </div>
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

        {/* Family Leaderboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-10"
        >
          <div className="rounded-kid glass-card" style={{ padding: "24px 20px", border: "2px solid #fef3c7" }}>
            <Leaderboard compact />
          </div>
        </motion.section>

        {/* Upgrade CTA — shown only for free users */}
        {tier === "free" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 0 0 rgba(167,139,250,0)", "0 0 0 8px rgba(167,139,250,0.2)", "0 0 0 0 rgba(167,139,250,0)"] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="rounded-kid p-6 text-center"
              style={{
                background: "linear-gradient(135deg, #fdf4ff, #ede9fe, #e0e7ff)",
                border: "2px solid #c4b5fd",
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
                className="px-8 py-3 rounded-kid text-white font-bold text-base shadow-lg"
                style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", boxShadow: "0 8px 24px rgba(139,92,246,0.4)" }}
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
