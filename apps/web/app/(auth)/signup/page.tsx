"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FunBerryLogo } from "../../components/FunBerryLogo";
import { signUp, resendSignupConfirmation } from "@funberry/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendOk, setResendOk] = useState(false);

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
      const origin =
        typeof window !== "undefined" ? window.location.origin.replace(/\/$/, "") : "";
      await signUp(email, password, name, pin, {
        ...(origin ? { emailRedirectTo: `${origin}/auth/confirm-email` } : {}),
      });
      setEmailSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100/90 via-white to-emerald-50/40 p-6">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-md text-center"
          >
            <div className="glass-card rounded-kid p-10">
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
                  <p className="text-gray-600 text-sm">
                    After you confirm, you&apos;ll go to the sign-in page to log in with your email and password.
                  </p>
                </div>
              </div>
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="kid-glass-btn kid-glass-sky inline-block rounded-kid px-8 py-4 text-lg"
              >
                Already confirmed? Sign In →
              </motion.a>
              <div className="mt-5 space-y-3">
                <motion.button
                  type="button"
                  disabled={resendBusy}
                  whileHover={!resendBusy ? { scale: 1.02 } : {}}
                  whileTap={!resendBusy ? { scale: 0.98 } : {}}
                  onClick={async () => {
                    setResendOk(false);
                    setError("");
                    setResendBusy(true);
                    try {
                      const origin =
                        typeof window !== "undefined"
                          ? window.location.origin.replace(/\/$/, "")
                          : "";
                      await resendSignupConfirmation(
                        email,
                        origin ? `${origin}/auth/confirm-email` : undefined
                      );
                      setResendOk(true);
                    } catch (err: unknown) {
                      setError(err instanceof Error ? err.message : "Could not resend email");
                    } finally {
                      setResendBusy(false);
                    }
                  }}
                  className="w-full rounded-kid border-2 border-sky-200 bg-white py-3 text-sm font-bold text-sky-800 shadow-sm disabled:opacity-50"
                >
                  {resendBusy ? "Sending…" : "Resend confirmation email"}
                </motion.button>
                {resendOk && (
                  <p className="text-center text-xs font-semibold text-emerald-600">
                    Another message is on its way — check spam and wait a minute.
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed text-left">
                <strong className="text-gray-500">Confirmation emails are sent by Supabase Auth via SMTP</strong>{" "}
                (not the Resend REST API — your Resend &quot;Metrics&quot; chart can stay at zero even when SMTP works).
                In Supabase: <strong>Authentication → Emails → SMTP</strong> using{" "}
                <a
                  href="https://resend.com/docs/send-with-supabase-smtp"
                  className="text-sky-600 font-semibold underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Resend SMTP
                </a>{" "}
                (<code className="text-gray-600">smtp.resend.com</code>, port <code className="text-gray-600">465</code>
                , user <code className="text-gray-600">resend</code>, password = API key).{" "}
                <strong>You cannot verify a Vercel URL</strong> like{" "}
                <code className="text-gray-600">funberry-web.vercel.app</code> as a sending domain — use{" "}
                <code className="text-gray-600">onboarding@resend.dev</code> as the SMTP sender until you add a real
                domain in Resend. Add your app URLs under <strong>Authentication → URL configuration</strong>{" "}
                (redirect allow list), including <code className="text-gray-600 break-all">https://funberry-web.vercel.app/**</code>
                .
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    );
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
