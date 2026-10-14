"use client";

import { brand, pricing } from "@funberry/config";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { FunBerryLogo } from "./components/FunBerryLogo";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

const zones = [
  { emoji: "🌱", name: "Plants", hint: "Nature & growth", tone: "from-emerald-200/80 to-teal-200/70 border-emerald-300/80" },
  { emoji: "🐾", name: "Animals", hint: "Creatures big & small", tone: "from-amber-200/80 to-orange-200/70 border-amber-300/80" },
  { emoji: "🚗", name: "Transport", hint: "How we move", tone: "from-sky-200/80 to-blue-200/70 border-sky-300/80" },
  { emoji: "💧", name: "Water", hint: "Sources & care", tone: "from-cyan-200/80 to-sky-200/70 border-cyan-300/80" },
  { emoji: "🍎", name: "Food", hint: "Healthy choices", tone: "from-rose-200/80 to-red-200/70 border-rose-300/80" },
  { emoji: "🏠", name: "Shelter", hint: "Homes & safety", tone: "from-violet-200/80 to-purple-200/70 border-violet-300/80" },
  { emoji: "⭐", name: "Space", hint: "Sky & beyond", tone: "from-indigo-200/80 to-violet-200/70 border-indigo-300/80" },
  { emoji: "🕐", name: "Time", hint: "Days & routines", tone: "from-slate-200/90 to-zinc-200/80 border-slate-300/80" },
  { emoji: "👋", name: "About Me", hint: "Self & feelings", tone: "from-fuchsia-200/80 to-pink-200/70 border-fuchsia-300/80" },
  { emoji: "🌍", name: "& more", hint: "ICSE-aligned themes", tone: "from-green-200/80 to-emerald-200/70 border-green-300/80" },
];

const games = [
  { icon: "🎯", title: "Drag & Sort", desc: "Sort into the right groups" },
  { icon: "🃏", title: "Memory Match", desc: "Find pairs that belong together" },
  { icon: "❓", title: "Picture Quiz", desc: "Choose from friendly visuals" },
  { icon: "📋", title: "Sequence", desc: "Put steps in order" },
  { icon: "🔍", title: "Spot Difference", desc: "Notice what changed" },
  { icon: "🎨", title: "Color Activity", desc: "Creative, guided coloring" },
  { icon: "🔗", title: "Word–picture", desc: "Link words to images" },
  { icon: "📖", title: "Story Time", desc: "Stories with light choices" },
];

