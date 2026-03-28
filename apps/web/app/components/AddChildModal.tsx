"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addChild, updateChild } from "@funberry/supabase";
import type { Child } from "@funberry/supabase";

interface AddChildModalProps {
  onClose: () => void;
  onAdded: () => void;
  editChild?: Child;
}

const CARTOON_FACES = ["🦊", "🐼", "🐨", "🦁", "🐸", "🦄", "🐯", "🐻", "🦋", "🐙", "🦖", "🐬", "🐵", "🦸", "🧙", "🐲", "🦅", "🐺", "🦌", "🐘"];

export function AddChildModal({ onClose, onAdded, editChild }: AddChildModalProps) {
  const isEdit = !!editChild;
  const [name, setName] = useState(editChild?.name ?? "");
  const [age, setAge] = useState<number>(editChild?.age ?? 4);
  const [selectedFace, setSelectedFace] = useState(
    editChild?.photo_url && !editChild.photo_url.startsWith("data:") && !editChild.photo_url.startsWith("http")
      ? editChild.photo_url
      : CARTOON_FACES[0]!
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter a name!"); return; }
    setLoading(true);
    setError(null);
    try {
      if (isEdit && editChild) {
        await updateChild(editChild.id, name.trim(), age, selectedFace);
      } else {
        await addChild(name.trim(), age, selectedFace);
      }
      onAdded();
      onClose();
    } catch {
      setError(isEdit ? "Couldn't update child. Please try again." : "Couldn't add child. Please try again.");
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
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 100, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="kid-glass-panel"
          style={{
            background: "linear-gradient(135deg, #fdf4ff, #ffffff)",
            borderRadius: 28, padding: 28,
            width: "100%", maxWidth: 440,
            borderColor: "rgba(168,85,247,0.35)",
            maxHeight: "90vh", overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "Fredoka, sans-serif", color: "#1c498c", margin: 0 }}>
                {isEdit ? "✏️ Edit Profile" : "👶 Add a Child"}
              </h2>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "2px 0 0", fontFamily: "Nunito, sans-serif" }}>
                {isEdit ? "Update your child's profile" : "Set up their fun profile!"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="kid-glass-btn kid-glass-muted flex h-9 w-9 items-center justify-center rounded-full border-0 p-0 text-lg"
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
                  outline: "none", boxSizing: "border-box", background: "white",
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
                    key={a} type="button"
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setAge(a)}
                    className={`kid-glass-btn h-11 w-11 rounded-xl border-2 p-0 text-[15px] ${age === a ? "kid-glass-violet" : "kid-glass-muted"}`}
                    style={{
                      borderColor: age === a ? "rgba(255,255,255,0.5)" : "#e5e7eb",
                    }}
                  >
                    {a}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Avatar picker — cartoon only */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#374151", marginBottom: 8, fontFamily: "Nunito, sans-serif" }}>
                Choose a Character 🎭
              </label>

              {/* Selected preview */}
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  style={{
                    width: 80, height: 80, borderRadius: "50%",
                    border: "4px solid #a78bfa",
                    background: "linear-gradient(135deg, #fdf4ff, #ede9fe)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 42, boxShadow: "0 4px 16px rgba(167,139,250,0.4)",
                  }}
                >
                  {selectedFace}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}
              >
                {CARTOON_FACES.map((face) => (
                  <motion.button
                    key={face} type="button"
                    whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.88 }}
                    onClick={() => setSelectedFace(face)}
                    className={`kid-glass-btn flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-[3px] p-0 text-[26px] touch-manipulation ${selectedFace === face ? "kid-glass-violet" : "kid-glass-muted"}`}
                    style={{
                      borderColor: selectedFace === face ? "rgba(255,255,255,0.55)" : "#e5e7eb",
                    }}
                  >
                    {face}
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 10, fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>
                {error}
              </p>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.04, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.96 } : {}}
              className="kid-glass-btn kid-glass-violet w-full rounded-kid py-4 text-lg disabled:opacity-60"
              style={{ cursor: loading ? "default" : "pointer" }}
            >
              {loading ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "💾 Save Changes" : "🎉 Add Child!")}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
