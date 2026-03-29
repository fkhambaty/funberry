"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FunBerryLogo } from "../../components/FunBerryLogo";
import { signIn } from "@funberry/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100/90 via-white to-fuchsia-50/40 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex justify-center drop-shadow-[0_8px_24px_rgba(255,45,106,0.25)]">
            <FunBerryLogo size="xl" />
          </div>
          <h1 className="font-display mt-2 text-2xl font-bold text-sky-900 sm:text-3xl">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-1">Sign in to manage your kids&apos; learning</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="glass-card space-y-5 rounded-kid p-8"
        >
          {justVerified && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm">
              Email verified! Sign in with the email and password you chose.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Email
            </label>
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
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-sky-400 outline-none transition text-lg"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="kid-glass-btn kid-glass-berry w-full rounded-kid py-4 text-lg disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-sky-600 font-bold hover:underline">
              Sign up free
            </a>
          </p>
        </form>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100/90 via-white to-fuchsia-50/40 p-6">
          <p className="text-gray-500">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
