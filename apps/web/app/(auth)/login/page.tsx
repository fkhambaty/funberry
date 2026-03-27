"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { brand } from "@funberry/config";
import { signIn } from "@funberry/supabase";

export default function LoginPage() {
  const router = useRouter();
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
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-sky-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="FunBerry Kids" width={160} height={96} className="mx-auto" />
          <h1 className="font-display text-3xl font-bold text-sky-900 mt-2">
            Welcome back to {brand.name}
          </h1>
          <p className="text-gray-500 mt-1">Sign in to manage your kids&apos; learning</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-kid p-8 shadow-lg space-y-5"
        >
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
            className="w-full py-4 rounded-kid bg-berry-500 hover:bg-berry-600 text-white font-bold text-lg shadow-lg transition disabled:opacity-50"
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
