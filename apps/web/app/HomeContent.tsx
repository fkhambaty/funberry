"use client";

import { brand, pricing } from "@funberry/config";
import { motion, useReducedMotion } from "framer-motion";
import { FunBerryLogo } from "./components/FunBerryLogo";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

const zones = [
  { emoji: "🌱", name: "Plants", hint: "Nature & growth", tone: "from-emerald-50 to-teal-50 border-emerald-100/80" },
  { emoji: "🐾", name: "Animals", hint: "Creatures big & small", tone: "from-amber-50 to-orange-50 border-amber-100/80" },
  { emoji: "🚗", name: "Transport", hint: "How we move", tone: "from-sky-50 to-blue-50 border-sky-100/80" },
  { emoji: "💧", name: "Water", hint: "Sources & care", tone: "from-cyan-50 to-sky-50 border-cyan-100/80" },
  { emoji: "🍎", name: "Food", hint: "Healthy choices", tone: "from-rose-50 to-red-50 border-rose-100/80" },
  { emoji: "🏠", name: "Shelter", hint: "Homes & safety", tone: "from-violet-50 to-purple-50 border-violet-100/80" },
  { emoji: "⭐", name: "Space", hint: "Sky & beyond", tone: "from-indigo-50 to-violet-50 border-indigo-100/80" },
  { emoji: "🕐", name: "Time", hint: "Days & routines", tone: "from-slate-50 to-zinc-100 border-slate-200/80" },
  { emoji: "👋", name: "About Me", hint: "Self & feelings", tone: "from-fuchsia-50 to-pink-50 border-fuchsia-100/80" },
  { emoji: "🌍", name: "& more", hint: "ICSE-aligned themes", tone: "from-green-50 to-emerald-50 border-green-100/80" },
];

const games = [
  { icon: "🎯", title: "Drag & Sort", desc: "Sort into the right groups", accent: "bg-emerald-500" },
  { icon: "🃏", title: "Memory Match", desc: "Find pairs that belong together", accent: "bg-pink-500" },
  { icon: "❓", title: "Picture Quiz", desc: "Choose from friendly visuals", accent: "bg-sky-500" },
  { icon: "📋", title: "Sequence", desc: "Put steps in order", accent: "bg-amber-500" },
  { icon: "🔍", title: "Spot Difference", desc: "Notice what changed", accent: "bg-violet-500" },
  { icon: "🎨", title: "Color Activity", desc: "Creative, guided coloring", accent: "bg-orange-500" },
  { icon: "🔗", title: "Word–picture", desc: "Link words to images", accent: "bg-lime-600" },
  { icon: "📖", title: "Story Time", desc: "Stories with light choices", accent: "bg-rose-500" },
];