export default function HomeContent() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="fb-marketing antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        Skip to content
      </a>

      <header className="fb-nav">
        <div className="fb-nav-inner">
          <Link href="/" className="rounded-lg outline-none ring-sky-400/50 focus-visible:ring-2">
            <FunBerryLogo size="sm" variant="editorial" />
          </Link>
          <nav className="flex items-center gap-2" aria-label="Primary">
            <Link href="/login" className="fb-cta fb-cta-ink px-4 text-sm">Log in</Link>
            <Link href="/signup" className="fb-cta fb-cta-berry px-5 text-sm">Get started</Link>
          </nav>
        </div>
      </header>

      <section id="main" className="fb-below-nav relative flex min-h-[80dvh] flex-col justify-center px-4 pb-10 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl" />
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
          <div className="absolute bottom-8 left-1/2 h-56 w-[82vw] -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-violet-700"
          >
            ICSE-aligned · Ages 4–8 · Learn through play
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex justify-center"
          >
            <div className="fb-hero-plaque">
              <FunBerryLogo size="hero" variant="editorial" animate priority responsive className="w-[280px] sm:w-[400px] md:w-[520px]" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.05 }}
            className="font-display mx-auto max-w-4xl text-[2rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 [text-shadow:0_2px_0_#fff] sm:text-5xl md:text-6xl"
          >
            Kids think they&apos;re winning levels.
            <span className="block text-violet-700 [text-shadow:0_2px_0_rgba(255,255,255,0.95)]">
              Parents know they&apos;re winning report cards.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-700 sm:text-lg"
          >
            {brand.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a href="/signup" className="fb-cta fb-cta-berry min-w-[190px] px-8 text-base">Start free</a>
            <a href="/login" className="fb-cta fb-cta-sky min-w-[190px] px-8 text-base">Parent login</a>
          </motion.div>

          <p className="mt-5 text-xs font-semibold text-slate-600">No credit card needed for free plan</p>
        </div>
      </section>

      <section id="zones" className="fb-section bg-white/55">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl [text-shadow:0_2px_0_#fff]">A colorful world of learning zones</h2>
            <p className="mt-3 text-slate-700 sm:text-lg">Every zone feels like play first, learning second - exactly how kids stay curious.</p>
          </motion.div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {zones.map((zone, i) => (
              <motion.article
                key={zone.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.38 }}
                whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
                className={`fb-zone-tile border bg-gradient-to-br p-4 transition ${zone.tone}`}
              >
                <div className="text-3xl">{zone.emoji}</div>
                <h3 className="mt-2 font-display text-sm font-extrabold text-slate-900 sm:text-base">{zone.name}</h3>
                <p className="text-xs font-medium text-slate-700 sm:text-sm">{zone.hint}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="fb-section bg-fuchsia-50/40">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl [text-shadow:0_2px_0_#fff]">Eight game types, zero boredom</h2>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game, i) => (
              <motion.article
                key={game.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.35 }}
                whileHover={reduceMotion ? undefined : { y: -5 }}
                className="fb-game-tile"
              >
                <div className="text-3xl">{game.icon}</div>
                <h3 className="mt-2 font-display text-base font-extrabold text-slate-900">{game.title}</h3>
                <p className="mt-1 text-sm font-medium text-slate-700">{game.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="fb-section bg-white/70">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl [text-shadow:0_2px_0_#fff]">Choose your plan</h2>
            <p className="mx-auto mt-2 max-w-2xl font-medium text-slate-700">Weekly and monthly are separate plans. Pick one and start instantly.</p>
          </motion.div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <motion.div {...fadeUp} className="fb-plan">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">{pricing.free.name}</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-slate-900">₹0</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Forever free</p>
              <ul className="mt-5 space-y-2.5 text-sm font-medium text-slate-700">
                {pricing.free.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-emerald-600">✓</span>{f}</li>
                ))}
              </ul>
              <a href="/signup" className="fb-cta fb-cta-ink mt-6 w-full">Create free account</a>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="fb-plan fb-plan-weekly">
              <p className="text-xs font-black uppercase tracking-wider text-fuchsia-700">Premium Weekly</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-slate-900">₹{pricing.premiumWeeklyInr.priceInr}<span className="text-base font-bold text-slate-600">/week</span></p>
              <p className="mt-1 text-sm font-medium text-slate-700">Auto-renews weekly</p>
              <ul className="mt-5 space-y-2.5 text-sm font-medium text-slate-800">
                {pricing.premiumWeeklyInr.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-fuchsia-600">✓</span>{f}</li>
                ))}
                <li className="flex gap-2"><span className="text-fuchsia-600">✓</span>Up to 4 child profiles · Parent timer</li>
              </ul>
              <a href="/signup" className="fb-cta fb-cta-berry mt-6 w-full">Start weekly plan</a>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="fb-plan fb-plan-monthly">
              <p className="text-xs font-black uppercase tracking-wider text-sky-700">Premium Monthly</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-slate-900">₹{pricing.premiumMonthlyInr.priceInr}<span className="text-base font-bold text-slate-600">/month</span></p>
              <p className="mt-1 text-sm font-medium text-slate-700">Auto-renews monthly</p>
              <ul className="mt-5 space-y-2.5 text-sm font-medium text-slate-800">
                {pricing.premiumMonthlyInr.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-sky-600">✓</span>{f}</li>
                ))}
                <li className="flex gap-2"><span className="text-sky-600">✓</span>Up to 4 child profiles · Parent timer</li>
              </ul>
              <a href="/signup" className="fb-cta fb-cta-sky mt-6 w-full">Start monthly plan</a>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="fb-footer">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-center sm:text-left">
              <FunBerryLogo size="lg" variant="editorial" />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">{brand.tagline}</p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-end">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold sm:justify-end">
                <a href="/privacy" className="fb-cta-ghost">Privacy</a>
                <a href="/terms" className="fb-cta-ghost">Terms</a>
                <a href="/pricing" className="fb-cta-ghost">Pricing</a>
                <a href="/refunds" className="fb-cta-ghost">Refunds</a>
                <a href="/shipping" className="fb-cta-ghost">Delivery</a>
                <a href="/contact" className="fb-cta-ghost">Contact</a>
              </div>
              <p className="text-center text-xs text-slate-600 sm:text-right">© {new Date().getFullYear()} {brand.name}. Crafted for little learners and proud parents.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
