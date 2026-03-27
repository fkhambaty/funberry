"use client";

import Image from "next/image";
import { brand } from "@funberry/config";
import { pricing } from "@funberry/config/src/pricing";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Image src="/logo.png" alt="FunBerry Kids" width={120} height={72} className="mx-auto" />
          <h1 className="font-display text-4xl font-bold text-sky-900 mt-4">
            {brand.name} Pricing
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Start free, upgrade anytime!
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {/* Free */}
          <div className="rounded-kid border-2 border-gray-200 bg-white p-8">
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
              className="mt-6 block w-full text-center rounded-kid bg-gray-100 py-3 font-bold text-gray-700 hover:bg-gray-200 transition"
            >
              Get Started
            </a>
          </div>

          {/* Monthly */}
          <div className="rounded-kid border-2 border-berry-300 bg-berry-50 p-8 relative">
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
            <button className="mt-6 block w-full text-center rounded-kid bg-berry-500 py-3 font-bold text-white hover:bg-berry-600 transition">
              Subscribe Monthly
            </button>
          </div>

          {/* Yearly */}
          <div className="rounded-kid border-2 border-leaf-300 bg-leaf-50 p-8 relative">
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
            <button className="mt-6 block w-full text-center rounded-kid bg-leaf-500 py-3 font-bold text-white hover:bg-leaf-600 transition">
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
