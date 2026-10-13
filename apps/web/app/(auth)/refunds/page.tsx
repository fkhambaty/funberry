"use client";

import { brand } from "@funberry/config";

export default function RefundsPage() {
  return (
    <main className="fb-legal">
      <article>
        <h1 className="font-display text-sky-900">Cancellation and Refund Policy</h1>
        <p className="fb-updated">Last updated: 13 October 2026</p>

        <h2>Before payment</h2>
        <p>
          Closing Razorpay before payment completes is not a charge. The free
          plan remains available without a payment method.
        </p>

        <h2>After payment</h2>
        <p>
          FunBerry Kids subscriptions are digital services. A completed charge
          is not refunded automatically. Cancelling auto-renew stops the next
          renewal and keeps Premium available until the end of the period
          already paid.
        </p>

        <h2>Ask about a charge</h2>
        <p>
          For a duplicate, incorrect, or unexpected charge, email{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>{" "}
          with the parent account email, payment date, and Razorpay payment id.
          Do not send card or bank details. Each request is reviewed by a
          person. If a refund is approved, it is returned through Razorpay to
          the original payment method.
        </p>

        <p>
          <a href="/cancellation">How to cancel auto-renew</a>
          {" · "}
          <a href="/pricing">Pricing</a>
          {" · "}
          <a href="/contact">Contact us</a>
        </p>
      </article>
    </main>
  );
}
