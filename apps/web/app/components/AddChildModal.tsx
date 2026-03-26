"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addChild } from "@funberry/supabase";

interface AddChildModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const CARTOON_FACES = ["🦊", "🐼", "🐨", "🦁", "🐸", "🦄", "🐯", "🐻", "🦋", "🐙", "🦖", "🐬"];

type Tab = "selfie" | "cartoon";

export function AddChildModal({ onClose, onAdded }: AddChildModalProps) {
  const [tab, setTab] = useState<Tab>("cartoon");
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(4);
  const [selectedFace, setSelectedFace] = useState(CARTOON_FACES[0]);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 320 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError("Camera not available. Choose a cartoon face instead!");
    }
  }, []);

  const takeSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror + circular crop
    ctx.save();
    ctx.translate(200, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 200, 200);
    ctx.restore();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    setSelfieDataUrl(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelfieDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter a name!"); return; }
    setLoading(true);
    setError(null);
    try {
      // photo_url: selfie data URL or cartoon emoji — stored directly in DB
      const photoUrl = tab === "selfie" && selfieDataUrl ? selfieDataUrl : selectedFace;
      await addChild(name.trim(), age, photoUrl);
      onAdded();
      onClose();
    } catch {
      setError("Couldn't add child. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{
            background: "linear-gradient(135deg, #fdf4ff, #ffffff)",
            borderRadius: 28,
            padding: 28,
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            border: "2px solid rgba(168,85,247,0.2)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", margin: 0 }}>
                👶 Add a Child
              </h2>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "2px 0 0", fontFamily: "Nunito, sans-serif" }}>
                Set up their fun profile!
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: "#f3f4f6", cursor: "pointer", fontSize: 18, color: "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 6, fontFamily: "Nunito, sans-serif" }}>
                Child&apos;s Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emma, Noah..."
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 16,
                  border: "2px solid #e5e7eb", fontSize: 16,
                  fontFamily: "Nunito, sans-serif", fontWeight: 700,
                  outline: "none", boxSizing: "border-box",
                  background: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#a78bfa")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            {/* Age */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 8, fontFamily: "Nunito, sans-serif" }}>
                Age: {age} years old
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((a) => (
                  <motion.button
                    key={a}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAge(a)}
                    style={{
                      width: 44, height: 44, borderRadius: 14, border: "2px solid",
                      borderColor: age === a ? "#a78bfa" : "#e5e7eb",
                      background: age === a ? "linear-gradient(135deg, #a78bfa, #8b5cf6)" : "white",
                      color: age === a ? "white" : "#374151",
                      fontWeight: 900, fontSize: 15,
                      fontFamily: "Fredoka, sans-serif", cursor: "pointer",
                      boxShadow: age === a ? "0 4px 12px rgba(139,92,246,0.4)" : "none",
                    }}
                  >
                    {a}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Avatar tabs */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 8, fontFamily: "Nunito, sans-serif" }}>
                Choose a Character
              </label>

              {/* Tab switcher */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {(["cartoon", "selfie"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTab(t); stopCamera(); }}
                    style={{
                      flex: 1, padding: "10px 16px", borderRadius: 16, border: "2px solid",
                      borderColor: tab === t ? "#a78bfa" : "#e5e7eb",
                      background: tab === t ? "linear-gradient(135deg, #a78bfa, #8b5cf6)" : "white",
                      color: tab === t ? "white" : "#6b7280",
                      fontWeight: 900, fontSize: 13,
                      fontFamily: "Fredoka, sans-serif", cursor: "pointer",
                    }}
                  >
                    {t === "cartoon" ? "🦊 Cartoon Face" : "📸 Selfie"}
                  </button>
                ))}
              </div>

              {/* Cartoon face picker */}
              {tab === "cartoon" && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}
                >
                  {CARTOON_FACES.map((face) => (
                    <motion.button
                      key={face}
                      type="button"
                      whileHover={{ scale: 1.18 }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setSelectedFace(face)}
                      style={{
                        width: 58, height: 58, borderRadius: 18, border: "3px solid",
                        borderColor: selectedFace === face ? "#a78bfa" : "#e5e7eb",
                        background: selectedFace === face ? "#fdf4ff" : "white",
                        fontSize: 30, cursor: "pointer",
                        boxShadow: selectedFace === face ? "0 0 0 3px #a78bfa44" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {face}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Selfie tab */}
              {tab === "selfie" && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center" }}
                >
                  {/* Preview */}
                  {selfieDataUrl ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{
                        width: 120, height: 120, borderRadius: "50%",
                        overflow: "hidden", margin: "0 auto 10px",
                        border: "4px solid #a78bfa",
                        boxShadow: "0 4px 20px rgba(167,139,250,0.4)",
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selfieDataUrl} alt="Selfie" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelfieDataUrl(null)}
                        style={{
                          padding: "6px 16px", borderRadius: 12, border: "none",
                          background: "#fee2e2", color: "#dc2626",
                          fontSize: 13, fontWeight: 800, cursor: "pointer",
                          fontFamily: "Nunito, sans-serif",
                        }}
                      >
                        Retake
                      </button>
                    </div>
                  ) : cameraActive ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{
                        width: 200, height: 200, borderRadius: "50%",
                        overflow: "hidden", margin: "0 auto 12px",
                        border: "4px solid #a78bfa",
                        position: "relative",
                      }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                        />
                      </div>
                      <canvas ref={canvasRef} style={{ display: "none" }} />
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={takeSelfie}
                          style={{
                            padding: "12px 24px", borderRadius: 20, border: "none",
                            background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                            color: "white", fontSize: 16, fontWeight: 900,
                            fontFamily: "Fredoka, sans-serif", cursor: "pointer",
                            boxShadow: "0 4px 16px rgba(139,92,246,0.4)",
                          }}
                        >
                          📸 Snap!
                        </motion.button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          style={{
                            padding: "12px 20px", borderRadius: 20, border: "2px solid #e5e7eb",
                            background: "white", color: "#6b7280", fontSize: 14,
                            fontWeight: 700, fontFamily: "Nunito, sans-serif", cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {cameraError && (
                        <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 10, fontFamily: "Nunito, sans-serif" }}>
                          {cameraError}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startCamera}
                          style={{
                            padding: "12px 20px", borderRadius: 18, border: "none",
                            background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
                            color: "white", fontSize: 14, fontWeight: 900,
                            fontFamily: "Fredoka, sans-serif", cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                          }}
                        >
                          📷 Take Selfie
                        </motion.button>
                        <label style={{
                          padding: "12px 20px", borderRadius: 18,
                          border: "2px solid #e5e7eb", background: "white",
                          color: "#6b7280", fontSize: 14, fontWeight: 800,
                          fontFamily: "Nunito, sans-serif", cursor: "pointer",
                          display: "inline-block",
                        }}>
                          📁 Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8, fontFamily: "Nunito, sans-serif" }}>
                        Photo is stored only on this device.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 10, fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.04, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.96 } : {}}
              style={{
                width: "100%", padding: "16px", borderRadius: 20, border: "none",
                background: loading
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                color: "white", fontSize: 18, fontWeight: 900,
                fontFamily: "Fredoka, sans-serif",
                cursor: loading ? "default" : "pointer",
                boxShadow: loading ? "none" : "0 6px 20px rgba(139,92,246,0.4)",
              }}
            >
              {loading ? "Adding..." : "🎉 Add Child!"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
