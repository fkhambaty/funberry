"use client";

import { brand } from "@funberry/config";

export default function PrivacyPage() {
  return (
    <main className="fb-legal">
      <article>
        <h1 className="font-display text-sky-900">Privacy Policy</h1>
        <p className="fb-updated">
          Last updated: 13 October 2026
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
            <strong>Parent PIN.</strong> The way back to the parent dashboard, the
            play timer, and settings ask for the parent&apos;s 4-digit PIN. The PIN is
            checked on the account server. Parent screens do not receive the PIN back.
          </li>
        </ul>

        <h2>What We Collect</h2>
        <ul>
          <li>
            <strong>Parent account:</strong> Email, name (for account management)
          </li>
          <li>
            <strong>Child profiles:</strong> First name, age, an avatar, and an
            optional photo the parent chooses. We do not ask the child for an
            email address.
          </li>
          <li>
            <strong>Game data:</strong> Scores, stars earned, time spent,
            completion status
          </li>
          <li>
            <strong>Subscription data:</strong> Plan type and billing dates.
            Website payments are handled by Razorpay under the merchant name FKTech.
            We do not store card numbers.
          </li>
          <li>
            <strong>Product counts.</strong> We store that a verified signup, child
            profile, first game, finished game, checkout start, or active subscription
            happened. Those rows do not include a child&apos;s name or a page of textbook
            text.
          </li>
        </ul>

        <h2>What We Do NOT Collect</h2>
        <ul>
          <li>Location data</li>
          <li>Video or audio recordings. A child photo is stored only when a parent adds one.</li>
          <li>Contact lists or social media information</li>
          <li>Device identifiers for advertising purposes</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          Data is encrypted in transit (TLS). A signed-in parent can open only
          their own children&apos;s profiles.
        </p>

        <h2>Data Deletion</h2>
        <p>
          A signed-in parent can download their account as JSON from Account Settings,
          or delete it there by entering their password and the phrase DELETE MY
          ACCOUNT. Deletion removes the parent, children, play history, and learning-pack
          text stored for that account. It does not refund a charge. If auto-renew is
          still on, turn it off first. You can also email{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about our privacy practices, please contact us at{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.
        </p>
      </article>
    </main>
  );
}
