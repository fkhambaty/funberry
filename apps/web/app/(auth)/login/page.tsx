"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FunBerryLogo } from "../../components/FunBerryLogo";
import { signIn } from "@funberry/supabase";
import { AuthStage, Notice, TextField } from "@funberry/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";
  const justReset = searchParams.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const pending = err as { needsVerification?: boolean; email?: string };
      if (pending?.needsVerification) {
        router.push(`/signup?verify=${encodeURIComponent(pending.email ?? email)}`);
        return;
      }
      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) {
          setError("Wrong email or password. Please try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Login failed. Please try again.");
      }
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
          <p className="fb-kicker mt-3">Parent sign in</p>
          <h1 className="font-display mt-1 text-2xl font-bold text-sky-900 sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1 font-semibold text-ink-500">Sign in to manage your kids&apos; learning</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="glass-card space-y-5 rounded-kid p-8"
        >
          {justVerified && (
            <Notice tone="ok">
              Email verified! Sign in with the email and password you chose.
            </Notice>
          )}

          {justReset && (
            <Notice tone="ok">
              Password changed. Sign in with your new password.
            </Notice>
          )}

          {error && (
            <Notice tone="bad">{error}</Notice>
          )}

          <TextField
            label="Email or username"
            name="username"
            type="text"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@email.com"
            required
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="kid-glass-btn kid-glass-berry w-full rounded-kid py-4 text-lg disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm">
            <a href="/forgot-password" className="font-bold text-sky-700 hover:underline">
              Forgot password?
            </a>
          </p>

          <p className="text-center text-sm font-semibold text-ink-500">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-bold text-sky-700 hover:underline">
              Sign up free
            </a>
          </p>
        </form>

      </div>
    </AuthStage>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthStage>
          <p className="font-display text-lg font-bold text-sky-900">Loading…</p>
        </AuthStage>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
