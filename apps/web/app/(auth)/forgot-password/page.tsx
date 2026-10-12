"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FunBerryLogo } from "../../components/FunBerryLogo";
import { requestPasswordReset, resetPasswordWithCode } from "@funberry/supabase";
import { AuthStage, Notice, TextField } from "@funberry/ui";

type Step = "email" | "code";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setStep("code");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithCode(email.trim(), code, password);
      router.push("/login?reset=1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not change the password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthStage>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex justify-center drop-shadow-[0_8px_24px_rgba(255,45,106,0.25)]">
            <FunBerryLogo size="xl" />
          </div>
          <p className="fb-kicker mt-3">Account help</p>
          <h1 className="font-display mt-1 text-2xl font-bold text-sky-900 sm:text-3xl">Reset your password</h1>
          <p className="mt-1 font-semibold text-ink-500">
            {step === "email"
              ? "We will email you a 6-digit code."
              : `If ${email.trim()} has an account, a code is on its way. Check spam too.`}
          </p>
        </div>

        <form
          onSubmit={step === "email" ? handleRequest : handleReset}
          className="glass-card space-y-5 rounded-kid p-8"
        >
          {error && <Notice tone="bad">{error}</Notice>}

          {step === "email" ? (
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@email.com"
              required
            />
          ) : (
            <>
              <TextField
                label="6-digit code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center font-mono tracking-[0.5em]"
                placeholder="••••••"
                required
              />
              <TextField
                label="New password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
              <TextField
                label="Confirm new password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Same password again"
                minLength={6}
                required
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="kid-glass-btn kid-glass-berry w-full rounded-kid py-4 text-lg disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Please wait..." : step === "email" ? "Send code" : "Set new password"}
          </button>

          <p className="text-center text-sm font-semibold text-ink-500">
            <a href="/login" className="font-bold text-sky-700 hover:underline">
              Back to sign in
            </a>
          </p>
        </form>
      </div>
    </AuthStage>
  );
}
