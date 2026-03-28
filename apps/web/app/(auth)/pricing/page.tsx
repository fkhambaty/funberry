"use client";

import { brand } from "@funberry/config";
import { pricing } from "@funberry/config/src/pricing";
import { FunBerryLogo } from "../../components/FunBerryLogo";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center">
            <FunBerryLogo size="xl" />
          </div>
          <h1 className="font-display text-4xl font-bold text-sky-900 mt-4">
            {brand.name} Pricing
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Start free, upgrade anytime!
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {/* Free */}
          <div className="kid-glass-panel rounded-kid border-2 border-gray-200/80 bg-white/90 p-8">
            <h3 className="font-display text-2xl font-bold text-gray-900">
              {pricing.free.name}
            </h3>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              $0
            </p>
            <p className="text-sm text-gray-400 mt-1">Forever free</p>
            <ul className="mt-6 space-y-3 text-gray-600 text-sm">
              {pricing.free.features.map((f) => (
                <li key={f}>&#10003; {f}</li>
              ))}
            </ul>
            <a
              href="/signup"
              className="kid-glass-btn kid-glass-muted mt-6 block w-full rounded-kid py-3 text-center"
            >
              Get Started
            </a>
          </div>

          {/* Monthly */}
          <div className="kid-glass-panel relative rounded-kid border-2 border-berry-300 bg-berry-50/95 p-8">
            <span className="absolute -top-3 right-6 rounded-full bg-berry-500 px-4 py-1 text-xs font-bold text-white">
              POPULAR
            </span>
            <h3 className="font-display text-2xl font-bold text-berry-900">
              {pricing.premiumMonthly.name}
            </h3>
            <p className="mt-2 text-4xl font-bold text-berry-900">
              ${pricing.premiumMonthly.price}
              <span className="text-base font-normal text-berry-600">/mo</span>
            </p>
            <p className="text-sm text-berry-400 mt-1">Cancel anytime</p>
            <ul className="mt-6 space-y-3 text-berry-800 text-sm">
              {pricing.premiumMonthly.features.map((f) => (
                <li key={f}>&#10003; {f}</li>
              ))}
            </ul>
            <button type="button" className="kid-glass-btn kid-glass-berry mt-6 block w-full rounded-kid py-3 text-center">
              Subscribe Monthly
            </button>
          </div>

          {/* Yearly */}
          <div className="kid-glass-panel relative rounded-kid border-2 border-leaf-300 bg-leaf-50/95 p-8">
            <span className="absolute -top-3 right-6 rounded-full bg-leaf-500 px-4 py-1 text-xs font-bold text-white">
              BEST VALUE
            </span>
            <h3 className="font-display text-2xl font-bold text-leaf-900">
              {pricing.premiumYearly.name}
            </h3>
            <p className="mt-2 text-4xl font-bold text-leaf-900">
              ${pricing.premiumYearly.price}
              <span className="text-base font-normal text-leaf-600">/yr</span>
            </p>
            <p className="text-sm text-leaf-400 mt-1">
              ${(pricing.premiumYearly.price / 12).toFixed(2)}/mo — save 33%
            </p>
            <ul className="mt-6 space-y-3 text-leaf-800 text-sm">
              {pricing.premiumYearly.features.map((f) => (
                <li key={f}>&#10003; {f}</li>
              ))}
            </ul>
            <button type="button" className="kid-glass-btn kid-glass-leaf mt-6 block w-full rounded-kid py-3 text-center">
              Subscribe Yearly
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Payments secured by Stripe. Cancel anytime from your dashboard.
        </p>
      </div>
    </main>
  );
}
