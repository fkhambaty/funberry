"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FunBerryLogo } from "../../components/FunBerryLogo";
import { signUp } from "@funberry/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100/90 via-white to-emerald-50/40 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mx-auto flex justify-center drop-shadow-[0_8px_24px_rgba(24,176,90,0.2)]"
          >
            <FunBerryLogo size="xl" />
          </motion.div>
          <h1 className="font-display mt-2 text-2xl font-bold text-sky-900 sm:text-3xl">
            Create your account
          </h1>
          <p className="text-gray-500 mt-1">
            Create a free account to start your child&apos;s learning adventure
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="glass-card space-y-5 rounded-kid p-8"
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
            className="kid-glass-btn kid-glass-leaf w-full rounded-kid py-4 text-lg transition disabled:pointer-events-none disabled:opacity-50"
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