export default function HomeContent() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-fuchsia-50/40 to-cyan-50 text-slate-800 antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        Skip to content
      </a>

      {/* Nav — calm glass, no toy chrome */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <a href="/" className="flex items-center gap-2 rounded-lg outline-none ring-sky-400/40 focus-visible:ring-2">
            <FunBerryLogo size="sm" variant="editorial" />
          </a>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
            <a
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-4"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              Get started
            </a>
          </nav>
        </div>
      </header>

      {/* Hero — airy mesh, editorial type, restrained motion */}
      <section
        id="main"
        className="relative flex min-h-[88dvh] flex-col justify-center px-4 pb-14 pt-[5.2rem] sm:px-6 sm:pb-20 sm:pt-20"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-[20%] top-0 h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.07),transparent_68%)]" />
          <div className="absolute -right-[10%] top-[20%] h-[65vh] w-[65vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.09),transparent_65%)]" />
          <div className="absolute bottom-0 left-1/2 h-[45vh] w-[95vw] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.06),transparent_70%)]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:text-xs"
          >
            ICSE-aligned · Ages 4–8 · Learn through play
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 flex justify-center"
          >
            <div className="rounded-[32px] border border-white/70 bg-white/35 px-3 py-2 shadow-[0_30px_80px_rgba(30,41,59,0.14)] backdrop-blur-xl sm:px-5 sm:py-3">
              <FunBerryLogo size="hero" variant="editorial" animate={!reduceMotion} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mx-auto max-w-3xl text-[2rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] md:text-6xl"
          >
            Curiosity-led games.
            <span className="mt-1 block bg-gradient-to-r from-rose-600 via-violet-600 to-sky-600 bg-clip-text text-transparent sm:mt-2">
              Real learning underneath.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-body mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            {brand.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-500/25 transition hover:from-rose-500 hover:to-rose-600 hover:shadow-rose-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              Start free
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200/90 bg-white/90 px-8 py-3.5 text-base font-bold text-slate-800 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              Parent login
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8 text-xs text-slate-500"
          >
            No credit card for the free plan · Upgrade when you&apos;re ready
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block"
          aria-hidden
        >
          <div className="h-8 w-px bg-gradient-to-b from-slate-300 to-transparent" />
        </motion.div>
      </section>

      {/* Zones — bento-style, readable hierarchy */}
      <section id="zones" className="border-t border-slate-200/70 bg-gradient-to-b from-white to-sky-50/50 px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Worlds built around how kids think
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Ten themed zones inspired by the Class 2 syllabus — each one a small adventure, not a worksheet.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 p-8 sm:p-10"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <span className="text-4xl sm:text-5xl" aria-hidden>
                  📚
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  One journey, many skills
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  EVS strands, language hooks, and logic — woven into short game rounds so progress feels like play, not pressure.
                </p>
              </div>
              <a
                href="/signup"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 lg:self-center"
              >
                Open the app
                <span aria-hidden>→</span>
              </a>
            </div>
          </motion.div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {zones.map((zone, i) => (
              <motion.div
                key={zone.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                className={`rounded-2xl border bg-gradient-to-br p-5 transition-shadow hover:shadow-md sm:p-6 ${zone.tone}`}
              >
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {zone.emoji}
                </span>
                <h3 className="mt-3 font-display text-sm font-bold text-slate-900 sm:text-base">{zone.name}</h3>
                <p className="mt-0.5 text-xs leading-snug text-slate-600 sm:text-sm">{zone.hint}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game types — calm cards, accent bar */}
      <section className="border-t border-slate-200/70 bg-gradient-to-b from-fuchsia-50/50 via-white to-cyan-50/60 px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Eight ways to play
            </h2>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Different game brains keep things fresh — and build different strengths.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game, i) => (
              <motion.article
                key={game.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm"
              >
                <div className={`absolute left-0 top-0 h-full w-1 ${game.accent}`} aria-hidden />
                <span className="text-3xl" aria-hidden>
                  {game.icon}
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-slate-900">{game.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{game.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — INR-forward, separate weekly and monthly cards */}
      <section className="border-t border-slate-200/70 bg-gradient-to-b from-white to-rose-50/50 px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pick the plan that fits your family
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Start free, then choose weekly or monthly premium. These are separate plans.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <motion.div {...fadeUp} className="rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{pricing.free.name}</p>
              <p className="mt-2 font-display text-4xl font-bold text-slate-900">₹0</p>
              <p className="mt-1 text-sm text-slate-600">Forever — try the magic first.</p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
                {pricing.free.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span>{f}</li>
                ))}
              </ul>
              <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50">Create free account</a>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }} className="relative rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 p-7 shadow-lg shadow-fuchsia-500/10">
              <span className="absolute right-5 top-5 rounded-full bg-fuchsia-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Weekly</span>
              <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-700">Premium Weekly</p>
              <p className="mt-2 font-display text-4xl font-bold text-slate-900">₹{pricing.premiumWeeklyInr.priceInr}<span className="text-base font-semibold text-slate-600">/week</span></p>
              <p className="mt-1 text-sm text-slate-600">Flexible plan · auto-renews weekly</p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-800">
                {pricing.premiumWeeklyInr.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-fuchsia-600" aria-hidden>✓</span>{f}</li>
                ))}
                <li className="flex gap-2"><span className="text-fuchsia-600" aria-hidden>✓</span>Up to 4 child profiles · Parent timer</li>
              </ul>
              <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-fuchsia-600 py-3.5 text-sm font-bold text-white transition hover:bg-fuchsia-500">Start weekly plan</a>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }} className="relative rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-7 shadow-lg shadow-sky-500/10">
              <span className="absolute right-5 top-5 rounded-full bg-sky-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Most popular</span>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Premium Monthly</p>
              <p className="mt-2 font-display text-4xl font-bold text-slate-900">₹{pricing.premiumMonthlyInr.priceInr}<span className="text-base font-semibold text-slate-600">/month</span></p>
              <p className="mt-1 text-sm text-slate-600">Best steady value · auto-renews monthly</p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-800">
                {pricing.premiumMonthlyInr.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-sky-600" aria-hidden>✓</span>{f}</li>
                ))}
                <li className="flex gap-2"><span className="text-sky-600" aria-hidden>✓</span>Up to 4 child profiles · Parent timer</li>
              </ul>
              <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sky-600 py-3.5 text-sm font-bold text-white transition hover:bg-sky-500">Start monthly plan</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer — quiet, confident */}
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-12 text-slate-400 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-center sm:text-left">
              <FunBerryLogo size="lg" variant="editorial" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">{brand.tagline}</p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:items-end">
              <div className="flex gap-8 text-sm font-semibold">
                <a href="/privacy" className="text-slate-400 transition hover:text-white">
                  Privacy
                </a>
                <a href="/terms" className="text-slate-400 transition hover:text-white">
                  Terms
                </a>
                <a href="/pricing" className="text-slate-400 transition hover:text-white">
                  Pricing
                </a>
              </div>
              <p className="text-center text-xs text-slate-600 sm:text-right">
                © {new Date().getFullYear()} {brand.name}. Crafted for little learners and the grown-ups who cheer them on.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
