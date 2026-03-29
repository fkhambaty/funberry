"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const flowSteps = [
  {
    title: "Enter your idea",
    desc: "Describe what you want in plain language, from a chatbot to an internal ops tool.",
    icon: "💡",
  },
  {
    title: "AI generates your app",
    desc: "Our engine instantly scaffolds UI, logic, and workflows so you start from a working build.",
    icon: "⚡",
  },
  {
    title: "Customize and share",
    desc: "Refine components, prompts, branding, and publish with one click.",
    icon: "🚀",
  },
];

const templates = [
  { title: "AI Chatbot", subtitle: "Support, sales, and onboarding bots", hue: "from-violet-500 to-indigo-500" },
  { title: "Portfolio Generator", subtitle: "Personal or agency showcase sites", hue: "from-fuchsia-500 to-rose-500" },
  { title: "Landing Page Builder", subtitle: "High-converting launch pages", hue: "from-sky-500 to-cyan-500" },
  { title: "Business Tool Generator", subtitle: "Quote tools, forms, automations", hue: "from-emerald-500 to-teal-500" },
  { title: "Internal Dashboard Tool", subtitle: "Data views and team workflows", hue: "from-amber-500 to-orange-500" },
];

const features = [
  {
    title: "Lightning Fast Generation",
    desc: "Go from idea to usable app in minutes, not weeks.",
    icon: "⚡",
  },
  {
    title: "No-Code Customization",
    desc: "Edit layouts, flows, and behavior visually with zero engineering bottlenecks.",
    icon: "🧩",
  },
  {
    title: "Export & Share Anywhere",
    desc: "Publish links, embed widgets, or export builds to your stack.",
    icon: "🌐",
  },
  {
    title: "Smart AI Suggestions",
    desc: "Get intelligent recommendations for UX, copy, and conversion.",
    icon: "🧠",
  },
];

const testimonials = [
  {
    quote: "We shipped 3 internal tools in one week. This replaced months of backlog.",
    by: "Head of Ops, Nova Commerce",
  },
  {
    quote: "Our marketers now launch landing pages without waiting on engineering.",
    by: "Growth Lead, PixelPilot",
  },
  {
    quote: "The fastest route from idea to clickable product I have used.",
    by: "Founder, Orbit Labs",
  },
];

function mockOutputForIdea(input: string): string {
  if (!input.trim()) return "Your generated app preview appears here.";
  const normalized = input.toLowerCase();
  if (normalized.includes("chat") || normalized.includes("support")) {
    return "Generated: AI Support Chatbot with intent routing, FAQ retrieval, and escalation flow.";
  }
  if (normalized.includes("portfolio")) {
    return "Generated: Portfolio site with hero, project cards, testimonials, and contact form.";
  }
  if (normalized.includes("dashboard") || normalized.includes("analytics")) {
    return "Generated: Internal dashboard with KPI tiles, filters, and role-based views.";
  }
  return `Generated: ${input.trim()} app with auth, responsive UI, and publish-ready flow.`;
}

