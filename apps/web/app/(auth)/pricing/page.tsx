"use client";

import { brand, pricing } from "@funberry/config";
import { checkoutCopy } from "@funberry/brand/identity";
import { FunBerryLogo } from "../../components/FunBerryLogo";

export default function PricingPage() {
  return (
    <main className="fb-parent px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <div className="flex justify-center">
            <FunBerryLogo size="xl" variant="editorial" />
          </div>
          <h1 className="font-display mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{brand.name} Pricing</h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">Weekly and monthly plans are separate. Pick what fits best.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="fb-plan">
            <h3 className="font-display text-xl font-bold text-slate-900">{pricing.free.name}</h3>
            <p className="mt-2 text-4xl font-bold text-slate-900">₹0</p>
            <p className="mt-1 text-sm text-slate-600">Forever free</p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
              {pricing.free.features.map((f) => (
                <li key={f} className="flex gap-2"><span className="text-emerald-600">✓</span>{f}</li>
              ))}
            </ul>
            <a href="/signup" className="fb-cta fb-cta-ink mt-6 w-full">Create free account</a>
          </section>

          <section className="fb-plan fb-plan-weekly relative">
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
            <a href="/signup" className="fb-cta fb-cta-berry mt-6 w-full">Start weekly plan</a>
          </section>

          <section className="fb-plan fb-plan-monthly relative">
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
            <a href="/signup" className="fb-cta fb-cta-sky mt-6 w-full">Start monthly plan</a>
          </section>
        </div>

        <section className="mx-auto mt-10 max-w-3xl rounded-kid border border-slate-200 bg-white/90 p-5 text-sm leading-relaxed text-slate-700">
          <h2 className="font-display text-xl font-bold text-slate-900">Payment and refunds</h2>
          <p className="mt-2">
            {checkoutCopy.provides}. Checkout is Razorpay, in INR. The payment page shows the name FKTech because FunBerry shares that merchant account. Weekly is ₹{pricing.premiumWeeklyInr.priceInr} and renews each week. Monthly is ₹{pricing.premiumMonthlyInr.priceInr} and renews each month.
          </p>
          <p className="mt-2">
            If you close checkout before paying, you are not charged. Turn off auto-renew in the parent dashboard and Premium stays until the date already paid. That does not refund the current period. FunBerry does not promise an automatic refund. To ask about a charge, email {brand.supportEmail} with the payment date. A refund, if approved, goes back through Razorpay to the original payment method.
          </p>
          <p className="mt-2">
            <a href="/terms" className="font-bold text-sky-800">Read the terms</a>
          </p>
        </section>
      </div>
    </main>
  );
}
