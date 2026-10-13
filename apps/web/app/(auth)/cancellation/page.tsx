"use client";

import { brand } from "@funberry/config";

export default function CancellationPage() {
  return (
    <main className="fb-legal">
      <article>
        <h1 className="font-display text-sky-900">Subscription Cancellation</h1>
        <p className="fb-updated">Last updated: 13 October 2026</p>

        <p>
          Premium renews weekly or monthly until the parent turns auto-renew
          off. Cancellation stops the next renewal; it does not remove access
          for the period already paid.
        </p>

        <h2>How to cancel</h2>
        <ol>
          <li>Sign in to the parent dashboard.</li>
          <li>Open the subscription controls.</li>
          <li>Choose the option to turn off auto-renew.</li>
        </ol>

        <p>
          If the dashboard control fails, email{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>{" "}
          from the parent account email. Include the Razorpay subscription id
          if it is shown. Do not send card or bank details.
        </p>

        <p>
          <a href="/refunds">Read the refund policy</a>
          {" · "}
          <a href="/pricing">Pricing</a>
          {" · "}
          <a href="/contact">Contact us</a>
        </p>
      </article>
    </main>
  );
}
