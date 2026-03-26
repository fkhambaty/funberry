"use client";

import { brand } from "@funberry/config";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl prose prose-sky">
        <h1 className="font-display text-sky-900">Terms of Service</h1>
        <p className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By using {brand.name}, you agree to these Terms of Service. If you are
          a parent or guardian creating an account for your child, you accept
          these terms on their behalf.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You must be at least 18 years old to create a parent account. You are
          responsible for maintaining the security of your account credentials.
        </p>

        <h2>3. Subscriptions</h2>
        <ul>
          <li>Free accounts have access to limited content.</li>
          <li>Premium subscriptions unlock all content and features.</li>
          <li>
            Subscriptions auto-renew unless cancelled 24 hours before the end of
            the billing period.
          </li>
          <li>
            Refunds follow the policies of the platform where you subscribed
            (App Store, Google Play, or Stripe).
          </li>
        </ul>

        <h2>4. Content</h2>
        <p>
          All game content, illustrations, and educational materials are owned by
          {brand.name}. You may not reproduce, distribute, or create derivative
          works without permission.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>
          {brand.name} is designed for educational purposes for children ages
          5-8. Any misuse, hacking, or unauthorized access is prohibited.
        </p>

        <h2>6. Contact</h2>
        <p>
          Questions? Reach us at{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.
        </p>
      </div>
    </main>
  );
}
