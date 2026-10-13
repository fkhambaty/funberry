"use client";

import { brand } from "@funberry/config";
import { checkoutCopy } from "@funberry/brand/identity";

export default function ContactPage() {
  return (
    <main className="fb-legal">
      <article>
        <h1 className="font-display text-sky-900">Contact FunBerry Kids</h1>
        <p className="fb-updated">Support for parents and payments</p>

        <p>
          Email us at{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.
          Please write from the parent account email when asking about login,
          Premium access, cancellation, or a Razorpay charge.
        </p>

        <h2>Payment provider</h2>
        <p>
          {checkoutCopy.provides}. The secure Razorpay payment page displays
          FKTech as the merchant name and FunBerry Kids Premium as the service.
          We do not ask for card or bank details by email.
        </p>

        <p>
          <a href="/pricing">Pricing</a>
          {" · "}
          <a href="/terms">Terms</a>
          {" · "}
          <a href="/privacy">Privacy</a>
          {" · "}
          <a href="/refunds">Cancellation and refunds</a>
        </p>
      </article>
    </main>
  );
}