export default function HomeContent() {
  const [idea, setIdea] = useState("Build a customer support AI chatbot for my SaaS");
  const generatedOutput = useMemo(() => mockOutputForIdea(idea), [idea]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="text-lg font-semibold tracking-tight text-white">
            ForgeFlow AI
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#templates" className="transition hover:text-white">Templates</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
          </nav>
          <a
            href="/signup"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(99,102,241,0.9)] transition hover:-translate-y-0.5 hover:bg-indigo-400"
          >
            Get Started
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 px-4 pb-16 pt-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute right-[-8%] top-[10%] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl"
            >
              Turn your ideas into interactive AI apps in minutes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="mt-4 max-w-xl text-lg text-slate-300"
            >
              No coding required. Build, customize, and launch instantly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a
                href="/signup"
                className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_rgba(99,102,241,0.95)] transition hover:-translate-y-0.5 hover:bg-indigo-400"
              >
                Start Building Free
              </a>
              <a
                href="#live-demo"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                View Demo
              </a>
            </motion.div>
            <p className="mt-5 text-sm text-slate-400">Loved by creators and builders worldwide</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/40"
          >
            <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">Generated App Preview</p>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">Live</span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-slate-900 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Input</p>
                  <p className="mt-1 text-sm text-slate-100">{idea}</p>
                </div>
                <div className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 p-3">
                  <p className="text-xs uppercase tracking-wide text-indigo-300">AI Output</p>
                  <p className="mt-1 text-sm text-slate-100">{generatedOutput}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-slate-300">Components: 12</div>
                  <div className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-slate-300">Time to generate: 19s</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {flowSteps.map((step, idx) => (
              <article
                key={step.title}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg transition hover:-translate-y-1 hover:border-indigo-400/40"
              >
                <p className="text-2xl">{step.icon}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-indigo-300">Step {idx + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Start with a template</h2>
          <p className="mt-2 text-slate-300">Choose a proven starting point and customize from there.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <article key={t.title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg transition hover:-translate-y-1 hover:border-cyan-400/40">
                <div className={`h-32 rounded-xl bg-gradient-to-br ${t.hue} p-3`}>
                  <div className="h-full rounded-lg border border-white/35 bg-white/20" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{t.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{t.subtitle}</p>
                <button className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20">
                  Use Template
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="live-demo" className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Live demo</h2>
          <p className="mt-2 text-slate-300">Type an idea and see a generated output instantly.</p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <label className="mb-2 block text-sm font-medium text-slate-200">Your idea</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="h-36 w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-sm text-white outline-none ring-indigo-500/30 transition focus:ring-2"
                placeholder="e.g. Build an onboarding planner for my SaaS"
              />
            </div>
            <div className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-5">
              <p className="text-sm font-medium text-indigo-200">Generated output</p>
              <div className="mt-3 rounded-xl border border-indigo-300/20 bg-slate-950/80 p-4 text-sm text-slate-100">
                {generatedOutput}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Built for speed and scale</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-indigo-400/40">
                <p className="text-2xl">{feature.icon}</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Pricing</h2>
          <p className="mt-2 text-slate-300">Choose the plan that matches your build volume.</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm font-semibold text-white">Free</p>
              <p className="mt-2 text-3xl font-bold text-white">$0</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Limited usage</li>
                <li>Watermark</li>
              </ul>
              <button className="mt-6 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Start Free</button>
            </article>

            <article className="rounded-2xl border border-indigo-400/40 bg-indigo-500/10 p-5 shadow-[0_14px_40px_-22px_rgba(99,102,241,1)]">
              <p className="text-sm font-semibold text-indigo-200">Pro</p>
              <p className="mt-2 text-3xl font-bold text-white">$29<span className="text-base text-slate-300">/mo</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                <li>Unlimited builds</li>
                <li>No watermark</li>
                <li>Export features</li>
              </ul>
              <button className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400">Upgrade Now</button>
            </article>

            <article className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 p-5 shadow-[0_14px_40px_-22px_rgba(34,211,238,0.95)]">
              <p className="text-sm font-semibold text-cyan-200">Premium</p>
              <p className="mt-2 text-3xl font-bold text-white">$79<span className="text-base text-slate-300">/mo</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                <li>Advanced AI</li>
                <li>Custom branding</li>
                <li>Priority processing</li>
              </ul>
              <button className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Upgrade Now</button>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Trusted by builders</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t.by} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-sm text-slate-200">"{t.quote}"</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{t.by}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-center">
              <p className="text-2xl font-bold text-white">10,000+</p>
              <p className="text-sm text-slate-300">Apps created</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-center">
              <p className="text-2xl font-bold text-white">150+</p>
              <p className="text-sm text-slate-300">Countries reached</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-center">
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-sm text-slate-300">Customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-semibold text-white">ForgeFlow AI</p>
            <p className="mt-1 text-sm text-slate-400">Build smarter products with AI.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-slate-300">
            <a href="#features" className="transition hover:text-white">Product</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="/terms" className="transition hover:text-white">Terms</a>
            <a href="/privacy" className="transition hover:text-white">Privacy</a>
            <a href="#" className="transition hover:text-white">X</a>
            <a href="#" className="transition hover:text-white">LinkedIn</a>
            <a href="#" className="transition hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
