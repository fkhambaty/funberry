"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimer } from "./TimerProvider";
import { useRouter } from "next/navigation";

type Phase = "pin" | "decision";

const TIME_PRESETS = [
  { minutes: 10, label: "10 min", emoji: "⏱️" },
  { minutes: 15, label: "15 min", emoji: "⏲️" },
  { minutes: 20, label: "20 min", emoji: "🕐" },
  { minutes: 30, label: "30 min", emoji: "🕑" },
];

export function LockScreen() {
  const { timer, verifyPin, extendTimer, endSession } = useTimer();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pin");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const isVisible = timer.isLocked || timer.awaitingDecision;

  if (!isVisible) return null;

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        const ok = verifyPin(next);
        if (ok) {
          setPhase("decision");
          setPin("");
          setError(false);
        } else {
          setError(true);
          setShake(true);
          setPin("");
          setTimeout(() => setShake(false), 500);
        }
      }, 150);
    }
  }

  function handleBackspace() {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }

  function handleExtend(minutes: number) {
    extendTimer(minutes);
    setPhase("pin");
    setPin("");
  }

  function handleStop() {
    endSession();
    setPhase("pin");
    setPin("");
    router.push("/dashboard");
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(15, 23, 42, 0.82)",
      }}
    >
      <AnimatePresence mode="wait">
        {phase === "pin" && timer.isLocked && (
          <motion.div
            key="pin-phase"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: "center", padding: 32, maxWidth: 360 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{ fontSize: 64, marginBottom: 16 }}
            >
              ⏰
            </motion.div>
            <h1 style={{
              fontFamily: "Fredoka, sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              marginBottom: 8,
            }}>
              Time&apos;s Up!
            </h1>
            <p style={{
              color: "rgba(186, 230, 253, 0.9)",
              fontSize: 15,
              marginBottom: 32,
              fontFamily: "Nunito, sans-serif",
              lineHeight: 1.5,
            }}>
              Ask a grown-up to type the secret code
            </p>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginBottom: 20,
            }}
              className={shake ? "animate-shake" : ""}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    backgroundColor: pin[i] ? "white" : "rgba(255,255,255,0.12)",
                    color: "#1e3a5f",
                    border: error ? "2.5px solid #ef4444" : "2.5px solid rgba(255,255,255,0.25)",
                    transition: "all 0.15s",
                    boxShadow: pin[i] ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {pin[i] ? "●" : ""}
                </div>
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: "#fca5a5", fontSize: 13, fontWeight: 700, marginBottom: 16 }}
              >
                Wrong PIN — try again
              </motion.p>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              maxWidth: 220,
              margin: "0 auto",
            }}>
              {["1","2","3","4","5","6","7","8","9","","0","←"].map((key) =>
                key === "" ? <div key="empty" /> :
                <button
                  key={key}
                  type="button"
                  onClick={() => key === "←" ? handleBackspace() : handleDigit(key)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    border: "none",
                    fontSize: key === "←" ? 20 : 22,
                    fontWeight: 800,
                    color: "white",
                    background: key === "←"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = key === "←" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)"; }}
                >
                  {key}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {(phase === "decision" || timer.awaitingDecision) && !timer.isLocked && (
          <motion.div
            key="decision-phase"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: "center", padding: 32, maxWidth: 420 }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>
              👨‍👩‍👧‍👦
            </div>
            <h1 style={{
              fontFamily: "Fredoka, sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: "white",
              marginBottom: 8,
            }}>
              Play time ended!
            </h1>
            <p style={{
              color: "rgba(186, 230, 253, 0.85)",
              fontSize: 15,
              marginBottom: 28,
              fontFamily: "Nunito, sans-serif",
              lineHeight: 1.5,
            }}>
              Would you like to give more time or end the session?
            </p>

            <div style={{ marginBottom: 24 }}>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                Extend play time
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                maxWidth: 380,
                margin: "0 auto",
              }}>
                {TIME_PRESETS.map((p) => (
                  <motion.button
                    key={p.minutes}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExtend(p.minutes)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      padding: "14px 8px",
                      borderRadius: 18,
                      border: "2.5px solid rgba(134, 239, 172, 0.4)",
                      background: "rgba(34, 197, 94, 0.12)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(134, 239, 172, 0.7)";
                      e.currentTarget.style.background = "rgba(34, 197, 94, 0.22)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(134, 239, 172, 0.4)";
                      e.currentTarget.style.background = "rgba(34, 197, 94, 0.12)";
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{p.emoji}</span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#86efac",
                      fontFamily: "Fredoka, sans-serif",
                    }}>
                      {p.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{
              width: "100%",
              height: 1,
              background: "rgba(255,255,255,0.1)",
              margin: "20px 0",
            }} />

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStop}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "14px 24px",
                borderRadius: 18,
                border: "2.5px solid rgba(252, 165, 165, 0.4)",
                background: "rgba(239, 68, 68, 0.12)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(252, 165, 165, 0.7)";
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(252, 165, 165, 0.4)";
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
              }}
            >
              <span style={{ fontSize: 20 }}>🛑</span>
              <span style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#fca5a5",
                fontFamily: "Fredoka, sans-serif",
              }}>
                End session &amp; go to dashboard
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
