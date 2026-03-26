"use client";

import { brand } from "@funberry/config";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl prose prose-sky">
        <h1 className="font-display text-sky-900">Privacy Policy</h1>
        <p className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2>Children&apos;s Privacy (COPPA Compliance)</h2>
        <p>
          {brand.name} is committed to protecting children&apos;s privacy. We comply
          with the Children&apos;s Online Privacy Protection Act (COPPA) and similar
          regulations worldwide.
        </p>
        <ul>
          <li>
            <strong>We do not collect personal information from children.</strong>{" "}
            All accounts are managed by parents/guardians.
          </li>
          <li>
            <strong>No behavioral advertising.</strong> Children never see
            targeted ads.
          </li>
          <li>
            <strong>Minimal data collection.</strong> We only collect game
            progress data (scores, stars, completion) to provide the learning
            experience.
          </li>
          <li>
            <strong>Parental consent required.</strong> Parents must create an
            account and add child profiles.
          </li>
          <li>
            <strong>Parental gate.</strong> All settings, purchases, and external
            links are protected by a parental gate (math problem).
          </li>
        </ul>

        <h2>What We Collect</h2>
        <ul>
          <li>
            <strong>Parent account:</strong> Email, name (for account management)
          </li>
          <li>
            <strong>Child profiles:</strong> First name, age, avatar selection
            (no last names, no photos)
          </li>
          <li>
            <strong>Game data:</strong> Scores, stars earned, time spent,
            completion status
          </li>
          <li>
            <strong>Subscription data:</strong> Plan type, billing dates (payment
            details handled by Stripe/App Store/Play Store)
          </li>
        </ul>

        <h2>What We Do NOT Collect</h2>
        <ul>
          <li>Location data</li>
          <li>Photos, videos, or audio recordings</li>
          <li>Contact lists or social media information</li>
          <li>Device identifiers for advertising purposes</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          All data is encrypted in transit (TLS) and at rest. We use Supabase
          with Row-Level Security to ensure parents can only access their own
          family&apos;s data.
        </p>

        <h2>Data Deletion</h2>
        <p>
          Parents can delete their account and all associated child data at any
          time from the Settings page. All data is permanently removed within 30
          days.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about our privacy practices, please contact us at{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.
        </p>
      </div>
    </main>
  );
}
