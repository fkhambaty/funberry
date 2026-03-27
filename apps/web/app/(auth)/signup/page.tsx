"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { brand } from "@funberry/config";
import { signUp } from "@funberry/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name, pin);
      setEmailSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-sky-50 to-white">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-md text-center"
          >
            <div className="bg-white rounded-kid p-10 shadow-lg">
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, -8, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="text-7xl mb-6"
              >
                📧
              </motion.div>
              <h2 className="font-display text-3xl font-bold text-sky-900 mb-3">
                Check your email! 🎉
              </h2>
              <p className="text-gray-600 text-lg mb-2">
                We sent a confirmation link to
              </p>
              <p className="font-bold text-sky-700 text-xl mb-6 break-all">{email}</p>
              <div className="bg-sky-50 rounded-2xl p-5 mb-6 text-left space-y-3">
                <p className="font-bold text-sky-800 text-sm">Here&apos;s what to do next:</p>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">1️⃣</span>
                  <p className="text-gray-600 text-sm">Open your email inbox (check spam too!)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">2️⃣</span>
                  <p className="text-gray-600 text-sm">Click the <strong>&ldquo;Confirm your signup&rdquo;</strong> link in the email</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">3️⃣</span>
                  <p className="text-gray-600 text-sm">You&apos;ll be taken back here and logged in automatically!</p>
                </div>
              </div>
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-4 rounded-kid text-white font-bold text-lg shadow-lg"
                style={{ background: "linear-gradient(135deg, #379df9, #2180ee)" }}
              >
                Already confirmed? Sign In →
              </motion.a>
              <p className="text-xs text-gray-400 mt-4">
                Didn&apos;t get the email? Check your spam folder, then try signing up again.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-sky-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.span
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl inline-block"
          >
            🍓
          </motion.span>
          <h1 className="font-display text-3xl font-bold text-sky-900 mt-2">
            Join {brand.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Create a free account to start your child&apos;s learning adventure
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="bg-white rounded-kid p-8 shadow-lg space-y-5"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg"
              placeholder="Parent Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg"
              placeholder="parent@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">4-Digit Parent PIN</label>
            <p className="text-xs text-gray-400 mb-2">Used to unlock the app after timer expires</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg text-center tracking-[0.5em] font-mono"
              placeholder="• • • •"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.03, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            className="w-full py-4 rounded-kid text-white font-bold text-lg shadow-lg transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            {loading ? "Creating account..." : "🎉 Create Free Account"}
          </motion.button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-sky-600 font-bold hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </main>
  );
}
