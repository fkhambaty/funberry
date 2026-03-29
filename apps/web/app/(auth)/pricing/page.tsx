"use client";

import { brand, pricing } from "@funberry/config";
import { FunBerryLogo } from "../../components/FunBerryLogo";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-fuchsia-50/40 to-cyan-50 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <div className="flex justify-center">
            <FunBerryLogo size="xl" variant="editorial" />
          </div>
          <h1 className="font-display mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{brand.name} Pricing</h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">Weekly and monthly plans are separate. Pick what fits best.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-3xl border border-slate-200 bg-white/95 p-7 shadow-sm">
            <h3 className="font-display text-xl font-bold text-slate-900">{pricing.free.name}</h3>
            <p className="mt-2 text-4xl font-bold text-slate-900">₹0</p>
            <p className="mt-1 text-sm text-slate-600">Forever free</p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
              {pricing.free.features.map((f) => (
                <li key={f} className="flex gap-2"><span className="text-emerald-600">✓</span>{f}</li>
              ))}
            </ul>
            <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white py-3 font-bold text-slate-800 transition hover:bg-slate-50">Create free account</a>
          </section>

          <section className="relative rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 p-7 shadow-lg shadow-fuchsia-500/10">
            <span className="absolute right-5 top-5 rounded-full bg-fuchsia-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Weekly</span>
            <h3 className="font-display text-xl font-bold text-fuchsia-900">Premium Weekly</h3>
            <p className="mt-2 text-4xl font-bold text-slate-900">₹{pricing.premiumWeeklyInr.priceInr}<span className="text-base font-semibold text-slate-600">/week</span></p>
            <p className="mt-1 text-sm text-slate-600">Auto-renews weekly · cancel anytime</p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-800">
              {pricing.premiumWeeklyInr.features.map((f) => (
                <li key={f} className="flex gap-2"><span className="text-fuchsia-600">✓</span>{f}</li>
              ))}
              <li className="flex gap-2"><span className="text-fuchsia-600">✓</span>Up to 4 child profiles</li>
            </ul>
            <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-fuchsia-600 py-3 font-bold text-white transition hover:bg-fuchsia-500">Start weekly plan</a>
          </section>

          <section className="relative rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-7 shadow-lg shadow-sky-500/10">
            <span className="absolute right-5 top-5 rounded-full bg-sky-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Most popular</span>
            <h3 className="font-display text-xl font-bold text-sky-900">Premium Monthly</h3>
            <p className="mt-2 text-4xl font-bold text-slate-900">₹{pricing.premiumMonthlyInr.priceInr}<span className="text-base font-semibold text-slate-600">/month</span></p>
            <p className="mt-1 text-sm text-slate-600">Auto-renews monthly · cancel anytime</p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-800">
              {pricing.premiumMonthlyInr.features.map((f) => (
                <li key={f} className="flex gap-2"><span className="text-sky-600">✓</span>{f}</li>
              ))}
              <li className="flex gap-2"><span className="text-sky-600">✓</span>Up to 4 child profiles</li>
            </ul>
            <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sky-600 py-3 font-bold text-white transition hover:bg-sky-500">Start monthly plan</a>
          </section>
        </div>
      </div>
    </main>
  );
}
