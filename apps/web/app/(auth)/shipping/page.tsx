"use client";

import { brand } from "@funberry/config";

export default function ShippingPage() {
  return (
    <main className="fb-legal">
      <article>
        <h1 className="font-display text-sky-900">Delivery and Shipping Policy</h1>
        <p className="fb-updated">Last updated: 13 October 2026</p>

        <p>
          {brand.name} is a digital learning service. We do not sell or ship
          physical goods, so there is no delivery fee or postal delivery.
        </p>

        <h2>Digital access</h2>
        <p>
          Free activities are available after account setup. Premium access is
          attached to the parent account after Razorpay confirms a successful
          subscription payment. If payment succeeds but Premium is not visible,
          reload the parent dashboard.
        </p>

        <p>
          If access still does not appear, email{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>{" "}
          with the parent account email and Razorpay payment id. Do not send
          card or bank details.
        </p>

        <p>
          <a href="/pricing">Pricing</a>
          {" · "}
          <a href="/refunds">Cancellation and refunds</a>
          {" · "}
          <a href="/contact">Contact us</a>
        </p>
      </article>
    </main>
  );
}
